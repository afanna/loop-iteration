import "dotenv/config";
import { loadModelConfigs, resolveReportsDir, TOOLKIT_ROOT } from "../config.js";
import { callLLM } from "../llm/client.js";
import { validate } from "../core/validator.js";
import { calcD1, calcD2, calcD3, calcD4, calcD5, calcD6, calcMA, type CaseResultWithLevels } from "../core/scorer.js";
import { writeFile, mkdir, readFile } from "fs/promises";
import { resolve } from "path";
import type {
  VariableScopeTestCase,
  PerCaseResult,
  StrategyEvaluation,
  DimensionScores,
  ValidationRule,
} from "../core/types.js";

type NavStrategy = "navigation" | "navcontainer";

const STRATEGIES: NavStrategy[] = ["navigation", "navcontainer"];
const MAX_RETRIES = 1;
const D4_SAMPLE_SIZE = 8;
const D6_REPEATS = 3;
const D6_SAMPLE_SIZE = 6;

// ============================================================================
// 方案 A 规则 — Navigation（当前协议）
// ============================================================================

function getNavigationRules(): string[] {
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
    "10. 【关键】Navigation 是导航布局组件，支持配置多个子页面及子页面间跳转。",
    "    - 必须包含 title 属性（页面标题）",
    "    - children 是子组件ID列表，currentIndex 是当前显示的子页面下标",
    "    - styles 可设置 backgroundColor（标题栏背景颜色）",
    '    示例：{"component": "Navigation", "id": "nav1", "children": ["p1", "p2"], "currentIndex": 0, "title": "应用导航"}',
    "11. 事件名直接作为组件属性（如onClick、onChange），值是action数组。",
    "12. 可用行为：setDataModel, navigate, setAttributes, sendToLLM, break",
    "13. navigate 跳转 Navigation 子页面：args 包含 componentId（目标Navigation组件）和 targetComponentId（目标子页面ID）",
    '14. theme字段使用固定字符串值（如"heading1"），不使用{{ }}。',
  ];
}

// ============================================================================
// 方案 B 规则 — NavContainer（提议新协议）
// ============================================================================

function getNavContainerRules(): string[] {
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
    "10. 【关键】NavContainer 是导航容器组件，通过堆叠方式管理多个子页面，同一时间只显示 currentIndex 指定的子页面。",
    "    - children 是子组件ID列表，每个子组件代表一个页面",
    "    - currentIndex 是当前显示的子页面下标（默认0），支持表达式绑定",
    "    - NavContainer 是纯容器，不包含 title、backgroundColor 等样式属性",
    '    示例：{"component": "NavContainer", "id": "nav1", "children": ["p1", "p2"], "currentIndex": 0}',
    "11. 事件名直接作为组件属性（如onClick、onChange），值是action数组。",
    "12. 可用行为：setDataModel, navigate, setAttributes, sendToLLM, break",
    "13. navigate 跳转 NavContainer 子页面：args 包含 componentId（目标NavContainer组件）和 targetComponentId（目标子页面ID）",
    '14. theme字段使用固定字符串值（如"heading1"），不使用{{ }}。',
  ];
}

// ============================================================================
// Few-shot 示例
// ============================================================================

const NAVIGATION_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - Navigation容器：",
  '输入："生成一个Navigation组件，id为\'app_nav\'，children为[\"home\", \"detail\"]，currentIndex为0，title为\'我的应用\'"',
  "输出：",
  '{"id": "app_nav", "component": "Navigation", "children": ["home", "detail"], "currentIndex": 0, "title": "我的应用"}',
  "",
  "示例2 - navigate跳转：",
  '输入："生成一个Button，id为\'go_btn\'，label为\'跳转\'，点击后navigate到Navigation组件\'main_nav\'的子页面\'page_2\'"',
  "输出：",
  '{"id": "go_btn", "component": "Button", "label": "跳转", "onClick": [{"call": "navigate", "args": {"componentId": "main_nav", "targetComponentId": "page_2"}}]}',
  "",
  "示例3 - Navigation带样式：",
  '输入："生成一个Navigation组件，id为\'nav\'，children为[\"a\", \"b\"]，currentIndex为0，title为\'标题\'，标题栏背景色为#1890FF"',
  "输出：",
  '{"id": "nav", "component": "Navigation", "children": ["a", "b"], "currentIndex": 0, "title": "标题", "styles": {"backgroundColor": "#1890FF"}}',
].join("\n");

const NAVCONTAINER_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - NavContainer容器：",
  '输入："生成一个NavContainer组件，id为\'app_nav\'，children为[\"home\", \"detail\"]，currentIndex为0"',
  "输出：",
  '{"id": "app_nav", "component": "NavContainer", "children": ["home", "detail"], "currentIndex": 0}',
  "",
  "示例2 - navigate跳转：",
  '输入："生成一个Button，id为\'go_btn\'，label为\'跳转\'，点击后navigate到NavContainer组件\'main_nav\'的子页面\'page_2\'"',
  "输出：",
  '{"id": "go_btn", "component": "Button", "label": "跳转", "onClick": [{"call": "navigate", "args": {"componentId": "main_nav", "targetComponentId": "page_2"}}]}',
  "",
  "示例3 - NavContainer表达式绑定currentIndex：",
  '输入："生成一个NavContainer，id为\'pager\'，children为[\"s1\", \"s2\", \"s3\"]，currentIndex绑定$__dataModel.activeIndex"',
  "输出：",
  '{"id": "pager", "component": "NavContainer", "children": ["s1", "s2", "s3"], "currentIndex": "{{ $__dataModel.activeIndex }}"}',
].join("\n");

// ============================================================================
// Prompt 构建
// ============================================================================

let _baseSummary = "";

async function loadSummaries(): Promise<void> {
  const path = resolve(TOOLKIT_ROOT, "prompts", "protocol-summary.md");
  _baseSummary = await readFile(path, "utf-8");
}

function buildSystemPrompt(strategy: NavStrategy): string {
  const rules = strategy === "navigation" ? getNavigationRules() : getNavContainerRules();
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
  strategy: NavStrategy,
  shotCount: number = 3,
): string {
  const fullExamples = strategy === "navigation" ? NAVIGATION_EXAMPLES : NAVCONTAINER_EXAMPLES;

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

  const rules = testCase.shared_rules && testCase.strategy_rules
    ? [...testCase.shared_rules, ...((testCase.strategy_rules as Record<string, ValidationRule[]>)[strategy] || [])]
    : (testCase.validation_rules || []);
  const reqs = rules.map((r: ValidationRule, i: number) => `${i + 1}. ${r.description}`).join("\n");
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

// ============================================================================
// 评估主逻辑
// ============================================================================

async function loadTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "nav-container", "test-cases", "nav-container.json");
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as VariableScopeTestCase[];
}

function makeErrorResult(tc: VariableScopeTestCase, errorMsg: string): CaseResultWithLevels {
  return {
    id: tc.id, name: tc.name, category: (tc as any).category || "layout", complexity: tc.complexity,
    passed: false, tokens: 0, time_ms: 0, retries: 0, errors: [errorMsg],
    raw_output: "", generated_dsl: null,
    levels: { l1_json_parsed: false, l2_structure_ok: false, l3_patterns_ok: false, l4_rules_ok: false },
  };
}

async function runSingleCase(
  modelConfig: import("../core/types.js").LLMModelConfig,
  testCase: VariableScopeTestCase,
  systemPrompt: string,
  strategy: NavStrategy,
  maxRetries: number,
): Promise<CaseResultWithLevels> {
  let passed = false, errors: string[] = [], retryCount = 0, tokens = 0, timeMs = 0;
  let rawOutput = "", generatedDsl: Record<string, unknown> | null = null;
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
    id: testCase.id, name: testCase.name,
    category: (testCase as any).category || "layout", complexity: testCase.complexity,
    passed, tokens, time_ms: timeMs, retries: retryCount, errors,
    raw_output: rawOutput, generated_dsl: generatedDsl, levels,
  };
}

async function main() {
  console.log("=".repeat(70));
  console.log("NavContainer 组件重构 A/B 对比 — 6维度量化评估");
  console.log("方案A: Navigation（当前协议：含 title + backgroundColor）");
  console.log("方案B: NavContainer（新协议：纯容器，仅 children + currentIndex）");
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
    console.error("\n错误: 未配置任何模型。请检查 eval/.env 中的 API Key。");
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
  const reportsDir = resolveReportsDir("eval/design-points/nav-container/reports");
  await mkdir(reportsDir, { recursive: true });

  const allEvaluations: StrategyEvaluation[] = [];

  for (const modelConfig of models) {
    for (const strategy of STRATEGIES) {
      console.log(`\n${"=".repeat(70)}`);
      console.log(`${modelConfig.displayName} | ${strategy}`);
      console.log(`${"=".repeat(70)}\n`);

      const systemPrompt = buildSystemPrompt(strategy);

      // Phase A: 主测试
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

      // Phase B: D4 学习曲线
      console.log("\n--- Phase B: D4 ---\n");
      const learningResults: Record<string, PerCaseResult[]> = {};
      learningResults["3"] = mainResults.slice(0, d4Cases.length).map((r) => r as PerCaseResult);

      for (const shotCount of [0, 1] as const) {
        console.log(`  ${shotCount}-shot...`);
        const shotResults: PerCaseResult[] = [];
        let d4Skipped = false;
        for (const tc of d4Cases) {
          if (d4Skipped) {
            shotResults.push(makeErrorResult(tc, "跳过"));
            continue;
          }
          try {
            const userPrompt = buildUserPrompt(tc, strategy, shotCount);
            const response = await callLLM(modelConfig, systemPrompt, userPrompt);
            const vResult = validate(response.content, tc, strategy);
            shotResults.push({
              id: tc.id, name: tc.name,
              category: (tc as any).category || "layout", complexity: tc.complexity,
              passed: vResult.passed, tokens: response.tokens, time_ms: response.elapsedMs,
              retries: 0, errors: vResult.errors, raw_output: response.content, generated_dsl: vResult.generated,
            });
          } catch (e: any) {
            const msg = (e as Error).message;
            if (msg.includes("429") || msg.includes("余额")) { d4Skipped = true; }
            shotResults.push(makeErrorResult(tc, msg));
          }
        }
        learningResults[String(shotCount)] = shotResults;
        const passRate = shotResults.filter((r) => r.passed).length / shotResults.length;
        console.log(`    通过率: ${(passRate * 100).toFixed(1)}%`);
      }

      // Phase C: D6 一致性
      console.log("\n--- Phase C: D6 ---\n");
      const consistencyResults: Record<string, PerCaseResult[][]> = {};
      let d6Skipped = false;
      for (const tc of d6Cases) {
        if (d6Skipped) {
          consistencyResults[tc.id] = [[mainResults.find((r) => r.id === tc.id) as PerCaseResult]];
          continue;
        }
        const group: PerCaseResult[][] = [];
        const first = mainResults.find((r) => r.id === tc.id);
        if (first) group.push([first as PerCaseResult]);
        for (let rep = 1; rep < D6_REPEATS; rep++) {
          try {
            const userPrompt = buildUserPrompt(tc, strategy, 3);
            const response = await callLLM(modelConfig, systemPrompt, userPrompt);
            const vResult = validate(response.content, tc, strategy);
            group.push([{
              id: tc.id, name: tc.name,
              category: (tc as any).category || "layout", complexity: tc.complexity,
              passed: vResult.passed, tokens: response.tokens, time_ms: response.elapsedMs,
              retries: 0, errors: vResult.errors, raw_output: response.content, generated_dsl: vResult.generated,
            }]);
          } catch (e: any) {
            const msg = (e as Error).message;
            if (msg.includes("429") || msg.includes("余额")) { d6Skipped = true; break; }
          }
        }
        consistencyResults[tc.id] = group;
      }
      console.log(`  ${d6Cases.length} 用例 × ${D6_REPEATS} 次${d6Skipped ? " (部分跳过)" : ""}`);

      // Phase D: 评分
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
    console.log("| 维度 | 方案A: Navigation | 方案B: NavContainer |");
    console.log("|------|-------------------|---------------------|");

    const a = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "navigation")!;
    const b = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "navcontainer")!;

    for (const [label, fn] of [
      ["D1 语法", (d: DimensionScores) => d.d1_syntactic_accuracy],
      ["D2 语义", (d: DimensionScores) => d.d2_semantic_accuracy],
      ["D3 效率", (d: DimensionScores) => d.d3_generation_efficiency],
      ["D4 学习", (d: DimensionScores) => d.d4_learning_curve],
      ["D5 边界", (d: DimensionScores) => d.d5_edge_robustness],
      ["D6 一致", (d: DimensionScores) => d.d6_consistency],
    ] as const) {
      console.log(`| ${label} | ${(fn(a.dimensions) * 100).toFixed(1)}% | ${(fn(b.dimensions) * 100).toFixed(1)}% |`);
    }
    console.log(`| **MA** | **${(a.dimensions.ma_overall * 100).toFixed(1)}% (${a.dimensions.ma_grade})** | **${(b.dimensions.ma_overall * 100).toFixed(1)}% (${b.dimensions.ma_grade})** |`);
    console.log("");
  }

  // 保存报告
  const reportPath = resolve(reportsDir, `nav-container-comparison-${timestamp}.json`);
  const report = {
    title: "NavContainer 组件重构 A/B 对比评估",
    timestamp: new Date().toISOString(),
    strategies: {
      navigation: "当前协议：Navigation 组件（含 title + backgroundColor）",
      navcontainer: "新协议：NavContainer 组件（纯容器，仅 children + currentIndex）",
    },
    total_cases: allTestCases.length,
    models: models.map((m) => m.displayName),
    strategies_detail: allEvaluations,
  };
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n报告已保存: ${reportPath}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
