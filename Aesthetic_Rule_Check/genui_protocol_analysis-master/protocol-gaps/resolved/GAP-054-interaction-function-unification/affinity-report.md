# GAP-054 亲和性评估报告索引

## A/B 对比评估

- 报告: `eval/design-points/interaction-function-wrapper/reports/interaction-function-wrapper-ab-2026-05-14T12-11-58.md`
- 结论: 策略B（统一扩展函数 + EventHandler 包装器）验证通过。
- GLM-5.1: 策略A MA 98.7%（A+），策略B MA 100.0%（A+）。
- DeepSeek-Chat: 策略A MA 100.0%（A+），策略B MA 100.0%（A+）。

无效试跑记录：`eval/design-points/interaction-function-wrapper/reports/interaction-function-wrapper-ab-2026-05-14T12-05-03.md`，因用例格式缺少 `expected.required_fields` 导致验证器失败，不作为结论依据。

## 完整协议回归

- Markdown 报告: `eval/reports/full-protocol-2026-05-14T12-35-58.md`
- JSON 报告: `eval/reports/full-protocol-2026-05-14T12-35-58.json`
- GLM-5.1: MA 91.6%（A+）。
- DeepSeek-Chat: MA 96.8%（A+）。

## 事件类通过率说明

事件类通过率相对偏低：GLM-5.1 为 12/16（75.0%），DeepSeek-Chat 为 14/16（87.5%）。该现象需要和 GAP-054 的核心目标分开看。

GAP-054 新增用例 FP0516 中，两个模型都正确生成了 `action.event.context` 下的 `{call,args}` 函数调用对象，包括 `getRadioValue`、`getCheckboxGroupValues`、`getToggleValue`、`getSelectValue`。FP0516 失败的直接原因是任务期望原生 `Button`，模型输出为 `Extended.Button`，触发 component 字段不匹配；不是扩展函数统一建模失败。

GLM-5.1 额外失败的 FP0508、FP0513 属于旧事件链形态漂移：模型将 `listeners.onClick` 简写为顶层 `onClick`，导致验证器判定缺少 `listeners`。这暴露出事件交互区仍需继续强化两条规则：原生 `Button.action` 场景不要改写为 `Extended.Button`；`Extended.*` 事件链必须使用 `listeners.<event>`，禁止顶层事件字段简写。

因此，本轮评估支持 GAP-054 合入：扩展函数统一建模有效，事件类低分主要来自组件边界和旧事件链容器形态的后续亲和性风险，应作为事件交互专项优化继续跟踪。
