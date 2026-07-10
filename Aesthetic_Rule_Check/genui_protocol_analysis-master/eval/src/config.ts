import "dotenv/config";
import { readFile } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import type { LLMModelConfig, TestCase, VariableScopeTestCase, ChainTestCase } from "./core/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
/** eval/ 目录 */
export const TOOLKIT_ROOT = resolve(__dirname, "..");
/** 项目根目录 */
export const PROJECT_ROOT = resolve(TOOLKIT_ROOT, "..");

// ============================================================================
// 模型配置
// ============================================================================

/** 加载模型配置列表 */
export function loadModelConfigs(): LLMModelConfig[] {
  const models: LLMModelConfig[] = [];

  // GLM
  const glmKey = process.env.GLM_API_KEY;
  if (glmKey) {
    models.push({
      name: "glm",
      displayName: process.env.GLM_MODEL || "GLM-5.1",
      baseURL: process.env.GLM_BASE_URL || "https://open.bigmodel.cn/api/coding/paas/v4",
      apiKey: glmKey,
      model: process.env.GLM_MODEL || "glm-5.1",
    });
  }

  // DeepSeek
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (deepseekKey) {
    models.push({
      name: "deepseek",
      displayName: process.env.DEEPSEEK_MODEL || "DeepSeek-V3",
      baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
      apiKey: deepseekKey,
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      maxTokens: 8192,
    });
  }

  return models;
}

// ============================================================================
// 协议摘要
// ============================================================================

/** 加载协议摘要 */
export async function loadProtocolSummary(): Promise<string> {
  const path = resolve(TOOLKIT_ROOT, "prompts", "protocol-summary.md");
  return readFile(path, "utf-8");
}

/** 加载 Form 协议摘要 */
export async function loadFormProtocolSummary(): Promise<string> {
  const path = resolve(TOOLKIT_ROOT, "prompts", "protocol-form-summary.md");
  return readFile(path, "utf-8");
}

// ============================================================================
// 测试用例加载 — 支持通过环境变量或参数指定路径
// ============================================================================

/**
 * 从指定文件加载测试用例（通用）
 *
 * 路径查找优先级：
 * 1. 显式传入的 filePath 参数
 * 2. TEST_CASES_FILE 环境变量
 * 3. 默认路径
 */
export async function loadTestCasesFromFile<T>(
  filePath: string,
  fallbackPath?: string,
): Promise<T[]> {
  const actualPath = filePath || fallbackPath;
  if (!actualPath) {
    throw new Error("未指定测试用例文件路径");
  }
  const raw = await readFile(actualPath, "utf-8");
  return JSON.parse(raw) as T[];
}

/** 加载指定分类的测试用例（完整协议评估用） */
export async function loadTestCases(category: string, testCasesDir?: string): Promise<TestCase[]> {
  const dir = testCasesDir || process.env.TEST_CASES_DIR || resolve(TOOLKIT_ROOT, "test-cases");
  const path = resolve(dir, `${category}.json`);
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as TestCase[];
}

/** 加载所有测试用例（完整协议评估用） */
export async function loadAllTestCases(testCasesDir?: string): Promise<TestCase[]> {
  const categories = ["expressions", "events", "layout", "components", "mixed", "conflict-resolution"];
  const all: TestCase[] = [];
  for (const cat of categories) {
    try {
      const cases = await loadTestCases(cat, testCasesDir);
      all.push(...cases);
    } catch {
      // skip missing files
    }
  }
  return all;
}

/** 加载冲突解决测试用例 */
export async function loadConflictTestCases(testCasesDir?: string): Promise<TestCase[]> {
  return loadTestCases("conflict-resolution", testCasesDir);
}

/** 加载事件链执行测试用例 */
export async function loadChainTestCases(filePath?: string): Promise<ChainTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "event-chain", "test-cases", "chain-execution.json");
  return loadTestCasesFromFile<ChainTestCase>(path);
}

/** 加载表达式包装测试用例 */
export async function loadExpressionWrappingTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "expression-function", "test-cases", "expression-wrapping.json");
  return loadTestCasesFromFile<VariableScopeTestCase>(path);
}

/** 加载类型转换测试用例 */
export async function loadTypeConversionTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "expression-function", "test-cases", "type-conversion-plus.json");
  return loadTestCasesFromFile<VariableScopeTestCase>(path);
}

/** 加载表达式数据类型测试用例 */
export async function loadExpressionDatatypeTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "expression-datatype", "test-cases", "expression-datatype.json");
  return loadTestCasesFromFile<VariableScopeTestCase>(path);
}

/** 加载运算符范围测试用例 */
export async function loadOperatorScopeTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "operator-scope", "test-cases", "operator-scope.json");
  return loadTestCasesFromFile<VariableScopeTestCase>(path);
}

/** 加载内置函数测试用例 */
export async function loadBuiltinFunctionTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "expression-function", "test-cases", "builtin-function.json");
  return loadTestCasesFromFile<VariableScopeTestCase>(path);
}

/** 加载JSON Pointer引用测试用例 */
export async function loadJsonPointerRefTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "json-pointer-ref", "test-cases", "json-pointer-ref.json");
  return loadTestCasesFromFile<VariableScopeTestCase>(path);
}

/** 加载模板求值语法测试用例 */
export async function loadTemplateInterpolationTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "template-interpolation", "test-cases", "template-interpolation.json");
  return loadTestCasesFromFile<VariableScopeTestCase>(path);
}

/** 加载函数调用语法测试用例 */
export async function loadFunctionCallTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "function-call", "test-cases", "function-call.json");
  return loadTestCasesFromFile<VariableScopeTestCase>(path);
}

/** 加载交互行为结构测试用例 */
export async function loadActionStructureTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "action-structure", "test-cases", "action-structure.json");
  return loadTestCasesFromFile<VariableScopeTestCase>(path);
}

/** 加载组件命名测试用例 */
export async function loadComponentNamingTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "component-naming", "test-cases", "component-naming.json");
  return loadTestCasesFromFile<VariableScopeTestCase>(path);
}

/** 加载样式值类型测试用例 */
export async function loadStyleValueTypeTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "style-value-type", "test-cases", "style-value-type.json");
  return loadTestCasesFromFile<VariableScopeTestCase>(path);
}

/** 加载样式组织方式测试用例 */
export async function loadStyleOrganizationTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "style-organization", "test-cases", "style-organization.json");
  return loadTestCasesFromFile<VariableScopeTestCase>(path);
}

/** 加载数据模型访问语法测试用例 */
export async function loadDataModelAccessTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "data-model-access", "test-cases", "data-model-access.json");
  return loadTestCasesFromFile<VariableScopeTestCase>(path);
}

/** 加载条件渲染测试用例 */
export async function loadConditionalRenderingTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "conditional-rendering", "test-cases", "conditional-rendering.json");
  return loadTestCasesFromFile<VariableScopeTestCase>(path);
}

/** 加载表达式数据类型 v2 验证测试用例 */
export async function loadExprDatatypeV2TestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "expression-datatype", "test-cases", "expr-datatype-v2.json");
  return loadTestCasesFromFile<VariableScopeTestCase>(path);
}

/** 加载响应式断点测试用例 */
export async function loadResponsiveBreakpointTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "responsive-breakpoint", "test-cases", "responsive-breakpoint.json");
  return loadTestCasesFromFile<VariableScopeTestCase>(path);
}

/** 加载Select组件设计测试用例 */
export async function loadSelectComponentTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "select-component", "test-cases", "select-component.json");
  return loadTestCasesFromFile<VariableScopeTestCase>(path);
}

/** 加载渐变颜色属性组织测试用例 */
export async function loadColorGradientPropertyTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "color-gradient-property", "test-cases", "color-gradient-property.json");
  return loadTestCasesFromFile<VariableScopeTestCase>(path);
}

/** 加载Button.action测试用例 */
export async function loadButtonActionTestCases(filePath?: string): Promise<VariableScopeTestCase[]> {
  const path = filePath
    || process.env.TEST_CASES_FILE
    || resolve(TOOLKIT_ROOT, "design-points", "button-action", "test-cases", "button-action.json");
  return loadTestCasesFromFile<VariableScopeTestCase>(path);
}

/** 加载变量体系评估测试用例 */
export async function loadVariableSystemTestCases(testCasesDir?: string): Promise<TestCase[]> {
  const dir = testCasesDir
    || process.env.TEST_CASES_DIR
    || resolve(TOOLKIT_ROOT, "design-points", "variable-system", "test-cases");
  const categories = ["t1-global-vars", "t2-datamodel-absolute", "t3-list-relative", "t4-action-chain", "t5-conflict", "t6-mixed-complex"];
  const all: TestCase[] = [];
  for (const cat of categories) {
    try {
      const path = resolve(dir, `${cat}.json`);
      const raw = await readFile(path, "utf-8");
      all.push(...(JSON.parse(raw) as TestCase[]));
    } catch {
      // skip missing files
    }
  }
  return all;
}

// ============================================================================
// 完整协议评估
// ============================================================================

const FULL_PROTOCOL_CATEGORIES = [
  "FP-01-components",
  "FP-02-layout",
  "FP-03-styles",
  "FP-04-expressions",
  "FP-05-events",
  "FP-06-conditional-list",
  "FP-07-responsive",
  "FP-08-integration",
];

/** 加载完整协议评估的所有测试用例 */
export async function loadFullProtocolTestCases(testCasesDir?: string): Promise<TestCase[]> {
  const dir = testCasesDir
    || process.env.TEST_CASES_DIR
    || resolve(TOOLKIT_ROOT, "test-cases", "full-protocol");
  const all: TestCase[] = [];
  for (const cat of FULL_PROTOCOL_CATEGORIES) {
    try {
      const path = resolve(dir, `${cat}.json`);
      const raw = await readFile(path, "utf-8");
      all.push(...(JSON.parse(raw) as TestCase[]));
    } catch {
      // skip missing files
    }
  }
  return all;
}

/** 加载鸿蒙扩展 inline 协议摘要（{{ }} + flat-array + Extended前缀） */
export async function loadHarmonyOSInlineSummary(): Promise<string> {
  const path = resolve(TOOLKIT_ROOT, "prompts", "protocol-harmonyos-inline.md");
  return readFile(path, "utf-8");
}

/** 加载鸿蒙扩展协议摘要 */
export async function loadFullProtocolSummary(): Promise<string> {
  const path = resolve(TOOLKIT_ROOT, "prompts", "protocol-harmonyos-extended.md");
  return readFile(path, "utf-8");
}

// ============================================================================
// 报告输出路径
// ============================================================================

/**
 * 获取报告输出目录
 *
 * 查找优先级：
 * 1. 显式传入的 reportsDir 参数
 * 2. REPORTS_DIR 环境变量
 * 3. 默认路径
 */
export function resolveReportsDir(defaultSubPath?: string): string {
  if (process.env.REPORTS_DIR) {
    return resolve(process.env.REPORTS_DIR);
  }
  if (defaultSubPath) {
    return resolve(PROJECT_ROOT, defaultSubPath);
  }
  return resolve(TOOLKIT_ROOT, "reports");
}
