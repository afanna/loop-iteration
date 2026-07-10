# GAP-044: §3.5 "path属性" 歧义 — A2UI原生绑定path vs setDataModel args.path

**优先级**: P1
**日期**: 2026-05-02
**类型**: 轻量修复

---

## 问题描述

协议 §3.5 表达式约束第 3 条：

> A2UI原本的数据路径中的path属性不支持使用表达式

但同一章节的示例中却使用了：

```json
{
  "call": "setDataModel",
  "args": {
    "path": "{{'/items/' + $index }}",
    "value": null
  }
}
```

"数据路径中的path属性"这个表述把两个不同的概念混为一谈：

| 概念 | 位置 | 表达式 |
|------|------|--------|
| A2UI 原生数据绑定 path | `{"content": {"path": "/user/name"}}` | **不支持** |
| setDataModel 行为的 args.path | `"args": {"path": "{{'/items/' + $index }}"}` | **必须支持** |

## 影响范围

- 协议章节: §3.5
- 测试分类: FP-04, FP-05

## 修改方案

将规则 3 拆分为两条，明确区分两个概念：

```
3. A2UI原生的数据绑定path（如 {"content": {"path": "/user/name"}}）不支持使用表达式。
4. 行为参数中的path（如setDataModel的args.path）属于交互行为参数，可以使用表达式。此path与A2UI原生的数据绑定path是不同的属性。
```

原规则 3~7 顺延为 3~8。
