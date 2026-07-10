import "dotenv/config";
import { loadModelConfigs, loadSelectComponentTestCases, loadHarmonyOSInlineSummary, resolveReportsDir } from "../config.js";
import { setProtocolSummary, buildSystemPrompt, buildUserPrompt } from "../prompt/prompt-builder.js";
import { callLLM } from "../llm/client.js";
import { validate } from "../core/validator.js";
import { calcD1, calcD2, calcD3, calcD4, calcD5, calcD6, calcMA, type CaseResultWithLevels } from "../core/scorer.js";
import { checkConsistency } from "../core/consistency-checker.js";
import { writeFile, mkdir } from "fs/promises";
import { resolve } from "path";
import type {
  ScopeStrategy,
  VariableScopeTestCase,
  PerCaseResult,
  StrategyEvaluation,
  VariableScopeComparisonReport,
  DimensionScores,
} from "../core/types.js";

const STRATEGIES: ScopeStrategy[] = ["label-value", "value-flat", "index-based"];
const MAX_RETRIES = 1;
const D4_SHOT_LEVELS = [0, 1, 3] as const;
const D6_REPEATS = 3;
const D4_SAMPLE_SIZE = 15;
const D6_SAMPLE_SIZE = 10;

async function main() {
  console.log("=".repeat(70));
  console.log("Select组件设计对比 — 6维度量化评估");
  console.log("label+value (Web HTML对齐) vs value-only (显示即提交) vs index-based (索引式)");
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
  const allTestCases = await loadSelectComponentTestCases();
  console.log(`已加载 ${allTestCases.length} 个Select组件设计测试用例`);

  const edgeCases = allTestCases.filter((tc) => tc.complexity === "complex" || tc.is_edge);
  console.log(`  其中边界/复杂用例: ${edgeCases.length} 个`);

  // 3. 加载协议摘要
  const protocolSummary = await loadHarmonyOSInlineSummary();
  setProtocolSummary(protocolSummary);

  // 确定子集
  const d4Cases = allTestCases.slice(0, D4_SAMPLE_SIZE);
  const d6Cases = allTestCases.slice(0, D6_SAMPLE_SIZE);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const reportsDir = resolveReportsDir("eval/design-points/select-component/reports");
  await mkdir(reportsDir, { recursive: true });

  const allEvaluations: StrategyEvaluation[] = [];

  // ============================================================
  // 对每个模型 × 每个策略运行评估
  // ============================================================
  for (const modelConfig of models) {
    for (const strategy of STRATEGIES) {
      console.log(`\n${"=".repeat(70)}`);
      console.log(`${modelConfig.displayName} | ${strategy}`);
      console.log(`${"=".repeat(70)}\n`);

      const systemPrompt = buildSystemPrompt(strategy);

      // ============================================================
      // Phase A: 主测试 (D1/D2/D3/D5)
      // ============================================================
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
    console.log("| 维度 | label+value | value-only | index-based |");
    console.log("|------|-------------|------------|-------------|");

    const a = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "label-value")!;
    const b = allEvaluations.find((ev) => ev.model_name === model.displayName && ev.strategy === "value-flat")!;
    const c = allEvaluations.find((ev) => ev.model_name === model.displayName && ev.strategy === "index-based")!;

    const dims: [string, string, (d: DimensionScores) => number][] = [
      ["D1 语法", "d1_syntactic_accuracy", (d) => d.d1_syntactic_accuracy],
      ["D2 语义", "d2_semantic_accuracy", (d) => d.d2_semantic_accuracy],
      ["D3 效率", "d3_generation_efficiency", (d) => d.d3_generation_efficiency],
      ["D4 学习", "d4_learning_curve", (d) => d.d4_learning_curve],
      ["D5 边界", "d5_edge_robustness", (d) => d.d5_edge_robustness],
      ["D6 一致", "d6_consistency", (d) => d.d6_consistency],
      ["**MA**", "ma_overall", (d) => d.ma_overall],
    ];

    for (const [label, _, fn] of dims) {
      const av = fn(a.dimensions);
      const bv = fn(b.dimensions);
      const cv = fn(c.dimensions);
      console.log(`| ${label} | ${(av * 100).toFixed(1)}% | ${(bv * 100).toFixed(1)}% | ${(cv * 100).toFixed(1)}% |`);
    }

    console.log(`\n  label+value: ${a.dimensions.ma_grade} | value-only: ${b.dimensions.ma_grade} | index-based: ${c.dimensions.ma_grade}`);
  }

  const report: VariableScopeComparisonReport = {
    timestamp: new Date().toISOString(),
    protocol_version: "v2.0",
    evaluation_type: "select-component-6d",
    models: models.map((m) => m.displayName),
    total_cases: allTestCases.length,
    strategies: allEvaluations,
  };

  const jsonPath = resolve(reportsDir, `select-comparison-${timestamp}.json`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");

  const mdPath = resolve(reportsDir, `select-comparison-${timestamp}.md`);
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

function buildMarkdownReport(report: VariableScopeComparisonReport): string {
  const lines: string[] = [];
  lines.push("# Select组件设计对比 — 6维度量化评估报告");
  lines.push(`\n日期: ${report.timestamp.split("T")[0]}`);
  lines.push(`协议版本: ${report.protocol_version}`);
  lines.push(`测试用例: ${report.total_cases} 个`);
  lines.push(`模型: ${report.models.join(", ")}`);
  lines.push(`对比: label+value (Web HTML对齐) vs value-only (显示即提交) vs index-based (索引式)\n`);

  const strategyLabels: Record<string, string> = {
    "label-value": "label+value",
    "value-flat": "value-only",
    "index-based": "index-based",
  };

  for (const modelName of report.models) {
    const evals = report.strategies.filter((e) => e.model_name === modelName);
    const a = evals.find((e) => e.strategy === "label-value")!;
    const b = evals.find((e) => e.strategy === "value-flat")!;
    const c = evals.find((e) => e.strategy === "index-based")!;

    lines.push(`## ${modelName}\n`);

    lines.push("### 6维度评分对比\n");
    lines.push("| 维度 | 权重 | label+value | value-only | index-based |");
    lines.push("|------|------|-------------|------------|-------------|");

    const entries: [string, number, number, number, number][] = [
      ["D1 语法准确率", 0.20, a.dimensions.d1_syntactic_accuracy, b.dimensions.d1_syntactic_accuracy, c.dimensions.d1_syntactic_accuracy],
      ["D2 语义准确率", 0.25, a.dimensions.d2_semantic_accuracy, b.dimensions.d2_semantic_accuracy, c.dimensions.d2_semantic_accuracy],
      ["D3 生成效率", 0.15, a.dimensions.d3_generation_efficiency, b.dimensions.d3_generation_efficiency, c.dimensions.d3_generation_efficiency],
      ["D4 学习曲线", 0.15, a.dimensions.d4_learning_curve, b.dimensions.d4_learning_curve, c.dimensions.d4_learning_curve],
      ["D5 边界鲁棒性", 0.15, a.dimensions.d5_edge_robustness, b.dimensions.d5_edge_robustness, c.dimensions.d5_edge_robustness],
      ["D6 一致稳定性", 0.10, a.dimensions.d6_consistency, b.dimensions.d6_consistency, c.dimensions.d6_consistency],
    ];

    for (const [label, weight, av, bv, cv] of entries) {
      lines.push(`| ${label} | ${(weight * 100).toFixed(0)}% | ${(av * 100).toFixed(1)}% | ${(bv * 100).toFixed(1)}% | ${(cv * 100).toFixed(1)}% |`);
    }

    lines.push(`| **MA综合** | **100%** | **${(a.dimensions.ma_overall * 100).toFixed(1)}% (${a.dimensions.ma_grade})** | **${(b.dimensions.ma_overall * 100).toFixed(1)}% (${b.dimensions.ma_grade})** | **${(c.dimensions.ma_overall * 100).toFixed(1)}% (${c.dimensions.ma_grade})** |`);

    // D4 学习曲线明细
    if (a.dimensions.learning_curve && b.dimensions.learning_curve && c.dimensions.learning_curve) {
      lines.push("\n### D4 学习曲线明细\n");
      lines.push("| shot数 | label+value | value-only | index-based |");
      lines.push("|--------|-------------|------------|-------------|");
      lines.push(`| 0-shot | ${(a.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% | ${(b.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% | ${(c.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 1-shot | ${(a.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% | ${(b.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% | ${(c.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 3-shot | ${(a.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% | ${(b.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% | ${(c.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% |`);
    }

    // D6 一致性明细
    if (a.dimensions.consistency_detail && b.dimensions.consistency_detail && c.dimensions.consistency_detail) {
      lines.push("\n### D6 一致性明细\n");
      lines.push("| 指标 | label+value | value-only | index-based |");
      lines.push("|------|-------------|------------|-------------|");
      lines.push(`| 结构一致率 | ${(a.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% | ${(b.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% | ${(c.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% |`);
      lines.push(`| 语义等价率 | ${(a.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% | ${(b.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% | ${(c.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% |`);
    }

    // 失败用例
    for (const eval_ of [a, b, c]) {
      const failed = eval_.main_results.filter((r) => !r.passed);
      if (failed.length > 0) {
        const label = strategyLabels[eval_.strategy] || eval_.strategy;
        lines.push(`\n### ${label} 失败用例 (${failed.length}/${eval_.total_cases})\n`);
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
