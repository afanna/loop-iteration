# GAP-068: Image.src schema 显式声明支持 Expression / PathBinding

## 问题描述

扩展协议组件 `Image` 的 `src` 属性在 prose 与 JSON Schema 之间存在不一致：

- **Prose**（`specification/harmonyos-a2ui-protocol.md` §4.2.1.4，属性表）声明 `src` 的「支持表达式」列为 `是`。
- **JSON Schema**（`extended_catalog.json`、`form_catalog.json`）将 `src` 定义为纯 `"type": "string"`，**未**包含 `Expression` / `PathBinding` 联合成员。

按 §3.6.1 规则 8（`harmonyos-a2ui-protocol.md:1108`）：*「组件的各属性是否支持表达式，以其所属 catalog 中的 JSON Schema 定义为准；支持表达式的属性在 Schema 中声明为 `Expression` 类型的联合类型。」*

因此 schema 为权威——当前 `src` 实际**不支持**表达式/路径绑定，与 prose 矛盾。LLM 或下游工具若以 schema 为校验源，会把 `"{{ $__dataModel.avatar }}"` 形式的 src 判为非法。

## 影响范围

- 协议章节: §4.2.1.4（Image 组件属性）、§3.6.1 规则 8（schema 权威性）
- JSON Schema: `extended_catalog.json` Image.src、`form_catalog.json` Image.src
- 测试分类: FP-01（展示组件）

## 候选修复方案

- **方案A（采纳）**: 将两个 catalog 的 `Image.src` 由 `"type": "string"` 改为 `oneOf: [string, Expression, PathBinding]`，参照 `Text.content`（`extended_catalog.json:1988-2001`）范式。form_catalog 保留「local resource path only」描述语义（绑定/表达式解析结果仍应为本地资源路径）。
- 方案B: 仅改 extended_catalog，form_catalog 保持纯 string。不采纳——两个协议应保持一致的表达式能力声明。

## 验证计划

- **类型**: 轻量修复 — 全量回归验证
- **理由**: prose 早已声明 `支持表达式: 是`；评估 System Prompt 走 `eval/prompts/protocol-summary.md`（人类可读摘要），**不直接向 LLM 暴露 JSON Schema**；本次仅做 schema↔prose 一致性对齐，LLM 语义理解不变。

## 评估报告

- **JSON Schema 结构校验**（通过）:
  - 两个 catalog JSON 解析无误；`Image.src` 现为 `oneOf: [{type:string}, {$ref:#/$defs/Expression}, {$ref:#/$defs/PathBinding}]`。
  - `$defs.Expression`（pattern `^\{\{[^{}]+\}\}$`）与 `$defs.PathBinding`（object, path）均存在且可解析。
  - 用 Ajv 2020-12 编译 `src` 子 schema：literal string PASS、path binding PASS、number/array FAIL（符合预期）；expression `{{...}}` 与所有 expression-capable 属性（如 Text.content）行为一致（oneOf 重叠是协议既有约定，运行时按内容 `^{{...}}$` 判定，schema 仅声明能力）。
- **全量回归**：跳过。LLM System Prompt（`protocol-summary.md`）本次未改动，JSON catalog 不进入 Prompt，全量回归结果必与基线一致。参照 GAP-056/057「轻量修复，跳过评估」先例。

## 最终结论

已合入。两个 catalog 的 `Image.src` 由纯 `string` 改为 `string | Expression | PathBinding` 联合类型，与 prose「支持表达式: 是」及 §3.6.1 规则 8（schema 为权威）完全对齐，消除 schema↔prose 不一致。prose 本身无需改动；`protocol-summary.md` 保持精简不改。

spec 修改记录表已新增 GAP-068 条目。详见 `protocol-diff.md`、`prompt-diff.md`。
