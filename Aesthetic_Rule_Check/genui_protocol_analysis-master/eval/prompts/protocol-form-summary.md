# HarmonyOS A2UI Form 卡片协议语法参考

> catalogId: ohos.a2ui.extended.catalog.form
> Form 协议仅支持扩展组件，不支持 A2UI 原生组件。

## 组件系统

| 组件 | 主要属性 |
|------|----------|
| Text | content |
| Button | label, enabled |
| Row | children, itemMargin, wrap |
| Column | children, itemMargin |
| List | children, space |
| Stack | children |
| Image | src |
| Divider |  |
| Progress | value, total |
| Checkbox | label, value, group, select |

## 动态数据绑定

属性/样式值（取值含基础数据类型 number/boolean/string 的字段）支持三种绑定机制，同一值取其一：

- 表达式：`"{{ ... }}"`（响应式，主推）
- 路径绑定：`{"path":"/user/name"}`
- 函数绑定：`{"call":"函数名","args":{...}}`（调用已注册的值函数，返回值绑定到属性）

属性/样式值位置的绑定为响应式；EventHandler 的 `condition`/`args.*` 为一次性求值，不属于绑定。详见 spec §3.8。

## 事件

Form 仅支持 `onClick` 事件（EventHandler 数组 + condition + as 绑定）。

## 扩展函数

Form profile 排除全部预定义扩展函数。EventHandler 链中的 `call` 只能引用应用方通过自定义函数机制注册的函数。
