# GAP-046 Prompt 修改

## 修改: protocol-summary.md 变量系统描述

**修改前:**
```
### 变量引用
- 统一使用`$var`前缀引用变量
- 支持多级属性访问：`$user.address.city`
- 全局变量：`$__WindowSize`(宽高), `$__WidthBreakpoint`(断点: xs/sm/md/lg/xl)
```

**修改后:**
```
### 变量系统

`$var` 是变量的唯一引用形式。变量按来源分为三类：

**全局系统变量**（`$__` 双下划线前缀，全局可访问）：
- `$__WidthBreakpoint` — 断点枚举 (xs/sm/md/lg/xl)
- `$__WindowSize` — 窗口尺寸 {width, height}
- `$__ColorMode` — 深浅色模式 (light/dark)
- `$__DataModel` — 数据模型根对象，通过点路径访问属性

**DataModel 变量**：
- 绝对路径：`$__DataModel.xxx.yyy`（任何表达式可用）
- 相对路径：`$item.fieldName`（列表模板内，`$item` 为当前项）

**局部变量**：
- 循环变量：`$index` (索引), `$item` (当前项)，可通过 `indexVar`/`itemVar` 自定义
- 行为链变量：行为通过 `as` 绑定返回值（如 `"as": "result"`），后续行为用 `$result` 引用
- 事件上下文：`$context.componentId`, `$context.eventData`

**变量查找优先级**：as绑定 > 循环变量 > 事件上下文 > 全局系统变量
```

**理由:** 原 prompt 只覆盖了全局变量的 2/4，缺少 DataModel、循环变量、as 绑定、事件上下文。新描述与 spec §4.5 一致。

## 测试用例同步

5 个测试用例文件（events/layout/components/mixed/conflict-resolution）中 `{"expr":}` → `{{ }}` 格式统一，`field_is_expr` 规则替换为 `contains {{`。
