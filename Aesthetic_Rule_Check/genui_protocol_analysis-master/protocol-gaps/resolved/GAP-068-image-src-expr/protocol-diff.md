# GAP-068 协议修改

## 修改 1: extended_catalog.json — Image.src 联合类型

- 位置: `specification/json/extended_catalog.json` 第 3969-3972 行
- 修改前:
```json
"src": {
  "description": "Image source URL or local resource path. SVG format is not supported, including base64-encoded SVG (e.g., data:image/svg+xml;base64,...).",
  "type": "string"
}
```
- 修改后:
```json
"src": {
  "description": "Image source URL or local resource path. Supports expression binding for dynamic image source. SVG format is not supported, including base64-encoded SVG (e.g., data:image/svg+xml;base64,...).",
  "oneOf": [
    { "type": "string" },
    { "$ref": "#/$defs/Expression" },
    { "$ref": "#/$defs/PathBinding" }
  ]
}
```
- 理由: §3.6.1 规则 8 要求 schema 为表达式支持的权威；prose 已声明「支持表达式: 是」，schema 须以 `Expression` 联合类型显式表达。参照 `Text.content`（同文件 1988-2001 行）范式。

## 修改 2: form_catalog.json — Image.src 联合类型

- 位置: `specification/json/form_catalog.json` 第 2321-2324 行
- 修改前:
```json
"src": {
  "description": "Image source: local resource path only. Network URLs are not supported. SVG format is not supported, including base64-encoded SVG (e.g., data:image/svg+xml;base64,...).",
  "type": "string"
}
```
- 修改后:
```json
"src": {
  "description": "Image source: local resource path only. Network URLs are not supported. Supports expression/path binding for dynamic local resource path. SVG format is not supported, including base64-encoded SVG (e.g., data:image/svg+xml;base64,...).",
  "oneOf": [
    { "type": "string" },
    { "$ref": "#/$defs/Expression" },
    { "$ref": "#/$defs/PathBinding" }
  ]
}
```
- 理由: 与 extended_catalog 保持一致；保留「local resource path only」语义，绑定/表达式解析结果仍应为本地资源路径。

## 修改 3: harmonyos-a2ui-protocol.md — 修改记录表

- 位置: 头部 `## 修改记录`（倒序最前）
- 新增条目:
```
| 2026-06-16 | GAP-068：Image 组件 `src` schema 显式声明 Expression/PathBinding 联合类型，与 prose「支持表达式:是」对齐（参照 Text.content 范式）。 | §4.2.1.4, JSON Schema |
```
- 注: prose §4.2.1.4 属性表本身已声明 `支持表达式: 是`，无需改动；本次仅为 schema 对齐。

## 未改动（刻意）

- `eval/prompts/protocol-summary.md` 第 35 行 `| Image | src |`：摘要表为精简版、无表达式列；prose 为权威，摘要保持精简，不增提示。
- spec §2.2.2 自定义组件示例（470-518 行，用 `url`/`DynamicString` 且引用不存在的 `common_types.json`）：属独立遗留问题，不在本 GAP 范围。
