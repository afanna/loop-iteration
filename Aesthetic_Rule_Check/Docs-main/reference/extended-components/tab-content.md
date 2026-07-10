# TabContent 组件

用于定义单个页签项的标题、图标、页签私有样式以及页签对应内容，通常与 [Tabs](tabs.md) 组合使用。

## 使用前提

通常与 [Tabs](tabs.md) 组合使用。两者都属于扩展 Catalog 内置组件。创建控制器时使用 CatalogFactory.extended()，并在 createSurface 中使用 ohos.a2ui.extended.catalog。

```ts
import {
  CatalogFactory,
  SurfaceControllerFactory
} from '@arkui-genius/genui'

const controller = SurfaceControllerFactory.createSurfaceController({
  uiContext: uiContext,
  catalog: CatalogFactory.extended()
})
```

## 字段类型区分

除支持 [通用属性](overview.md#通用属性) 和 [styles 通用样式](overview.md#styles-通用样式)，还支持以下字段：

| 字段名 | 字段类型 | 说明 |
|------|------|------|
| [title](#title) | 属性 | 页签标题 |
| [icon](#icon) | 属性 | 默认态图标 |
| [selectedSrc](#selectedsrc) | 属性 | 选中态图标 |
| [tabType](#tabtype) | 属性 | 页签样式（capsule / underline） |
| [children](#children) | 属性 | 子组件列表或模板 |
| [styles.selectedColor](#stylesselectedcolor) | 私有样式 | 选中态标题文字颜色 |
| [styles.unSelectedColor](#stylesunselectedcolor) | 私有样式 | 非选中态标题文字颜色 |
| [styles.defaultBackgroundColor](#stylesdefaultbackgroundcolor) | 私有样式 | 非选中态页签背景色 |
| [styles.selectedBackgroundColor](#stylesselectedbackgroundcolor) | 私有样式 | 选中态页签背景色 |
| [styles.defaultBorderColor](#stylesdefaultbordercolor) | 私有样式 | 非选中态页签边框色 |
| [styles.selectedBorderColor](#stylesselectedbordercolor) | 私有样式 | 选中态页签边框色 |
| [styles.fontSize](#stylesfontsize) | 私有样式 | 标题字号 |
| [styles.fontWeight](#stylesfontweight) | 私有样式 | 标题字重 |
| [styles.iconSize](#stylesiconsize) | 私有样式 | 图标尺寸 |
| [styles.space](#stylesspace) | 私有样式 | 图标与标题间距 |

说明：
- 以下参数说明以鸿蒙扩展协议的 TabContent 字段定义为准。
- TabContent 会把标题、图标和样式信息提供给 [Tabs](tabs.md) 使用；页签栏最终视觉默认值由 [Tabs](tabs.md) 侧兜底。

## 属性字段

### title

页签标题文本。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | [DynamicString](../types.md#dynamicstring) | 否 | 支持静态字符串、[DataBinding](../types.md#databinding) 路径绑定和返回字符串的 [FunctionCall](../functions/functioncall.md)。未传或解析失败时回退为空字符串。 |

说明：
- 适合放简短标题文案，例如 "首页"、"Orders"。
- 模板场景下可直接传 { "path": "title" } 之类的动态值。

### icon

默认态图标资源。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| icon | [DynamicString](../types.md#dynamicstring) | 否 | 默认状态下显示的图标地址或资源字符串。未传或解析失败时按无图标处理。 |

说明：
- 可传网络地址、资源路径或业务约定的图标字符串。
- 当 selectedSrc 未配置时，选中态仍会继续显示 icon。

### selectedSrc

选中态图标资源。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| selectedSrc | [DynamicString](../types.md#dynamicstring) | 否 | 页签处于选中状态时优先显示的图标地址或资源字符串。未传、为空或解析失败时不单独覆盖选中态图标。 |

说明：
- 适合与 icon 成对使用，分别提供默认态和选中态图标。
- 当该字段为空时，运行时会回退显示 icon。

### tabType

页签样式类型。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tabType | [DynamicString](../types.md#dynamicstring) | 否 | 页签样式。建议只传 capsule 或 underline。未传、为空或解析失败时按空字符串处理。 |

说明：
- capsule 表示胶囊型标签。
- underline 表示下划线型标签。
- 文档层建议只使用这两个合法枚举值；空字符串表示不指定页签样式。

### children

多个内容组件或模板入口。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| children | [ChildList](../types.md#childlist) | 否 | 子组件 id 列表，支持[静态子组件列表](../types.md#静态子组件列表)或[动态模板](../types.md#动态模板)。适合一个页签内挂载多个组件，或按数据模板生成内容。默认值：[]。未配置时，当前页签内容区不会挂载额外子组件。 |

说明：
- 静态列表场景可传 ["text1", "button1"]。
- 模板场景沿用通用 [ChildList](../types.md#childlist) 约定，componentId 指向同一 components 列表中的模板描述符。
- children 适合一个页签内需要按顺序组织多个组件的场景。
- 当前 TabContent 示例和 schema 都以 children 为准。

## 私有样式字段（styles）

说明：
- styles 同时支持 [通用样式](overview.md#styles-通用样式)，以下仅列出 TabContent 的专用私有样式字段。
- 运行时优先读取 styles.<field>。
- 协议字段以 styles 内的字段为准，例如 styles.selectedColor、styles.fontSize。
- 样式字段未设置、解析失败或传入非法值时，最终由 [Tabs](tabs.md) 使用协议默认值或自己的默认视觉样式兜底。

### styles.selectedColor

选中态标题文字颜色。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.selectedColor | [DynamicString](../types.md#dynamicstring) | 否 | 当前页签被选中时的标题文字颜色。建议传 16 进制颜色字符串，例如 #FF1E40AF。未设置或未生效时，最终由 [Tabs](tabs.md) 使用默认值：浅色模式 #1F64FF，深色模式 #F4F8FF。 |

说明：
- 优先接受非空字符串。
- 如果传 [DataBinding](../types.md#databinding) 或 [FunctionCall](../functions/functioncall.md)，并且最终能解析出非空字符串，也会生效。
- 解析失败、空字符串或类型不匹配时，该字段会被忽略。

### styles.unSelectedColor

非选中态标题文字颜色。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.unSelectedColor | [DynamicString](../types.md#dynamicstring) | 否 | 当前页签未选中时的标题文字颜色。建议传 16 进制颜色字符串，例如 #FF475569。未设置或未生效时，最终由 [Tabs](tabs.md) 使用默认值：浅色模式 #182431，深色模式 #DADDE2。 |

说明：
- 解析顺序与 styles.selectedColor 一致。
- 未生效时由 [Tabs](tabs.md) 使用默认未选中颜色。

### styles.defaultBackgroundColor

非选中态页签背景色。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.defaultBackgroundColor | [DynamicString](../types.md#dynamicstring) | 否 | 页签处于未选中状态时的背景色。建议传 16 进制颜色字符串。 |

说明：
- 主要影响页签栏中的单个 tab bar item。
- 背景色只记录到页签元数据中，最终由 [Tabs](tabs.md) 渲染页签栏时消费。

### styles.selectedBackgroundColor

选中态页签背景色。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.selectedBackgroundColor | [DynamicString](../types.md#dynamicstring) | 否 | 页签处于选中状态时的背景色。建议传 16 进制颜色字符串。 |

说明：
- 与 styles.defaultBackgroundColor 配合使用，可以区分选中/未选中视觉态。
- 解析失败时该字段会被忽略，最终回到 [Tabs](tabs.md) 的默认选中背景逻辑。

### styles.defaultBorderColor

非选中态页签边框色。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.defaultBorderColor | [DynamicString](../types.md#dynamicstring) | 否 | 页签处于未选中状态时的边框颜色。建议传 16 进制颜色字符串。 |

说明：
- 该字段通常与 tabType: "capsule" 搭配更容易观察到效果。
- 当未设置或解析失败时，边框色交由 [Tabs](tabs.md) 默认值处理。

### styles.selectedBorderColor

选中态页签边框色。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.selectedBorderColor | [DynamicString](../types.md#dynamicstring) | 否 | 页签处于选中状态时的边框颜色。建议传 16 进制颜色字符串。 |

说明：
- 适合与 styles.defaultBorderColor 配套设置。
- 仅记录元数据，不直接在 TabContent 本体上绘制边框。

### styles.fontSize

标题字号。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.fontSize | number | 否 | 页签标题字号。接受有限数值，也兼容可解析为数字的字符串和动态数值。默认值：16。 |

说明：
- 最终用于页签标题文本字号。
- 不额外限制范围，但非法值会被忽略，最终由 [Tabs](tabs.md) 使用默认字号 16。

### styles.fontWeight

标题字重。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.fontWeight | number \| string | 否 | 支持数字字重、数字字符串，或枚举字符串 lighter / normal / regular / medium / bold / bolder。默认值：500。 |

说明：
- 会先尝试直接标准化，再尝试解析动态值。
- 只要能归一化为合法字重，就会写入页签元数据。
- 未设置或非法时，最终回退到 500。

### styles.iconSize

图标尺寸。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.iconSize | number | 否 | 页签图标宽高，单位 vp。接受有限数值，也兼容可解析为数字的字符串和动态数值。默认值：16。 |

说明：
- 最终由 [Tabs](tabs.md) 同时作为图标的 width 和 height 使用。
- 不做额外上下限校验，非法值会被忽略，最终由 [Tabs](tabs.md) 使用默认尺寸 16。

### styles.space

图标与标题间距。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.space | number | 否 | 图标与标题文字之间的间距，单位 vp。接受有限数值，也兼容可解析为数字的字符串和动态数值。默认值：0。 |

说明：
- 最终用于页签栏中图标与标题之间的间距布局。
- 传 0 表示图标和文字紧贴；传更大的值会增大两者间距。
- 非法值会被忽略，最终由 [Tabs](tabs.md) 使用默认间距 0。

## 异常值与边界处理

- title、icon、selectedSrc 解析失败时回退到默认值。
- tabType 未设置或解析失败时按空字符串处理。
- fontWeight 非法时回退为 500。
- fontSize、iconSize、space 非法时不写入元数据，最终由 [Tabs](tabs.md) 使用默认值；其中 fontSize 默认值为 16，iconSize 默认值为 16，space 默认值为 0。

## 运行时行为

- 组件首次出现和属性更新时，会重新解析 title、icon、selectedSrc、tabType 以及私有样式，并同步给 [Tabs](tabs.md) 的页签栏。
- 组件移除时，对应页签的元数据也会一起移除。
- 组件本体内容区域会根据主题模式设置背景色：浅色模式为 #FFFFFF，深色模式为 #171E2B。
- title、icon、selectedSrc 支持静态字符串和动态字符串；解析失败时回退到默认值。
- 样式默认值以协议为准：fontSize 为 16，fontWeight 为 500，iconSize 为 16，space 为 0；颜色类字段未生效时由 [Tabs](tabs.md) 使用默认视觉样式。

## 示例

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "tab-content-surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "tab-content-surface",
    "components": [
      {
        "id": "root",
        "component": "Tabs",
        "children": ["tabOrders"]
      },
      {
        "id": "tabOrders",
        "component": "TabContent",
        "title": "Orders",
        "icon": "https://img.icons8.com/ios-filled/50/0284c7/settings.png",
        "selectedSrc": "https://img.icons8.com/ios-filled/50/0ea5e9/settings.png",
        "tabType": "underline",
        "styles": {
          "selectedColor": "#FF0369A1",
          "unSelectedColor": "#FF6B7280",
          "defaultBackgroundColor": "#00FFFFFF",
          "selectedBackgroundColor": "#112563EB",
          "defaultBorderColor": "#00FFFFFF",
          "selectedBorderColor": "#FF1D4ED8",
          "fontSize": 16,
          "fontWeight": 500,
          "iconSize": 16,
          "space": 0
        },
        "children": ["ordersContent"]
      },
      {
        "id": "ordersContent",
        "component": "Text",
        "content": "订单页内容"
      }
    ]
  }
}
]
```

## 组件Schema

说明：
- 以下 Schema 片段展示的是当前文档附带的校验层定义。
- 若与上文“参数说明”存在差异，以上文的协议字段说明为准。

```json
{
  "type": "object",
  "$defs": {
    "NumericLike": {
      "oneOf": [
        { "$ref": "../common_types.json#/$defs/DynamicNumber" },
        { "type": "string", "pattern": "^-?(0|[1-9]\\d*)(?:\\.\\d+)?$" }
      ]
    },
    "FontWeightLike": {
      "oneOf": [
        { "type": "number" },
        { "type": "string", "enum": ["lighter", "normal", "regular", "medium", "bold", "bolder"] },
        { "type": "string", "pattern": "^-?(0|[1-9]\\d*)(?:\\.\\d+)?$" },
        { "$ref": "../common_types.json#/$defs/DataBinding" },
        {
          "allOf": [
            { "$ref": "../common_types.json#/$defs/FunctionCall" },
            { "properties": { "returnType": { "const": "string" } } }
          ]
        },
        {
          "allOf": [
            { "$ref": "../common_types.json#/$defs/FunctionCall" },
            { "properties": { "returnType": { "const": "number" } } }
          ]
        }
      ]
    }
  },
  "allOf": [
    { "$ref": "../common_types.json#/$defs/ComponentCommon" },
    { "$ref": "../common_types.json#/$defs/CatalogComponentCommon" },
    {
      "type": "object",
      "properties": {
        "component": { "const": "TabContent" },
        "title": { "$ref": "../common_types.json#/$defs/DynamicString" },
        "icon": { "$ref": "../common_types.json#/$defs/DynamicString" },
        "selectedSrc": { "$ref": "../common_types.json#/$defs/DynamicString" },
        "tabType": { "$ref": "../common_types.json#/$defs/DynamicString" },
        "styles": {
          "description": "Styles for TabContent. Includes shared extended component styles and TabContent-specific tab item metadata styles.",
          "allOf": [
            { "$ref": "../common_types.json#/$defs/ExtendedCommonStyles" },
            {
              "type": "object",
              "properties": {
                "selectedColor": { "$ref": "../common_types.json#/$defs/DynamicString" },
                "unSelectedColor": { "$ref": "../common_types.json#/$defs/DynamicString" },
                "defaultBackgroundColor": { "$ref": "../common_types.json#/$defs/DynamicString" },
                "selectedBackgroundColor": { "$ref": "../common_types.json#/$defs/DynamicString" },
                "defaultBorderColor": { "$ref": "../common_types.json#/$defs/DynamicString" },
                "selectedBorderColor": { "$ref": "../common_types.json#/$defs/DynamicString" },
                "fontSize": { "$ref": "#/$defs/NumericLike" },
                "fontWeight": { "$ref": "#/$defs/FontWeightLike" },
                "iconSize": { "$ref": "#/$defs/NumericLike" },
                "space": { "$ref": "#/$defs/NumericLike" }
              },
              "additionalProperties": true
            }
          ]
        },
        "children": { "$ref": "../common_types.json#/$defs/ChildList" }
      },
      "required": ["component"]
    }
  ],
  "additionalProperties": true
}
```
↑ [返回 Reference 总览](../../README.md#reference-api-速查)
