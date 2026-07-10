import "dotenv/config";
import { loadModelConfigs, loadExprDatatypeV2TestCases, resolveReportsDir, TOOLKIT_ROOT } from "../config.js";
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

const STRATEGY: ScopeStrategy = "protocol";
const MAX_RETRIES = 1;
const D4_SHOT_LEVELS = [0, 1, 3] as const;
const D6_REPEATS = 3;
const D4_SAMPLE_SIZE = 10;
const D6_SAMPLE_SIZE = 8;

// ============================================================================
// 协议规则（直接来自鸿蒙A2UI协议 4.4.2 + 4.4.6）
// ============================================================================

function getProtocolRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段（如"Text"、"Button"、"Column"）。',
    '3. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    '5. Text组件必须包含"content"。Button必须包含"label"。TextInput必须包含"placeholder"。',
    '6. 动态值整个用{{ }}包裹：纯动态"{{ $var }}"，混合文本"{{ \'Hello, \' + $var }}"。',
    "7. 每个{{ }}仅包含一个完整表达式，不支持在一对双引号中使用多个{{ }}表达式。",
    "8. 变量用$前缀，函数直接调用无前缀（如formatNumber($price, 2)）。",
    "9. 【关键】类型系统（来自协议 4.4.2 + 4.4.6）：",
    "   - 字符串字面量用单引号：'hello'、'件'、'元'",
    "   - 数字字面量直接写：42、3.14、0",
    "   - 布尔字面量：true、false（必须小写）",
    "   - +运算符拼接：`共` + $count + `件`（使用+运算符拼接）",
    "",
    "   类型转换规则（自动）：",
    "   - string + number → number转string，拼接（如 '共' + 5 → '共5'）",
    "   - string + boolean → boolean转string，拼接",
    "   - number + string → number转string，拼接（如 10 + '5' → '105'）",
    "   - boolean + number → boolean转number（true=1, false=0）",
    "   - !value → 转boolean，取反",
    "",
    "   常见模式：",
    "   - 数字与文字拼接推荐用+运算符：'共' + $count + '件'",
    "   - 也可直接用 +：$count + '件' 或 '共' + $count（symmetric，均拼接）",
    "   - 布尔值用在三元条件中：$isVip ? 'VIP' : 'Normal'",
    "   - 数字比较直接用运算符：$score >= 60",
    '10. theme字段使用固定字符串值（如"heading1"），不使用{{ }}。',
  ];
}

// ============================================================================
// Few-shot 示例
// ============================================================================

const PROTOCOL_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 简单变量：",
  '输入："生成Text显示$username"',
  "输出：",
  '{"component": "Text", "content": "{{ $username }}"}',
  "",
  "示例2 - 字符串+数字拼接（+运算符拼接）：",
  '输入："生成Text显示\'共\'加上$count加上\'件\'"',
  "输出：",
  '{"component": "Text", "content": "{{ \'共\' + $count + \'件\' }}"}',
  "",
  "示例3 - 布尔条件+数字+字符串：",
  '输入："生成Text，如果$isVip为true显示$discount加上\'折优惠\'，否则显示\'无折扣\'"',
  "输出：",
  '{"component": "Text", "content": "{{ $isVip ? $discount + \'折优惠\' : \'无折扣\' }}"}',
  "",
  "示例4 - 算术运算+拼接：",
  '输入："生成Text显示($price * $quantity)加上\'元\'"',
  "输出：",
  '{"component": "Text", "content": "{{ $price * $quantity + \'元\' }}"}',
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
  return [
    "你是鸿蒙智能体UI协议的DSL生成器。严格按照下面的协议规范生成JSON。",
    "",
    "# 协议规范",
    "",
    _baseSummary,
    "",
    "# 重要规则",
    "",
    ...getProtocolRules(),
  ].join("\n");
}

function buildUserPrompt(
  testCase: VariableScopeTestCase,
  shotCount: number = 3,
): string {
  let examples = "";
  if (shotCount >= 3) {
    examples = PROTOCOL_EXAMPLES;
  } else if (shotCount === 1) {
    const lines = PROTOCOL_EXAMPLES.split("\n");
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
  // shotCount === 0 → no examples

  // 收集验证规则
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
    const strategyRules = testCase.strategy_rules[STRATEGY] || [];
    return [...testCase.shared_rules, ...strategyRules];
  }
  return testCase.validation_rules;
}

// ============================================================================
// 评估主逻辑
// ============================================================================

async function main() {
  console.log("=".repeat(70));
  console.log("#11 表达式数据类型 — 协议验证评估");
  console.log("验证鸿蒙A2UI协议 4.4.2 + 4.4.6 类型系统的模型亲和性");
  console.log("=".repeat(70));

  // 1. 加载模型配置
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

  // 2. 加载测试用例
  const allTestCases = await loadExprDatatypeV2TestCases();
  console.log(`已加载 ${allTestCases.length} 个验证测试用例`);

  const simpleCases = allTestCases.filter((tc) => tc.complexity === "simple");
  const mediumCases = allTestCases.filter((tc) => tc.complexity === "medium");
  const complexCases = allTestCases.filter((tc) => tc.complexity === "complex");
  const edgeCases = allTestCases.filter((tc) => tc.is_edge === true);
  const riskCases = allTestCases.filter((tc) => (tc as any).is_risk === true);
  console.log(`  simple: ${simpleCases.length} | medium: ${mediumCases.length} | complex: ${complexCases.length}`);
  console.log(`  边界用例: ${edgeCases.length} | 风险用例: ${riskCases.length}`);

  // 3. 加载协议摘要
  await loadSummaries();

  const d4Cases = allTestCases.slice(0, D4_SAMPLE_SIZE);
  const d6Cases = allTestCases.slice(0, D6_SAMPLE_SIZE);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const reportsDir = resolveReportsDir("eval/design-points/expression-datatype/reports");
  await mkdir(reportsDir, { recursive: true });

  const allEvaluations: StrategyEvaluation[] = [];

  // ============================================================
  // 对每个模型运行验证评估（单策略）
  // ============================================================
  for (const modelConfig of models) {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`${modelConfig.displayName} | protocol (协议验证)`);
    console.log(`${"=".repeat(70)}\n`);

    const systemPrompt = buildSystemPrompt();

    // ============================================================
    // Phase A: 主测试 (D1/D2/D3/D5)
    // ============================================================
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

    // 按类别输出统计
    for (const [catName, catCases] of [
      ["A 字面量语法", simpleCases],
      ["B 转换规则", mediumCases],
      ["C 转换+运算符", complexCases.filter((tc) => !tc.is_edge)],
      ["D 边界/风险", edgeCases],
    ] as const) {
      const catResults = catCases.map((tc) => mainResults.find((r) => r.id === tc.id)!).filter(Boolean);
      const catPass = catResults.filter((r) => r.passed).length;
      console.log(`  ${catName}: ${catPass}/${catResults.length} 通过`);
    }

    // D5: 边界用例

    // ============================================================
    // Phase B: 学习曲线 (D4)
    // ============================================================
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

    // ============================================================
    // Phase C: 一致性 (D6)
    // ============================================================
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

    // ============================================================
    // Phase D: 计算6维度评分
    // ============================================================
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
      strategy: STRATEGY,
      model_name: modelConfig.displayName,
      total_cases: allTestCases.length,
      dimensions,
      main_results: mainResults,
      learning_results: learningResults,
      consistency_results: consistencyResults,
    });
  }

  // ============================================================
  // 风险分析
  // ============================================================
  console.log(`\n${"=".repeat(70)}`);
  console.log("类型转换规则验证（symmetric JS风格）");
  console.log(`${"=".repeat(70)}\n`);

  const riskIds = ["B03", "D01", "D03"];
  for (const eval_ of allEvaluations) {
    console.log(`${eval_.model_name}:`);
    for (const riskId of riskIds) {
      const r = eval_.main_results.find((mr) => mr.id === riskId);
      const tc = allTestCases.find((t) => t.id === riskId);
      if (r && tc) {
        const icon = r.passed ? "OK" : "XX";
        console.log(`  ${riskId} ${tc.name}: ${icon}`);
        if (r.generated_dsl?.content) {
          console.log(`    输出: ${JSON.stringify(r.generated_dsl.content)}`);
        }
        if (!r.passed) {
          for (const err of r.errors) console.log(`    错误: ${err}`);
        }
      }
    }
    console.log("");
  }

  // ============================================================
  // 生成报告
  // ============================================================
  const report: VariableScopeComparisonReport = {
    timestamp: new Date().toISOString(),
    protocol_version: "鸿蒙A2UI",
    evaluation_type: "expr-datatype-v2-verification",
    models: models.map((m) => m.displayName),
    total_cases: allTestCases.length,
    strategies: allEvaluations,
  };

  const jsonPath = resolve(reportsDir, `expr-datatype-v2-${timestamp}.json`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");

  const mdPath = resolve(reportsDir, `expr-datatype-v2-${timestamp}.md`);
  await writeFile(mdPath, buildMarkdownReport(report, allTestCases), "utf-8");

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

function buildMarkdownReport(report: VariableScopeComparisonReport, testCases: VariableScopeTestCase[]): string {
  const lines: string[] = [];
  lines.push("# #11 表达式数据类型 — 协议验证评估报告");
  lines.push(`\n日期: ${report.timestamp.split("T")[0]}`);
  lines.push(`协议: 鸿蒙A2UI协议 4.4.2 (数据类型) + 4.4.6 (类型转换)`);
  lines.push(`评估类型: 单方案验证（非对比）`);
  lines.push(`测试用例: ${report.total_cases} 个`);
  lines.push(`模型: ${report.models.join(", ")}\n`);

  for (const eval_ of report.strategies) {
    const d = eval_.dimensions;
    lines.push(`## ${eval_.model_name}\n`);
    lines.push("### 6维度评分\n");
    lines.push("| 维度 | 权重 | 得分 |");
    lines.push("|------|------|------|");

    const entries: [string, number, number][] = [
      ["D1 语法准确率", 0.20, d.d1_syntactic_accuracy],
      ["D2 语义准确率", 0.25, d.d2_semantic_accuracy],
      ["D3 生成效率", 0.15, d.d3_generation_efficiency],
      ["D4 学习曲线", 0.15, d.d4_learning_curve],
      ["D5 边界鲁棒性", 0.15, d.d5_edge_robustness],
      ["D6 一致稳定性", 0.10, d.d6_consistency],
    ];

    for (const [label, weight, val] of entries) {
      lines.push(`| ${label} | ${(weight * 100).toFixed(0)}% | ${(val * 100).toFixed(1)}% |`);
    }
    lines.push(`| **MA 综合** | | **${(d.ma_overall * 100).toFixed(1)}% (${d.ma_grade})** |\n`);

    // D4 学习曲线
    if (d.learning_curve) {
      lines.push("### D4 学习曲线明细\n");
      lines.push("| shot 数 | 准确率 |");
      lines.push("|---------|--------|");
      lines.push(`| 0-shot | ${(d.learning_curve.shot_0_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 1-shot | ${(d.learning_curve.shot_1_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 3-shot | ${(d.learning_curve.shot_3_accuracy * 100).toFixed(1)}% |\n`);
    }

    // D6 一致性
    if (d.consistency_detail) {
      lines.push("### D6 一致性明细\n");
      lines.push("| 指标 | 得分 |");
      lines.push("|------|------|");
      lines.push(`| 结构一致率 | ${(d.consistency_detail.structural_consistency * 100).toFixed(1)}% |`);
      lines.push(`| 语义等价率 | ${(d.consistency_detail.semantic_equivalence * 100).toFixed(1)}% |\n`);
    }

    // 类别分析
    lines.push("### 类别通过率\n");
    lines.push("| 类别 | 通过 | 备注 |");
    lines.push("|------|------|------|");
    const categories: [string, string[]][] = [
      ["A 字面量语法", ["A01", "A02", "A03", "A04", "A05"]],
      ["B 转换规则", ["B01", "B02", "B03", "B04", "B05"]],
      ["C 转换+运算符", ["C01", "C02", "C03", "C04", "C05"]],
      ["D 边界/风险", ["D01", "D02", "D03", "D04", "D05"]],
    ];
    for (const [catName, ids] of categories) {
      const catResults = ids.map((id) => eval_.main_results.find((r) => r.id === id)).filter(Boolean);
      const pass = catResults.filter((r) => r!.passed).length;
      const riskIds = ids.filter((id) => {
        const tc = testCases.find((t) => t.id === id);
        return tc && (tc as any).is_risk === true;
      });
      const note = riskIds.length > 0 ? `含 ${riskIds.length} 个风险用例` : "";
      lines.push(`| ${catName} | ${pass}/${catResults.length} | ${note} |`);
    }
    lines.push("");

    // 风险分析
    lines.push("### 风险用例详情\n");
    lines.push("| 用例 | 验证点 | 通过 | 模型输出 |");
    lines.push("|------|--------|------|----------|");
    const riskIds = ["B03", "D01", "D03"];
    for (const riskId of riskIds) {
      const r = eval_.main_results.find((mr) => mr.id === riskId);
      const tc = testCases.find((t) => t.id === riskId);
      if (r && tc) {
        const icon = r.passed ? "OK" : "XX";
        const output = r.generated_dsl?.content
          ? JSON.stringify(r.generated_dsl.content).substring(0, 60)
          : r.raw_output?.substring(0, 60) || "—";
        lines.push(`| ${riskId} ${tc.name} | ${(tc as any).risk_note || ""} | ${icon} | ${output} |`);
      }
    }
    lines.push("");

    // 失败用例
    const failed = eval_.main_results.filter((r) => !r.passed);
    if (failed.length > 0) {
      lines.push(`### 失败用例 (${failed.length}/${eval_.total_cases})\n`);
      for (const c of failed) {
        lines.push(`**${c.id} ${c.name}** (${c.complexity})`);
        for (const err of c.errors) lines.push(`  - ${err}`);
        if (c.raw_output) lines.push(`  - 原始输出: \`${c.raw_output.substring(0, 200)}\``);
        lines.push("");
      }
    }
  }

  // 综合结论
  lines.push("\n## 综合结论\n");
  if (report.strategies.length >= 2) {
    const avgMa = report.strategies.reduce((sum, e) => sum + e.dimensions.ma_overall, 0) / report.strategies.length;
    lines.push(`- 平均 MA: **${(avgMa * 100).toFixed(1)}%**\n`);
  }
  for (const eval_ of report.strategies) {
    lines.push(`- ${eval_.model_name}: **${(eval_.dimensions.ma_overall * 100).toFixed(1)}% (${eval_.dimensions.ma_grade})**`);
  }
  lines.push("");

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
