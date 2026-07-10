import "dotenv/config";
import { loadModelConfigs, loadColorGradientPropertyTestCases, resolveReportsDir, TOOLKIT_ROOT } from "../config.js";
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

const STRATEGY_CONFIGS: Array<{ key: ScopeStrategy; label: string; shortLabel: string }> = [
  { key: "unified-gradient", label: "A: unified-gradient (`colorGradient.type + param`)", shortLabel: "A" },
  { key: "separate-gradients", label: "B: separate-gradients (`linearGradient/sweepGradient/radialGradient`)", shortLabel: "B" },
  { key: "keyed-gradient", label: "C: keyed-gradient (`colorGradient.{linearGradient|sweepGradient|radialGradient}`)", shortLabel: "C" },
];

const STRATEGIES: ScopeStrategy[] = STRATEGY_CONFIGS.map((item) => item.key);
const MAX_RETRIES = 1;
const D4_SAMPLE_SIZE = 10;
const D6_SAMPLE_SIZE = 8;
const D6_REPEATS = 3;

function getUnifiedGradientRules(): string[] {
  return [
    "1. 只输出一个 JSON 对象，不要包含说明文字或 markdown。",
    "2. 每个组件必须包含 component 字段，不要使用 type 代替 component。",
    "3. 样式统一放在 styles 对象中。",
    "4. 渐变颜色能力使用统一入口 styles.colorGradient。",
    "5. colorGradient 结构固定为 { type, param }。",
    "6. type 只能是 linearGradient、sweepGradient、radialGradient 三者之一。",
    "7. linearGradient 的参数写在 param 中，可包含 angle、direction、colors、repeating。",
    "8. sweepGradient 的参数写在 param 中，可包含 center、start、end、rotation、colors、metricsColors、repeating。",
    "9. radialGradient 的参数写在 param 中，可包含 center、radius、colors、repeating。",
    "10. 不要在 styles 下直接输出 linearGradient、sweepGradient、radialGradient 根字段。",
    "11. type 必须和 param 中的参数形态匹配，不能 type 是 linearGradient 但 param 写 radius。",
    "12. colors 和 metricsColors 使用二元数组 stop 结构，例如 [[\"#FF0000\", 0], [\"#00FF00\", 1]]。",
    "13. 三种渐变互斥，只保留一个 colorGradient 入口。",
  ];
}

function getSeparateGradientsRules(): string[] {
  return [
    "1. 只输出一个 JSON 对象，不要包含说明文字或 markdown。",
    "2. 每个组件必须包含 component 字段，不要使用 type 代替 component。",
    "3. 样式统一放在 styles 对象中。",
    "4. 渐变颜色能力直接使用 styles.linearGradient、styles.sweepGradient、styles.radialGradient 三个独立字段之一。",
    "5. linearGradient 可包含 angle、direction、colors、repeating。",
    "6. sweepGradient 可包含 center、start、end、rotation、colors、metricsColors、repeating。",
    "7. radialGradient 可包含 center、radius、colors、repeating。",
    "8. 不要输出 colorGradient 包装对象。",
    "9. 三种渐变互斥，一次只能输出一个渐变字段。",
    "10. 如果任务要求线性渐变，只能使用 linearGradient；如果要求角度渐变，只能使用 sweepGradient；如果要求径向渐变，只能使用 radialGradient。",
    "11. 不要同时输出多个渐变字段，否则后面的字段会覆盖前面的字段。",
    "12. colors 和 metricsColors 使用二元数组 stop 结构，例如 [[\"#FF0000\", 0], [\"#00FF00\", 1]]。",
  ];
}

function getKeyedGradientRules(): string[] {
  return [
    "1. 只输出一个 JSON 对象，不要包含说明文字或 markdown。",
    "2. 每个组件必须包含 component 字段，不要使用 type 代替 component。",
    "3. 样式统一放在 styles 对象中。",
    "4. 渐变颜色能力使用统一入口 styles.colorGradient。",
    "5. colorGradient 下只能保留一个渐变类型键：linearGradient、sweepGradient、radialGradient 三者之一。",
    "6. linearGradient 键对应的对象可包含 angle、direction、colors、repeating。",
    "7. sweepGradient 键对应的对象可包含 center、start、end、rotation、colors、metricsColors、repeating。",
    "8. radialGradient 键对应的对象可包含 center、radius、colors、repeating。",
    "9. 不要再输出 type + param 结构。",
    "10. 不要在 styles 下直接输出 linearGradient、sweepGradient、radialGradient 根字段。",
    "11. colors 和 metricsColors 使用二元数组 stop 结构，例如 [[\"#FF0000\", 0], [\"#00FF00\", 1]]。",
    "12. colorGradient 下只允许一个子键，借此表达三种渐变互斥。",
  ];
}

const UNIFIED_GRADIENT_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 线性渐变：",
  "输入：生成一个按钮，使用线性渐变颜色，angle 为 45deg，红到橙。",
  "输出：",
  "{\"component\":\"Extended.Button\",\"label\":\"立即购买\",\"styles\":{\"colorGradient\":{\"type\":\"linearGradient\",\"param\":{\"angle\":\"45deg\",\"colors\":[[\"#FF5A5F\",0],[\"#FFB347\",1]],\"repeating\":false}}}}",
  "",
  "示例2 - 角度渐变：",
  "输入：生成一个文字组件，使用角度渐变颜色，center 是 50% 50%，start 0deg，end 180deg。",
  "输出：",
  "{\"component\":\"Extended.Text\",\"content\":\"会员权益\",\"styles\":{\"colorGradient\":{\"type\":\"sweepGradient\",\"param\":{\"center\":[\"50%\",\"50%\"],\"start\":\"0deg\",\"end\":\"180deg\",\"rotation\":\"90deg\",\"colors\":[[\"#F59E0B\",0],[\"#FB923C\",1]],\"repeating\":false}}}}",
  "",
  "示例3 - 径向渐变：",
  "输入：生成一个头像光晕，使用径向渐变颜色，center 50% 50%，radius 60%。",
  "输出：",
  "{\"component\":\"Extended.Image\",\"id\":\"avatarGlow\",\"styles\":{\"colorGradient\":{\"type\":\"radialGradient\",\"param\":{\"center\":[\"50%\",\"50%\"],\"radius\":\"60%\",\"colors\":[[\"#FFFFFF\",0],[\"rgba(255,255,255,0)\",1]],\"repeating\":false}}}}",
].join("\n");

const SEPARATE_GRADIENTS_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 线性渐变：",
  "输入：生成一个按钮，使用线性渐变颜色，angle 为 45deg，红到橙。",
  "输出：",
  "{\"component\":\"Extended.Button\",\"label\":\"立即购买\",\"styles\":{\"linearGradient\":{\"angle\":\"45deg\",\"colors\":[[\"#FF5A5F\",0],[\"#FFB347\",1]],\"repeating\":false}}}",
  "",
  "示例2 - 角度渐变：",
  "输入：生成一个文字组件，使用角度渐变颜色，center 是 50% 50%，start 0deg，end 180deg。",
  "输出：",
  "{\"component\":\"Extended.Text\",\"content\":\"会员权益\",\"styles\":{\"sweepGradient\":{\"center\":[\"50%\",\"50%\"],\"start\":\"0deg\",\"end\":\"180deg\",\"rotation\":\"90deg\",\"colors\":[[\"#F59E0B\",0],[\"#FB923C\",1]],\"repeating\":false}}}",
  "",
  "示例3 - 径向渐变：",
  "输入：生成一个头像光晕，使用径向渐变颜色，center 50% 50%，radius 60%。",
  "输出：",
  "{\"component\":\"Extended.Image\",\"id\":\"avatarGlow\",\"styles\":{\"radialGradient\":{\"center\":[\"50%\",\"50%\"],\"radius\":\"60%\",\"colors\":[[\"#FFFFFF\",0],[\"rgba(255,255,255,0)\",1]],\"repeating\":false}}}",
].join("\n");

const KEYED_GRADIENT_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 线性渐变：",
  "输入：生成一个按钮，使用线性渐变颜色，angle 为 45deg，红到橙。",
  "输出：",
  "{\"component\":\"Extended.Button\",\"label\":\"立即购买\",\"styles\":{\"colorGradient\":{\"linearGradient\":{\"angle\":\"45deg\",\"colors\":[[\"#FF5A5F\",0],[\"#FFB347\",1]],\"repeating\":false}}}}",
  "",
  "示例2 - 角度渐变：",
  "输入：生成一个文字组件，使用角度渐变颜色，center 是 50% 50%，start 0deg，end 180deg。",
  "输出：",
  "{\"component\":\"Extended.Text\",\"content\":\"会员权益\",\"styles\":{\"colorGradient\":{\"sweepGradient\":{\"center\":[\"50%\",\"50%\"],\"start\":\"0deg\",\"end\":\"180deg\",\"rotation\":\"90deg\",\"colors\":[[\"#F59E0B\",0],[\"#FB923C\",1]],\"repeating\":false}}}}",
  "",
  "示例3 - 径向渐变：",
  "输入：生成一个头像光晕，使用径向渐变颜色，center 50% 50%，radius 60%。",
  "输出：",
  "{\"component\":\"Extended.Image\",\"id\":\"avatarGlow\",\"styles\":{\"colorGradient\":{\"radialGradient\":{\"center\":[\"50%\",\"50%\"],\"radius\":\"60%\",\"colors\":[[\"#FFFFFF\",0],[\"rgba(255,255,255,0)\",1]],\"repeating\":false}}}}",
].join("\n");

let _protocolSummary = "";

async function loadSummaries(): Promise<void> {
  const summaryPath = resolve(TOOLKIT_ROOT, "prompts", "protocol-inline-summary.md");
  _protocolSummary = await readFile(summaryPath, "utf-8");
}

function getStrategyRules(strategy: ScopeStrategy): string[] {
  switch (strategy) {
    case "unified-gradient":
      return getUnifiedGradientRules();
    case "separate-gradients":
      return getSeparateGradientsRules();
    case "keyed-gradient":
      return getKeyedGradientRules();
    default:
      return getUnifiedGradientRules();
  }
}

function getStrategyExamples(strategy: ScopeStrategy): string {
  switch (strategy) {
    case "unified-gradient":
      return UNIFIED_GRADIENT_EXAMPLES;
    case "separate-gradients":
      return SEPARATE_GRADIENTS_EXAMPLES;
    case "keyed-gradient":
      return KEYED_GRADIENT_EXAMPLES;
    default:
      return UNIFIED_GRADIENT_EXAMPLES;
  }
}

function buildSystemPrompt(strategy: ScopeStrategy): string {
  const rules = getStrategyRules(strategy);
  return [
    "你是鸿蒙智能体 UI 协议 v2.0 的 DSL 生成器。严格按照协议规范生成 JSON。",
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
  parts.push(`任务：${testCase.task}`);
  parts.push("", "要求：", reqs);
  if (hints) parts.push(hints);
  parts.push("", "请只输出一个 JSON 对象，不要包含其他内容。");
  return parts.join("\n");
}

function resolveRules(testCase: VariableScopeTestCase, strategy: ScopeStrategy): ValidationRule[] {
  if (testCase.shared_rules && testCase.strategy_rules) {
    const strategyRules = testCase.strategy_rules[strategy] || [];
    return [...testCase.shared_rules, ...strategyRules];
  }
  return testCase.validation_rules;
}

function getStrategyLabel(strategy: ScopeStrategy): string {
  return STRATEGY_CONFIGS.find((item) => item.key === strategy)?.label || strategy;
}

async function main() {
  console.log("=".repeat(70));
  console.log("渐变颜色属性组织方式对比 - 6维度量化评估");
  console.log(STRATEGY_CONFIGS.map((item) => item.label).join(" vs "));
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
    console.error("\n错误: 未配置任何模型。请在 .env 文件中设置 API Key。");
    process.exit(1);
  }

  console.log(`\n已配置 ${models.length} 个模型: ${models.map((m) => m.displayName).join(", ")}`);

  const allTestCases = await loadColorGradientPropertyTestCases();
  console.log(`已加载 ${allTestCases.length} 个渐变颜色设计测试用例`);
  console.log(`  其中边界用例: ${allTestCases.filter((tc) => tc.is_edge === true).length}`);
  console.log(`  simple: ${allTestCases.filter((tc) => tc.complexity === "simple").length} | medium: ${allTestCases.filter((tc) => tc.complexity === "medium").length} | complex: ${allTestCases.filter((tc) => tc.complexity === "complex").length}`);

  await loadSummaries();

  const d4Cases = allTestCases.slice(0, D4_SAMPLE_SIZE);
  const d6Cases = allTestCases.slice(0, D6_SAMPLE_SIZE);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const reportsDir = resolveReportsDir("eval/design-points/color-gradient-property/reports");
  await mkdir(reportsDir, { recursive: true });

  const allEvaluations: StrategyEvaluation[] = [];

  for (const modelConfig of models) {
    for (const strategy of STRATEGIES) {
      console.log(`\n${"=".repeat(70)}`);
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
        if (!result.passed) {
          for (const err of result.errors) console.log(`    -> ${err}`);
        }
      }

      console.log("\n--- Phase B: 学习曲线 (D4) ---\n");
      const learningResults: Record<string, PerCaseResult[]> = {};
      const shot3Results: PerCaseResult[] = d4Cases.map((tc) => mainResults.find((mr) => mr.id === tc.id) as PerCaseResult);
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
            if (msg.includes("429") || msg.includes("余额")) skipped = true;
          }
        }

        learningResults[String(shotCount)] = shotResults;
        const validResults = shotResults.filter((r) => !r.errors[0]?.includes("跳过"));
        const acc = validResults.length > 0 ? validResults.filter((r) => r.passed).length / validResults.length : 0;
        console.log(`    ${shotCount}-shot 准确率 ${(acc * 100).toFixed(1)}% (${validResults.length}/${shotResults.length} 有效)`);
      }

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

      console.log(`  D1 语法准确率: ${(d1 * 100).toFixed(1)}%`);
      console.log(`  D2 语义准确率: ${(d2 * 100).toFixed(1)}%`);
      console.log(`  D3 生成效率:   ${(d3 * 100).toFixed(1)}%`);
      console.log(`  D4 学习曲线:   ${(d4 * 100).toFixed(1)}% (0:${(shot0Acc * 100).toFixed(0)}% -> 1:${(shot1Acc * 100).toFixed(0)}% -> 3:${(shot3Acc * 100).toFixed(0)}%)`);
      console.log(`  D5 边界鲁棒性: ${(d5 * 100).toFixed(1)}%`);
      console.log(`  D6 一致稳定性: ${(d6 * 100).toFixed(1)}%`);
      console.log(`  MA 综合分:     ${(maScore * 100).toFixed(1)}% (${maGrade})`);

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

  console.log(`\n${"=".repeat(70)}`);
  console.log("对比汇总");
  console.log(`${"=".repeat(70)}\n`);

  for (const model of models) {
    console.log(`\n### ${model.displayName}\n`);
    const evals = STRATEGIES.map((strategy) => allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === strategy)!);
    console.log(`| 维度 | ${STRATEGY_CONFIGS.map((cfg) => cfg.shortLabel).join(" | ")} |`);
    console.log(`|------|${STRATEGY_CONFIGS.map(() => "-----").join("|")}|`);

    const dims: [string, (d: DimensionScores) => number][] = [
      ["D1 语法", (d) => d.d1_syntactic_accuracy],
      ["D2 语义", (d) => d.d2_semantic_accuracy],
      ["D3 效率", (d) => d.d3_generation_efficiency],
      ["D4 学习", (d) => d.d4_learning_curve],
      ["D5 边界", (d) => d.d5_edge_robustness],
      ["D6 一致", (d) => d.d6_consistency],
      ["MA", (d) => d.ma_overall],
    ];

    for (const [label, fn] of dims) {
      const values = evals.map((item) => `${(fn(item.dimensions) * 100).toFixed(1)}%`);
      console.log(`| ${label} | ${values.join(" | ")} |`);
    }
  }

  const report: VariableScopeComparisonReport = {
    timestamp: new Date().toISOString(),
    protocol_version: "v2.0",
    evaluation_type: "color-gradient-property-6d",
    models: models.map((m) => m.displayName),
    total_cases: allTestCases.length,
    strategies: allEvaluations,
  };

  const jsonPath = resolve(reportsDir, `color-gradient-property-comparison-${timestamp}.json`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");
  const mdPath = resolve(reportsDir, `color-gradient-property-comparison-${timestamp}.md`);
  await writeFile(mdPath, buildMarkdownReport(report), "utf-8");
  console.log(`\n报告已保存:`);
  console.log(`  ${jsonPath}`);
  console.log(`  ${mdPath}`);
}

async function runSingleCase(
  modelConfig: import("../core/types.js").LLMModelConfig,
  testCase: VariableScopeTestCase,
  systemPrompt: string,
  strategy: ScopeStrategy,
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
      errors = [`LLM 调用错误: ${(e as Error).message}`];
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

function buildMarkdownReport(report: VariableScopeComparisonReport): string {
  const lines: string[] = [];
  lines.push("# 渐变颜色属性组织方式评估报告");
  lines.push(`\n日期: ${report.timestamp.split("T")[0]}`);
  lines.push(`协议版本: ${report.protocol_version}`);
  lines.push(`测试用例: ${report.total_cases} 个`);
  lines.push(`模型: ${report.models.join(", ")}`);
  lines.push(`对比: ${STRATEGY_CONFIGS.map((item) => item.label).join(" vs ")}\n`);

  for (const modelName of report.models) {
    lines.push(`## ${modelName}\n`);
    lines.push("### 6维度评分对比\n");
    lines.push(`| 维度 | 权重 | ${STRATEGY_CONFIGS.map((item) => item.shortLabel).join(" | ")} |`);
    lines.push(`|------|------|${STRATEGY_CONFIGS.map(() => "-----").join("|")}|`);

    const evals = STRATEGIES.map((strategy) => report.strategies.find((e) => e.model_name === modelName && e.strategy === strategy)!);
    const entries: [string, number, (d: DimensionScores) => number][] = [
      ["D1 语法准确率", 0.20, (d) => d.d1_syntactic_accuracy],
      ["D2 语义准确率", 0.25, (d) => d.d2_semantic_accuracy],
      ["D3 生成效率", 0.15, (d) => d.d3_generation_efficiency],
      ["D4 学习曲线", 0.15, (d) => d.d4_learning_curve],
      ["D5 边界鲁棒性", 0.15, (d) => d.d5_edge_robustness],
      ["D6 一致稳定性", 0.10, (d) => d.d6_consistency],
    ];

    for (const [label, weight, fn] of entries) {
      const values = evals.map((item) => `${(fn(item.dimensions) * 100).toFixed(1)}%`);
      lines.push(`| ${label} | ${(weight * 100).toFixed(0)}% | ${values.join(" | ")} |`);
    }

    const maValues = evals.map((item) => `**${(item.dimensions.ma_overall * 100).toFixed(1)}% (${item.dimensions.ma_grade})**`);
    lines.push(`| **MA综合** | **100%** | ${maValues.join(" | ")} |`);

    lines.push("\n### 策略标签\n");
    for (const item of STRATEGY_CONFIGS) lines.push(`- ${item.shortLabel}: ${item.label}`);

    if (evals.every((item) => item.dimensions.learning_curve)) {
      lines.push("\n### D4 学习曲线明细\n");
      lines.push(`| shot数 | ${STRATEGY_CONFIGS.map((item) => item.shortLabel).join(" | ")} |`);
      lines.push(`|--------|${STRATEGY_CONFIGS.map(() => "-----").join("|")}|`);
      lines.push(`| 0-shot | ${evals.map((item) => `${(item.dimensions.learning_curve!.shot_0_accuracy * 100).toFixed(1)}%`).join(" | ")} |`);
      lines.push(`| 1-shot | ${evals.map((item) => `${(item.dimensions.learning_curve!.shot_1_accuracy * 100).toFixed(1)}%`).join(" | ")} |`);
      lines.push(`| 3-shot | ${evals.map((item) => `${(item.dimensions.learning_curve!.shot_3_accuracy * 100).toFixed(1)}%`).join(" | ")} |`);
    }

    if (evals.every((item) => item.dimensions.consistency_detail)) {
      lines.push("\n### D6 一致性明细\n");
      lines.push(`| 指标 | ${STRATEGY_CONFIGS.map((item) => item.shortLabel).join(" | ")} |`);
      lines.push(`|------|${STRATEGY_CONFIGS.map(() => "-----").join("|")}|`);
      lines.push(`| 结构一致率 | ${evals.map((item) => `${(item.dimensions.consistency_detail!.structural_consistency * 100).toFixed(1)}%`).join(" | ")} |`);
      lines.push(`| 语义等价率 | ${evals.map((item) => `${(item.dimensions.consistency_detail!.semantic_equivalence * 100).toFixed(1)}%`).join(" | ")} |`);
    }

    for (const item of evals) {
      const failed = item.main_results.filter((r) => !r.passed);
      if (failed.length > 0) {
        lines.push(`\n### ${getStrategyLabel(item.strategy)} 失败用例 (${failed.length}/${item.total_cases})\n`);
        for (const c of failed) {
          lines.push(`**${c.id} ${c.name}** (${c.complexity})`);
          for (const err of c.errors) lines.push(`- ${err}`);
          lines.push("");
        }
      }
    }
  }

  lines.push("\n## 结论\n");
  lines.push("_待根据新的三方案评估结果补充。建议重点观察 keyed-gradient 是否能在保留互斥语义的同时降低 type+param 的配对负担。_\n");
  return lines.join("\n");
}

main().catch((e) => {
  console.error("运行错误:", e);
  process.exit(1);
});
