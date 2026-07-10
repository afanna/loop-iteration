import type { PerCaseResult } from "./types.js";

/**
 * 一致性检查：对同一用例的 N 次生成结果进行对比
 *
 * 返回：
 * - structural_consistency: 结构一致率（JSON key 结构完全相同）
 * - semantic_equivalence: 语义等价率（关键字段值相同）
 * - pairwise_details: 每对比较的详细结果
 */
export interface ConsistencyResult {
  structural_consistency: number;
  semantic_equivalence: number;
  pairwise_details: PairwiseDetail[];
}

export interface PairwiseDetail {
  case_id: string;
  pair_index: [number, number];
  structural_match: boolean;
  semantic_match: boolean;
  differences: string[];
}

export function checkConsistency(
  caseId: string,
  results: PerCaseResult[]
): ConsistencyResult {
  const dslList = results
    .map((r, i) => ({ index: i, dsl: r.generated_dsl }))
    .filter((d): d is { index: number; dsl: Record<string, unknown> } => d.dsl !== null);

  if (dslList.length < 2) {
    return {
      structural_consistency: 1,
      semantic_equivalence: 1,
      pairwise_details: [],
    };
  }

  let structMatches = 0;
  let semMatches = 0;
  let pairCount = 0;
  const details: PairwiseDetail[] = [];

  // 比较所有相邻配对
  for (let i = 0; i < dslList.length - 1; i++) {
    const a = dslList[i];
    const b = dslList[i + 1];
    pairCount++;

    const diffs: string[] = [];

    // 结构比较
    const structMatch = structureEquals(a.dsl, b.dsl, diffs);
    if (structMatch) structMatches++;

    // 语义比较
    const semMatch = semanticEqualsDetailed(a.dsl, b.dsl, diffs);
    if (semMatch) semMatches++;

    details.push({
      case_id: caseId,
      pair_index: [a.index, b.index],
      structural_match: structMatch,
      semantic_match: semMatch,
      differences: diffs,
    });
  }

  return {
    structural_consistency: pairCount > 0 ? structMatches / pairCount : 1,
    semantic_equivalence: pairCount > 0 ? semMatches / pairCount : 1,
    pairwise_details: details,
  };
}

function structureEquals(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
  diffs: string[]
): boolean {
  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();

  if (JSON.stringify(keysA) !== JSON.stringify(keysB)) {
    diffs.push(`顶层key不同: [${keysA.join(",")}] vs [${keysB.join(",")}]`);
    return false;
  }

  let match = true;
  for (const key of keysA) {
    const va = a[key];
    const vb = b[key];

    if (typeof va !== typeof vb) {
      diffs.push(`${key}类型不同: ${typeof va} vs ${typeof vb}`);
      match = false;
      continue;
    }

    if (va === null || vb === null) {
      if (va !== vb) {
        diffs.push(`${key}值不同: ${va} vs ${vb}`);
        match = false;
      }
      continue;
    }

    if (typeof va === "object") {
      if (Array.isArray(va) && Array.isArray(vb)) {
        if (va.length !== vb.length) {
          diffs.push(`${key}数组长度不同: ${va.length} vs ${vb.length}`);
          match = false;
        }
        // 逐元素比较结构
        for (let i = 0; i < Math.min(va.length, vb.length); i++) {
          if (typeof va[i] === "object" && va[i] !== null && typeof vb[i] === "object" && vb[i] !== null) {
            const subMatch = structureEquals(
              va[i] as Record<string, unknown>,
              vb[i] as Record<string, unknown>,
              diffs
            );
            if (!subMatch) match = false;
          }
        }
      } else if (!Array.isArray(va) && !Array.isArray(vb)) {
        const subMatch = structureEquals(
          va as Record<string, unknown>,
          vb as Record<string, unknown>,
          diffs
        );
        if (!subMatch) match = false;
      }
    }
  }

  return match;
}

function semanticEqualsDetailed(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
  diffs: string[]
): boolean {
  let match = true;

  // component 必须一致
  if (a.component !== b.component) {
    diffs.push(`component不同: ${a.component} vs ${b.component}`);
    match = false;
  }

  // 关键字段值比较
  const fieldsToCheck = ["label", "content", "placeholder", "theme", "text", "condition", "isOn", "value", "src"];
  for (const field of fieldsToCheck) {
    if (field in a || field in b) {
      const va = JSON.stringify(a[field]);
      const vb = JSON.stringify(b[field]);
      if (va !== vb) {
        diffs.push(`${field}值不同: ${va} vs ${vb}`);
        match = false;
      }
    }
  }

  const EVENT_NAMES = ["onClick", "onChange", "onSubmit", "onAppear", "onSelect", "onReachStart", "onReachEnd"];
  const aHasEvents = EVENT_NAMES.some((e) => e in a);
  const bHasEvents = EVENT_NAMES.some((e) => e in b);
  if (aHasEvents || bHasEvents) {
    if (aHasEvents !== bHasEvents) {
      diffs.push("事件属性存在性不同");
      match = false;
    } else {
      const eventsA = EVENT_NAMES.filter((e) => e in a).sort();
      const eventsB = EVENT_NAMES.filter((e) => e in b).sort();
      if (JSON.stringify(eventsA) !== JSON.stringify(eventsB)) {
        diffs.push(`事件类型不同: [${eventsA.join(",")}] vs [${eventsB.join(",")}]`);
        match = false;
      }
    }
  }

  return match;
}
