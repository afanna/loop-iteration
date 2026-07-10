# GAP-067: 局部变量命名规范 — 语法约束 + EBNF 收紧 + 同名回退

## 问题描述

三类局部变量的自定义命名（`itemVar`、`indexVar`、`as`）当前均为自由 string，无语法约束：

1. **无 pattern 约束** — `"itemVar": "12345"`、`"as": ""` 等非法命名可通过 Schema 校验
2. **EBNF identifier 允许 `$` 首字符** — 导致 `$$item` 语法合法但语义模糊
3. **indexVar == itemVar 同名** — `$myIndex` 同时指向 index(number) 和 item(object)，二义性未定义

## 影响范围

- 协议章节: §4.2.2.2（变量系统）、§3.7（子组件模板生成）
- JSON Schema: extended_catalog.json itemVar/indexVar/as
- EBNF: expression_grammar.ebnf identifier 规则
- 测试分类: FP-04（表达式）、FP-06（条件渲染/模板）

## 候选修复方案

**方案 A（推荐）：三层约束**

1. **语法 pattern** — `itemVar`、`indexVar`、`as` 添加 `pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$"`
2. **EBNF 收紧** — `identifier` 移除 `dollar` 首字符
3. **同名回退规则** — `indexVar == itemVar` 时两个自定义名均失效，回退默认 `$item` / `$index`
4. **保留名** — 不做禁用，运行时保证不遮蔽
5. **`$` 前缀规则** — 存储值不含 `$`，引用时自动拼接

## 验证计划

轻量修复 — 全量回归验证：
1. 修改 specification + JSON Schema + EBNF + prompts
2. 运行 `npm run eval`
3. 确认各分类通过率无退化

## 评估报告

- eval/reports/report-2026-06-13T09-55-27.md
- deepseek-chat: 100% (36/36)。glm-5.1 因 API 限额跳过。

## 最终结论

轻量修复完成。itemVar/indexVar/as 增加 pattern 语法约束；EBNF identifier 移除 `$` 首字符；indexVar==itemVar 同名回退规则已写入。全量回归无退化。
