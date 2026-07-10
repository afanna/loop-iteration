# Card 组件

Card 为卡片组件，常用于在应用中显示卡片，通过 child 引用卡片内容。

**起始版本：**  API Version 20

## 特有属性

除支持[通用属性](overview.md)，还支持以下特有属性：

| 特有属性 | 说明 |
|------|------|
| [child](#child) | 卡片内容 |

### child

用于设置卡片内容，仅支持传入单个id。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| child | [ComponentId](../types.md#componentid) | 是 | 子组件的id。 <br/> 默认值：""。  |

说明：

- 要显示多个元素，必须采用容器组件进行包含，并传递容器的 id。
- 传递多个id或不存在的id，不会渲染卡片内容。

**示例DSL：**

```json
{
    "version": "v0.9",
    "updateComponents": {
        "surfaceId": "card_surface",
        "components": [
            {
                "id": "demoCard",
                "component": "Card",
                "child": "demoCardContent",
            },
            {
                "id": "demoCardContent",
                "component": "Text",
                "text": "文本"
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
          "const": "Card"
        },
        "child": {
          "$ref": "../common_types.json#/$defs/ComponentId",
          "description": "The ID of the single child component to be rendered inside the card. To display multiple elements, you MUST wrap them in a layout component (like Column or Row) and pass that container's ID here. Do NOT pass multiple IDs or a non-existent ID. Do NOT define the child component inline."
        }
      },
      "required": [
        "component",
        "child"
      ]
    }
  ],
  "unevaluatedProperties": false
}
```

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
