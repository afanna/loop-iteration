# Progress 组件

用于渲染扩展进度组件，支持线性、环形、刻度环、胶囊等多种表现形式。进度值通过特有属性 value 和 total 配置，组件外观通过特有样式 styles 控制。

## 特有属性

除支持[通用属性](overview.md)外，还支持以下特有属性：

| 字段名 | 说明 |
|------|------|
| [value](#value) | 当前进度值 |
| [total](#total) | 进度总量 |

### value

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | number | 否 | 当前进度值。<br/>默认值：0。 |

**示例：**

```json
{
  "id": "progressNode",
  "component": "Progress",
  "value": 72
}
```

---

### total

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| total | number | 否 | 进度总量，表示 100% 完成时的总值。 <br/>默认值：100。 |

**示例：**

```json
{
  "id": "progressNode",
  "component": "Progress",
  "total": 100
}
```

---

## 特有样式

支持以下特有样式：

| 字段名 | 说明 |
|------|------|
| [color](#color) | 进度条前景色 |
| [type](#type) | 进度组件类型 |

### color

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| color | string \| Expression \| PathBinding | 否 | 进度前景色。<br/>取值范围：支持任意字符串；字符串输入按颜色格式校验。<br/>默认值：浅色模式 #FF0A59F7，深色模式 #FF317AF7。 |

**示例：**

```json
{
  "id": "progressNode",
  "component": "Progress",
  "styles": {
    "color": "#2563EB"
  }
}
```

---

### type

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string \| Expression \| PathBinding | 否 | 进度组件类型。<br/>取值范围：支持任意字符串，支持 "linear"、"ring"、"eclipse"、"scaleRing"、"capsule"，其余字符串按默认值处理。<br/>默认值："linear"。<br/>"linear" 表示线性进度条；"ring" 表示环形进度条；"eclipse" 表示月蚀样式进度；"scaleRing" 表示刻度环进度；"capsule" 表示胶囊型进度条 |

**示例：**

```json
{
  "id": "progressNode",
  "component": "Progress",
  "styles": {
    "type": "ring"
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
      "$ref": "#/$defs/ExtendedComponentCommon"
    },
    {
      "type": "object",
      "description": "Progress bar component for displaying task completion progress",
      "properties": {
        "component": {
          "const": "Progress"
        },
        "value": {
          "description": "Current progress value. Default: 0.",
          "type": "number",
          "default": 0
        },
        "total": {
          "description": "Total progress value representing 100% completion. Required.",
          "type": "number"
        }
      },
      "required": [
        "component"
      ]
    },
    {
      "type": "object",
      "properties": {
        "styles": {
          "type": "object",
          "properties": {
            "color": {
              "oneOf": [
                {
                  "type": "string"
                },
                {
                  "$ref": "#/$defs/Expression"
                },
                {
                  "$ref": "#/$defs/PathBinding"
                }
              ],
              "description": "Progress bar foreground color in hex format. Default: light mode '#FF0A59F7', dark mode '#FF317AF7'."
            },
            "type": {
              "oneOf": [
                {
                  "type": "string",
                  "enum": [
                    "linear",
                    "ring",
                    "eclipse",
                    "scaleRing",
                    "capsule"
                  ],
                  "default": "linear"
                },
                {
                  "$ref": "#/$defs/Expression"
                },
                {
                  "$ref": "#/$defs/PathBinding"
                }
              ],
              "description": "Progress bar style. Default: 'linear'. 'linear': horizontal bar. 'ring': circular ring without ticks. 'eclipse': moon-phase circular. 'scaleRing': clock-tick circular. 'capsule': capsule shape (vertical when height > width)."
            }
          },
          "additionalProperties": true
        }
      },
      "description": "Progress bar component for displaying task completion. Supports linear, ring, eclipse, scaleRing, and capsule styles."
    }
  ],
  "unevaluatedProperties": false
}
```
