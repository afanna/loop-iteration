# GAP-046 协议修改

## 修改 1: 新增 §4.5 变量系统

**位置:** specification/harmonyos-a2ui-protocol.md，§4.4.8 EBNF 之后、原 §4.5 JSON Schema 之前

**修改内容:** 新增完整的独立变量系统章节：
- §4.5.1 命名规范 — `$__` 全局 / `$` 局部
- §4.5.2 全局系统变量 — 4 个全局变量统一描述
- §4.5.3 DataModel 变量 — 绝对路径/相对路径/JSON Pointer
- §4.5.4 局部变量 — 循环变量/as绑定/事件上下文
- §4.5.5 变量引用语法 — 表达式+模板字符串统一规则（#25结论）
- §4.5.6 作用域与冲突解决
- §4.5.7 响应式更新

**理由:** 变量定义原散布在 §3.5/§3.6.2/§4.4.4/EBNF/JSON Schema 6处以上，缺乏系统性。新章节统一收纳。

## 修改 2: §4.4.4 简化为引用

**修改前:** 200+ 行全局变量/DataModel/局部变量的完整描述
**修改后:** 1 行指向 §4.5 的引用
**理由:** 避免内容重复

## 修改 3: §3.6.2 全局变量表改为引用

**修改前:** 单独列出 2 个全局变量（`__WindowSize`, `__WidthBreakpoint`），缺少 `__ColorMode` 和 `__DataModel`
**修改后:** 指向 §4.5.2 的引用。断点系统定义表保留在本节。
**理由:** 避免内容重复和遗漏

## 修改 4: EBNF 命名修正（GAP-024/025/026）

- `absolute_path`: `"$dataModel"` → `"$__DataModel"` (GAP-024)
- `action_result_ref`: `"$ActionResult"` → `"$handlerResult"` (GAP-025)
- EBNF examples: `$dataModel` → `$__DataModel`, `$ActionResult` → `$handlerResult`, `$windowBreakpoint` → `$__WidthBreakpoint` (GAP-026)

**理由:** EBNF 与正文命名一致

## 修改 5: §4.5 JSON Schema → §4.6

章节重新编号，JSON Schema 从 §4.5 变为 §4.6。
