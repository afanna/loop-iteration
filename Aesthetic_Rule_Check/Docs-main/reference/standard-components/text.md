# Text 组件

显示文本内容的组件。

**起始版本：**  API Version 20

## 特有属性

除支持[通用属性](overview.md)，还支持以下特有属性：

| 特有属性 | 说明 |
|------|------|
| [text](#text) | 设置文本内容 |
| [variant](#variant) | 设置文本字体大小 |

### text

设置文本内容。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| text | [DynamicString](../types.md#dynamicstring) | 是 | 文本内容。<br/> 取值范围：支持任意字符串。 <br> 默认值：""  |\

**示例DSL：**

```json
{
  "version":"v0.9",
  "updateComponents":{
    "surfaceId":"text_surface",
    "components":[
      {
        "component": "Text",
        "id": "textNode",
        "text": "文本内容"
      }
    ]
  }
}
```

---

### variant

设置字体大小。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| variant | string | 否 | 字体大小。<br/> 取值范围：支持"h1"、"h2"、"h3"、"h4"、"h5"、"caption"和"body"，非法字符串按默认值处理。 <br> 默认值："body"  |

可选字符串枚举值的具体说明如下：

| 名称 | 值 | 说明 |
|----|---------|------|
| "h1" | 32.0 fp | 超大标题 |
| "h2" | 28.0 fp | 大标题 |
| "h3" | 24.0 fp | 中标题 |
| "h4" | 22.0 fp | 小标题 |
| "h5" | 16.0 fp | 副标题 |
| "body" | 14.0 fp | 正文（默认） |
| "caption" | 12.0 fp | 说明文字 |

**示例DSL：**

```json
{
  "version":"v0.9",
  "updateComponents":{
    "surfaceId":"text_surface",
    "components":[
      {
        "component": "Text",
        "id": "textNode",
        "text": "文本内容",
        "variant": "h5"
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
          "const": "Text"
        },
        "text": {
          "$ref": "../common_types.json#/$defs/DynamicString",
          "description": "The text content to display."
        },
        "variant": {
          "type": "string",
          "enum": [
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "caption",
            "body"
          ],
          "description": "Typography variant mapped to system float tokens. Invalid values fallback to default font size."
        }
      },
      "required": [
        "component",
        "text"
      ]
    }
  ],
  "additionalProperties": true
}
```
↑ [返回 Reference 总览](../../README.md#reference-api-速查)
