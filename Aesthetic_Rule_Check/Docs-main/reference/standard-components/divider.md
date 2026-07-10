# Divider 组件

Divider 为分割线组件，分割不同内容块/内容元素。

**起始版本：**  API Version 20

## 特有属性

除支持[通用属性](overview.md)，还支持以下特有属性：

| 特有属性 | 说明 |
|------|------|
| [axis](#axis) | 设置分割线的方向 |

### axis

设置分割线的方向。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| axis | string | 否 | 分割线的方向。 <br/> 取值范围："horizontal" 代表水平分割线，"vertical"代表垂直分割线。<br> 默认值："horizontal"。 |

**示例DSL：**

```json
{
    "version": "v0.9",
    "updateComponents": {
        "surfaceId": "divider_surface",
        "components": [
            {
                "id": "demoDivider",
                "component": "Divider",
                "axis": "vertical"
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
          "const": "Divider"
        },
        "axis": {
          "type": "string",
          "description": "The orientation of the divider. Values: `horizontal` renders a horizontal separator between vertical content blocks; `vertical` renders a vertical separator between horizontal content blocks.",
          "enum": [
            "horizontal",
            "vertical"
          ],
          "default": "horizontal"
        }
      },
      "required": [
        "component"
      ]
    }
  ],
  "unevaluatedProperties": false
}
```

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
