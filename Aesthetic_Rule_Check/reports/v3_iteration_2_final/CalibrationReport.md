# V3 Rule Calibration Iteration 1

- generated_at: 2026-07-10T14:31:53
- sample_count: 10
- visual_prompt: C:\Users\afan\Desktop\loop iteration\new_cleaned.md
- distillation_scope: formula-computable axes only; visual_impact_originality is excluded from rule-dimension mapping
- overall_mae: 2.76
- overall_bias_rule_minus_teacher: 0.67

## Overall Error

| sample | rule | teacher | error | abs_error |
| --- | ---: | ---: | ---: | ---: |
| battery | 76.01 | 76.38 | -0.37 | 0.37 |
| care | 70.56 | 71.06 | -0.50 | 0.50 |
| earbuds | 52.09 | 42.19 | 9.90 | 9.90 |
| focus | 78.61 | 79.06 | -0.45 | 0.45 |
| marathon | 72.07 | 75.94 | -3.87 | 3.87 |
| meeting | 74.66 | 73.06 | 1.60 | 1.60 |
| sleep | 71.52 | 76.81 | -5.29 | 5.29 |
| status | 75.76 | 71.75 | 4.01 | 4.01 |
| warn | 76.56 | 75.00 | 1.56 | 1.56 |
| weather | 74.39 | 74.31 | 0.08 | 0.08 |

## Dimension Bias

| dimension | avg rule-teacher error |
| --- | ---: |
| consistency | -10.41 |
| information | 8.96 |
| visual | -7.24 |
| layout | 6.62 |

## Metric Signals

| dimension | metric | avg metric score | avg overall error | support |
| --- | --- | ---: | ---: | ---: |
| consistency | icon_size_consistency | 42.69 | 2.15 | 5 |
| consistency | padding_consistency | 18.01 | 2.05 | 6 |
| consistency | corner_radius_consistency | 40.87 | 2.05 | 6 |
| consistency | component_size | 25.67 | 1.56 | 1 |
| layout | margin_consistency | 26.93 | 0.67 | 10 |
| visual | contrast | 37.73 | 0.67 | 10 |
| layout | spacing_rhythm | 41.00 | 0.67 | 10 |
| visual | text_image_ratio | 61.72 | 0.67 | 10 |
| consistency | alignment | 63.15 | 0.67 | 10 |
| consistency | grid | 69.28 | 0.67 | 10 |

## Optimization Suggestions

- 整体偏差 0.67 分，先处理维度级和指标级局部误差，不建议做全局平移。
- `consistency` 平均低于教师映射分 10.41 分：建议检查是否被 OCR/CV 启发式误伤，优先放宽该维度内低分指标。
- `information` 平均高于教师映射分 8.96 分：建议降低该维度权重，或提高其低质样本惩罚敏感度。
- `visual` 平均低于教师映射分 7.24 分：建议检查是否被 OCR/CV 启发式误伤，优先放宽该维度内低分指标。
- `layout` 平均高于教师映射分 6.62 分：建议降低该维度权重，或提高其低质样本惩罚敏感度。

## Candidate Config Changes

- `config/score.yaml`: 规则低估的维度可小幅加权，或先保持权重、放宽内部指标；本轮低估维度为 `visual`(-7.24), `consistency`(-10.41)。
- `config/score.yaml`: 规则高估的维度可小幅降权，或增加惩罚项；本轮高估维度为 `information`(+8.96), `layout`(+6.62)。

## Output Files

- Rule reports: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_2_final\rule_reports`
- Visual teacher JSON: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_2_final\visual_reports\json\index.json`
- Overall CSV: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_2_final\comparison\OverallError.csv`
- Dimension CSV: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_2_final\comparison\DimensionError.csv`
- Metric CSV: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_2_final\comparison\MetricError.csv`

Note: suggestions are candidates for human review. This script does not modify rule config automatically.
