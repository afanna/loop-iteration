# GAP-043: 行为结果变量 — as 命名绑定替换 $handlerResult["id"]

**优先级**: P0（建议采纳）
**日期**: 2026-05-01
**来源**: eval/design-points/variable-system — 4.4.4 变量体系统一评估（整合 #1, #19）

---

## 1. 当前协议设计

4.3.2 节 Handler 接口：

```
interface Handler {
  id: string;
  call: string;
  args: any;
  condition?: string;
}
```

行为结果通过 `$handlerResult["handlerId"]` 索引引用：

```json
[
  {"id": "validate", "call": "validateForm"},
  {"id": "submit",   "call": "submitData", "condition": "{{ $handlerResult[\"validate\"] == 0 }}"}
]
```

---

## 2. 问题

`$handlerResult["id"]` 是两层语法嵌套（`$变量名` + `["字符串键"]`），与其他所有局部变量的语法不一致：

| 变量类型 | 引用语法 | 层级 |
|----------|---------|------|
| 列表模板字段 | `$item.name` | 两层：变量 + 属性 |
| 循环索引 | `$index` | 一层：变量 |
| 事件参数 | `$context.eventData` | 两层：变量 + 属性 |
| as 绑定 | `$varName` | 一层：变量 |
| **handlerResult** | **`$handlerResult["id"]`** | **三层：变量 + ["键"] + 属性** |

语法不一致增加 LLM 认知负担——模型需要在独特的 `["字符串"]` 索引语法和统一的 `.属性` 访问语法之间切换。

---

## 3. 修改方案

### Handler 接口

```
// 修改前
interface Handler {
  id: string;
  call: string;
  args: any;
  condition?: string;
}

// 修改后
interface Handler {
  id?: string;              // 可选：仅在需要 handlerResult 引用时使用
  call: string;
  as?: string;              // 新增：将返回值绑定为局部变量名
  args?: any;               // 改为可选
  condition?: string;
}
```

### 引用语法

```json
// 修改前
[
  {"id": "validate", "call": "validateForm"},
  {"id": "submit",   "call": "submitData", "condition": "{{ $handlerResult[\"validate\"] == 0 }}"}
]

// 修改后
[
  {"call": "validate", "as": "validResult"},
  {"call": "submitData", "condition": "{{ $validResult == 0 }}"}
]
```

### 局部变量表更新（4.4.4 节）

| 变量 | 种类 | 类型 | 说明 |
|------|------|------|------|
| as 绑定 | 行为结果变量 | any | **新增**。行为通过 `as` 字段将返回值绑定为局部变量，后续行为通过 `$varName` 引用 |
| $context | 事件参数 | EventContext | 不变 |

### 多步链式调用

```json
// 修改前
[
  {"id": "step1", "call": "validate"},
  {"id": "step2", "call": "process", "condition": "{{ $handlerResult[\"step1\"] == 0 }}"},
  {"id": "step3", "call": "finish",  "condition": "{{ $handlerResult[\"step2\"] == 0 }}"}
]

// 修改后
[
  {"call": "validate", "as": "vResult"},
  {"call": "process",  "condition": "{{ $vResult == 0 }}", "as": "pResult"},
  {"call": "finish",   "condition": "{{ $pResult == 0 }}"}
]
```

---

## 4. 验证数据

所有涉及行为链的 26 个用例（T4 行为链 10 例 + T5 同名冲突 10 例 + T6 混合 6 例）**双模型 100% 通过**。

| 验证场景 | DS | GLM |
|----------|----|-----|
| 简单 as 绑定 + 条件引用 | OK | OK |
| as 对象属性嵌套访问 (`$var.prop.nested`) | OK | OK |
| as 在 args 中传递 | OK | OK |
| 多步链式调用（3+ 步串联） | OK | OK |
| 条件分支（成功/失败双路径） | OK | OK |
| 多事件独立 as 作用域 | OK | OK |
| as 与 DataModel 同名冲突 | OK | OK |
| as + $context + DataModel 三者混合 | OK | OK |

---

## 5. 影响范围

| 影响 | 说明 |
|------|------|
| Handler 接口 (4.3.2) | 新增 `as` 字段，`id` 改为可选，`args` 改为可选 |
| 局部变量表 (4.4.4) | 新增 as 绑定变量条目 |
| 行为示例 (4.3.2) | 所有 $handlerResult 示例改为 as 绑定 |
| EBNF 文法 (4.4.8) | 新增 as 绑定语法规则 |
| 交互行为参数说明 | 新增 as 参数说明 |
| **不影响** | break 行为仍可通过 id + $handlerResult 引用；向后兼容已有的 handlerResult 用法 |

---

## 6. 评估报告

- `variable-system-deepseek-2026-05-01T06-52-16.json`
- `variable-system-glm-2026-05-01T08-39-59.json`
