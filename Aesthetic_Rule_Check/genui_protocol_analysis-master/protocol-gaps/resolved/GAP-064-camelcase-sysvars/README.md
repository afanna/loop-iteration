# GAP-064: 系统变量 `$__PascalCase` → `$__camelCase` 重命名

## 问题描述

当前三个系统级变量使用 `$__` + PascalCase 命名：
- `$__DataModel` — surface 级数据模型
- `$__WidthBreakpoint` — surface 级断点
- `$__ColorMode` — app 全局颜色模式

问题：
1. PascalCase 在 JS/TS 生态中通常表示类型名/类名，而非值实例，与实际语义（运行时值）不一致
2. 与表达式体系中其他变量（`$item`, `$index`, `$context`）的 camelCase 风格不一致
3. LLM 归纳 "$前缀变量" 模式时存在风格断裂

## 影响范围

- 协议章节: §4.2.2.2（变量系统）, §4.2.2.2.2（全局系统变量）, §4.2.2.2.3（DataModel 变量）, §4.5.6（优先级）, EBNF
- JSON Schema: `extended_catalog.json`
- 测试分类: FP-04（表达式）, FP-05（事件）, FP-07（响应式）, FP-08（集成）
- 活跃文件约 762 处引用

## 候选修复方案

唯一方案：三个变量统一改为 `$__camelCase`：
- `$__DataModel` → `$__dataModel`
- `$__WidthBreakpoint` → `$__widthBreakpoint`
- `$__ColorMode` → `$__colorMode`

`$__` 前缀不变（优先级保护机制依赖它）。

## 验证计划

轻量修复（纯重命名，语义零变化），全量回归验证：
- `npm run eval`（36 个测试用例）
- 确认通过率 ≥ 修改前（100%）

## 评估报告

- 全量回归: GLM-5.1 36/36 (100%), DeepSeek 36/36 (100%)
- 零退化，与修改前一致

## 最终结论

轻量修复验证通过。三个系统变量统一从 `$__PascalCase` 改为 `$__camelCase`，与表达式体系其他变量风格一致。全量回归零退化。
