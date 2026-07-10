# Column 组件

沿垂直方向布局的容器组件。

**起始版本：**  API Version 20

## 特有属性

除支持[通用属性](overview.md)，还支持以下特有属性：

| 特有属性 | 说明 |
|------|------|
| [children](#children) | 子组件id列表 |
| [justify](#justify) | 定义子组件沿垂直方向的排列方式 |
| [align](#align) | 定义子组件沿水平方向的排列方式 |

### children

子组件id列表，使用字符串数组表示固定的子组件集合，或使用[模板对象](../types.md#childlist)从数据列表生成子组件。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| children | [ChildList](../types.md#childlist) | 是 | 子组件id列表，使用字符串数组表示固定的子组件集合，或使用模板对象从数据列表生成子组件。 <br/> 取值范围：支持任意字符串数组 <br> 默认值：[]。未设置children属性时取默认值。 |

**示例DSL：**

使用静态数组绑定子组件。

```json
{
  "version":"v0.9",
  "updateComponents":{
    "surfaceId":"column_surface",
    "components":[
      {
        "component": "Column",
        "id": "root",
        "children": ["top", "center", "bottom"]
      },
      { "component": "Text", "id": "top", "text": "上方文本" },
      { "component": "Text", "id": "center", "text": "中间文本" },
      { "component": "Text", "id": "bottom", "text": "下方文本" }
    ]
  }
}
```

使用模板对象从数据列表生成子组件。

**完整示例：**

```json
{
  "version": "v0.9",
  "updateDataModel": {
    "surfaceId": "column_surface",
    "value": {
      "items": [
        { "name": "Alpha" },
        { "name": "Beta" },
        { "name": "Gamma" }
      ]
    }
  }
}

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "column_surface",
    "components": [
      {
        "id": "target",
        "component": "Column",
        "children": {
          "componentId": "itemTemplate",
          "path": "/items"
        }
      },
      {
        "id": "itemTemplate",
        "component": "Text",
        "text": {
          "path": "name"
        }
      }
    ]
  }
}
```

当 children 使用模板对象时，Column 会遍历 path 指定的数组，为每个元素实例化模板组件 itemTemplate，生成 itemTemplate_0、itemTemplate_1、itemTemplate_2 等子组件。

完整项目搭建，参见 [快速集成](../../guides/quick-integration.md)。

---

### justify

定义子组件沿主轴（垂直方向）的排列方式。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| justify | string | 否 | 定义子组件沿主轴（垂直方向）的排列方式。 <br/> 取值范围：支持"start"、"center"、"end"、"spaceAround"、"spaceBetween"、"spaceEvenly"，非法字符串按默认值处理。 <br> 不支持 A2UI 标准协议中定义的"sketch"。 <br> 默认值："start"  |

可选字符串枚举值的具体说明如下：

| 名称 | 值 | 说明 |
|----|---------|------|
| "start" | - | 元素在主轴方向首端对齐，第一个元素与行首对齐，后续元素与前一个对齐。 |
| "center" | - | 元素在主轴方向中心对齐，第一个元素与行首的距离和最后一个元素与行尾的距离相同。 |
| "end" | - | 元素在主轴方向尾部对齐，最后一个元素与行尾对齐，其余元素与后一个对齐。 |
| "spaceAround" | - | 主轴方向均匀分配弹性元素，相邻元素之间距离相同。第一个元素与行首对齐，最后一个元素与行尾对齐。 |
| "spaceBetween" | - | 主轴方向均匀分配弹性元素，相邻元素之间距离相同。第一个元素到行首的距离和最后一个元素到行尾的距离是相邻元素之间距离的一半。 |
| "spaceEvenly" | - | 主轴方向均匀分配弹性元素，相邻元素之间的距离、第一个元素与行首的间距、最后一个元素到行尾的间距均相同。 |

**示例DSL：**

```json
{
  "version":"v0.9",
  "updateComponents":{
    "surfaceId":"column_surface",
    "components":[
      {
        "component": "Column",
        "id": "root",
        "justify": "start"
      }
    ]
  }
}
```

---

### align

定义子组件沿交叉轴（水平方向）的排列方式。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| align | string | 否 | 定义子组件沿交叉轴（水平方向）的排列方式。 <br/> 取值范围：支持"start"、"center"、"end"，非法字符串按默认值处理。 <br> 默认值："start"  |

可选字符串枚举值的具体说明如下：

| 名称 | 值 | 说明 |
|----|---------|------|
| "start" | - | 沿交叉轴（水平方向）顶部对齐，默认对齐方式。 |
| "center" | - | 沿交叉轴（水平方向）居中对齐。 |
| "end" | - | 沿交叉轴（水平方向）底部对齐。 |

**示例DSL：**

```json
{
  "version":"v0.9",
  "updateComponents":{
    "surfaceId":"column_surface",
    "components":[
      {
        "component": "Column",
        "id": "root",
        "align": "center"
      }
    ]
  }
}
```

## DFX 说明

Column组件的异常通过[registerErrorCallback](../API/surface-controller.md#registererrorcallback)注册的 onError 回调。

| 错误类型 | code 值 | error message | 说明 |
|------|---------|---------------|------|
| ERROR_SCHEMA_WARNING | 2001 | Property children cannot be an empty array | children属性设置为空数组。 |
| ERROR_SCHEMA_WARNING | 2001 | Property children.componentId is required for template object | children属性的ChildList.componentId属性为空字符串。 |
| ERROR_SCHEMA_WARNING | 2001 | Property children.path expects array data source, got type '<type>' | children属性的ChildList.path属性绑定的数据类型非数组。 |

错误码和错误回调的完整说明见 [onError](../errors.md) 。

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
          "const": "Column"
        },
        "children": {
          "$ref": "../common_types.json#/$defs/ChildList",
          "description": "Child list for Column. Supports static child IDs array and template object {componentId, path} for dynamic expansion."
        },
        "justify": {
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
          "description": "Main-axis arrangement for child components. Invalid values fallback to start."
        },
        "align": {
          "type": "string",
          "default": "start",
          "enum": [
            "start",
            "center",
            "end"
          ],
          "description": "Cross-axis alignment for child components. stretch is unsupported; invalid values fallback to center."
        }
      },
      "required": [
        "component",
        "children"
      ]
    }
  ],
  "additionalProperties": true
}
```

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
