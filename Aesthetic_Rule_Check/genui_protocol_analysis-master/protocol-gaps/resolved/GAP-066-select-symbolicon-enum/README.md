# GAP-066: Select 组件 symbolIcon.src 限定支持的图标名称枚举

## 问题描述

Select 扩展组件的 `options[].symbolIcon.src` 属性当前仅定义为 `string` 类型（描述为"图标"），无枚举约束。LLM 可能生成任意字符串作为图标名称，导致渲染失败。

原生 Icon 组件的 `name` 属性已定义了 56 个支持的图标名称枚举。`symbolIcon.src` 应复用同一套枚举，保证一致性和模型亲和性。

## 影响范围

- 协议章节: §4.2.1.5（Select 组件属性表）
- JSON Schema: `extended_catalog.json` Select.options[].symbolIcon.src
- 测试分类: FP-01（基础组件）

## 候选修复方案

**方案 A（推荐）：复用 Icon 组件 56 个图标名枚举**

将 `symbolIcon.src` 从自由 string 改为枚举约束，复用原生 Icon 组件 `name` 字段的 56 个图标名称。JSON Schema 中添加 `enum` 硬约束。

优点：
- LLM 只需学习一套图标名称，降低认知负担
- 与原生 Icon 组件保持一致
- Schema 校验器自动拒绝非法值

## 验证计划

轻量修复 — 全量回归验证：
1. 修改 specification + JSON Schema + prompts
2. 运行 `npm run eval`
3. 确认各分类通过率无退化

## 评估报告

- eval/reports/report-2026-06-13T08-54-27.md
- glm-5.1: 97.2% (35/36), deepseek-chat: 97.2% (35/36)
- glm-5.1 唯一失败为 CR005（EventHandler as 绑定），deepseek-chat 唯一失败为 CR002（事件参数引用），均与 Select/symbolIcon 无关

## 最终结论

轻量修复完成。Select 组件 `symbolIcon.src` 已限定为原生 Icon 组件的 56 个图标名枚举，JSON Schema 增加 enum 硬约束。全量回归无退化。
