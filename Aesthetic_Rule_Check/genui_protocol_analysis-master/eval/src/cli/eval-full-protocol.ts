import "dotenv/config";
import {
  loadModelConfigs,
  loadFullProtocolTestCases,
  loadFullProtocolSummary,
  resolveReportsDir,
} from "../config.js";
import { callLLM } from "../llm/client.js";
import { validate } from "../core/validator.js";
import {
  calcD1,
  calcD2,
  calcD3,
  calcD4,
  calcD5,
  calcD6,
  calcMA,
  type CaseResultWithLevels,
} from "../core/scorer.js";
import { writeFile, mkdir } from "fs/promises";
import { resolve } from "path";
import type {
  TestCase,
  PerCaseResult,
  DimensionScores,
  ValidationRule,
  FullProtocolReport,
  FullProtocolModelEvaluation,
  CategoryBreakdown,
} from "../core/types.js";

const MAX_RETRIES = 1;
const D4_SAMPLE_SIZE = 15;
const D6_SAMPLE_SIZE = 10;
const D6_REPEATS = 3;

function getConcurrency(): number {
  const val = parseInt(process.env.CONCURRENCY || "", 10);
  return val > 0 ? val : 4;
}

function isFatalApiError(message: string): boolean {
  return message.includes("429") || message.includes("余额");
}

async function runConcurrentIndexed<T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  options: {
    concurrency: number;
    stopOnFatal?: boolean;
    makeSkipped?: (item: T, index: number) => R;
    isFatal?: (error: unknown) => boolean;
    onError?: (item: T, index: number, error: unknown) => R;
  },
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  let stopped = false;

  async function runWorker(): Promise<void> {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) return;

      const item = items[index];
      if (stopped && options.makeSkipped) {
        results[index] = options.makeSkipped(item, index);
        continue;
      }

      try {
        results[index] = await worker(item, index);
      } catch (e) {
        if (options.stopOnFatal && options.isFatal?.(e)) {
          stopped = true;
        }
        if (!options.onError) throw e;
        results[index] = options.onError(item, index, e);
      }
    }
  }

  const workerCount = Math.min(Math.max(options.concurrency, 1), items.length);
  await Promise.all(Array.from({ length: workerCount }, () => runWorker()));
  return results;
}

// ============================================================================
// Few-shot 示例
// ============================================================================

const FEW_SHOT_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 基础组件：",
  '输入："生成Extended.Text，显示用户名$username，字号16"',
  "输出：",
  '{"id": "username", "component": "Extended.Text", "content": "{{ $username }}", "styles": {"fontSize": 16}}',
  "",
  "示例2 - 布局 + 事件：",
  '输入："生成Extended.Button，标签为提交，点击后调用sendToLLM发送form数据"',
  "输出：",
  '{"id": "submitBtn", "component": "Extended.Button", "label": "提交", "onClick": [{"id": "submit", "call": "sendToLLM", "args": {"value": "用户点击提交"}}]}',
  "",
  "示例3 - 列表模板渲染（输出JSON数组）：",
  '输入："生成用户列表，每个用户显示$user.name"',
  "输出：",
  "[",
  '  {"id": "userList", "component": "Extended.List", "children": {"componentId": "userItem", "path": "$__dataModel.users"}, "space": 8},',
  '  {"id": "userItem", "component": "Extended.Text", "content": "{{ $item.name }}"}',
  "]",
  "",
  "示例4 - 条件渲染 + 响应式（输出JSON数组）：",
  '输入："小屏使用Column竖排，大屏使用Row横排，包含item1和item2"',
  "输出：",
  "[",
  '  {"id": "layout", "component": "Extended.If", "condition": "{{ $__widthBreakpoint == \'sm\' }}", "childrenIf": ["mobileLayout"], "childrenElse": ["desktopLayout"]},',
  '  {"id": "mobileLayout", "component": "Extended.Column", "children": ["item1", "item2"]},',
  '  {"id": "desktopLayout", "component": "Extended.Row", "children": ["item1", "item2"]},',
  '  {"id": "item1", "component": "Extended.Text", "content": "Item 1"},',
  '  {"id": "item2", "component": "Extended.Text", "content": "Item 2"}',
  "]",
].join("\n");

// ============================================================================
// Prompt 构建
// ============================================================================

let _protocolSummary = "";

async function loadSummaries(): Promise<void> {
  _protocolSummary = await loadFullProtocolSummary();
}

const SYSTEM_RULES = [
  "1. 只输出一个JSON对象（或JSON数组），不要包含任何其他文字、说明或markdown代码块标记。",
  '2. 每个组件必须有"component"字段，使用Extended.前缀（如"Extended.Text"、"Extended.Button"）。',
  '3. 不要把组件名当作key（错误：{"Extended.Text": {...}}），正确：{"component": "Extended.Text", ...}。',
  '4. 不要使用"type"代替"component"。',
  "5. 动态值使用{{ }}表达式语法，整个属性值为一个表达式字符串。",
  "6. 样式属性放在styles对象中。",
  "7. 事件名直接作为组件属性（如onClick、onChange），值是EventHandler数组 [{call, args, condition?, as?}]，按顺序执行。不要使用listeners包装层。condition为真执行，为假跳过。",
  "8. 条件渲染使用Extended.If组件，condition字段使用表达式，childrenIf和childrenElse为子组件ID数组。",
  "9. 列表模板渲染使用children: {componentId, path}格式，模板中用$item和$index引用当前项。",
  "10. 当需要生成多个组件时，输出JSON数组，展开所有子组件的完整定义。",
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

  const rules = testCase.validation_rules;
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

// ============================================================================
// 评估主逻辑
// ============================================================================

async function main() {
  console.log("=".repeat(70));
  console.log("鸿蒙 A2UI 完整协议模型亲和性评估 — 6 维度量化评估");
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

  const allTestCases = await loadFullProtocolTestCases();
  console.log(`已加载 ${allTestCases.length} 个完整协议测试用例`);

  // 分类统计
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
  const concurrency = getConcurrency();

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const reportsDir = resolveReportsDir("eval/reports");
  await mkdir(reportsDir, { recursive: true });

  const systemPrompt = buildSystemPrompt();
  const modelEvaluations: FullProtocolModelEvaluation[] = [];

  for (const modelConfig of models) {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`${modelConfig.displayName}`);
    console.log(`${"=".repeat(70)}\n`);

    // Phase A: 主测试 (D1/D2/D3/D5)
    console.log(`--- Phase A: 主测试 (D1/D2/D3/D5, 并发: ${concurrency}) ---\n`);
    const mainResults = await runConcurrentIndexed(
      allTestCases,
      async (tc, i) => {
        const result = await runSingleCase(modelConfig, tc, systemPrompt, MAX_RETRIES);

        const icon = result.passed ? "OK" : "XX";
        const timeStr = (result.time_ms / 1000).toFixed(1);
        console.log(`  [${i + 1}/${allTestCases.length}] ${tc.id} ${tc.name} (${tc.complexity}) ${icon} [${result.tokens}t, ${timeStr}s]`);
        if (!result.passed) {
          for (const err of result.errors) console.log(`    -> ${err}`);
        }

        return result;
      },
      { concurrency },
    );

    // Phase B: 学习曲线 (D4)
    console.log("\n--- Phase B: 学习曲线 (D4) ---\n");
    const learningResults: Record<string, PerCaseResult[]> = {};

    // 3-shot 即主测试结果
    const shot3Results: PerCaseResult[] = d4Cases.map((tc) => {
      const r = mainResults.find((mr) => mr.id === tc.id)!;
      return r as PerCaseResult;
    });
    learningResults["3"] = shot3Results;

    for (const shotCount of [0, 1] as const) {
      console.log(`  ${shotCount}-shot 测试...`);
      const shotResults = await runConcurrentIndexed<TestCase, PerCaseResult>(
        d4Cases,
        async (tc) => {
          const userPrompt = buildUserPrompt(tc, shotCount);
          const response = await callLLM(modelConfig, systemPrompt, userPrompt);
          const vResult = validate(response.content, tc);

          return {
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
          };
        },
        {
          concurrency,
          stopOnFatal: true,
          isFatal: (e) => isFatalApiError((e as Error).message),
          makeSkipped: (tc) => makeErrorResult(tc, "跳过（API不可用）"),
          onError: (tc, _i, e) => {
            const msg = (e as Error).message;
            console.log(`    API错误: ${msg}`);
            return makeErrorResult(tc, msg);
          },
        },
      );

      learningResults[String(shotCount)] = shotResults;
      const validResults = shotResults.filter((r) => !r.errors[0]?.includes("跳过"));
      const acc = validResults.length > 0 ? validResults.filter((r) => r.passed).length / validResults.length : 0;
      console.log(`    ${shotCount}-shot 准确率: ${(acc * 100).toFixed(1)}% (${validResults.length}/${shotResults.length}有效)`);
    }

    // Phase C: 一致性 (D6)
    console.log("\n--- Phase C: 一致性 (D6) ---\n");
    const consistencyResults: Record<string, PerCaseResult[][]> = {};
    const d6Tasks = d6Cases.flatMap((tc) =>
      Array.from({ length: Math.max(D6_REPEATS - 1, 0) }, (_, i) => ({ tc, rep: i + 1 }))
    );
    let d6Skipped = false;
    const d6ExtraResults = await runConcurrentIndexed<
      { tc: TestCase; rep: number },
      { caseId: string; rep: number; result: PerCaseResult | null }
    >(
      d6Tasks,
      async ({ tc, rep }) => {
        const userPrompt = buildUserPrompt(tc, 3);
        const response = await callLLM(modelConfig, systemPrompt, userPrompt);
        const vResult = validate(response.content, tc);

        return {
          caseId: tc.id,
          rep,
          result: {
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
          },
        };
      },
      {
        concurrency,
        stopOnFatal: true,
        isFatal: (e) => isFatalApiError((e as Error).message),
        makeSkipped: ({ tc, rep }) => ({ caseId: tc.id, rep, result: null }),
        onError: ({ tc, rep }, _i, e) => {
          const msg = (e as Error).message;
          console.log(`    API错误: ${msg}`);
          if (isFatalApiError(msg)) d6Skipped = true;
          return { caseId: tc.id, rep, result: null };
        },
      },
    );

    for (const tc of d6Cases) {
      const group: PerCaseResult[][] = [];
      const firstResult = mainResults.find((r) => r.id === tc.id);
      if (firstResult) {
        group.push([firstResult as PerCaseResult]);
      }
      const extra = d6ExtraResults
        .filter((r) => r.caseId === tc.id && r.result)
        .sort((a, b) => a.rep - b.rep)
        .map((r) => [r.result as PerCaseResult]);
      group.push(...extra);
      consistencyResults[tc.id] = group;
    }
    console.log(`  完成 ${d6Cases.length} 个用例 × ${D6_REPEATS} 次一致性测试${d6Skipped ? " (部分跳过)" : ""}`);

    // Phase D: 计算 6 维度评分
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

    // 分类统计
    const categoryBreakdown: Record<string, CategoryBreakdown> = {};
    for (const cat of categories) {
      const catResults = mainResults.filter((r) => r.category === cat);
      const passed = catResults.filter((r) => r.passed).length;
      categoryBreakdown[cat] = {
        total: catResults.length,
        passed,
        accuracy: catResults.length > 0 ? passed / catResults.length : 0,
      };
    }

    console.log(`  D1 语法准确率:    ${(d1 * 100).toFixed(1)}%`);
    console.log(`  D2 语义准确率:    ${(d2 * 100).toFixed(1)}%`);
    console.log(`  D3 生成效率:      ${(d3 * 100).toFixed(1)}%`);
    console.log(`  D4 学习曲线:      ${(d4 * 100).toFixed(1)}% (0:${(shot0Acc * 100).toFixed(0)}% -> 1:${(shot1Acc * 100).toFixed(0)}% -> 3:${(shot3Acc * 100).toFixed(0)}%)`);
    console.log(`  D5 边界鲁棒性:    ${(d5 * 100).toFixed(1)}%`);
    console.log(`  D6 一致稳定性:    ${(d6 * 100).toFixed(1)}%`);
    console.log(`  ─────────────────────────`);
    console.log(`  MA 综合分:        ${(maScore * 100).toFixed(1)}% (${maGrade})`);

    console.log(`\n  分类通过率:`);
    for (const cat of categories) {
      const bd = categoryBreakdown[cat];
      console.log(`    ${cat}: ${(bd.accuracy * 100).toFixed(1)}% (${bd.passed}/${bd.total})`);
    }

    modelEvaluations.push({
      model_name: modelConfig.displayName,
      total_cases: allTestCases.length,
      dimensions,
      category_breakdown: categoryBreakdown,
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

  // 汇总表
  console.log("| 模型 | D1 | D2 | D3 | D4 | D5 | D6 | MA |");
  console.log("|------|----|----|----|----|----|----|----|");
  for (const eval_ of modelEvaluations) {
    const d = eval_.dimensions;
    console.log(`| ${eval_.model_name} | ${(d.d1_syntactic_accuracy * 100).toFixed(1)}% | ${(d.d2_semantic_accuracy * 100).toFixed(1)}% | ${(d.d3_generation_efficiency * 100).toFixed(1)}% | ${(d.d4_learning_curve * 100).toFixed(1)}% | ${(d.d5_edge_robustness * 100).toFixed(1)}% | ${(d.d6_consistency * 100).toFixed(1)}% | ${(d.ma_overall * 100).toFixed(1)}% (${d.ma_grade}) |`);
  }

  const report: FullProtocolReport = {
    timestamp: new Date().toISOString(),
    protocol_version: "harmonyos-extended-v2",
    evaluation_type: "full-protocol-6d",
    models: models.map((m) => m.displayName),
    total_cases: allTestCases.length,
    model_evaluations: modelEvaluations,
  };

  const jsonPath = resolve(reportsDir, `full-protocol-${timestamp}.json`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");

  const mdPath = resolve(reportsDir, `full-protocol-${timestamp}.md`);
  await writeFile(mdPath, buildMarkdownReport(report, categories), "utf-8");

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
  testCase: TestCase,
  systemPrompt: string,
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
      const userPrompt = buildUserPrompt(testCase, 3);
      const response = await callLLM(modelConfig, systemPrompt, userPrompt);
      rawOutput = response.content;
      tokens = response.tokens;
      timeMs = response.elapsedMs;
      retryCount = attempt;

      const vResult = validate(rawOutput, testCase);
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

function makeErrorResult(tc: TestCase, errorMsg: string): PerCaseResult {
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

function buildMarkdownReport(report: FullProtocolReport, categories: string[]): string {
  const lines: string[] = [];
  lines.push("# 鸿蒙 A2UI 完整协议模型亲和性评估报告");
  lines.push(`\n日期: ${report.timestamp.split("T")[0]}`);
  lines.push(`协议版本: ${report.protocol_version}`);
  lines.push(`测试用例: ${report.total_cases} 个`);
  lines.push(`模型: ${report.models.join(", ")}\n`);

  for (const eval_ of report.model_evaluations) {
    const d = eval_.dimensions;
    lines.push(`## ${eval_.model_name}\n`);

    // 6D 评分表
    lines.push("### 6 维度评分\n");
    lines.push("| 维度 | 权重 | 得分 |");
    lines.push("|------|------|------|");
    lines.push(`| D1 语法准确率 | 20% | ${(d.d1_syntactic_accuracy * 100).toFixed(1)}% |`);
    lines.push(`| D2 语义准确率 | 25% | ${(d.d2_semantic_accuracy * 100).toFixed(1)}% |`);
    lines.push(`| D3 生成效率 | 15% | ${(d.d3_generation_efficiency * 100).toFixed(1)}% |`);
    lines.push(`| D4 学习曲线 | 15% | ${(d.d4_learning_curve * 100).toFixed(1)}% |`);
    lines.push(`| D5 边界鲁棒性 | 15% | ${(d.d5_edge_robustness * 100).toFixed(1)}% |`);
    lines.push(`| D6 一致稳定性 | 10% | ${(d.d6_consistency * 100).toFixed(1)}% |`);
    lines.push(`| **MA 综合** | **100%** | **${(d.ma_overall * 100).toFixed(1)}% (${d.ma_grade})** |\n`);

    // D4 学习曲线
    if (d.learning_curve) {
      lines.push("### D4 学习曲线\n");
      lines.push("| shot 数 | 准确率 |");
      lines.push("|---------|--------|");
      lines.push(`| 0-shot | ${(d.learning_curve.shot_0_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 1-shot | ${(d.learning_curve.shot_1_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 3-shot | ${(d.learning_curve.shot_3_accuracy * 100).toFixed(1)}% |\n`);
    }

    // D6 一致性
    if (d.consistency_detail) {
      lines.push("### D6 一致性\n");
      lines.push("| 指标 | 值 |");
      lines.push("|------|-----|");
      lines.push(`| 结构一致率 | ${(d.consistency_detail.structural_consistency * 100).toFixed(1)}% |`);
      lines.push(`| 语义等价率 | ${(d.consistency_detail.semantic_equivalence * 100).toFixed(1)}% |\n`);
    }

    // 分类通过率
    lines.push("### 分类通过率\n");
    lines.push("| 分类 | 通过/总数 | 通过率 |");
    lines.push("|------|----------|--------|");
    for (const cat of categories) {
      const bd = eval_.category_breakdown[cat];
      if (bd) {
        lines.push(`| ${cat} | ${bd.passed}/${bd.total} | ${(bd.accuracy * 100).toFixed(1)}% |`);
      }
    }
    lines.push("");

    // 失败用例
    const failed = eval_.main_results.filter((r) => !r.passed);
    if (failed.length > 0) {
      lines.push(`### 失败用例 (${failed.length}/${eval_.total_cases})\n`);
      for (const c of failed) {
        lines.push(`**${c.id} ${c.name}** (${c.category}, ${c.complexity})`);
        for (const err of c.errors) lines.push(`  - ${err}`);
        lines.push("");
      }
    }

    lines.push("");
  }

  lines.push("## 结论\n");
  lines.push("_待根据评估数据填写_\n");

  return lines.join("\n");
}

main().catch((e) => {
  console.error("运行错误:", e);
  process.exit(1);
});
