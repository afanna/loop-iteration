# List 组件

List为列表容器组件，支持子节点列表、主轴间距、排列方向、滚动条和嵌套滚动配置。默认情况下启用级联滚动：List 自身先滚动，滚动到边缘后继续带动父滚动容器滚动。

## 特有属性

除支持 [通用属性](overview.md#通用属性) 和 [styles 通用样式](overview.md#styles-通用样式)，还支持以下特有属性：

| 特有属性 | 说明 |
|------|------|
| [children](#children) | 子节点的ID列表或者模板组件ID和循环数据路径 |
| [space](#space) | 子组件主轴方向的间隔 |

### children

子节点的 ID 列表，或者“模板组件 + 数据路径”形式的模板对象。模板对象详见 [ChildList](../types.md#childlist) 的定义。

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| children | [ChildList](../types.md#childlist) | 否 | 子节点列表，支持[静态子组件列表](../types.md#静态子组件列表)或[动态模板](../types.md#动态模板) { componentId, path }。默认值：[]。 |

#### children 运行时行为（模板模式）

当 children 使用模板对象时，可以把它理解为“用同一个组件模板，按数据数组重复生成列表项”。

- componentId：引用同一 components 数组中定义的模板组件 [ComponentId](../types.md#componentid)。id 等于 componentId 的组件描述符就是模板描述符，模板本体可以是 [Text](text.md) 等普通组件。
- path：使用 [DataBinding](../types.md#databinding) 中同样的 JSON Pointer 写法，指向 DataModel 里的数组，例如 /items。
- 运行时会读取 path 指向的数组，并按数组顺序为每一项生成一个列表子组件。
- 如果 path 没有解析到数组，或模板对象缺少 componentId / path，则本次按空列表处理，不会额外报错渲染。

**示例：**

使用静态数组绑定子组件。

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "list_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "list_surface",
    "components":[
      {
        "component": "List",
        "id": "root",
        "children": ["item1", "item2", "item3"],
        "styles": {
          "width": 240,
          "height": 180,
          "backgroundColor": "#F3F6FA"
        }
      },
      { "component": "Text", "id": "item1", "content": "列表项 1", "styles": { "height": 36, "backgroundColor": "#DCEAFE" } },
      { "component": "Text", "id": "item2", "content": "列表项 2", "styles": { "height": 36, "backgroundColor": "#BFDBFE" } },
      { "component": "Text", "id": "item3", "content": "列表项 3", "styles": { "height": 36, "backgroundColor": "#93C5FD" } }
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
    "surfaceId": "list_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version":"v0.9",
  "updateDataModel":{
    "surfaceId":"list_surface",
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
    "surfaceId": "list_surface",
    "components":[
      {
        "id":"root",
        "component":"List",
        "children":{"componentId":"itemTemplate","path":"/items"},
        "styles": {
          "width": 240,
          "height": 280,
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

componentId 指向的模板描述符可以是容器组件（如 List），该容器的 children 也可以继续使用模板对象，形成嵌套模板。内层模板的 path 使用相对路径（不带前导 /），相对于当前数据项解析。

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "list_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateDataModel": {
    "surfaceId": "list_surface",
    "value": {
      "categories": [
        { "name": "饮品", "items": [{ "name": "美式" }, { "name": "拿铁" }] },
        { "name": "主食", "items": [{ "name": "汉堡" }, { "name": "薯条" }] }
      ]
    }
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "list_surface",
    "components": [
      {
        "id": "root",
        "component": "List",
        "children": { "componentId": "categoryTemplate", "path": "/categories" },
        "styles": {
          "width": 260,
          "height": 320,
          "backgroundColor": "#F3F6FA"
        }
      },
      {
        "id": "categoryTemplate",
        "component": "Column",
        "children": ["categoryName", "itemList"],
        "styles": {
          "backgroundColor": "#FFFFFF"
        }
      },
      {
        "id": "categoryName",
        "component": "Text",
        "content": { "path": "name" },
        "styles": {
          "height": 32,
          "backgroundColor": "#DBEAFE"
        }
      },
      {
        "id": "itemList",
        "component": "List",
        "children": { "componentId": "itemTemplate", "path": "items" },
        "styles": {
          "height": 96,
          "backgroundColor": "#EFF6FF"
        }
      },
      {
        "id": "itemTemplate",
        "component": "Text",
        "content": { "path": "name" },
        "styles": {
          "height": 32,
          "backgroundColor": "#DCEAFE"
        }
      }
    ]
  }
}
]
```

上例中：
- 外层 List 遍历 /categories，为每个分类生成一个卡片，{ "path": "name" } 显示分类名（如"饮品"）
- 每个卡片内又有一个 List，遍历该分类下的 items，{ "path": "name" } 显示商品名（如"美式"）
- 内层 path 是 "items" 而非 "/items"——没有前导 / 表示"取当前数据项的子字段"

#### children 运行时行为（模板模式）

- 模板对象会按数据数组生成列表项。
- componentId 缺失、path 缺失或 path 解析不到数组时，按空列表处理。
- 数据变化后会同步刷新已生成的列表项；数组长度变化时会增减实例。
- List 使用懒加载，只渲染可见区域的模板实例。

---

### space

子组件主轴方向的间隔。

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| space | number | 否 | 子组件主轴方向的间隔。设置为负数时按 0 处理。<br/>默认值：0。单位：vp。 |

**示例：**

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "list_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "list_surface",
    "components":[
      {
        "component": "List",
        "id": "root",
        "space": 12,
        "children": ["item1", "item2"],
        "styles": {
          "width": 240,
          "height": 160,
          "backgroundColor": "#F3F6FA"
        }
      },
      { "component": "Text", "id": "item1", "content": "列表项 1", "styles": { "height": 36, "backgroundColor": "#DCEAFE" } },
      { "component": "Text", "id": "item2", "content": "列表项 2", "styles": { "height": 36, "backgroundColor": "#BFDBFE" } }
    ]
  }
}
]
```

---

## 特有样式

以下属性写在组件的 styles 中；styles 同时支持 [通用样式](overview.md#styles-通用样式)。

| 特有属性 | 说明 |
|------|------|
| [styles.listDirection](#listdirection) | 列表排列方向 |
| [styles.scrollBar](#scrollbar) | 滚动条状态 |
| [styles.nestedScroll](#nestedscroll) | 嵌套滚动模式 |

### listDirection

列表排列方向。

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| styles.listDirection | string | 否 | 列表排列方向。写在 styles.listDirection 中。取值范围："vertical"、"horizontal"。非法值回退为 "vertical"。<br/>默认值："vertical"。 |

可选字符串枚举值的具体说明如下：

| 名称 | 说明 |
|------|------|
| vertical | 方向为纵向 |
| horizontal | 方向为横向 |

**示例：**

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "list_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "list_surface",
    "components":[
      {
        "component": "List",
        "id": "root",
        "children": ["item1", "item2"],
        "styles": {
          "listDirection": "horizontal",
          "width": 260,
          "height": 80,
          "backgroundColor": "#F3F6FA"
        }
      },
      { "component": "Text", "id": "item1", "content": "列表项 1", "styles": { "width": 100, "height": 40, "backgroundColor": "#DCEAFE" } },
      { "component": "Text", "id": "item2", "content": "列表项 2", "styles": { "width": 100, "height": 40, "backgroundColor": "#BFDBFE" } }
    ]
  }
}
]
```

---

### scrollBar

滚动条状态。

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| styles.scrollBar | string | 否 | 滚动条状态。写在 styles.scrollBar 中。取值范围："off"、"auto"、"on"。off：不显示；auto：按需显示（触摸时显示，2s后消失）；on：常驻显示。非法值回退为 "auto"。<br/>默认值："auto"。 |

可选字符串枚举值的具体说明如下：

| 名称 | 说明 |
|------|------|
| off | 不显示 |
| auto | 按需显示（触摸时显示，2s后消失） |
| on | 常驻显示 |

**示例：**

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "list_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "list_surface",
    "components":[
      {
        "component": "List",
        "id": "root",
        "children": ["item1", "item2", "item3", "item4", "item5"],
        "styles": {
          "scrollBar": "on",
          "width": 240,
          "height": 180,
          "backgroundColor": "#F3F6FA"
        }
      },
      { "component": "Text", "id": "item1", "content": "列表项 1", "styles": { "height": 36, "backgroundColor": "#DCEAFE" } },
      { "component": "Text", "id": "item2", "content": "列表项 2", "styles": { "height": 36, "backgroundColor": "#BFDBFE" } },
      { "component": "Text", "id": "item3", "content": "列表项 3", "styles": { "height": 36, "backgroundColor": "#93C5FD" } },
      { "component": "Text", "id": "item4", "content": "列表项 4", "styles": { "height": 36, "backgroundColor": "#60A5FA" } },
      { "component": "Text", "id": "item5", "content": "列表项 5", "styles": { "height": 36, "backgroundColor": "#3B82F6" } }
    ]
  }
}
]
```

---

### nestedScroll

嵌套滚动模式。

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| styles.nestedScroll | NestedScrollOptions | 否 | 嵌套滚动模式配置。写在 styles.nestedScroll 中。非法值回退为默认配置。<br/>默认值：{scrollForward: "selfFirst", scrollBackward: "selfFirst"}。 |

#### NestedScrollOptions

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| scrollForward | string | 否 | 滚动组件往末尾端滚动时的嵌套滚动选项。取值范围："selfFirst"、"parentFirst"、"paraller"、"selfOnly"。非法值回退为 "selfFirst"。 |
| scrollBackward | string | 否 | 滚动组件往起始端滚动时的嵌套滚动选项。取值范围："selfFirst"、"parentFirst"、"paraller"、"selfOnly"。非法值回退为 "selfFirst"。 |

可选字符串枚举值的具体说明如下：

| 名称 | 值 | 说明 |
|----|---------|------|
| "selfOnly" | - | 只自身滚动，不与父组件联动。 |
| "selfFirst" | - | 自身先滚动，自身滚动到边缘以后父组件滚动。父组件滚动到边缘以后，如果父组件有边缘效果，则父组件触发边缘效果，否则子组件触发边缘效果。 |
| "parentFirst" | - | 父组件先滚动，父组件滚动到边缘以后自身滚动。自身滚动到边缘后，如果有边缘效果，会触发自身的边缘效果，否则触发父组件的边缘效果。 |
| "paraller" | - | 自身和父组件同时滚动，自身和父组件都到达边缘以后，如果自身有边缘效果，则自身触发边缘效果，否则父组件触发边缘效果。 |

## 异常值与边界处理

- space 为负数时回退为 0。
- listDirection 非法时回退为 vertical。
- scrollBar 非法时回退为 auto。
- nestedScroll.scrollForward 和 nestedScroll.scrollBackward 非法时都回退为 selfFirst。
- 未显式配置 nestedScroll 时，List 默认使用 selfFirst / selfFirst，即自身先滚动，滚动到边缘后继续带动父滚动容器滚动。

### 模板模式边界处理

| 场景 | 行为 |
|------|------|
| componentId 或 path 缺失/为空 | children 被视为无效，不展开模板，容器渲染为空。 |
| componentId 指向的模板描述符尚未到达 | List 按空列表处理。 |
| path 指向的数据路径在 DataModel 中不存在 | 不展开模板，List 渲染为空。 |
| path 指向的数据不是数组 | 报告 schema 警告，不展开模板，List 渲染为空。 |
| path 指向空数组 [] | 正常展开，itemCount 为 0，List 渲染为空（无列表项）。 |
| 模板描述符存在循环引用（A → B → A） | 检测到循环后停止递归，已遍历的层级正常渲染。 |
| 单个数据项的模板实例构建失败 | 跳过该项，其余数据项继续渲染。 |
| 同一 componentId 的模板描述符再次下发 | List 按最新模板和数据重新生成列表项。 |

**示例：**

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "list_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "list_surface",
    "components":[
      {
        "component": "List",
        "id": "root",
        "children": ["item1", "item2", "item3"],
        "styles": {
          "width": 240,
          "height": 180,
          "backgroundColor": "#F3F6FA",
          "nestedScroll": {
            "scrollForward": "selfOnly",
            "scrollBackward": "selfOnly"
          }
        }
      },
      { "component": "Text", "id": "item1", "content": "列表项 1", "styles": { "height": 36, "backgroundColor": "#DCEAFE" } },
      { "component": "Text", "id": "item2", "content": "列表项 2", "styles": { "height": 36, "backgroundColor": "#BFDBFE" } },
      { "component": "Text", "id": "item3", "content": "列表项 3", "styles": { "height": 36, "backgroundColor": "#93C5FD" } }
    ]
  }
}
]
```

上例显式把 nestedScroll 设为 selfOnly / selfOnly，用于关闭默认的级联滚动行为。如果不传该字段，默认行为是 selfFirst / selfFirst。

---

## 组件Schema

```json
{
  "type": "object",
  "$defs": {
    "NestedScrollMode": {
      "type": "string",
      "enum": [
        "selfFirst",
        "parentFirst",
        "paraller",
        "selfOnly"
      ]
    },
    "NestedScrollOptions": {
      "type": "object",
      "properties": {
        "scrollForward": {
          "$ref": "#/$defs/NestedScrollMode",
          "description": "Nested scrolling option when scrolling toward the end."
        },
        "scrollBackward": {
          "$ref": "#/$defs/NestedScrollMode",
          "description": "Nested scrolling option when scrolling toward the start."
        }
      },
      "default": {
        "scrollForward": "selfFirst",
        "scrollBackward": "selfFirst"
      },
      "additionalProperties": false
    }
  },
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
          "const": "List"
        },
        "children": {
          "$ref": "../common_types.json#/$defs/ChildList",
          "description": "Child list for List. Supports static child IDs array and template object {componentId, path} for dynamic expansion."
        },
        "space": {
          "type": "number",
          "description": "spacing between elements in  layout. When space is a negative number or justifyContent is set to 'spaceBetween', 'spaceAround', or 'spaceEvenly', space does not take effect. Default value: 0. Invalid values are treated as the default value. Unit: vp."
        },
        "styles": {
          "description": "Styles for List. Includes shared extended component styles and List-specific scrolling styles.",
          "allOf": [
            {
              "$ref": "../common_types.json#/$defs/ExtendedCommonStyles"
            },
            {
              "type": "object",
              "properties": {
                "listDirection": {
                  "type": "string",
                  "description": "List arrangement direction.",
                  "enum": [
                    "vertical",
                    "horizontal"
                  ],
                  "default": "vertical"
                },
                "scrollBar": {
                  "type": "string",
                  "description": "Scroll bar status.",
                  "enum": [
                    "off",
                    "auto",
                    "on"
                  ],
                  "default": "auto"
                },
                "nestedScroll": {
                  "$ref": "#/$defs/NestedScrollOptions",
                  "description": "Nested scrolling mode options."
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
