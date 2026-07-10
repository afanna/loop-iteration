// DEPRECATED: Backtick template strings were removed from spec (GAP-049).
// This script tests a phantom feature and should not be used for new evaluations.
import "dotenv/config";
import { loadModelConfigs, loadTemplateInterpolationTestCases, loadProtocolSummary, resolveReportsDir, TOOLKIT_ROOT } from "../config.js";
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

const STRATEGIES: ScopeStrategy[] = ["template-text", "explicit-only"];
const MAX_RETRIES = 1;
const D4_SAMPLE_SIZE = 10;
const D6_SAMPLE_SIZE = 8;
const D6_REPEATS = 3;

// ============================================================================
// 策略专属规则
// ============================================================================

function getTemplateTextRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段（如"Text"、"Button"、"Column"）。',
    '3. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    "5. 动态值使用{{ }}表达式语法，整个属性值为一个表达式字符串。",
    "6. 变量引用必须使用$var语法（$前缀+变量名）。例如：{{ $username }}。这是唯一的变量引用形式。",
    "7. 模板字符串使用反引号包裹。模板中$var直接嵌入文本即可插值：{{ `Hello, $name!` }}。",
    "8. ${ expr }是模板字符串内的表达式求值语法，对expr求值并转为字符串拼接。expr内变量仍用$var形式。",
    "9. 复杂表达式（算术、函数调用、三元）必须放在${}内：{{ `Total: ${$price * $quantity}` }}。",
    "10. 简单$var可直接嵌入模板文本，也可用${}包裹：{{ `Hello, $name!` }} 和 {{ `Hello, ${$name}!` }} 都正确。",
    "11. 样式属性放在styles对象中，动态样式值用{{ }}表达式。",
    "12. 事件处理放在listeners对象中。",
  ];
}

function getExplicitOnlyRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段（如"Text"、"Button"、"Column"）。',
    '3. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    "5. 动态值使用{{ }}表达式语法，整个属性值为一个表达式字符串。",
    "6. 变量引用必须使用$var语法（$前缀+变量名）。例如：{{ $username }}。这是唯一的变量引用形式。",
    "7. 模板字符串使用反引号包裹。模板中所有插值必须通过${ expr }语法，expr内变量用$var形式。",
    "8. 模板文本中裸写的$var不会被插值，会被当作字面量文本。插值必须写${$var}。",
    "9. 正确示例：{{ `Hello, ${$name}!` }}，{{ `Total: ${$price * $quantity}` }}。",
    "10. 错误示例：{{ `Hello, $name!` }}（$name在模板文本中是字面量，不会插值）。",
    "11. 样式属性放在styles对象中，动态样式值用{{ }}表达式。",
    "12. 事件处理放在listeners对象中。",
  ];
}

// ============================================================================
// Few-shot 示例
// ============================================================================

const TEMPLATE_TEXT_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 模板中$var直接嵌入：",
  '输入："生成Text显示\'你好，用户名\'，用户名是$name"',
  "输出：",
  '{"component": "Text", "content": "{{ `你好，$name！` }}"}',
  "",
  "示例2 - ${}中嵌入算术表达式：",
  '输入："生成Text显示合计金额，$price*$quantity"',
  "输出：",
  '{"component": "Text", "content": "{{ `合计：${$price * $quantity} 元` }}"}',
  "",
  "示例3 - 混合$var和${}：",
  '输入："显示用户名和消息数，用户$userName，消息数$count"',
  "输出：",
  '{"component": "Text", "content": "{{ `$userName 有 ${$count} 条消息` }}"}',
].join("\n");

const EXPLICIT_ONLY_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 模板中必须用${}插值：",
  '输入："生成Text显示\'你好，用户名\'，用户名是$name"',
  "输出：",
  '{"component": "Text", "content": "{{ `你好，${$name}！` }}"}',
  "",
  "示例2 - ${}中嵌入算术表达式：",
  '输入："生成Text显示合计金额，$price*$quantity"',
  "输出：",
  '{"component": "Text", "content": "{{ `合计：${$price * $quantity} 元` }}"}',
  "",
  "示例3 - 多${}混合：",
  '输入："显示用户名和消息数，用户$userName，消息数$count"',
  "输出：",
  '{"component": "Text", "content": "{{ `${$userName} 有 ${$count} 条消息` }}"}',
].join("\n");

// ============================================================================
// Prompt 构建
// ============================================================================

let _protocolSummary = "";

async function loadSummaries(): Promise<void> {
  const summaryPath = resolve(TOOLKIT_ROOT, "prompts", "protocol-summary.md");
  _protocolSummary = await readFile(summaryPath, "utf-8");
}

function getStrategyRules(strategy: ScopeStrategy): string[] {
  switch (strategy) {
    case "template-text": return getTemplateTextRules();
    case "explicit-only": return getExplicitOnlyRules();
    default: return getTemplateTextRules();
  }
}

function getStrategyExamples(strategy: ScopeStrategy): string {
  switch (strategy) {
    case "template-text": return TEMPLATE_TEXT_EXAMPLES;
    case "explicit-only": return EXPLICIT_ONLY_EXAMPLES;
    default: return TEMPLATE_TEXT_EXAMPLES;
  }
}

function buildSystemPrompt(strategy: ScopeStrategy): string {
  const rules = getStrategyRules(strategy);

  return [
    "你是鸿蒙智能体UI协议v2.0的DSL生成器。严格按照下面的协议规范生成JSON。",
    "",
    "# 协议规范",
    "",
    _protocolSummary,
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
  const fullExamples = getStrategyExamples(strategy);
  let examples = "";
  if (shotCount >= 3) {
    examples = fullExamples;
  } else if (shotCount === 1) {
    const lines = fullExamples.split("\n");
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

// ============================================================================
// 评估主逻辑
// ============================================================================

async function main() {
  console.log("=".repeat(70));
  console.log("模板字符串求值语法亲和性评估 — 6维度量化评估");
  console.log("A: template-text ($var直接嵌入 + ${expr}) vs B: explicit-only (仅${expr})");
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

  const allTestCases = await loadTemplateInterpolationTestCases();
  console.log(`已加载 ${allTestCases.length} 个模板求值语法测试用例`);

  const edgeCases = allTestCases.filter((tc) => tc.is_edge === true);
  console.log(`  其中边界用例: ${edgeCases.length} 个`);
  console.log(`  simple: ${allTestCases.filter((tc) => tc.complexity === "simple").length} | medium: ${allTestCases.filter((tc) => tc.complexity === "medium").length} | complex: ${allTestCases.filter((tc) => tc.complexity === "complex").length}`);

  await loadSummaries();

  const d4Cases = allTestCases.slice(0, D4_SAMPLE_SIZE);
  const d6Cases = allTestCases.slice(0, D6_SAMPLE_SIZE);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const reportsDir = resolveReportsDir("eval/design-points/template-interpolation/reports");
  await mkdir(reportsDir, { recursive: true });

  const allEvaluations: StrategyEvaluation[] = [];

  for (const modelConfig of models) {
    for (const strategy of STRATEGIES) {
      console.log(`\n${"=".repeat(70)}`);
      console.log(`${modelConfig.displayName} | ${strategy}`);
      console.log(`${"=".repeat(70)}\n`);

      const systemPrompt = buildSystemPrompt(strategy);

      // Phase A: 主测试 (D1/D2/D3/D5)
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

      // Phase B: 学习曲线 (D4)
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

      // Phase C: 一致性 (D6)
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

      // Phase D: 计算6维度评分
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

  // ============================================================
  // 生成对比报告
  // ============================================================
  console.log(`\n${"=".repeat(70)}`);
  console.log("对比汇总");
  console.log(`${"=".repeat(70)}\n`);

  const strategyLabels: Record<string, string> = {
    "template-text": "A: $var直接嵌入+${expr}",
    "explicit-only": "B: 仅${expr}",
  };

  for (const model of models) {
    console.log(`\n### ${model.displayName}\n`);
    console.log("| 维度 | A: template-text | B: explicit-only | 差值 |");
    console.log("|------|-----------------|-----------------|------|");

    const stratA = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "template-text")!;
    const stratB = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "explicit-only")!;

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
      const av = fn(stratA.dimensions);
      const bv = fn(stratB.dimensions);
      const diff = bv - av;
      const diffStr = diff >= 0 ? `+${(diff * 100).toFixed(1)}%` : `${(diff * 100).toFixed(1)}%`;
      console.log(`| ${label} | ${(av * 100).toFixed(1)}% | ${(bv * 100).toFixed(1)}% | ${diffStr} |`);
    }

    console.log(`\n  A: ${stratA.dimensions.ma_grade} | B: ${stratB.dimensions.ma_grade}`);
  }

  const report: VariableScopeComparisonReport = {
    timestamp: new Date().toISOString(),
    protocol_version: "v2.0",
    evaluation_type: "template-interpolation-6d",
    models: models.map((m) => m.displayName),
    total_cases: allTestCases.length,
    strategies: allEvaluations,
  };

  const jsonPath = resolve(reportsDir, `template-interpolation-comparison-${timestamp}.json`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");

  const mdPath = resolve(reportsDir, `template-interpolation-comparison-${timestamp}.md`);
  await writeFile(mdPath, buildMarkdownReport(report, strategyLabels), "utf-8");

  console.log(`\n报告已保存:`);
  console.log(`  ${jsonPath}`);
  console.log(`  ${mdPath}`);
  console.log("\n评估完成！");
}

// ============================================================================
// 辅助函数
// ============================================================================

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

// ============================================================================
// Markdown 报告
// ============================================================================

function buildMarkdownReport(report: VariableScopeComparisonReport, strategyLabels: Record<string, string>): string {
  const lines: string[] = [];
  lines.push("# 模板字符串求值语法亲和性评估报告");
  lines.push(`\n日期: ${report.timestamp.split("T")[0]}`);
  lines.push(`协议版本: ${report.protocol_version}`);
  lines.push(`测试用例: ${report.total_cases} 个`);
  lines.push(`模型: ${report.models.join(", ")}`);
  lines.push("对比: A: $var直接嵌入+${expr} vs B: 仅${expr}\n");

  for (const modelName of report.models) {
    const stratA = report.strategies.find((e) => e.model_name === modelName && e.strategy === "template-text")!;
    const stratB = report.strategies.find((e) => e.model_name === modelName && e.strategy === "explicit-only")!;

    lines.push(`## ${modelName}\n`);

    lines.push("### 6维度评分对比\n");
    lines.push("| 维度 | 权重 | A: template-text | B: explicit-only | 差值 |");
    lines.push("|------|------|-----------------|-----------------|------|");

    const entries: [string, number, number, number][] = [
      ["D1 语法准确率", 0.20, stratA.dimensions.d1_syntactic_accuracy, stratB.dimensions.d2_semantic_accuracy ? stratB.dimensions.d1_syntactic_accuracy : 0],
      ["D2 语义准确率", 0.25, stratA.dimensions.d2_semantic_accuracy, stratB.dimensions.d2_semantic_accuracy],
      ["D3 生成效率", 0.15, stratA.dimensions.d3_generation_efficiency, stratB.dimensions.d3_generation_efficiency],
      ["D4 学习曲线", 0.15, stratA.dimensions.d4_learning_curve, stratB.dimensions.d4_learning_curve],
      ["D5 边界鲁棒性", 0.15, stratA.dimensions.d5_edge_robustness, stratB.dimensions.d5_edge_robustness],
      ["D6 一致稳定性", 0.10, stratA.dimensions.d6_consistency, stratB.dimensions.d6_consistency],
    ];

    function signStr(a: number, b: number): string {
      const diff = b - a;
      if (diff > 0) return `+${(diff * 100).toFixed(1)}%`;
      return `${(diff * 100).toFixed(1)}%`;
    }

    for (const [label, weight, av, bv] of entries) {
      const diff = bv - av;
      const diffStr = diff >= 0 ? `+${(diff * 100).toFixed(1)}%` : `${(diff * 100).toFixed(1)}%`;
      lines.push(`| ${label} | ${(weight * 100).toFixed(0)}% | ${(av * 100).toFixed(1)}% | ${(bv * 100).toFixed(1)}% | ${diffStr} |`);
    }

    lines.push(`| **MA综合** | **100%** | **${(stratA.dimensions.ma_overall * 100).toFixed(1)}% (${stratA.dimensions.ma_grade})** | **${(stratB.dimensions.ma_overall * 100).toFixed(1)}% (${stratB.dimensions.ma_grade})** | **${signStr(stratA.dimensions.ma_overall, stratB.dimensions.ma_overall)}** |`);

    // D4 learning curve
    if (stratA.dimensions.learning_curve && stratB.dimensions.learning_curve) {
      lines.push("\n### D4 学习曲线明细\n");
      lines.push("| shot数 | A: template-text | B: explicit-only |");
      lines.push("|--------|-----------------|-----------------|");
      lines.push(`| 0-shot | ${(stratA.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% | ${(stratB.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 1-shot | ${(stratA.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% | ${(stratB.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 3-shot | ${(stratA.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% | ${(stratB.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% |`);
    }

    // D6 consistency
    if (stratA.dimensions.consistency_detail && stratB.dimensions.consistency_detail) {
      lines.push("\n### D6 一致性明细\n");
      lines.push("| 指标 | A: template-text | B: explicit-only |");
      lines.push("|------|-----------------|-----------------|");
      lines.push(`| 结构一致率 | ${(stratA.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% | ${(stratB.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% |`);
      lines.push(`| 语义等价率 | ${(stratA.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% | ${(stratB.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% |`);
    }

    // Failure cases
    for (const eval_ of [stratA, stratB]) {
      const failed = eval_.main_results.filter((r) => !r.passed);
      if (failed.length > 0) {
        lines.push(`\n### ${strategyLabels[eval_.strategy]} 失败用例 (${failed.length}/${eval_.total_cases})\n`);
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

main().catch((e) => {
  console.error("运行错误:", e);
  process.exit(1);
});
