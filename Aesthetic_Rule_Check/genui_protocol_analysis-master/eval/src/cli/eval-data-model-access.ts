import "dotenv/config";
import { loadModelConfigs, loadDataModelAccessTestCases, loadProtocolSummary, resolveReportsDir, TOOLKIT_ROOT } from "../config.js";
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

const STRATEGIES: ScopeStrategy[] = ["dot-path", "json-pointer"];
const MAX_RETRIES = 1;
const D4_SAMPLE_SIZE = 10;
const D6_SAMPLE_SIZE = 8;
const D6_REPEATS = 3;

// ============================================================================
// 策略专属规则
// ============================================================================

function getDotPathRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段（如"Text"、"Button"、"Column"）。',
    '3. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    '5. Text组件必须包含"content"。Button必须包含"label"。TextInput必须包含"placeholder"。',
    "6. 动态值使用 {{ }} 内联表达式格式，例如：\"content\": \"{{ $__dataModel.user.name }}\"",
    "7. 数据模型的访问使用 $__dataModel 前缀加点号路径：$__dataModel.user.name",
    "8. 所有数据模型读取都通过 {{ $__dataModel.field.subfield }} 格式在字符串中引用。",
    "9. 字符串拼接使用 {{ }} 混合静态文字和动态值：\"content\": \"{{ '你好, ' + $__dataModel.user.name }}\"",
    "10. 事件处理直接作为组件属性（如onClick），值为action对象数组。",
    "11. setDataModel/getDataModel 的 path 参数使用 JSON Pointer 格式：\"/user/name\"（以 / 开头）。",
    '12. theme字段使用固定字符串值（如"heading1"），不使用表达式。',
    "13. 样式动态值也使用 {{ }} 格式：\"fontSize\": \"{{ $__dataModel.config.fontSize }}\"",
  ];
}

function getJsonPointerRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段（如"Text"、"Button"、"Column"）。',
    '3. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    '5. Text组件必须包含"content"。Button必须包含"label"。TextInput必须包含"placeholder"。',
    '6. 数据模型的访问使用 JSON Pointer 格式：{"path": "/user/name"}',
    '7. 所有数据模型读取都通过 path 字段引用，格式为 "/field/subfield"（以 / 开头，层级用 / 分隔）。',
    '8. 不使用 {{ }} 表达式引用数据模型，而是用 path 对象：{"path": "/user/name"}。',
    '9. setDataModel/getDataModel 的 path 参数也使用 JSON Pointer 格式："/user/name"。',
    "10. 事件处理直接作为组件属性（如onClick），值为action对象数组。",
    '11. theme字段使用固定字符串值（如"heading1"），不使用表达式。',
    "12. 字符串拼接使用+运算符。",
  ];
}

// ============================================================================
// Few-shot 示例
// ============================================================================

const DOT_PATH_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 读取数据模型字段：",
  '输入："生成Text显示数据模型中user.name"',
  "输出：",
  '{"component": "Text", "content": "{{ $__dataModel.user.name }}"}',
  "",
  "示例2 - 字符串拼接含数据模型：",
  '输入："生成Text显示\'你好, \'加上数据模型user.name"',
  "输出：",
  '{"component": "Text", "content": "{{ \'你好, \' + $__dataModel.user.name }}"}',
  "",
  "示例3 - 写入数据模型：",
  '输入："Button点击调用setDataModel更新user.name"',
  "输出：",
  '{"component": "Button", "label": "保存", "onClick": [{"action": "setDataModel", "args": {"path": "/user/name", "value": "newValue"}}]}',
].join("\n");

const JSON_POINTER_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 读取数据模型字段：",
  '输入："生成Text显示数据模型中user.name"',
  "输出：",
  '{"component": "Text", "content": {"path": "/user/name"}}',
  "",
  "示例2 - 多字段拼接含数据模型：",
  '输入："生成Text显示\'你好, \'加上数据模型user.name"',
  "输出：",
  '{"component": "Text", "content": {"path": "/user/name"}}',
  "",
  "示例3 - 写入数据模型：",
  '输入："Button点击调用setDataModel更新user.name"',
  "输出：",
  '{"component": "Button", "label": "保存", "onClick": [{"action": "setDataModel", "args": {"path": "/user/name", "value": "newValue"}}]}',
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
    case "dot-path": return getDotPathRules();
    case "json-pointer": return getJsonPointerRules();
    default: return getDotPathRules();
  }
}

function getStrategyExamples(strategy: ScopeStrategy): string {
  switch (strategy) {
    case "dot-path": return DOT_PATH_EXAMPLES;
    case "json-pointer": return JSON_POINTER_EXAMPLES;
    default: return DOT_PATH_EXAMPLES;
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
  console.log("数据模型访问语法对比 — 6维度量化评估");
  console.log("A: dot-path ({{ $__dataModel.xxx }}) vs B: json-pointer ({path: /xxx})");
  console.log("写入统一使用 updateDataModel（与 A2UI 一致）");
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

  const allTestCases = await loadDataModelAccessTestCases();
  console.log(`已加载 ${allTestCases.length} 个数据模型访问测试用例`);

  const edgeCases = allTestCases.filter((tc) => tc.is_edge === true);
  console.log(`  其中边界用例: ${edgeCases.length} 个`);

  await loadSummaries();

  const d4Cases = allTestCases.slice(0, D4_SAMPLE_SIZE);
  const d6Cases = allTestCases.slice(0, D6_SAMPLE_SIZE);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const reportsDir = resolveReportsDir("eval/design-points/data-model-access/reports");
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

  for (const model of models) {
    console.log(`\n### ${model.displayName}\n`);
    console.log("| 维度 | A: dot-path | B: json-pointer |");
    console.log("|------|-------------|-----------------|");

    const dotP = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "dot-path")!;
    const jsPtr = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "json-pointer")!;

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
      const av = fn(dotP.dimensions);
      const bv = fn(jsPtr.dimensions);
      console.log(`| ${label} | ${(av * 100).toFixed(1)}% | ${(bv * 100).toFixed(1)}% |`);
    }

    console.log(`\n  dot-path: ${dotP.dimensions.ma_grade} | json-pointer: ${jsPtr.dimensions.ma_grade}`);
  }

  const report: VariableScopeComparisonReport = {
    timestamp: new Date().toISOString(),
    protocol_version: "v2.0",
    evaluation_type: "data-model-access-6d",
    models: models.map((m) => m.displayName),
    total_cases: allTestCases.length,
    strategies: allEvaluations,
  };

  const jsonPath = resolve(reportsDir, `data-model-access-comparison-${timestamp}.json`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");

  const mdPath = resolve(reportsDir, `data-model-access-comparison-${timestamp}.md`);
  await writeFile(mdPath, buildMarkdownReport(report), "utf-8");

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

function buildMarkdownReport(report: VariableScopeComparisonReport): string {
  const lines: string[] = [];
  lines.push("# 数据模型访问语法对比 — 6维度量化评估报告");
  lines.push(`\n日期: ${report.timestamp.split("T")[0]}`);
  lines.push(`协议版本: ${report.protocol_version}`);
  lines.push(`测试用例: ${report.total_cases} 个`);
  lines.push(`模型: ${report.models.join(", ")}`);
  lines.push(`对比: A: dot-path ({{ $__dataModel.xxx }}) vs B: json-pointer ({path: /xxx})`);
  lines.push(`写入: 统一使用 updateDataModel（与 A2UI 一致）\n`);

  const strategyLabels: Record<string, string> = {
    "dot-path": "A: dot-path ({{ $__dataModel.xxx }})",
    "json-pointer": "B: json-pointer ({path: /xxx})",
  };

  for (const modelName of report.models) {
    const dotP = report.strategies.find((e) => e.model_name === modelName && e.strategy === "dot-path")!;
    const jsPtr = report.strategies.find((e) => e.model_name === modelName && e.strategy === "json-pointer")!;

    lines.push(`## ${modelName}\n`);

    lines.push("### 6维度评分对比\n");
    lines.push("| 维度 | 权重 | A: dot-path | B: json-pointer |");
    lines.push("|------|------|-------------|-----------------|");

    const entries: [string, number, number, number][] = [
      ["D1 语法准确率", 0.20, dotP.dimensions.d1_syntactic_accuracy, jsPtr.dimensions.d1_syntactic_accuracy],
      ["D2 语义准确率", 0.25, dotP.dimensions.d2_semantic_accuracy, jsPtr.dimensions.d2_semantic_accuracy],
      ["D3 生成效率", 0.15, dotP.dimensions.d3_generation_efficiency, jsPtr.dimensions.d3_generation_efficiency],
      ["D4 学习曲线", 0.15, dotP.dimensions.d4_learning_curve, jsPtr.dimensions.d4_learning_curve],
      ["D5 边界鲁棒性", 0.15, dotP.dimensions.d5_edge_robustness, jsPtr.dimensions.d5_edge_robustness],
      ["D6 一致稳定性", 0.10, dotP.dimensions.d6_consistency, jsPtr.dimensions.d6_consistency],
    ];

    for (const [label, weight, av, bv] of entries) {
      lines.push(`| ${label} | ${(weight * 100).toFixed(0)}% | ${(av * 100).toFixed(1)}% | ${(bv * 100).toFixed(1)}% |`);
    }

    lines.push(`| **MA综合** | **100%** | **${(dotP.dimensions.ma_overall * 100).toFixed(1)}% (${dotP.dimensions.ma_grade})** | **${(jsPtr.dimensions.ma_overall * 100).toFixed(1)}% (${jsPtr.dimensions.ma_grade})** |`);

    if (dotP.dimensions.learning_curve && jsPtr.dimensions.learning_curve) {
      lines.push("\n### D4 学习曲线明细\n");
      lines.push("| shot数 | A: dot-path | B: json-pointer |");
      lines.push("|--------|-------------|-----------------|");
      lines.push(`| 0-shot | ${(dotP.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% | ${(jsPtr.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 1-shot | ${(dotP.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% | ${(jsPtr.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 3-shot | ${(dotP.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% | ${(jsPtr.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% |`);
    }

    if (dotP.dimensions.consistency_detail && jsPtr.dimensions.consistency_detail) {
      lines.push("\n### D6 一致性明细\n");
      lines.push("| 指标 | A: dot-path | B: json-pointer |");
      lines.push("|------|-------------|-----------------|");
      lines.push(`| 结构一致率 | ${(dotP.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% | ${(jsPtr.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% |`);
      lines.push(`| 语义等价率 | ${(dotP.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% | ${(jsPtr.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% |`);
    }

    for (const eval_ of [dotP, jsPtr]) {
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
