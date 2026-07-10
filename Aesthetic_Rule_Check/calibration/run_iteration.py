from __future__ import annotations

import argparse
import csv
import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


WORKSPACE_ROOT = Path(__file__).resolve().parents[2]
RULE_ROOT = WORKSPACE_ROOT / "Aesthetic_Rule_Check"
VLM_ROOT = WORKSPACE_ROOT / "aesthetic-v4-vlm-judge-package-20260624"
DEFAULT_PROMPT = WORKSPACE_ROOT / "new_cleaned.md"

TEACHER_TO_RULE = {
    "information": {
        "basic_usability": 0.70,
        "composition_hierarchy": 0.30,
    },
    "layout": {
        "composition_hierarchy": 0.70,
        "basic_usability": 0.15,
        "detail_finish": 0.15,
    },
    "visual": {
        # visual_impact_originality is intentionally excluded from rule distillation:
        # it is a semantic/creative teacher signal, not a stable mathematical rule target.
        "color_material": 0.55,
        "composition_hierarchy": 0.30,
        "typography": 0.15,
    },
    "consistency": {
        "detail_finish": 0.45,
        "typography": 0.35,
        "color_material": 0.20,
    },
}


def load_env_file(path: Path) -> dict[str, str]:
    env = os.environ.copy()
    if not path.exists():
        return env
    for raw in path.read_text(encoding="utf-8-sig").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in env:
            env[key] = value
    return env


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")


def sample_pairs(limit: int) -> list[dict[str, str]]:
    image_dir = WORKSPACE_ROOT / "picture"
    dsl_dir = WORKSPACE_ROOT / "dsl"
    pairs: list[dict[str, str]] = []
    for image_path in sorted(image_dir.glob("*.png")):
        dsl_path = dsl_dir / f"{image_path.stem}.dat"
        if not dsl_path.exists():
            continue
        pairs.append(
            {
                "sample_id": image_path.stem,
                "image_path": str(image_path.resolve()),
                "dsl_path": str(dsl_path.resolve()),
                "query": "",
            }
        )
    return pairs[:limit] if limit > 0 else pairs


def run_rule_reports(samples: list[dict[str, str]], out_dir: Path) -> list[dict[str, Any]]:
    sys.path.insert(0, str(RULE_ROOT))
    from aesthetic_rule_check.api import evaluate_card

    records: list[dict[str, Any]] = []
    for sample in samples:
        sample_dir = out_dir / sample["sample_id"]
        result = evaluate_card(
            image_path=sample["image_path"],
            dsl_path=sample["dsl_path"],
            query=sample.get("query", ""),
            output_dir=sample_dir,
            config_dir=RULE_ROOT / "config",
        )
        payload = result.to_dict()
        payload["sample_id"] = sample["sample_id"]
        payload["rule_result_path"] = str((sample_dir / "result.json").resolve())
        payload["rule_report_path"] = str((sample_dir / "report.html").resolve())
        records.append(payload)
    write_json(out_dir / "summary.json", records)
    return records


def write_visual_manifest(samples: list[dict[str, str]], manifest_path: Path) -> None:
    lines: list[str] = []
    for sample in samples:
        image_path = Path(sample["image_path"])
        digest = sha256_file(image_path)
        record = {
            "id": sample["sample_id"],
            "source": "calibration",
            "source_key": sample["sample_id"],
            "input_type": "image",
            "input_path": str(image_path.resolve()),
            "sample_metadata": {
                "dsl_path": sample["dsl_path"],
                "query": sample.get("query", ""),
            },
            "render_status": "ok",
            "views": [
                {
                    "viewport": "image",
                    "status": "ok",
                    "screenshot_path": str(image_path.resolve()),
                    "screenshot_sha256": digest,
                }
            ],
        }
        lines.append(json.dumps(record, ensure_ascii=False, sort_keys=True))
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def sha256_file(path: Path) -> str:
    import hashlib

    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def run_visual_reports(samples: list[dict[str, str]], out_dir: Path, prompt_path: Path) -> Path:
    manifest_path = out_dir / "manifest.jsonl"
    write_visual_manifest(samples, manifest_path)
    env = load_env_file(VLM_ROOT / "config" / "aesthetic-v4.env")
    env["AESTHETIC_V4_PROMPT_FILE"] = str(prompt_path.resolve())
    env.setdefault("AESTHETIC_V4_MODEL_PROVIDER", "ark")
    env.setdefault("ARK_JUDGE_MODEL", "doubao-seed-2-0-lite")
    env.setdefault("ARK_JUDGE_OUTPUT_MODE", "full")
    env["ARK_JUDGE_PROMPT_VERSION"] = "harmony-card-teacher-v1"
    env.setdefault("ARK_JUDGE_TIMEOUT", "360")
    env.setdefault("ARK_JUDGE_MAX_TOKENS", "1200")

    python_bin = env.get("PYTHON_BIN") or sys.executable
    judge_command = (
        f'"{python_bin}" scripts/ark_rubric_judge.py '
        f'--base-url "{env.get("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/plan/v3")}" '
        f'--prompt-version "{env.get("ARK_JUDGE_PROMPT_VERSION", "harmony-card-teacher-v1")}" '
        f'--model "{env.get("ARK_JUDGE_MODEL", "doubao-seed-2-0-lite")}" '
        f'--output-mode "{env.get("ARK_JUDGE_OUTPUT_MODE", "full")}" '
        f'--timeout "{env.get("ARK_JUDGE_TIMEOUT", "360")}" '
        f'--max-tokens "{env.get("ARK_JUDGE_MAX_TOKENS", "1200")}"'
    )
    timeout = int(env.get("ARK_JUDGE_TIMEOUT", "360")) + 40
    cmd = [
        python_bin,
        "scripts/score_images.py",
        "--input",
        str(manifest_path.resolve()),
        "--out",
        str((out_dir / "scores.jsonl").resolve()),
        "--cache",
        str((out_dir / "score_cache.jsonl").resolve()),
        "--backend",
        "command",
        "--judge-command",
        judge_command,
        "--timeout",
        str(timeout),
        "--adaptive-viewports",
        "off",
        "--score-breakdown",
        "on",
        "--designer-review",
        "on",
        "--workers",
        "1",
        "--refresh",
    ]
    subprocess.run(cmd, cwd=VLM_ROOT / "pipeline", env=env, check=True)

    json_dir = out_dir / "json"
    index_path = json_dir / "index.json"
    subprocess.run(
        [
            python_bin,
            "scripts/export_clean_html_score_json.py",
            "--scores",
            str((out_dir / "scores.jsonl").resolve()),
            "--out-dir",
            str(json_dir.resolve()),
            "--index",
            str(index_path.resolve()),
        ],
        cwd=VLM_ROOT / "pipeline",
        env=env,
        check=True,
    )
    subprocess.run(
        [python_bin, "scripts/validate_clean_json.py", str(index_path.resolve())],
        cwd=VLM_ROOT / "pipeline",
        env=env,
        check=True,
    )
    return index_path


def load_visual_records(index_path: Path) -> dict[str, dict[str, Any]]:
    index = read_json(index_path)
    records: dict[str, dict[str, Any]] = {}
    for item in index.get("records", []):
        qid = item.get("qid") or item.get("id")
        json_path = Path(item["json_path"])
        records[str(qid)] = read_json(json_path)
    return records


def normalize_teacher_score(value: Any) -> float:
    """Return a teacher score on the rule engine's 0-100 scale."""
    score = float(value)
    if 0.0 <= score <= 8.0:
        return round(score * 12.5, 3)
    return round(score, 3)


def score_100_from_teacher_axis(axis_scores: dict[str, Any], mapping: dict[str, float]) -> float:
    total = 0.0
    weight_sum = 0.0
    for axis, weight in mapping.items():
        total += normalize_teacher_score(axis_scores.get(axis, 0.0)) * weight
        weight_sum += weight
    return round(total / weight_sum, 2) if weight_sum else 0.0


def rule_dimensions(rule_record: dict[str, Any]) -> dict[str, float]:
    return {item["name"]: float(item["score"]) for item in rule_record.get("dimensions", [])}


def visual_axis_scores(teacher_record: dict[str, Any]) -> dict[str, float]:
    aesthetics = teacher_record.get("extra_info_scores", {}).get("aesthetics", {})
    axis_scores = aesthetics.get("axis_scores")
    if isinstance(axis_scores, dict):
        return {str(key): normalize_teacher_score(value) for key, value in axis_scores.items() if value is not None}
    weighted = aesthetics.get("axis_weighted_scores")
    if isinstance(weighted, list):
        return {str(item["id"]): normalize_teacher_score(item["score"]) for item in weighted}
    return {}


def visual_score_100(teacher_record: dict[str, Any]) -> float:
    aesthetics = teacher_record.get("extra_info_scores", {}).get("aesthetics", {})
    if aesthetics.get("score_100") is not None:
        return round(float(aesthetics["score_100"]), 2)
    if aesthetics.get("score") is not None:
        return round(normalize_teacher_score(aesthetics["score"]), 2)
    return round(normalize_teacher_score(teacher_record.get("final_score", 0.0)), 2)


def compare(rule_records: list[dict[str, Any]], visual_records: dict[str, dict[str, Any]], out_dir: Path) -> dict[str, Any]:
    sample_rows: list[dict[str, Any]] = []
    dimension_rows: list[dict[str, Any]] = []
    metric_rows: list[dict[str, Any]] = []

    for rule in rule_records:
        sample_id = rule["sample_id"]
        teacher = visual_records.get(sample_id)
        if not teacher:
            continue
        rule_overall = float(rule["overall"])
        teacher_overall = visual_score_100(teacher)
        sample_rows.append(
            {
                "sample_id": sample_id,
                "rule_overall": rule_overall,
                "teacher_overall": teacher_overall,
                "error_rule_minus_teacher": round(rule_overall - teacher_overall, 2),
                "abs_error": round(abs(rule_overall - teacher_overall), 2),
            }
        )
        axis = visual_axis_scores(teacher)
        dims = rule_dimensions(rule)
        for dimension, mapping in TEACHER_TO_RULE.items():
            teacher_dim = score_100_from_teacher_axis(axis, mapping)
            rule_dim = dims.get(dimension, 0.0)
            dimension_rows.append(
                {
                    "sample_id": sample_id,
                    "dimension": dimension,
                    "rule_score": round(rule_dim, 2),
                    "teacher_mapped_score": teacher_dim,
                    "error_rule_minus_teacher": round(rule_dim - teacher_dim, 2),
                    "abs_error": round(abs(rule_dim - teacher_dim), 2),
                    "mapping": json.dumps(mapping, ensure_ascii=False, sort_keys=True),
                }
            )
        for metric in rule.get("metrics", []):
            if metric.get("score") is None:
                continue
            metric_rows.append(
                {
                    "sample_id": sample_id,
                    "dimension": metric.get("dimension"),
                    "metric": metric.get("name"),
                    "metric_score": round(float(metric["score"]), 2),
                    "metric_value": json.dumps(metric.get("value"), ensure_ascii=False, sort_keys=True),
                    "overall_error_rule_minus_teacher": round(rule_overall - teacher_overall, 2),
                }
            )

    write_csv(out_dir / "OverallError.csv", sample_rows)
    write_csv(out_dir / "DimensionError.csv", dimension_rows)
    write_csv(out_dir / "MetricError.csv", metric_rows)
    summary = {
        "samples": sample_rows,
        "dimensions": dimension_rows,
        "metrics": metric_rows,
        "mae": round(sum(row["abs_error"] for row in sample_rows) / len(sample_rows), 2) if sample_rows else None,
        "bias": round(sum(row["error_rule_minus_teacher"] for row in sample_rows) / len(sample_rows), 2) if sample_rows else None,
    }
    write_json(out_dir / "comparison_summary.json", summary)
    return summary


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    with path.open("w", encoding="utf-8-sig", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def mean_by(rows: list[dict[str, Any]], key: str, value: str) -> dict[str, float]:
    grouped: dict[str, list[float]] = {}
    for row in rows:
        grouped.setdefault(str(row[key]), []).append(float(row[value]))
    return {name: round(sum(values) / len(values), 2) for name, values in grouped.items()}


def top_metric_patterns(metric_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for row in metric_rows:
        grouped.setdefault((str(row["dimension"]), str(row["metric"])), []).append(row)
    patterns: list[dict[str, Any]] = []
    for (dimension, metric), rows in grouped.items():
        avg_metric = sum(float(row["metric_score"]) for row in rows) / len(rows)
        avg_error = sum(float(row["overall_error_rule_minus_teacher"]) for row in rows) / len(rows)
        patterns.append(
            {
                "dimension": dimension,
                "metric": metric,
                "avg_metric_score": round(avg_metric, 2),
                "avg_overall_error": round(avg_error, 2),
                "support": len(rows),
            }
        )
    return sorted(patterns, key=lambda item: (abs(item["avg_overall_error"]), 100 - item["avg_metric_score"]), reverse=True)[:10]


def _legacy_recommendation_text(summary: dict[str, Any]) -> list[str]:
    recommendations: list[str] = []
    bias = float(summary.get("bias") or 0.0)
    dim_bias = mean_by(summary["dimensions"], "dimension", "error_rule_minus_teacher")
    if bias > 5:
        recommendations.append(
            f"整体规则分平均高于视觉老师 {bias:.2f} 分，第一轮建议收紧扣分或降低偏高维度权重。"
        )
    elif bias < -5:
        recommendations.append(
            f"整体规则分平均低于视觉老师 {abs(bias):.2f} 分，第一轮建议放宽过严指标或提高被低估维度权重。"
        )
    else:
        recommendations.append(
            f"整体偏差 {bias:.2f} 分，先优先处理维度级和指标级局部误差。"
        )

    for dimension, error in sorted(dim_bias.items(), key=lambda item: abs(item[1]), reverse=True):
        if abs(error) < 5:
            continue
        if error > 0:
            recommendations.append(
                f"`{dimension}` 规则分平均高于映射后的老师分 {error:.2f} 分：建议提高该维度内低质样本的惩罚敏感度，或下调该维度总权重。"
            )
        else:
            recommendations.append(
                f"`{dimension}` 规则分平均低于映射后的老师分 {abs(error):.2f} 分：建议检查该维度是否被 OCR/CV 启发式误伤，优先放宽对应阈值。"
            )
    return recommendations


def recommendation_text(summary: dict[str, Any]) -> list[str]:
    recommendations: list[str] = []
    bias = float(summary.get("bias") or 0.0)
    dim_bias = mean_by(summary["dimensions"], "dimension", "error_rule_minus_teacher")
    if bias > 5:
        recommendations.append(
            f"整体规则分平均高于视觉老师 {bias:.2f} 分：第一轮应优先收紧高估维度，降低过于宽松指标的通过率。"
        )
    elif bias < -5:
        recommendations.append(
            f"整体规则分平均低于视觉老师 {abs(bias):.2f} 分：第一轮应优先放宽明显误伤的启发式指标，避免规则系统系统性低估。"
        )
    else:
        recommendations.append(
            f"整体偏差 {bias:.2f} 分，先处理维度级和指标级局部误差，不建议做全局平移。"
        )

    for dimension, error in sorted(dim_bias.items(), key=lambda item: abs(item[1]), reverse=True):
        if abs(error) < 5:
            continue
        if error > 0:
            recommendations.append(
                f"`{dimension}` 平均高于教师映射分 {error:.2f} 分：建议降低该维度权重，或提高其低质样本惩罚敏感度。"
            )
        else:
            recommendations.append(
                f"`{dimension}` 平均低于教师映射分 {abs(error):.2f} 分：建议检查是否被 OCR/CV 启发式误伤，优先放宽该维度内低分指标。"
            )
    return recommendations


def candidate_config_suggestions(summary: dict[str, Any]) -> list[str]:
    suggestions: list[str] = []
    dim_bias = mean_by(summary["dimensions"], "dimension", "error_rule_minus_teacher")
    metric_patterns = top_metric_patterns(summary["metrics"])

    low_dims = [name for name, error in dim_bias.items() if error < -5]
    high_dims = [name for name, error in dim_bias.items() if error > 5]
    if low_dims:
        suggestions.append(
            "`config/score.yaml`: 规则低估的维度可小幅加权，或先保持权重、放宽内部指标；本轮低估维度为 "
            + ", ".join(f"`{name}`({dim_bias[name]:.2f})" for name in low_dims)
            + "。"
        )
    if high_dims:
        suggestions.append(
            "`config/score.yaml`: 规则高估的维度可小幅降权，或增加惩罚项；本轮高估维度为 "
            + ", ".join(f"`{name}`(+{dim_bias[name]:.2f})" for name in high_dims)
            + "。"
        )

    for item in metric_patterns[:6]:
        dimension = item["dimension"]
        metric = item["metric"]
        avg_metric = float(item["avg_metric_score"])
        avg_error = float(item["avg_overall_error"])
        if avg_metric < 50 and avg_error < -5:
            suggestions.append(
                f"`config/metrics.yaml`: `{dimension}.{metric}` 平均仅 {avg_metric:.2f} 分，但整体规则低于教师 {abs(avg_error):.2f} 分，优先降低该指标权重或放宽 `mean/sigma/cv_k/penalty_k/target`。"
            )
        elif avg_metric > 80 and avg_error > 5:
            suggestions.append(
                f"`config/metrics.yaml`: `{dimension}.{metric}` 平均 {avg_metric:.2f} 分且整体规则偏高，可提高该指标惩罚敏感度或降低权重。"
            )

    if not suggestions:
        suggestions.append("本轮没有足够强的配置级信号；建议扩大样本量后再修改权重/阈值。")
    return suggestions


def write_markdown_report(samples: list[dict[str, str]], summary: dict[str, Any], out_dir: Path, prompt_path: Path) -> None:
    sample_rows = summary["samples"]
    dim_bias = mean_by(summary["dimensions"], "dimension", "error_rule_minus_teacher")
    metric_patterns = top_metric_patterns(summary["metrics"])
    lines: list[str] = [
        "# V3 Rule Calibration Iteration 1",
        "",
        f"- generated_at: {datetime.now().isoformat(timespec='seconds')}",
        f"- sample_count: {len(samples)}",
        f"- visual_prompt: {prompt_path}",
        "- distillation_scope: formula-computable axes only; visual_impact_originality is excluded from rule-dimension mapping",
        f"- overall_mae: {summary.get('mae')}",
        f"- overall_bias_rule_minus_teacher: {summary.get('bias')}",
        "",
        "## Overall Error",
        "",
        "| sample | rule | teacher | error | abs_error |",
        "| --- | ---: | ---: | ---: | ---: |",
    ]
    for row in sample_rows:
        lines.append(
            f"| {row['sample_id']} | {row['rule_overall']:.2f} | {row['teacher_overall']:.2f} | "
            f"{row['error_rule_minus_teacher']:.2f} | {row['abs_error']:.2f} |"
        )
    lines.extend(["", "## Dimension Bias", "", "| dimension | avg rule-teacher error |", "| --- | ---: |"])
    for dimension, error in sorted(dim_bias.items(), key=lambda item: abs(item[1]), reverse=True):
        lines.append(f"| {dimension} | {error:.2f} |")

    lines.extend(["", "## Metric Signals", "", "| dimension | metric | avg metric score | avg overall error | support |", "| --- | --- | ---: | ---: | ---: |"])
    for item in metric_patterns:
        lines.append(
            f"| {item['dimension']} | {item['metric']} | {item['avg_metric_score']:.2f} | "
            f"{item['avg_overall_error']:.2f} | {item['support']} |"
        )

    lines.extend(["", "## Optimization Suggestions", ""])
    for item in recommendation_text(summary):
        lines.append(f"- {item}")
    lines.extend(["", "## Candidate Config Changes", ""])
    for item in candidate_config_suggestions(summary):
        lines.append(f"- {item}")
    lines.extend(
        [
            "",
            "## Output Files",
            "",
            f"- Rule reports: `{out_dir / 'rule_reports'}`",
            f"- Visual teacher JSON: `{out_dir / 'visual_reports' / 'json' / 'index.json'}`",
            f"- Overall CSV: `{out_dir / 'comparison' / 'OverallError.csv'}`",
            f"- Dimension CSV: `{out_dir / 'comparison' / 'DimensionError.csv'}`",
            f"- Metric CSV: `{out_dir / 'comparison' / 'MetricError.csv'}`",
            "",
            "Note: suggestions are candidates for human review. This script does not modify rule config automatically.",
        ]
    )
    (out_dir / "CalibrationReport.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Run one offline V3 rule calibration iteration.")
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--out", default=str(RULE_ROOT / "reports" / "v3_iteration_1"))
    parser.add_argument("--prompt", default=str(DEFAULT_PROMPT))
    parser.add_argument("--skip-visual", action="store_true")
    parser.add_argument("--compare-only", action="store_true", help="Reuse existing rule and visual reports, then regenerate comparison outputs.")
    args = parser.parse_args()

    out_dir = Path(args.out).resolve()
    prompt_path = Path(args.prompt).resolve()
    samples = sample_pairs(args.limit)
    if not samples:
        raise SystemExit("no image/dsl sample pairs found")
    write_json(out_dir / "samples.json", samples)

    if args.compare_only:
        rule_records = read_json(out_dir / "rule_reports" / "summary.json")
        index_path = out_dir / "visual_reports" / "json" / "index.json"
    else:
        rule_records = run_rule_reports(samples, out_dir / "rule_reports")

    if args.skip_visual and not args.compare_only:
        print(json.dumps({"out_dir": str(out_dir), "samples": len(samples), "stage": "rule_only"}, ensure_ascii=False))
        return 0

    if not args.compare_only:
        index_path = run_visual_reports(samples, out_dir / "visual_reports", prompt_path)
    visual_records = load_visual_records(index_path)
    summary = compare(rule_records, visual_records, out_dir / "comparison")
    write_markdown_report(samples, summary, out_dir, prompt_path)
    print(json.dumps({"out_dir": str(out_dir), "samples": len(samples), "mae": summary["mae"], "bias": summary["bias"]}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
