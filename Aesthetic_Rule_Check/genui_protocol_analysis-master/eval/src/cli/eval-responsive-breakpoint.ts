import "dotenv/config";
import { loadModelConfigs, loadResponsiveBreakpointTestCases, loadProtocolSummary, resolveReportsDir, TOOLKIT_ROOT } from "../config.js";
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

const STRATEGIES: ScopeStrategy[] = ["breakpoint-enum", "window-size"];
const MAX_RETRIES = 1;
const D4_SAMPLE_SIZE = 10;
const D6_SAMPLE_SIZE = 8;
const D6_REPEATS = 3;

// ============================================================================
// 策略专属规则
// ============================================================================

function getBreakpointEnumRules(): string[] {
  return [
    "1. 只输出一个JSON对象（或JSON数组），不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段（如"Extended.Text"、"Extended.Button"、"Extended.Column"、"Extended.If"）。',
    '3. 不要把组件名当作key（错误：{"Extended.Text": {...}}），正确：{"component": "Extended.Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    "5. 动态值使用{{ }}表达式语法，整个属性值为一个表达式字符串。",
    '6. 【关键】响应式断点判断使用全局变量$__widthBreakpoint，值为字符串枚举："xs"、"sm"、"md"、"lg"、"xl"。',
    "   - 小屏设备判断：$__widthBreakpoint == 'sm'",
    "   - 大屏设备判断：$__widthBreakpoint == 'lg' 或 $__widthBreakpoint == 'xl'",
    "   - 非小屏判断：$__widthBreakpoint != 'sm'",
    "7. 断点对应关系：xs(<576px, 小屏手机)、sm(576-768px, 大屏手机)、md(768-992px, 平板竖屏)、lg(992-1200px, 平板横屏)、xl(>1200px, 桌面)。",
    "8. 响应式样式使用三元表达式：\"fontSize\": \"{{ $__widthBreakpoint == 'sm' ? 14 : 18 }}\"。",
    "9. 响应式布局切换使用Extended.If组件：\"condition\": \"{{ $__widthBreakpoint == 'sm' }}\"。",
    "10. 多断点使用链式三元：\"fontSize\": \"{{ $__widthBreakpoint == 'sm' ? 14 : $__widthBreakpoint == 'md' ? 18 : 24 }}\"。",
    "11. 不要使用$__WindowSize变量进行数值比较。",
    "12. 样式属性放在styles对象中。",
    "13. 条件渲染使用Extended.If组件，condition字段使用表达式，childrenIf和childrenElse为子组件ID数组。当需要生成多个组件时，输出JSON数组，展开所有子组件的完整定义。",
  ];
}

function getWindowSizeRules(): string[] {
  return [
    "1. 只输出一个JSON对象（或JSON数组），不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段（如"Extended.Text"、"Extended.Button"、"Extended.Column"、"Extended.If"）。',
    '3. 不要把组件名当作key（错误：{"Extended.Text": {...}}），正确：{"component": "Extended.Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    "5. 动态值使用{{ }}表达式语法，整个属性值为一个表达式字符串。",
    "6. 【关键】响应式断点判断使用全局变量$__WindowSize.width进行数值比较。",
    "   - 小屏设备判断：$__WindowSize.width < 768",
    "   - 大屏设备判断：$__WindowSize.width >= 768 或 $__WindowSize.width >= 992",
    "   - 中屏设备判断：$__WindowSize.width >= 768 && $__WindowSize.width < 992",
    "7. 断点边界参考：小屏手机<576px、大屏手机576-768px、平板竖屏768-992px、平板横屏992-1200px、桌面>1200px。",
    "8. 响应式样式使用三元表达式：\"fontSize\": \"{{ $__WindowSize.width < 768 ? 14 : 18 }}\"。",
    "9. 响应式布局切换使用Extended.If组件：\"condition\": \"{{ $__WindowSize.width < 768 }}\"。",
    "10. 多断点使用链式三元：\"fontSize\": \"{{ $__WindowSize.width < 576 ? 14 : $__WindowSize.width < 992 ? 18 : 24 }}\"。",
    "11. 不要使用$__widthBreakpoint变量进行枚举比较。",
    "12. 样式属性放在styles对象中。",
    "13. 条件渲染使用Extended.If组件，condition字段使用表达式，childrenIf和childrenElse为子组件ID数组。当需要生成多个组件时，输出JSON数组，展开所有子组件的完整定义。",
  ];
}

// ============================================================================
// Few-shot 示例
// ============================================================================

const BREAKPOINT_ENUM_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 响应式样式：",
  '输入："生成Extended.Text显示title变量，小屏fontSize为14，大屏为18"',
  "输出：",
  '{"id": "title", "component": "Extended.Text", "content": "{{ $title }}", "styles": {"fontSize": "{{ $__widthBreakpoint == \'sm\' ? 14 : 18 }}"}}',
  "",
  "示例2 - 响应式显示隐藏：",
  '输入："生成一个sidebar组件，大屏显示flex，小屏隐藏none"',
  "输出：",
  '{"id": "sidebar", "component": "Extended.Column", "children": ["widget1", "widget2"], "styles": {"display": "{{ $__widthBreakpoint != \'sm\' ? \'flex\' : \'none\' }}"}}',
  "",
  "示例3 - 响应式布局切换（输出JSON数组，展开所有子组件）：",
  '输入："小屏使用Column竖直排列item1和item2，大屏使用Row水平排列"',
  "输出：",
  '[',
  '  {"id": "responsive_layout", "component": "Extended.If", "condition": "{{ $__widthBreakpoint == \'sm\' }}", "childrenIf": ["mobile_layout"], "childrenElse": ["desktop_layout"]},',
  '  {"id": "mobile_layout", "component": "Extended.Column", "children": ["item1", "item2"]},',
  '  {"id": "desktop_layout", "component": "Extended.Row", "children": ["item1", "item2"]},',
  '  {"id": "item1", "component": "Extended.Text", "content": "Item 1"},',
  '  {"id": "item2", "component": "Extended.Text", "content": "Item 2"}',
  ']',
].join("\n");

const WINDOW_SIZE_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 响应式样式：",
  '输入："生成Extended.Text显示title变量，小屏fontSize为14，大屏为18"',
  "输出：",
  '{"id": "title", "component": "Extended.Text", "content": "{{ $title }}", "styles": {"fontSize": "{{ $__WindowSize.width < 768 ? 14 : 18 }}"}}',
  "",
  "示例2 - 响应式显示隐藏：",
  '输入："生成一个sidebar组件，大屏显示flex，小屏隐藏none"',
  "输出：",
  '{"id": "sidebar", "component": "Extended.Column", "children": ["widget1", "widget2"], "styles": {"display": "{{ $__WindowSize.width >= 768 ? \'flex\' : \'none\' }}"}}',
  "",
  "示例3 - 响应式布局切换（输出JSON数组，展开所有子组件）：",
  '输入："小屏使用Column竖直排列item1和item2，大屏使用Row水平排列"',
  "输出：",
  '[',
  '  {"id": "responsive_layout", "component": "Extended.If", "condition": "{{ $__WindowSize.width < 768 }}", "childrenIf": ["mobile_layout"], "childrenElse": ["desktop_layout"]},',
  '  {"id": "mobile_layout", "component": "Extended.Column", "children": ["item1", "item2"]},',
  '  {"id": "desktop_layout", "component": "Extended.Row", "children": ["item1", "item2"]},',
  '  {"id": "item1", "component": "Extended.Text", "content": "Item 1"},',
  '  {"id": "item2", "component": "Extended.Text", "content": "Item 2"}',
  ']',
].join("\n");

// ============================================================================
// Prompt 构建
// ============================================================================

let _protocolSummary = "";

async function loadSummaries(): Promise<void> {
  const summaryPath = resolve(TOOLKIT_ROOT, "prompts", "protocol-inline-summary.md");
  _protocolSummary = await readFile(summaryPath, "utf-8");
}

function getStrategyRules(strategy: ScopeStrategy): string[] {
  switch (strategy) {
    case "breakpoint-enum": return getBreakpointEnumRules();
    case "window-size": return getWindowSizeRules();
    default: return getWindowSizeRules();
  }
}

function getStrategyExamples(strategy: ScopeStrategy): string {
  switch (strategy) {
    case "breakpoint-enum": return BREAKPOINT_ENUM_EXAMPLES;
    case "window-size": return WINDOW_SIZE_EXAMPLES;
    default: return WINDOW_SIZE_EXAMPLES;
  }
}

function buildSystemPrompt(strategy: ScopeStrategy): string {
  const rules = getStrategyRules(strategy);

  return [
    "你是鸿蒙智能体UI协议v2.0的DSL生成器。严格按照下面的协议规范生成JSON。",
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
  parts.push("任务：" + testCase.task);
  parts.push("", "要求：", reqs);
  if (hints) parts.push(hints);
  parts.push("", "请只输出JSON（单个对象或数组），不要包含任何其他内容。");

  return parts.join("\n");
}

function resolveRules(testCase: VariableScopeTestCase, strategy: ScopeStrategy): ValidationRule[] {
  if (testCase.shared_rules && testCase.strategy_rules) {
    const strategyRules = testCase.strategy_rules[strategy] || [];
    return [...testCase.shared_rules, ...strategyRules];
  }
  return testCase.validation_rules;
}

// ============================================================================
// 评估主逻辑
// ============================================================================

async function main() {
  console.log("=".repeat(70));
  console.log("响应式断点表达方式亲和性评估 — 6维度量化评估");
  console.log("A: breakpoint-enum ($__widthBreakpoint) vs B: window-size ($__WindowSize.width)");
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

  const allTestCases = await loadResponsiveBreakpointTestCases();
  console.log(`已加载 ${allTestCases.length} 个响应式断点测试用例`);

  const edgeCases = allTestCases.filter((tc) => tc.is_edge === true);
  console.log(`  其中边界用例: ${edgeCases.length} 个`);
  console.log(`  simple: ${allTestCases.filter((tc) => tc.complexity === "simple").length} | medium: ${allTestCases.filter((tc) => tc.complexity === "medium").length} | complex: ${allTestCases.filter((tc) => tc.complexity === "complex").length}`);

  await loadSummaries();

  const d4Cases = allTestCases.slice(0, D4_SAMPLE_SIZE);
  const d6Cases = allTestCases.slice(0, D6_SAMPLE_SIZE);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const reportsDir = resolveReportsDir("eval/design-points/responsive-breakpoint/reports");
  await mkdir(reportsDir, { recursive: true });

  const allEvaluations: StrategyEvaluation[] = [];

  for (const modelConfig of models) {
    for (const strategy of STRATEGIES) {
      console.log(`\n${"=".repeat(70)}`);
      console.log(`${modelConfig.displayName} | ${strategy}`);
      console.log(`${"=".repeat(70)}\n`);

      const systemPrompt = buildSystemPrompt(strategy);

      // Phase A: 主测试 (D1/D2/D3/D5)
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
      console.log(`  D4 学习曲线:      ${(d4 * 100).toFixed(1)}% (0:${(shot0Acc * 100).toFixed(0)}% -> 1:${(shot1Acc * 100).toFixed(0)}% -> 3:${(shot3Acc * 100).toFixed(0)}%)`);
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
    console.log("| 维度 | A: breakpoint-enum | B: window-size | 差值 |");
    console.log("|------|-------------------|----------------|------|");

    const brkEnum = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "breakpoint-enum")!;
    const winSize = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "window-size")!;

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
      const av = fn(brkEnum.dimensions);
      const bv = fn(winSize.dimensions);
      const diff = bv - av;
      const diffStr = diff >= 0 ? `+${(diff * 100).toFixed(1)}%` : `${(diff * 100).toFixed(1)}%`;
      console.log(`| ${label} | ${(av * 100).toFixed(1)}% | ${(bv * 100).toFixed(1)}% | ${diffStr} |`);
    }

    console.log(`\n  A: ${brkEnum.dimensions.ma_grade} | B: ${winSize.dimensions.ma_grade}`);
  }

  const report: VariableScopeComparisonReport = {
    timestamp: new Date().toISOString(),
    protocol_version: "v2.0",
    evaluation_type: "responsive-breakpoint-6d",
    models: models.map((m) => m.displayName),
    total_cases: allTestCases.length,
    strategies: allEvaluations,
  };

  const jsonPath = resolve(reportsDir, `responsive-breakpoint-comparison-${timestamp}.json`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");

  const mdPath = resolve(reportsDir, `responsive-breakpoint-comparison-${timestamp}.md`);
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

// ============================================================================
// Markdown 报告
// ============================================================================

function signStr(a: number, b: number): string {
  const diff = b - a;
  if (diff > 0) return `+${(diff * 100).toFixed(1)}%`;
  return `${(diff * 100).toFixed(1)}%`;
}

function buildMarkdownReport(report: VariableScopeComparisonReport): string {
  const lines: string[] = [];
  lines.push("# 响应式断点表达方式亲和性评估报告");
  lines.push(`\n日期: ${report.timestamp.split("T")[0]}`);
  lines.push(`协议版本: ${report.protocol_version}`);
  lines.push(`测试用例: ${report.total_cases} 个`);
  lines.push(`模型: ${report.models.join(", ")}`);
  lines.push("对比: A: breakpoint-enum ($__widthBreakpoint) vs B: window-size ($__WindowSize.width)\n");

  const strategyLabels: Record<string, string> = {
    "breakpoint-enum": "A: breakpoint-enum ($__widthBreakpoint)",
    "window-size": "B: window-size ($__WindowSize.width)",
  };

  for (const modelName of report.models) {
    const brkEnum = report.strategies.find((e) => e.model_name === modelName && e.strategy === "breakpoint-enum")!;
    const winSize = report.strategies.find((e) => e.model_name === modelName && e.strategy === "window-size")!;

    lines.push(`## ${modelName}\n`);

    lines.push("### 6维度评分对比\n");
    lines.push("| 维度 | 权重 | A: breakpoint-enum | B: window-size | 差值 |");
    lines.push("|------|------|-------------------|----------------|------|");

    const entries: [string, number, number, number][] = [
      ["D1 语法准确率", 0.20, brkEnum.dimensions.d1_syntactic_accuracy, winSize.dimensions.d1_syntactic_accuracy],
      ["D2 语义准确率", 0.25, brkEnum.dimensions.d2_semantic_accuracy, winSize.dimensions.d2_semantic_accuracy],
      ["D3 生成效率", 0.15, brkEnum.dimensions.d3_generation_efficiency, winSize.dimensions.d3_generation_efficiency],
      ["D4 学习曲线", 0.15, brkEnum.dimensions.d4_learning_curve, winSize.dimensions.d4_learning_curve],
      ["D5 边界鲁棒性", 0.15, brkEnum.dimensions.d5_edge_robustness, winSize.dimensions.d5_edge_robustness],
      ["D6 一致稳定性", 0.10, brkEnum.dimensions.d6_consistency, winSize.dimensions.d6_consistency],
    ];

    for (const [label, weight, av, bv] of entries) {
      const diff = bv - av;
      const diffStr = diff >= 0 ? `+${(diff * 100).toFixed(1)}%` : `${(diff * 100).toFixed(1)}%`;
      lines.push(`| ${label} | ${(weight * 100).toFixed(0)}% | ${(av * 100).toFixed(1)}% | ${(bv * 100).toFixed(1)}% | ${diffStr} |`);
    }

    lines.push(`| **MA综合** | **100%** | **${(brkEnum.dimensions.ma_overall * 100).toFixed(1)}% (${brkEnum.dimensions.ma_grade})** | **${(winSize.dimensions.ma_overall * 100).toFixed(1)}% (${winSize.dimensions.ma_grade})** | **${signStr(brkEnum.dimensions.ma_overall, winSize.dimensions.ma_overall)}** |`);

    // D4 学习曲线明细
    if (brkEnum.dimensions.learning_curve && winSize.dimensions.learning_curve) {
      lines.push("\n### D4 学习曲线明细\n");
      lines.push("| shot数 | A: breakpoint-enum | B: window-size |");
      lines.push("|--------|-------------------|----------------|");
      lines.push(`| 0-shot | ${(brkEnum.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% | ${(winSize.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 1-shot | ${(brkEnum.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% | ${(winSize.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 3-shot | ${(brkEnum.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% | ${(winSize.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% |`);
    }

    // D6 一致性明细
    if (brkEnum.dimensions.consistency_detail && winSize.dimensions.consistency_detail) {
      lines.push("\n### D6 一致性明细\n");
      lines.push("| 指标 | A: breakpoint-enum | B: window-size |");
      lines.push("|------|-------------------|----------------|");
      lines.push(`| 结构一致率 | ${(brkEnum.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% | ${(winSize.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% |`);
      lines.push(`| 语义等价率 | ${(brkEnum.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% | ${(winSize.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% |`);
    }

    // 失败用例详情
    for (const eval_ of [brkEnum, winSize]) {
      const failed = eval_.main_results.filter((r) => !r.passed);
      if (failed.length > 0) {
        lines.push(`\n### ${strategyLabels[eval_.strategy]} 失败用例 (${failed.length}/${eval_.total_cases})\n`);
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

main().catch((e) => {
  console.error("运行错误:", e);
  process.exit(1);
});
