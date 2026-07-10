import type {
  PerCaseResult,
  LevelBreakdown,
  DimensionScores,
  LearningCurveData,
  ConsistencyData,
} from "./types.js";

// ============================================================================
// D1: 语法准确率
// ============================================================================

/** 从逐用例结果计算 D1 分数（需要 LevelBreakdown 数据） */
export function calcD1(caseResults: CaseResultWithLevels[]): number {
  if (caseResults.length === 0) return 0;

  let l1 = 0, l2 = 0;
  for (const r of caseResults) {
    if (r.levels.l1_json_parsed) l1++;
    if (r.levels.l2_structure_ok) l2++;
  }
  const n = caseResults.length;
  return (l1 / n) * 0.4 + (l2 / n) * 0.6;
}

// ============================================================================
// D2: 语义准确率（基于策略特定规则通过率）
// ============================================================================

/** D2 = L3·0.4 + L4·0.6（模式匹配 + 规则通过） */
export function calcD2(caseResults: CaseResultWithLevels[]): number {
  if (caseResults.length === 0) return 0;
  let l3 = 0, l4 = 0;
  for (const r of caseResults) {
    if (r.levels.l3_patterns_ok) l3++;
    if (r.levels.l4_rules_ok) l4++;
  }
  const n = caseResults.length;
  return (l3 / n) * 0.4 + (l4 / n) * 0.6;
}

// ============================================================================
// D3: 生成效率
// ============================================================================

export function calcD3(
  caseResults: PerCaseResult[],
  maxRetries: number
): number {
  if (caseResults.length === 0) return 0;

  const n = caseResults.length;
  const firstTryRate = caseResults.filter((r) => r.retries === 0).length / n;
  const avgRetry = caseResults.reduce((s, r) => s + r.retries, 0) / n;

  const retryScore = 1 - Math.min(avgRetry / maxRetries, 1);

  return firstTryRate * 0.7 + retryScore * 0.3;
}

// ============================================================================
// D4: 概念收敛速度（学习曲线）
// ============================================================================

export function calcD4(
  shot0Accuracy: number,
  shot1Accuracy: number,
  shot3Accuracy: number
): { score: number; detail: LearningCurveData } {
  const delta01 = Math.max(shot1Accuracy - shot0Accuracy, 0);
  const detail: LearningCurveData = {
    shot_0_accuracy: shot0Accuracy,
    shot_1_accuracy: shot1Accuracy,
    shot_3_accuracy: shot3Accuracy,
    delta_0_to_1: delta01,
    delta_1_to_3: Math.max(shot3Accuracy - shot1Accuracy, 0),
  };

  const score = shot0Accuracy * 0.5 + shot1Accuracy * 0.2 + shot3Accuracy * 0.3;
  return { score, detail };
}

// ============================================================================
// D5: 边界鲁棒性
// ============================================================================

/** D5 = 边界鲁棒性（medium + complex 用例通过率；若无则回退全量） */
export function calcD5(caseResults: PerCaseResult[]): number {
  if (caseResults.length === 0) return 0;
  const edgeCases = caseResults.filter((r) => r.complexity === "medium" || r.complexity === "complex");
  const target = edgeCases.length > 0 ? edgeCases : caseResults;
  return target.filter((r) => r.passed).length / target.length;
}

// ============================================================================
// D6: 一致稳定性
// ============================================================================

export function calcD6(repeatGroups: PerCaseResult[][]): { score: number; detail: ConsistencyData } {
  if (repeatGroups.length === 0) {
    return { score: 0, detail: { structural_consistency: 0, semantic_equivalence: 0 } };
  }

  let structuralMatch = 0;
  let semanticMatch = 0;
  let total = 0;

  for (const group of repeatGroups) {
    if (group.length < 2) continue;
    total++;

    // 比较所有配对
    const dslList = group.map((r) => r.generated_dsl).filter(Boolean) as Record<string, unknown>[];
    if (dslList.length < 2) continue;

    // 结构一致：所有输出的 key 结构相同
    const structures = dslList.map(getStructure);
    const allStructMatch = structures.every((s) => JSON.stringify(s) === JSON.stringify(structures[0]));
    if (allStructMatch) structuralMatch++;

    // 语义等价：关键字段值相同
    const allSemanticMatch = dslList.every((dsl) => semanticEquals(dsl, dslList[0]));
    if (allSemanticMatch) semanticMatch++;
  }

  const structRate = total > 0 ? structuralMatch / total : 0;
  const semRate = total > 0 ? semanticMatch / total : 0;

  return {
    score: structRate * 0.4 + semRate * 0.6,
    detail: { structural_consistency: structRate, semantic_equivalence: semRate },
  };
}

/** 获取 JSON 的结构（key 层级，忽略值） */
function getStructure(obj: Record<string, unknown>): unknown {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      result[key] = getStructure(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        item !== null && typeof item === "object" ? getStructure(item as Record<string, unknown>) : typeof item
      );
    } else {
      result[key] = typeof value;
    }
  }
  return result;
}

/** 语义等价比较：忽略 id，比较 component、关键属性、事件 */
function semanticEquals(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  if (a.component !== b.component) return false;

  const keysToCheck = ["label", "content", "placeholder", "theme", "text", "condition"];
  for (const key of keysToCheck) {
    if (key in a || key in b) {
      if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) return false;
    }
  }

  const EVENT_NAMES = ["onClick", "onChange", "onSubmit", "onAppear", "onSelect", "onReachStart", "onReachEnd"];
  const aHasEvents = EVENT_NAMES.some((e) => e in a);
  const bHasEvents = EVENT_NAMES.some((e) => e in b);
  if (aHasEvents || bHasEvents) {
    if (aHasEvents !== bHasEvents) return false;
    const eventsA = EVENT_NAMES.filter((e) => e in a).sort();
    const eventsB = EVENT_NAMES.filter((e) => e in b).sort();
    if (JSON.stringify(eventsA) !== JSON.stringify(eventsB)) return false;
  }

  return true;
}

// ============================================================================
// MA: 综合评分
// ============================================================================

export function calcMA(
  d1: number, d2: number, d3: number,
  d4: number, d5: number, d6: number
): { score: number; grade: string } {
  const score = d1 * 0.20 + d2 * 0.25 + d3 * 0.15 + d4 * 0.15 + d5 * 0.15 + d6 * 0.10;
  let grade: string;
  if (score >= 0.9) grade = "A+";
  else if (score >= 0.8) grade = "A";
  else if (score >= 0.7) grade = "B";
  else if (score >= 0.6) grade = "C";
  else grade = "D";

  return { score, grade };
}

/** 辅助类型：含 LevelBreakdown 的用例结果 */
export interface CaseResultWithLevels extends PerCaseResult {
  levels: LevelBreakdown;
}
