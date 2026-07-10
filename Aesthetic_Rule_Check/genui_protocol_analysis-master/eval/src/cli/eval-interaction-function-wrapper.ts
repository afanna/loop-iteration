import "dotenv/config";
import { mkdir, readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import { callLLM } from "../llm/client.js";
import { validate } from "../core/validator.js";
import { calcD1, calcD2, calcD3, calcD4, calcD5, calcD6, calcMA, type CaseResultWithLevels } from "../core/scorer.js";
import { loadModelConfigs, PROJECT_ROOT, resolveReportsDir, TOOLKIT_ROOT } from "../config.js";
import type {
  DimensionScores,
  LLMModelConfig,
  PerCaseResult,
  StrategyEvaluation,
  ValidationRule,
  VariableScopeComparisonReport,
  VariableScopeTestCase,
} from "../core/types.js";

type FunctionWrapperStrategy = "split-function-action" | "unified-interaction-function";

const STRATEGIES: FunctionWrapperStrategy[] = ["split-function-action", "unified-interaction-function"];
const MAX_RETRIES = 1;
const D4_SAMPLE_SIZE = 10;
const D6_REPEATS = 3;
const D6_SAMPLE_SIZE = 8;

function getSplitFunctionActionRules(): string[] {
  return [
    "1. 输出JSON，不要包含任何其他文字、说明或markdown代码块标记。单组件输出一个JSON对象，多组件输出JSON数组。",
    "2. children 必须是组件 ID 的字符串数组，不能内联嵌套组件对象。",
    '3. 每个组件必须有 "id" 和 "component" 字段。',
    "4. 动态值整个用 {{ }} 包裹，每个 {{ }} 只包含一个完整表达式。",
    "5. getRadioValue/getCheckboxGroupValues/getToggleValue/getSelectValue 是扩展内置函数，主要用于 Button action.event.context 中采集表单状态。",
    '6. action.event.context 中函数调用格式：{ "call": "getRadioValue", "args": { "group": "plan_type" } }，调用处不要写 returnType。',
    "7. onClick/onChange 等事件监听直接作为组件属性，值是 EventHandler 数组。",
    '8. EventHandler 格式：{ "call": "函数名", "args": {...}, "as": "变量名", "condition": "{{ 表达式 }}" }。',
    "9. break/setDataModel/setAttributes/navigate 作为事件监听中的可调用能力使用。",
    "10. 不要使用 listeners 包装层，不要使用 sendToLLM。",
  ];
}

function getUnifiedInteractionFunctionRules(): string[] {
  return [
    "1. 输出JSON，不要包含任何其他文字、说明或markdown代码块标记。单组件输出一个JSON对象，多组件输出JSON数组。",
    "2. children 必须是组件 ID 的字符串数组，不能内联嵌套组件对象。",
    '3. 每个组件必须有 "id" 和 "component" 字段。',
    "4. 动态值整个用 {{ }} 包裹，每个 {{ }} 只包含一个完整表达式。",
    "5. 【关键】所有交互可调用能力统一视为扩展函数，通过 {call,args} 调用；返回类型由函数定义声明，调用处不要写 returnType。",
    "6. 扩展函数包括：getRadioValue, getCheckboxGroupValues, getToggleValue, getSelectValue, break, setDataModel, setAttributes, navigate。",
    "7. Button action 使用 A2UI 原生 action 结构；action.event.context 的字段值可以是 {call,args} 扩展函数调用对象。",
    "8. 事件名直接作为组件属性，如 onClick/onChange；值是 EventHandler 数组。不要使用 listeners 包装层。",
    '9. EventHandler 是函数调用包装器，只包含 call、args、as、condition；不要在 EventHandler 中声明 returnType。',
    "10. 不要使用 sendToLLM。",
  ];
}

const SPLIT_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - action context 获取表单状态：",
  '{"id":"submit-btn","component":"Button","label":"提交","action":{"event":{"name":"submitSurvey","context":{"plan":{"call":"getRadioValue","args":{"group":"plan_type"}}}}}}',
  "",
  "示例2 - onClick 行为链：",
  '{"id":"refresh-btn","component":"Button","label":"刷新","onClick":[{"call":"setDataModel","args":{"path":"/ui/isLoading","value":true}},{"call":"setAttributes","args":{"componentId":"refresh-btn","value":{"label":"加载中..."}}}]}',
].join("\n");

const UNIFIED_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - action context 中统一使用 {call,args}：",
  '{"id":"submit-btn","component":"Button","label":"提交","action":{"event":{"name":"submitSurvey","context":{"plan":{"call":"getRadioValue","args":{"group":"plan_type"}},"hobbies":{"call":"getCheckboxGroupValues","args":{"group":"hobbies"}}}}}}',
  "",
  "示例2 - EventHandler 是函数调用包装器：",
  '{"id":"submit-btn","component":"Button","label":"提交","onClick":[{"call":"validateForm","args":{"data":"{{ $__dataModel.form }}"},"as":"validResult"},{"call":"break","condition":"{{ $validResult == 0 }}"},{"call":"setDataModel","args":{"path":"/form/validated","value":true}}]}',
].join("\n");

let protocolSummary = "";

async function loadSummary(): Promise<void> {
  protocolSummary = await readFile(resolve(TOOLKIT_ROOT, "prompts", "protocol-harmonyos-extended.md"), "utf-8");
}

function buildSystemPrompt(strategy: FunctionWrapperStrategy): string {
  const rules = strategy === "split-function-action" ? getSplitFunctionActionRules() : getUnifiedInteractionFunctionRules();
  return [
    "你是鸿蒙智能体UI协议的DSL生成器。严格按照下面的协议规范生成JSON。",
    "",
    "# 协议规范",
    protocolSummary,
    "",
    "# 重要规则",
    rules.join("\n"),
  ].join("\n");
}

function resolveRules(testCase: VariableScopeTestCase, strategy: FunctionWrapperStrategy): ValidationRule[] {
  const strategyRules = (testCase.strategy_rules as Record<string, ValidationRule[]> | undefined)?.[strategy] || [];
  return [...(testCase.shared_rules || []), ...strategyRules];
}

function buildUserPrompt(testCase: VariableScopeTestCase, strategy: FunctionWrapperStrategy, shotCount = 2): string {
  const examples = shotCount > 0
    ? (strategy === "split-function-action" ? SPLIT_EXAMPLES : UNIFIED_EXAMPLES)
    : "";
  const reqs = resolveRules(testCase, strategy).map((r, i) => `${i + 1}. ${r.description}`).join("\n");
  const hints = testCase.hints?.length ? "\n提示：\n" + testCase.hints.map((h) => `- ${h}`).join("\n") : "";
  return [
    examples,
    "---",
    `任务：${testCase.task}`,
    "",
    "要求：",
    reqs,
    hints,
    "",
    "请输出JSON（单组件输出JSON对象，多组件输出JSON数组），不要包含任何其他内容。",
  ].filter(Boolean).join("\n");
}

async function loadTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(PROJECT_ROOT, "eval/design-points", "interaction-function-wrapper", "test-cases", "interaction-function-wrapper.json");
  return JSON.parse(await readFile(path, "utf-8")) as VariableScopeTestCase[];
}

async function runSingleCase(
  modelConfig: LLMModelConfig,
  testCase: VariableScopeTestCase,
  systemPrompt: string,
  strategy: FunctionWrapperStrategy,
  maxRetries: number,
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
      const response = await callLLM(modelConfig, systemPrompt, buildUserPrompt(testCase, strategy, 2));
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

function buildMDReport(report: VariableScopeComparisonReport): string {
  const lines: string[] = [];
  lines.push("# GAP-054 交互函数统一建模 A/B 对比评估报告");
  lines.push(`\n日期: ${report.timestamp.split("T")[0]} | 模型: ${report.models.join(", ")} | 用例: ${report.total_cases}`);
  lines.push("\n方案A: split-function-action（函数/行为分散描述）");
  lines.push("方案B: unified-interaction-function（统一扩展函数 + EventHandler 包装器）\n");

  for (const model of report.models) {
    const a = report.strategies.find((e) => e.model_name === model && e.strategy === "split-function-action");
    const b = report.strategies.find((e) => e.model_name === model && e.strategy === "unified-interaction-function");
    if (!a || !b) continue;
    lines.push(`## ${model}\n`);
    lines.push("| 维度 | 方案A | 方案B |");
    lines.push("|------|-------|-------|");
    for (const [label, fn] of [
      ["D1 语法", (d: DimensionScores) => d.d1_syntactic_accuracy],
      ["D2 语义", (d: DimensionScores) => d.d2_semantic_accuracy],
      ["D3 效率", (d: DimensionScores) => d.d3_generation_efficiency],
      ["D4 学习", (d: DimensionScores) => d.d4_learning_curve],
      ["D5 边界", (d: DimensionScores) => d.d5_edge_robustness],
      ["D6 一致", (d: DimensionScores) => d.d6_consistency],
      ["**MA**", (d: DimensionScores) => d.ma_overall],
    ] as const) {
      lines.push(`| ${label} | ${(fn(a.dimensions) * 100).toFixed(1)}% | ${(fn(b.dimensions) * 100).toFixed(1)}% |`);
    }
    lines.push(`\nA: ${a.dimensions.ma_grade} | B: ${b.dimensions.ma_grade}\n`);
  }

  lines.push("\n## 结论\n待根据评估数据填写\n");
  return lines.join("\n");
}

async function main(): Promise<void> {
  console.log("=".repeat(70));
  console.log("GAP-054 交互函数统一建模 A/B 对比 — 6维度量化评估");
  console.log("方案A: split-function-action");
  console.log("方案B: unified-interaction-function");
  console.log("=".repeat(70));

  let models = loadModelConfigs();
  const skipModels = (process.env.SKIP_MODELS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (skipModels.length > 0) models = models.filter((m) => !skipModels.some((s) => m.name.includes(s)));
  const onlyModel = process.env.ONLY_MODEL;
  if (onlyModel) models = models.filter((m) => m.name === onlyModel);
  if (models.length === 0) throw new Error("未配置任何模型，请检查 eval/.env");

  const allTestCases = await loadTestCases();
  await loadSummary();

  console.log(`\n模型: ${models.map((m) => m.displayName).join(", ")}`);
  console.log(`测试用例: ${allTestCases.length} 个`);
  console.log(`  simple: ${allTestCases.filter((tc) => tc.complexity === "simple").length} | medium: ${allTestCases.filter((tc) => tc.complexity === "medium").length} | complex: ${allTestCases.filter((tc) => tc.complexity === "complex").length}`);

  if (process.env.DRY_RUN === "1") {
    console.log("\nDRY_RUN=1: 配置、测试用例和 prompt 加载成功，未调用模型。");
    return;
  }

  const d4Cases = allTestCases.slice(0, D4_SAMPLE_SIZE);
  const d6Cases = allTestCases.slice(0, D6_SAMPLE_SIZE);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const reportsDir = resolveReportsDir("eval/design-points/interaction-function-wrapper/reports");
  await mkdir(reportsDir, { recursive: true });

  const allEvaluations: StrategyEvaluation[] = [];

  for (const modelConfig of models) {
    for (const strategy of STRATEGIES) {
      console.log(`\n${"=".repeat(70)}\n${modelConfig.displayName} | ${strategy}\n${"=".repeat(70)}\n`);
      const systemPrompt = buildSystemPrompt(strategy);
      const mainResults: CaseResultWithLevels[] = [];

      console.log("--- Phase A: 主测试 ---\n");
      for (let i = 0; i < allTestCases.length; i++) {
        const tc = allTestCases[i];
        const result = await runSingleCase(modelConfig, tc, systemPrompt, strategy, MAX_RETRIES);
        mainResults.push(result);
        console.log(`  [${i + 1}/${allTestCases.length}] ${tc.id} ${tc.name} ${result.passed ? "OK" : "XX"} [${result.tokens}t, ${(result.time_ms / 1000).toFixed(1)}s]`);
        if (!result.passed) for (const err of result.errors) console.log(`    -> ${err}`);
      }

      console.log("\n--- Phase B: D4 ---\n");
      const learningResults: Record<string, PerCaseResult[]> = { "2": mainResults as PerCaseResult[] };
      for (const shotCount of [0, 1] as const) {
        const shotResults: PerCaseResult[] = [];
        let skipped = false;
        for (const tc of d4Cases) {
          if (skipped) {
            shotResults.push(makeErrorResult(tc, "跳过"));
            continue;
          }
          try {
            const response = await callLLM(modelConfig, systemPrompt, buildUserPrompt(tc, strategy, shotCount));
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
            shotResults.push(makeErrorResult(tc, msg));
            if (msg.includes("429") || msg.includes("余额")) skipped = true;
          }
        }
        learningResults[String(shotCount)] = shotResults;
      }

      console.log("\n--- Phase C: D6 ---\n");
      const consistencyResults: Record<string, PerCaseResult[][]> = {};
      for (const tc of d6Cases) {
        const group: PerCaseResult[][] = [];
        const first = mainResults.find((r) => r.id === tc.id);
        if (first) group.push([first as PerCaseResult]);
        for (let rep = 1; rep < D6_REPEATS; rep++) {
          try {
            const response = await callLLM(modelConfig, systemPrompt, buildUserPrompt(tc, strategy, 2));
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
          } catch {
            break;
          }
        }
        consistencyResults[tc.id] = group;
      }

      const d1 = calcD1(mainResults);
      const d2 = calcD2(mainResults);
      const d3 = calcD3(mainResults, MAX_RETRIES);
      const shot0Acc = learningResults["0"].filter((r) => r.passed).length / learningResults["0"].length;
      const shot1Acc = learningResults["1"].filter((r) => r.passed).length / learningResults["1"].length;
      const shot2Acc = learningResults["2"].filter((r) => r.passed).length / learningResults["2"].length;
      const { score: d4, detail: lcDetail } = calcD4(shot0Acc, shot1Acc, shot2Acc);
      const d5 = calcD5(mainResults);
      const { score: d6, detail: conDetail } = calcD6(Object.values(consistencyResults).map((g) => g.flat()));
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

      console.log(`\nMA: ${(maScore * 100).toFixed(1)}% (${maGrade})`);
      allEvaluations.push({
        strategy: strategy as any,
        model_name: modelConfig.displayName,
        total_cases: allTestCases.length,
        dimensions,
        main_results: mainResults,
        learning_results: learningResults,
        consistency_results: consistencyResults,
      });
    }
  }

  const report: VariableScopeComparisonReport = {
    timestamp: new Date().toISOString(),
    protocol_version: "v2.0",
    evaluation_type: "interaction-function-wrapper-ab-comparison",
    models: models.map((m) => m.displayName),
    total_cases: allTestCases.length,
    strategies: allEvaluations,
  };

  const jsonPath = resolve(reportsDir, `interaction-function-wrapper-ab-${timestamp}.json`);
  const mdPath = resolve(reportsDir, `interaction-function-wrapper-ab-${timestamp}.md`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");
  await writeFile(mdPath, buildMDReport(report), "utf-8");
  console.log(`\n报告: ${jsonPath}\n  ${mdPath}`);
}

main().catch((e) => {
  console.error("错误:", e);
  process.exit(1);
});
