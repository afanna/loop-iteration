import "dotenv/config";
import { loadModelConfigs, loadOperatorScopeTestCases, loadProtocolSummary, resolveReportsDir, TOOLKIT_ROOT } from "../config.js";
import { callLLM } from "../llm/client.js";
import { validate } from "../core/validator.js";
import { calcD1, calcD2, calcD3, calcD4, calcD5, calcD6, calcMA, type CaseResultWithLevels } from "../core/scorer.js";
import { writeFile, mkdir, readFile } from "fs/promises";
import { resolve } from "path";
import type {
  ScopeStrategy,
  VariableScopeTestCase,
  PerCaseResult,
  StrategyEvaluation,
  VariableScopeComparisonReport,
  DimensionScores,
  ValidationRule,
} from "../core/types.js";

const STRATEGIES: ScopeStrategy[] = ["full", "subset", "ternary"];
const MAX_RETRIES = 1;
const D4_SHOT_LEVELS = [0, 1, 3] as const;
const D6_REPEATS = 3;
const D4_SAMPLE_SIZE = 10;
const D6_SAMPLE_SIZE = 8;

function getFullRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段（如"Text"、"Button"、"Column"）。',
    '3. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    '5. Text组件必须包含"content"。Button必须包含"label"。TextInput必须包含"placeholder"。',
    '6. 动态值整个用{{ }}包裹：纯动态"{{ $var }}"，混合文本"{{ \'Hello, \' + $var }}"。',
    "7. 每个{{ }}仅包含一个完整表达式，不支持在一对双引号中使用多个{{ }}表达式。",
    "8. 变量用$前缀，函数直接调用无前缀（如formatNumber($price, 2)）。",
    "9. 表达式支持以下运算符：算术（+ - * / %）、比较（== != < > <= >=）、逻辑（&& || !）、三元（? :）。",
    "10. 事件名直接作为组件属性（如onClick、onChange），值是EventHandler数组 [{id, call, args, condition?}]，按顺序执行。不要使用listeners包装层。",
    '11. theme字段使用固定字符串值（如"heading1"），不使用{{ }}。',
  ];
}

function getSubsetRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段（如"Text"、"Button"、"Column"）。',
    '3. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    '5. Text组件必须包含"content"。Button必须包含"label"。TextInput必须包含"placeholder"。',
    '6. 动态值整个用{{ }}包裹：纯动态"{{ $var }}"，混合文本"{{ \'Hello, \' + $var }}"。',
    "7. 每个{{ }}仅包含一个完整表达式，不支持在一对双引号中使用多个{{ }}表达式。",
    "8. 变量用$前缀，函数直接调用无前缀（如formatNumber($price, 2)）。",
    "9. 表达式仅支持以下运算符：比较（== != < > <= >=）、逻辑（&& || !）、三元（? :）、字符串拼接（+）。",
    "10. 禁止使用算术运算符（* / % -），算术运算必须使用内置函数：multiply(a,b)、divide(a,b)、subtract(a,b)、modulo(a,b)。",
    "11. 事件名直接作为组件属性（如onClick、onChange），值是EventHandler数组 [{id, call, args, condition?}]，按顺序执行。不要使用listeners包装层。",
    '12. theme字段使用固定字符串值（如"heading1"），不使用{{ }}。',
  ];
}

function getTernaryRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段（如"Text"、"Button"、"Column"）。',
    '3. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    '5. Text组件必须包含"content"。Button必须包含"label"。TextInput必须包含"placeholder"。',
    '6. 动态值整个用{{ }}包裹：纯动态"{{ $var }}"，混合文本"{{ \'Hello, \' + $var }}"。',
    "7. 每个{{ }}仅包含一个完整表达式，不支持在一对双引号中使用多个{{ }}表达式。",
    "8. 变量用$前缀，函数直接调用无前缀。",
    "9. 表达式仅支持三元运算符（? :），不使用&&、||、!、==、!=、<、>、<=、>=、*、/、%运算符。",
    "10. 比较运算必须使用函数：eq(a,b)、neq(a,b)、gt(a,b)、lt(a,b)、gte(a,b)、lte(a,b)。",
    "11. 逻辑运算必须使用函数：and(a,b)、or(a,b)、not(a)。",
    "12. 算术运算必须使用函数：multiply(a,b)、divide(a,b)、subtract(a,b)、add(a,b)、modulo(a,b)。",
    "13. 字符串拼接使用+运算符。",
    "14. 事件名直接作为组件属性（如onClick、onChange），值是EventHandler数组 [{id, call, args, condition?}]，按顺序执行。不要使用listeners包装层。",
    '15. theme字段使用固定字符串值（如"heading1"），不使用{{ }}。',
  ];
}

const FULL_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 简单变量：",
  '输入："生成Text显示$username"',
  "输出：",
  '{"component": "Text", "content": "{{ $username }}"}',
  "",
  "示例2 - 比较三元：",
  '输入："生成Text根据$score>=60判断及格"',
  "输出：",
  '{"component": "Text", "content": "{{ $score >= 60 ? \'及格\' : \'不及格\' }}"}',
  "",
  "示例3 - 算术运算：",
  '输入："生成Text显示$price乘以$quantity"',
  "输出：",
  '{"component": "Text", "content": "{{ $price * $quantity }}"}',
].join("\n");

const SUBSET_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 简单变量：",
  '输入："生成Text显示$username"',
  "输出：",
  '{"component": "Text", "content": "{{ $username }}"}',
  "",
  "示例2 - 比较三元（比较运算符可用）：",
  '输入："生成Text根据$score>=60判断及格"',
  "输出：",
  '{"component": "Text", "content": "{{ $score >= 60 ? \'及格\' : \'不及格\' }}"}',
  "",
  "示例3 - 算术运算（使用函数，不用*运算符）：",
  '输入："生成Text显示$price乘以$quantity"',
  "输出：",
  '{"component": "Text", "content": "{{ multiply($price, $quantity) }}"}',
].join("\n");

const TERNARY_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 简单变量：",
  '输入："生成Text显示$username"',
  "输出：",
  '{"component": "Text", "content": "{{ $username }}"}',
  "",
  "示例2 - 比较使用函数（不用>=运算符）：",
  '输入："生成Text根据$score>=60判断及格"',
  "输出：",
  '{"component": "Text", "content": "{{ gte($score, 60) ? \'及格\' : \'不及格\' }}"}',
  "",
  "示例3 - 算术使用函数（不用*运算符）：",
  '输入："生成Text显示$price乘以$quantity"',
  "输出：",
  '{"component": "Text", "content": "{{ multiply($price, $quantity) }}"}',
].join("\n");

let _inlineSummary = "";

async function loadSummaries(): Promise<void> {
  const inlinePath = resolve(TOOLKIT_ROOT, "prompts", "protocol-inline-summary.md");
  _inlineSummary = await readFile(inlinePath, "utf-8");
}

function buildSystemPrompt(strategy: ScopeStrategy): string {
  let rules: string[];
  let operatorSection = "";

  switch (strategy) {
    case "full":
      rules = getFullRules();
      operatorSection = "当前运算符范围：全量（算术 + 比较 + 逻辑 + 三元）";
      break;
    case "subset":
      rules = getSubsetRules();
      operatorSection = "当前运算符范围：精简子集（比较 + 逻辑 + 三元 + 字符串拼接）。禁止使用算术运算符，必须用函数代替。";
      break;
    case "ternary":
      rules = getTernaryRules();
      operatorSection = "当前运算符范围：仅三元（? :）。比较、逻辑、算术必须使用函数。";
      break;
    default:
      rules = getFullRules();
  }

  return [
    "你是鸿蒙智能体UI协议v2.0的DSL生成器。严格按照下面的协议规范生成JSON。",
    "",
    "# 协议规范",
    "",
    _inlineSummary,
    "",
    `# ${operatorSection}`,
    "",
    "# 重要规则",
    "",
    rules.join("\n"),
  ].join("\n");
}

function buildUserPrompt(
  testCase: VariableScopeTestCase,
  strategy: ScopeStrategy,
  shotCount: number = 3,
): string {
  let examples = "";
  if (shotCount >= 3) {
    switch (strategy) {
      case "full": examples = FULL_EXAMPLES; break;
      case "subset": examples = SUBSET_EXAMPLES; break;
      case "ternary": examples = TERNARY_EXAMPLES; break;
    }
  } else if (shotCount === 1) {
    const lines = (strategy === "full" ? FULL_EXAMPLES : strategy === "subset" ? SUBSET_EXAMPLES : TERNARY_EXAMPLES).split("\n");
    const sections: string[][] = [];
    let current: string[] = [];
    for (const line of lines) {
      if (line.startsWith("示例") && current.length > 0) {
        sections.push(current);
        current = [];
      }
      current.push(line);
    }
    if (current.length > 0) sections.push(current);
    const header = sections[0].filter((l) => !l.startsWith("示例")).join("\n");
    const firstExample = sections.slice(1, 2).map((s) => s.join("\n")).join("\n");
    examples = header + "\n" + firstExample;
  }

  const rules = resolveRules(testCase, strategy);
  const reqs = rules.map((r, i) => `${i + 1}. ${r.description}`).join("\n");

  const hints = testCase.hints?.length
    ? "\n提示：\n" + testCase.hints.map((h) => `- ${h}`).join("\n")
    : "";

  const parts: string[] = [];
  if (examples) parts.push(examples, "");
  parts.push("---");
  parts.push("任务：" + testCase.task);
  parts.push("", "要求：", reqs);
  if (hints) parts.push(hints);
  parts.push("", "请只输出一个JSON对象，不要包含任何其他内容。");

  return parts.join("\n");
}

function resolveRules(testCase: VariableScopeTestCase, strategy: ScopeStrategy): ValidationRule[] {
  if (testCase.shared_rules && testCase.strategy_rules) {
    const strategyRules = testCase.strategy_rules[strategy] || [];
    return [...testCase.shared_rules, ...strategyRules];
  }
  return testCase.validation_rules;
}

async function main() {
  console.log("=".repeat(70));
  console.log("表达式运算符范围对比 — 6维度量化评估");
  console.log("full (全量) vs subset (精简子集) vs ternary (仅三元)");
  console.log("=".repeat(70));

  let models = loadModelConfigs();

  const skipModels = (process.env.SKIP_MODELS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (skipModels.length > 0) {
    models = models.filter((m) => !skipModels.some((s) => m.name.includes(s)));
    console.log(`跳过模型: ${skipModels.join(", ")}`);
  }

  const onlyModel = process.env.ONLY_MODEL;
  if (onlyModel) {
    models = models.filter((m) => m.name === onlyModel);
    console.log(`仅运行模型: ${onlyModel}`);
  }

  if (models.length === 0) {
    console.error("\n错误: 未配置任何模型。请在.env文件中设置API Key。");
    process.exit(1);
  }
  console.log(`\n已配置 ${models.length} 个模型: ${models.map((m) => m.displayName).join(", ")}`);

  const allTestCases = await loadOperatorScopeTestCases();
  console.log(`已加载 ${allTestCases.length} 个运算符范围测试用例`);

  const edgeCases = allTestCases.filter((tc) => tc.is_edge === true);
  console.log(`  其中边界用例: ${edgeCases.length} 个`);

  await loadSummaries();

  const d4Cases = allTestCases.slice(0, D4_SAMPLE_SIZE);
  const d6Cases = allTestCases.slice(0, D6_SAMPLE_SIZE);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const reportsDir = resolveReportsDir("eval/design-points/operator-scope/reports");
  await mkdir(reportsDir, { recursive: true });

  const allEvaluations: StrategyEvaluation[] = [];

  for (const modelConfig of models) {
    for (const strategy of STRATEGIES) {
      console.log(`\n${"=".repeat(70)}`);
      console.log(`${modelConfig.displayName} | ${strategy}`);
      console.log(`${"=".repeat(70)}\n`);

      const systemPrompt = buildSystemPrompt(strategy);

      console.log("--- Phase A: 主测试 (D1/D2/D3/D5) ---\n");
      const mainResults: CaseResultWithLevels[] = [];

      for (let i = 0; i < allTestCases.length; i++) {
        const tc = allTestCases[i];
        const result = await runSingleCase(modelConfig, tc, systemPrompt, strategy, MAX_RETRIES);
        mainResults.push(result);

        const icon = result.passed ? "OK" : "XX";
        const timeStr = (result.time_ms / 1000).toFixed(1);
        console.log(`  [${i + 1}/${allTestCases.length}] ${tc.id} ${tc.name} (${tc.complexity}) ${icon} [${result.tokens}t, ${timeStr}s]`);
        if (!result.passed) {
          for (const err of result.errors) console.log(`    -> ${err}`);
        }
      }


      console.log("\n--- Phase B: 学习曲线 (D4) ---\n");
      const learningResults: Record<string, PerCaseResult[]> = {};

      const shot3Results: PerCaseResult[] = d4Cases.map((tc) => {
        const r = mainResults.find((mr) => mr.id === tc.id)!;
        return r as PerCaseResult;
      });
      learningResults["3"] = shot3Results;

      for (const shotCount of [0, 1] as const) {
        console.log(`  ${shotCount}-shot 测试...`);
        const shotResults: PerCaseResult[] = [];
        let skipped = false;

        for (const tc of d4Cases) {
          if (skipped) {
            shotResults.push(makeErrorResult(tc, "跳过（API不可用）"));
            continue;
          }
          try {
            const userPrompt = buildUserPrompt(tc, strategy, shotCount);
            const response = await callLLM(modelConfig, systemPrompt, userPrompt);
            const vResult = validate(response.content, tc, strategy);

            shotResults.push({
              id: tc.id,
              name: tc.name,
              category: tc.category,
              complexity: tc.complexity,
              passed: vResult.passed,
              tokens: response.tokens,
              time_ms: response.elapsedMs,
              retries: 0,
              errors: vResult.errors,
              raw_output: response.content,
              generated_dsl: vResult.generated,
            });
          } catch (e) {
            const msg = (e as Error).message;
            console.log(`    API错误: ${msg}`);
            shotResults.push(makeErrorResult(tc, msg));
            if (msg.includes("429") || msg.includes("余额")) {
              skipped = true;
            }
          }
        }

        learningResults[String(shotCount)] = shotResults;
        const validResults = shotResults.filter((r) => !r.errors[0]?.includes("跳过"));
        const acc = validResults.length > 0 ? validResults.filter((r) => r.passed).length / validResults.length : 0;
        console.log(`    ${shotCount}-shot 准确率: ${(acc * 100).toFixed(1)}% (${validResults.length}/${shotResults.length}有效)`);
      }

      console.log("\n--- Phase C: 一致性 (D6) ---\n");
      const consistencyResults: Record<string, PerCaseResult[][]> = {};
      let d6Skipped = false;

      for (const tc of d6Cases) {
        if (d6Skipped) {
          consistencyResults[tc.id] = [[mainResults.find((r) => r.id === tc.id) as PerCaseResult]];
          continue;
        }
        const group: PerCaseResult[][] = [];
        const firstResult = mainResults.find((r) => r.id === tc.id);
        if (firstResult) {
          group.push([firstResult as PerCaseResult]);
        }

        for (let rep = 1; rep < D6_REPEATS; rep++) {
          try {
            const userPrompt = buildUserPrompt(tc, strategy, 3);
            const response = await callLLM(modelConfig, systemPrompt, userPrompt);
            const vResult = validate(response.content, tc, strategy);

            group.push([{
              id: tc.id,
              name: tc.name,
              category: tc.category,
              complexity: tc.complexity,
              passed: vResult.passed,
              tokens: response.tokens,
              time_ms: response.elapsedMs,
              retries: 0,
              errors: vResult.errors,
              raw_output: response.content,
              generated_dsl: vResult.generated,
            }]);
          } catch (e) {
            const msg = (e as Error).message;
            console.log(`    API错误: ${msg}`);
            if (msg.includes("429") || msg.includes("余额")) {
              d6Skipped = true;
              break;
            }
          }
        }

        consistencyResults[tc.id] = group;
      }
      console.log(`  完成 ${d6Cases.length} 个用例 × ${D6_REPEATS} 次一致性测试${d6Skipped ? " (部分跳过)" : ""}`);

      console.log("\n--- Phase D: 计算评分 ---\n");

      const d1 = calcD1(mainResults);
      const d2 = calcD2(mainResults);
      const d3 = calcD3(mainResults, MAX_RETRIES);

      const shot0Acc = learningResults["0"].filter((r) => r.passed).length / learningResults["0"].length;
      const shot1Acc = learningResults["1"].filter((r) => r.passed).length / learningResults["1"].length;
      const shot3Acc = learningResults["3"].filter((r) => r.passed).length / learningResults["3"].length;
      const { score: d4, detail: lcDetail } = calcD4(shot0Acc, shot1Acc, shot3Acc);

      const d5 = calcD5(mainResults);

      const d6RepeatGroups = Object.values(consistencyResults).map((groups) => groups.flat());
      const { score: d6, detail: conDetail } = calcD6(d6RepeatGroups);

      const { score: maScore, grade: maGrade } = calcMA(d1, d2, d3, d4, d5, d6);

      const dimensions: DimensionScores = {
        d1_syntactic_accuracy: d1,
        d2_semantic_accuracy: d2,
        d3_generation_efficiency: d3,
        d4_learning_curve: d4,
        d5_edge_robustness: d5,
        d6_consistency: d6,
        ma_overall: maScore,
        ma_grade: maGrade,
        learning_curve: lcDetail,
        consistency_detail: conDetail,
      };

      console.log(`  D1 语法准确率:    ${(d1 * 100).toFixed(1)}%`);
      console.log(`  D2 语义准确率:    ${(d2 * 100).toFixed(1)}%`);
      console.log(`  D3 生成效率:      ${(d3 * 100).toFixed(1)}%`);
      console.log(`  D4 学习曲线:      ${(d4 * 100).toFixed(1)}% (0:${(shot0Acc * 100).toFixed(0)}% → 1:${(shot1Acc * 100).toFixed(0)}% → 3:${(shot3Acc * 100).toFixed(0)}%)`);
      console.log(`  D5 边界鲁棒性:    ${(d5 * 100).toFixed(1)}%`);
      console.log(`  D6 一致稳定性:    ${(d6 * 100).toFixed(1)}%`);
      console.log(`  ─────────────────────────`);
      console.log(`  MA 综合分:        ${(maScore * 100).toFixed(1)}% (${maGrade})`);

      allEvaluations.push({
        strategy,
        model_name: modelConfig.displayName,
        total_cases: allTestCases.length,
        dimensions,
        main_results: mainResults,
        learning_results: learningResults,
        consistency_results: consistencyResults,
      });
    }
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log("对比汇总");
  console.log(`${"=".repeat(70)}\n`);

  for (const model of models) {
    console.log(`\n### ${model.displayName}\n`);
    console.log("| 维度 | full | subset | ternary |");
    console.log("|------|------|--------|---------|");

    const full = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "full")!;
    const subset = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "subset")!;
    const ternary = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "ternary")!;

    const dims: [string, (d: DimensionScores) => number][] = [
      ["D1 语法", (d) => d.d1_syntactic_accuracy],
      ["D2 语义", (d) => d.d2_semantic_accuracy],
      ["D3 效率", (d) => d.d3_generation_efficiency],
      ["D4 学习", (d) => d.d4_learning_curve],
      ["D5 边界", (d) => d.d5_edge_robustness],
      ["D6 一致", (d) => d.d6_consistency],
      ["**MA**", (d) => d.ma_overall],
    ];

    for (const [label, fn] of dims) {
      const fv = fn(full.dimensions);
      const sv = fn(subset.dimensions);
      const tv = fn(ternary.dimensions);
      console.log(`| ${label} | ${(fv * 100).toFixed(1)}% | ${(sv * 100).toFixed(1)}% | ${(tv * 100).toFixed(1)}% |`);
    }

    console.log(`\n  full: ${full.dimensions.ma_grade} | subset: ${subset.dimensions.ma_grade} | ternary: ${ternary.dimensions.ma_grade}`);
  }

  const report: VariableScopeComparisonReport = {
    timestamp: new Date().toISOString(),
    protocol_version: "v2.0",
    evaluation_type: "operator-scope-6d",
    models: models.map((m) => m.displayName),
    total_cases: allTestCases.length,
    strategies: allEvaluations,
  };

  const jsonPath = resolve(reportsDir, `operator-scope-comparison-${timestamp}.json`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");

  const mdPath = resolve(reportsDir, `operator-scope-comparison-${timestamp}.md`);
  await writeFile(mdPath, buildMarkdownReport(report), "utf-8");

  console.log(`\n报告已保存:`);
  console.log(`  ${jsonPath}`);
  console.log(`  ${mdPath}`);
  console.log("\n评估完成！");
}

async function runSingleCase(
  modelConfig: import("../core/types.js").LLMModelConfig,
  testCase: VariableScopeTestCase,
  systemPrompt: string,
  strategy: ScopeStrategy,
  maxRetries: number
): Promise<CaseResultWithLevels> {
  let passed = false;
  let errors: string[] = [];
  let retryCount = 0;
  let tokens = 0;
  let timeMs = 0;
  let rawOutput = "";
  let generatedDsl: Record<string, unknown> | null = null;
  let levels = { l1_json_parsed: false, l2_structure_ok: false, l3_patterns_ok: false, l4_rules_ok: false };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const userPrompt = buildUserPrompt(testCase, strategy, 3);
      const response = await callLLM(modelConfig, systemPrompt, userPrompt);
      rawOutput = response.content;
      tokens = response.tokens;
      timeMs = response.elapsedMs;
      retryCount = attempt;

      const vResult = validate(rawOutput, testCase, strategy);
      passed = vResult.passed;
      errors = vResult.errors;
      generatedDsl = vResult.generated;
      levels = vResult.levels || levels;

      if (passed || attempt === maxRetries) break;
    } catch (e) {
      errors = [`LLM调用错误: ${(e as Error).message}`];
      retryCount = attempt;
    }
  }

  return {
    id: testCase.id,
    name: testCase.name,
    category: testCase.category,
    complexity: testCase.complexity,
    passed,
    tokens,
    time_ms: timeMs,
    retries: retryCount,
    errors,
    raw_output: rawOutput,
    generated_dsl: generatedDsl,
    levels,
  };
}

function buildMarkdownReport(report: VariableScopeComparisonReport): string {
  const lines: string[] = [];
  lines.push("# 表达式运算符范围对比 — 6维度量化评估报告");
  lines.push(`\n日期: ${report.timestamp.split("T")[0]}`);
  lines.push(`协议版本: ${report.protocol_version}`);
  lines.push(`测试用例: ${report.total_cases} 个`);
  lines.push(`模型: ${report.models.join(", ")}`);
  lines.push(`对比: full (全量) vs subset (精简子集) vs ternary (仅三元)\n`);

  for (const modelName of report.models) {
    const full = report.strategies.find((e) => e.model_name === modelName && e.strategy === "full")!;
    const subset = report.strategies.find((e) => e.model_name === modelName && e.strategy === "subset")!;
    const ternary = report.strategies.find((e) => e.model_name === modelName && e.strategy === "ternary")!;

    lines.push(`## ${modelName}\n`);

    lines.push("### 6维度评分对比\n");
    lines.push("| 维度 | 权重 | full (全量) | subset (精简) | ternary (仅三元) |");
    lines.push("|------|------|------------|---------------|------------------|");

    const entries: [string, number, number, number, number][] = [
      ["D1 语法准确率", 0.20, full.dimensions.d1_syntactic_accuracy, subset.dimensions.d1_syntactic_accuracy, ternary.dimensions.d1_syntactic_accuracy],
      ["D2 语义准确率", 0.25, full.dimensions.d2_semantic_accuracy, subset.dimensions.d2_semantic_accuracy, ternary.dimensions.d2_semantic_accuracy],
      ["D3 生成效率", 0.15, full.dimensions.d3_generation_efficiency, subset.dimensions.d3_generation_efficiency, ternary.dimensions.d3_generation_efficiency],
      ["D4 学习曲线", 0.15, full.dimensions.d4_learning_curve, subset.dimensions.d4_learning_curve, ternary.dimensions.d4_learning_curve],
      ["D5 边界鲁棒性", 0.15, full.dimensions.d5_edge_robustness, subset.dimensions.d5_edge_robustness, ternary.dimensions.d5_edge_robustness],
      ["D6 一致稳定性", 0.10, full.dimensions.d6_consistency, subset.dimensions.d6_consistency, ternary.dimensions.d6_consistency],
    ];

    for (const [label, weight, fv, sv, tv] of entries) {
      lines.push(`| ${label} | ${(weight * 100).toFixed(0)}% | ${(fv * 100).toFixed(1)}% | ${(sv * 100).toFixed(1)}% | ${(tv * 100).toFixed(1)}% |`);
    }

    lines.push(`| **MA综合** | **100%** | **${(full.dimensions.ma_overall * 100).toFixed(1)}% (${full.dimensions.ma_grade})** | **${(subset.dimensions.ma_overall * 100).toFixed(1)}% (${subset.dimensions.ma_grade})** | **${(ternary.dimensions.ma_overall * 100).toFixed(1)}% (${ternary.dimensions.ma_grade})** |`);

    if (full.dimensions.learning_curve && subset.dimensions.learning_curve && ternary.dimensions.learning_curve) {
      lines.push("\n### D4 学习曲线明细\n");
      lines.push("| shot数 | full | subset | ternary |");
      lines.push("|--------|------|--------|---------|");
      lines.push(`| 0-shot | ${(full.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% | ${(subset.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% | ${(ternary.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 1-shot | ${(full.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% | ${(subset.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% | ${(ternary.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 3-shot | ${(full.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% | ${(subset.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% | ${(ternary.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% |`);
    }

    if (full.dimensions.consistency_detail && subset.dimensions.consistency_detail && ternary.dimensions.consistency_detail) {
      lines.push("\n### D6 一致性明细\n");
      lines.push("| 指标 | full | subset | ternary |");
      lines.push("|------|------|--------|---------|");
      lines.push(`| 结构一致率 | ${(full.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% | ${(subset.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% | ${(ternary.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% |`);
      lines.push(`| 语义等价率 | ${(full.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% | ${(subset.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% | ${(ternary.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% |`);
    }

    for (const eval_ of [full, subset, ternary]) {
      const failed = eval_.main_results.filter((r) => !r.passed);
      if (failed.length > 0) {
        lines.push(`\n### ${eval_.strategy} 失败用例 (${failed.length}/${eval_.total_cases})\n`);
        for (const c of failed) {
          lines.push(`**${c.id} ${c.name}** (${c.complexity})`);
          for (const err of c.errors) lines.push(`  - ${err}`);
          lines.push("");
        }
      }
    }

    lines.push("");
  }

  lines.push("\n## 结论\n");
  lines.push("_待根据评估数据填写_\n");

  return lines.join("\n");
}

function makeErrorResult(tc: VariableScopeTestCase, errorMsg: string): PerCaseResult {
  return {
    id: tc.id,
    name: tc.name,
    category: tc.category,
    complexity: tc.complexity,
    passed: false,
    tokens: 0,
    time_ms: 0,
    retries: 0,
    errors: [errorMsg],
    raw_output: "",
    generated_dsl: null,
  };
}

main().catch((e) => {
  console.error("运行错误:", e);
  process.exit(1);
});
