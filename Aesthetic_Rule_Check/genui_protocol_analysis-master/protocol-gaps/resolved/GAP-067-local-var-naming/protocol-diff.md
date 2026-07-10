# GAP-067 协议修改

## 修改 1: JSON Schema — itemVar/indexVar 增加 pattern

- 位置: specification/json/extended_catalog.json TemplateChildren.indexVar（第 165 行）、itemVar（第 170 行）
- 修改前:
  ```json
  "indexVar": { "type": "string", "description": "...", "default": "index" }
  "itemVar":  { "type": "string", "description": "...", "default": "item" }
  ```
- 修改后:
  ```json
  "indexVar": { "type": "string", "description": "...(added naming rule)...", "default": "index", "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$" }
  "itemVar":  { "type": "string", "description": "...(added naming rule)...", "default": "item", "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$" }
  ```
- 理由: 防止非法变量名（数字开头、空格、特殊字符）通过 Schema 校验

## 修改 2: JSON Schema — EventHandler.as 增加 pattern

- 位置: specification/json/extended_catalog.json EventHandler.as（第 70 行）
- 修改前:
  ```json
  "as": { "type": "string", "description": "Named variable binding for EventHandler return value" }
  ```
- 修改后:
  ```json
  "as": { "type": "string", "description": "...(added naming rule)...", "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$" }
  ```
- 理由: 同上

## 修改 3: EBNF — identifier 移除 dollar 首字符

- 位置: specification/json/expression_grammar.ebnf 第 57 行
- 修改前:
  ```
  identifier = ( letter | underscore | dollar ) , { identifier_char };
  ```
- 修改后:
  ```
  identifier = ( letter | underscore ) , { identifier_char };
  ```
- 理由: 消除 `$$item` 语法合法但语义模糊的问题。`$` 作为变量引用前缀由 variable_reference/loop_variable/global_variable 规则单独处理，不应出现在 identifier 首字符中

## 修改 4: 协议文档 — 新增 §4.2.2.2.7 局部变量命名规范

- 位置: specification/harmonyos-a2ui-protocol.md §4.2.2.2.6 之后，原 §4.2.2.2.7 响应式更新顺延为 §4.2.2.2.8
- 新增内容:
  ```markdown
  ###### 4.2.2.2.7 局部变量命名规范

  itemVar、indexVar、as 的自定义变量名须遵循以下规则：

  1. 语法规则：必须以字母或下划线开头，仅包含字母、数字、下划线（正则 ^[a-zA-Z_][a-zA-Z0-9_]*$）
  2. 不含 $ 前缀：值不含 $，引用时自动拼接
  3. 同名回退：indexVar == itemVar 时两个自定义名均失效，回退默认 $item / $index
  ```
- 理由: 补充局部变量命名的缺失约束

## 修改 5: 修改记录表

- 新增 GAP-067 条目
