# V3 Rule Calibration Iteration 1

- generated_at: 2026-07-12T17:57:51
- sample_count: 10
- visual_prompt: C:\Users\afan\Desktop\loop iteration\new_cleaned.md
- distillation_scope: formula-computable axes only; visual_impact_originality is excluded from rule-dimension mapping
- overall_mae: 7.07
- overall_rmse: 8.56
- overall_bias_rule_minus_teacher: 2.2
- pearson: 0.779
- spearman: 0.5273
- top_k_overlap: 0.6
- bottom_k_overlap: 0.6
- bucket_accuracy: 0.6
- bad_case_count: 4
- dangerous_high_rule_low_teacher_count: 0

## Overall Error

| sample | rule | teacher | error | abs_error |
| --- | ---: | ---: | ---: | ---: |
| battery | 76.01 | 76.81 | -0.80 | 0.80 |
| care | 66.04 | 57.06 | 8.98 | 8.98 |
| earbuds | 48.17 | 37.75 | 10.42 | 10.42 |
| focus | 78.61 | 84.06 | -5.45 | 5.45 |
| marathon | 67.12 | 73.19 | -6.07 | 6.07 |
| meeting | 74.66 | 57.44 | 17.22 | 17.22 |
| sleep | 66.85 | 78.88 | -12.03 | 12.03 |
| status | 70.51 | 66.56 | 3.95 | 3.95 |
| warn | 76.56 | 72.44 | 4.12 | 4.12 |
| weather | 74.39 | 72.69 | 1.70 | 1.70 |

## Dimension Bias

| dimension | avg rule-teacher error |
| --- | ---: |
| layout | 12.03 |
| information | 12.00 |
| visual | -9.19 |
| consistency | -5.76 |

## Metric Signals

| dimension | metric | avg metric score | avg overall error | support |
| --- | --- | ---: | ---: | ---: |
| consistency | icon_size_consistency | 42.69 | 4.62 | 5 |
| consistency | padding_consistency | 18.01 | 4.53 | 6 |
| consistency | corner_radius_consistency | 40.87 | 4.53 | 6 |
| consistency | component_size | 25.67 | 4.12 | 1 |
| layout | margin_consistency | 26.93 | 2.20 | 10 |
| visual | contrast | 37.73 | 2.20 | 10 |
| layout | spacing_rhythm | 41.00 | 2.20 | 10 |
| visual | text_image_ratio | 61.72 | 2.20 | 10 |
| consistency | alignment | 63.15 | 2.20 | 10 |
| consistency | grid | 69.28 | 2.20 | 10 |

## Optimization Suggestions

- 整体偏差 2.20 分，先处理维度级和指标级局部误差，不建议做全局平移。
- `layout` 平均高于教师映射分 12.03 分：建议降低该维度权重，或提高其低质样本惩罚敏感度。
- `information` 平均高于教师映射分 12.00 分：建议降低该维度权重，或提高其低质样本惩罚敏感度。
- `visual` 平均低于教师映射分 9.19 分：建议检查是否被 OCR/CV 启发式误伤，优先放宽该维度内低分指标。
- `consistency` 平均低于教师映射分 5.76 分：建议检查是否被 OCR/CV 启发式误伤，优先放宽该维度内低分指标。

## Candidate Config Changes

- `config/score.yaml`: 规则低估的维度可小幅加权，或先保持权重、放宽内部指标；本轮低估维度为 `visual`(-9.19), `consistency`(-5.76)。
- `config/score.yaml`: 规则高估的维度可小幅降权，或增加惩罚项；本轮高估维度为 `information`(+12.00), `layout`(+12.03)。

## Output Files

- Rule reports: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_3_probe\rule_reports`
- Visual teacher JSON: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_3_probe\visual_reports\json\index.json`
- Overall CSV: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_3_probe\comparison\OverallError.csv`
- Dimension CSV: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_3_probe\comparison\DimensionError.csv`
- Metric CSV: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_3_probe\comparison\MetricError.csv`
- Rank CSV: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_3_probe\comparison\RankError.csv`
- Bucket CSV: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_3_probe\comparison\BucketConfusion.csv`
- Bad cases: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_3_probe\comparison\BadCases.md`

Note: suggestions are candidates for human review. This script does not modify rule config automatically.
