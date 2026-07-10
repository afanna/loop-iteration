# 鸿蒙 A2UI 扩展协议语法参考（inline 表达式版）

## 输出格式

- 只输出 JSON。
- 单组件输出 JSON 对象，多组件输出 JSON 数组。
- `children` 只能引用组件 ID，不能内联组件对象。

## 组件

常用组件：`Text`、`Button`、`TextInput`、`Row`、`Column`、`List`、`Stack`、`Grid`、`GridRow`、`Image`、`Divider`、`Toggle`、`Progress`、`Radio`、`Checkbox`、`CheckboxGroup`、`Select`、`If`、`Tabs`、`TabContent`、`Web`、`NavContainer`。

所有组件包含 `id`、`component`，可包含 `catalogId`、`styles`，以及事件属性如 `onClick`、`onChange`。

```json
[
  {"id":"root","component":"Column","children":["title","btn"],"space":16},
  {"id":"title","component":"Text","content":"标题"},
  {"id":"btn","component":"Button","label":"提交"}
]
```

## 表达式

- 动态值格式：`"{{ expression }}"`。
- 每对 `{{ }}` 只包含一个完整表达式。
- 变量：`$__dataModel.xxx`、`$__widthBreakpoint`、`$__colorMode`、`$item`、`$index`、`$context.eventData`、`$validResult`。
- 表达式函数：`size(arr)`，只在 `{{ }}` 内直接调用，不是 `{call,args}`。
- `id`、`component`、事件属性名、EventHandler 的 `call` 和 `as` 不可使用表达式。

## 动态数据绑定

属性/样式值（取值含基础数据类型 number/boolean/string 的字段）支持三种绑定机制，同一值取其一：表达式 `"{{...}}"`（响应式，主推）、路径绑定 `{"path":"/x"}`、函数绑定 `{"call":"函数名","args":{...}}`（调用已注册的值函数，返回值绑定）。纯对象/数组字段不支持。属性/样式值位置为响应式绑定；EventHandler 的 `condition`/`args.*` 为一次性求值，不属于绑定。

## 扩展函数

调用对象：

```json
{"call":"函数名","args":{"参数名":"参数值"}}
```

调用处不写 `returnType`。

扩展函数：`getRadioValue`、`getCheckboxGroupValues`、`getToggleValue`、`getSelectValue`、`break`、`setDataModel`、`setAttributes`、`navigate`。

## 事件交互

事件名直接作为组件属性，值是 EventHandler 数组。不要使用 `listeners` 包装层。

EventHandler 字段：`call`、`args`、`as`、`condition`。

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

Button 支持 A2UI 原生 `action` 属性；`action` 与 `onClick` 同时存在时，以 `action` 注册为准。

```json
{
  "id":"survey-submit",
  "component":"Button",
  "label":"提交问卷",
  "action":{
    "event":{
      "name":"submitSurvey",
      "context":{
        "plan":{"call":"getRadioValue","args":{"group":"plan_type"}},
        "hobbies":{"call":"getCheckboxGroupValues","args":{"group":"hobbies"}}
      }
    }
  }
}
```

事件上下文：`$context.componentId`、`$context.eventData`。

常见事件：`onClick`、`onAppear`、`onChange`、`onSelect`、`onReachStart`、`onReachEnd`。

## 样式

常见样式：`width`、`height`、`padding`、`margin`、`backgroundColor`、`borderRadius`、`fontSize`、`fontWeight`、`fontColor`、`textAlign`、`justifyContent`、`alignItems`、`opacity`。
