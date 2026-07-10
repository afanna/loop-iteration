import "dotenv/config";
import {
  loadModelConfigs,
  loadVariableSystemTestCases,
  loadFullProtocolSummary,
  resolveReportsDir,
} from "../config.js";
import { callLLM } from "../llm/client.js";
import { validate } from "../core/validator.js";
import {
  calcD1, calcD2, calcD3, calcD4, calcD5, calcD6, calcMA,
  type CaseResultWithLevels,
} from "../core/scorer.js";
import { writeFile, mkdir } from "fs/promises";
import { resolve } from "path";
import type {
  TestCase,
  PerCaseResult,
  DimensionScores,
  CategoryBreakdown,
} from "../core/types.js";

const MAX_RETRIES = 1;
const D4_SAMPLE_SIZE = 15;
const D6_SAMPLE_SIZE = 10;
const D6_REPEATS = 3;

const FEW_SHOT_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 全局变量：",
  '输入："生成Extended.Column，align根据$__widthBreakpoint动态设置"',
  "输出：",
  '{"id": "col", "component": "Extended.Column", "align": "{{ $__widthBreakpoint == \'sm\' ? \'center\' : \'start\' }}", "children": ["t1"]}',
  "",
  "示例2 - DataModel + 列表：",
  '输入："生成List显示/products数据，模板显示每个商品的$item.name和$item.price"',
  "输出：",
  "[",
  '  {"id": "list1", "component": "Extended.List", "children": {"componentId": "item", "path": "/products"}},',
  '  {"id": "item", "component": "Extended.Text", "text": "{{ $item.name + \' - ¥\' + $item.price }}"}',
  "]",
  "",
  "示例3 - as绑定：",
  '输入："生成Button点击时先validate(as=vR)再根据$vR==0调用submit"',
  "输出：",
  '{"id": "btn", "component": "Extended.Button", "label": "提交", "onClick": [{"id": "v1", "call": "validate", "as": "vR"}, {"id": "s1", "call": "submit", "condition": "{{ $vR == 0 }}"}]}',
  "",
  "示例4 - 混合变量：",
  '输入："生成Text显示$__dataModel.user.name，textColor根据$__colorMode设置"',
  "输出：",
  '{"id": "t2", "component": "Extended.Text", "text": "{{ $__dataModel.user.name }}", "styles": {"textColor": "{{ $__colorMode == \'dark\' ? \'#FFFFFF\' : \'#000000\' }}"}}',
].join("\n");

let _protocolSummary = "";

async function loadSummaries(): Promise<void> {
  _protocolSummary = await loadFullProtocolSummary();
}

const SYSTEM_RULES = [
  "1. 只输出JSON（单个对象或数组），不要包含任何其他文字、说明或markdown代码块标记。",
  '2. 每个组件必须有"component"字段，使用Extended.前缀（如"Extended.Text"、"Extended.Button"）。',
  '3. 不要把组件名当作key（错误：{"Extended.Text": {...}}），正确：{"component": "Extended.Text", ...}。',
  "4. 动态值使用{{ }}表达式语法。",
  "5. 样式属性放在styles对象中。",
  "6. 事件名直接作为组件属性（如onClick、onChange），值是EventHandler数组 [{id, call, as?, args?, condition?}]，按顺序执行。不要使用listeners包装层。as绑定创建局部变量（如as:'vR'），后续行为通过$vR引用。",
  "7. 条件渲染使用Extended.If组件，condition字段使用表达式。",
  "8. 列表模板渲染使用children: {componentId, path}格式，模板中用$item.fieldName引用当前项字段（如$item.name、$item.price），用$index引用索引。自定义itemVar时用$customName.fieldName。",
  "9. 全局系统变量（$__widthBreakpoint, $__colorMode）使用双下划线前缀。",
  "10. DataModel 数据使用 $__dataModel.xxx.yyy 绝对路径引用。",
  "11. 行为链中使用 as 绑定创建局部变量，后续行为通过 $变量名 引用。",
  "12. 同名冲突时：as局部变量用$xxx，DataModel用$__dataModel.xxx显式区分。",
  "13. 事件参数通过 $context.eventData 和 $context.componentId 访问。",
];

function buildSystemPrompt(): string {
  return [
    "你是鸿蒙智能体UI协议的DSL生成器。严格按照下面的协议规范生成JSON。",
    "",
    "# 协议规范",
    "",
    _protocolSummary,
    "",
    "# 重要规则",
    "",
    ...SYSTEM_RULES,
  ].join("\n");
}

function buildUserPrompt(testCase: TestCase, shotCount: number = 3): string {
  let examples = "";
  if (shotCount >= 3) {
    examples = FEW_SHOT_EXAMPLES;
  } else if (shotCount === 1) {
    const lines = FEW_SHOT_EXAMPLES.split("\n");
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

  const rules = testCase.validation_rules || [];
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
  parts.push("", "请只输出JSON（单个对象或数组），不要包含任何其他内容。");

  return parts.join("\n");
}

async function main() {
  console.log("=".repeat(70));
  console.log("4.4.4 变量体系模型亲和性评估 — 6 维度量化评估");
  console.log("System A（当前协议设计）：单方案验证");
  console.log("=".repeat(70));

  let models = loadModelConfigs();
  const skipModels = (process.env.SKIP_MODELS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (skipModels.length > 0) { models = models.filter((m) => !skipModels.some((s) => m.name.includes(s))); console.log(`跳过模型: ${skipModels.join(", ")}`); }
  const onlyModel = process.env.ONLY_MODEL;
  if (onlyModel) { models = models.filter((m) => m.name === onlyModel); console.log(`仅运行模型: ${onlyModel}`); }
  if (models.length === 0) { console.error("\n错误: 未配置任何模型。"); process.exit(1); }
  console.log(`\n已配置 ${models.length} 个模型: ${models.map((m) => m.displayName).join(", ")}`);

  const allTestCases = await loadVariableSystemTestCases();
  console.log(`已加载 ${allTestCases.length} 个变量体系测试用例`);

  const categories = [...new Set(allTestCases.map((tc) => tc.category))];
  for (const cat of categories) {
    const catCases = allTestCases.filter((tc) => tc.category === cat);
    const simple = catCases.filter((tc) => tc.complexity === "simple").length;
    const medium = catCases.filter((tc) => tc.complexity === "medium").length;
    const complex = catCases.filter((tc) => tc.complexity === "complex").length;
    console.log(`  ${cat}: ${catCases.length} (simple:${simple} medium:${medium} complex:${complex})`);
  }

  await loadSummaries();

  const d4Cases = allTestCases.slice(0, Math.min(D4_SAMPLE_SIZE, allTestCases.length));
  const d6Cases = allTestCases.slice(0, Math.min(D6_SAMPLE_SIZE, allTestCases.length));

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const reportsDir = resolveReportsDir("eval/design-points/variable-system/reports");
  await mkdir(reportsDir, { recursive: true });

  const systemPrompt = buildSystemPrompt();

  for (const modelConfig of models) {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`${modelConfig.displayName}`);
    console.log(`${"=".repeat(70)}\n`);

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
      if (!result.passed) for (const err of result.errors) console.log(`    -> ${err}`);
    }

    // Phase B: D4 学习曲线
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
        if (skipped) { shotResults.push(makeErrorResult(tc, "跳过（API不可用）")); continue; }
        try {
          const userPrompt = buildUserPrompt(tc, shotCount);
          const response = await callLLM(modelConfig, systemPrompt, userPrompt);
          const vResult = validate(response.content, tc);
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

    // Phase C: D6 一致性
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
          const userPrompt = buildUserPrompt(tc, 3);
          const response = await callLLM(modelConfig, systemPrompt, userPrompt);
          const vResult = validate(response.content, tc);
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

    // Phase D: 评分
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

    console.log(`  D1 语法准确率:    ${(d1 * 100).toFixed(1)}%`);
    console.log(`  D2 语义准确率:    ${(d2 * 100).toFixed(1)}%`);
    console.log(`  D3 生成效率:      ${(d3 * 100).toFixed(1)}%`);
    console.log(`  D4 学习曲线:      ${(d4 * 100).toFixed(1)}% (0:${(shot0Acc * 100).toFixed(0)}% -> 1:${(shot1Acc * 100).toFixed(0)}% -> 3:${(shot3Acc * 100).toFixed(0)}%)`);
    console.log(`  D5 边界鲁棒性:    ${(d5 * 100).toFixed(1)}%`);
    console.log(`  D6 一致稳定性:    ${(d6 * 100).toFixed(1)}%`);
    console.log(`  ─────────────────────────`);
    console.log(`  MA 综合分:        ${(maScore * 100).toFixed(1)}% (${maGrade})`);

    // 分类统计
    console.log(`\n  分类通过率:`);
    for (const cat of categories) {
      const catResults = mainResults.filter((r) => r.category === cat);
      const passed = catResults.filter((r) => r.passed).length;
      console.log(`    ${cat}: ${(catResults.length > 0 ? passed / catResults.length * 100 : 0).toFixed(1)}% (${passed}/${catResults.length})`);
    }

    // 保存报告
    const dimensions: DimensionScores = {
      d1_syntactic_accuracy: d1, d2_semantic_accuracy: d2,
      d3_generation_efficiency: d3, d4_learning_curve: d4,
      d5_edge_robustness: d5, d6_consistency: d6,
      ma_overall: maScore, ma_grade: maGrade,
      learning_curve: lcDetail, consistency_detail: conDetail,
    };

    const categoryBreakdown: Record<string, CategoryBreakdown> = {};
    for (const cat of categories) {
      const catResults = mainResults.filter((r) => r.category === cat);
      const passed = catResults.filter((r) => r.passed).length;
      categoryBreakdown[cat] = { total: catResults.length, passed, accuracy: catResults.length > 0 ? passed / catResults.length : 0 };
    }

    const report = {
      timestamp: new Date().toISOString(),
      protocol_version: "harmonyos-extended-v2",
      evaluation_type: "variable-system-6d",
      model_name: modelConfig.displayName,
      total_cases: allTestCases.length,
      dimensions,
      category_breakdown: categoryBreakdown,
      main_results: mainResults,
      learning_results: learningResults,
      consistency_results: consistencyResults,
    };

    const jsonPath = resolve(reportsDir, `variable-system-${modelConfig.name}-${timestamp}.json`);
    await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");
    console.log(`\n报告已保存: ${jsonPath}`);
  }

  console.log("\n评估完成！");
}

async function runSingleCase(
  modelConfig: import("../core/types.js").LLMModelConfig,
  testCase: TestCase,
  systemPrompt: string,
  maxRetries: number,
): Promise<CaseResultWithLevels> {
  let passed = false, errors: string[] = [], retryCount = 0, tokens = 0, timeMs = 0, rawOutput = "", generatedDsl: Record<string, unknown> | null = null;
  let levels = { l1_json_parsed: false, l2_structure_ok: false, l3_patterns_ok: false, l4_rules_ok: false };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const userPrompt = buildUserPrompt(testCase, 3);
      const response = await callLLM(modelConfig, systemPrompt, userPrompt);
      rawOutput = response.content; tokens = response.tokens; timeMs = response.elapsedMs; retryCount = attempt;
      const vResult = validate(rawOutput, testCase);
      passed = vResult.passed; errors = vResult.errors; generatedDsl = vResult.generated; levels = vResult.levels || levels;
      if (passed || attempt === maxRetries) break;
    } catch (e) {
      errors = [`LLM调用错误: ${(e as Error).message}`];
      retryCount = attempt;
    }
  }

  return { id: testCase.id, name: testCase.name, category: testCase.category, complexity: testCase.complexity, passed, tokens, time_ms: timeMs, retries: retryCount, errors, raw_output: rawOutput, generated_dsl: generatedDsl, levels };
}

function makeErrorResult(tc: TestCase, errorMsg: string): PerCaseResult {
  return { id: tc.id, name: tc.name, category: tc.category, complexity: tc.complexity, passed: false, tokens: 0, time_ms: 0, retries: 0, errors: [errorMsg], raw_output: "", generated_dsl: null };
}

main().catch((e) => { console.error("运行错误:", e); process.exit(1); });
