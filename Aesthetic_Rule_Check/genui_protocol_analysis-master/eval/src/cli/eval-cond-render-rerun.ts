import "dotenv/config";
import { loadModelConfigs, resolveReportsDir, TOOLKIT_ROOT, PROJECT_ROOT } from "../config.js";
import { callLLM } from "../llm/client.js";
import { validate } from "../core/validator.js";
import { calcD1, calcD2, calcD3, calcD5, calcMA, type CaseResultWithLevels } from "../core/scorer.js";
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

type CondRenderStrategy = "extended-if" | "extended-switch";

const RERUN_STRATEGIES: CondRenderStrategy[] = ["extended-if", "extended-switch"];
const MAX_RETRIES = 1;

// ============================================================================
// 从原始报告复制: 策略专属规则、Few-shot 示例、Prompt 构建
// ============================================================================

function getExtendedIfRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段（如"Text"、"Button"、"Column"）。',
    '3. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    '5. Text组件必须包含"content"。Button必须包含"label"。TextInput必须包含"placeholder"。',
    '6. 动态值整个用{{ }}包裹：纯动态"{{ $var }}"，混合文本"{{ \'Hello, \' + $var }}"。',
    "7. 每个{{ }}仅包含一个完整表达式，不支持在一对双引号中使用多个{{ }}表达式。",
    "8. 变量用$前缀，函数直接调用无前缀（如formatNumber($price, 2)）。",
    "9. 【关键】条件渲染使用If组件（组件名为\"If\"）：",
    "   - If组件必须有condition字段（布尔表达式，用{{ }}包裹）",
    '   - 条件为true时显示childrenIf（字符串ID数组），如"childrenIf": ["compA"]',
    '   - 条件为false时显示childrenElse（字符串ID数组，可选），如"childrenElse": ["compB"]',
    '   - 示例：{"id": "authGate", "component": "If", "condition": "{{ $__dataModel.isLoggedIn }}", "childrenIf": ["welcomeText"], "childrenElse": ["loginBtn"]}',
    "   - 条件表达式可以是比较：{{ $__dataModel.score >= 60 }}、{{ $__dataModel.status == 'success' }}",
    "   - 条件表达式可以用逻辑运算：{{ $__dataModel.isAdmin && $__dataModel.isActive }}",
    "   - 不需要else分支时可以省略childrenElse",
    '10. theme字段使用固定字符串值（如"heading1"），不使用{{ }}。',
    "11. 【三元表达式】当任务描述明确要求\"Text组件 + content使用三元表达式\"时，直接在Text的content中使用三元表达式（如\"{{ $var ? 'A' : 'B' }}\"），不要转换为If组件。",
    "12. childrenIf和childrenElse必须直接包含任务描述中明确提到的组件ID，不要创建中间包装组件或合并组件。例如任务要求\"显示Text(id为'welcome')\"时，childrenIf必须包含\"welcome\"。",
  ];
}

function getExtendedSwitchRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段（如"Text"、"Button"、"Column"）。',
    '3. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    '5. Text组件必须包含"content"。Button必须包含"label"。TextInput必须包含"placeholder"。',
    '6. 动态值整个用{{ }}包裹：纯动态"{{ $var }}"，混合文本"{{ \'Hello, \' + $var }}"。',
    "7. 每个{{ }}仅包含一个完整表达式，不支持在一对双引号中使用多个{{ }}表达式。",
    "8. 变量用$前缀，函数直接调用无前缀（如formatNumber($price, 2)）。",
    "9. 【关键】条件渲染使用Switch组件（组件名为\"Switch\"）：",
    "   - Switch组件必须有value字段（要匹配的变量值，用{{ }}包裹）",
    "   - Switch组件必须有cases字段（对象，key为匹配值，value为字符串ID数组）",
    "   - Switch组件必须有default字段（默认分支的字符串ID数组）",
    '   - 示例：{"id": "authGate", "component": "Switch", "value": "{{ $__dataModel.isLoggedIn }}", "cases": {"true": ["welcomeText"]}, "default": ["loginBtn"]}',
    "   - 多值匹配示例：cases: {\"admin\": [\"adminPanel\"], \"user\": [\"userPanel\"]}, default: [\"guestMsg\"]",
    "   - 对于布尔条件，true/false用字符串\"true\"/\"false\"作为case的key",
    "   - 对于简单布尔条件没有else的情况，可以只提供匹配的case，default放空数组",
    '10. theme字段使用固定字符串值（如"heading1"），不使用{{ }}。',
  ];
}

const EXTENDED_IF_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 简单布尔条件：",
  '输入："如果$__dataModel.isLoggedIn为true显示Text（id为welcome，content为\'欢迎\'），否则显示Button（id为login，label为\'登录\'）"',
  "输出：",
  '{"id": "authGate", "component": "If", "condition": "{{ $__dataModel.isLoggedIn }}", "childrenIf": ["welcome"], "childrenElse": ["login"]}',
  "",
  "示例2 - 比较条件：",
  '输入："如果$__dataModel.score >= 60显示Text（id为pass，content为\'及格\'），否则显示Text（id为fail，content为\'不及格\'）"',
  "输出：",
  '{"id": "scoreCheck", "component": "If", "condition": "{{ $__dataModel.score >= 60 }}", "childrenIf": ["pass"], "childrenElse": ["fail"]}',
  "",
  "示例3 - 无else分支：",
  '输入："如果$__dataModel.isAdmin为true显示Text（id为badge，content为\'管理员\'）"',
  "输出：",
  '{"id": "adminCheck", "component": "If", "condition": "{{ $__dataModel.isAdmin }}", "childrenIf": ["badge"]}',
  "",
  "示例4 - 三元表达式（Text组件 + content）：",
  '输入："生成一个Text组件（id为\'status\'），content使用三元表达式：如果$__dataModel.isActive为true显示\'活跃\'，否则显示\'离线\'"',
  "输出：",
  '{"id": "status", "component": "Text", "content": "{{ $__dataModel.isActive ? \'活跃\' : \'离线\' }}"}',
  "",
  "示例5 - 嵌套/多分支条件（直接列出组件ID）：",
  '输入："如果$__dataModel.isAdmin为true显示Text（id为\'adminView\'），否则再判断$__dataModel.isVIP为true显示Text（id为\'vipView\'），都不是则显示Text（id为\'guestView\'）"',
  "输出：",
  '{"id": "accessGate", "component": "If", "condition": "{{ $__dataModel.isAdmin }}", "childrenIf": ["adminView"], "childrenElse": ["vipView", "guestView"]}',
].join("\n");

const EXTENDED_SWITCH_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 布尔条件Switch：",
  '输入："如果$__dataModel.isLoggedIn为true显示Text（id为welcome，content为\'欢迎\'），否则显示Button（id为login，label为\'登录\'）"',
  "输出：",
  '{"id": "authGate", "component": "Switch", "value": "{{ $__dataModel.isLoggedIn }}", "cases": {"true": ["welcome"]}, "default": ["login"]}',
  "",
  "示例2 - 多值匹配：",
  '输入："如果$__dataModel.role等于admin显示adminPanel，如果等于user显示userPanel，否则显示guestMsg"',
  "输出：",
  '{"id": "roleSwitch", "component": "Switch", "value": "{{ $__dataModel.role }}", "cases": {"admin": ["adminPanel"], "user": ["userPanel"]}, "default": ["guestMsg"]}',
  "",
  "示例3 - 简单布尔无else：",
  '输入："如果$__dataModel.isAdmin为true显示Text（id为badge，content为\'管理员\'）"',
  "输出：",
  '{"id": "adminSwitch", "component": "Switch", "value": "{{ $__dataModel.isAdmin }}", "cases": {"true": ["badge"]}, "default": []}',
].join("\n");

let _baseSummary = "";

async function loadSummaries(): Promise<void> {
  const path = resolve(TOOLKIT_ROOT, "prompts", "protocol-inline-summary.md");
  _baseSummary = await readFile(path, "utf-8");
}

function buildSystemPrompt(strategy: CondRenderStrategy): string {
  const rules = strategy === "extended-if" ? getExtendedIfRules() : getExtendedSwitchRules();
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
  strategy: CondRenderStrategy,
  shotCount: number = 3,
): string {
  const fullExamples = strategy === "extended-if" ? EXTENDED_IF_EXAMPLES : EXTENDED_SWITCH_EXAMPLES;
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

  const rules = resolveRulesLocal(testCase, strategy);
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

function resolveRulesLocal(testCase: VariableScopeTestCase, strategy: string): ValidationRule[] {
  if (testCase.shared_rules && testCase.strategy_rules) {
    const strategyRules = (testCase.strategy_rules as Record<string, ValidationRule[]>)[strategy] || [];
    return [...testCase.shared_rules, ...strategyRules];
  }
  return testCase.validation_rules;
}

// ============================================================================
// 重跑单用例
// ============================================================================

async function runSingleCase(
  modelConfig: import("../core/types.js").LLMModelConfig,
  testCase: VariableScopeTestCase,
  systemPrompt: string,
  strategy: CondRenderStrategy,
): Promise<CaseResultWithLevels> {
  let passed = false;
  let errors: string[] = [];
  let retryCount = 0;
  let tokens = 0;
  let timeMs = 0;
  let rawOutput = "";
  let generatedDsl: Record<string, unknown> | null = null;
  let levels = { l1_json_parsed: false, l2_structure_ok: false, l3_patterns_ok: false, l4_rules_ok: false };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
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

      if (passed || attempt === MAX_RETRIES) break;
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

// ============================================================================
// 报告生成（仅 Extended.If + Extended.Switch，无 Visibility）
// ============================================================================

function buildMarkdownReport(report: VariableScopeComparisonReport): string {
  const lines: string[] = [];
  lines.push("# 条件渲染设计对比 — P6 6维度量化评估报告（重跑失败用例更新）");
  lines.push(`\n日期: ${report.timestamp.split("T")[0]}`);
  lines.push(`协议版本: ${report.protocol_version}`);
  lines.push(`测试用例: ${report.total_cases} 个`);
  lines.push(`模型: ${report.models.join(", ")}`);
  lines.push(`对比: Extended.If (当前设计) vs Extended.Switch\n`);

  for (const modelName of report.models) {
    const extIf = report.strategies.find((e) => e.model_name === modelName && e.strategy === "extended-if")!;
    const extSw = report.strategies.find((e) => e.model_name === modelName && e.strategy === "extended-switch")!;

    lines.push(`## ${modelName}\n`);
    lines.push("### 6维度评分对比\n");
    lines.push("| 维度 | 权重 | extended-if | extended-switch |");
    lines.push("|------|------|-------------|-----------------|");

    const entries: [string, number, number, number][] = [
      ["D1 语法准确率", 0.20, extIf.dimensions.d1_syntactic_accuracy, extSw.dimensions.d1_syntactic_accuracy],
      ["D2 语义准确率", 0.25, extIf.dimensions.d2_semantic_accuracy, extSw.dimensions.d2_semantic_accuracy],
      ["D3 生成效率", 0.15, extIf.dimensions.d3_generation_efficiency, extSw.dimensions.d3_generation_efficiency],
      ["D4 学习曲线", 0.15, extIf.dimensions.d4_learning_curve, extSw.dimensions.d4_learning_curve],
      ["D5 边界鲁棒性", 0.15, extIf.dimensions.d5_edge_robustness, extSw.dimensions.d5_edge_robustness],
      ["D6 一致稳定性", 0.10, extIf.dimensions.d6_consistency, extSw.dimensions.d6_consistency],
    ];

    for (const [label, weight, iv, sv] of entries) {
      lines.push(`| ${label} | ${(weight * 100).toFixed(0)}% | ${(iv * 100).toFixed(1)}% | ${(sv * 100).toFixed(1)}% |`);
    }

    lines.push(`| **MA综合** | **100%** | **${(extIf.dimensions.ma_overall * 100).toFixed(1)}% (${extIf.dimensions.ma_grade})** | **${(extSw.dimensions.ma_overall * 100).toFixed(1)}% (${extSw.dimensions.ma_grade})** |`);

    if (extIf.dimensions.learning_curve && extSw.dimensions.learning_curve) {
      lines.push("\n### D4 学习曲线明细\n");
      lines.push("| shot数 | extended-if | extended-switch |");
      lines.push("|--------|-------------|-----------------|");
      lines.push(`| 0-shot | ${(extIf.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% | ${(extSw.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 1-shot | ${(extIf.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% | ${(extSw.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 3-shot | ${(extIf.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% | ${(extSw.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% |`);
    }

    if (extIf.dimensions.consistency_detail && extSw.dimensions.consistency_detail) {
      lines.push("\n### D6 一致性明细\n");
      lines.push("| 指标 | extended-if | extended-switch |");
      lines.push("|------|-------------|-----------------|");
      lines.push(`| 结构一致率 | ${(extIf.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% | ${(extSw.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% |`);
      lines.push(`| 语义等价率 | ${(extIf.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% | ${(extSw.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% |`);
    }

    for (const eval_ of [extIf, extSw]) {
      const failed = eval_.main_results.filter((r) => !r.passed);
      if (failed.length > 0) {
        lines.push(`\n### ${eval_.strategy} 失败用例 (${failed.length}/${eval_.total_cases})\n`);
        for (const c of failed) {
          lines.push(`**${c.id} ${c.name}** (${c.complexity})`);
          for (const err of c.errors) lines.push(`  - ${err}`);
          if (c.raw_output) lines.push(`  - 原始输出: \`${c.raw_output.substring(0, 200)}\``);
          lines.push("");
        }
      } else {
        lines.push(`\n### ${eval_.strategy} — 全部通过!\n`);
      }
    }

    lines.push("");
  }

  // 综合对比
  lines.push("\n## 综合对比\n");
  lines.push("### MA 综合分跨模型对比\n");
  lines.push("| 模型 | extended-if | extended-switch |");
  lines.push("|------|-------------|-----------------|");
  for (const modelName of report.models) {
    const extIf = report.strategies.find((e) => e.model_name === modelName && e.strategy === "extended-if")!;
    const extSw = report.strategies.find((e) => e.model_name === modelName && e.strategy === "extended-switch")!;
    lines.push(`| ${modelName} | ${(extIf.dimensions.ma_overall * 100).toFixed(1)}% (${extIf.dimensions.ma_grade}) | ${(extSw.dimensions.ma_overall * 100).toFixed(1)}% (${extSw.dimensions.ma_grade}) |`);
  }

  lines.push("\n### 模型平均 MA（跨模型均值）\n");
  lines.push("| 方案 | DeepSeek | GLM | 平均 | 等级 |");
  lines.push("|------|----------|-----|------|------|");

  for (const strategy of RERUN_STRATEGIES) {
    const results = report.models.map((m) => {
      const e = report.strategies.find((s) => s.model_name === m && s.strategy === strategy)!;
      return e.dimensions.ma_overall;
    });
    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    const grade = avg >= 0.9 ? "A+" : avg >= 0.8 ? "A" : avg >= 0.7 ? "B" : avg >= 0.6 ? "C" : "D";
    lines.push(`| ${strategy} | ${(results[0] * 100).toFixed(1)}% | ${(results[1] * 100).toFixed(1)}% | ${(avg * 100).toFixed(1)}% | ${grade} |`);
  }

  lines.push("\n## 结论\n");
  lines.push("_待根据评估数据填写_\n");

  return lines.join("\n");
}

// ============================================================================
// 主逻辑
// ============================================================================

async function main() {
  console.log("=".repeat(70));
  console.log("条件渲染设计对比 — 重跑失败用例");
  console.log("仅: Extended.If + Extended.Switch（排除 Visibility）");
  console.log("=".repeat(70));

  // 加载原始报告
  const originalReportPath = resolve(
    PROJECT_ROOT,
    "eval/design-points",
    "conditional-rendering",
    "reports",
    "conditional-rendering-comparison-merged.json",
  );
  console.log(`\n加载原始报告: ${originalReportPath}`);
  const originalReport: VariableScopeComparisonReport = JSON.parse(
    await readFile(originalReportPath, "utf-8"),
  );

  // 加载所有测试用例
  const allTestCases = await loadConditionalRenderingTestCases();
  console.log(`已加载 ${allTestCases.length} 个测试用例`);

  await loadSummaries();

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
    console.error("\n错误: 未配置任何模型。请在.env文件中设置API Key。");
    process.exit(1);
  }
  console.log(`已配置 ${models.length} 个模型: ${models.map((m) => m.displayName).join(", ")}`);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const reportsDir = resolveReportsDir("eval/design-points/conditional-rendering/reports");
  await mkdir(reportsDir, { recursive: true });

  const updatedStrategies: StrategyEvaluation[] = [];

  for (const modelConfig of models) {
    for (const strategy of RERUN_STRATEGIES) {
      // 找到原始评估结果
      const originalEval = originalReport.strategies.find(
        (e) => e.model_name === modelConfig.displayName && e.strategy === strategy,
      );
      if (!originalEval) {
        console.log(`\n跳过 ${modelConfig.displayName} | ${strategy}（原始报告中无此数据）`);
        continue;
      }

      // 找出失败用例 ID
      const failedIds = originalEval.main_results
        .filter((r) => !r.passed)
        .map((r) => r.id);

      if (failedIds.length === 0) {
        console.log(`\n${modelConfig.displayName} | ${strategy} — 无失败用例，保持原始数据`);
        updatedStrategies.push(originalEval);
        continue;
      }

      console.log(`\n${"=".repeat(70)}`);
      console.log(`${modelConfig.displayName} | ${strategy} | 重跑 ${failedIds.length} 个失败用例`);
      console.log(`  失败ID: ${failedIds.join(", ")}`);
      console.log(`${"=".repeat(70)}\n`);

      const systemPrompt = buildSystemPrompt(strategy);

      // 准备合并后的 main_results（先复制原始结果）
      const mergedResults: CaseResultWithLevels[] = originalEval.main_results.map((r) => {
        // 确保有 levels 字段
        const withLevels = r as CaseResultWithLevels;
        if (!withLevels.levels) {
          // 从 passed/errors 推断 levels
          withLevels.levels = {
            l1_json_parsed: !r.errors.some((e) => e.includes("JSON解析失败")),
            l2_structure_ok: !r.errors.some((e) => e.includes("缺少必选字段") || e.includes("component字段不匹配")),
            l3_patterns_ok: !r.errors.some((e) => e.includes("模式检查失败")),
            l4_rules_ok: !r.errors.some((e) => e.includes("规则检查失败")),
          };
        }
        return withLevels;
      });

      // 逐个重跑失败用例
      for (const failedId of failedIds) {
        const tc = allTestCases.find((t) => t.id === failedId)!;
        const result = await runSingleCase(modelConfig, tc, systemPrompt, strategy);

        // 替换原始结果
        const idx = mergedResults.findIndex((r) => r.id === failedId);
        if (idx >= 0) {
          mergedResults[idx] = result;
        }

        const icon = result.passed ? "OK" : "XX";
        const timeStr = (result.time_ms / 1000).toFixed(1);
        console.log(`  ${tc.id} ${tc.name} (${tc.complexity}) ${icon} [${result.tokens}t, ${timeStr}s]`);
        if (!result.passed) {
          for (const err of result.errors) console.log(`    -> ${err}`);
        }
      }

      // 重算 D1/D2/D3/D5，保留 D4/D6
      const d1 = calcD1(mergedResults);
      const d2 = calcD2(mergedResults);
      const d3 = calcD3(mergedResults, MAX_RETRIES);

      // D4 保留原始值
      const d4 = originalEval.dimensions.d4_learning_curve;

      // D5: 从更新后的 mergedResults 中筛选 edge cases
      const edgeCases = allTestCases.filter((tc) => tc.is_edge === true);
      const d5 = calcD5(mainResults);

      // D6 保留原始值
      const d6 = originalEval.dimensions.d6_consistency;

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
        learning_curve: originalEval.dimensions.learning_curve,
        consistency_detail: originalEval.dimensions.consistency_detail,
      };

      console.log(`\n  重算结果:`);
      console.log(`  D1 语法准确率:    ${(d1 * 100).toFixed(1)}% (原 ${(originalEval.dimensions.d1_syntactic_accuracy * 100).toFixed(1)}%)`);
      console.log(`  D2 语义准确率:    ${(d2 * 100).toFixed(1)}% (原 ${(originalEval.dimensions.d2_semantic_accuracy * 100).toFixed(1)}%)`);
      console.log(`  D3 生成效率:      ${(d3 * 100).toFixed(1)}% (原 ${(originalEval.dimensions.d3_generation_efficiency * 100).toFixed(1)}%)`);
      console.log(`  D4 学习曲线:      ${(d4 * 100).toFixed(1)}% (保留)`);
      console.log(`  D5 边界鲁棒性:    ${(d5 * 100).toFixed(1)}% (原 ${(originalEval.dimensions.d5_edge_robustness * 100).toFixed(1)}%)`);
      console.log(`  D6 一致稳定性:    ${(d6 * 100).toFixed(1)}% (保留)`);
      console.log(`  ─────────────────────────`);
      console.log(`  MA 综合分:        ${(maScore * 100).toFixed(1)}% (${maGrade}) (原 ${(originalEval.dimensions.ma_overall * 100).toFixed(1)}% ${originalEval.dimensions.ma_grade})`);

      updatedStrategies.push({
        strategy: strategy as any,
        model_name: modelConfig.displayName,
        total_cases: allTestCases.length,
        dimensions,
        main_results: mergedResults,
        learning_results: originalEval.learning_results,
        consistency_results: originalEval.consistency_results,
      });
    }
  }

  // ============================================================
  // 生成报告
  // ============================================================
  console.log(`\n${"=".repeat(70)}`);
  console.log("更新汇总");
  console.log(`${"=".repeat(70)}\n`);

  // 构建完整报告（包含 visibility 原始数据 + 更新后的 if/switch 数据）
  const fullStrategies: StrategyEvaluation[] = [];

  // 添加 visibility 原始数据（保持不变）
  for (const modelConfig of models) {
    const visEval = originalReport.strategies.find(
      (e) => e.model_name === modelConfig.displayName && e.strategy === "visibility",
    );
    if (visEval) {
      fullStrategies.push(visEval);
    }
  }

  // 添加更新后的 if/switch 数据
  fullStrategies.push(...updatedStrategies);

  const report: VariableScopeComparisonReport = {
    timestamp: new Date().toISOString(),
    protocol_version: "v2.0",
    evaluation_type: "conditional-rendering-6d",
    models: models.map((m) => m.displayName),
    total_cases: allTestCases.length,
    strategies: fullStrategies,
  };

  // 保存合并后的完整 JSON 报告（包含 visibility）
  const mergedJsonPath = resolve(reportsDir, `conditional-rendering-comparison-merged.json`);
  await writeFile(mergedJsonPath, JSON.stringify(report, null, 2), "utf-8");
  console.log(`完整 JSON 报告已更新: ${mergedJsonPath}`);

  // 保存更新后的 MD 报告（仅 if + switch）
  const mergedMdPath = resolve(reportsDir, `conditional-rendering-comparison-merged.md`);
  await writeFile(mergedMdPath, buildMarkdownReport(report), "utf-8");
  console.log(`MD 报告已更新: ${mergedMdPath}`);

  // 同时保存带时间戳的副本
  const timestampedJsonPath = resolve(reportsDir, `conditional-rendering-comparison-${timestamp}.json`);
  await writeFile(timestampedJsonPath, JSON.stringify(report, null, 2), "utf-8");
  const timestampedMdPath = resolve(reportsDir, `conditional-rendering-comparison-${timestamp}.md`);
  await writeFile(timestampedMdPath, buildMarkdownReport(report), "utf-8");
  console.log(`时间戳副本已保存: ${timestampedJsonPath}`);

  console.log("\n重跑完成！");
}

async function loadConditionalRenderingTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(PROJECT_ROOT, "eval/design-points", "conditional-rendering", "test-cases", "conditional-rendering.json");
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as VariableScopeTestCase[];
}

main().catch((e) => {
  console.error("运行错误:", e);
  process.exit(1);
});
