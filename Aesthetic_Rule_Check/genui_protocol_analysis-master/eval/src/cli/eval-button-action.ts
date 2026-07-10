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

type ButtonActionStrategy = "button-action";

const STRATEGY: ButtonActionStrategy = "button-action";
const MAX_RETRIES = 1;
const D4_SHOT_LEVELS = [0, 1, 3] as const;
const D6_REPEATS = 3;
const D4_SAMPLE_SIZE = 10;
const D6_SAMPLE_SIZE = 8;

// ============================================================================
// 策略规则 — Button.action + listeners 共存设计
// ============================================================================

function getButtonActionRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段（如"Text"、"Button"、"Column"）。',
    '3. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    '5. Text组件必须包含"content"。Button必须包含"label"。TextInput必须包含"placeholder"。',
    '6. 动态值整个用{{ }}包裹：纯动态"{{ $var }}"，混合文本"{{ \'Hello, \' + $var }}"。',
    "7. 每个{{ }}仅包含一个完整表达式，不支持在一对双引号中使用多个{{ }}表达式。",
    "8. 变量用$前缀，函数直接调用无前缀（如formatNumber($price, 2)）。",
    "9. 【关键】Button组件的交互能力分为两种机制：",
    "   - **action属性**（表单提交专用）：用于向服务端提交表单或调用本地函数",
    '     格式1（服务端事件）：{ "action": { "event": { "name": "事件名", "context": { "key": "value" } } } }',
    '     格式2（本地函数）：{ "action": { "functionCall": { "call": "函数名", "args": { "key": "value" } } } }',
    "   - **listeners属性**（通用交互）：用于UI反馈、导航、数据操作等非提交场景",
    '     格式："listeners": { "onClick": [{ "action": "行为名", "args": {...} }] }',
    "   - action的优先级高于listeners",
    "   - 两者可以同时存在于同一个Button上",
    "   - 示例（同时使用）：",
    '     {"id": "btn", "component": "Button", "label": "提交",',
    '      "action": { "event": { "name": "submitForm", "context": { "email": "{{ $__dataModel.form.email }}" } } },',
    '      "listeners": { "onClick": [',
    '        {"action": "validate", "args": {"data": "{{ $__dataModel.form }}"}, "as": "$result"},',
    '        {"action": "showToast", "args": {"message": "正在提交..."}}',
    "      ]}}",
    "10. 其他组件（Toggle、TextInput等）只有listeners，没有action属性",
    "11. 可用行为：setDataModel, navigate, showToast, validate, openUrl, sendToLLM",
    '12. theme字段使用固定字符串值（如"heading1"），不使用{{ }}。',
  ];
}

// ============================================================================
// Few-shot 示例
// ============================================================================

const BUTTON_ACTION_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 表单提交（使用action）：",
  '输入："生成Button，id为\'submitBtn\'，label为\'提交\'，点击后提交表单（事件名submitForm）"',
  "输出：",
  '{"id": "submitBtn", "component": "Button", "label": "提交", "action": {"event": {"name": "submitForm"}}}',
  "",
  "示例2 - 普通交互（使用listeners）：",
  '输入："生成Button，id为\'btn\'，label为\'提示\'，点击后showToast\'成功\'"',
  "输出：",
  '{"id": "btn", "component": "Button", "label": "提示", "listeners": {"onClick": [{"action": "showToast", "args": {"message": "成功"}}]}}',
  "",
  "示例3 - 表单提交+UI反馈（action + listeners 共存）：",
  '输入："生成Button，id为\'submitBtn\'，label为\'提交\'，通过action提交表单（事件名submitOrder，携带userId为user001），同时通过listeners显示Toast\'提交中\'"',
  "输出：",
  '{"id": "submitBtn", "component": "Button", "label": "提交", "action": {"event": {"name": "submitOrder", "context": {"userId": "user001"}}}, "listeners": {"onClick": [{"action": "showToast", "args": {"message": "提交中"}}]}}',
].join("\n");

// ============================================================================
// Prompt 构建
// ============================================================================

let _baseSummary = "";

async function loadSummaries(): Promise<void> {
  const path = resolve(TOOLKIT_ROOT, "prompts", "protocol-inline-summary.md");
  _baseSummary = await readFile(path, "utf-8");
}

function buildSystemPrompt(): string {
  const rules = getButtonActionRules();

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
  shotCount: number = 3,
): string {
  let examples = "";
  if (shotCount >= 3) {
    examples = BUTTON_ACTION_EXAMPLES;
  } else if (shotCount === 1) {
    const lines = BUTTON_ACTION_EXAMPLES.split("\n");
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

  const rules = resolveRules(testCase);
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

function resolveRules(testCase: VariableScopeTestCase): ValidationRule[] {
  if (testCase.shared_rules && testCase.strategy_rules) {
    const strategyRules = (testCase.strategy_rules as Record<string, ValidationRule[]>)[STRATEGY] || [];
    return [...testCase.shared_rules, ...strategyRules];
  }
  return testCase.validation_rules;
}

// ============================================================================
// 评估主逻辑
// ============================================================================

async function loadButtonActionTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(PROJECT_ROOT, "eval/design-points", "button-action", "test-cases", "button-action.json");
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as VariableScopeTestCase[];
}

async function main() {
  console.log("=".repeat(70));
  console.log("Button.action 亲和性评估 — 6维度量化评估");
  console.log("测试：LLM 能否正确区分 action（表单提交）和 listeners（通用交互）");
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

  const allTestCases = await loadButtonActionTestCases();
  console.log(`已加载 ${allTestCases.length} 个Button.action测试用例`);

  const edgeCases = allTestCases.filter((tc) => tc.is_edge === true);
  console.log(`  其中边界用例: ${edgeCases.length} 个`);

  const simple = allTestCases.filter((tc) => tc.complexity === "simple");
  const medium = allTestCases.filter((tc) => tc.complexity === "medium");
  const complex_ = allTestCases.filter((tc) => tc.complexity === "complex");
  console.log(`  simple: ${simple.length} | medium: ${medium.length} | complex: ${complex_.length}`);

  // 统计用例类型分布
  const actionOnly = allTestCases.filter((tc) => tc.shared_rules?.some((r) => r.field === "action") && !tc.shared_rules?.some((r) => r.field === "listeners"));
  const listenersOnly = allTestCases.filter((tc) => tc.shared_rules?.some((r) => r.field === "listeners") && !tc.shared_rules?.some((r) => r.field === "action"));
  const bothPresent = allTestCases.filter((tc) => tc.shared_rules?.some((r) => r.field === "action") && tc.shared_rules?.some((r) => r.field === "listeners"));
  console.log(`  action-only: ${actionOnly.length} | listeners-only: ${listenersOnly.length} | both: ${bothPresent.length}`);

  await loadSummaries();

  const d4Cases = allTestCases.slice(0, D4_SAMPLE_SIZE);
  const d6Cases = allTestCases.slice(0, D6_SAMPLE_SIZE);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const reportsDir = resolveReportsDir("eval/design-points/button-action/reports");
  await mkdir(reportsDir, { recursive: true });

  const allEvaluations: StrategyEvaluation[] = [];

  for (const modelConfig of models) {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`${modelConfig.displayName} | button-action`);
    console.log(`${"=".repeat(70)}\n`);

    const systemPrompt = buildSystemPrompt();

    // Phase A: 主测试
    console.log("--- Phase A: 主测试 (D1/D2/D3/D5) ---\n");
    const mainResults: CaseResultWithLevels[] = [];

    for (let i = 0; i < allTestCases.length; i++) {
      const tc = allTestCases[i];
      const result = await runSingleCase(modelConfig, tc, systemPrompt, MAX_RETRIES);
      mainResults.push(result);

      const icon = result.passed ? "OK" : "XX";
      const timeStr = (result.time_ms / 1000).toFixed(1);
      console.log(`  [${i + 1}/${allTestCases.length}] ${tc.id} ${tc.name} (${tc.complexity}) ${icon} [${result.tokens}t, ${timeStr}s]`);
      if (!result.passed) {
        for (const err of result.errors) console.log(`    -> ${err}`);
      }
    }

    for (const [tierName, tierCases] of [["simple", simple], ["medium", medium], ["complex", complex_]] as const) {
      const tierResults = tierCases.map((tc) => mainResults.find((r) => r.id === tc.id)!).filter(Boolean);
      const tierPass = tierResults.filter((r) => r.passed).length;
      console.log(`  ${tierName}: ${tierPass}/${tierResults.length} 通过`);
    }

    // 按用例类型统计
    console.log("\n  按交互类型统计:");
    for (const [typeName, typeCases] of [["action-only", actionOnly], ["listeners-only", listenersOnly], ["both", bothPresent]] as const) {
      const typeResults = typeCases.map((tc) => mainResults.find((r) => r.id === tc.id)!).filter(Boolean);
      const typePass = typeResults.filter((r) => r.passed).length;
      console.log(`  ${typeName}: ${typePass}/${typeResults.length} 通过`);
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
          const userPrompt = buildUserPrompt(tc, shotCount);
          const response = await callLLM(modelConfig, systemPrompt, userPrompt);
          const vResult = validate(response.content, tc, STRATEGY);

          shotResults.push({
            id: tc.id, name: tc.name, category: tc.category, complexity: tc.complexity,
            passed: vResult.passed, tokens: response.tokens, time_ms: response.elapsedMs,
            retries: 0, errors: vResult.errors, raw_output: response.content, generated_dsl: vResult.generated,
          });
        } catch (e) {
          const msg = (e as Error).message;
          console.log(`    API错误: ${msg}`);
          shotResults.push(makeErrorResult(tc, msg));
          if (msg.includes("429") || msg.includes("余额")) skipped = true;
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
      if (firstResult) group.push([firstResult as PerCaseResult]);

      for (let rep = 1; rep < D6_REPEATS; rep++) {
        try {
          const userPrompt = buildUserPrompt(tc, 3);
          const response = await callLLM(modelConfig, systemPrompt, userPrompt);
          const vResult = validate(response.content, tc, STRATEGY);

          group.push([{
            id: tc.id, name: tc.name, category: tc.category, complexity: tc.complexity,
            passed: vResult.passed, tokens: response.tokens, time_ms: response.elapsedMs,
            retries: 0, errors: vResult.errors, raw_output: response.content, generated_dsl: vResult.generated,
          }]);
        } catch (e) {
          const msg = (e as Error).message;
          console.log(`    API错误: ${msg}`);
          if (msg.includes("429") || msg.includes("余额")) { d6Skipped = true; break; }
        }
      }
      consistencyResults[tc.id] = group;
    }
    console.log(`  完成 ${d6Cases.length} 个用例 × ${D6_REPEATS} 次一致性测试${d6Skipped ? " (部分跳过)" : ""}`);

    // Phase D: 计算评分
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
      strategy: STRATEGY as any,
      model_name: modelConfig.displayName,
      total_cases: allTestCases.length,
      dimensions,
      main_results: mainResults,
      learning_results: learningResults,
      consistency_results: consistencyResults,
    });
  }

  // ============================================================
  // 生成报告
  // ============================================================
  console.log(`\n${"=".repeat(70)}`);
  console.log("评估汇总");
  console.log(`${"=".repeat(70)}\n`);

  for (const model of models) {
    const eval_ = allEvaluations.find((e) => e.model_name === model.displayName)!;
    console.log(`\n### ${model.displayName}\n`);
    console.log(`  MA: ${(eval_.dimensions.ma_overall * 100).toFixed(1)}% (${eval_.dimensions.ma_grade})`);
    console.log(`  D1: ${(eval_.dimensions.d1_syntactic_accuracy * 100).toFixed(1)}% | D2: ${(eval_.dimensions.d2_semantic_accuracy * 100).toFixed(1)}% | D3: ${(eval_.dimensions.d3_generation_efficiency * 100).toFixed(1)}%`);
    console.log(`  D4: ${(eval_.dimensions.d4_learning_curve * 100).toFixed(1)}% | D5: ${(eval_.dimensions.d5_edge_robustness * 100).toFixed(1)}% | D6: ${(eval_.dimensions.d6_consistency * 100).toFixed(1)}%`);

    // 混淆分析
    const failed = eval_.main_results.filter((r) => !r.passed);
    if (failed.length > 0) {
      console.log(`\n  失败用例 (${failed.length}/${eval_.total_cases}):`);
      for (const c of failed) {
        console.log(`    ${c.id} ${c.name}: ${c.errors.join("; ")}`);
      }
    }
  }

  const report: VariableScopeComparisonReport = {
    timestamp: new Date().toISOString(),
    protocol_version: "v2.0",
    evaluation_type: "button-action-6d",
    models: models.map((m) => m.displayName),
    total_cases: allTestCases.length,
    strategies: allEvaluations,
  };

  const jsonPath = resolve(reportsDir, `button-action-eval-${timestamp}.json`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");

  const mdPath = resolve(reportsDir, `button-action-eval-${timestamp}.md`);
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
      const userPrompt = buildUserPrompt(testCase, 3);
      const response = await callLLM(modelConfig, systemPrompt, userPrompt);
      rawOutput = response.content;
      tokens = response.tokens;
      timeMs = response.elapsedMs;
      retryCount = attempt;

      const vResult = validate(rawOutput, testCase, STRATEGY);
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
    id: testCase.id, name: testCase.name, category: testCase.category, complexity: testCase.complexity,
    passed, tokens, time_ms: timeMs, retries: retryCount, errors,
    raw_output: rawOutput, generated_dsl: generatedDsl, levels,
  };
}

function buildMarkdownReport(report: VariableScopeComparisonReport): string {
  const lines: string[] = [];
  lines.push("# Button.action 亲和性评估报告");
  lines.push(`\n日期: ${report.timestamp.split("T")[0]}`);
  lines.push(`协议版本: ${report.protocol_version}`);
  lines.push(`测试用例: ${report.total_cases} 个`);
  lines.push(`模型: ${report.models.join(", ")}`);
  lines.push(`\n## 评估目标\n`);
  lines.push("验证 LLM 能否在 Button 组件上正确区分使用：");
  lines.push("- `action` 属性：用于表单提交（`{event: {name, context}}` 或 `{functionCall: {call, args}}`）");
  lines.push("- `listeners` 属性：用于通用交互（Toast、导航、数据操作等）");
  lines.push("- 两者同时存在时，`action` 优先级高于 `listeners`");

  for (const eval_ of report.strategies) {
    lines.push(`\n## ${eval_.model_name}\n`);
    lines.push("### 6维度评分\n");
    lines.push("| 维度 | 权重 | 得分 |");
    lines.push("|------|------|------|");

    const entries: [string, number, number][] = [
      ["D1 语法准确率", 0.20, eval_.dimensions.d1_syntactic_accuracy],
      ["D2 语义准确率", 0.25, eval_.dimensions.d2_semantic_accuracy],
      ["D3 生成效率", 0.15, eval_.dimensions.d3_generation_efficiency],
      ["D4 学习曲线", 0.15, eval_.dimensions.d4_learning_curve],
      ["D5 边界鲁棒性", 0.15, eval_.dimensions.d5_edge_robustness],
      ["D6 一致稳定性", 0.10, eval_.dimensions.d6_consistency],
    ];

    for (const [label, weight, score] of entries) {
      lines.push(`| ${label} | ${(weight * 100).toFixed(0)}% | ${(score * 100).toFixed(1)}% |`);
    }
    lines.push(`| **MA综合** | **100%** | **${(eval_.dimensions.ma_overall * 100).toFixed(1)}% (${eval_.dimensions.ma_grade})** |`);

    if (eval_.dimensions.learning_curve) {
      lines.push("\n### D4 学习曲线明细\n");
      lines.push("| shot数 | 准确率 |");
      lines.push("|--------|--------|");
      lines.push(`| 0-shot | ${(eval_.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 1-shot | ${(eval_.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 3-shot | ${(eval_.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% |`);
    }

    if (eval_.dimensions.consistency_detail) {
      lines.push("\n### D6 一致性明细\n");
      lines.push("| 指标 | 值 |");
      lines.push("|------|------|");
      lines.push(`| 结构一致率 | ${(eval_.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% |`);
      lines.push(`| 语义等价率 | ${(eval_.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% |`);
    }

    // 混淆分析
    const failed = eval_.main_results.filter((r) => !r.passed);
    if (failed.length > 0) {
      lines.push(`\n### 失败用例 (${failed.length}/${eval_.total_cases})\n`);
      for (const c of failed) {
        lines.push(`**${c.id} ${c.name}** (${c.complexity})`);
        for (const err of c.errors) lines.push(`  - ${err}`);
        if (c.raw_output) lines.push(`  - 原始输出: \`${c.raw_output.substring(0, 300)}\``);
        lines.push("");
      }
    }

    // 逐用例通过情况
    lines.push("\n### 逐用例通过情况\n");
    lines.push("| ID | 名称 | 复杂度 | 类型 | 通过 | 错误 |");
    lines.push("|----|------|--------|------|------|------|");
    for (const c of eval_.main_results) {
      const type = c.raw_output.includes('"action"') && c.raw_output.includes('"listeners"') ? "both"
        : c.raw_output.includes('"action"') ? "action"
        : c.raw_output.includes('"listeners"') ? "listeners"
        : "none";
      lines.push(`| ${c.id} | ${c.name} | ${c.complexity} | ${type} | ${c.passed ? "✓" : "✗"} | ${c.errors.length > 0 ? c.errors[0].substring(0, 50) : "-"} |`);
    }
  }

  lines.push("\n## 结论\n");
  lines.push("_待根据评估数据填写_\n");

  return lines.join("\n");
}

function makeErrorResult(tc: VariableScopeTestCase, errorMsg: string): PerCaseResult {
  return {
    id: tc.id, name: tc.name, category: tc.category, complexity: tc.complexity,
    passed: false, tokens: 0, time_ms: 0, retries: 0,
    errors: [errorMsg], raw_output: "", generated_dsl: null,
  };
}

main().catch((e) => {
  console.error("运行错误:", e);
  process.exit(1);
});
