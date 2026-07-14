# V3 Rule Calibration Iteration 1

- generated_at: 2026-07-12T18:16:14
- sample_count: 10
- visual_prompt: C:\Users\afan\Desktop\loop iteration\new_cleaned.md
- distillation_scope: formula-computable axes only; visual_impact_originality is excluded from rule-dimension mapping
- overall_mae: 6.28
- overall_rmse: 7.54
- overall_bias_rule_minus_teacher: 1.35
- pearson: 0.8737
- spearman: 0.5636
- top_k_overlap: 0.6
- bottom_k_overlap: 0.6
- bucket_accuracy: 0.6
- bad_case_count: 4
- dangerous_high_rule_low_teacher_count: 0

## Overall Error

| sample | rule | teacher | error | abs_error |
| --- | ---: | ---: | ---: | ---: |
| battery | 73.46 | 76.81 | -3.35 | 3.35 |
| care | 64.44 | 57.06 | 7.38 | 7.38 |
| earbuds | 48.81 | 37.75 | 11.06 | 11.06 |
| focus | 76.00 | 84.06 | -8.06 | 8.06 |
| marathon | 69.67 | 73.19 | -3.52 | 3.52 |
| meeting | 71.34 | 57.44 | 13.90 | 13.90 |
| sleep | 69.52 | 78.88 | -9.36 | 9.36 |
| status | 71.00 | 66.56 | 4.44 | 4.44 |
| warn | 73.80 | 72.44 | 1.36 | 1.36 |
| weather | 72.33 | 72.69 | -0.36 | 0.36 |

## Dimension Bias

| dimension | avg rule-teacher error |
| --- | ---: |
| information | 12.00 |
| layout | 6.42 |
| consistency | -5.76 |
| visual | -2.71 |

## Metric Signals

| dimension | metric | avg metric score | avg overall error | support |
| --- | --- | ---: | ---: | ---: |
| visual | sparse_text_stack | 0.00 | 11.06 | 1 |
| consistency | icon_size_consistency | 42.69 | 2.64 | 5 |
| consistency | padding_consistency | 18.01 | 2.43 | 6 |
| consistency | corner_radius_consistency | 40.87 | 2.43 | 6 |
| consistency | component_size | 25.67 | 1.36 | 1 |
| layout | margin_consistency | 20.94 | 1.35 | 10 |
| layout | spacing_rhythm | 34.07 | 1.35 | 10 |
| visual | contrast | 37.73 | 1.35 | 10 |
| visual | text_image_ratio | 61.72 | 1.35 | 10 |
| consistency | alignment | 63.15 | 1.35 | 10 |

## Optimization Suggestions

- 整体偏差 1.35 分，先处理维度级和指标级局部误差，不建议做全局平移。
- `information` 平均高于教师映射分 12.00 分：建议降低该维度权重，或提高其低质样本惩罚敏感度。
- `layout` 平均高于教师映射分 6.42 分：建议降低该维度权重，或提高其低质样本惩罚敏感度。
- `consistency` 平均低于教师映射分 5.76 分：建议检查是否被 OCR/CV 启发式误伤，优先放宽该维度内低分指标。

## Candidate Config Changes

- `config/score.yaml`: 规则低估的维度可小幅加权，或先保持权重、放宽内部指标；本轮低估维度为 `consistency`(-5.76)。
- `config/score.yaml`: 规则高估的维度可小幅降权，或增加惩罚项；本轮高估维度为 `information`(+12.00), `layout`(+6.42)。

## Output Files

- Rule reports: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_3_tuned\rule_reports`
- Visual teacher JSON: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_3_tuned\visual_reports\json\index.json`
- Overall CSV: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_3_tuned\comparison\OverallError.csv`
- Dimension CSV: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_3_tuned\comparison\DimensionError.csv`
- Metric CSV: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_3_tuned\comparison\MetricError.csv`
- Rank CSV: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_3_tuned\comparison\RankError.csv`
- Bucket CSV: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_3_tuned\comparison\BucketConfusion.csv`
- Bad cases: `C:\Users\afan\Desktop\loop iteration\Aesthetic_Rule_Check\reports\v3_iteration_3_tuned\comparison\BadCases.md`

Note: suggestions are candidates for human review. This script does not modify rule config automatically.
