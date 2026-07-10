# Stack 组件

Stack为层叠布局容器组件，子组件在同一布局区域内按层叠方式显示。

## 特有属性

除支持 [通用属性](overview.md#通用属性) 和 [styles 通用样式](overview.md#styles-通用样式)，还支持以下特有属性：

| 特有属性 | 说明 |
|------|------|
| [children](#children) | 子组件 id 列表或模板对象 |

### children

子组件列表，支持静态 [ComponentId](../types.md#componentid) 数组或 [ChildList](../types.md#childlist) 模板对象。

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| children | [ChildList](../types.md#childlist) | 否 | 子组件 ID 列表，支持[静态子组件列表](../types.md#静态子组件列表)或[动态模板](../types.md#动态模板) { componentId, path }。默认值：[]。 |

**示例：**

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "stack_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "stack_surface",
    "components":[
      {
        "component":"Stack",
        "id":"root",
        "children":["bg", "title"]
      },
      {
        "component":"Image",
        "id":"bg",
        "src":"https://example.com/bg.png"
      },
      {
        "component":"Text",
        "id":"title",
        "content":"Stack标题"
      }
    ]
  }
}
]
```

使用模板对象从数据列表生成子组件。

建议先下发 updateDataModel，再下发引用该数组的 updateComponents。当前运行时如果先收到模板容器、后收到首次数组数据，通常还需要再补发一次容器的 updateComponents 才会生成首批实例。

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "stack_template_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateDataModel": {
    "surfaceId": "stack_template_surface",
    "value": {
      "cards": [
        { "title": "卡片标题 A" },
        { "title": "卡片标题 B" },
        { "title": "卡片标题 C" }
      ]
    }
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "stack_template_surface",
    "components": [
      {
        "id": "root",
        "component": "Stack",
        "children": { "componentId": "overlayItem", "path": "/cards" }
      },
      {
        "id": "overlayItem",
        "component": "Text",
        "content": { "path": "title" }
      }
    ]
  }
}
]
```

#### 嵌套模板

componentId 指向的模板描述符可以是容器组件（如 Column），该容器的 children 也可以继续使用模板对象，形成嵌套模板。内层模板的 path 使用相对路径（不带前导 /），相对于当前数据项解析。

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "nested_stack_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateDataModel": {
    "surfaceId": "nested_stack_surface",
    "value": {
      "layers": [
        { "name": "背景层", "overlays": [{ "label": "底图" }, { "label": "渐变" }] },
        { "name": "前景层", "overlays": [{ "label": "标题" }, { "label": "按钮" }] }
      ]
    }
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "nested_stack_surface",
    "components": [
      {
        "id": "root",
        "component": "Stack",
        "children": { "componentId": "layerTemplate", "path": "/layers" }
      },
      {
        "id": "layerTemplate",
        "component": "Column",
        "children": ["layerTitle", "itemStack"]
      },
      {
        "id": "layerTitle",
        "component": "Text",
        "content": { "path": "name" }
      },
      {
        "id": "itemStack",
        "component": "Stack",
        "children": { "componentId": "overlayItem", "path": "overlays" }
      },
      {
        "id": "overlayItem",
        "component": "Text",
        "content": { "path": "label" }
      }
    ]
  }
}
]
```

上例中：
- 外层 Stack 层叠显示各层，{ "path": "name" } 显示层名（如"背景层"）
- 每层内又有一个 Stack，遍历 overlays，{ "path": "label" } 显示叠加项（如"底图"）
- 内层 path 是 "overlays" 而非 "/overlays"——没有前导 / 表示"取当前数据项的子字段"

#### children 运行时行为

- 静态数组模式下，按数组顺序附加子组件。
- 模板对象模式下，componentId 引用模板组件 [ComponentId](../types.md#componentid)，path 使用 [DataBinding](../types.md#databinding) 中同样的 JSON Pointer 写法指向数组数据。
- 运行时会读取 path 指向的数组，并按 componentId 对应的模板为数组中的每一项生成一个子组件实例。若模板缺失或数据不是数组，则本次按空容器处理。
- 内层模板的 path 可使用相对路径（不带前导 /），相对于当前数据项解析。

---

## 特有样式

以下属性写在组件的 styles 中；styles 同时支持 [通用样式](overview.md#styles-通用样式)。

| 特有属性 | 说明 |
|------|------|
| [styles.alignContent](#aligncontent) | 子组件对齐方式 |

### alignContent

子组件对齐方式。

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| styles.alignContent | string | 否 | 子组件对齐方式。取值范围："topStart"、"top"、"topEnd"、"start"、"center"、"end"、"bottomStart"、"bottom"、"bottomEnd"。非法值回退为 "center"。<br/>默认值："center"。 |

可选字符串枚举值的具体说明如下：

| 名称 | 说明 |
|------|------|
| topStart | 顶部起始端 |
| top | 顶部横向居中 |
| topEnd | 顶部尾端 |
| start | 起始端纵向居中 |
| center | 横向和纵向居中 |
| end | 尾端纵向居中 |
| bottomStart | 底部起始端 |
| bottom | 底部横向居中 |
| bottomEnd | 底部尾端 |

## 异常值与边界处理

- alignContent 非法时回退为 center。
- children 支持组件 ID 数组或模板对象；空数组时不会触发额外兜底文案。

**示例：**

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "stack_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "stack_surface",
    "components":[
      {
        "component":"Stack",
        "id":"root",
        "children":["badge"],
        "styles": {
          "alignContent":"topEnd",
          "width": 220,
          "height": 120,
          "backgroundColor": "#F3F6FA"
        }
      },
      {
        "component":"Text",
        "id":"badge",
        "content":"角标",
        "styles": {
          "width": 56,
          "height": 28,
          "backgroundColor": "#DCEAFE"
        }
      }
    ]
  }
}
]
```

---

## 组件Schema

```json
{
  "type": "object",
  "allOf": [
    {
      "$ref": "../common_types.json#/$defs/ComponentCommon"
    },
    {
      "$ref": "../common_types.json#/$defs/CatalogComponentCommon"
    },
    {
      "type": "object",
      "properties": {
        "component": {
          "const": "Stack"
        },
        "children": {
          "$ref": "../common_types.json#/$defs/ChildList",
          "description": "Child list for Stack. Supports static child IDs array and template object {componentId, path} for dynamic expansion."
        },
        "styles": {
          "description": "Styles for Stack. Includes shared extended component styles and Stack-specific alignment styles.",
          "allOf": [
            {
              "$ref": "../common_types.json#/$defs/ExtendedCommonStyles"
            },
            {
              "type": "object",
              "properties": {
                "alignContent": {
                  "type": "string",
                  "description": "Child alignment mode in Stack.",
                  "enum": [
                    "topStart",
                    "top",
                    "topEnd",
                    "start",
                    "center",
                    "end",
                    "bottomStart",
                    "bottom",
                    "bottomEnd"
                  ],
                  "default": "center"
                }
              },
              "additionalProperties": true
            }
          ]
        }
      },
      "required": [
        "component"
      ]
    }
  ],
  "additionalProperties": true
}
```

---

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
