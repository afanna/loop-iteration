import "dotenv/config";
import { loadModelConfigs, loadChainTestCases, resolveReportsDir } from "../config.js";
import { callLLM } from "../llm/client.js";
import { validate } from "../core/validator.js";
import { calcD1, calcD2, calcD3, calcD4, calcD5, calcD6, calcMA, type CaseResultWithLevels } from "../core/scorer.js";
import { getFewShotExamples } from "../prompt/few-shot-examples.js";
import { writeFile, mkdir } from "fs/promises";
import { resolve } from "path";
import type {
  ChainStrategy,
  ChainTestCase,
  PerCaseResult,
  DimensionScores,
  LearningCurveData,
  ConsistencyData,
} from "../core/types.js";

// ============================================================================
// 配置
// ============================================================================

const STRATEGIES: ChainStrategy[] = ["handlerGroups", "flat-array"];
const MAX_RETRIES = 1;
const D4_SHOT_LEVELS = [0, 1, 3] as const;
const D6_REPEATS = 3;
const D4_SAMPLE_SIZE = 10;
const D6_SAMPLE_SIZE = 8;

// ============================================================================
// Prompt 构建（策略感知）
// ============================================================================

const BASE_RULES = [
  "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
  '2. 每个组件必须有"component"字段（如"Text"、"Button"、"TextInput"）。',
  '3. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
  '4. 不要使用"type"代替"component"。',
  '5. Button必须包含"label"字段。TextInput必须包含"placeholder"字段。',
  "6. 事件名直接作为组件属性（如onClick、onChange），值是EventHandler数组。不要使用listeners包装层。",
];

function getHandlerGroupsRules(): string[] {
  return [
    "7. 事件值是对象格式：{\"handlerGroups\": [...]}",
    "8. 每个handlerGroup是对象：{\"condition\": \"{{表达式}}\", \"handlers\": [...]}",
    "9. condition是可选的条件表达式，用{{ }}包裹，如\"{{$handlerResult['xxx'] == 0}}\"",
    "10. handlers数组中每个handler：{\"id\": \"唯一标识\", \"call\": \"行为名\", \"args\": {...}}",
    "11. 用$handlerResult['handlerId']引用之前handler的返回值",
    "12. 可用行为：sendToLLM, setDataModel, setAttributes, navigate, break",
    "13. sendToLLM的args：{\"value\": \"消息内容\", \"textHidden\": false}",
    "14. setDataModel的args：{\"path\": \"/ui/xxx\", \"value\": 值}",
    "15. navigate的args：{\"componentId\": \"nav组件ID\", \"index\": 页面下标}",
  ];
}

function getFlatArrayRules(): string[] {
  return [
    "7. 事件值是步骤数组：[step1, step2, ...]",
    "8. 每个步骤是对象：{\"action\": \"行为名\", \"condition\": \"条件表达式\", \"as\": \"变量名\", \"args\": {...}}",
    "9. condition是可选的，条件为真时执行该步骤，为假时跳过",
    "10. as是可选的，将行为返回值绑定到变量名",
    "11. 用$变量名引用as绑定的值，不需要{{ }}包裹",
    "12. 分支逻辑通过多个带不同condition的步骤实现：一个condition为真执行，另一个为假执行",
    "13. 可用行为：sendToLLM, setDataModel, setAttributes, navigate",
    "14. sendToLLM的args：{\"value\": \"消息内容\", \"textHidden\": false}",
    "15. setDataModel的args：{\"path\": \"/ui/xxx\", \"value\": 值}",
    "16. navigate的args：{\"componentId\": \"nav组件ID\", \"index\": 页面下标}",
  ];
}

function buildChainSystemPrompt(strategy: ChainStrategy): string {
  const rules = [...BASE_RULES];
  if (strategy === "handlerGroups") {
    rules.push(...getHandlerGroupsRules());
  } else {
    rules.push(...getFlatArrayRules());
  }

  return [
    "你是鸿蒙智能体UI协议v2.0的DSL生成器。严格按照下面的规则生成JSON。",
    "",
    "# 重要规则",
    "",
    rules.join("\n"),
  ].join("\n");
}

function buildChainUserPrompt(
  testCase: ChainTestCase,
  strategy: ChainStrategy,
  shotCount: number = 3
): string {
  const categoryKey = strategy === "handlerGroups" ? "event-chain-handlerGroups" : "event-chain-flat";
  const examples = shotCount > 0 ? getFewShotExamples(categoryKey, shotCount) : "";

  // 收集验证规则
  const sharedRules = testCase.shared_rules || [];
  const strategyRules = testCase.strategy_rules?.[strategy] || [];
  const allRules = [...sharedRules, ...strategyRules];

  const reqs = allRules
    .map((r, i) => `${i + 1}. ${r.description}`)
    .join("\n");

  const parts: string[] = [];
  if (examples) {
    parts.push(examples, "");
  }
  parts.push("---");
  parts.push("任务：" + testCase.task);
  parts.push("", "要求：", reqs);
  parts.push("", "请只输出一个JSON对象，不要包含任何其他内容。");

  return parts.join("\n");
}

// ============================================================================
// 报告类型
// ============================================================================

interface ChainStrategyEvaluation {
  strategy: ChainStrategy;
  model_name: string;
  total_cases: number;
  dimensions: DimensionScores;
  main_results: PerCaseResult[];
  learning_results?: Record<string, PerCaseResult[]>;
  consistency_results?: Record<string, PerCaseResult[][]>;
  depth_accuracy?: Record<number, { passed: number; total: number }>;
  type_accuracy?: Record<string, { passed: number; total: number }>;
}

interface ChainComparisonReport {
  timestamp: string;
  protocol_version: string;
  evaluation_type: string;
  models: string[];
  total_cases: number;
  strategies: ChainStrategyEvaluation[];
}

// ============================================================================
// 运行单个测试用例
// ============================================================================

async function runSingleCase(
  modelConfig: import("../core/types.js").LLMModelConfig,
  testCase: ChainTestCase,
  systemPrompt: string,
  strategy: ChainStrategy,
  maxRetries: number,
  shotCount: number = 3
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
      const userPrompt = buildChainUserPrompt(testCase, strategy, shotCount);
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

function makeErrorResult(tc: ChainTestCase, errorMsg: string): PerCaseResult {
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

function buildMarkdownReport(report: ChainComparisonReport): string {
  const lines: string[] = [];
  lines.push("# 事件链执行设计对比 — 6维度量化评估报告");
  lines.push(`\n日期: ${report.timestamp.split("T")[0]}`);
  lines.push(`协议版本: ${report.protocol_version}`);
  lines.push(`测试用例: ${report.total_cases} 个`);
  lines.push(`模型: ${report.models.join(", ")}`);
  lines.push(`对比: handlerGroups (嵌套对象) vs flat-array (扁平数组+if/then)\n`);

  for (const modelName of report.models) {
    const hg = report.strategies.find((e) => e.model_name === modelName && e.strategy === "handlerGroups")!;
    const fa = report.strategies.find((e) => e.model_name === modelName && e.strategy === "flat-array")!;

    lines.push(`## ${modelName}\n`);

    // 6维对比表
    lines.push("### 6维度评分对比\n");
    lines.push("| 维度 | 权重 | handlerGroups | flat-array | 差值 |");
    lines.push("|------|------|---------------|------------|------|");

    const entries: [string, number, number, number][] = [
      ["D1 语法准确率", 0.20, hg.dimensions.d1_syntactic_accuracy, fa.dimensions.d1_syntactic_accuracy],
      ["D2 语义准确率", 0.25, hg.dimensions.d2_semantic_accuracy, fa.dimensions.d2_semantic_accuracy],
      ["D3 生成效率", 0.15, hg.dimensions.d3_generation_efficiency, fa.dimensions.d3_generation_efficiency],
      ["D4 学习曲线", 0.15, hg.dimensions.d4_learning_curve, fa.dimensions.d4_learning_curve],
      ["D5 边界鲁棒性", 0.15, hg.dimensions.d5_edge_robustness, fa.dimensions.d5_edge_robustness],
      ["D6 一致稳定性", 0.10, hg.dimensions.d6_consistency, fa.dimensions.d6_consistency],
    ];

    for (const [label, weight, sv, ev] of entries) {
      const diff = ev - sv;
      const sign = diff > 0 ? "+" : "";
      lines.push(`| ${label} | ${(weight * 100).toFixed(0)}% | ${(sv * 100).toFixed(1)}% | ${(ev * 100).toFixed(1)}% | ${sign}${(diff * 100).toFixed(1)}% |`);
    }

    lines.push(`| **MA综合** | **100%** | **${(hg.dimensions.ma_overall * 100).toFixed(1)}% (${hg.dimensions.ma_grade})** | **${(fa.dimensions.ma_overall * 100).toFixed(1)}% (${fa.dimensions.ma_grade})** | **${signStr(hg.dimensions.ma_overall, fa.dimensions.ma_overall)}** |`);

    // 链深度准确率
    if (hg.depth_accuracy && fa.depth_accuracy) {
      lines.push("\n### 按链深度准确率\n");
      lines.push("| 链深度 | handlerGroups | flat-array | 差值 |");
      lines.push("|--------|---------------|------------|------|");
      for (const depth of [1, 2, 3, 4]) {
        const hga = hg.depth_accuracy[depth];
        const faa = fa.depth_accuracy[depth];
        if (hga && faa) {
          const hgr = hga.total > 0 ? hga.passed / hga.total : 0;
          const far = faa.total > 0 ? faa.passed / faa.total : 0;
          const diff = far - hgr;
          const sign = diff > 0 ? "+" : "";
          lines.push(`| depth=${depth} | ${(hgr * 100).toFixed(0)}% (${hga.passed}/${hga.total}) | ${(far * 100).toFixed(0)}% (${faa.passed}/${faa.total}) | ${sign}${(diff * 100).toFixed(1)}% |`);
        }
      }
    }

    // 链类型准确率
    if (hg.type_accuracy && fa.type_accuracy) {
      lines.push("\n### 按链类型准确率\n");
      lines.push("| 链类型 | handlerGroups | flat-array | 差值 |");
      lines.push("|--------|---------------|------------|------|");
      for (const typeName of ["single", "sequential", "conditional", "branching"]) {
        const hga = hg.type_accuracy[typeName];
        const faa = fa.type_accuracy[typeName];
        if (hga && faa) {
          const hgr = hga.total > 0 ? hga.passed / hga.total : 0;
          const far = faa.total > 0 ? faa.passed / faa.total : 0;
          const diff = far - hgr;
          const sign = diff > 0 ? "+" : "";
          lines.push(`| ${typeName} | ${(hgr * 100).toFixed(0)}% (${hga.passed}/${hga.total}) | ${(far * 100).toFixed(0)}% (${faa.passed}/${faa.total}) | ${sign}${(diff * 100).toFixed(1)}% |`);
        }
      }
    }

    // 学习曲线明细
    if (hg.dimensions.learning_curve && fa.dimensions.learning_curve) {
      lines.push("\n### D4 学习曲线明细\n");
      lines.push("| shot数 | handlerGroups | flat-array |");
      lines.push("|--------|---------------|------------|");
      lines.push(`| 0-shot | ${(hg.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% | ${(fa.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 1-shot | ${(hg.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% | ${(fa.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 3-shot | ${(hg.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% | ${(fa.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% |`);
    }

    // 一致性明细
    if (hg.dimensions.consistency_detail && fa.dimensions.consistency_detail) {
      lines.push("\n### D6 一致性明细\n");
      lines.push("| 指标 | handlerGroups | flat-array |");
      lines.push("|------|---------------|------------|");
      lines.push(`| 结构一致率 | ${(hg.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% | ${(fa.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% |`);
      lines.push(`| 语义等价率 | ${(hg.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% | ${(fa.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% |`);
    }

    // 失败用例详情
    for (const eval_ of [hg, fa]) {
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

function signStr(a: number, b: number): string {
  const diff = b - a;
  if (diff > 0) return `+${(diff * 100).toFixed(1)}%`;
  return `${(diff * 100).toFixed(1)}%`;
}

// ============================================================================
// 主流程
// ============================================================================

async function main() {
  console.log("=".repeat(70));
  console.log("事件链执行设计对比 — 6维度量化评估");
  console.log("handlerGroups (嵌套对象+condition) vs flat-array (扁平数组+if/then)");
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
  const allTestCases = await loadChainTestCases();
  console.log(`已加载 ${allTestCases.length} 个事件链测试用例`);

  // 按深度和类型统计
  const depthStats: Record<number, number> = {};
  const typeStats: Record<string, number> = {};
  for (const tc of allTestCases) {
    depthStats[tc.chain_depth] = (depthStats[tc.chain_depth] || 0) + 1;
    typeStats[tc.chain_type] = (typeStats[tc.chain_type] || 0) + 1;
  }
  console.log("  链深度分布:", Object.entries(depthStats).map(([k, v]) => `depth=${k}:${v}`).join(", "));
  console.log("  链类型分布:", Object.entries(typeStats).map(([k, v]) => `${k}:${v}`).join(", "));

  // 确定子集
  const d4Cases = allTestCases.slice(0, Math.min(D4_SAMPLE_SIZE, allTestCases.length));
  const d6Cases = allTestCases.slice(0, Math.min(D6_SAMPLE_SIZE, allTestCases.length));

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const reportsDir = resolveReportsDir("eval/design-points/event-chain/reports");
  await mkdir(reportsDir, { recursive: true });

  const allEvaluations: ChainStrategyEvaluation[] = [];

  // ============================================================
  // 对每个模型 × 每个策略运行评估
  // ============================================================
  for (const modelConfig of models) {
    for (const strategy of STRATEGIES) {
      console.log(`\n${"=".repeat(70)}`);
      console.log(`${modelConfig.displayName} | ${strategy}`);
      console.log(`${"=".repeat(70)}\n`);

      const systemPrompt = buildChainSystemPrompt(strategy);

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
        console.log(`  [${i + 1}/${allTestCases.length}] ${tc.id} ${tc.name} (depth=${tc.chain_depth} ${tc.chain_type}) ${icon} [${result.tokens}t, ${timeStr}s]`);
        if (!result.passed) {
          for (const err of result.errors) console.log(`    -> ${err}`);
        }
      }

      // 按深度统计
      const depthAccuracy: Record<number, { passed: number; total: number }> = {};
      for (let i = 0; i < allTestCases.length; i++) {
        const tc = allTestCases[i];
        const r = mainResults[i];
        if (!depthAccuracy[tc.chain_depth]) depthAccuracy[tc.chain_depth] = { passed: 0, total: 0 };
        depthAccuracy[tc.chain_depth].total++;
        if (r.passed) depthAccuracy[tc.chain_depth].passed++;
      }

      // 按类型统计
      const typeAccuracy: Record<string, { passed: number; total: number }> = {};
      for (let i = 0; i < allTestCases.length; i++) {
        const tc = allTestCases[i];
        const r = mainResults[i];
        if (!typeAccuracy[tc.chain_type]) typeAccuracy[tc.chain_type] = { passed: 0, total: 0 };
        typeAccuracy[tc.chain_type].total++;
        if (r.passed) typeAccuracy[tc.chain_type].passed++;
      }

      // 边界用例（depth >= 3 的用例作为边界）

      // ============================================================
      // Phase B: 学习曲线 (D4)
      // ============================================================
      console.log("\n--- Phase B: 学习曲线 (D4) ---\n");
      const learningResults: Record<string, PerCaseResult[]> = {};

      // 3-shot 结果从 Phase A 收集
      const shot3Results: PerCaseResult[] = d4Cases.map((tc) => {
        const r = mainResults.find((mr) => mr.id === tc.id)!;
        return r as PerCaseResult;
      });
      learningResults["3"] = shot3Results;

      // 运行 0-shot 和 1-shot
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
            const userPrompt = buildChainUserPrompt(tc, strategy, shotCount);
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
            const userPrompt = buildChainUserPrompt(tc, strategy, 3);
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
      // Phase D: 计算评分
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
      console.log(`  D5 边界鲁棒性:    ${(d5 * 100).toFixed(1)}% (depth>=3)`);
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
        depth_accuracy: depthAccuracy,
        type_accuracy: typeAccuracy,
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
    console.log("| 维度 | handlerGroups | flat-array | 差值 |");
    console.log("|------|---------------|------------|------|");

    const hg = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "handlerGroups")!;
    const fa = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "flat-array")!;

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
      const sv = fn(hg.dimensions);
      const ev = fn(fa.dimensions);
      const diff = ev - sv;
      const sign = diff > 0 ? "+" : "";
      console.log(`| ${label} | ${(sv * 100).toFixed(1)}% | ${(ev * 100).toFixed(1)}% | ${sign}${(diff * 100).toFixed(1)}% |`);
    }

    console.log(`\n  handlerGroups: ${hg.dimensions.ma_grade} | flat-array: ${fa.dimensions.ma_grade}`);

    // 深度衰减
    if (hg.depth_accuracy && fa.depth_accuracy) {
      console.log("\n  按深度准确率:");
      for (const depth of [1, 2, 3, 4]) {
        const hga = hg.depth_accuracy[depth];
        const faa = fa.depth_accuracy[depth];
        if (hga && faa) {
          const hgr = hga.total > 0 ? (hga.passed / hga.total * 100).toFixed(0) : "-";
          const far = faa.total > 0 ? (faa.passed / faa.total * 100).toFixed(0) : "-";
          console.log(`    depth=${depth}: handlerGroups ${hgr}% (${hga.passed}/${hga.total}) | flat-array ${far}% (${faa.passed}/${faa.total})`);
        }
      }
    }
  }

  // 保存报告
  const report: ChainComparisonReport = {
    timestamp: new Date().toISOString(),
    protocol_version: "v2.0",
    evaluation_type: "event-chain-6d",
    models: models.map((m) => m.displayName),
    total_cases: allTestCases.length,
    strategies: allEvaluations,
  };

  const jsonPath = resolve(reportsDir, `chain-comparison-${timestamp}.json`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");

  const mdPath = resolve(reportsDir, `chain-comparison-${timestamp}.md`);
  await writeFile(mdPath, buildMarkdownReport(report), "utf-8");

  console.log(`\n报告已保存:`);
  console.log(`  ${jsonPath}`);
  console.log(`  ${mdPath}`);
  console.log("\n评估完成！");
}

main().catch((e) => {
  console.error("运行错误:", e);
  process.exit(1);
});
