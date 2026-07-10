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

type CondRenderStrategy = "extended-if" | "visibility" | "extended-switch";

const STRATEGIES: CondRenderStrategy[] = ["extended-if", "visibility", "extended-switch"];
const MAX_RETRIES = 1;
const D4_SHOT_LEVELS = [0, 1, 3] as const;
const D6_REPEATS = 3;
const D4_SAMPLE_SIZE = 10;
const D6_SAMPLE_SIZE = 8;

// ============================================================================
// 策略专属规则
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

function getVisibilityRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段（如"Text"、"Button"、"Column"）。',
    '3. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    '5. Text组件必须包含"content"。Button必须包含"label"。TextInput必须包含"placeholder"。',
    '6. 动态值整个用{{ }}包裹：纯动态"{{ $var }}"，混合文本"{{ \'Hello, \' + $var }}"。',
    "7. 每个{{ }}仅包含一个完整表达式，不支持在一对双引号中使用多个{{ }}表达式。",
    "8. 变量用$前缀，函数直接调用无前缀（如formatNumber($price, 2)）。",
    "9. 【关键】条件渲染使用visibility属性控制组件可见性：",
    "   - 每个组件都可以有visibility属性，值为条件表达式（用{{ }}包裹）",
    "   - visibility为true时组件显示，为false时组件隐藏",
    '   - 示例：{"id": "welcomeText", "component": "Text", "content": "欢迎", "visibility": "{{ $__dataModel.isLoggedIn }}"}',
    "   - 需要if/else分支时，生成两个组件分别用互补条件控制visibility",
    "   - visibility表达式可以是比较：{{ $__dataModel.score >= 60 }}",
    "   - visibility表达式可以用逻辑运算：{{ $__dataModel.isAdmin && $__dataModel.isActive }}",
    "   - 对于三元选择场景，也可以在content等属性中使用三元表达式",
    '10. theme字段使用固定字符串值（如"heading1"），不使用{{ }}。',
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

// ============================================================================
// Few-shot 示例
// ============================================================================

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

const VISIBILITY_EXAMPLES = [
  "## 参考示例",
  "",
  "示例1 - 布尔条件控制可见性：",
  '输入："如果$__dataModel.isLoggedIn为true显示Text（id为welcome，content为\'欢迎\'），否则显示Button（id为login，label为\'登录\'）"',
  "输出：",
  '{"id": "root", "component": "Column", "children": [{"id": "welcome", "component": "Text", "content": "欢迎", "visibility": "{{ $__dataModel.isLoggedIn }}"}, {"id": "login", "component": "Button", "label": "登录", "visibility": "{{ !$__dataModel.isLoggedIn }}"}]}',
  "",
  "示例2 - 比较条件：",
  '输入："如果$__dataModel.score >= 60显示Text（id为pass，content为\'及格\'），否则显示Text（id为fail，content为\'不及格\'）"',
  "输出：",
  '{"id": "root", "component": "Column", "children": [{"id": "pass", "component": "Text", "content": "及格", "visibility": "{{ $__dataModel.score >= 60 }}"}, {"id": "fail", "component": "Text", "content": "不及格", "visibility": "{{ $__dataModel.score < 60 }}"}]}',
  "",
  "示例3 - 无else分支：",
  '输入："如果$__dataModel.isAdmin为true显示Text（id为badge，content为\'管理员\'）"',
  "输出：",
  '{"id": "badge", "component": "Text", "content": "管理员", "visibility": "{{ $__dataModel.isAdmin }}"}',
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

// ============================================================================
// Prompt 构建
// ============================================================================

let _baseSummary = "";

async function loadSummaries(): Promise<void> {
  const path = resolve(TOOLKIT_ROOT, "prompts", "protocol-inline-summary.md");
  _baseSummary = await readFile(path, "utf-8");
}

function buildSystemPrompt(strategy: CondRenderStrategy): string {
  const rules = strategy === "extended-if" ? getExtendedIfRules() : strategy === "visibility" ? getVisibilityRules() : getExtendedSwitchRules();

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
  const fullExamples = strategy === "extended-if" ? EXTENDED_IF_EXAMPLES : strategy === "visibility" ? VISIBILITY_EXAMPLES : EXTENDED_SWITCH_EXAMPLES;
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

function resolveRules(testCase: VariableScopeTestCase, strategy: CondRenderStrategy): ValidationRule[] {
  if (testCase.shared_rules && testCase.strategy_rules) {
    const strategyRules = (testCase.strategy_rules as Record<string, ValidationRule[]>)[strategy] || [];
    return [...testCase.shared_rules, ...strategyRules];
  }
  return testCase.validation_rules;
}

// ============================================================================
// 评估主逻辑
// ============================================================================

async function loadConditionalRenderingTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(PROJECT_ROOT, "eval/design-points", "conditional-rendering", "test-cases", "conditional-rendering.json");
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as VariableScopeTestCase[];
}

async function main() {
  console.log("=".repeat(70));
  console.log("条件渲染设计对比 — P6 6维度量化评估");
  console.log("Extended.If (当前设计) vs Visibility vs Extended.Switch");
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

  const allTestCases = await loadConditionalRenderingTestCases();
  console.log(`已加载 ${allTestCases.length} 个条件渲染测试用例`);

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
  const reportsDir = resolveReportsDir("eval/design-points/conditional-rendering/reports");
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
    console.log("| 维度 | extended-if | visibility | extended-switch |");
    console.log("|------|-------------|------------|-----------------|");

    const extIf = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "extended-if")!;
    const vis = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "visibility")!;
    const extSw = allEvaluations.find((e) => e.model_name === model.displayName && e.strategy === "extended-switch")!;

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
      const iv = fn(extIf.dimensions);
      const vv = fn(vis.dimensions);
      const sv = fn(extSw.dimensions);
      console.log(`| ${label} | ${(iv * 100).toFixed(1)}% | ${(vv * 100).toFixed(1)}% | ${(sv * 100).toFixed(1)}% |`);
    }

    console.log(`\n  extended-if: ${extIf.dimensions.ma_grade} | visibility: ${vis.dimensions.ma_grade} | extended-switch: ${extSw.dimensions.ma_grade}`);
  }

  const report: VariableScopeComparisonReport = {
    timestamp: new Date().toISOString(),
    protocol_version: "v2.0",
    evaluation_type: "conditional-rendering-6d",
    models: models.map((m) => m.displayName),
    total_cases: allTestCases.length,
    strategies: allEvaluations,
  };

  const jsonPath = resolve(reportsDir, `conditional-rendering-comparison-${timestamp}.json`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");

  const mdPath = resolve(reportsDir, `conditional-rendering-comparison-${timestamp}.md`);
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
  strategy: CondRenderStrategy,
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
  lines.push("# 条件渲染设计对比 — P6 6维度量化评估报告");
  lines.push(`\n日期: ${report.timestamp.split("T")[0]}`);
  lines.push(`协议版本: ${report.protocol_version}`);
  lines.push(`测试用例: ${report.total_cases} 个`);
  lines.push(`模型: ${report.models.join(", ")}`);
  lines.push(`对比: Extended.If (当前设计) vs Visibility vs Extended.Switch\n`);

  for (const modelName of report.models) {
    const extIf = report.strategies.find((e) => e.model_name === modelName && e.strategy === "extended-if")!;
    const vis = report.strategies.find((e) => e.model_name === modelName && e.strategy === "visibility")!;
    const extSw = report.strategies.find((e) => e.model_name === modelName && e.strategy === "extended-switch")!;

    lines.push(`## ${modelName}\n`);
    lines.push("### 6维度评分对比\n");
    lines.push("| 维度 | 权重 | extended-if | visibility | extended-switch |");
    lines.push("|------|------|-------------|------------|-----------------|");

    const entries: [string, number, number, number, number][] = [
      ["D1 语法准确率", 0.20, extIf.dimensions.d1_syntactic_accuracy, vis.dimensions.d1_syntactic_accuracy, extSw.dimensions.d1_syntactic_accuracy],
      ["D2 语义准确率", 0.25, extIf.dimensions.d2_semantic_accuracy, vis.dimensions.d2_semantic_accuracy, extSw.dimensions.d2_semantic_accuracy],
      ["D3 生成效率", 0.15, extIf.dimensions.d3_generation_efficiency, vis.dimensions.d3_generation_efficiency, extSw.dimensions.d3_generation_efficiency],
      ["D4 学习曲线", 0.15, extIf.dimensions.d4_learning_curve, vis.dimensions.d4_learning_curve, extSw.dimensions.d4_learning_curve],
      ["D5 边界鲁棒性", 0.15, extIf.dimensions.d5_edge_robustness, vis.dimensions.d5_edge_robustness, extSw.dimensions.d5_edge_robustness],
      ["D6 一致稳定性", 0.10, extIf.dimensions.d6_consistency, vis.dimensions.d6_consistency, extSw.dimensions.d6_consistency],
    ];

    for (const [label, weight, iv, vv, sv] of entries) {
      lines.push(`| ${label} | ${(weight * 100).toFixed(0)}% | ${(iv * 100).toFixed(1)}% | ${(vv * 100).toFixed(1)}% | ${(sv * 100).toFixed(1)}% |`);
    }

    lines.push(`| **MA综合** | **100%** | **${(extIf.dimensions.ma_overall * 100).toFixed(1)}% (${extIf.dimensions.ma_grade})** | **${(vis.dimensions.ma_overall * 100).toFixed(1)}% (${vis.dimensions.ma_grade})** | **${(extSw.dimensions.ma_overall * 100).toFixed(1)}% (${extSw.dimensions.ma_grade})** |`);

    if (extIf.dimensions.learning_curve && vis.dimensions.learning_curve && extSw.dimensions.learning_curve) {
      lines.push("\n### D4 学习曲线明细\n");
      lines.push("| shot数 | extended-if | visibility | extended-switch |");
      lines.push("|--------|-------------|------------|-----------------|");
      lines.push(`| 0-shot | ${(extIf.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% | ${(vis.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% | ${(extSw.dimensions.learning_curve.shot_0_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 1-shot | ${(extIf.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% | ${(vis.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% | ${(extSw.dimensions.learning_curve.shot_1_accuracy * 100).toFixed(1)}% |`);
      lines.push(`| 3-shot | ${(extIf.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% | ${(vis.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% | ${(extSw.dimensions.learning_curve.shot_3_accuracy * 100).toFixed(1)}% |`);
    }

    if (extIf.dimensions.consistency_detail && vis.dimensions.consistency_detail && extSw.dimensions.consistency_detail) {
      lines.push("\n### D6 一致性明细\n");
      lines.push("| 指标 | extended-if | visibility | extended-switch |");
      lines.push("|------|-------------|------------|-----------------|");
      lines.push(`| 结构一致率 | ${(extIf.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% | ${(vis.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% | ${(extSw.dimensions.consistency_detail.structural_consistency * 100).toFixed(1)}% |`);
      lines.push(`| 语义等价率 | ${(extIf.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% | ${(vis.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% | ${(extSw.dimensions.consistency_detail.semantic_equivalence * 100).toFixed(1)}% |`);
    }

    for (const eval_ of [extIf, vis, extSw]) {
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
