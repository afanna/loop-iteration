import "dotenv/config";
import { loadModelConfigs, resolveReportsDir, TOOLKIT_ROOT, PROJECT_ROOT } from "../config.js";
import { callLLM } from "../llm/client.js";
import { validate } from "../core/validator.js";
import { calcD1, calcD2, calcD3, calcD4, calcD5, calcD6, calcMA, type CaseResultWithLevels } from "../core/scorer.js";
import { writeFile, mkdir, readFile } from "fs/promises";
import { resolve } from "path";
import type {
  VariableScopeTestCase,
  PerCaseResult,
  StrategyEvaluation,
  VariableScopeComparisonReport,
  DimensionScores,
  ValidationRule,
} from "../core/types.js";

type NamingStrategy = "extended-prefix" | "unified-name" | "short-prefix";

const STRATEGIES: NamingStrategy[] = ["extended-prefix", "unified-name", "short-prefix"];
const MAX_RETRIES = 1;
const D4_SAMPLE_SIZE = 10;
const D6_SAMPLE_SIZE = 8;
const D6_REPEATS = 3;

// ============================================================================
// 策略专属规则
// ============================================================================

function getExtendedPrefixRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段，且所有组件名使用"Extended."前缀。',
    '   正确："Extended.Text", "Extended.Button", "Extended.Column", "Extended.TextInput", "Extended.List", "Extended.Row", "Extended.Toggle", "Extended.Select", "Extended.Radio", "Extended.Checkbox", "Extended.Image", "Extended.Progress", "Extended.If", "Extended.Tabs", "Extended.Stack", "Extended.Grid", "Extended.Navigation", "Extended.Web"',
    '   错误："Text", "Button", "Column"（不能省略Extended.前缀）',
    '3. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Extended.Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    '5. Text组件必须包含"content"。Button必须包含"label"。TextInput必须包含"placeholder"。',
    '6. 动态值整个用{{ }}包裹：纯动态"{{ $var }}"，混合文本"{{ \'Hello, \' + $var }}"。',
    "7. 每个{{ }}仅包含一个完整表达式。",
    "8. 变量用$前缀，函数直接调用无前缀。",
    '9. theme字段使用固定字符串值（如"heading1"），不使用{{ }}。',
  ];
}

function getUnifiedNameRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段，使用简单组件名（无前缀）。',
    '   正确："Text", "Button", "Column", "TextInput", "List", "Row", "Toggle", "Select", "Radio", "Checkbox", "Image", "Progress", "If", "Tabs", "Stack", "Grid", "Navigation", "Web"',
    '   错误："Extended.Text", "Extended.Button"（不要使用任何前缀）',
    '3. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    '5. Text组件必须包含"content"。Button必须包含"label"。TextInput必须包含"placeholder"。',
    '6. 动态值整个用{{ }}包裹：纯动态"{{ $var }}"，混合文本"{{ \'Hello, \' + $var }}"。',
    "7. 每个{{ }}仅包含一个完整表达式。",
    "8. 变量用$前缀，函数直接调用无前缀。",
    '9. theme字段使用固定字符串值（如"heading1"），不使用{{ }}。',
  ];
}

function getShortPrefixRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段，且所有组件名使用"H"前缀（代表HarmonyOS）。',
    '   正确："HText", "HButton", "HColumn", "HTextInput", "HList", "HRow", "HToggle", "HSelect", "HRadio", "HCheckbox", "HImage", "HProgress", "HIf", "HTabs", "HStack", "HGrid", "HNavigation", "HWeb"',
    '   错误："Text", "Button", "Extended.Text"（必须使用H前缀，不能省略也不能用Extended.）',
    '3. 不要把组件名当作key（错误：{"HText": {...}}），正确：{"component": "HText", ...}。',
    '4. 不要使用"type"代替"component"。',
    '5. HText组件必须包含"content"。HButton必须包含"label"。HTextInput必须包含"placeholder"。',
    '6. 动态值整个用{{ }}包裹：纯动态"{{ $var }}"，混合文本"{{ \'Hello, \' + $var }}"。',
    "7. 每个{{ }}仅包含一个完整表达式。",
    "8. 变量用$前缀，函数直接调用无前缀。",
    '9. theme字段使用固定字符串值（如"heading1"），不使用{{ }}。',
  ];
}

// ============================================================================
// Few-shot 示例
// ============================================================================

const EXTENDED_PREFIX_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 简单文本：",
  '输入："生成文本组件显示$username"',
  "输出：",
  '{"id": "greeting", "component": "Extended.Text", "content": "{{$username}}"}',
  "",
  "示例2 - 按钮带事件：",
  '输入："生成按钮label为提交，点击showToast成功"',
  "输出：",
  '{"id": "submitBtn", "component": "Extended.Button", "label": "提交", "onClick": [{"action": "showToast", "args": {"message": "成功"}}]}',
  "",
  "示例3 - 布局+子组件：",
  '输入："生成垂直布局包含header和content"',
  "输出：",
  '{"id": "mainLayout", "component": "Extended.Column", "children": ["header", "content"]}',
].join("\n");

const UNIFIED_NAME_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 简单文本：",
  '输入："生成文本组件显示$username"',
  "输出：",
  '{"id": "greeting", "component": "Text", "content": "{{$username}}"}',
  "",
  "示例2 - 按钮带事件：",
  '输入："生成按钮label为提交，点击showToast成功"',
  "输出：",
  '{"id": "submitBtn", "component": "Button", "label": "提交", "onClick": [{"action": "showToast", "args": {"message": "成功"}}]}',
  "",
  "示例3 - 布局+子组件：",
  '输入："生成垂直布局包含header和content"',
  "输出：",
  '{"id": "mainLayout", "component": "Column", "children": ["header", "content"]}',
].join("\n");

const SHORT_PREFIX_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 简单文本：",
  '输入："生成文本组件显示$username"',
  "输出：",
  '{"id": "greeting", "component": "HText", "content": "{{$username}}"}',
  "",
  "示例2 - 按钮带事件：",
  '输入："生成按钮label为提交，点击showToast成功"',
  "输出：",
  '{"id": "submitBtn", "component": "HButton", "label": "提交", "onClick": [{"action": "showToast", "args": {"message": "成功"}}]}',
  "",
  "示例3 - 布局+子组件：",
  '输入："生成垂直布局包含header和content"',
  "输出：",
  '{"id": "mainLayout", "component": "HColumn", "children": ["header", "content"]}',
].join("\n");

// ============================================================================
// Prompt 构建
// ============================================================================

let _baseSummary = "";

async function loadSummaries(): Promise<void> {
  const path = resolve(TOOLKIT_ROOT, "prompts", "protocol-inline-summary.md");
  _baseSummary = await readFile(path, "utf-8");
}

function buildSystemPrompt(strategy: NamingStrategy): string {
  const rules = strategy === "extended-prefix" ? getExtendedPrefixRules() : strategy === "unified-name" ? getUnifiedNameRules() : getShortPrefixRules();
  return [
    "你是鸿蒙智能体UI协议v2.0的DSL生成器。严格按照下面的协议规范生成JSON。",
    "",
    "# 协议规范",
    "",
    _baseSummary,
    "",
    "# 重要规则",
    "",
    rules.join("\n"),
  ].join("\n");
}

function buildUserPrompt(testCase: VariableScopeTestCase, strategy: NamingStrategy, shotCount: number = 3): string {
  const fullExamples = strategy === "extended-prefix" ? EXTENDED_PREFIX_EXAMPLES : strategy === "unified-name" ? UNIFIED_NAME_EXAMPLES : SHORT_PREFIX_EXAMPLES;
  let examples = "";
  if (shotCount >= 3) {
    examples = fullExamples;
  } else if (shotCount === 1) {
    const lines = fullExamples.split("\n");
    const sections: string[][] = [];
    let current: string[] = [];
    for (const line of lines) {
      if (line.startsWith("示例") && current.length > 0) { sections.push(current); current = []; }
      current.push(line);
    }
    if (current.length > 0) sections.push(current);
    const header = sections[0].filter((l) => !l.startsWith("示例")).join("\n");
    const firstExample = sections.slice(1, 2).map((s) => s.join("\n")).join("\n");
    examples = header + "\n" + firstExample;
  }

  const rules = resolveRules(testCase, strategy);
  const reqs = rules.map((r, i) => `${i + 1}. ${r.description}`).join("\n");
  const hints = testCase.hints?.length ? "\n提示：\n" + testCase.hints.map((h) => `- ${h}`).join("\n") : "";

  const parts: string[] = [];
  if (examples) parts.push(examples, "");
  parts.push("---");
  parts.push("任务：" + testCase.task);
  parts.push("", "要求：", reqs);
  if (hints) parts.push(hints);
  parts.push("", "请只输出一个JSON对象，不要包含任何其他内容。");
  return parts.join("\n");
}

function resolveRules(testCase: VariableScopeTestCase, strategy: NamingStrategy): ValidationRule[] {
  if (testCase.shared_rules && testCase.strategy_rules) {
    const strategyRules = (testCase.strategy_rules as Record<string, ValidationRule[]>)[strategy] || [];
    return [...testCase.shared_rules, ...strategyRules];
  }
  return testCase.validation_rules;
}

// ============================================================================
// 评估主逻辑
// ============================================================================

async function loadComponentNamingTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath || process.env.TEST_CASES_FILE || resolve(PROJECT_ROOT, "eval/design-points", "component-naming", "test-cases", "component-naming.json");
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as VariableScopeTestCase[];
}

async function main() {
  console.log("=".repeat(70));
  console.log("组件命名方式对比 — 6维度量化评估");
  console.log("extended-prefix (当前设计) vs unified-name vs short-prefix");
  console.log("=".repeat(70));

  let models = loadModelConfigs();
  const skipModels = (process.env.SKIP_MODELS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (skipModels.length > 0) { models = models.filter((m) => !skipModels.some((s) => m.name.includes(s))); console.log(`跳过模型: ${skipModels.join(", ")}`); }
  const onlyModel = process.env.ONLY_MODEL;
  if (onlyModel) { models = models.filter((m) => m.name === onlyModel); console.log(`仅运行模型: ${onlyModel}`); }
  if (models.length === 0) { console.error("\n错误: 未配置任何模型。"); process.exit(1); }
  console.log(`\n已配置 ${models.length} 个模型: ${models.map((m) => m.displayName).join(", ")}`);

  const allTestCases = await loadComponentNamingTestCases();
  console.log(`已加载 ${allTestCases.length} 个组件命名测试用例`);
  const edgeCases = allTestCases.filter((tc) => tc.is_edge === true);
  console.log(`  其中边界用例: ${edgeCases.length} 个`);
  const simple = allTestCases.filter((tc) => tc.complexity === "simple");
  const medium = allTestCases.filter((tc) => tc.complexity === "medium");
  const complex_ = allTestCases.filter((tc) => tc.complexity === "complex");
  console.log(`  simple: ${simple.length} | medium: ${medium.length} | complex: ${complex_.length}`);

  await loadSummaries();
  const d4Cases = allTestCases.slice(0, D4_SAMPLE_SIZE);
  const d6Cases = allTestCases.slice(0, D6_SAMPLE_SIZE);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const reportsDir = resolveReportsDir("eval/design-points/component-naming/reports");
  await mkdir(reportsDir, { recursive: true });
  const allEvaluations: StrategyEvaluation[] = [];

  for (const modelConfig of models) {
    for (const strategy of STRATEGIES) {
      console.log(`\n${"=".repeat(70)}}`);
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
        if (!result.passed) { for (const err of result.errors) console.log(`    -> ${err}`); }
      }
      for (const [tierName, tierCases] of [["simple", simple], ["medium", medium], ["complex", complex_]] as const) {
        const tierResults = tierCases.map((tc) => mainResults.find((r) => r.id === tc.id)!).filter(Boolean);
        const tierPass = tierResults.filter((r) => r.passed).length;
        console.log(`  ${tierName}: ${tierPass}/${tierResults.length} 通过`);
      }

      console.log("\n--- Phase B: 学习曲线 (D4) ---\n");
      const learningResults: Record<string, PerCaseResult[]> = {};
      learningResults["3"] = d4Cases.map((tc) => mainResults.find((mr) => mr.id === tc.id)! as PerCaseResult);
      for (const shotCount of [0, 1] as const) {
        console.log(`  ${shotCount}-shot 测试...`);
        const shotResults: PerCaseResult[] = [];
        let skipped = false;
        for (const tc of d4Cases) {
          if (skipped) { shotResults.push(makeErrorResult(tc, "跳过")); continue; }
          try {
            const userPrompt = buildUserPrompt(tc, strategy, shotCount);
            const response = await callLLM(modelConfig, systemPrompt, userPrompt);
            const vResult = validate(response.content, tc, strategy);
            shotResults.push({ id: tc.id, name: tc.name, category: tc.category, complexity: tc.complexity, passed: vResult.passed, tokens: response.tokens, time_ms: response.elapsedMs, retries: 0, errors: vResult.errors, raw_output: response.content, generated_dsl: vResult.generated });
          } catch (e) {
            const msg = (e as Error).message; console.log(`    API错误: ${msg}`);
            shotResults.push(makeErrorResult(tc, msg));
            if (msg.includes("429") || msg.includes("余额")) skipped = true;
          }
        }
        learningResults[String(shotCount)] = shotResults;
        const validResults = shotResults.filter((r) => !r.errors[0]?.includes("跳过"));
        const acc = validResults.length > 0 ? validResults.filter((r) => r.passed).length / validResults.length : 0;
        console.log(`    ${shotCount}-shot 准确率: ${(acc * 100).toFixed(1)}%`);
      }

      console.log("\n--- Phase C: 一致性 (D6) ---\n");
      const consistencyResults: Record<string, PerCaseResult[][]> = {};
      let d6Skipped = false;
      for (const tc of d6Cases) {
        if (d6Skipped) { consistencyResults[tc.id] = [[mainResults.find((r) => r.id === tc.id) as PerCaseResult]]; continue; }
        const group: PerCaseResult[][] = [];
        const firstResult = mainResults.find((r) => r.id === tc.id);
        if (firstResult) group.push([firstResult as PerCaseResult]);
        for (let rep = 1; rep < D6_REPEATS; rep++) {
          try {
            const userPrompt = buildUserPrompt(tc, strategy, 3);
            const response = await callLLM(modelConfig, systemPrompt, userPrompt);
            const vResult = validate(response.content, tc, strategy);
            group.push([{ id: tc.id, name: tc.name, category: tc.category, complexity: tc.complexity, passed: vResult.passed, tokens: response.tokens, time_ms: response.elapsedMs, retries: 0, errors: vResult.errors, raw_output: response.content, generated_dsl: vResult.generated }]);
          } catch (e) {
            const msg = (e as Error).message; console.log(`    API错误: ${msg}`);
            if (msg.includes("429") || msg.includes("余额")) { d6Skipped = true; break; }
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
      const dimensions: DimensionScores = { d1_syntactic_accuracy: d1, d2_semantic_accuracy: d2, d3_generation_efficiency: d3, d4_learning_curve: d4, d5_edge_robustness: d5, d6_consistency: d6, ma_overall: maScore, ma_grade: maGrade, learning_curve: lcDetail, consistency_detail: conDetail };

      console.log(`  D1 语法准确率:    ${(d1 * 100).toFixed(1)}%`);
      console.log(`  D2 语义准确率:    ${(d2 * 100).toFixed(1)}%`);
      console.log(`  D3 生成效率:      ${(d3 * 100).toFixed(1)}%`);
      console.log(`  D4 学习曲线:      ${(d4 * 100).toFixed(1)}% (0:${(shot0Acc * 100).toFixed(0)}% → 1:${(shot1Acc * 100).toFixed(0)}% → 3:${(shot3Acc * 100).toFixed(0)}%)`);
      console.log(`  D5 边界鲁棒性:    ${(d5 * 100).toFixed(1)}%`);
      console.log(`  D6 一致稳定性:    ${(d6 * 100).toFixed(1)}%`);
      console.log(`  ─────────────────────────`);
      console.log(`  MA 综合分:        ${(maScore * 100).toFixed(1)}% (${maGrade})`);

      allEvaluations.push({ strategy: strategy as any, model_name: modelConfig.displayName, total_cases: allTestCases.length, dimensions, main_results: mainResults, learning_results: learningResults, consistency_results: consistencyResults });
    }
  }

  console.log(`\n${"=".repeat(70)}}`);
  console.log("对比汇总");
  console.log(`${"=".repeat(70)}\n`);
  for (const model of models) {
    console.log(`\n### ${model.displayName}\n`);
    console.log("| 维度 | extended-prefix | unified-name | short-prefix |");
    console.log("|------|-----------------|--------------|--------------|");
    const ep = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "extended-prefix")!;
    const un = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "unified-name")!;
    const sp = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "short-prefix")!;
    const dims: [string, (d: DimensionScores) => number][] = [["D1 语法", (d) => d.d1_syntactic_accuracy], ["D2 语义", (d) => d.d2_semantic_accuracy], ["D3 效率", (d) => d.d3_generation_efficiency], ["D4 学习", (d) => d.d4_learning_curve], ["D5 边界", (d) => d.d5_edge_robustness], ["D6 一致", (d) => d.d6_consistency], ["**MA**", (d) => d.ma_overall]];
    for (const [label, fn] of dims) {
      console.log(`| ${label} | ${(fn(ep.dimensions) * 100).toFixed(1)}% | ${(fn(un.dimensions) * 100).toFixed(1)}% | ${(fn(sp.dimensions) * 100).toFixed(1)}% |`);
    }
    console.log(`\n  extended-prefix: ${ep.dimensions.ma_grade} | unified-name: ${un.dimensions.ma_grade} | short-prefix: ${sp.dimensions.ma_grade}`);
  }

  const report: VariableScopeComparisonReport = { timestamp: new Date().toISOString(), protocol_version: "v2.0", evaluation_type: "component-naming-6d", models: models.map((m) => m.displayName), total_cases: allTestCases.length, strategies: allEvaluations };
  const jsonPath = resolve(reportsDir, `component-naming-comparison-${timestamp}.json`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");
  const mdPath = resolve(reportsDir, `component-naming-comparison-${timestamp}.md`);
  await writeFile(mdPath, buildMarkdownReport(report), "utf-8");
  console.log(`\n报告已保存:\n  ${jsonPath}\n  ${mdPath}\n评估完成！`);
}

// ============================================================================
// 辅助函数
// ============================================================================

async function runSingleCase(modelConfig: import("../core/types.js").LLMModelConfig, testCase: VariableScopeTestCase, systemPrompt: string, strategy: NamingStrategy, maxRetries: number): Promise<CaseResultWithLevels> {
  let passed = false, errors: string[] = [], retryCount = 0, tokens = 0, timeMs = 0, rawOutput = "", generatedDsl: Record<string, unknown> | null = null;
  let levels = { l1_json_parsed: false, l2_structure_ok: false, l3_patterns_ok: false, l4_rules_ok: false };
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const userPrompt = buildUserPrompt(testCase, strategy, 3);
      const response = await callLLM(modelConfig, systemPrompt, userPrompt);
      rawOutput = response.content; tokens = response.tokens; timeMs = response.elapsedMs; retryCount = attempt;
      const vResult = validate(rawOutput, testCase, strategy);
      passed = vResult.passed; errors = vResult.errors; generatedDsl = vResult.generated; levels = vResult.levels || levels;
      if (passed || attempt === maxRetries) break;
    } catch (e) { errors = [`LLM调用错误: ${(e as Error).message}`]; retryCount = attempt; }
  }
  return { id: testCase.id, name: testCase.name, category: testCase.category, complexity: testCase.complexity, passed, tokens, time_ms: timeMs, retries: retryCount, errors, raw_output: rawOutput, generated_dsl: generatedDsl, levels };
}

function buildMarkdownReport(report: VariableScopeComparisonReport): string {
  const lines: string[] = [];
  lines.push("# 组件命名方式对比 — 6维度量化评估报告");
  lines.push(`\n日期: ${report.timestamp.split("T")[0]}\n协议版本: ${report.protocol_version}\n测试用例: ${report.total_cases} 个\n模型: ${report.models.join(", ")}\n对比: extended-prefix (当前设计) vs unified-name vs short-prefix\n`);
  for (const modelName of report.models) {
    const ep = report.strategies.find((e) => e.model_name === modelName && e.strategy === "extended-prefix")!;
    const un = report.strategies.find((e) => e.model_name === modelName && e.strategy === "unified-name")!;
    const sp = report.strategies.find((e) => e.model_name === modelName && e.strategy === "short-prefix")!;
    lines.push(`## ${modelName}\n\n### 6维度评分对比\n`);
    lines.push("| 维度 | 权重 | extended-prefix | unified-name | short-prefix |");
    lines.push("|------|------|-----------------|--------------|--------------|");
    const entries: [string, number, number, number, number][] = [
      ["D1 语法准确率", 0.20, ep.dimensions.d1_syntactic_accuracy, un.dimensions.d1_syntactic_accuracy, sp.dimensions.d1_syntactic_accuracy],
      ["D2 语义准确率", 0.25, ep.dimensions.d2_semantic_accuracy, un.dimensions.d2_semantic_accuracy, sp.dimensions.d2_semantic_accuracy],
      ["D3 生成效率", 0.15, ep.dimensions.d3_generation_efficiency, un.dimensions.d3_generation_efficiency, sp.dimensions.d3_generation_efficiency],
      ["D4 学习曲线", 0.15, ep.dimensions.d4_learning_curve, un.dimensions.d4_learning_curve, sp.dimensions.d4_learning_curve],
      ["D5 边界鲁棒性", 0.15, ep.dimensions.d5_edge_robustness, un.dimensions.d5_edge_robustness, sp.dimensions.d5_edge_robustness],
      ["D6 一致稳定性", 0.10, ep.dimensions.d6_consistency, un.dimensions.d6_consistency, sp.dimensions.d6_consistency],
    ];
    for (const [label, weight, ev, uv, sv] of entries) { lines.push(`| ${label} | ${(weight * 100).toFixed(0)}% | ${(ev * 100).toFixed(1)}% | ${(uv * 100).toFixed(1)}% | ${(sv * 100).toFixed(1)}% |`); }
    lines.push(`| **MA综合** | **100%** | **${(ep.dimensions.ma_overall * 100).toFixed(1)}% (${ep.dimensions.ma_grade})** | **${(un.dimensions.ma_overall * 100).toFixed(1)}% (${un.dimensions.ma_grade})** | **${(sp.dimensions.ma_overall * 100).toFixed(1)}% (${sp.dimensions.ma_grade})** |`);
    for (const eval_ of [ep, un, sp]) {
      const failed = eval_.main_results.filter((r) => !r.passed);
      if (failed.length > 0) {
        lines.push(`\n### ${eval_.strategy} 失败用例 (${failed.length}/${eval_.total_cases})\n`);
        for (const c of failed) { lines.push(`**${c.id} ${c.name}** (${c.complexity})`); for (const err of c.errors) lines.push(`  - ${err}`); if (c.raw_output) lines.push(`  - 原始输出: \`${c.raw_output.substring(0, 200)}\``); lines.push(""); }
      }
    }
    lines.push("");
  }
  lines.push("\n## 结论\n\n_待根据评估数据填写_\n");
  return lines.join("\n");
}

function makeErrorResult(tc: VariableScopeTestCase, errorMsg: string): PerCaseResult {
  return { id: tc.id, name: tc.name, category: tc.category, complexity: tc.complexity, passed: false, tokens: 0, time_ms: 0, retries: 0, errors: [errorMsg], raw_output: "", generated_dsl: null };
}

main().catch((e) => { console.error("运行错误:", e); process.exit(1); });
