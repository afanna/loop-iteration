# V3 Rule Calibration Iteration 1

- generated_at: 2026-07-10T14:12:33
- sample_count: 10
- visual_prompt: C:\Users\afan\Desktop\loop iteration\new_cleaned.md
- distillation_scope: formula-computable axes only; visual_impact_originality is excluded from rule-dimension mapping
- overall_mae: 10.52
- overall_bias_rule_minus_teacher: -6.09

## Overall Error

| sample | rule | teacher | error | abs_error |
| --- | ---: | ---: | ---: | ---: |
| battery | 70.66 | 76.38 | -5.72 | 5.72 |
| care | 50.34 | 71.06 | -20.72 | 20.72 |
| earbuds | 61.24 | 42.19 | 19.05 | 19.05 |
| focus | 76.53 | 79.06 | -2.53 | 2.53 |
| marathon | 60.26 | 75.94 | -15.68 | 15.68 |
| meeting | 75.24 | 73.06 | 2.18 | 2.18 |
| sleep | 56.89 | 76.81 | -19.92 | 19.92 |
| status | 60.49 | 71.75 | -11.26 | 11.26 |
| warn | 75.91 | 75.00 | 0.91 | 0.91 |
| weather | 67.05 | 74.31 | -7.26 | 7.26 |

## Dimension Bias

| dimension | avg rule-teacher error |
| --- | ---: |
| layout | -15.51 |
| consistency | -10.41 |
| information | 8.96 |
| visual | 2.16 |

## Metric Signals

| dimension | metric | avg metric score | avg overall error | support |
| --- | --- | ---: | ---: | ---: |
| layout | margin_consistency | 26.93 | -6.09 | 10 |
| visual | contrast | 37.73 | -6.09 | 10 |
| layout | spacing_rhythm | 41.00 | -6.09 | 10 |
| layout | whitespace | 58.51 | -6.09 | 10 |
| layout | density | 58.51 | -6.09 | 10 |
| visual | text_image_ratio | 61.72 | -6.09 | 10 |
| consistency | alignment | 63.15 | -6.09 | 10 |
| consistency | grid | 69.28 | -6.09 | 10 |
| visual | color_harmony | 71.00 | -6.09 | 10 |
| consistency | style_simplicity | 71.69 | -6.09 | 10 |

## Optimization Suggestions

- 整体规则分平均低于视觉老师 6.09 分：第一轮应优先放宽明显误伤的启发式指标，避免规则系统系统性低估。
- `layout` 平均低于教师映射分 15.51 分：建议检查是否被 OCR/CV 启发式误伤，优先放宽该维度内低分指标。
- `consistency` 平均低于教师映射分 10.41 分：建议检查是否被 OCR/CV 启发式误伤，优先放宽该维度内低分指标。
- `information` 平均高于教师映射分 8.96 分：建议降低该维度权重，或提高其低质样本惩罚敏感度。

## Candidate Config Changes

- `config/score.yaml`: 规则低估的维度可小幅加权，或先保持权重、放宽内部指标；本轮低估维度为 `layout`(-15.51), `consistency`(-10.41)。
- `config/score.yaml`: 规则高估的维度可小幅降权，或增加惩罚项；本轮高估维度为 `information`(+8.96)。
- `config/metrics.yaml`: `layout.margin_consistency` 平均仅 26.93 分，但整体规则低于教师 6.09 分，优先降低该指标权重或放宽 `mean/sigma/cv_k/penalty_k/target`。
- `config/metrics.yaml`: `visual.contrast` 平均仅 37.73 分，但整体规则低于教师 6.09 分，优先降低该指标权重或放宽 `mean/sigma/cv_k/penalty_k/target`。
- `config/metrics.yaml`: `layout.spacing_rhythm` 平均仅 41.00 分，但整体规则低于教师 6.09 分，优先降低该指标权重或放宽 `mean/sigma/cv_k/penalty_k/target`。

## Output Files

- Rule reports: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_2\rule_reports`
- Visual teacher JSON: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_2\visual_reports\json\index.json`
- Overall CSV: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_2\comparison\OverallError.csv`
- Dimension CSV: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_2\comparison\DimensionError.csv`
- Metric CSV: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_2\comparison\MetricError.csv`

Note: suggestions are candidates for human review. This script does not modify rule config automatically.
