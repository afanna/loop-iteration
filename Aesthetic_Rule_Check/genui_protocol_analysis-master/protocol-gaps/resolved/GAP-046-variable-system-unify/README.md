# GAP-046: 变量系统统一描述

## 问题描述

协议中变量相关描述散布在 6 处以上，缺乏系统性：

| 位置 | 内容 | 问题 |
|------|------|------|
| §3.5 表达式系统 | 顺便提到变量引用 | 非正式定义 |
| §3.6.2 响应式断点 | 只列了2个全局变量 | 缺少 `$__ColorMode`、`$__DataModel` |
| §4.4.4 内置变量 | 最完整的变量定义 | 埋在表达式子节里 |
| §4.4.7 响应式表达式 | 变量变化重新求值 | 一笔带过 |
| §4.4.8 EBNF | 变量语法 | 3处命名与正文不一致 |
| JSON Schema | 变量 Schema | 附录散落 |

此外，以下已验证的设计结论尚未反映到 spec 中：
- **#24** variable-system — 三层变量模型分类完整验证
- **#25** template-interpolation — `$var` + `${expr}` 模板求值规则
- **#18** json-pointer-ref — `${/json-pointer}` 可与 `$__DataModel` 共存

## 影响范围

- 协议章节: §3.5, §3.6.2, §4.4.4, §4.4.7, §4.4.8 EBNF, JSON Schema
- 关联 GAP: 024 (EBNF dataModel vs __DataModel), 025 (ActionResult vs handlerResult), 026 (WindowBreakpoint 命名)
- Prompt: `protocol-summary.md` 需同步更新

## 修复方案

### 新增独立章节：变量系统

建议在 §4 中新增独立章节（如 §4.X），统一描述：

1. **变量分类与命名规范**
   - 全局系统变量：`$__` 双下划线前缀（`$__DataModel`, `$__WidthBreakpoint`, `$__WindowSize`, `$__ColorMode`）
   - DataModel 变量：`$__DataModel.xxx.yyy`（绝对路径）/ `$item.fieldName`（模板相对路径）
   - 循环变量：`$index`, `$item`, 自定义 `itemVar`/`indexVar`
   - 行为链变量：`as` 绑定局部变量
   - 事件上下文变量：`$context.eventData`, `$context.componentId`

2. **变量引用语法**
   - `$var` 是唯一引用形式（#25 结论）
   - 模板中可直接嵌入 `$var`，也可通过 `${expr}` 求值（#25 结论）

3. **作用域与冲突解决**
   - 局部变量优先于全局变量
   - `$__` 前缀全局变量、`$` 前缀局部变量的区分
   - as 绑定名与 DataModel 变量同名时的处理

4. **JSON Pointer 变量引用**（#18 结论）
   - `formatString` 等函数支持 `${/json/pointer}` 语法

### 同步修正 GAP-024/025/026

- EBNF `$dataModel` → `$__DataModel`
- EBNF `$ActionResult` → `$handlerResult`
- 统一 `$__WidthBreakpoint` 命名

### 清理重复内容

- §3.6.2 全局变量列表改为引用新章节
- §4.4.4 精简或替换为引用

### Prompt 同步

- `protocol-summary.md` 补充完整的变量体系描述

## 验证计划

**类型**: 轻度回归验证

理由：变量体系的设计语义未变（#24 已验证），本次是文档重组 + 命名修正 + 结论合入。一致性由现有评估保障。

1. 修改 spec + prompt-summary
2. 运行 `npm run eval`（全量回归）确认无退化
3. 确认各分类通过率 ≥ 修改前

## 评估报告

设计结论来自已有评估： #24 (A+)、#25 (DS 95.7%/GLM 93.2%)、#18 (A+)

全量回归（2026-05-04）: GLM 94.4% / DS 97.2%，无退化。

## 最终结论

**GAP-046 合入完成。** 新增 §4.5 独立变量系统章节，纳入 #18/#24/#25 结论，修正 GAP-024/025/026 EBNF 命名不一致。

Commit: `74703a0` (合入) + `12edae1` (hash) + `02721c8` (测试)
