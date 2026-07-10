# GAP-051: $__DataModel "全局"称谓歧义 — 澄清 surface 级作用域

## 问题描述

`$__DataModel` 在 §4.5.1 命名规范表、§4.5.2 全局系统变量表中与 `$__WidthBreakpoint`、`$__WindowSize`、`$__ColorMode` 同列为"全局系统变量/全局可访问"。但协议消息模型已明确：

- `updateDataModel` 消息包含 `surfaceId`（§2.1.5），数据模型归属具体 surface
- "不同的surface之间的消息应该独立"（§2.1.2）

`$__DataModel` 实际上是 **surface 级变量**——一个 surface 中的组件只能访问其所属 surface 的 DataModel，无法跨 surface 访问。而 `$__WidthBreakpoint`、`$__WindowSize`、`$__ColorMode` 是真正的 **app 级全局变量**，所有 surface 共享同一值。

> 注：§4.5.7 已正确区分——"全局系统变量（$__WindowSize, $__WidthBreakpoint, $__ColorMode）和数据模型变量（$__DataModel.xxx）"，但前面章节未做此区分。

## 影响范围

- 协议章节: §4.5.1、§4.5.2、§4.5.6
- Prompt 文件: protocol-summary.md、protocol-harmonyos-extended.md

## 修复方案

纯说明性文字增加，不修改任何语法/语义/命名：

1. **§4.5.1** 命名规范表下方新增 NOTE：说明 `$__DataModel` 虽归入全局系统变量，但作用域限定于所在 surface
2. **§4.5.2** `$__DataModel` 描述追加 "(作用域限定于所在 surface，不同 surface 的 DataModel 相互隔离)"
3. **§4.5.6** 优先级表下方新增说明：`$__DataModel` 为 surface 级变量
4. **protocol-summary.md** `$__DataModel` 行后加 "(限定于所在 surface)"
5. **protocol-harmonyos-extended.md** `$__DataModel` 描述增加 surface scope 说明

## 验证计划

**类型**: 轻量修复（纯说明性文字，不改变协议行为，LLM 语义理解不变）

1. 修改 spec + prompt 文件
2. 运行 `npm run eval` 确认无退化

## 评估报告

（验证完成后填写）

## 最终结论

（归档时填写）
