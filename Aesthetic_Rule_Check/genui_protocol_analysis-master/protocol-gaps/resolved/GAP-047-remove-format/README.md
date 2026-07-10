# GAP-047: 删除 §4.4.5 format() 内置函数

## 问题描述

§4.4.5 的 `format(template, ...args)` 函数与模板字符串功能完全重复：

| `format()` | 等价模板字符串 |
|------|------|
| `{{ format('Hello, {}!', $name) }}` | `` {{ `Hello, $name!` }} `` |
| `{{ format('User {} has {} msgs', $user, $n) }}` | `` {{ `User $user has $n msgs` }} `` |

模板字符串更直观（变量直接出现在文本中，无需数 `{}` 位置），且模型亲和性已验证（#25, DS 95.7%/GLM 93.2%）。

## 影响范围

- 协议章节: §4.4.5（内置扩展函数）, §4.4.8 EBNF（function_call）, JSON Schema §Function
- 不涉及: `formatString`, `formatNumber`, `formatCurrency`, `formatDate` 等（独立功能）

## 修复方案

1. **§4.4.5**: 删除 `format(template, ...args)` 函数定义和示例；说明字符串插值由模板字符串完成
2. **§4.4.8 EBNF**: `function_call` 删除 `format`，仅保留 `size`
3. **EBNF Example 4**: format 调用替换为模板字符串示例
4. **JSON Schema §Function**: 删除 `format` 条目

## 验证计划

**类型**: 轻量回归

模板字符串功能已验证（#25，A+），本次仅删除冗余函数。

1. 修改 spec
2. 运行 `npm run eval` 确认无退化

## 评估报告

（验证完成后填写）

## 最终结论

（归档时填写）
