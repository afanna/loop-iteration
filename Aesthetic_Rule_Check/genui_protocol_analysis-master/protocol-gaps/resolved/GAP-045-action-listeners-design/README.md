# GAP-045: 交互行为结构设计决策 — 不建议混合 action + listeners

## 问题描述

§3.4 交互扩展描述了 `listeners` + flat-action 机制，但未说明与 A2UI 原生 `action`（§2.3.1 server action / local action）的关系。这留下一个设计歧义：扩展组件能否同时支持 `action` 和 `listeners`，通过优先级规则选择执行？

## 影响范围

- 协议章节: §3.4
- 关联设计点: eval/design-points/action-structure (P1-9)
- 关联测试: FP-05

## 候选方案

- 方案A: 扩展组件仅使用 `listeners`，不保留 `action`（推荐）
- 方案B: 扩展组件同时支持 `action` + `listeners`，通过优先级规则选择

## 亲和性依据

来自 eval/design-points/action-structure 评估（双模型 A/B 对比，15 用例）：

| 格式 | DeepSeek | GLM | 说明 |
|------|----------|-----|------|
| flat-action (listeners) | A+ 99.5% | A+ 99.5% | 零失败，token 最优 |
| event-context (≈ action.event) | A+ 94.2% | A+ 99.5% | DeepSeek AS12 截断 |
| handler-format | A+ 99.5% | A+ 99.0% | token 多 17% |

方案B 的风险：

1. **两种格式并存 → 决策分支增加**：模型需在同一组件中判断何时用 `action.event`、何时用 `action.functionCall`、何时用 `listeners`。独占评估时各格式均 A+，但混合场景未测试，决策分支增加将导致一致性下降。

2. **隐式优先级规则 LLM 难以内化**："listeners 优先于 action" 是运行时语义而非结构约束。经验参考 #6 Extended.If（C 级 65%）：Visibility/Switch 隐式语义方案模型无法理解。

3. **功能重叠 → D6 崩溃**：`action.event` 和 `listeners` + sendToLLM 都能"向服务端发消息"，模型随机选择等价表达。expression-function coexist 方案 D6 语义等价率跌至 13% 是前车之鉴。

4. **flat-action 已统一 server/local action**：A2UI 的 server action (`action.event`) 和 local action (`action.functionCall`) 二分法已被 flat-action 的 `{call, args, as, condition}` 统一格式覆盖，无需保留 `action` 旁路。

## 推荐方案

方案A：在 §3.4 增加设计决策说明，明确 flat-action 统一了 server/local action，扩展组件不应同时使用 `action` 字段。

同时清理 §3.4 示例中残留的 `id` 字段（Handler interface 已删除 `id`，但示例未同步）。

## 验证计划

轻量修复（仅增加设计说明文本 + 清理示例中的 `id`），验证方式：修改后运行全量回归，确认无退化。

## 评估报告

全量回归: `npm run eval` 2026-05-02，双模型 88.9% (32/36)，无退化。
- eval/reports/
- 引用评估: eval/design-points/action-structure/reports/

## 最终结论

**合入完成。** §3.4 增加设计决策说明，明确 flat-action 统一 server/local action，扩展组件不应混合 `action` 字段。同时清理 §3.4、§4.3.2、JSON Schema 中 10 处残留 `id` 字段，与 Handler interface 保持一致。

修改内容：
- §3.4: 清理 2 处示例 `id` + 新增"设计决策"段落（4 点理由）
- §3.5: 规则 6 "交互行为中的id和type不可使用" → "交互行为中的call和as不可使用"
- §4.3.2: 清理 5 个行为示例 `id` (setDataModel/sendToLLM/setAttributes/navigate/scrollTo)
- JSON Schema: 清理 3 个示例 `id`

全量回归：GLM 88.9%, DS 88.9%，无退化。commit `64532ac`。
