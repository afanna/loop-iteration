
# Tabs 组件

Tabs 是通过页签进行内容视图切换的容器组件，每个页签对应一个内容视图。

**起始版本：**  API Version 20

## 特有属性

除支持[通用属性](overview.md)，还支持以下特有属性：

| 特有属性 | 必填 |  说明 |
|------|------| ------|
| [tabs](#tabs) | 是 | 页签数组，默认值为空数组  |

### tabs

定义对象数组，每个对象定义一个带有标题与内容的标签页。

**起始版本：**  API Version 20

| 属性      | 类型     | 必填  | 说明              |
| ------- | ------ | --- | --------------- |
| title | string | 是   | 页签标题，支持任意字符串。   |
| child | string | 是   | 页签内容，传递单个组件 id。 |

说明：
- 对象数组的成员个数需大于0，否则Tabs无法创建。
- 当title或child缺失时，空占位。

**示例DSL：**

```json
{
    "version": "v0.9",
    "updateComponents": {
        "surfaceId": "tabs_surface",
        "components": [
            {
                "id": "target",
                "component": "Tabs",
                "tabs": [
                    {
                        "title": "Single Tab",
                        "child": "content1"
                    }
                ]
            },
            {
                "id": "content1",
                "component": "Text",
                "text": "Single Tab Content"
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
          "const": "Tabs"
        },
        "tabs": {
          "type": "array",
          "description": "An array of tab definitions. At least one tab is required. Each item defines a tab with a `title` and the `child` component to render when that tab is active.",
          "minItems": 1,
          "items": {
            "type": "object",
            "properties": {
              "title": {
                "description": "The tab title.",
                "$ref": "../common_types.json#/$defs/DynamicString"
              },
              "child": {
                "$ref": "../common_types.json#/$defs/ComponentId",
                "description": "The ID of the child component. Do NOT define the component inline."
              }
            },
            "required": [
              "title",
              "child"
            ],
            "additionalProperties": false
          }
        }
      },
      "required": [
        "component",
        "tabs"
      ]
    }
  ],
  "unevaluatedProperties": false
}
```

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
