# 鸿蒙智能体 UI 协议语法参考（inline 表达式版）

## 输出格式

- 只输出 JSON，不要输出 Markdown 代码块或说明文字。
- 单组件输出 JSON 对象，多组件输出 JSON 数组。
- 多组件通过 `id` 引用，`children` 只能是子组件 ID 字符串数组或模板对象，不能内联组件对象。

## 组件系统

所有组件必须包含 `id` 和 `component`。扩展组件可使用 `catalogId`、`styles` 和事件属性，如 `onClick`、`onChange`。

常用组件：`Row`、`Column`、`List`、`Grid`、`GridRow`、`Stack`、`Tabs`、`TabContent`、`NavContainer`、`Text`、`Image`、`Button`、`TextInput`、`Toggle`、`Radio`、`Checkbox`、`CheckboxGroup`、`Select`、`Slider`、`Progress`、`If`、`Web`。

```json
[
  {"id":"root","component":"Column","children":["title","submitBtn"],"space":16},
  {"id":"title","component":"Text","content":"{{ 'Hello, ' + $__dataModel.user.name }}"},
  {"id":"submitBtn","component":"Button","label":"提交","enabled":"{{ $__dataModel.formValid }}"}
]
```

## 表达式系统

- 动态值使用完整表达式字符串：`"{{ expression }}"`。
- 每个 `{{ }}` 中只能包含一个完整表达式，不支持嵌套。
- 表达式长度 ≤ 2048 字符，括号嵌套深度 ≤ 20。
- 表达式求值失败返回空字符串 `""`。

变量：`$__dataModel.xxx`、`$__widthBreakpoint`、`$__colorMode`、`$item`、`$index`、`$context.componentId`、`$context.eventData`、`$validResult`。

表达式内置函数：`size(arr)`。它只用于 `{{ size($items) }}`，不是 `{call,args}` 扩展函数。

表达式不可用于：`id`、`component`、事件属性名、EventHandler 的 `call` 和 `as`。

## 动态数据绑定

属性/样式值（取值含基础数据类型 number/boolean/string 的字段）支持三种绑定机制，同一值取其一：表达式 `"{{...}}"`（响应式，主推）、路径绑定 `{"path":"/x"}`、函数绑定 `{"call":"函数名","args":{...}}`（调用已注册的值函数，返回值绑定）。纯对象/数组字段不支持。属性/样式值位置为响应式绑定；EventHandler 的 `condition`/`args.*` 为一次性求值，不属于绑定。

## 扩展函数

扩展函数调用对象格式：

```json
{"call":"函数名","args":{"参数名":"参数值"}}
```

调用处不要写 `returnType`。

| 函数 | 参数 | 说明 |
|------|------|------|
| getRadioValue | `{group}` | 获取 Radio group 选中值 |
| getCheckboxGroupValues | `{group}` | 获取 CheckboxGroup 所有选中值 |
| getToggleValue | `{componentId}` | 获取 Toggle 状态和 label |
| getSelectValue | `{componentId}` | 获取 Select 当前选中项文本 |
| break | 无 | 跳出当前 EventHandler 链 |
| setDataModel | `{path,value}` | 设置数据模型值 |
| setAttributes | `{componentId,value}` | 批量修改组件属性 |
| navigate | `{componentId,targetComponentId}` | NavContainer 子页面跳转 |

## 事件交互系统

事件名直接作为组件属性，值是 EventHandler 数组。不要使用 `listeners` 包装层。

```json
{
  "id":"refresh-btn",
  "component":"Button",
  "label":"刷新",
  "onClick":[
    {"call":"setDataModel","args":{"path":"/ui/isLoading","value":true}},
    {"call":"setAttributes","args":{"componentId":"refresh-btn","value":{"label":"加载中..."}}}
  ]
}
```

EventHandler 字段：`call`、`args`、`as`、`condition`。EventHandler 是函数调用包装器，不定义 `returnType`。

```json
{
  "id":"submit-btn",
  "component":"Button",
  "label":"提交",
  "onClick":[
    {"call":"validateForm","args":{"data":"{{ $__dataModel.form }}"},"as":"validResult"},
    {"call":"break","condition":"{{ $validResult == 0 }}"},
    {"call":"setDataModel","args":{"path":"/form/validated","value":true}}
  ]
}
```

Button 额外支持 A2UI 原生 `action` 属性；`action` 与 `onClick` 同时存在时，以 `action` 注册为准。

`action.event.context` 可以使用扩展函数调用对象：

```json
{
  "id":"submit-btn",
  "component":"Button",
  "label":"提交",
  "action":{"event":{"name":"submitSurvey","context":{"plan":{"call":"getRadioValue","args":{"group":"plan_type"}}}}}
}
```

## 常见事件

`onClick`、`onAppear`、`onChange`、`onSelect`、`onReachStart`、`onReachEnd`。

事件上下文通过 `$context` 访问：`$context.componentId`、`$context.eventData`。

## 常见样式属性

`width`、`height`、`padding`、`margin`、`backgroundColor`、`borderRadius`、`fontSize`、`fontWeight`、`fontColor`、`textAlign`、`justifyContent`、`alignItems`、`opacity`。
