# GAP-043 协议修改记录

## 修改 1: Handler 接口 — 删除 id，新增 as

**位置**: §4.3 交互

**修改前**:
```
interface Handler {
  id: string;
  call: string;
  args: any;
  condition?: string;
}
```

**修改后**:
```
interface Handler {
  call: string;
  as?: string;
  args?: any;
  condition?: string;
}
```

**理由**: `id` 的唯一用途是 `$handlerResult["id"]` 索引引用。as 绑定替代后，id 无存在必要。

---

## 修改 2: 4.4.4 局部变量表 — handlerResult → as 绑定

**位置**: §4.4.4 局部变量表

**修改前**: `| handlerResult[key] | 行为结果变量 | any | ...通过行为ID访问... |`

**修改后**: `| as 绑定 | 行为结果变量 | any | ...通过 as 字段绑定，$varName 引用... |`

**理由**: 变量体系统一化，as 绑定与 $item、$index、$context 语法一致。

---

## 修改 3: 行为示例 — 全部改为 as 绑定

**位置**: §3.5 表达式示例、§4.3 交互示例、§4.4.4 行为结果示例

**修改前** (典型):
```json
[
  {"id": "validate", "call": "validateForm"},
  {"id": "submit", "call": "submitData", "condition": "{{ $handlerResult[\"validate\"] == 0 }}"}
]
```

**修改后**:
```json
[
  {"call": "validateForm", "as": "validResult"},
  {"call": "submitData", "condition": "{{ $validResult == 0 }}"}
]
```

**理由**: 删除所有 $handlerResult 索引引用，统一为 $varName 直接引用。

---

## 修改 4: JSON Schema — 删除 handlerResult，新增 as-binding

**位置**: JSON Schema 目录 > LocalVariable

**修改前**: `handlerResult` 属性包含 code/success/result/error 子字段描述

**修改后**: 替换为 `as-binding` 属性，描述 as 命名绑定机制

---

## 修改 5: 协议修改记录

新增 GAP-043 条目，commit `ac61334`。
