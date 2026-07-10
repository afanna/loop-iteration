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

type StyleStrategy = "mixed" | "string-all" | "structured";

const STRATEGIES: StyleStrategy[] = ["mixed", "string-all", "structured"];
const MAX_RETRIES = 1;
const D4_SHOT_LEVELS = [0, 1, 3] as const;
const D6_REPEATS = 3;
const D4_SAMPLE_SIZE = 10;
const D6_SAMPLE_SIZE = 8;

// ============================================================================
// 策略专属规则
// ============================================================================

function getMixedRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段（如"Text"、"Button"、"Column"）。',
    '3. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    '5. Text组件必须包含"content"。Button必须包含"label"。TextInput必须包含"placeholder"。',
    '6. 动态值整个用{{ }}包裹：纯动态"{{ $var }}"，混合文本"{{ \'Hello, \' + $var }}"。',
    "7. 每个{{ }}仅包含一个完整表达式，不支持在一对双引号中使用多个{{ }}表达式。",
    "8. 变量用$前缀，函数直接调用无前缀（如formatNumber($price, 2)）。",
    "9. 【关键】样式值类型（混合类型 — 当前协议设计）：",
    '   - 尺寸/间距属性使用数字：padding: 16, borderRadius: 8, fontSize: 20',
    '   - 百分比/特殊尺寸使用字符串：width: "100%", width: "matchParent"',
    '   - 颜色使用字符串：backgroundColor: "#FFFFFF", fontColor: "#333333"',
    '   - 枚举值使用字符串：textAlign: "center", justifyContent: "spaceBetween"',
    "   - 透明度使用数字：opacity: 0.8",
    '   - 方向性边距使用对象：padding: {"top": 8, "left": 16}, margin: {"bottom": 12}',
    "   - 字重使用数字：fontWeight: 700",
    '10. theme字段使用固定字符串值（如"heading1"），不使用{{ }}。',
  ];
}

function getStringAllRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段（如"Text"、"Button"、"Column"）。',
    '3. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    '5. Text组件必须包含"content"。Button必须包含"label"。TextInput必须包含"placeholder"。',
    '6. 动态值整个用{{ }}包裹：纯动态"{{ $var }}"，混合文本"{{ \'Hello, \' + $var }}"。',
    "7. 每个{{ }}仅包含一个完整表达式，不支持在一对双引号中使用多个{{ }}表达式。",
    "8. 变量用$前缀，函数直接调用无前缀（如formatNumber($price, 2)）。",
    "9. 【关键】样式值类型（统一字符串）：",
    "   - 所有样式属性值都是字符串类型",
    '   - 数字值用字符串：padding: "16", borderRadius: "8", fontSize: "20"',
    '   - 百分比/特殊尺寸：width: "100%", width: "matchParent"',
    '   - 颜色：backgroundColor: "#FFFFFF", fontColor: "#333333"',
    '   - 枚举值：textAlign: "center", justifyContent: "spaceBetween"',
    '   - 透明度：opacity: "0.8"',
    '   - 方向性边距用空格分隔字符串：padding: "8 16"',
    '   - 字重：fontWeight: "700"',
    "   - 任何样式值都不要使用数字类型或对象类型",
    '10. theme字段使用固定字符串值（如"heading1"），不使用{{ }}。',
  ];
}

function getStructuredRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段（如"Text"、"Button"、"Column"）。',
    '3. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    '5. Text组件必须包含"content"。Button必须包含"label"。TextInput必须包含"placeholder"。',
    '6. 动态值整个用{{ }}包裹：纯动态"{{ $var }}"，混合文本"{{ \'Hello, \' + $var }}"。',
    "7. 每个{{ }}仅包含一个完整表达式，不支持在一对双引号中使用多个{{ }}表达式。",
    "8. 变量用$前缀，函数直接调用无前缀（如formatNumber($price, 2)）。",
    "9. 【关键】样式值类型（结构化对象）：",
    "   - 所有样式属性值都是结构化对象",
    '   - 尺寸值：padding: {"value": 16, "unit": "vp"}, fontSize: {"value": 20, "unit": "fp"}',
    '   - 百分比：width: {"value": 100, "unit": "%"}',
    '   - 特殊尺寸：width: {"value": "matchParent"}',
    '   - 颜色：backgroundColor: {"value": "#FFFFFF"}',
    '   - 枚举值：textAlign: {"value": "center"}',
    '   - 透明度：opacity: {"value": 0.8}',
    '   - 方向性边距：padding: {"top": {"value": 8, "unit": "vp"}, "left": {"value": 16, "unit": "vp"}}',
    '   - 字重：fontWeight: {"value": 700}',
    "   - 任何样式值都不要使用裸数字或裸字符串",
    '10. theme字段使用固定字符串值（如"heading1"），不使用{{ }}。',
  ];
}

// ============================================================================
// Few-shot 示例
// ============================================================================

const MIXED_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 基础样式：",
  '输入："生成Column，id为\'box\'，padding为16"',
  "输出：",
  '{"id": "box", "component": "Column", "children": [], "styles": {"padding": 16}}',
  "",
  "示例2 - 多样式混合：",
  '输入："生成Text，id为\'title\'，字号20，字重700，颜色#333"',
  "输出：",
  '{"id": "title", "component": "Text", "content": "标题", "styles": {"fontSize": 20, "fontWeight": 700, "fontColor": "#333333"}}',
  "",
  "示例3 - 方向性边距：",
  '输入："生成Column，id为\'section\'，padding上8左16"',
  "输出：",
  '{"id": "section", "component": "Column", "children": [], "styles": {"padding": {"top": 8, "left": 16}}}',
].join("\n");

const STRING_ALL_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 基础样式（全字符串）：",
  '输入："生成Column，id为\'box\'，padding为16"',
  "输出：",
  '{"id": "box", "component": "Column", "children": [], "styles": {"padding": "16"}}',
  "",
  "示例2 - 多样式（全字符串）：",
  '输入："生成Text，id为\'title\'，字号20，字重700，颜色#333"',
  "输出：",
  '{"id": "title", "component": "Text", "content": "标题", "styles": {"fontSize": "20", "fontWeight": "700", "fontColor": "#333333"}}',
  "",
  "示例3 - 方向性边距（全字符串）：",
  '输入："生成Column，id为\'section\'，padding上8左16"',
  "输出：",
  '{"id": "section", "component": "Column", "children": [], "styles": {"padding": "8 16"}}',
].join("\n");

const STRUCTURED_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 基础样式（结构化对象）：",
  '输入："生成Column，id为\'box\'，padding为16"',
  "输出：",
  '{"id": "box", "component": "Column", "children": [], "styles": {"padding": {"value": 16, "unit": "vp"}}}',
  "",
  "示例2 - 多样式（结构化对象）：",
  '输入："生成Text，id为\'title\'，字号20，字重700，颜色#333"',
  "输出：",
  '{"id": "title", "component": "Text", "content": "标题", "styles": {"fontSize": {"value": 20, "unit": "fp"}, "fontWeight": {"value": 700}, "fontColor": {"value": "#333333"}}}',
  "",
  "示例3 - 方向性边距（结构化对象）：",
  '输入："生成Column，id为\'section\'，padding上8左16"',
  "输出：",
  '{"id": "section", "component": "Column", "children": [], "styles": {"padding": {"top": {"value": 8, "unit": "vp"}, "left": {"value": 16, "unit": "vp"}}}}',
].join("\n");

// ============================================================================
// Prompt 构建
// ============================================================================

let _baseSummary = "";

async function loadSummaries(): Promise<void> {
  const path = resolve(TOOLKIT_ROOT, "prompts", "protocol-inline-summary.md");
  _baseSummary = await readFile(path, "utf-8");
}

function buildSystemPrompt(strategy: StyleStrategy): string {
  const rules = strategy === "mixed" ? getMixedRules() : strategy === "string-all" ? getStringAllRules() : getStructuredRules();

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
  strategy: StyleStrategy,
  shotCount: number = 3,
): string {
  const fullExamples = strategy === "mixed" ? MIXED_EXAMPLES : strategy === "string-all" ? STRING_ALL_EXAMPLES : STRUCTURED_EXAMPLES;
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

function resolveRules(testCase: VariableScopeTestCase, strategy: StyleStrategy): ValidationRule[] {
  if (testCase.shared_rules && testCase.strategy_rules) {
    const strategyRules = (testCase.strategy_rules as Record<string, ValidationRule[]>)[strategy] || [];
    return [...testCase.shared_rules, ...strategyRules];
  }
  return testCase.validation_rules;
}

// ============================================================================
// 评估主逻辑
// ============================================================================

async function loadStyleValueTypeTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(PROJECT_ROOT, "eval/design-points", "style-value-type", "test-cases", "style-value-type.json");
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as VariableScopeTestCase[];
}

async function main() {
  console.log("=".repeat(70));
  console.log("样式值类型系统对比 — 6维度量化评估");
  console.log("mixed (当前混合类型) vs string-all (统一字符串) vs structured (结构化对象)");
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

  const allTestCases = await loadStyleValueTypeTestCases();
  console.log(`已加载 ${allTestCases.length} 个样式值类型测试用例`);

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
  const reportsDir = resolveReportsDir("eval/design-points/style-value-type/reports");
  await mkdir(reportsDir, { recursive: true });

  const allEvaluations: StrategyEvaluation[] = [];

  for (const modelConfig of models) {
    for (const strategy of STRATEGIES) {
      console.log(`\n${"=".repeat(70)}`);
      console.log(`${modelConfig.displayName} | ${strategy}`);
      console.log(`${"=".repeat(70)}\n`);

      const systemPrompt = buildSystemPrompt(strategy);

      // Phase A: 主测试
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

      for (const [tierName, tierCases] of [["simple", simple], ["medium", medium], ["complex", complex_]] as const) {
        const tierResults = tierCases.map((tc) => mainResults.find((r) => r.id === tc.id)!).filter(Boolean);
        const tierPass = tierResults.filter((r) => r.passed).length;
        console.log(`  ${tierName}: ${tierPass}/${tierResults.length} 通过`);
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

  // ============================================================
  // 生成对比报告
  // ============================================================
  console.log(`\n${"=".repeat(70)}`);
  console.log("对比汇总");
  console.log(`${"=".repeat(70)}\n`);

  for (const model of models) {
    console.log(`\n### ${model.displayName}\n`);
    console.log("| 维度 | mixed | string-all | structured |");
    console.log("|------|-------|------------|------------|");

    const mixed = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "mixed")!;
    const stringAll = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "string-all")!;
    const structured = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "structured")!;

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
      const mv = fn(mixed.dimensions);
      const sv = fn(stringAll.dimensions);
      const stv = fn(structured.dimensions);
      console.log(`| ${label} | ${(mv * 100).toFixed(1)}% | ${(sv * 100).toFixed(1)}% | ${(stv * 100).toFixed(1)}% |`);
    }

    console.log(`\n  mixed: ${mixed.dimensions.ma_grade} | string-all: ${stringAll.dimensions.ma_grade} | structured: ${structured.dimensions.ma_grade}`);
  }

  const report: VariableScopeComparisonReport = {
    timestamp: new Date().toISOString(),
    protocol_version: "v2.0",
    evaluation_type: "style-value-type-6d",
    models: models.map((m) => m.displayName),
    total_cases: allTestCases.length,
    strategies: allEvaluations,
  };

  const jsonPath = resolve(reportsDir, `style-type-comparison-${timestamp}.json`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");

  const mdPath = resolve(reportsDir, `style-type-comparison-${timestamp}.md`);
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
  strategy: StyleStrategy,
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
    id: testCase.id, name: testCase.name, category: testCase.category, complexity: testCase.complexity,
    passed, tokens, time_ms: timeMs, retries: retryCount, errors,
    raw_output: rawOutput, generated_dsl: generatedDsl, levels,
  };
}

function buildMarkdownReport(report: VariableScopeComparisonReport): string {
  const lines: string[] = [];
  lines.push("# 样式值类型系统对比 — 6维度量化评估报告");
  lines.push(`\n日期: ${report.timestamp.split("T")[0]}`);
  lines.push(`协议版本: ${report.protocol_version}`);
  lines.push(`测试用例: ${report.total_cases} 个`);
  lines.push(`模型: ${report.models.join(", ")}`);
  lines.push(`对比: mixed (当前混合类型) vs string-all (统一字符串) vs structured (结构化对象)\n`);

  for (const modelName of report.models) {
    const mixed = report.strategies.find((e) => e.model_name === modelName && e.strategy === "mixed")!;
    const stringAll = report.strategies.find((e) => e.model_name === modelName && e.strategy === "string-all")!;
    const structured = report.strategies.find((e) => e.model_name === modelName && e.strategy === "structured")!;

    lines.push(`## ${modelName}\n`);
    lines.push("### 6维度评分对比\n");
    lines.push("| 维度 | 权重 | mixed | string-all | structured |");
    lines.push("|------|------|-------|------------|------------|");

    const entries: [string, number, number, number, number][] = [
      ["D1 语法准确率", 0.20, mixed.dimensions.d1_syntactic_accuracy, stringAll.dimensions.d1_syntactic_accuracy, structured.dimensions.d1_syntactic_accuracy],
      ["D2 语义准确率", 0.25, mixed.dimensions.d2_semantic_accuracy, stringAll.dimensions.d2_semantic_accuracy, structured.dimensions.d2_semantic_accuracy],
      ["D3 生成效率", 0.15, mixed.dimensions.d3_generation_efficiency, stringAll.dimensions.d3_generation_efficiency, structured.dimensions.d3_generation_efficiency],
      ["D4 学习曲线", 0.15, mixed.dimensions.d4_learning_curve, stringAll.dimensions.d4_learning_curve, structured.dimensions.d4_learning_curve],
      ["D5 边界鲁棒性", 0.15, mixed.dimensions.d5_edge_robustness, stringAll.dimensions.d5_edge_robustness, structured.dimensions.d5_edge_robustness],
      ["D6 一致稳定性", 0.10, mixed.dimensions.d6_consistency, stringAll.dimensions.d6_consistency, structured.dimensions.d6_consistency],
    ];

    for (const [label, weight, mv, sv, stv] of entries) {
      lines.push(`| ${label} | ${(weight * 100).toFixed(0)}% | ${(mv * 100).toFixed(1)}% | ${(sv * 100).toFixed(1)}% | ${(stv * 100).toFixed(1)}% |`);
    }

    lines.push(`| **MA综合** | **100%** | **${(mixed.dimensions.ma_overall * 100).toFixed(1)}% (${mixed.dimensions.ma_grade})** | **${(stringAll.dimensions.ma_overall * 100).toFixed(1)}% (${stringAll.dimensions.ma_grade})** | **${(structured.dimensions.ma_overall * 100).toFixed(1)}% (${structured.dimensions.ma_grade})** |`);

    if (mixed.dimensions.learning_curve && stringAll.dimensions.learning_curve && structured.dimensions.learning_curve) {
      lines.push("\n### D4 学习曲线明细\n");
      lines.push("| shot数 | mixed | string-all | structured |");
      lines.push("|--------|-------|------------|------------|");
      lines.push(`| 0-shot | ${(mixed.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% | ${(stringAll.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% | ${(structured.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 1-shot | ${(mixed.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% | ${(stringAll.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% | ${(structured.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 3-shot | ${(mixed.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% | ${(stringAll.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% | ${(structured.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% |`);
    }

    if (mixed.dimensions.consistency_detail && stringAll.dimensions.consistency_detail && structured.dimensions.consistency_detail) {
      lines.push("\n### D6 一致性明细\n");
      lines.push("| 指标 | mixed | string-all | structured |");
      lines.push("|------|-------|------------|------------|");
      lines.push(`| 结构一致率 | ${(mixed.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% | ${(stringAll.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% | ${(structured.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% |`);
      lines.push(`| 语义等价率 | ${(mixed.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% | ${(stringAll.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% | ${(structured.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% |`);
    }

    for (const eval_ of [mixed, stringAll, structured]) {
      const failed = eval_.main_results.filter((r) => !r.passed);
      if (failed.length > 0) {
        lines.push(`\n### ${eval_.strategy} 失败用例 (${failed.length}/${eval_.total_cases})\n`);
        for (const c of failed) {
          lines.push(`**${c.id} ${c.name}** (${c.complexity})`);
          for (const err of c.errors) lines.push(`  - ${err}`);
          if (c.raw_output) lines.push(`  - 原始输出: \`${c.raw_output.substring(0, 200)}\``);
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
    id: tc.id, name: tc.name, category: tc.category, complexity: tc.complexity,
    passed: false, tokens: 0, time_ms: 0, retries: 0,
    errors: [errorMsg], raw_output: "", generated_dsl: null,
  };
}

main().catch((e) => {
  console.error("运行错误:", e);
  process.exit(1);
});
