# GAP-042 亲和性验证报告

## 验证方式

实质性修复 — affinity-design A/B 对比验证。

## A/B 对比结果 (61 例, 3-shot, 双模型)

| 指标 | $fieldName (A) | $item.fieldName (B) | 提升 |
|------|---------------|---------------------|------|
| DeepSeek MA | 92.5% | **98.0%** | +5.5% |
| GLM MA | 90.4% | **97.0%** | +6.6% |
| DS Phase A | 54/61 (88.5%) | **61/61 (100%)** | +11.5% |
| GLM Phase A | 51/61 (83.6%) | **61/61 (100%)** | +16.4% |
| DS T3 | 17/21 (81.0%) | **21/21 (100%)** | +19.0% |
| GLM T3 | 15/21 (71.4%) | **21/21 (100%)** | +28.6% |

## 失败根因

$fieldName 的 17 例失败 100% 同一模式：LLM 生成 `$item.name`（通用模式），验证要求 `$name`（协议特有语法）。$item.name 是 JS/Vue/Handlebars/Jinja2/Django 的统一模式，$name 隐式展开是与训练数据冲突的设计反模式。

## 报告文件

- `eval/design-points/variable-system/reports/variable-system-deepseek-2026-05-01T06-52-16.json` (B)
- `eval/design-points/variable-system/reports/variable-system-glm-2026-05-01T08-39-59.json` (B)
- `eval/design-points/variable-system/reports/variable-system-deepseek-2026-05-01T07-01-06.json` (A)
- `eval/design-points/variable-system/reports/variable-system-glm-2026-05-01T07-06-21.json` (A)
