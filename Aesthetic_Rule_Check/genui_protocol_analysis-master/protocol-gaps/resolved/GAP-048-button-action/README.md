# GAP-048: Button 组件 action 属性 — 补充表单提交能力

## 问题描述

鸿蒙 A2UI 协议中 Button 扩展组件只有 `listeners`（通用交互机制），缺少 A2UI 原生协议中 Button 的 `action` 属性（表单提交/函数调用）。

表单提交是 Button 的特定能力（不是通用交互），应该有专属的 `action` 属性来表达，其优先级高于通用的 `listeners` 机制。

### 现状

- A2UI 原生 Button 有 `action`：`{event: {name, context}}` 或 `{functionCall: {call, args}}`
- 鸿蒙扩展 Button 只有 `listeners`：`{onClick: [{call, args, as, condition}]}`
- 当前通过 `listeners` + `sendToLLM` 可模拟表单提交，但这混淆了"提交表单"和"通用交互"的语义边界

### 与 §3.4 设计决策的关系

§3.4 记录了"不建议在扩展组件中同时支持 action 和 listeners"的设计决策。本次需要验证：当 `action` 明确限定为"表单提交"场景、`listeners` 明确限定为"通用交互"场景时，LLM 能否正确区分两者，不产生混淆。

## 影响范围

- 协议章节: §3.4（交互扩展）、§3.2（扩展组件 Button 属性表）
- 测试分类: FP-05（事件）、FP-01（组件）

## 候选修复方案

在鸿蒙扩展 Button 组件上新增 `action` 属性，规格与 A2UI 原生协议保持一致：

```
action: object（可选）
  格式1: { event: { name: string, context?: object } }
  格式2: { functionCall: { call: string, args?: object } }
```

约束：
1. `action` 仅限 Button 组件使用
2. `action` 用于表单提交/函数调用，`listeners` 用于 UI 反馈/导航/数据操作
3. `action` 与 `listeners` 可共存，`action` 优先级更高：有 action 时只触发 action，没有 action 时触发 listeners

## 验证计划

affinity-design A/B 对比评估（button-action）：
- 方案A: button-action（互斥双通道）
- 方案B: listeners + sendToLLM（统一机制）
- 15 个测试用例，覆盖 action-only / listeners-only / 多组件 / 混淆测试
- 双模型（GLM-5.1 + DeepSeek）6 维评分
- 预期 MA ≥ 80%（A 级）

## 评估报告

### 第1轮：单策略评估（2026-05-06）

- eval/design-points/button-action/reports/button-action-eval-2026-05-06T11-07-11.md
- GLM-5.1 A+ (95.5%) / DeepSeek A+ (95.5%)

### 第2轮：A/B 对比（2026-05-06）

- eval/design-points/button-action/reports/button-action-ab-2026-05-06T12-37-56.md
- GLM A+ 90.4% (A) / A+ 90.4% (B) | DeepSeek A+ 95.4% (A) / A+ 95.4% (B)
- 5/6 失败因 LLM 内联嵌套多组件（邻接表规则缺失）

### 第3轮：A/B 对比 + 邻接表修复（2026-05-07）

- eval/design-points/button-action/reports/button-action-ab-2026-05-07T02-26-21.md
- **4 策略 × 15 用例 = 60 次测试全部通过**
- GLM A+ 95.6% (A) / A+ 95.6% (B) | DeepSeek A+ 98.8% (A) / A+ 98.8% (B)
- 两个方案亲和性完全一致

## 最终结论

Button 扩展组件新增 `action` 属性已合入。A/B 对比验证两个方案亲和性无差异（action vs sendToLLM），均达到 A+ 级别。从语义清晰度角度推荐 `action` 方案。

- commit: `5ccf0b2`
- 解决日期: 2026-05-06
- 涉及章节: §3.2 (Button 属性表), §3.4 (交互扩展 + 设计决策更新)
- A/B 报告: 2026-05-07（邻接表修复后）
