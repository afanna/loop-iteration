# GAP-059: Checkbox 新增 value 属性 + getCheckboxGroupValues 改为从 value 获取

## 问题描述

Extended Checkbox 组件当前只有 `label`（显示文本）和 `select`（选中状态），缺少语义化标识属性 `value`。
`getCheckboxGroupValues` 函数目前从 `label` 获取返回值，这与 Radio 组件设计不一致——Radio 有独立的 `value` 属性（不绘制显示），`getRadioValue` 从 `value` 获取。

**语义问题**：`label` 是展示文本（可包含空格、特殊字符等），不适合作为编程标识。`value` 才是正确的语义化标识。

## 影响范围

- 协议章节: §3.4.1, §4.2.2.1.5
- JSON Schema: Checkbox 定义
- Prompt: protocol-summary.md, protocol-harmonyos-extended.md
- 测试分类: FP-01 (FP0111)

## 修复方案

1. Checkbox 新增 `value` 属性（string，不绘制显示，语义化标识）
2. `label` 描述删除 getCheckboxGroupValues 引用，仅保留展示文本说明
3. `getCheckboxGroupValues` 描述改为从 `value` 获取
4. 同步更新 JSON Schema、Prompt 摘要、测试用例

## 验证方式

轻量修复 — 全量回归验证。运行 `npm run eval`，确认通过率 ≥ 修改前，各分类无退化。

## 评估报告

- `eval/reports/` — 全量回归 (`npm run eval`): 97.2% (35/36), 与修改前持平
- `eval/reports/full-protocol-2026-06-05T00-59-04.md` — 完整协议评估: deepseek-chat 97.2% (A+), FP0111 通过

## 最终结论

**已合入。** Checkbox 新增 `value` 属性，`getCheckboxGroupValues` 改为从 `value` 获取，与 Radio 组件设计一致。全量回归 97.2% 无退化，FP0111 测试通过。commit `c7e6a3a`。
