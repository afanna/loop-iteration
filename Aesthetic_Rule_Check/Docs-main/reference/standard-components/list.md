
# List 组件

List 为列表容器，包含一系列相同宽度的列表项。适合连续、多行呈现同类数据，例如图片和文本。

**起始版本：**  API Version 20

## 特有属性

除支持[通用属性](overview.md)，还支持以下特有属性：

| 特有属性 | 说明 |
|------|------|
| [children](#children) | 子组件数组，默认值为空数组 |
| [direction](#direction) | 列表项的排列方向 |
| [align](#align) | 子组件沿交叉轴的对齐方式 |

### children

子组件数组。

**起始版本：**  API Version 20

| 属性     | 类型  | 必填 | 说明                                                         |
| -------- | ----- | ---- | ------------------------------------------------------------ |
| children | Array | 是   | 子组件数组。 <br/>取值范围：使用字符串数组标识固定的子组件集合，或使用模板对象从数据列表生成子组件。。 <br/>默认值："[]"。 |

说明：
- 当子组件集合的元素为有效的组件id，进行该元素的渲染。
- 当模板对象有效且 [DataModel](../../concepts/data-model-and-binding.md) 匹配时，进行渲染。

**示例DSL：**

示例一：字符串数组

```json
{
  "version":"v0.9",
  "updateComponents":{
    "surfaceId":"list_surface",
    "components":[
        {
            "id": "demoList",
            "component": "List",
            "children": [
                "item3"
            ]
        },
        {
            "id": "item3",
            "component": "Text",
            "text": "列表项 3"
        }
    ]
  }
}
```

示例二：模板对象

```json
{
    "version": "v0.9",
    "updateDataModel": {
        "surfaceId": "list_surface",
        "value": {
            "largeItems": [
                {
                    "textValue": "列表项 1"
                },
                {
                    "textValue": "列表项 2"
                },
                {
                    "textValue": "列表项 3"
                }
            ]
        }
  }
}

{
  "version":"v0.9",
  "updateComponents":{
    "surfaceId":"list_surface",
    "components":[
        {
            "id": "lazyList",
            "component": "List",
            "children": {
                "componentId": "listItemTemplate",
                "path": "/largeItems"
            },
            "direction": "vertical",
            "align": "start"
        },
        {
            "id": "listItemTemplate",
            "component": "Text",
            "text": {
                "path": "textValue"
            }
        }
    ]
  }
}
```

---

### direction

列表项的排列方向。

**起始版本：**  API Version 20

| 属性  | 类型   | 必填 | 说明                                                         |
| ----- | ------ | ---- | ------------------------------------------------------------ |
| direction | string | 否   | 列表项的排列方向。 <br/>取值范围：支持"vertical"、"horizontal"，非法字符串按默认值处理。 <br/>默认值："vertical"。 |

可选字符串枚举值的具体说明如下：

| 名称           | 说明         |
| :------------- | :----------- |
| "vertical"   | 方向为纵向。 |
| "horizontal" | 方向为横向。 |

**示例DSL：**

```json
{
  "version":"v0.9",
  "updateComponents":{
    "surfaceId":"list_surface",
    "components":[
        {
            "id": "demoList",
            "component": "List",
            "children": [
                "item3"
            ],
            "direction": "horizontal"
        },
        {
            "id": "item3",
            "component": "Text",
            "text": "列表项 3"
        }
    ]
  }
}
```

---

### align

设置列表项在List交叉轴方向的对齐方式。

**起始版本：**  API Version 20

| 属性  | 类型   | 必填 | 说明                                                         |
| ----- | ------ | ---- | ------------------------------------------------------------ |
| align | string | 否   | 列表项在List交叉轴方向的对齐方式。 <br/>取值范围：支持"start"、"center"、"end"，非法字符串按默认值处理。 <br/>默认值："start"。 |

可选字符串枚举值的具体说明如下：

| 名称       | 说明                   |
| :------- | :------------------- |
| "start"  | 列表项在List中，交叉轴方向首部对齐。 |
| "center" | 列表项在List中，交叉轴方向居中对齐。 |
| "end"    | 列表项在List中，交叉轴方向尾部对齐。 |

**示例DSL：**

```json
{
  "version":"v0.9",
  "updateComponents":{
    "surfaceId":"list_surface",
    "components":[
        {
            "id": "demoList",
            "component": "List",
            "children": [
                "item3"
            ],
            "align": "center"
        },
        {
            "id": "item3",
            "component": "Text",
            "text": "列表项 3"
        }
    ]
  }
}
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
          "const": "List"
        },
        "children": {
          "description": "Defines the children. Use an array of strings for a fixed set of children, or a template object to generate children from a data list.",
          "$ref": "../common_types.json#/$defs/ChildList"
        },
        "direction": {
          "type": "string",
          "description": "The direction in which the list items are laid out. Values: `vertical` stacks items from top to bottom; `horizontal` lays items out from left to right.",
          "enum": [
            "vertical",
            "horizontal"
          ],
          "default": "vertical"
        },
        "align": {
          "type": "string",
          "description": "Defines the alignment of list items along the cross axis. Values: `start` aligns items to the cross-axis start edge; `center` centers items on the cross axis; `end` aligns items to the cross-axis end edge.",
          "enum": ["start", "center", "end"],
          "default": "start"
        }
      },
      "required": [
        "component",
        "children"
      ]
    }
  ],
  "unevaluatedProperties": false
}
```

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
