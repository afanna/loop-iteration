import "dotenv/config";
import { loadModelConfigs, loadProtocolSummary, resolveReportsDir, TOOLKIT_ROOT } from "../config.js";
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

const MAX_RETRIES = 1;
const D4_SAMPLE_SIZE = 8;
const D6_SAMPLE_SIZE = 6;
const D6_REPEATS = 3;

// ============================================================================
// 规则
// ============================================================================

function getRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段（如"Extended.Text"、"Extended.Button"）。',
    '3. 不要把组件名当作key（错误：{"Extended.Text": {...}}），正确：{"component": "Extended.Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    '5. Extended.Text必须包含"text"。Extended.Button必须包含"label"。Extended.TextInput必须包含"placeholder"和"text"。',
    '6. 动态值整个用{{ }}包裹：纯动态"{{ $var }}"，混合文本"{{ \'Hello, \' + $var }}"。',
    "7. 每个{{ }}仅包含一个完整表达式，不支持在一对双引号中使用多个{{ }}表达式。",
    "8. 变量用$前缀，函数直接调用无前缀。",
    "9. 事件名直接作为组件属性（如onClick、onChange），值是EventHandler数组 [{id, call, args, condition?}]，按顺序执行。不要使用listeners包装层。",
    '10. theme字段使用固定字符串值（如"heading1"），不使用{{ }}。',
    "",
    "## 表达式使用范围约束（非常重要）",
    "",
    "表达式{{ }}只能在以下位置使用（值的位置）：",
    "- 组件的值属性：text, content, condition, src, value, isOn, path等",
    "- styles对象内的属性值：fontSize, fontColor等",
    "- 事件action的args参数值",
    "- 条件action的if字段",
    "",
    "以下字段绝对不能使用表达式{{ }}（必须用固定值）：",
    "- component（组件类型名称）",
    "- id（组件唯一标识）",
    "- theme（主题名称）",
    "- label（按钮文字）",
    "- placeholder（输入框提示文字）",
    "- children / childrenIf / childrenElse（子组件id引用）",
    "- action（动作名称）",
    "- as（变量绑定名）",
    "",
    "表达式只能出现在JSON的value位置，绝对不能出现在key位置。",
  ];
}

const FEW_SHOT_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - Extended组件text用表达式：",
  '输入："生成Extended.Text，id为greeting，显示$username"',
  "输出：",
  '{"component": "Extended.Text", "id": "greeting", "text": "{{ $username }}"}',
  "",
  "示例2 - id和label必须固定值：",
  '输入："生成Extended.Button，id为submit-btn，label为提交，点击调用submitData"',
  "输出：",
  '{"component": "Extended.Button", "id": "submit-btn", "label": "提交", "onClick": [{"action": "submitData"}]}',
  "",
  "示例3 - styles混合使用：",
  '输入："生成Extended.Text，id为title，显示$title，fontSize用$size变量"',
  "输出：",
  '{"component": "Extended.Text", "id": "title", "text": "{{ $title }}", "styles": {"fontSize": "{{ $size }}"}}',
].join("\n");

// ============================================================================
// Prompt 构建
// ============================================================================

let _summary = "";

async function loadSummary(): Promise<void> {
  const path = resolve(TOOLKIT_ROOT, "prompts", "protocol-inline-summary.md");
  _summary = await readFile(path, "utf-8");
}

function buildSystemPrompt(): string {
  return [
    "你是鸿蒙智能体UI协议v2.0的DSL生成器。严格按照下面的协议规范生成JSON。",
    "所有组件必须使用Extended.前缀（如Extended.Text、Extended.Button）。",
    "",
    "# 协议规范",
    "",
    _summary,
    "",
    "# 重要规则",
    "",
    ...getRules(),
  ].join("\n");
}

function buildUserPrompt(
  testCase: VariableScopeTestCase,
  shotCount: number = 3,
): string {
  let examples = "";
  if (shotCount >= 3) {
    examples = FEW_SHOT_EXAMPLES;
  } else if (shotCount === 1) {
    const lines = FEW_SHOT_EXAMPLES.split("\n");
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
    const inlineRules = testCase.strategy_rules["inline"] || [];
    return [...testCase.shared_rules, ...inlineRules];
  }
  return testCase.validation_rules;
}

// ============================================================================
// 测试用例加载
// ============================================================================

async function loadTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(resolve(TOOLKIT_ROOT, ".."), "eval/design-points", "expression-scope", "test-cases", "expression-scope.json");
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as VariableScopeTestCase[];
}

// ============================================================================
// 评估主逻辑
// ============================================================================

async function main() {
  console.log("=".repeat(70));
  console.log("表达式使用范围约束 — 6维度量化评估 (inline)");
  console.log("设计点13：LLM对表达式范围约束的遵守能力");
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

  const allTestCases = await loadTestCases();
  console.log(`已加载 ${allTestCases.length} 个测试用例`);

  const edgeCases = allTestCases.filter((tc) => tc.is_edge === true);
  console.log(`  其中边界用例: ${edgeCases.length} 个`);

  await loadSummary();
  const systemPrompt = buildSystemPrompt();

  const d4Cases = allTestCases.slice(0, D4_SAMPLE_SIZE);
  const d6Cases = allTestCases.slice(0, D6_SAMPLE_SIZE);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const reportsDir = resolveReportsDir("eval/design-points/expression-scope/reports");
  await mkdir(reportsDir, { recursive: true });

  const allEvaluations: StrategyEvaluation[] = [];

  for (const modelConfig of models) {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`${modelConfig.displayName}`);
    console.log(`${"=".repeat(70)}\n`);

    // Phase A: 主测试 (D1/D2/D3/D5)
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
          shotResults.push(makeErrorResult(tc, "跳过"));
          continue;
        }
        try {
          const userPrompt = buildUserPrompt(tc, shotCount);
          const response = await callLLM(modelConfig, systemPrompt, userPrompt);
          const vResult = validate(response.content, tc, "inline");

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
      console.log(`    ${shotCount}-shot 准确率: ${(acc * 100).toFixed(1)}%`);
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
          const vResult = validate(response.content, tc, "inline");

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
    console.log(`  完成 ${d6Cases.length} 用例 × ${D6_REPEATS} 次${d6Skipped ? " (部分跳过)" : ""}`);

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
      d1_syntactic_accuracy: d1, d2_semantic_accuracy: d2, d3_generation_efficiency: d3,
      d4_learning_curve: d4, d5_edge_robustness: d5, d6_consistency: d6,
      ma_overall: maScore, ma_grade: maGrade,
      learning_curve: lcDetail, consistency_detail: conDetail,
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
      strategy: "inline",
      model_name: modelConfig.displayName,
      total_cases: allTestCases.length,
      dimensions,
      main_results: mainResults,
      learning_results: learningResults,
      consistency_results: consistencyResults,
    });
  }

  // 汇总对比
  console.log(`\n${"=".repeat(70)}`);
  console.log("模型对比汇总");
  console.log(`${"=".repeat(70)}\n`);

  console.log("| 维度 | 权重 | " + models.map((m) => m.displayName).join(" | ") + " |");
  console.log("|------|------|" + models.map(() => "------").join("|") + "|");

  const dimFns: [string, number, (d: DimensionScores) => number][] = [
    ["D1 语法", 0.20, (d) => d.d1_syntactic_accuracy],
    ["D2 语义", 0.25, (d) => d.d2_semantic_accuracy],
    ["D3 效率", 0.15, (d) => d.d3_generation_efficiency],
    ["D4 学习", 0.15, (d) => d.d4_learning_curve],
    ["D5 边界", 0.15, (d) => d.d5_edge_robustness],
    ["D6 一致", 0.10, (d) => d.d6_consistency],
    ["**MA**", 1.0, (d) => d.ma_overall],
  ];

  for (const [label, weight, fn] of dimFns) {
    const vals = allEvaluations.map((e) => `${(fn(e.dimensions) * 100).toFixed(1)}%`);
    console.log(`| ${label} | ${(weight * 100).toFixed(0)}% | ${vals.join(" | ")} |`);
  }

  // 生成报告
  const report: VariableScopeComparisonReport = {
    timestamp: new Date().toISOString(),
    protocol_version: "v2.0",
    evaluation_type: "expression-scope-constraint-6d",
    models: models.map((m) => m.displayName),
    total_cases: allTestCases.length,
    strategies: allEvaluations,
  };

  const jsonPath = resolve(reportsDir, `expr-scope-${timestamp}.json`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");

  const mdPath = resolve(reportsDir, `expr-scope-${timestamp}.md`);
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

      const vResult = validate(rawOutput, testCase, "inline");
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
  lines.push("# 表达式使用范围约束 — 6维度量化评估报告");
  lines.push(`\n日期: ${report.timestamp.split("T")[0]}`);
  lines.push(`协议版本: ${report.protocol_version}`);
  lines.push(`测试用例: ${report.total_cases} 个`);
  lines.push(`模型: ${report.models.join(", ")}`);
  lines.push(`包装方式: inline (\`{{ }}\`)`);
  lines.push(`评估类型: 设计点13 — 表达式使用范围约束\n`);
  lines.push("## 设计背景\n");
  lines.push("当前协议 3.5 节规定了7条表达式使用约束：");
  lines.push("1. 表达式仅支持扩展组件");
  lines.push("2. 限定仅在 updateComponents 消息中支持表达式");
  lines.push("3. A2UI 原本的 path 属性不支持表达式");
  lines.push("4. component、id 属性不可使用");
  lines.push("5. 交互行为中的 id 和 type 不可使用");
  lines.push("6. 表达式只能使用在值上，不能在 key 中使用");
  lines.push("7. 具体可使用表达式的场景参见 catalog 文件\n");
  lines.push("本评估验证 LLM 能否自然遵守这些约束。\n");

  for (const eval_ of report.strategies) {
    lines.push(`## ${eval_.model_name}\n`);
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
      lines.push("| 指标 | 得分 |");
      lines.push("|------|------|");
      lines.push(`| 结构一致率 | ${(eval_.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% |`);
      lines.push(`| 语义等价率 | ${(eval_.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% |`);
    }

    const failed = eval_.main_results.filter((r) => !r.passed);
    if (failed.length > 0) {
      lines.push(`\n### 失败用例 (${failed.length}/${eval_.total_cases})\n`);
      for (const c of failed) {
        lines.push(`**${c.id} ${c.name}** (${c.complexity})`);
        for (const err of c.errors) lines.push(`  - ${err}`);
        lines.push("");
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
    id: tc.id, name: tc.name, category: tc.category, complexity: tc.complexity,
    passed: false, tokens: 0, time_ms: 0, retries: 0, errors: [errorMsg],
    raw_output: "", generated_dsl: null,
  };
}

main().catch((e) => {
  console.error("运行错误:", e);
  process.exit(1);
});
