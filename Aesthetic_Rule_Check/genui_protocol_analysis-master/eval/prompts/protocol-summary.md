<!--
  对齐源: specification/harmonyos-a2ui-protocol.md
  最后同步: 2026-07-08 | GAP-065, GAP-066, GAP-067, GAP-069
  同步规则: 修改 spec 中语法、组件、表达式、事件、样式等评估相关内容时，必须同步更新本文件
-->

# 鸿蒙智能体 UI 协议语法参考

## 输出格式

- 只输出 JSON，不要输出 Markdown 代码块或说明文字。
- 单组件输出 JSON 对象，多组件输出 JSON 数组。
- 多组件通过组件 ID 引用形成邻接表；`children` 只能放子组件 ID 字符串数组或模板对象，不能内联组件对象。
- 每个组件必须包含 `id` 和 `component`。

## 组件系统

### 公共属性

扩展组件支持：`id`、`component`、`catalogId`、`styles`，并可直接使用事件名作为属性，如 `onClick`、`onChange`。

### 常用组件

| 组件 | 主要属性 |
|------|----------|
| Row | children, itemMargin, wrap |
| Column | children, itemMargin |
| List | children, space, onReachStart, onReachEnd |
| Grid | children, styles: columnsTemplate, rowsTemplate, columnsGap, rowsGap |
| Stack | children |
| Tabs | children, vertical, scrollable, tabIndex, onChange |
| TabContent | title, icon, selectedSrc |
| NavContainer | children, currentIndex |
| Text | content |
| Image | src |
| Button | label, enabled, action, onClick |
| TextInput | text, placeholder, enabled, maxLength, onChange |
| Toggle | label, isOn, enabled, onChange |
| Radio | value, group, checked, onChange |
| Checkbox | label, value, group, select, onChange |
| CheckboxGroup | group, selectAll, onChange |
| Select | selected, value, onSelect |
| Slider | value, min, max |
| Progress | value, total |
| If | condition, childrenIf, childrenElse |

> **约束**：Image 组件 `src` 不支持 SVG 格式（包括 base64 编码的 SVG，如 `data:image/svg+xml;base64,...`）。
> **约束**：Select 组件 `options[].symbolIcon.src` 仅支持以下图标名称：`accountCircle`, `add`, `arrowBack`, `arrowForward`, `attachFile`, `calendarToday`, `call`, `camera`, `check`, `close`, `delete`, `download`, `edit`, `event`, `error`, `fastForward`, `favorite`, `favoriteOff`, `folder`, `help`, `home`, `info`, `locationOn`, `lock`, `lockOpen`, `mail`, `menu`, `moreVert`, `moreHoriz`, `notificationsOff`, `notifications`, `pause`, `payment`, `person`, `phone`, `photo`, `play`, `print`, `refresh`, `rewind`, `search`, `send`, `settings`, `share`, `shoppingCart`, `skipNext`, `skipPrevious`, `star`, `starHalf`, `starOff`, `stop`, `upload`, `visibility`, `visibilityOff`, `volumeDown`, `volumeMute`, `volumeOff`, `volumeUp`, `warning`。与原生 Icon 组件 `name` 字段一致。

### 组件示例

```json
{"id":"root","component":"Column","children":["title","submitBtn"],"itemMargin":16}
{"id":"title","component":"Text","content":"{{ 'Hello, ' + $__dataModel.user.name }}"}
{"id":"submitBtn","component":"Button","label":"提交","enabled":"{{ $__dataModel.formValid }}"}
{"id":"grid1","component":"Grid","children":["card1","card2"],"styles":{"columnsTemplate":"1fr 1fr","columnsGap":12}}
{"id":"toggle1","component":"Toggle","isOn":"{{ $__dataModel.enabled }}","styles":{"visibility":"{{ $__dataModel.hasPermission ? 'visible' : 'none' }}"}}
```

## 表达式系统

### 语法

- 动态值使用完整表达式字符串：`"{{ expression }}"`。
- 每个 `{{ }}` 中只能包含一个完整表达式。
- 不支持嵌套 `{{ }}`。
- 表达式总长度 ≤ 2048 字符，括号嵌套深度 ≤ 20。
- 表达式求值失败返回空字符串 `""`，不中断页面渲染。

### 变量

| 变量 | 说明 |
|------|------|
| `$__dataModel.xxx` | 当前 surface 数据模型，surface 级作用域 |
| `$__widthBreakpoint` | 当前断点：`xs` / `sm` / `md` / `lg` / `xl` |
| `$__colorMode` | 颜色模式：`light` / `dark` |
| `$item.field` | 列表模板当前项字段 |
| `$index` | 列表模板当前索引 |
| `$context.componentId` | 当前事件来源组件 ID |
| `$context.eventData` | 当前事件数据 |
| `$validResult` | `as` 绑定产生的事件链局部变量示例 |

变量查找优先级：`as` 绑定 > 循环变量 > 事件上下文 > 全局系统变量。

> **命名约束**：`itemVar`、`indexVar`、`as` 的自定义变量名必须以字母或下划线开头，仅包含字母、数字、下划线（如 `product`、`idx`、`validResult`）。值不含 `$` 前缀（引用时自动拼 `$`）。同一模板中 `indexVar` 与 `itemVar` 相同时，自定义名失效，回退默认 `$item` / `$index`。

### 运算符和函数

- 算术：`+ - * / %`
- 比较：`== != < > <= >=`
- 逻辑：`&& || !`
- 条件：`? :`
- 成员访问：`.` 和 `[]`
- 表达式内置函数：`size(arr)`，只用于 `{{ size($items) }}` 这类表达式，不是 `{call,args}` 函数调用对象。

### 表达式适用字段

常见可用字段：`content`、`text`、`condition`、`enabled`、`styles.*`、`src`、`value`、EventHandler 的 `condition`、EventHandler 的 `args.*`。

不可用字段：`id`、`component`、事件属性名（如 `onClick`）、EventHandler 的 `call`、EventHandler 的 `as`。

## 动态数据绑定

组件属性/样式的值支持三种动态绑定机制（取值含基础数据类型 number/boolean/string 的字段均可；纯对象/数组类型字段如 `constraintSize`、`linearGradient` 不支持，只能用字面量）：

| 机制 | 写法 | 说明 |
|------|------|------|
| 表达式 | `"{{ ... }}"` | 主推，响应式，可运算。语法见上方"表达式系统" |
| 路径绑定 | `{"path":"/user/name"}` | 原生 JSON Pointer 声明式绑定 |
| 函数绑定 | `{"call":"函数名","args":{...}}` | 调用已注册的值函数，返回值绑定到属性（须匹配字段类型；值函数如 formatString、formatNumber、formatDate、pluralize） |

三种互斥，同一属性值取其一。示例：

```json
{"id":"n","component":"Text","content":{"path":"/user/name"}}
{"id":"g","component":"Text","content":{"call":"formatString","args":{"value":"Hello, ${/user/name}!"}}}
{"id":"b","component":"Button","label":"提交","styles":{"fontSize":"{{ $__dataModel.fontSize }}"}}
```

**不支持动态数据类型**：`id`、`component`、`children`、事件属性（`onXxx`）、`action` 为结构/标识字段，即便取值为 string 也不支持。

**响应式 vs 一次性求值**：属性/样式值位置的绑定是**响应式**（数据变化自动更新）；EventHandler 的 `condition`/`args.*` 是**一次性求值**（触发时计算，不持续响应），不属于绑定。

> JSON Schema 中，支持动态数据类型的字段以 `ExtendedDynamic*` 类型声明（字面量 ∪ `ExtendedDynamicValueRef`，`ExtendedDynamicValueRef` = Expression ∪ PathBinding ∪ FunctionCall）。

## 扩展函数

扩展函数使用对象调用形式：

```json
{"call":"函数名","args":{"参数名":"参数值"}}
```

调用处不要写 `returnType`；返回类型由函数定义声明。

### 扩展函数清单

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| getRadioValue | `{group}` | string | 获取指定 Radio group 的选中值，未选中返回 `""` |
| getCheckboxGroupValues | `{group}` | string[] | 获取指定 CheckboxGroup 中所有选中值，未选中返回 `[]` |
| getToggleValue | `{componentId}` | object | 获取 Toggle 状态和 label，形如 `{isOn,label}` |
| getSelectValue | `{componentId}` | string | 获取 Select 当前选中项文本，未选中返回 `""` |
| break | 无 | void | 跳出当前 EventHandler 链 |
| setDataModel | `{path,value}` | void | 设置数据模型值 |
| setAttributes | `{componentId,value}` | void | 批量修改目标组件属性 |
| navigate | `{componentId,targetComponentId}` | void | NavContainer 子页面跳转 |

### action.event.context 中调用函数

```json
{
  "id": "submit-btn",
  "component": "Button",
  "label": "提交",
  "action": {
    "event": {
      "name": "submitSurvey",
      "context": {
        "plan": {"call":"getRadioValue","args":{"group":"plan_type"}},
        "hobbies": {"call":"getCheckboxGroupValues","args":{"group":"hobbies"}},
        "agree": {"call":"getToggleValue","args":{"componentId":"agree_toggle"}},
        "city": {"call":"getSelectValue","args":{"componentId":"city_select"}}
      }
    }
  }
}
```

## 事件监听与交互

### EventHandler 结构

事件名直接作为组件属性，值是 EventHandler 数组。不要使用 `listeners` 包装层。

```json
{
  "id": "refresh-btn",
  "component": "Button",
  "label": "刷新",
  "onClick": [
    {"call":"setDataModel","args":{"path":"/ui/isLoading","value":true}},
    {"call":"setAttributes","args":{"componentId":"refresh-btn","value":{"label":"加载中..."}}}
  ]
}
```

EventHandler 字段：

| 字段 | 必选 | 说明 |
|------|------|------|
| call | 是 | 引用扩展函数名 |
| args | 否 | 函数参数，可包含表达式 |
| as | 否 | 将函数返回值绑定为事件链局部变量 |
| condition | 否 | 执行条件表达式，省略时默认执行 |

EventHandler 是函数调用包装器，不定义 `returnType`。

### 条件链示例

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

### Button action

Button 额外支持 A2UI 原生 `action` 属性，用于表单提交或原生 action 处理。`action` 使用原生协议结构，不是 EventHandler 数组。

`action` 与 `onClick` 同时存在时，以 `action` 注册为准。

### 事件类型

| 事件 | 适用组件 | 事件数据 |
|------|----------|----------|
| onClick | 所有组件 | `{x:number,y:number}` |
| onAppear | 所有组件 | 无 |
| onChange | TextInput | `{value:string}` |
| onChange | Radio | `{isChecked:boolean}` |
| onChange | Checkbox | `{value:boolean}` |
| onChange | CheckboxGroup | `{value:string[],status:string}` |
| onChange | Tabs | `{index:number}` |
| onChange | Toggle | `{isOn:boolean}` |
| onSelect | Select | `{index:number,value:string}` |
| onReachStart | List | 无 |
| onReachEnd | List | 无 |

## 条件渲染

使用 `If` 组件：

```json
{"id":"conditional","component":"If","condition":"{{ $__dataModel.isLoggedIn }}","childrenIf":["welcomeText"],"childrenElse":["loginBtn"]}
```

## 常见样式属性

**重要：所有样式属性必须放在 `styles` 对象内，不能作为组件顶层属性。** 只有 `id`、`component`、`children`、`itemMargin`、`wrap`、`space`、事件属性（`onClick`/`onChange`/...）、`condition`、`content`、`label`、`enabled`、`action`、`isOn`、`value`、`selected`、`text`、`placeholder`、`src` 等组件专有属性放在顶层。

`visibility` 是样式属性，必须放在 `styles` 内：`"styles": {"visibility": "{{ ... }}"}`.

| 属性 | 说明 | 示例 |
|------|------|------|
| width/height | 宽高 | `100`, `"100%"`, `"matchParent"`, `"wrapContent"` |
| padding/margin | 边距 | `16`, `{"top":8,"left":16}` |
| backgroundColor | 背景色 | `"#FFFFFF"` |
| borderRadius | 圆角 | `8` |
| fontSize | 字号 | `16` |
| fontWeight | 字重 | `400`, `700`, `"bold"` |
| fontColor | 字体颜色 | `"#333333"` |
| justifyContent | 主轴对齐 | `"start"`, `"center"`, `"spaceBetween"` |
| alignItems | 交叉轴对齐 | `"start"`, `"center"`, `"end"` |
| opacity | 透明度 | `0.8` |
| visibility | 可见性（样式属性） | `"visible"`, `"hidden"`, `"none"` |
