// ============================================================================
// 核心类型定义
// ============================================================================

/**
 * 变量作用域策略
 *
 * 以下策略对应的 eval 脚本已废弃（测试幽灵特性），不应在新评估中使用：
 * - "format" | "template-literal" | "coexist" → eval-builtin-func.ts (GAP-047/049)
 * - "template-text" | "explicit-only" → eval-template-interpolation.ts (GAP-049)
 */
export type ScopeStrategy = "shadowing" | "explicit" | "inline" | "wrapped" | "asymmetric" | "symmetric" | "full" | "subset" | "ternary" | "format" | "template-literal" | "coexist" | "three-layer" | "two-layer" | "flat" | "distinguish" | "unified-dollar" | "unified-brace" | "dot-path" | "json-pointer" | "hybrid" | "direct" | "explicit-datamodel" | "data-prefix" | "braced" | "bare" | "breakpoint-enum" | "window-size" | "unified-gradient" | "separate-gradients" | "keyed-gradient" | "label-value" | "value-flat" | "index-based" | "template-text" | "explicit-only";

/** 事件链执行策略 */
export type ChainStrategy = "handlerGroups" | "flat-array";

/** 测试用例 */
export interface TestCase {
  id: string;
  name: string;
  category: "expression" | "event" | "layout" | "component" | "mixed" | "variable-scope" | "event-chain" | "expression-wrapping" | "type-conversion" | "operator-scope" | "builtin-function" | "var-ref-syntax" | "template-interpolation" | "style" | "conditional-list" | "responsive" | "integration" | "t1-global-vars" | "t2-datamodel-absolute" | "t3-list-relative" | "t4-action-chain" | "t5-conflict" | "t6-mixed-complex" | "list-loop";
  complexity: "simple" | "medium" | "complex";
  /** 给LLM的自然语言任务描述 */
  task: string;
  /** 期望输出结构 */
  expected: ExpectedOutput;
  /** 验证规则 */
  validation_rules: ValidationRule[];
  /** 可选的协议提示，注入到prompt中 */
  hints?: string[];
}

/** 变量作用域测试用例（扩展 TestCase） */
export interface VariableScopeTestCase extends TestCase {
  category: "variable-scope" | "expression-wrapping" | "type-conversion" | "operator-scope" | "builtin-function" | "var-ref-syntax" | "template-interpolation";
  /** 两种策略共用的验证规则（结构校验） */
  shared_rules: ValidationRule[];
  /** 按策略区分的验证规则（变量引用校验） */
  strategy_rules: Record<ScopeStrategy, ValidationRule[]>;
  /** 冲突类型：none | shadowing | triple */
  scope_conflict_type: "none" | "shadowing" | "triple";
  /** 是否为边界/极限用例（用于 D5 边界鲁棒性计算） */
  is_edge?: boolean;
}

/** 事件链执行测试用例（扩展 TestCase） */
export interface ChainTestCase extends TestCase {
  category: "event-chain";
  /** 两种策略共用的验证规则（结构校验） */
  shared_rules: ValidationRule[];
  /** 按策略区分的验证规则（链式格式校验） */
  strategy_rules: Record<string, ValidationRule[]>;
  /** 链深度：1-4 */
  chain_depth: number;
  /** 链类型：single | sequential | conditional | branching */
  chain_type: "single" | "sequential" | "conditional" | "branching";
}

/** 期望输出 */
export interface ExpectedOutput {
  component?: string;
  required_fields: string[];
  patterns: PatternCheck[];
}

/** 模式匹配检查 */
export interface PatternCheck {
  /** 字段路径，如 "content.expr" 或 "onClick[0].call" */
  field: string;
  /** 字段值必须包含此子串 */
  must_contain?: string;
  /** 字段值必须匹配此正则 */
  must_match?: string;
  /** 字段值的JSON类型 */
  must_be_type?: "string" | "object" | "array" | "number" | "boolean";
}

/** 验证规则 */
export interface ValidationRule {
  type: "has_field" | "contains" | "not_contains" | "matches_regex" | "field_is_expr" | "events_format" | "children_format" | "chain_format";
  description: string;
  field?: string;
  value?: string;
}

/** 单次生成结果 */
export interface GenerationResult {
  test_case_id: string;
  model: string;
  raw_output: string;
  generated_dsl: Record<string, unknown> | null;
  passed: boolean;
  token_count: number;
  generation_time_ms: number;
  retry_count: number;
  errors: string[];
}

/** 模型配置 */
export interface LLMModelConfig {
  name: string;
  displayName: string;
  baseURL: string;
  apiKey: string;
  model: string;
  /** 最大输出 token 数（默认 20480） */
  maxTokens?: number;
}

/** 模型报告 */
export interface ModelReport {
  model_name: string;
  total: number;
  passed: number;
  accuracy: number;
  category_accuracy: Record<string, { passed: number; total: number }>;
  complexity_accuracy: Record<string, { passed: number; total: number }>;
  generation_stats: {
    total_tokens: number;
    avg_tokens: number;
    avg_time_ms: number;
    first_try_rate: number;
  };
  error_analysis: Record<string, number>;
  per_case: PerCaseResult[];
}

/** 单用例结果 */
export interface PerCaseResult {
  id: string;
  name: string;
  category: string;
  complexity: string;
  passed: boolean;
  tokens: number;
  time_ms: number;
  retries: number;
  errors: string[];
  /** LLM 原始输出 */
  raw_output: string;
  /** 解析后的 JSON（可能为 null） */
  generated_dsl: Record<string, unknown> | null;
}

/** 整体评估报告 */
export interface EvaluationReport {
  timestamp: string;
  protocol_version: string;
  total_cases: number;
  models: ModelReport[];
}

// ============================================================================
// 6 维度评分相关类型
// ============================================================================

/** D1 语法准确率 L1-L4 分层结果（单用例） */
export interface LevelBreakdown {
  l1_json_parsed: boolean;
  l2_structure_ok: boolean;
  l3_patterns_ok: boolean;
  l4_rules_ok: boolean;
}

/** D4 学习曲线数据 */
export interface LearningCurveData {
  shot_0_accuracy: number;
  shot_1_accuracy: number;
  shot_3_accuracy: number;
  delta_0_to_1: number;
  delta_1_to_3: number;
}

/** D6 一致性数据 */
export interface ConsistencyData {
  structural_consistency: number;
  semantic_equivalence: number;
}

/** 6 维度得分 */
export interface DimensionScores {
  d1_syntactic_accuracy: number;
  d2_semantic_accuracy: number;
  d3_generation_efficiency: number;
  d4_learning_curve: number;
  d5_edge_robustness: number;
  d6_consistency: number;
  /** MA 综合分 */
  ma_overall: number;
  /** 等级 */
  ma_grade: string;
  /** D4 学习曲线明细 */
  learning_curve?: LearningCurveData;
  /** D6 一致性明细 */
  consistency_detail?: ConsistencyData;
}

/** 单策略完整评估结果 */
export interface StrategyEvaluation {
  strategy: ScopeStrategy;
  model_name: string;
  total_cases: number;
  dimensions: DimensionScores;
  /** 主测试逐用例结果 */
  main_results: PerCaseResult[];
  /** D4 学习曲线逐用例结果（按 shot level 分组） */
  learning_results?: Record<string, PerCaseResult[]>;
  /** D6 一致性逐用例多次生成结果 */
  consistency_results?: Record<string, PerCaseResult[][]>;
}

/** 变量作用域对比报告 */
export interface VariableScopeComparisonReport {
  timestamp: string;
  protocol_version: string;
  evaluation_type: string;
  models: string[];
  total_cases: number;
  strategies: StrategyEvaluation[];
}

// ============================================================================
// 完整协议评估相关类型
// ============================================================================

/** 分类维度通过率 */
export interface CategoryBreakdown {
  total: number;
  passed: number;
  accuracy: number;
}

/** 完整协议单模型评估结果 */
export interface FullProtocolModelEvaluation {
  model_name: string;
  total_cases: number;
  dimensions: DimensionScores;
  /** 按分类统计通过率 */
  category_breakdown: Record<string, CategoryBreakdown>;
  main_results: PerCaseResult[];
  learning_results?: Record<string, PerCaseResult[]>;
  consistency_results?: Record<string, PerCaseResult[][]>;
}

/** 完整协议评估报告 */
export interface FullProtocolReport {
  timestamp: string;
  protocol_version: string;
  evaluation_type: "full-protocol-6d";
  models: string[];
  total_cases: number;
  model_evaluations: FullProtocolModelEvaluation[];
}
