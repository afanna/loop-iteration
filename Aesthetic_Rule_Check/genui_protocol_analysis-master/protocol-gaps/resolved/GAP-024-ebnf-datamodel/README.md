# GAP-024: EBNF `$dataModel` 与全文示例 `$__DataModel` 不一致

## 问题描述

协议 4.4.8 节定义的 EBNF 语法中，绝对路径变量名为 `$dataModel`（小写 d，无下划线）：

```
absolute_path = "$" , "dataModel" , "." , identifier ...
```

但协议全文所有示例均使用 `$__DataModel`（双下划线 + 大写 D）：

```json
{ "text": "{{ $__DataModel.user.name }}" }
```

两套命名并存，LLM 在两种写法之间摇摆。评估中已观察到 GLM 使用了第三种变体 `$DataModel`（单下划线 + 大写 D）。

## 影响范围

- 协议章节: 4.4.4（内置变量）、4.4.8（EBNF 语法）
- 测试分类: FP-04 (expression)
- 额外影响: 4.4.8 EBNF 示例注释中的 parse tree 也使用了 `$dataModel`

## 候选修复方案

- **方案 A（推荐）**: 统一 EBNF 为 `$__DataModel`，与全文示例一致。改动面最小（仅 EBNF 定义和注释），不需要修改任何示例。
- **方案 B**: 统一全文示例为 `$dataModel`。改动面大，需修改 50+ 处示例。

## 验证计划

**类型**: 轻量修复 — 全量回归验证

1. 修改 `specification/harmonyos-a2ui-protocol.md` 4.4.8 节 EBNF 定义和示例注释
2. 检查 `eval/prompts/protocol-v2-summary.md` 是否存在同样不一致 → 如有则同步修改
3. 运行 `npm run eval`
4. 确认 FP-04 (expression) 分类通过率 ≥ 修改前（100%）
5. 确认总通过率 ≥ 修改前

## 评估报告

待验证

## 最终结论

待验证
