# GAP-054: 交互函数统一建模

## 问题描述

当前协议将 `getRadioValue`、`getCheckboxGroupValues`、`getToggleValue`、`getSelectValue` 描述为“扩展内置函数”，而 `break`、`sendToAssistant`、`setDataModel`、`setAttributes`、`scrollTo`、`navigate` 描述为“交互行为”。两者在 DSL 中都采用 `{ "call": "...", "args": {...} }` 形态，但章节和概念分散，容易让模型误判函数与行为的边界。

需要将这些可调用能力统一描述为“扩展函数/交互函数”，并通过“仅用于交互”约束区分它们的使用场景。

## 影响范围

- 协议章节: §3.4, §3.5, §3.6, §4.3
- Prompt 摘要: `eval/prompts/protocol-summary.md`
- 测试分类: FP-05 events

## 候选修复方案

- 方案A: 保持现状，继续将 getXxx 作为“扩展内置函数”，预定义行为作为“交互行为”。
- 方案B: 新增 §3.4 “扩展函数”，统一列出 getXxx 与预定义交互函数，增加“仅用于交互”列；原事件监听章节顺延为 §3.5，表达式章节保持 §3.6。
- 推荐: 方案B。统一 call 形态，降低模型对“函数/行为”二分的理解负担。

## 验证计划

实质性修复，采用 affinity-design A/B 对比：

- 策略A：分散描述，getXxx 属于扩展内置函数，预定义行为属于交互行为。
- 策略B：统一扩展函数章节，调用处按 `{call,args}` 形态引用函数，返回类型由函数定义声明。
- 指标：策略B 在 getXxx 表单取值、普通交互行为、混合 action context 三类任务中达到 A 级（MA ≥ 80）。

## 评估报告

- eval/design-points/interaction-function-wrapper/reports/interaction-function-wrapper-ab-2026-05-14T12-11-58.md
- eval/reports/full-protocol-2026-05-14T12-35-58.md

无效试跑（用例格式缺少 `expected.required_fields`，验证器失败，不作为结论依据）：

- eval/design-points/interaction-function-wrapper/reports/interaction-function-wrapper-ab-2026-05-14T12-05-03.md

## 最终结论

策略B（统一扩展函数 + EventHandler 包装器）A/B 验证通过：GLM-5.1 MA 100.0%（A+），DeepSeek-Chat MA 100.0%（A+）。策略A 也达到 A+，但策略B 在 GLM-5.1 上更优（100.0% vs 98.7%），且与当前协议概念边界一致，推荐合入。

完整协议全量回归通过：GLM-5.1 MA 91.6%（A+），DeepSeek-Chat MA 96.8%（A+）。

事件类通过率偏低需要单独解释：本轮事件类共 16 条，GLM-5.1 通过 12 条（75.0%），DeepSeek-Chat 通过 14 条（87.5%）。GAP-054 新增用例 FP0516 中，两个模型都正确生成了 `action.event.context` 下的 `{call,args}` 函数调用对象，包括 `getRadioValue`、`getCheckboxGroupValues`、`getToggleValue`、`getSelectValue`，失败原因不是函数统一建模错误，而是模型将任务中的原生 `Button` 输出为 `Extended.Button`，触发 component 字段不匹配。

GLM-5.1 额外失败的 FP0508、FP0513 属于旧事件链形态漂移：模型将 `listeners.onClick` 简写为顶层 `onClick`，导致验证器判定缺少 `listeners`。这暴露的是事件交互区仍存在两类后续亲和性风险：一是原生 `Button.action` 与 `Extended.Button.listeners` 的边界需要在 prompt/few-shot 中继续强化；二是 `Extended.*` 事件链必须禁止顶层 `onClick` 简写。该风险不影响 GAP-054 关于 `{call,args}` 扩展函数统一建模的合入结论，但应作为后续事件交互专项优化项归档跟踪。
