/**
 * 用新的 D3/D4 公式重算所有已有报告的评分
 *
 * D1 新公式: L1·0.4 + L2·0.6（纯语法，去掉 L3/L4）
 * D2 新公式: L3·0.4 + L4·0.6（纯语义，不再仅用 L4）
 * D3 新公式: firstTryRate * 0.7 + retryScore * 0.3（去掉 tokenScore）
 * D4 新公式: shot0·0.5 + shot1·0.2 + shot3·0.3（纳入 shot1）
 * D5 新公式: medium + complex 用例通过率（真正的边界鲁棒性）
 * D6 修复: 正确提取 generated_dsl（之前误用 PerCaseResult 结构导致伪相关）
 *
 * 用法: npx tsx src/cli/recalc-scores.ts [--dry-run]
 */

import { resolve, dirname } from "path";
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "../../..");

const MAX_RETRIES = 3;
const isDryRun = process.argv.includes("--dry-run");

// ---- 新公式 ----

function calcD3New(mainResults: { retries: number }[]): number {
  if (mainResults.length === 0) return 0;
  const n = mainResults.length;
  const firstTryRate = mainResults.filter((r) => r.retries === 0).length / n;
  const avgRetry = mainResults.reduce((s, r) => s + r.retries, 0) / n;
  const retryScore = 1 - Math.min(avgRetry / MAX_RETRIES, 1);
  return firstTryRate * 0.7 + retryScore * 0.3;
}

function calcD4New(
  shot0Accuracy: number,
  shot1Accuracy: number,
  shot3Accuracy: number
): { score: number; detail: { shot_0_accuracy: number; shot_1_accuracy: number; shot_3_accuracy: number; delta_0_to_1: number; delta_1_to_3: number } } {
  const delta01 = Math.max(shot1Accuracy - shot0Accuracy, 0);
  const detail = {
    shot_0_accuracy: shot0Accuracy,
    shot_1_accuracy: shot1Accuracy,
    shot_3_accuracy: shot3Accuracy,
    delta_0_to_1: delta01,
    delta_1_to_3: Math.max(shot3Accuracy - shot1Accuracy, 0),
  };
  const score = shot0Accuracy * 0.5 + shot1Accuracy * 0.2 + shot3Accuracy * 0.3;
  return { score, detail };
}

// ---- 辅助 ----

function gradeOf(score: number): string {
  if (score >= 0.9) return "A+";
  if (score >= 0.8) return "A";
  if (score >= 0.7) return "B";
  if (score >= 0.6) return "C";
  return "D";
}

function computeShotAccuracy(results: { passed: boolean }[]): number {
  if (!results || results.length === 0) return 0;
  return results.filter((r) => r.passed).length / results.length;
}

// ---- Level breakdown 重算 D1/D2 ----

function calcD1(results: { levels: { l1_json_parsed: boolean; l2_structure_ok: boolean; l3_patterns_ok: boolean; l4_rules_ok: boolean } }[]): number {
  if (results.length === 0) return 0;
  let l1 = 0, l2 = 0;
  for (const r of results) {
    if (r.levels.l1_json_parsed) l1++;
    if (r.levels.l2_structure_ok) l2++;
  }
  const n = results.length;
  return (l1 / n) * 0.4 + (l2 / n) * 0.6;
}

function calcD2(results: { levels: { l3_patterns_ok: boolean; l4_rules_ok: boolean } }[]): number {
  if (results.length === 0) return 0;
  let l3 = 0, l4 = 0;
  for (const r of results) {
    if (r.levels.l3_patterns_ok) l3++;
    if (r.levels.l4_rules_ok) l4++;
  }
  const n = results.length;
  return (l3 / n) * 0.4 + (l4 / n) * 0.6;
}

function calcD5(results: { passed: boolean; complexity: string }[]): number {
  if (results.length === 0) return 0;
  const edgeCases = results.filter((r) => r.complexity === "medium" || r.complexity === "complex");
  const target = edgeCases.length > 0 ? edgeCases : results;
  return target.filter((r) => r.passed).length / target.length;
}

function calcD6(consistencyResults: Record<string, { generated_dsl?: Record<string, unknown>; [key: string]: unknown }[][]>): { score: number; detail: { structural_consistency: number; semantic_equivalence: number } } {
  if (!consistencyResults || Object.keys(consistencyResults).length === 0) {
    return { score: 0, detail: { structural_consistency: 0, semantic_equivalence: 0 } };
  }

  let structuralMatch = 0;
  let semanticMatch = 0;
  let total = 0;

  for (const group of Object.values(consistencyResults)) {
    if (!group || group.length < 2) continue;
    total++;

    // group = [[PerCaseResult_run1], [PerCaseResult_run2], ...] → flatten → extract generated_dsl
    const flatResults = group.flat();
    const dslList = flatResults.map((r) => r.generated_dsl).filter(Boolean) as Record<string, unknown>[];
    if (dslList.length < 2) continue;

    const structures = dslList.map(getStructure);
    if (structures.every((s) => JSON.stringify(s) === JSON.stringify(structures[0]))) structuralMatch++;

    if (dslList.every((dsl) => semanticEquals(dsl, dslList[0]))) semanticMatch++;
  }

  const structRate = total > 0 ? structuralMatch / total : 0;
  const semRate = total > 0 ? semanticMatch / total : 0;

  return {
    score: structRate * 0.4 + semRate * 0.6,
    detail: { structural_consistency: structRate, semantic_equivalence: semRate },
  };
}

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

// ---- 主流程 ----

// 扫描所有报告文件
const files: string[] = [];
const affinityDir = resolve(PROJECT_ROOT, "eval", "design-points");
for (const dp of readdirSync(affinityDir)) {
  const dpPath = resolve(affinityDir, dp);
  if (!statSync(dpPath).isDirectory()) continue;
  const reportsDir = resolve(dpPath, "reports");
  if (!statSync(reportsDir, { throwIfNoEntry: false })?.isDirectory()) continue;
  for (const f of readdirSync(reportsDir)) {
    if (f.endsWith(".json")) {
      files.push(resolve(reportsDir, f));
    }
  }
}
console.log(`Found ${files.length} report files\n`);

let totalUpdated = 0;
let totalSkipped = 0;

for (const filePath of files) {
  const data = JSON.parse(readFileSync(filePath, "utf-8"));
  const dp = filePath.split("/").slice(-3, -2)[0];
  let changed = false;

  for (const strat of data.strategies) {
    const dims = strat.dimensions;
    const mainResults = strat.main_results || [];
    const learningResults = strat.learning_results;
    const consistencyResults = strat.consistency_results;

    // 重算 D3
    const d3New = calcD3New(mainResults);
    const d3Old = dims.d3_generation_efficiency;

    // 重算 D4
    let d4New = dims.d4_learning_curve;
    let lcDetailNew = dims.learning_curve;
    if (learningResults && typeof learningResults === "object" && Object.keys(learningResults).length > 0) {
      const s0 = computeShotAccuracy(learningResults["0"] || []);
      const s1 = computeShotAccuracy(learningResults["1"] || []);
      const s3 = computeShotAccuracy(learningResults["3"] || []);
      const d4Result = calcD4New(s0, s1, s3);
      d4New = d4Result.score;
      lcDetailNew = d4Result.detail;
    }
    const d4Old = dims.d4_learning_curve;

    // D1/D2/D5/D6 重算（公式已改）
    const d1Old = dims.d1_syntactic_accuracy;
    const d2Old = dims.d2_semantic_accuracy;
    const d5Old = dims.d5_edge_robustness;
    const d6Old = dims.d6_consistency;
    const d1 = mainResults[0]?.levels ? calcD1(mainResults as { levels: { l1_json_parsed: boolean; l2_structure_ok: boolean; l3_patterns_ok: boolean; l4_rules_ok: boolean } }[]) : d1Old;
    const d2 = mainResults[0]?.levels ? calcD2(mainResults as { levels: { l3_patterns_ok: boolean; l4_rules_ok: boolean } }[]) : d2Old;
    const d5 = calcD5(mainResults);
    const d6Result = calcD6(consistencyResults || {});
    const d6 = consistencyResults && Object.keys(consistencyResults).length > 0 ? d6Result.score : d6Old;

    // 重算 MA
    const maNew = d1 * 0.20 + d2 * 0.25 + d3New * 0.15 + d4New * 0.15 + d5 * 0.15 + d6 * 0.10;
    const gradeNew = gradeOf(maNew);
    const maOld = dims.ma_overall;
    const gradeOld = dims.ma_grade;

    if (d1 !== d1Old || d2 !== d2Old || d3New !== d3Old || d4New !== d4Old || d5 !== d5Old || d6 !== d6Old || maNew !== maOld) {
      changed = true;
      console.log(`  ${dp}/${strat.strategy}/${strat.model_name}:`);
      if (d1 !== d1Old) console.log(`    D1: ${(d1Old * 100).toFixed(1)}% -> ${(d1 * 100).toFixed(1)}%`);
      if (d2 !== d2Old) console.log(`    D2: ${(d2Old * 100).toFixed(1)}% -> ${(d2 * 100).toFixed(1)}%`);
      if (d3New !== d3Old) console.log(`    D3: ${(d3Old * 100).toFixed(1)}% -> ${(d3New * 100).toFixed(1)}%`);
      if (d4New !== d4Old) console.log(`    D4: ${(d4Old * 100).toFixed(1)}% -> ${(d4New * 100).toFixed(1)}%`);
      if (d5 !== d5Old) console.log(`    D5: ${(d5Old * 100).toFixed(1)}% -> ${(d5 * 100).toFixed(1)}%`);
      if (d6 !== d6Old) console.log(`    D6: ${(d6Old * 100).toFixed(1)}% -> ${(d6 * 100).toFixed(1)}%`);
      console.log(`    MA: ${(maOld * 100).toFixed(1)}%(${gradeOld}) -> ${(maNew * 100).toFixed(1)}%(${gradeNew})`);

      // 更新
      strat.dimensions.d1_syntactic_accuracy = d1;
      strat.dimensions.d2_semantic_accuracy = d2;
      strat.dimensions.d3_generation_efficiency = d3New;
      strat.dimensions.d4_learning_curve = d4New;
      strat.dimensions.d5_edge_robustness = d5;
      strat.dimensions.d6_consistency = d6;
      strat.dimensions.ma_overall = maNew;
      strat.dimensions.ma_grade = gradeNew;
      if (lcDetailNew) {
        strat.dimensions.learning_curve = lcDetailNew;
      }
      if (consistencyResults && Object.keys(consistencyResults).length > 0) {
        strat.dimensions.consistency_detail = d6Result.detail;
      }
    }
  }

  if (changed) {
    totalUpdated++;
    if (!isDryRun) {
      writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
    }
  } else {
    totalSkipped++;
  }
}

console.log(`\n${isDryRun ? "[DRY RUN] " : ""}Updated: ${totalUpdated}, Skipped: ${totalSkipped}`);
