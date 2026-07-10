# 扩展组件参考

> **Catalog**：鸿蒙扩展协议 Catalog（ohos.a2ui.extended.catalog）
> **使用指南**：[使用扩展组件](../../guides/using-extended-components.md)
> **默认深浅色**：[扩展组件默认深浅色](../../concepts/extension-color-mode.md)
> 扩展组件与 Basic Catalog 不可在同一 Surface 混用。

## 组件列表（21 个）

### 展示组件

| 组件 | 文件 | 说明 |
|------|------|------|
| **Text** | [text.md](text.md) | 文本（支持 styles、content） |
| **Image** | [image.md](image.md) | 图片（使用 src 而非 url） |
| **Divider** | [divider.md](divider.md) | 分割线（strokeWidth、vertical） |
| **Progress** | [progress.md](progress.md) | 进度条（value、total、type） |

### 交互组件

| 组件 | 文件 | 说明 |
|------|------|------|
| **Button** | [button.md](button.md) | 按钮（label 属性、支持 styles） |
| **TextInput** | [text-input.md](text-input.md) | 文本输入（text、placeholder、type） |
| **Toggle** | [toggle.md](toggle.md) | 开关（isOn、label） |
| **Radio** | [radio.md](radio.md) | 单选框（value、checked、group） |
| **Checkbox** | [checkbox.md](checkbox.md) | 复选框（label、group、select） |
| **CheckboxGroup** | [checkbox-group.md](checkbox-group.md) | 复选框组（group、selectAll） |
| **Select** | [select.md](select.md) | 下拉选择（options、value） |

### 布局容器

| 组件 | 文件 | 说明 |
|------|------|------|
| **Row** | [row.md](row.md) | 水平布局 |
| **Column** | [column.md](column.md) | 垂直布局 |
| **List** | [list.md](list.md) | 可滚动列表 |
| **Stack** | [stack.md](stack.md) | 层叠布局 |
| **Grid** | [grid.md](grid.md) | 网格布局 |

### 容器组件

| 组件 | 文件 | 说明 |
|------|------|------|
| **Tabs** | [tabs.md](tabs.md) | 标签页容器（barPosition、children） |
| **TabContent** | [tab-content.md](tab-content.md) | 标签页内容（title、icon） |
| **NavContainer** | [nav-container.md](nav-container.md) | 导航容器 |
| **Web** | [web.md](web.md) | 网页视图（url） |

### 其他

| 组件 | 文件 | 说明 |
|------|------|------|
| **If** | [if.md](if.md) | 条件组件（condition、childrenIf、childrenElse） |

## 与标准组件的同名对照

| 属性 | 标准组件 | 扩展组件 |
|------|----------|----------|
| 文本 | Text.text | Text.content |
| 图片 | Image.url | Image.src |
| 按钮文字 | Button.child（引用 Text ID） | Button.label（直接字符串） |
| 样式 | 不支持 | "styles": { ... } |
| 事件监听 | 不支持 | "onClick": [EventHandler, ...] 等 |

## 通用事件属性

所有扩展组件支持通过事件属性定义交互响应。事件属性的值为 EventHandler 数组，当事件触发时按顺序执行。

| 事件属性 | 类型 | 触发时机 | 适用组件 |
|----------|------|----------|----------|
| onClick | EventHandler[] | 用户点击组件 | 所有扩展组件 |
| onAppear | EventHandler[] | 组件首次渲染完成 | 所有扩展组件 |
| onChange | EventHandler[] | 组件值发生变化 | TextInput、Select、Toggle、Radio、Checkbox、CheckboxGroup、Tabs |
| onReachStart | EventHandler[] | 滚动到列表顶部 | List |
| onReachEnd | EventHandler[] | 滚动到列表底部 | List |

### EventHandler 结构

每个 EventHandler 是对一次函数调用的封装：

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| call | string | 是 | — | 函数名（[内置函数](../functions/overview.md)或[扩展函数](../functions/extension-functions.md)） |
| args | object | 否 | {} | 函数参数，值支持[表达式](../../concepts/expression-language.md) |
| as | string | 否 | 不绑定 | 将函数返回值绑定为局部变量，后续 handler 可通过 $变量名 引用 |
| condition | string | 否 | 不设条件 | 执行条件（表达式），求值为 false 或 undefined 时跳过该 handler |

### 链式执行规则

1. 事件触发时，EventHandler 数组按顺序依次执行
2. condition 求值为 false 或 undefined 时跳过该 handler，继续下一个
3. call: "break" 中断整个链，后续 handler 不再执行
4. handler 抛出异常时链执行中断，记录错误日志
5. as 绑定的局部变量仅在当前事件链内有效，事件完成后释放
6. 未知函数名走 BridgeFunctionDispatcher fallback，记录 WARN 日志

完整的异常容错行为详见 [交互与函数 - 异常与容错](../../concepts/actions-and-functions.md#异常与容错)。

### 示例

**顺序执行多步操作：**

```json
{
  "id": "refreshBtn",
  "component": "Button",
  "label": "刷新",
  "onClick": [
    { "call": "setDataModel", "args": { "path": "/ui/isLoading", "value": true } },
    { "call": "setAttributes", "args": { "componentId": "refreshBtn", "value": { "label": "加载中..." } } }
  ]
}
```

**条件中断 + 局部变量传递：**

```json
{
  "id": "submitBtn",
  "component": "Button",
  "label": "提交",
  "onClick": [
    { "call": "getRadioValue", "args": { "group": "plan_type" }, "as": "selected" },
    { "call": "break", "condition": "{{ $selected == '' }}" },
    { "call": "setDataModel", "args": { "path": "/form/plan", "value": "{{ $selected }}" } }
  ]
}
```

### Button 的 action 优先级

Button 组件同时支持 action 属性和 onClick 事件。**action 优先级更高**：定义了 action 时，onClick 不会注册。详见 [Button 组件文档](button.md)。

## 通用属性

所有扩展组件共享以下属性：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 组件唯一标识，用于父子引用。不支持匿名。 |
| component | string | 是 | 组件类型，如 "Text"、"Button"、"Column" |
| accessibility | object | 否 | 无障碍属性，含 label 和 description。<br> 默认值：{}。 |

### id

组件的唯一标识符，在同一 Surface 的 components 数组中必须唯一。id 用于：
- 容器组件通过 children 引用子组件。
- 事件 action 中引用目标组件。
- 数据绑定和函数调用中作为引用锚点。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 组件唯一标识符。不可为空字符串。 |

### component

声明组件的类型。扩展组件的 component 值分为两种风格：

| 风格 | 格式 | 示例 |
|------|------|------|
| 简名 | 组件名 | "Text"、"Image"、"Column"、"Row"、"List"、"Stack"、"Grid"、"Divider"、"Progress" |

### accessibility

无障碍属性对象，用于为屏幕阅读器等辅助功能提供语义信息。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| accessibility | object | 否 | 无障碍属性对象。未知字段会被忽略。默认值：{}。 |

accessibility 对象属性：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| label | string | 否 | 无障碍标签，用于向屏幕阅读器朗读组件的名称或用途。默认值：""。 |
| description | string | 否 | 无障碍描述文本，用于向屏幕阅读器进一步说明组件的详细内容或操作结果。默认值：""。 |

**示例：**

```json
{
  "id": "submitBtn",
  "component": "Button",
  "label": "提交",
  "accessibility": {
    "label": "提交按钮",
    "description": "点击提交当前表单"
  }
}
```

---

## 链式执行规则

很多扩展组件字段都支持动态类型：字面量静态值，或可在运行时解析的 [Expression](../types.md#expression)、[PathBinding](../types.md#pathbinding)、[FunctionCall](../functions/functioncall.md)。

可以按下面的顺序理解运行时会怎么处理这些值：

1. 如果字段本身就是字面量，例如字符串、数字或布尔值，运行时直接使用。
2. 如果字段是 [Expression](../types.md#expression) 或 [PathBinding](../types.md#pathbinding) 对象，运行时会按对应语义解析出字段值。
3. 如果字段是函数调用对象，运行时会先执行函数，再使用函数返回值。
4. 如果当前这次解析没有拿到可用结果，组件会回退到该字段的安全默认值、空值或上一次可继续使用的结果，而不是直接让页面渲染失败。

如果你在日志或实现代码里看到 BridgeFunctionDispatcher fallback 这类字样，可以把它简单理解为：

- 这次动态解析没有拿到可用值。
- 运行时改走了后备处理，继续保证页面可渲染。
- 对文档使用者来说，更重要的是看“字段最终会回退成什么值”，而不是去理解内部桥接类名。

以 [Web](web.md#url) 组件的 url 为例：

- url 解析成功时，组件会按新地址加载页面。
- url 解析失败或为空时，组件会保留安全空地址，不主动加载新页面。

---

## styles 通用样式

所有扩展组件均支持通过可选的 styles 对象设置样式。styles 的字段为下表所列样式属性，各属性相互独立、可按需组合；未显式设置的字段使用各属性对应的默认值。

多数样式属性的取值支持以下几种通用类型，具体支持的类型以各属性说明为准：

- **数值**：纯数字，默认单位为 vp（如 200）。
- **字符串**：数值 + 单位，单位支持 "fp"、"vp"、"%"（如 "40vp"、"50%"）；部分属性也接受预定义枚举字符串。
- **对象**：用于精细配置，如四边 / 四角分别取值、渐变颜色组、阴影参数等。
- **字符串枚举**：预定义的固定字符串值，详见各属性说明。

styles 对象示例：

```json
{
  "id": "myComponent",
  "component": "Text",
  "styles": {
    "width": 200,
    "height": "40vp",
    "margin": { "top": 10, "bottom": 10 },
    "backgroundColor": "#F0F0F0",
    "borderRadius": 8
  }
}
```

通用样式属性一览：

| 样式 | 类型 | 说明 |
|------|------|------|
| [width](#width) | number \| string | 组件宽度 |
| [height](#height) | number \| string | 组件高度 |
| [constraintSize](#constraintsize) | object | 约束尺寸 |
| [margin](#margin) | number \| string \| object | 外边距 |
| [padding](#padding) | number \| string \| object | 内边距 |
| [borderRadius](#borderradius) | number \| string \| object | 圆角 |
| [borderWidth](#borderwidth) | number \| string | 边框宽度 |
| [borderColor](#bordercolor) | string | 边框颜色 |
| [backgroundColor](#backgroundcolor) | string | 背景色 |
| [backgroundImage](#backgroundimage) | string | 背景图片 |
| [backgroundImageSizeWithStyle](#backgroundimagesizewithstyle) | string \| object | 背景图片尺寸 |
| [linearGradient](#lineargradient) | object | 线性渐变 |
| [layoutWeight](#layoutweight) | number | 弹性权重 |
| [flexShrink](#flexshrink) | number | 弹性收缩比例 |
| [shadow](#shadow) | object \| string \| number | 阴影 |
| [visibility](#visibility) | string | 可见性 |
| [clip](#clip) | boolean | 裁剪 |

### width

组件的宽度。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| width | number | 否 | 数值宽度。取值范围 [0, +∞)，默认单位 vp；负数或非有限值会被视为非法并重置为默认。默认值：自适应内容。 |
| width | string | 否 | 数值 + 单位字符串或者字符串枚举值，见下表，如 "100fp"。支持 "fp"、"vp"、"%"。默认值：自适应内容。 |

字符串枚举值：

| 值 | 说明 |
|------|------|
| matchParent | 父组件对应宽/高为定值时，当前组件大小与父组件内容区相等，不包括 padding 和 border |
| wrapContent | 当前组件自适应子组件（内容）时，其大小与子组件（内容）相等，并且其大小受父组件内容区大小约束 |
| fixAtIdealSize | 当前组件自适应子组件（内容）时，其大小与子组件（内容）相等，并且其大小不受父组件内容区大小约束 |

**示例：**

```json
{
  "id": "myComponent",
  "component": "Text",
  "content": "固定宽度",
  "styles": {
    "width": 200
  }
}
```

---

### height

组件的高度。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| height | number | 否 | 数值高度。取值范围 [0, +∞)，默认单位 vp；负数或非有限值会被视为非法并重置为默认。默认值：自适应内容。 |
| height | string | 否 | 数值 + 单位字符串或者字符串枚举值，见下表。如 "40vp"。支持 "fp"、"vp"、"%"。默认值：自适应内容。 |

字符串枚举值：

| 值 | 说明 |
|------|------|
| matchParent | 父组件对应宽/高为定值时，当前组件大小与父组件内容区相等，不包括 padding 和 border |
| wrapContent | 当前组件自适应子组件（内容）时，其大小与子组件（内容）相等，并且其大小受父组件内容区大小约束 |
| fixAtIdealSize | 当前组件自适应子组件（内容）时，其大小与子组件（内容）相等，并且其大小不受父组件内容区大小约束 |

**示例：**

```json
{
  "id": "myComponent",
  "component": "Text",
  "content": "固定高度",
  "styles": {
    "height": "40vp"
  }
}
```

---

### constraintSize

设置组件的约束尺寸，用于限制组件的最小 / 最大宽高。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| constraintSize | object | 否 | 约束尺寸对象。默认值：无约束（不限制最小/最大宽高）。 |

constraintSize 对象属性：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| minWidth | number \| string | 否 | 最小宽度。默认值：0。 |
| maxWidth | number \| string | 否 | 最大宽度。默认值：Infinity。 |
| minHeight | number \| string | 否 | 最小高度。默认值：0。 |
| maxHeight | number \| string | 否 | 最大高度。默认值：Infinity。 |

四个属性类型均支持：
1. **数值**：取值范围 [0, +∞)，默认单位 vp。
2. **字符串**：数值 + 单位（如 "100fp"），支持 "fp"、"vp"、"%"。

constraintSize 的优先级高于 width / height。当同时设置 width 和 constraintSize 时，取值结果参考constraintSize取值对width/height影响。

**constraintSize(minWidth/maxWidth/minHeight/maxHeight)取值对width/height影响：**

| 缺省值                                      | 结果                                       |
| ---------------------------------------- | ---------------------------------------- |
| \ | width=MAX(minWidth,MIN(maxWidth,width))<br/>height=MAX(minHeight,MIN(maxHeight,height)) |
| maxWidth、maxHeight | width=MAX(minWidth,width)<br/>height=MAX(minHeight,height) |
| minWidth、minHeight | width=MIN(maxWidth,width)<br/>height=MIN(maxHeight,height) |
| width、height | 若minWidth<maxWidth，组件自身布局逻辑生效，width取值范围为[minWidth,maxWidth]；否则，width=MAX(minWidth,maxWidth)。<br/>若minHeight<maxHeight，组件自身布局逻辑生效，height取值范围为[minHeight,maxHeight]；否则，height=MAX(minHeight,maxHeight)。 |
| width与maxWidth、height与maxHeight | width=minWidth<br/>height=minHeight |
| width与minWidth、height与minHeight | 组件自身布局逻辑生效，width取值约束为不大于maxWidth。<br/>组件自身布局逻辑生效，height取值约束为不大于maxHeight。 |
| minWidth与maxWidth、minHeight与maxHeight | width以所设值为基础，根据其他布局属性发生可能的拉伸或者压缩。<br/>height以所设值为基础，根据其他布局属性发生可能的拉伸或者压缩。|
| width与minWidth与maxWidth | 使用父容器传递的布局限制进行布局。 |
| height与minHeight与maxHeight | 使用父容器传递的布局限制进行布局。 |

**示例：**

```json
{
  "id": "constrainedBox",
  "component": "Text",
  "content": "约束尺寸示例",
  "styles": {
    "width": "80%",
    "constraintSize": {
      "minWidth": 100,
      "maxWidth": 400,
      "minHeight": 40,
      "maxHeight": 200
    }
  }
}
```

---

### margin

设置组件的外边距。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| margin | number | 否 | 统一设置四边外边距。取值范围 [0, +∞)，默认单位 vp。默认值：0。 |
| margin | string | 否 | 数值 + 单位字符串统一设置四边，如 "8vp"。支持 "fp"、"vp"、"%"。默认值：0。 |
| margin | object | 否 | 分别设置四边外边距，见下表。默认值：0（四边均为 0）。 |

margin 对象属性（分别设置时）：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| top | number \| string | 否 | 上边距。默认值：0。 |
| bottom | number \| string | 否 | 下边距。默认值：0。 |
| left | number \| string | 否 | 左边距。默认值：0。 |
| right | number \| string | 否 | 右边距。默认值：0。 |

**示例：**

```json
{
  "id": "spacedBox",
  "component": "Text",
  "content": "外边距示例",
  "styles": {
    "margin": {
      "top": 10,
      "bottom": 10,
      "left": 20,
      "right": 20
    }
  }
}
```

---

### padding

设置组件的内边距。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| padding | number | 否 | 统一设置四边内边距。取值范围 [0, +∞)，默认单位 vp。默认值：0。 |
| padding | string | 否 | 数值 + 单位字符串统一设置四边，如 "12vp"。支持 "fp"、"vp"、"%"。默认值：0。 |
| padding | object | 否 | 分别设置四边内边距，见下表。默认值：0（四边均为 0）。 |

padding 对象属性（分别设置时）：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| top | number \| string | 否 | 上内边距。默认值：0。 |
| bottom | number \| string | 否 | 下内边距。默认值：0。 |
| left | number \| string | 否 | 左内边距。默认值：0。 |
| right | number \| string | 否 | 右内边距。默认值：0。 |

**示例：**

```json
{
  "id": "paddedBox",
  "component": "Text",
  "content": "内边距示例",
  "styles": {
    "padding": {
      "top": 12,
      "bottom": 12,
      "left": 16,
      "right": 16
    }
  }
}
```

---

### borderRadius

设置组件的圆角。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| borderRadius | number | 否 | 统一设置四角圆角半径。取值范围 [0, +∞)，默认单位 vp。默认值：0（无圆角）。 |
| borderRadius | string | 否 | 数值 + 单位字符串统一设置四角，如 "12vp"。支持 "fp"、"vp"、"%"。默认值：0。 |
| borderRadius | object | 否 | 分别设置四角圆角半径，见下表。默认值：0（四角均为 0）。 |

borderRadius 对象属性（分别设置时）：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| topLeft | number \| string | 否 | 左上圆角。默认值：0。 |
| topRight | number \| string | 否 | 右上圆角。默认值：0。 |
| bottomLeft | number \| string | 否 | 左下圆角。默认值：0。 |
| bottomRight | number \| string | 否 | 右下圆角。默认值：0。 |

**示例：**

```json
{
  "id": "roundedBox",
  "component": "Text",
  "content": "圆角示例",
  "styles": {
    "width": 200,
    "height": 80,
    "backgroundColor": "#007DFF",
    "borderRadius": 12
  }
}
```

---

### borderWidth

设置组件的边框宽度。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| borderWidth | number | 否 | 数值边框宽度。取值范围 [0, +∞)，默认单位 vp。默认值：0（无边框）。 |
| borderWidth | string | 否 | 数值 + 单位字符串，如 "2vp"。支持 "fp"、"vp"、"%"。默认值：0。 |

**示例：**

```json
{
  "id": "borderedBox",
  "component": "Text",
  "content": "边框示例",
  "styles": {
    "width": 200,
    "height": 80,
    "borderWidth": 2,
    "borderColor": "#007DFF",
    "borderRadius": 8
  }
}
```

---

### borderColor

设置组件的边框颜色。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| borderColor | string | 否 | 边框颜色。16 进制字符串（#RRGGBB 或 #AARRGGBB）。默认值：#000000。仅在 borderWidth > 0 时可见。 |

**示例：**

```json
{
  "id": "borderColorBox",
  "component": "Text",
  "content": "边框颜色示例",
  "styles": {
    "width": 200,
    "height": 80,
    "borderWidth": 2,
    "borderColor": "#007DFF",
    "borderRadius": 8
  }
}
```

---

### backgroundColor

设置组件的背景颜色。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| backgroundColor | string | 否 | 背景颜色。默认值：transparent（透明）。 |

**示例：**

```json
{
  "id": "coloredBox",
  "component": "Text",
  "content": "背景色示例",
  "styles": {
    "width": 200,
    "height": 80,
    "backgroundColor": "#F0F0F0",
    "borderRadius": 8,
    "padding": 12
  }
}
```

---

### backgroundImage

设置组件的背景图片。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| backgroundImage | string | 否 | 背景图片路径。默认值：""（空字符串，无背景图片）。 |

支持网络图片资源地址、本地图片资源地址、Base64和PixelMap资源，支持webp和gif类型的动图，显示动图第一帧，不支持其他类型的动图。

**示例：**

```json
{
  "id": "bgImageBox",
  "component": "Text",
  "content": "背景图片示例",
  "styles": {
    "width": 300,
    "height": 200,
    "backgroundImage": "resources/base/media/bg_pattern.png",
    "backgroundImageSizeWithStyle": "cover"
  }
}
```

---

### backgroundImageSizeWithStyle

设置背景图片的尺寸适配方式。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| backgroundImageSizeWithStyle | string | 否 | 字符串枚举值，见下表。默认值："auto"（保持原图比例）。 |
| backgroundImageSizeWithStyle | object | 否 | 指定宽高对象 { width, height }，见下表。默认值："auto"。 |

字符串枚举值：

| 值 | 说明 |
|------|------|
| cover | 保持宽高比进行缩小或放大，使得图片两边都大于或等于显示边界 |
| contain | 保持宽高比进行缩小或放大，使得图片完全显示在显示边界内 |
| auto | 保持原图的比例不变 |
| fill | 不保持宽高比进行放大缩小，使得图片充满显示边界 |

对象 { width, height } 属性：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| width | number \| string | 是 | 背景图片宽度。数值取值范围 [0, +∞)，默认单位 vp；字符串支持数值 + 单位（"100fp"），单位："fp"、"vp"、"%"。 |
| height | number \| string | 是 | 背景图片高度。数值取值范围 [0, +∞)，默认单位 vp；字符串支持数值 + 单位（"100fp"），单位："fp"、"vp"、"%"。 |

**示例：**

```json
{
  "id": "sizedBgImage",
  "component": "Text",
  "content": "图片尺寸控制",
  "styles": {
    "width": 300,
    "height": 200,
    "backgroundImage": "resources/base/media/bg.png",
    "backgroundImageSizeWithStyle": "cover"
  }
}
```

对象写法示例：

```json
{
  "id": "sizedBgImage2",
  "component": "Text",
  "content": "图片尺寸对象",
  "styles": {
    "backgroundImage": "resources/base/media/bg.png",
    "backgroundImageSizeWithStyle": {
      "width": "100%",
      "height": "100%"
    }
  }
}
```

---

### linearGradient

设置组件的线性渐变背景。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| linearGradient | object | 否 | 线性渐变配置对象。默认值：未设置时无渐变。 |

linearGradient 对象属性：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| angle | number | 否 | 线性渐变的起始角度。默认值：180。 |
| direction | string | 否 | 线性渐变的方向，与 angle 互斥。枚举值见下表。默认值：Bottom。 |
| colors | array | 是 | 渐变颜色数组。支持两种格式：① 每项为 ["#RRGGBB", stop]（stop 为 0~1 的位置比例）；② 每项为纯色值 "#RRGGBB"（stop 自动均分）。 |
| stops | array | 否 | 渐变位置数组，与 colors 配合使用。每项为 0~1 的数值，对应各颜色的位置比例。仅当 colors 使用纯色值格式时生效。 |
| repeating | boolean | 否 | 是否重复渐变。默认值：false。 |

direction 可选枚举值：

| 值 | 说明 |
|------|------|
| Left | 从右到左 |
| Right | 从左到右 |
| Top | 从下到上 |
| Bottom | 从上到下 |
| LeftTop | 从右下到左上 |
| LeftBottom | 从右上到左下 |
| RightTop | 从左下到右上 |
| RightBottom | 从左上到右下 |
| None | 无方向 |

**示例：**

```json
{
  "id": "gradientBox",
  "component": "Text",
  "content": "渐变背景",
  "styles": {
    "width": 300,
    "height": 120,
    "borderRadius": 12,
    "linearGradient": {
      "direction": "Right",
      "colors": [["#667EEA", 0], ["#764BA2", 1]]
    }
  }
}
```

---

### layoutWeight

设置组件在父容器中的弹性权重。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| layoutWeight | number | 否 | 弹性权重。仅在父容器为 [Row](row.md) / [Column](column.md) 时生效。默认值：1。负数或非有限值会被当作 0 处理。 |

当同级多个子组件设置了 layoutWeight 时，剩余空间按权重比例分配。

**示例：**

```json
{
  "id": "flexItem",
  "component": "Text",
  "content": "弹性权重",
  "styles": {
    "layoutWeight": 1,
    "backgroundColor": "#F0F0F0"
  }
}
```

---

### flexShrink

设置组件的弹性收缩比例。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| flexShrink | number | 否 | 弹性收缩比例。取值范围：[0, 1]，小于0的值按0处理，大于1的值按1处理。仅在父容器为 [Row](row.md) / [Column](column.md) 时生效。默认值：1。 |

当父容器空间不足时，设置了 flexShrink 的子组件会按比例收缩。0 表示不收缩。

**示例：**

```json
{
  "id": "shrinkableItem",
  "component": "Text",
  "content": "弹性收缩",
  "styles": {
    "flexShrink": 0.5,
    "width": 300
  }
}
```

---

### shadow

设置组件的阴影效果。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| shadow | object | 否 | 阴影配置对象，见下表。默认值：未设置时无阴影。 |
| shadow | string \| number | 否 | 预设阴影枚举字符串，见下表。默认值：未设置时无阴影。 |

对象形式属性：

shadow 对象属性：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| radius | number | 否 | 阴影模糊半径，单位 vp。取值范围：[0, +∞)。设置小于 0 的值时，按值为 0 处理。对象形式只需至少设置 1 个字段，未设置 radius 时按 0 处理。默认值：0。 |
| color | string | 否 | 阴影颜色。16 进制字符串（#RRGGBB 或 #AARRGGBB）。默认值：黑色（深浅色自适应）。 |
| offsetX | number | 否 | 阴影 X 轴偏移量，单位 vp。默认值：0。 |
| offsetY | number | 否 | 阴影 Y 轴偏移量，单位 vp。默认值：0。 |
| fill | boolean | 否 | 阴影是否内部填充。true 表示内部填充，false 表示外部填充。默认值：false。 |
| type | string | 否 | 阴影类型。枚举值："color"（颜色阴影）、"blur"（模糊阴影）。默认值："color"。 |
| style | string \| number | 否 | 在对象内使用预设阴影样式，优先级高于其他字段。枚举值见下表预设枚举。 |

字符串枚举值（预设阴影）：

| 值 | 说明 |
|------|------|
| outerDefaultXS | 超小阴影 |
| outerDefaultSM | 小阴影 |
| outerDefaultMD | 中阴影 |
| outerDefaultLG | 大阴影 |
| outerFloatingSM | 浮动小阴影 |
| outerFloatingMD | 浮动中阴影 |

也支持数字枚举（0~5），对应上述预设值顺序。

**示例：**

对象形式：

```json
{
  "id": "shadowBox",
  "component": "Text",
  "content": "阴影效果",
  "styles": {
    "width": 200,
    "height": 80,
    "backgroundColor": "#FFFFFF",
    "borderRadius": 12,
    "shadow": {
      "radius": 16,
      "color": "#33000000",
      "offsetX": 0,
      "offsetY": 4,
      "fill": true,
      "type": "color"
    }
  }
}
```

预设枚举形式：

```json
{
  "id": "presetShadowBox",
  "component": "Text",
  "content": "预设阴影",
  "styles": {
    "shadow": "outerFloatingSM"
  }
}
```

---

### visibility

设置组件的可见性。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| visibility | string | 否 | 可见性状态。默认值："visible"。 |

可选枚举值：

| 值 | 说明 |
|------|------|
| visible | 可见 |
| hidden | 不可见但占位 |
| none | 不可见也不占位 |

**示例：**

```json
{
  "id": "hiddenBox",
  "component": "Text",
  "content": "隐藏示例",
  "styles": {
    "visibility": "hidden"
  }
}
```

---

### clip

设置组件是否裁剪超出边界的内容。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| clip | boolean | 否 | 是否裁剪。默认值：false（不裁剪）。 |

当 borderRadius 大于 0 时，通常建议同时设置 clip: true 以确保内容不会超出圆角边界。

**示例：**

```json
{
  "id": "clippedBox",
  "component": "Image",
  "src": "resources/base/media/photo.png",
  "styles": {
    "width": 200,
    "height": 200,
    "borderRadius": 100,
    "clip": true
  }
}
```

---

### 通用样式异常值与容错

通用样式的异常值容错由运行时的样式解析层统一处理，遵循以下规则（不会中断渲染，并通过 [错误回调](../errors.md#注册错误回调) 上报告警）：

- **字段缺失**（未设置）→ 不应用该样式，等同使用默认值，不产生告警。
- **字段存在但取值非法**（类型不符、数值越界、非合法枚举、格式错误等）→ 该样式被**重置为组件的原生默认值**（见下表"重置后默认值"列）并上报一条告警；**不会把非法值强转为某个具体值**。
- 除下表"说明"中注明的少数情况外，**不做类型强转**：布尔 / 对象当数值用、未知单位或未知枚举字符串等都会被判定为非法并重置。
- 个别样式对越界数值**调整到有效范围或替换为有效值**（如 flexShrink、layoutWeight、shadow.radius、渐变 stop），而非重置。

各通用样式的具体行为：

| 样式 | 重置后默认值 | 非法值判定与特殊处理 |
|------|------------|------|
| width / height | 自适应内容 | 类型不符、负数、NaN/Infinity、未知单位（如 px）、不可解析字符串 → 重置。接受 number、vp/fp/%/裸数字、关键字 matchParent/wrapContent/fixAtIdealSize（大小写与 -/_ 不敏感） |
| constraintSize | 无约束 | 非 object → 重置；4 个字段均可选，缺省 minWidth/minHeight=0、maxWidth/maxHeight=不限；任一字段类型不符/越界/单位不支持 → 整个对象重置；**min > max 不做校验**，直接透传 |
| margin / padding | 0 | 负数 / 非有限 → 重置；对象缺某边 → 该边按 0；简写字符串非 1~4 段或含坏段 → 重置；% 与 vp 混用（非零边）→ 重置 |
| borderRadius | 0 | 同 margin/padding；对象缺某角 → 该角按 0；混用单位 → 重置 |
| borderWidth | 0 | 仅 number/string（**无对象形式、无 px**）；单位仅 vp/fp/%，其它 → 重置 |
| borderColor | 黑（#000000） | 仅 #RRGGBB/#AARRGGBB（6 或 8 位 hex）或 number；#RGB、命名色（如 red）、rgb()、缺 # → 重置 |
| backgroundColor | 透明 | 同 borderColor |
| backgroundImage | 无背景图 | 仅 string（trim 后透传）；**空串/纯空白会被接受并透传**，能否加载由下游决定 |
| backgroundImageSizeWithStyle | 原生默认（auto） | 字符串非 cover/contain/auto/fill → 重置（**不回退 auto**）；对象 {width,height} 仅 vp/fp/% 且需 ≥0、有限，负/NaN → 重置，缺一维 → 该维按 0 |
| linearGradient | 无渐变 | 非 object → 重置；direction 非法或非 string → 重置；repeating 非 bool → 重置；colors 缺/非数组/空 → 重置；**单条坏 stop 会被跳过**（其余 stop 仍生效）；stop 小于0按0处理、大于1按1处理，且强制单调递增；颜色非合法 hex → 该 stop 跳过 |
| layoutWeight | 原生默认 | 类型不符（布尔/对象/"2vp" 等）→ 重置；**负数、NaN/Infinity 静默按 0 应用**（不重置）；0 < w < 1 截断为 0 |
| flexShrink | 1 | 合法有限值 → 小于0按0处理、大于1按1处理；非 number/非数字串/非有限 → 重置 |
| shadow | 无阴影 | number 需为预设序号 0~5（否则重置）；string 需为合法预设名（否则重置）；object 需至少 1 个字段（**radius 非必填**，未设置时按 0），radius 负数按0处理，offsetX/offsetY 任意有限值，type/fill/color 取值非法 → 重置 |
| visibility | visible | 仅 visible/hidden/none（大小写不敏感）；非 string 或未知值 → 重置为原生默认 |
| clip | false | 仅 boolean；非 bool（数字/字符串/对象）→ 重置，**无强转**（1、"true" 均不认） |

> 注：上表是**通用样式在运行时的实际容错行为**（由样式解析层决定）。[Schema 校验](../schema-validation.md)中的"组件属性校验"描述的是 ArkTS 通用校验器的能力，该通用校验器在运行时并不逐字段校验通用样式；通用样式以本表为准。

---

## 不支持的属性如何处理

扩展组件采用**容错优先**策略：当某个属性（含 styles、事件属性、accessibility 等）字段未定义、取值非法或类型不匹配时，**不会中断整个 Surface 的渲染**，而是降级处理后继续，同时通过错误回调上报告警以便排查。

常见情况与系统行为：

| 情况 | 系统行为 | 上报 |
|------|----------|------|
| 字段未在 schema 定义（拼写错误或组件不支持该属性） | 忽略并移除该字段，组件按其余属性正常渲染 | schema warning ERROR_CODE_UNDEFINED_FIELD |
| 必填属性缺失 | 回退默认值；若缺失的是 id 或 component，则丢弃整个组件项 | schema warning ERROR_CODE_REQUIRED_MISS |

> 完整校验规则与错误信息见 [Schema 校验](../schema-validation.md)，事件链容错见 [交互与函数 → 异常与容错](../../concepts/actions-and-functions.md#异常与容错)。通用样式（styles）各类非法值的具体处理见 [通用样式异常值与容错](#通用样式异常值与容错)。

### 如何感知

通过 [registerErrorCallback](../errors.md#注册错误回调) 捕获告警，重点关注：

- ERROR_SCHEMA_WARNING(2001)：DSL 字段不符合 Schema，errorMsg 内的 warnings[] 会列出每个被忽略或降级的字段及其路径。

### 排查与解决建议

1. **属性不生效或被忽略** → 对照组件文档核对字段名、类型与枚举值，修正拼写与取值。
2. **样式不生效** → 确认该样式属性在当前组件上受支持（见 [styles 通用样式](#styles-通用样式)），并确认是否需配合其他属性（如 clip 配合 borderRadius）。
3. **事件无响应** → 参考 [故障排查](../../guides/troubleshooting.md)。
4. **扩展组件确实缺少所需能力** → 通过 [自定义组件](../../guides/creating-custom-components.md) 扩展 UI，或通过 [自定义函数](../../guides/creating-custom-functions.md) 扩展逻辑。

---

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
