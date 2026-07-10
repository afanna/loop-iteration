# Grid 组件

Grid为网格布局容器组件，支持通过行列模板和间距配置对子组件进行网格化排布。

## 特有属性

除支持 [通用属性](overview.md#通用属性) 和 [styles 通用样式](overview.md#styles-通用样式)，还支持以下特有属性：

| 特有属性 | 说明 |
|------|------|
| [children](#children) | 子组件 id 列表或模板对象 |

### children

子组件 ID 列表，或者“模板组件 + 数据路径”形式的模板对象。模板对象详见 [ChildList](../types.md#childlist) 的定义。

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| children | [ChildList](../types.md#childlist) | 否 | 子组件列表，支持[静态子组件列表](../types.md#静态子组件列表)或[动态模板](../types.md#动态模板) { componentId, path }。默认值：[]。 |

#### 模板对象

当 children 使用模板对象时，可以把它理解为“按数据数组批量生成网格项”。

- componentId：引用同一 components 数组中定义的模板组件 [ComponentId](../types.md#componentid)。id 等于 componentId 的组件描述符就是模板描述符，模板本体可以是 [Text](text.md)、[Image](image.md) 等任意已声明组件。
- path：使用 [DataBinding](../types.md#databinding) 中同样的 JSON Pointer 写法，指向 DataModel 里的数组，例如 /items。
- 运行时会读取 path 指向的数组，并按数组顺序为每一项生成一个网格子组件。
- 如果 path 没有解析到数组，或模板对象缺少 componentId / path，则本次按空网格处理。

**示例：**

使用静态数组绑定子组件。

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "grid_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "grid_surface",
    "components":[
      {
        "component":"Grid",
        "id":"root",
        "children":["item1", "item2", "item3", "item4"]
      },
      { "component":"Text", "id":"item1", "content":"网格项1" },
      { "component":"Text", "id":"item2", "content":"网格项2" },
      { "component":"Text", "id":"item3", "content":"网格项3" },
      { "component":"Text", "id":"item4", "content":"网格项4" }
    ]
  }
}
]
```

使用模板对象从数据列表生成子组件。

建议先下发 updateDataModel，再下发引用该数组的 updateComponents。当前运行时如果先收到模板容器、后收到首次数组数据，通常还需要再补发一次容器的 updateComponents 才会生成首批实例。

当前运行时建议显式声明 styles.columnsTemplate。如果未声明列模板，部分环境下 Grid 初始布局可能表现为空白。

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "grid_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version":"v0.9",
  "updateDataModel":{
    "surfaceId":"grid_surface",
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
    "surfaceId": "grid_surface",
    "components":[
      {
        "id":"root",
        "component":"Grid",
        "children":{"componentId":"itemTemplate", "path":"/items"},
        "styles": {
          "columnsTemplate": "1fr 1fr",
          "columnsGap": 12,
          "rowsGap": 12,
          "width": 240,
          "backgroundColor": "#F3F6FA"
        }
      },
      {
        "id":"itemTemplate",
        "component":"Text",
        "content":{"path":"name"},
        "styles": {
          "height": 36,
          "backgroundColor": "#DCEAFE"
        }
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
    "surfaceId": "nested_grid_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateDataModel": {
    "surfaceId": "nested_grid_surface",
    "value": {
      "albums": [
        { "name": "旅行", "photos": [{ "url": "trip1.jpg" }, { "url": "trip2.jpg" }] },
        { "name": "美食", "photos": [{ "url": "food1.jpg" }, { "url": "food2.jpg" }] }
      ]
    }
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "nested_grid_surface",
    "components": [
      {
        "id": "root",
        "component": "Grid",
        "children": { "componentId": "albumCard", "path": "/albums" },
        "styles": {
          "columnsTemplate": "1fr 1fr",
          "columnsGap": 12,
          "rowsGap": 12,
          "width": 260,
          "backgroundColor": "#F3F6FA"
        }
      },
      {
        "id": "albumCard",
        "component": "Column",
        "children": ["albumTitle", "thumbGrid"],
        "styles": {
          "backgroundColor": "#FFFFFF"
        }
      },
      {
        "id": "albumTitle",
        "component": "Text",
        "content": { "path": "name" }
      },
      {
        "id": "thumbGrid",
        "component": "Grid",
        "children": { "componentId": "thumbItem", "path": "photos" },
        "styles": {
          "columnsTemplate": "1fr 1fr",
          "columnsGap": 6,
          "rowsGap": 6
        }
      },
      {
        "id": "thumbItem",
        "component": "Text",
        "content": { "path": "url" },
        "styles": {
          "height": 28,
          "backgroundColor": "#DCEAFE"
        }
      }
    ]
  }
}
]
```

上例中：
- 外层 Grid 网格排列各相册，{ "path": "name" } 显示相册名（如"旅行"）
- 每个相册内又有一个 Grid，遍历 photos，{ "path": "url" } 显示照片标识
- 内层 path 是 "photos" 而非 "/photos"——没有前导 / 表示"取当前数据项的子字段"

#### children 运行时行为（模板模式）

- 模板对象会按数据数组生成网格项。
- componentId 缺失、path 缺失或 path 解析不到数组时，按空网格处理。
- 数据变化后会同步刷新已生成的网格项；数组长度变化时会增减实例。
- Grid 使用懒加载，只渲染可见区域的模板实例。

---

## 特有样式

以下属性写在组件的 styles 中；styles 同时支持 [通用样式](overview.md#styles-通用样式)。

| 特有属性 | 说明 |
|------|------|
| [styles.columnsTemplate](#columnstemplate) | 列的数量、固定列宽 |
| [styles.rowsTemplate](#rowstemplate) | 行的数量、固定行高 |
| [styles.columnsGap](#columnsgap) | 列间距 |
| [styles.rowsGap](#rowsgap) | 行间距 |

### columnsTemplate

列的数量、固定列宽。

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| styles.columnsTemplate | string | 否 | 列的数量、固定列宽。仅支持传入"1fr 1fr 2fr"形式的字符串，每个 fr 代表一列，前面的数值是该列的宽度权重。非法值回退为 "1fr"。<br/>默认值："1fr"（1列）。 |

**示例：**

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "grid_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "grid_surface",
    "components":[
      {
        "component":"Grid",
        "id":"root",
        "children":["item1", "item2", "item3"],
        "styles": {
          "columnsTemplate":"1fr 2fr 1fr",
          "width": 280,
          "backgroundColor": "#F3F6FA"
        }
      },
      { "component":"Text", "id":"item1", "content":"1fr", "styles": { "height": 36, "backgroundColor": "#DCEAFE" } },
      { "component":"Text", "id":"item2", "content":"2fr", "styles": { "height": 36, "backgroundColor": "#BFDBFE" } },
      { "component":"Text", "id":"item3", "content":"1fr", "styles": { "height": 36, "backgroundColor": "#93C5FD" } }
    ]
  }
}
]
```

---

### rowsTemplate

行的数量、固定行高。

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| styles.rowsTemplate | string | 否 | 行的数量、固定行高。仅支持传入"1fr 1fr 2fr"形式的字符串，每个 fr 代表一行，前面的数值是该行的高度权重。非法值回退为 "1fr"。<br/>默认值："1fr"（1行）。 |

**示例：**

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "grid_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "grid_surface",
    "components":[
      {
        "component":"Grid",
        "id":"root",
        "children":["item1", "item2", "item3", "item4"],
        "styles": {
          "columnsTemplate":"1fr",
          "rowsTemplate":"1fr 1fr 2fr",
          "width": 220,
          "height": 240,
          "backgroundColor": "#F3F6FA"
        }
      },
      { "component":"Text", "id":"item1", "content":"第一行", "styles": { "backgroundColor": "#DCEAFE" } },
      { "component":"Text", "id":"item2", "content":"第二行", "styles": { "backgroundColor": "#BFDBFE" } },
      { "component":"Text", "id":"item3", "content":"第三行", "styles": { "backgroundColor": "#93C5FD" } },
      { "component":"Text", "id":"item4", "content":"额外项", "styles": { "backgroundColor": "#60A5FA" } }
    ]
  }
}
]
```

---

### columnsGap

列间距。

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| styles.columnsGap | number | 否 | 列间距。取值范围：[0,inf)。负数会回退为 0。<br/>默认值：0。 |

**示例：**

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "grid_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "grid_surface",
    "components":[
      {
        "component":"Grid",
        "id":"root",
        "children":["item1", "item2", "item3", "item4"],
        "styles": {
          "columnsTemplate":"1fr 1fr",
          "columnsGap":12,
          "width": 260,
          "backgroundColor": "#F3F6FA"
        }
      },
      { "component":"Text", "id":"item1", "content":"左上", "styles": { "height": 36, "backgroundColor": "#DCEAFE" } },
      { "component":"Text", "id":"item2", "content":"右上", "styles": { "height": 36, "backgroundColor": "#BFDBFE" } },
      { "component":"Text", "id":"item3", "content":"左下", "styles": { "height": 36, "backgroundColor": "#93C5FD" } },
      { "component":"Text", "id":"item4", "content":"右下", "styles": { "height": 36, "backgroundColor": "#60A5FA" } }
    ]
  }
}
]
```

---

### rowsGap

行间距。

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| styles.rowsGap | number | 否 | 行间距。取值范围：[0,inf)。负数会回退为 0。<br/>默认值：0。 |

**示例：**

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "grid_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "grid_surface",
    "components":[
      {
        "component":"Grid",
        "id":"root",
        "children":["item1", "item2", "item3", "item4"],
        "styles": {
          "columnsTemplate":"1fr 1fr",
          "rowsGap":12,
          "width": 260,
          "height": 180,
          "backgroundColor": "#F3F6FA"
        }
      },
      { "component":"Text", "id":"item1", "content":"第一行左", "styles": { "height": 36, "backgroundColor": "#DCEAFE" } },
      { "component":"Text", "id":"item2", "content":"第一行右", "styles": { "height": 36, "backgroundColor": "#BFDBFE" } },
      { "component":"Text", "id":"item3", "content":"第二行左", "styles": { "height": 36, "backgroundColor": "#93C5FD" } },
      { "component":"Text", "id":"item4", "content":"第二行右", "styles": { "height": 36, "backgroundColor": "#60A5FA" } }
    ]
  }
}
]
```

---

## 异常值与边界处理

- columnsTemplate 为空、非字符串或非法值时回退为 "1fr"。
- rowsTemplate 为空、非字符串或非法值时回退为 "1fr"。
- columnsGap、rowsGap 为负数时回退为 0。

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
          "const": "Grid"
        },
        "children": {
          "$ref": "../common_types.json#/$defs/ChildList",
          "description": "Child list for Grid. Supports static child IDs array and template object {componentId, path} for dynamic expansion."
        },
        "styles": {
          "description": "Styles for Grid. Includes shared extended component styles and Grid-specific grid layout styles.",
          "allOf": [
            {
              "$ref": "../common_types.json#/$defs/ExtendedCommonStyles"
            },
            {
              "type": "object",
              "properties": {
                "columnsTemplate": {
                  "type": "string",
                  "description": "The number of columns and fixed column width. Only a string in the format of 1fr 1fr 2fr can be passed. Each fr indicates a column, and the value before fr indicates the width weight of the column. Default value: 1 column."
                },
                "rowsTemplate": {
                  "type": "string",
                  "description": "Number of rows and fixed row height. Only a string in the format of 1fr 1fr 2fr can be passed. Each fr indicates a row, and the value before fr indicates the height weight of the row. Default value: 1 row."
                },
                "columnsGap": {
                  "type": "number",
                  "description": "Column spacing. Value range: [0, inf).",
                  "minimum": 0
                },
                "rowsGap": {
                  "type": "number",
                  "description": "Line spacing. Value range: [0, inf).",
                  "minimum": 0
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
