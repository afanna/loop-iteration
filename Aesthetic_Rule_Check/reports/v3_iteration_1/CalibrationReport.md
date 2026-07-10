# V3 Rule Calibration Iteration 1

- generated_at: 2026-07-10T13:58:58
- sample_count: 10
- visual_prompt: C:\Users\afan\Desktop\loop iteration\new_cleaned.md
- distillation_scope: formula-computable axes only; visual_impact_originality is excluded from rule-dimension mapping
- overall_mae: 7.5
- overall_bias_rule_minus_teacher: -3.46

## Overall Error

| sample | rule | teacher | error | abs_error |
| --- | ---: | ---: | ---: | ---: |
| battery | 70.66 | 74.25 | -3.59 | 3.59 |
| care | 50.34 | 63.50 | -13.16 | 13.16 |
| earbuds | 61.24 | 50.81 | 10.43 | 10.43 |
| focus | 76.53 | 76.56 | -0.03 | 0.03 |
| marathon | 60.26 | 75.38 | -15.12 | 15.12 |
| meeting | 75.24 | 66.38 | 8.86 | 8.86 |
| sleep | 56.89 | 73.69 | -16.80 | 16.80 |
| status | 60.49 | 64.13 | -3.64 | 3.64 |
| warn | 75.91 | 75.00 | 0.91 | 0.91 |
| weather | 67.05 | 69.56 | -2.51 | 2.51 |

## Dimension Bias

| dimension | avg rule-teacher error |
| --- | ---: |
| layout | -12.24 |
| information | 10.49 |
| consistency | -7.09 |
| visual | 5.71 |

## Metric Signals

| dimension | metric | avg metric score | avg overall error | support |
| --- | --- | ---: | ---: | ---: |
| layout | margin_consistency | 26.93 | -3.46 | 10 |
| visual | contrast | 37.73 | -3.46 | 10 |
| layout | spacing_rhythm | 41.00 | -3.46 | 10 |
| layout | whitespace | 58.51 | -3.46 | 10 |
| layout | density | 58.51 | -3.46 | 10 |
| visual | text_image_ratio | 61.72 | -3.46 | 10 |
| consistency | alignment | 63.15 | -3.46 | 10 |
| consistency | grid | 69.28 | -3.46 | 10 |
| visual | color_harmony | 71.00 | -3.46 | 10 |
| consistency | style_simplicity | 71.69 | -3.46 | 10 |

## Optimization Suggestions

- 整体偏差 -3.46 分，先处理维度级和指标级局部误差，不建议做全局平移。
- `layout` 平均低于教师映射分 12.24 分：建议检查是否被 OCR/CV 启发式误伤，优先放宽该维度内低分指标。
- `information` 平均高于教师映射分 10.49 分：建议降低该维度权重，或提高其低质样本惩罚敏感度。
- `consistency` 平均低于教师映射分 7.09 分：建议检查是否被 OCR/CV 启发式误伤，优先放宽该维度内低分指标。
- `visual` 平均高于教师映射分 5.71 分：建议降低该维度权重，或提高其低质样本惩罚敏感度。

## Candidate Config Changes

- `config/score.yaml`: 规则低估的维度可小幅加权，或先保持权重、放宽内部指标；本轮低估维度为 `layout`(-12.24), `consistency`(-7.09)。
- `config/score.yaml`: 规则高估的维度可小幅降权，或增加惩罚项；本轮高估维度为 `information`(+10.49), `visual`(+5.71)。

## Output Files

- Rule reports: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_1\rule_reports`
- Visual teacher JSON: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_1\visual_reports\json\index.json`
- Overall CSV: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_1\comparison\OverallError.csv`
- Dimension CSV: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_1\comparison\DimensionError.csv`
- Metric CSV: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_1\comparison\MetricError.csv`

Note: suggestions are candidates for human review. This script does not modify rule config automatically.
