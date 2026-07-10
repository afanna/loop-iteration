# 鸿蒙智能体 UI 协议 — Extended 组件语法参考

## 输出格式

- 只输出 JSON，不要输出 Markdown 代码块或解释文字。
- 单组件输出 JSON 对象，多组件输出 JSON 数组。
- 多组件通过 `id` 互相引用；`children` 只能是子组件 ID 字符串数组或模板对象，不能内联组件对象。

## 组件系统

### 公共属性

所有 Extended 组件支持：`id`、`component`、`catalogId`、`styles`。

### 组件清单

| 组件名 | 类型 | 主要属性 |
|-------|------|----------|
| Row | 水平布局 | children, itemMargin, wrap |
| Column | 垂直布局 | children, itemMargin |
| List | 列表 | children, space, onReachStart, onReachEnd |
| Grid / GridRow | 网格 | children |
| Stack | 堆叠 | children |
| Tabs | 选项卡 | children, vertical, scrollable, tabIndex, onChange |
| TabContent | 选项卡内容 | title, icon, selectedSrc |
| NavContainer | 导航容器 | children, currentIndex |
| Text | 文本 | content |
| Image | 图片 | src |
| Video / AudioPlayer | 媒体 | src |
| Icon | 图标 | name, color, size |
| Divider | 分割线 | vertical, color |
| Button | 按钮 | label, enabled, action, onClick |
| TextInput | 文本输入 | text, placeholder, enabled, maxLength, onChange |
| Toggle | 开关 | label, isOn, enabled, onChange |
| Radio | 单选框 | value, group, checked, onChange |
| Checkbox | 多选框 | label, value, group, select, onChange |
| CheckboxGroup | 多选框组 | group, selectAll, onChange |
| Select | 下拉选择 | selected, value, onSelect |
| Slider | 滑块 | value, min, max |
| Progress | 进度条 | value, total |
| Card / Modal | 容器 | child, visible |
| If | 条件渲染 | condition, childrenIf, childrenElse |
| Web | 网页视图 | url |

> **约束**：Image 组件 `src` 不支持 SVG 格式（包括 base64 编码的 SVG，如 `data:image/svg+xml;base64,...`）。
> **约束**：Select 组件 `options[].symbolIcon.src` 仅支持以下图标名称：`accountCircle`, `add`, `arrowBack`, `arrowForward`, `attachFile`, `calendarToday`, `call`, `camera`, `check`, `close`, `delete`, `download`, `edit`, `event`, `error`, `fastForward`, `favorite`, `favoriteOff`, `folder`, `help`, `home`, `info`, `locationOn`, `lock`, `lockOpen`, `mail`, `menu`, `moreVert`, `moreHoriz`, `notificationsOff`, `notifications`, `pause`, `payment`, `person`, `phone`, `photo`, `play`, `print`, `refresh`, `rewind`, `search`, `send`, `settings`, `share`, `shoppingCart`, `skipNext`, `skipPrevious`, `star`, `starHalf`, `starOff`, `stop`, `upload`, `visibility`, `visibilityOff`, `volumeDown`, `volumeMute`, `volumeOff`, `volumeUp`, `warning`。与原生 Icon 组件 `name` 字段一致。

### children 属性

```json
"children": ["header", "body", "footer"]
"children": { "componentId": "item_template", "path": "$__dataModel.items" }
```

### 基础示例

```json
[
  {"id":"root","component":"Column","children":["title","submitBtn"],"itemMargin":16},
  {"id":"title","component":"Text","content":"{{ 'Hello, ' + $__dataModel.user.name }}"},
  {"id":"submitBtn","component":"Button","label":"提交","enabled":"{{ $__dataModel.formValid }}"}
]
```

## 表达式系统

动态值使用 `{{ }}` 包裹：

```json
{"content":"{{ $__dataModel.user.name }}"}
{"styles":{"fontSize":"{{ $__widthBreakpoint == 'sm' ? 14 : 18 }}"}}
```

规则：
- 表达式必须以 `{{` 开始，以 `}}` 结束。
- 每个 `{{ }}` 只包含一个完整表达式。
- 不支持嵌套 `{{ }}`。
- 表达式字符串总长度 ≤ 2048 字符，括号嵌套深度 ≤ 20。

变量：
- `$__dataModel.path.to.field`：当前 surface 数据模型。
- `$__widthBreakpoint`：当前断点，`xs` / `sm` / `md` / `lg` / `xl`。
- `$__colorMode`：颜色模式，`light` / `dark`。
- `$item.fieldName`、`$item`、`$index`：列表模板变量。
- `$context.componentId`、`$context.eventData`：事件上下文变量。
- `$varName`：EventHandler 通过 `as` 绑定的局部变量。

> **命名约束**：`itemVar`、`indexVar`、`as` 的自定义变量名必须以字母或下划线开头，仅包含字母、数字、下划线（如 `product`、`idx`、`validResult`）。值不含 `$` 前缀（引用时自动拼 `$`）。同一模板中 `indexVar` 与 `itemVar` 相同时，自定义名失效，回退默认 `$item` / `$index`。

表达式内置函数：
- `size(arr)`：数组长度。它只用于表达式中，例如 `{{ size($items) }}`，不是 `{call,args}` 函数调用对象。

表达式可用于组件动态值、样式值、If 条件、EventHandler 的 `condition` 和 `args.*`。表达式不可用于 `id`、`component`、事件属性名、EventHandler 的 `call` 和 `as`。

## 动态数据绑定

属性/样式值（取值含基础数据类型 number/boolean/string 的字段）支持三种绑定机制，同一值取其一：表达式 `"{{...}}"`（响应式，主推）、路径绑定 `{"path":"/x"}`、函数绑定 `{"call":"函数名","args":{...}}`（调用已注册的值函数，返回值绑定）。纯对象/数组字段（如 `constraintSize`）不支持。属性/样式值位置为响应式绑定；EventHandler 的 `condition`/`args.*` 为一次性求值，不属于绑定。

## 扩展函数

扩展函数调用对象格式：

```json
{"call":"函数名","args":{"参数名":"参数值"}}
```

调用处不要写 `returnType`；返回类型由函数定义声明。

| 函数名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| getRadioValue | `{group}` | string | 获取指定 Radio group 的选中值，未选中返回 `""` |
| getCheckboxGroupValues | `{group}` | string[] | 获取 CheckboxGroup 中所有选中值，未选中返回 `[]` |
| getToggleValue | `{componentId}` | object | 获取 Toggle 状态和 label |
| getSelectValue | `{componentId}` | string | 获取 Select 当前选中项文本，未选中返回 `""` |
| break | 无 | void | 跳出当前 EventHandler 链 |
| setDataModel | `{path,value}` | void | 设置数据模型值 |
| setAttributes | `{componentId,value}` | void | 批量修改目标组件属性 |
| navigate | `{componentId,targetComponentId}` | void | NavContainer 子页面跳转 |

### action.event.context 中调用扩展函数

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

## 事件交互系统

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
- `call`：必选，引用扩展函数名。
- `args`：可选，函数参数，可包含表达式。
- `as`：可选，将函数返回值绑定为事件链局部变量。
- `condition`：可选，执行条件表达式；省略时默认执行。

EventHandler 是函数调用包装器，不定义 `returnType`。

条件链示例：

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

Button 额外支持 A2UI 原生 `action` 属性，用于表单提交或原生 action 处理；`action` 与 `onClick` 同时存在时，以 `action` 注册为准。

事件类型：

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

```json
{"id":"conditional","component":"If","condition":"{{ $__dataModel.isLoggedIn }}","childrenIf":["welcomeText"],"childrenElse":["loginBtn"]}
```

## 响应式设计

使用 `$__widthBreakpoint` 生成响应式样式或 If 条件：

```json
{"styles":{"fontSize":"{{ $__widthBreakpoint == 'sm' ? 14 : 18 }}"}}
{"id":"layout","component":"If","condition":"{{ $__widthBreakpoint == 'sm' }}","childrenIf":["mobileLayout"],"childrenElse":["desktopLayout"]}
```

## 常见样式属性

| 属性 | 说明 | 示例 |
|------|------|------|
| width/height | 宽高 | `100`, `"100%"`, `"matchParent"`, `"wrapContent"` |
| padding/margin | 边距 | `16`, `{"top":8,"left":16}` |
| backgroundColor | 背景色 | `"#FFFFFF"` |
| borderWidth/borderColor/borderRadius | 边框 | `1`, `"#E0E0E0"`, `8` |
| fontSize/fontWeight/fontColor | 文本 | `16`, `700`, `"#333333"` |
| textAlign | 文本对齐 | `"start"`, `"center"`, `"end"` |
| justifyContent | 主轴对齐 | `"start"`, `"center"`, `"spaceBetween"` |
| alignItems | 交叉轴对齐 | `"start"`, `"center"`, `"end"` |
| opacity | 透明度 | `0.8` |
| visibility | 可见性，须放在 styles 内 | `"visible"`, `"none"` |
