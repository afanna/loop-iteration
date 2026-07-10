# GAP-003 协议修改

> ⚠️ 状态: 评估完成，推荐修改，待实际执行。

## 修改 1: 3.4 交互扩展 — listeners 结构

**位置**: `specification/harmonyos-a2ui-protocol.md` §3.4（第 486-535 行附近）

**当前（handlerGroups 方案）**:
```json
{
  "listeners": {
    "onClick": {
      "handlerGroups": [
        {
          "condition": "{{ $user.canEdit }}",
          "handlers": [
            {
              "id": "validate_form",
              "call": "validate",
              "args": { "data": "{{ $__DataModel.formData }}" }
            }
          ]
        }
      ]
    }
  }
}
```

**修改为（flat-array 方案）**:
```json
{
  "listeners": {
    "onClick": [
      {
        "id": "validate_form",
        "call": "validate",
        "condition": "{{ $user.canEdit }}",
        "args": { "data": "{{ $__DataModel.formData }}" }
      }
    ]
  }
}
```

**理由**: 消除 handlerGroups/handlers 两层嵌套，条件分支通过 flat action 级的 condition 字段实现。评估验证亲和性等价（均为 A+），结构更简洁。

## 修改 2: 4.3 交互 — 事件对象结构

**位置**: `specification/harmonyos-a2ui-protocol.md` §4.3（第 1112-1150 行附近）

**当前**:
```
Event对象结构：listeners 对象是一个键值对，其中：
- 键: 预定义的交互事件类型（如 onClick）
- 值: 事件处理器对象，包含 handlerGroups 数组
```

**修改为**:
```
Event对象结构：listeners 对象是一个键值对，其中：
- 键: 预定义的交互事件类型（如 onClick）
- 值: 行为数组，按顺序执行。每个行为可包含可选的 condition 字段。
```

## 修改 3: 4.3.2 交互行为 — Handler 定义

**位置**: `specification/harmonyos-a2ui-protocol.md` §4.3.2（第 1252-1316 行附近）

**修改前**:
```
interface HandlerGroup {
  handlers: Handler[];
  condition?: string;
}

interface Handler {
  id: string;
  call: string;
  args: any;
}
```

**修改后**:
```
interface Handler {
  id: string;
  call: string;
  args: any;
  condition?: string;   // 新增：执行条件
}
```

HandlerGroup 接口移除，行为数组直接作为事件值。

## 修改 4: 4.3 交互 — 删除 HandlerGroup 相关描述

**位置**: `specification/harmonyos-a2ui-protocol.md` §4.3（第 1252-1283 行附近）

删除 HandlerGroup 结构定义（condition 迁移到 Handler）、handlerGroups 数组包装、handlerGroup 分组概念。

## 修改 5: 4.3.2 交互行为 — 预定义行为类型

每个行为的 condition 参数说明需要新增。
