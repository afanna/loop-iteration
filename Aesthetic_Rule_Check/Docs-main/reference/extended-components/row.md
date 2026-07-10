# Row 组件

沿水平方向布局的容器组件。

**起始版本：**  API Version 20

## 特有属性

除支持 [通用属性](overview.md#通用属性) 和 [styles 通用样式](overview.md#styles-通用样式)，还支持以下特有字段：

| 特有字段 | 说明 |
|------|------|
| [children](#children) | 子组件 id 列表或模板对象 |
| [itemMargin](#itemmargin) | 横向布局元素水平方向间距 |
| [styles.justifyContent](#justifycontent) | 设置子组件在水平方向上的对齐格式 |
| [styles.alignItems](#alignitems) | 设置子组件在垂直方向上的对齐格式 |
| [styles.wrap](#wrap) | 定义 Row 是单行还是多行 |

### children

子组件 id 列表，使用字符串数组（每项为 [ComponentId](../types.md#componentid)）表示固定的子组件集合，或使用模板对象从数据列表生成子组件。模板对象详见 [ChildList](../types.md#childlist) 的定义。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| children | [ChildList](../types.md#childlist) | 否 | 子组件 id 列表，支持[静态子组件列表](../types.md#静态子组件列表)或[动态模板](../types.md#动态模板) { componentId, path }。默认值：[]。未设置 children 时渲染为空容器。 |

#### 模板对象

模板对象是 [ChildList](../types.md#childlist) 的第二种写法，适合“根据一组数据重复生成多个子组件”的场景。

- componentId：引用同一 components 数组中定义的模板组件 [ComponentId](../types.md#componentid)。id 等于 componentId 的组件描述符就是模板描述符。
- path：使用 [DataBinding](../types.md#databinding) 中同样的 JSON Pointer 写法，指向 DataModel 里的数组，例如 /items。
- 模板组件需要单独在 components 中定义，不能直接内联写在 children 里；模板本体通常可以是 [Text](text.md)、[Image](image.md) 等任意已声明组件。
- 运行时会读取 path 指向的数组，并按 componentId 对应的模板为数组中的每一项生成一个子组件实例。若模板缺失或数据不是数组，则本次按空容器处理。

**示例DSL：**

使用静态数组绑定子组件。

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "row_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "row_surface",
    "components":[
      {
        "component": "Row",
        "id": "root",
        "children": ["left", "center", "right"]
      },
      { "component": "Text", "id": "left", "content": "左侧文本" },
      { "component": "Text", "id": "center", "content": "中间文本" },
      { "component": "Text", "id": "right", "content": "右侧文本" }
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
    "surfaceId": "row_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version":"v0.9",
  "updateDataModel":{
    "surfaceId":"row_surface",
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
    "surfaceId": "row_surface",
    "components":[
      {
        "id":"root",
        "component":"Row",
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

#### 嵌套模板

componentId 指向的模板描述符可以是容器组件（如 Column、Row），该容器的 children 也可以继续使用模板对象，形成嵌套模板。内层模板的 path 使用相对路径（不带前导 /），相对于当前数据项解析。

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "nested_row_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateDataModel": {
    "surfaceId": "nested_row_surface",
    "value": {
      "categories": [
        { "label": "前端", "tags": [{ "name": "TypeScript" }, { "name": "Vue" }] },
        { "label": "后端", "tags": [{ "name": "Java" }, { "name": "Spring" }] }
      ]
    }
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "nested_row_surface",
    "components": [
      {
        "id": "root",
        "component": "Row",
        "children": { "componentId": "tagCategory", "path": "/categories" }
      },
      {
        "id": "tagCategory",
        "component": "Column",
        "children": ["catLabel", "tagRow"]
      },
      {
        "id": "catLabel",
        "component": "Text",
        "content": { "path": "label" }
      },
      {
        "id": "tagRow",
        "component": "Row",
        "children": { "componentId": "tagItem", "path": "tags" }
      },
      {
        "id": "tagItem",
        "component": "Text",
        "content": { "path": "name" }
      }
    ]
  }
}
]
```

上例中：
- 外层 Row 横向排列各分类，{ "path": "label" } 显示分类名（如"前端"）
- 每个分类内又有一个 Row，遍历 tags，{ "path": "name" } 显示标签名（如"TypeScript"）
- 内层 path 是 "tags" 而非 "/tags"——没有前导 / 表示"取当前数据项的子字段"

#### children 运行时行为

- 静态数组模式下，按数组顺序附加子组件。
- 模板对象模式下，componentId 引用模板组件 [ComponentId](../types.md#componentid)，path 使用 [DataBinding](../types.md#databinding) 中同样的 JSON Pointer 写法指向数组数据。
- 运行时会读取 path 指向的数组，并按 componentId 对应的模板为数组中的每一项生成一个子组件实例。若模板缺失或数据不是数组，则本次按空容器处理。
- 内层模板的 path 可使用相对路径（不带前导 /），相对于当前数据项解析。

---

### itemMargin

横向布局元素水平方向间距。itemMargin 为负数或者 justifyContent 设置为 "spaceBetween"、"spaceAround"、"spaceEvenly" 时，itemMargin 不生效。默认值：16，非法值按默认值处理。单位：vp。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| itemMargin | number | 否 | 横向布局元素水平方向间距。<br/>默认值：16。 |

**示例：**

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "row_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "row_surface",
    "components":[
      {
        "component": "Row",
        "id": "root",
        "itemMargin": 5,
        "children": ["left", "center", "right"]
      },
      { "component": "Text", "id": "left", "content": "左侧文本" },
      { "component": "Text", "id": "center", "content": "中间文本" },
      { "component": "Text", "id": "right", "content": "右侧文本" }
    ]
  }
}
]
```

---

### justifyContent

定义子组件水平方向的对齐格式。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.justifyContent | string | 否 | 定义子组件水平方向的对齐方式。<br/>取值范围：支持 "start"、"center"、"end"、"spaceAround"、"spaceBetween"、"spaceEvenly"，非法字符串按默认值处理。<br/>不支持 A2UI 标准协议中定义的 "sketch"。<br/>默认值："start"。 |

可选字符串枚举值的具体说明如下：

| 名称 | 值 | 说明 |
|----|---------|------|
| "start" | - | 元素在主轴方向首端对齐，第一个元素与行首对齐，后续元素与前一个对齐。 |
| "center" | - | 元素在主轴方向中心对齐，第一个元素与行首的距离和最后一个元素与行尾的距离相同。 |
| "end" | - | 元素在主轴方向尾部对齐，最后一个元素与行尾对齐，其余元素与后一个对齐。 |
| "spaceAround" | - | 主轴方向均匀分配弹性元素。每个元素两侧的间距相等，因此首尾与容器边缘的间距是相邻元素之间间距的一半。 |
| "spaceBetween" | - | 主轴方向均匀分配弹性元素。第一个元素与起始边对齐，最后一个元素与结束边对齐，剩余空间均匀分布在相邻元素之间。 |
| "spaceEvenly" | - | 主轴方向均匀分配弹性元素，相邻元素之间的距离、第一个元素与行首的间距、最后一个元素到行尾的间距均相同。 |

**示例DSL：**

下面示例给 Row 设置了固定宽度，并放入 3 个子文本块。将 justifyContent 改成 center、end、spaceBetween 或 spaceEvenly 后，可以直接观察子组件在横向上的位置变化。

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "row_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "row_surface",
    "components":[
      {
        "component": "Row",
        "id": "root",
        "children": ["left", "center", "right"],
        "styles": {
          "justifyContent": "spaceBetween",
          "width": 360,
          "height": 80,
          "backgroundColor": "#F3F6FA"
        }
      },
      {
        "component": "Text",
        "id": "left",
        "content": "左侧块",
        "styles": {
          "width": 84,
          "height": 40,
          "backgroundColor": "#DCEAFE"
        }
      },
      {
        "component": "Text",
        "id": "center",
        "content": "中间块",
        "styles": {
          "width": 84,
          "height": 40,
          "backgroundColor": "#DBEAFE"
        }
      },
      {
        "component": "Text",
        "id": "right",
        "content": "右侧块",
        "styles": {
          "width": 84,
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

定义子组件垂直方向的对齐格式。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.alignItems | string | 否 | 定义子组件垂直方向的对齐格式。<br/>取值范围：支持 "top"、"center"、"bottom"，非法字符串按默认值处理。<br/>默认值："center"。 |

可选字符串枚举值的具体说明如下：

| 名称 | 值 | 说明 |
|----|---------|------|
| "top" | - | 沿交叉轴（垂直方向）顶部对齐。 |
| "center" | - | 沿交叉轴（垂直方向）居中对齐，默认对齐方式。 |
| "bottom" | - | 沿交叉轴（垂直方向）底部对齐。 |

**示例DSL：**

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "row_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "row_surface",
    "components":[
      {
        "component": "Row",
        "id": "root",
        "children": ["left", "center", "right"],
        "styles": {
          "alignItems": "bottom",
          "width": 320,
          "height": 120,
          "backgroundColor": "#F3F6FA"
        }
      },
      {
        "component": "Text",
        "id": "left",
        "content": "左侧块",
        "styles": {
          "width": 84,
          "height": 28,
          "backgroundColor": "#DCEAFE"
        }
      },
      {
        "component": "Text",
        "id": "center",
        "content": "中间块",
        "styles": {
          "width": 84,
          "height": 40,
          "backgroundColor": "#DBEAFE"
        }
      },
      {
        "component": "Text",
        "id": "right",
        "content": "右侧块",
        "styles": {
          "width": 84,
          "height": 52,
          "backgroundColor": "#BFDBFE"
        }
      }
    ]
  }
}
]
```

---

### wrap

定义 Row 是单行还是多行。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.wrap | string | 否 | 定义 Row 是单行还是多行。<br/>取值范围：支持 "noWrap"、"wrap"，非法字符串按默认值处理。<br/>默认值："noWrap"。 |

可选字符串枚举值的具体说明如下：

| 名称 | 值 | 说明 |
|----|---------|------|
| "noWrap" | - | 以单行布局，子元素尽可能约束在容器内。 |
| "wrap" | - | 以多行布局，子项允许换行显示。 |

**示例DSL：**

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "row_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "row_surface",
    "components":[
      {
        "component": "Row",
        "id": "root",
        "children": ["tag1", "tag2", "tag3", "tag4", "tag5"],
        "styles": {
          "wrap": "wrap",
          "width": 220,
          "backgroundColor": "#F3F6FA"
        }
      },
      {
        "component": "Text",
        "id": "tag1",
        "content": "标签一",
        "styles": {
          "width": 90,
          "height": 36,
          "backgroundColor": "#DCEAFE"
        }
      },
      {
        "component": "Text",
        "id": "tag2",
        "content": "标签二",
        "styles": {
          "width": 90,
          "height": 36,
          "backgroundColor": "#DBEAFE"
        }
      },
      {
        "component": "Text",
        "id": "tag3",
        "content": "标签三",
        "styles": {
          "width": 90,
          "height": 36,
          "backgroundColor": "#BFDBFE"
        }
      },
      {
        "component": "Text",
        "id": "tag4",
        "content": "标签四",
        "styles": {
          "width": 90,
          "height": 36,
          "backgroundColor": "#93C5FD"
        }
      },
      {
        "component": "Text",
        "id": "tag5",
        "content": "标签五",
        "styles": {
          "width": 90,
          "height": 36,
          "backgroundColor": "#60A5FA"
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
- alignItems 非法时回退为 center。
- wrap 非法时回退为 noWrap。
- itemMargin 为负数或非法值时回退为 16。
- 当 justifyContent 为 spaceAround、spaceBetween 或 spaceEvenly 时，itemMargin 不生效。

## DFX 说明

Row 组件的异常通过 [registerErrorCallback](../API/surface-controller.md#registererrorcallback) 注册的 onError 回调。

| 错误类型 | code 值 | error message | 说明 |
|------|---------|---------------|------|
| ERROR_SCHEMA_WARNING | 2001 | Property children cannot be an empty array | children 属性为空数组。 |
| ERROR_SCHEMA_WARNING | 2001 | Property children.componentId is required for template object | children 属性的 ChildList.componentId 为空字符串。 |
| ERROR_SCHEMA_WARNING | 2001 | Property children.path expects array data source, got type '<type>' | children 属性的 ChildList.path 绑定的数据类型非数组。 |

错误码和错误回调的完整说明见 [onError](../errors.md)。

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
          "const": "Row"
        },
        "children": {
          "$ref": "../common_types.json#/$defs/ChildList",
          "description": "Child list for Row. Supports static child IDs array and template object {componentId, path} for dynamic expansion."
        },
        "itemMargin": {
          "type": "number",
          "minimum": 0,
          "description": "Horizontal spacing between child elements in vp."
        },
        "styles": {
          "description": "Styles for Row. Includes shared extended component styles and Row-specific layout styles.",
          "allOf": [
            {
              "$ref": "../common_types.json#/$defs/ExtendedCommonStyles"
            },
            {
              "type": "object",
              "properties": {
                "justifyContent": {
                  "type": "string",
                  "default": "start",
                  "enum": [
                    "start",
                    "center",
                    "end",
                    "spaceAround",
                    "spaceBetween",
                    "spaceEvenly"
                  ],
                  "description": "Alignment mode of the child components in the horizontal direction."
                },
                "alignItems": {
                  "type": "string",
                  "default": "center",
                  "enum": [
                    "top",
                    "center",
                    "bottom"
                  ],
                  "description": "Alignment mode of the child components in the vertical direction."
                },
                "wrap": {
                  "type": "string",
                  "default": "noWrap",
                  "enum": [
                    "noWrap",
                    "wrap"
                  ],
                  "description": "Whether Row is rendered on a single line or wrapped to multiple lines."
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

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
