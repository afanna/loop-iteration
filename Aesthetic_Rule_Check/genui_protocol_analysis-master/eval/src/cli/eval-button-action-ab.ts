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

type ButtonStrategy = "button-action" | "listeners-sendtollm";

const STRATEGIES: ButtonStrategy[] = ["button-action", "listeners-sendtollm"];
const MAX_RETRIES = 1;
const D4_SAMPLE_SIZE = 10;
const D6_REPEATS = 3;
const D6_SAMPLE_SIZE = 8;

// ============================================================================
// 方案 A 规则 — Button.action（互斥，有 action 不走 listeners）
// ============================================================================

function getButtonActionRules(): string[] {
  return [
    "1. 输出JSON，不要包含任何其他文字、说明或markdown代码块标记。单组件输出一个JSON对象，多组件输出JSON数组。",
    "2. 【邻接表】children 必须是组件 ID 的字符串数组，不能内联嵌套组件对象。",
    '   正确：{"id": "root", "component": "Column", "children": ["btn1", "btn2"]}',
    '   错误：{"id": "root", "component": "Column", "children": [{"component": "Button", ...}]}',
    "   多组件时，输出JSON数组，每个组件是数组中的一个元素。",
    '3. 每个组件必须有"component"字段（如"Text"、"Button"、"Column"）。',
    '4. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
    '5. 不要使用"type"代替"component"。',
    '6. Text组件必须包含"content"。Button必须包含"label"。TextInput必须包含"placeholder"。',
    '7. 动态值整个用{{ }}包裹：纯动态"{{ $var }}"，混合文本"{{ \'Hello, \' + $var }}"。',
    "8. 每个{{ }}仅包含一个完整表达式，不支持在一对双引号中使用多个{{ }}表达式。",
    "9. 变量用$前缀，函数直接调用无前缀（如formatNumber($price, 2)）。",
    "10. 【关键】Button 组件支持 action 和 listeners 两种交互机制：",
    "   - **action 属性**（表单提交专用）：向服务端提交表单或调用本地函数",
    '     格式1（服务端事件）：{ "action": { "event": { "name": "事件名", "context": { "key": "value" } } } }',
    '     格式2（本地函数）：{ "action": { "functionCall": { "call": "函数名", "args": { "key": "value" } } } }',
    "   - **listeners 属性**（通用交互）：UI反馈、导航、数据操作等非表单提交场景",
    '     格式："listeners": { "onClick": [{ "call": "行为名", "args": {...} }] }',
    "   - **触发优先级**：action 优先级高于 listeners。有 action 时只触发 action，没有 action 时触发 listeners。两者可共存，但通常按场景二选一",
    "   - 表单提交 → 用 action；Toast/导航/数据操作 → 用 listeners",
    "11. 其他组件（Toggle、TextInput等）只有listeners，没有action属性",
    "12. 可用行为：setDataModel, navigate, showToast, validate, openUrl, sendToLLM",
    '13. theme字段使用固定字符串值（如"heading1"），不使用{{ }}。',
  ];
}

// ============================================================================
// 方案 B 规则 — listeners + sendToLLM（统一用通用机制）
// ============================================================================

function getListenersSendToLLMRules(): string[] {
  return [
    "1. 输出JSON，不要包含任何其他文字、说明或markdown代码块标记。单组件输出一个JSON对象，多组件输出JSON数组。",
    "2. 【邻接表】children 必须是组件 ID 的字符串数组，不能内联嵌套组件对象。",
    '   正确：{"id": "root", "component": "Column", "children": ["btn1", "btn2"]}',
    '   错误：{"id": "root", "component": "Column", "children": [{"component": "Button", ...}]}',
    "   多组件时，输出JSON数组，每个组件是数组中的一个元素。",
    '3. 每个组件必须有"component"字段（如"Text"、"Button"、"Column"）。',
    '4. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
    '5. 不要使用"type"代替"component"。',
    '6. Text组件必须包含"content"。Button必须包含"label"。TextInput必须包含"placeholder"。',
    '7. 动态值整个用{{ }}包裹：纯动态"{{ $var }}"，混合文本"{{ \'Hello, \' + $var }}"。',
    "8. 每个{{ }}仅包含一个完整表达式，不支持在一对双引号中使用多个{{ }}表达式。",
    "9. 变量用$前缀，函数直接调用无前缀（如formatNumber($price, 2)）。",
    "10. 【关键】Button 组件的交互统一使用 listeners：",
    "   - **表单提交**：使用 sendToLLM 行为，args 中包含事件名和上下文数据",
    '     格式："listeners": { "onClick": [{ "call": "sendToLLM", "args": { "value": "事件名", ...上下文数据 } }] }',
    "   - sendToLLM 的 args 参数格式：value 为事件名（必填），其余键值对为上下文数据",
    "   - **通用交互**：使用 showToast, navigate, setDataModel, validate 等行为",
    "11. 所有组件统一使用 listeners 进行交互，没有 action 属性",
    "12. 可用行为：setDataModel, navigate, showToast, validate, openUrl, sendToLLM",
    '13. theme字段使用固定字符串值（如"heading1"），不使用{{ }}。',
  ];
}

// ============================================================================
// Few-shot 示例
// ============================================================================

const BUTTON_ACTION_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 表单提交（使用action，无需设listeners）：",
  '输入："生成Button，id为\'submitBtn\'，label为\'提交\'，点击后提交表单（事件名submitForm）"',
  "输出：",
  '{"id": "submitBtn", "component": "Button", "label": "提交", "action": {"event": {"name": "submitForm"}}}',
  "",
  "示例2 - 普通交互（使用listeners，无action）：",
  '输入："生成Button，id为\'btn\'，label为\'提示\'，点击后showToast\'成功\'"',
  "输出：",
  '{"id": "btn", "component": "Button", "label": "提示", "listeners": {"onClick": [{"call": "showToast", "args": {"message": "成功"}}]}}',
  "",
  "示例3 - 表单提交携带上下文（使用action）：",
  '输入："生成Button，id为\'submitBtn\'，label为\'提交\'，提交表单（事件名submitOrder，携带userId为user001）"',
  "输出：",
  '{"id": "submitBtn", "component": "Button", "label": "提交", "action": {"event": {"name": "submitOrder", "context": {"userId": "user001"}}}}',
  "",
  "示例4 - 多组件（邻接表，JSON数组）：",
  '输入："生成两个Button：提交按钮id为\'submitBtn\'，label为\'提交\'，提交表单（事件名\'submitForm\'）；取消按钮id为\'cancelBtn\'，label为\'取消\'，showToast\'已取消\'"',
  "输出：",
  '[{"id": "submitBtn", "component": "Button", "label": "提交", "action": {"event": {"name": "submitForm"}}},',
  ' {"id": "cancelBtn", "component": "Button", "label": "取消", "listeners": {"onClick": [{"call": "showToast", "args": {"message": "已取消"}}]}}]',
].join("\n");

const LISTENERS_SENDTOLLM_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 表单提交（使用sendToLLM）：",
  '输入："生成Button，id为\'submitBtn\'，label为\'提交\'，点击后提交表单（事件名submitForm）"',
  "输出：",
  '{"id": "submitBtn", "component": "Button", "label": "提交", "listeners": {"onClick": [{"call": "sendToLLM", "args": {"value": "submitForm"}}]}}',
  "",
  "示例2 - 普通交互（使用listeners）：",
  '输入："生成Button，id为\'btn\'，label为\'提示\'，点击后showToast\'成功\'"',
  "输出：",
  '{"id": "btn", "component": "Button", "label": "提示", "listeners": {"onClick": [{"call": "showToast", "args": {"message": "成功"}}]}}',
  "",
  "示例3 - 表单提交携带上下文（使用sendToLLM）：",
  '输入："生成Button，id为\'submitBtn\'，label为\'提交\'，提交表单（事件名submitOrder，携带userId为user001）"',
  "输出：",
  '{"id": "submitBtn", "component": "Button", "label": "提交", "listeners": {"onClick": [{"call": "sendToLLM", "args": {"value": "submitOrder", "userId": "user001"}}]}}',
  "",
  "示例4 - 多组件（邻接表，JSON数组）：",
  '输入："生成两个Button：提交按钮id为\'submitBtn\'，label为\'提交\'，提交表单（事件名\'submitForm\'）；取消按钮id为\'cancelBtn\'，label为\'取消\'，sendToLLM\'用户取消操作\'"',
  "输出：",
  '[{"id": "submitBtn", "component": "Button", "label": "提交", "listeners": {"onClick": [{"call": "sendToLLM", "args": {"value": "submitForm"}}]}},',
  ' {"id": "cancelBtn", "component": "Button", "label": "取消", "listeners": {"onClick": [{"call": "sendToLLM", "args": {"value": "用户取消操作"}}]}}]',
].join("\n");

// ============================================================================
// Prompt 构建
// ============================================================================

let _baseSummary = "";

async function loadSummaries(): Promise<void> {
  const path = resolve(TOOLKIT_ROOT, "prompts", "protocol-inline-summary.md");
  _baseSummary = await readFile(path, "utf-8");
}

function buildSystemPrompt(strategy: ButtonStrategy): string {
  const rules = strategy === "button-action" ? getButtonActionRules() : getListenersSendToLLMRules();
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

function buildUserPrompt(
  testCase: VariableScopeTestCase,
  strategy: ButtonStrategy,
  shotCount: number = 3,
): string {
  const fullExamples = strategy === "button-action" ? BUTTON_ACTION_EXAMPLES : LISTENERS_SENDTOLLM_EXAMPLES;

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
  parts.push("", "请输出JSON（单组件输出JSON对象，多组件输出JSON数组），不要包含任何其他内容。");
  return parts.join("\n");
}

function resolveRules(testCase: VariableScopeTestCase, strategy: ButtonStrategy): ValidationRule[] {
  if (testCase.shared_rules && testCase.strategy_rules) {
    const strategyRules = (testCase.strategy_rules as Record<string, ValidationRule[]>)[strategy] || [];
    return [...testCase.shared_rules, ...strategyRules];
  }
  return testCase.validation_rules;
}

// ============================================================================
// 评估主逻辑
// ============================================================================

async function loadTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(PROJECT_ROOT, "eval/design-points", "button-action", "test-cases", "button-action-ab.json");
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as VariableScopeTestCase[];
}

async function main() {
  console.log("=".repeat(70));
  console.log("Button 交互机制 A/B 对比 — 6维度量化评估");
  console.log("方案A: Button.action（互斥） vs 方案B: listeners + sendToLLM（统一）");
  console.log("=".repeat(70));

  let models = loadModelConfigs();
  const skipModels = (process.env.SKIP_MODELS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (skipModels.length > 0) {
    models = models.filter((m) => !skipModels.some((s) => m.name.includes(s)));
  }
  const onlyModel = process.env.ONLY_MODEL;
  if (onlyModel) {
    models = models.filter((m) => m.name === onlyModel);
  }
  if (models.length === 0) {
    console.error("\n错误: 未配置任何模型。");
    process.exit(1);
  }
  console.log(`\n模型: ${models.map((m) => m.displayName).join(", ")}`);

  const allTestCases = await loadTestCases();
  console.log(`测试用例: ${allTestCases.length} 个`);
  const simple = allTestCases.filter((tc) => tc.complexity === "simple");
  const medium = allTestCases.filter((tc) => tc.complexity === "medium");
  const complex_ = allTestCases.filter((tc) => tc.complexity === "complex");
  console.log(`  simple: ${simple.length} | medium: ${medium.length} | complex: ${complex_.length}`);

  await loadSummaries();

  const d4Cases = allTestCases.slice(0, D4_SAMPLE_SIZE);
  const d6Cases = allTestCases.slice(0, D6_SAMPLE_SIZE);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const reportsDir = resolveReportsDir("eval/design-points/button-action/reports");
  await mkdir(reportsDir, { recursive: true });

  const allEvaluations: StrategyEvaluation[] = [];

  for (const modelConfig of models) {
    for (const strategy of STRATEGIES) {
      console.log(`\n${"=".repeat(70)}`);
      console.log(`${modelConfig.displayName} | ${strategy}`);
      console.log(`${"=".repeat(70)}\n`);

      const systemPrompt = buildSystemPrompt(strategy);

      // Phase A
      console.log("--- Phase A: 主测试 ---\n");
      const mainResults: CaseResultWithLevels[] = [];
      for (let i = 0; i < allTestCases.length; i++) {
        const tc = allTestCases[i];
        const result = await runSingleCase(modelConfig, tc, systemPrompt, strategy, MAX_RETRIES);
        mainResults.push(result);
        const icon = result.passed ? "OK" : "XX";
        console.log(`  [${i + 1}/${allTestCases.length}] ${tc.id} ${tc.name} (${tc.complexity}) ${icon} [${result.tokens}t, ${(result.time_ms / 1000).toFixed(1)}s]`);
        if (!result.passed) {
          for (const err of result.errors) console.log(`    -> ${err}`);
        }
      }

      for (const [tierName, tierCases] of [["simple", simple], ["medium", medium], ["complex", complex_]] as const) {
        const tierResults = tierCases.map((tc) => mainResults.find((r) => r.id === tc.id)!).filter(Boolean);
        const tierPass = tierResults.filter((r) => r.passed).length;
        console.log(`  ${tierName}: ${tierPass}/${tierResults.length}`);
      }

      // Phase B: D4
      console.log("\n--- Phase B: D4 ---\n");
      const learningResults: Record<string, PerCaseResult[]> = {};
      learningResults["3"] = d4Cases.map((tc) => mainResults.find((mr) => mr.id === tc.id)! as PerCaseResult);

      for (const shotCount of [0, 1] as const) {
        console.log(`  ${shotCount}-shot...`);
        const shotResults: PerCaseResult[] = [];
        let skipped = false;
        for (const tc of d4Cases) {
          if (skipped) { shotResults.push(makeErrorResult(tc, "跳过")); continue; }
          try {
            const userPrompt = buildUserPrompt(tc, strategy, shotCount);
            const response = await callLLM(modelConfig, systemPrompt, userPrompt);
            const vResult = validate(response.content, tc, strategy);
            shotResults.push({
              id: tc.id, name: tc.name, category: tc.category, complexity: tc.complexity,
              passed: vResult.passed, tokens: response.tokens, time_ms: response.elapsedMs,
              retries: 0, errors: vResult.errors, raw_output: response.content, generated_dsl: vResult.generated,
            });
          } catch (e) {
            const msg = (e as Error).message;
            shotResults.push(makeErrorResult(tc, msg));
            if (msg.includes("429") || msg.includes("余额")) skipped = true;
          }
        }
        learningResults[String(shotCount)] = shotResults;
        const valid = shotResults.filter((r) => !r.errors[0]?.includes("跳过"));
        const acc = valid.length > 0 ? valid.filter((r) => r.passed).length / valid.length : 0;
        console.log(`    ${shotCount}-shot: ${(acc * 100).toFixed(1)}% (${valid.length}/${shotResults.length})`);
      }

      // Phase C: D6
      console.log("\n--- Phase C: D6 ---\n");
      const consistencyResults: Record<string, PerCaseResult[][]> = {};
      let d6Skipped = false;
      for (const tc of d6Cases) {
        if (d6Skipped) { consistencyResults[tc.id] = [[mainResults.find((r) => r.id === tc.id) as PerCaseResult]]; continue; }
        const group: PerCaseResult[][] = [];
        const first = mainResults.find((r) => r.id === tc.id);
        if (first) group.push([first as PerCaseResult]);
        for (let rep = 1; rep < D6_REPEATS; rep++) {
          try {
            const userPrompt = buildUserPrompt(tc, strategy, 3);
            const response = await callLLM(modelConfig, systemPrompt, userPrompt);
            const vResult = validate(response.content, tc, strategy);
            group.push([{
              id: tc.id, name: tc.name, category: tc.category, complexity: tc.complexity,
              passed: vResult.passed, tokens: response.tokens, time_ms: response.elapsedMs,
              retries: 0, errors: vResult.errors, raw_output: response.content, generated_dsl: vResult.generated,
            }]);
          } catch (e) {
            const msg = (e as Error).message;
            if (msg.includes("429") || msg.includes("余额")) { d6Skipped = true; break; }
          }
        }
        consistencyResults[tc.id] = group;
      }
      console.log(`  ${d6Cases.length} 用例 × ${D6_REPEATS} 次${d6Skipped ? " (部分跳过)" : ""}`);

      // Phase D
      console.log("\n--- Phase D: 评分 ---\n");
      const d1 = calcD1(mainResults);
      const d2 = calcD2(mainResults);
      const d3 = calcD3(mainResults, MAX_RETRIES);
      const shot0Acc = learningResults["0"].filter((r) => r.passed).length / learningResults["0"].length;
      const shot1Acc = learningResults["1"].filter((r) => r.passed).length / learningResults["1"].length;
      const shot3Acc = learningResults["3"].filter((r) => r.passed).length / learningResults["3"].length;
      const { score: d4, detail: lcDetail } = calcD4(shot0Acc, shot1Acc, shot3Acc);
      const d5 = calcD5(mainResults);
      const d6Groups = Object.values(consistencyResults).map((g) => g.flat());
      const { score: d6, detail: conDetail } = calcD6(d6Groups);
      const { score: maScore, grade: maGrade } = calcMA(d1, d2, d3, d4, d5, d6);

      const dimensions: DimensionScores = {
        d1_syntactic_accuracy: d1, d2_semantic_accuracy: d2, d3_generation_efficiency: d3,
        d4_learning_curve: d4, d5_edge_robustness: d5, d6_consistency: d6,
        ma_overall: maScore, ma_grade: maGrade,
        learning_curve: lcDetail, consistency_detail: conDetail,
      };

      console.log(`  D1: ${(d1 * 100).toFixed(1)}% | D2: ${(d2 * 100).toFixed(1)}% | D3: ${(d3 * 100).toFixed(1)}%`);
      console.log(`  D4: ${(d4 * 100).toFixed(1)}% (0:${(shot0Acc * 100).toFixed(0)} → 1:${(shot1Acc * 100).toFixed(0)} → 3:${(shot3Acc * 100).toFixed(0)})`);
      console.log(`  D5: ${(d5 * 100).toFixed(1)}% | D6: ${(d6 * 100).toFixed(1)}%`);
      console.log(`  MA: ${(maScore * 100).toFixed(1)}% (${maGrade})`);

      allEvaluations.push({
        strategy: strategy as any, model_name: modelConfig.displayName,
        total_cases: allTestCases.length, dimensions, main_results: mainResults,
        learning_results: learningResults, consistency_results: consistencyResults,
      });
    }
  }

  // 汇总
  console.log(`\n${"=".repeat(70)}`);
  console.log("A/B 对比汇总");
  console.log(`${"=".repeat(70)}\n`);

  for (const model of models) {
    console.log(`\n### ${model.displayName}\n`);
    console.log("| 维度 | 方案A: button-action | 方案B: listeners+sendToLLM |");
    console.log("|------|---------------------|---------------------------|");

    const a = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "button-action")!;
    const b = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "listeners-sendtollm")!;

    for (const [label, fn] of [
      ["D1 语法", (d: DimensionScores) => d.d1_syntactic_accuracy],
      ["D2 语义", (d: DimensionScores) => d.d2_semantic_accuracy],
      ["D3 效率", (d: DimensionScores) => d.d3_generation_efficiency],
      ["D4 学习", (d: DimensionScores) => d.d4_learning_curve],
      ["D5 边界", (d: DimensionScores) => d.d5_edge_robustness],
      ["D6 一致", (d: DimensionScores) => d.d6_consistency],
      ["**MA**", (d: DimensionScores) => d.ma_overall],
    ] as const) {
      console.log(`| ${label} | ${(fn(a.dimensions) * 100).toFixed(1)}% | ${(fn(b.dimensions) * 100).toFixed(1)}% |`);
    }
    console.log(`\n  A: ${a.dimensions.ma_grade} | B: ${b.dimensions.ma_grade}`);
  }

  // 保存报告
  const report: VariableScopeComparisonReport = {
    timestamp: new Date().toISOString(), protocol_version: "v2.0",
    evaluation_type: "button-action-ab-comparison",
    models: models.map((m) => m.displayName), total_cases: allTestCases.length,
    strategies: allEvaluations,
  };

  const jsonPath = resolve(reportsDir, `button-action-ab-${timestamp}.json`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");

  const mdPath = resolve(reportsDir, `button-action-ab-${timestamp}.md`);
  await writeFile(mdPath, buildMDReport(report), "utf-8");

  console.log(`\n报告: ${jsonPath}\n  ${mdPath}`);
}

// ============================================================================
// 辅助
// ============================================================================

async function runSingleCase(
  modelConfig: import("../core/types.js").LLMModelConfig,
  testCase: VariableScopeTestCase, systemPrompt: string,
  strategy: ButtonStrategy, maxRetries: number
): Promise<CaseResultWithLevels> {
  let passed = false, errors: string[] = [], retryCount = 0, tokens = 0, timeMs = 0;
  let rawOutput = "", generatedDsl: Record<string, unknown> | null = null;
  let levels = { l1_json_parsed: false, l2_structure_ok: false, l3_patterns_ok: false, l4_rules_ok: false };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const userPrompt = buildUserPrompt(testCase, strategy, 3);
      const response = await callLLM(modelConfig, systemPrompt, userPrompt);
      rawOutput = response.content; tokens = response.tokens; timeMs = response.elapsedMs; retryCount = attempt;
      const vResult = validate(rawOutput, testCase, strategy);
      passed = vResult.passed; errors = vResult.errors; generatedDsl = vResult.generated;
      levels = vResult.levels || levels;
      if (passed || attempt === maxRetries) break;
    } catch (e) {
      errors = [`LLM调用错误: ${(e as Error).message}`]; retryCount = attempt;
    }
  }
  return { id: testCase.id, name: testCase.name, category: testCase.category, complexity: testCase.complexity,
    passed, tokens, time_ms: timeMs, retries: retryCount, errors, raw_output: rawOutput, generated_dsl: generatedDsl, levels };
}

function buildMDReport(report: VariableScopeComparisonReport): string {
  const lines: string[] = [];
  lines.push("# Button 交互机制 A/B 对比评估报告");
  lines.push(`\n日期: ${report.timestamp.split("T")[0]} | 模型: ${report.models.join(", ")} | 用例: ${report.total_cases}`);
  lines.push(`\n方案A: Button.action（互斥，有 action 不走 listeners）`);
  lines.push(`方案B: listeners + sendToLLM（统一通用机制）\n`);

  for (const model of report.models) {
    const a = report.strategies.find((e) => e.model_name === model && e.strategy === "button-action")!;
    const b = report.strategies.find((e) => e.model_name === model && e.strategy === "listeners-sendtollm")!;

    lines.push(`## ${model}\n`);
    lines.push("| 维度 | 权重 | 方案A: action | 方案B: sendToLLM |");
    lines.push("|------|------|--------------|-----------------|");
    for (const [label, weight, fn] of [
      ["D1 语法", 0.20, (d: DimensionScores) => d.d1_syntactic_accuracy],
      ["D2 语义", 0.25, (d: DimensionScores) => d.d2_semantic_accuracy],
      ["D3 效率", 0.15, (d: DimensionScores) => d.d3_generation_efficiency],
      ["D4 学习", 0.15, (d: DimensionScores) => d.d4_learning_curve],
      ["D5 边界", 0.15, (d: DimensionScores) => d.d5_edge_robustness],
      ["D6 一致", 0.10, (d: DimensionScores) => d.d6_consistency],
    ] as const) {
      lines.push(`| ${label} | ${(weight * 100).toFixed(0)}% | ${(fn(a.dimensions) * 100).toFixed(1)}% | ${(fn(b.dimensions) * 100).toFixed(1)}% |`);
    }
    lines.push(`| **MA** | **100%** | **${(a.dimensions.ma_overall * 100).toFixed(1)}% (${a.dimensions.ma_grade})** | **${(b.dimensions.ma_overall * 100).toFixed(1)}% (${b.dimensions.ma_grade})** |`);

    // 失败用例
    for (const [name, eval_] of [["A", a], ["B", b]] as const) {
      const failed = eval_.main_results.filter((r) => !r.passed);
      if (failed.length > 0) {
        lines.push(`\n### 方案${name} 失败用例 (${failed.length}/${eval_.total_cases})\n`);
        for (const c of failed) {
          lines.push(`**${c.id} ${c.name}** (${c.complexity}): ${c.errors.join("; ")}`);
          if (c.raw_output) lines.push(`  \`${c.raw_output.substring(0, 200)}\``);
        }
      }
    }
    lines.push("");
  }

  lines.push("\n## 结论\n待根据评估数据填写\n");
  return lines.join("\n");
}

function makeErrorResult(tc: VariableScopeTestCase, errorMsg: string): PerCaseResult {
  return { id: tc.id, name: tc.name, category: tc.category, complexity: tc.complexity,
    passed: false, tokens: 0, time_ms: 0, retries: 0, errors: [errorMsg], raw_output: "", generated_dsl: null };
}

main().catch((e) => { console.error("错误:", e); process.exit(1); });
