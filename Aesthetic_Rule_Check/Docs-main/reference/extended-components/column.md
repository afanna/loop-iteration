# Column 组件

沿垂直方向布局的容器组件。

## 特有属性

除支持 [通用属性](overview.md#通用属性) 和 [styles 通用样式](overview.md#styles-通用样式)，还支持以下字段：

| 字段 | 说明 |
|------|------|
| [children](#children) | 子组件 id 列表或模板对象 |
| [itemMargin](#itemmargin) | 纵向布局子元素与子元素间垂直方向间距 |
| [styles.justifyContent](#justifycontent) | 设置子组件在垂直方向上的对齐格式 |
| [styles.alignItems](#alignitems) | 设置子组件在水平方向上的对齐格式 |

### children

子组件 id 列表，使用字符串数组（每项为 [ComponentId](../types.md#componentid)）表示固定的子组件集合，或使用模板对象从数据列表生成子组件。模板对象详见 [ChildList](../types.md#childlist) 的定义。

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| children | [ChildList](../types.md#childlist) | 否 | 子组件 id 列表，支持[静态子组件列表](../types.md#静态子组件列表)或[动态模板](../types.md#动态模板) { componentId, path }。默认值：[]。未设置 children 时渲染为空容器。 |

#### 模板对象

模板对象是 [ChildList](../types.md#childlist) 的第二种写法，适合“根据一组数据重复生成多个子组件”的场景。

- componentId：引用同一 components 数组中定义的模板组件 [ComponentId](../types.md#componentid)。id 等于 componentId 的组件描述符就是模板描述符。
- path：使用 [DataBinding](../types.md#databinding) 中同样的 JSON Pointer 写法，指向 DataModel 里的数组，例如 /items。
- 模板组件需要单独在 components 中定义，不能直接内联写在 children 里；模板本体通常可以是 [Text](text.md)、[Image](image.md) 等任意已声明组件。
- 运行时会读取 path 指向的数组，并按 componentId 对应的模板为数组中的每一项生成一个子组件实例。

**示例：**

下面示例给 Column 设置了固定高度，并放入 3 个子文本块。将 justifyContent 改成 center、end、spaceBetween 或 spaceEvenly 后，可以直接观察子组件在纵向上的位置变化。

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "column_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "column_surface",
    "components":[
      {
        "component": "Column",
        "id": "root",
        "children": ["top", "center", "bottom"]
      },
      { "component": "Text", "id": "top", "content": "上方文本" },
      { "component": "Text", "id": "center", "content": "中间文本" },
      { "component": "Text", "id": "bottom", "content": "下方文本" }
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
    "surfaceId": "column_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version":"v0.9",
  "updateDataModel":{
    "surfaceId":"column_surface",
    "value":{
      "items":[
        {"name":"Alpha"},
        {"name":"Beta"},
        {"name":"Gamma"}
      ]
    }
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "column_surface",
    "components":[
      {
        "id":"root",
        "component":"Column",
        "children":{"componentId":"itemTemplate","path":"/items"}
      },
      {
        "id":"itemTemplate",
        "component":"Text",
        "content":{"path":"name"}
      }
    ]
  }
}
]
```
---

#### 嵌套模板

componentId 指向的模板描述符可以是容器组件（如 Column、Row），该容器的 children 也可以继续使用模板对象，形成嵌套模板。内层模板的 path 使用相对路径（不带前导 /），相对于当前数据项解析。

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "nested_column_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateDataModel": {
    "surfaceId": "nested_column_surface",
    "value": {
      "groups": [
        { "title": "水果", "items": [{ "name": "苹果" }, { "name": "香蕉" }] },
        { "title": "蔬菜", "items": [{ "name": "西红柿" }, { "name": "黄瓜" }] }
      ]
    }
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "nested_column_surface",
    "components": [
      {
        "id": "root",
        "component": "Column",
        "children": { "componentId": "groupTemplate", "path": "/groups" }
      },
      {
        "id": "groupTemplate",
        "component": "Column",
        "children": ["groupTitle", "itemColumn"]
      },
      {
        "id": "groupTitle",
        "component": "Text",
        "content": { "path": "title" }
      },
      {
        "id": "itemColumn",
        "component": "Column",
        "children": { "componentId": "itemTemplate", "path": "items" }
      },
      {
        "id": "itemTemplate",
        "component": "Text",
        "content": { "path": "name" }
      }
    ]
  }
}
]
```

上例中：
- 外层 Column 遍历 /groups，为每个分组生成一组组件，{ "path": "title" } 显示分组标题（如"水果"）
- 每个分组内又有一个 Column，遍历该分组的 items，{ "path": "name" } 显示商品名（如"苹果"）
- 内层 path 是 "items" 而非 "/items"——没有前导 / 表示"取当前数据项的子字段"

#### children 运行时行为

- 静态数组模式下，按数组顺序附加子组件。
- 模板对象模式下，componentId 引用模板组件 [ComponentId](../types.md#componentid)，path 使用 [DataBinding](../types.md#databinding) 中同样的 JSON Pointer 写法指向数组数据。
- 运行时会读取 path 指向的数组，并按 componentId 对应的模板为数组中的每一项生成一个子组件实例。若模板缺失或数据不是数组，则本次按空容器处理。
- 内层模板的 path 可使用相对路径（不带前导 /），相对于当前数据项解析。

---

### itemMargin

纵向布局子元素与子元素间垂直方向间距。itemMargin 为负数或者 justifyContent 设置为 "spaceBetween"、"spaceAround"、"spaceEvenly" 时，itemMargin 不生效。默认值：8vp，非法值按默认值处理。单位：vp。

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| itemMargin | number | 否 | 纵向布局子元素与子元素间垂直方向间距。<br/>默认值：8vp。 |

**示例：**

```json
[
  {
    "version": "v0.9",
    "createSurface": {
      "surfaceId": "column_surface",
      "catalogId": "ohos.a2ui.extended.catalog"
    }
  },
  {
    "version": "v0.9",
    "updateComponents": {
      "surfaceId": "column_surface",
      "components": [
        {
          "component": "Column",
          "id": "root",
          "itemMargin": 5,
          "children": [
            "columnItemOne",
            "columnItemTwo",
            "columnItemThree"
          ]
        },
        { "component": "Text", "id": "columnItemOne", "content": "columnItemOne" },
        { "component": "Text", "id": "columnItemTwo", "content": "columnItemTwo" },
        { "component": "Text", "id": "columnItemThree", "content": "columnItemThree" }
      ]
    }
  }
]
```
---

### justifyContent

定义子组件在垂直方向上的对齐格式。

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| styles.justifyContent | string | 否 | 定义子组件在垂直方向上的对齐格式。 <br/> 取值范围：支持"start"、"center"、"end"、"spaceAround"、"spaceBetween"、"spaceEvenly"，非法字符串按默认值处理。 <br> 默认值："start"  |

可选字符串枚举值的具体说明如下：

| 名称 | 值 | 说明 |
|----|---------|------|
| "start" | - | 元素在主轴方向首端对齐，第一个元素与行首对齐，后续元素与前一个对齐。 |
| "center" | - | 元素在主轴方向中心对齐，第一个元素与行首的距离和最后一个元素与行尾的距离相同。 |
| "end" | - | 元素在主轴方向尾部对齐，最后一个元素与行尾对齐，其余元素与后一个对齐。 |
| "spaceAround" | - | 主轴方向均匀分配弹性元素。每个元素两侧的间距相等，因此首尾与容器边缘的间距是相邻元素之间间距的一半。 |
| "spaceBetween" | - | 主轴方向均匀分配弹性元素。第一个元素与起始边对齐，最后一个元素与结束边对齐，剩余空间均匀分布在相邻元素之间。 |
| "spaceEvenly" | - | 主轴方向均匀分配弹性元素，相邻元素之间的距离、第一个元素与行首的间距、最后一个元素到行尾的间距均相同。 |

单独声明一个没有 children 的 Column 时，看不到 justifyContent 的布局效果。要观察差异，通常需要至少 2 到 3 个子组件，并给容器预留足够高度。下面示例额外设置了 alignItems: "center"，这样可以避免左右方向的默认对齐干扰，更容易观察 justifyContent 在主轴方向上的效果。

**示例：**

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "column_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "column_surface",
    "components":[
      {
        "component": "Column",
        "id": "root",
        "children": [
          "columnItemOne",
          "columnItemTwo",
          "columnItemThree"
        ],
        "styles": {
          "alignItems": "center",
          "justifyContent": "spaceBetween",
          "width": 220,
          "height": 280,
          "backgroundColor": "#F3F6FA"
        }
      },
      {
        "component": "Text",
        "id": "columnItemOne",
        "content": "顶部块",
        "styles": {
          "width": 180,
          "height": 40,
          "backgroundColor": "#DCEAFE"
        }
      },
      {
        "component": "Text",
        "id": "columnItemTwo",
        "content": "中间块",
        "styles": {
          "width": 180,
          "height": 40,
          "backgroundColor": "#DBEAFE"
        }
      },
      {
        "component": "Text",
        "id": "columnItemThree",
        "content": "底部块",
        "styles": {
          "width": 180,
          "height": 40,
          "backgroundColor": "#BFDBFE"
        }
      }
    ]
  }
}
]
```

---

### alignItems

定义子组件在水平方向上的对齐格式。

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| styles.alignItems | string | 否 | 定义子组件在水平方向上的对齐格式。 <br/> 取值范围：支持"start"、"center"、"end"，非法字符串按默认值处理。 <br> 默认值："start"  |

可选字符串枚举值的具体说明如下：

| 名称 | 值 | 说明 |
|----|---------|------|
| "start" | - | 按照语言方向起始端对齐，默认对齐方式。 |
| "center" | - | 居中对齐。 |
| "end" | - | 按照语言方向末端对齐。 |

单独声明一个没有 children 的 Column 时，看不到 alignItems 的布局效果。要观察差异，通常需要让容器宽度大于子组件宽度。

**示例：**

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "column_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "column_surface",
    "components":[
      {
        "component": "Column",
        "id": "root",
        "children": [
          "leftBlock",
          "middleBlock",
          "rightBlock"
        ],
        "styles": {
          "alignItems": "center",
          "width": 220,
          "backgroundColor": "#F3F6FA"
        }
      },
      {
        "component": "Text",
        "id": "leftBlock",
        "content": "子项一",
        "styles": {
          "width": 140,
          "height": 36,
          "backgroundColor": "#DCEAFE"
        }
      },
      {
        "component": "Text",
        "id": "middleBlock",
        "content": "子项二",
        "styles": {
          "width": 140,
          "height": 36,
          "backgroundColor": "#DBEAFE"
        }
      },
      {
        "component": "Text",
        "id": "rightBlock",
        "content": "子项三",
        "styles": {
          "width": 140,
          "height": 36,
          "backgroundColor": "#BFDBFE"
        }
      }
    ]
  }
}
]
```

---

## 异常值与边界处理

- justifyContent 非法时回退为 start。
- alignItems 非法时回退为 start。
- itemMargin 为负数或非法值时回退为 8。
- 当 justifyContent 为 spaceAround、spaceBetween 或 spaceEvenly 时，itemMargin 不生效。

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
          "const": "Column"
        },
        "children": {
          "$ref": "../common_types.json#/$defs/ChildList",
          "description": "Child component IDs or a template child list."
        },
        "itemMargin": {
          "type": "number",
          "description": "Vertical spacing between child components. Ignored when justifyContent is spaceAround, spaceBetween, or spaceEvenly."
        },
        "styles": {
          "description": "Styles for Column. Includes shared extended component styles and Column-specific layout styles.",
          "allOf": [
            {
              "$ref": "../common_types.json#/$defs/ExtendedCommonStyles"
            },
            {
              "type": "object",
              "properties": {
                "justifyContent": {
                  "description": "Vertical distribution of child components along the main axis.",
                  "oneOf": [
                    {
                      "type": "string",
                      "enum": [
                        "start",
                        "center",
                        "end",
                        "spaceAround",
                        "spaceBetween",
                        "spaceEvenly"
                      ],
                      "default": "start"
                    },
                    {
                      "$ref": "../common_types.json#/$defs/DataBinding"
                    },
                    {
                      "allOf": [
                        {
                          "$ref": "../common_types.json#/$defs/FunctionCall"
                        },
                        {
                          "properties": {
                            "returnType": {
                              "const": "string"
                            }
                          }
                        }
                      ]
                    }
                  ]
                },
                "alignItems": {
                  "description": "Horizontal alignment of child components on the cross axis.",
                  "oneOf": [
                    {
                      "type": "string",
                      "enum": [
                        "start",
                        "center",
                        "end"
                      ],
                      "default": "start"
                    },
                    {
                      "$ref": "../common_types.json#/$defs/DataBinding"
                    },
                    {
                      "allOf": [
                        {
                          "$ref": "../common_types.json#/$defs/FunctionCall"
                        },
                        {
                          "properties": {
                            "returnType": {
                              "const": "string"
                            }
                          }
                        }
                      ]
                    }
                  ]
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
