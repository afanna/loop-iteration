# Divider 组件

用于渲染扩展分割线组件。与基础 Divider 组件不同，扩展版本的特有样式统一放在 styles 下，通过 strokeWidth、vertical 和 color 控制线条厚度、方向和颜色。

## 特有样式

除支持[通用属性](overview.md)外，还支持以下特有样式：

| 字段名 | 说明 |
|------|------|
| [strokeWidth](#strokewidth) | 分割线厚度 |
| [vertical](#vertical) | 分割线方向 |
| [color](#color) | 分割线颜色 |

### strokeWidth

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| strokeWidth | string \| number \| Expression \| PathBinding | 否 | 分割线厚度。<br/>取值范围：支持 number 或 string。number 按 vp 处理；string 支持 vp、px、fp、% 单位。<br/>默认值："1px"。<br/>无效值回退到 1px |

支持以下写法：

| 写法 | 说明 |
|------|------|
| 2 | 数字按 vp 处理 |
| "2vp" | 逻辑像素 |
| "1px" | 物理像素 |
| "6fp" | 字体像素 |
| "20%" | 当前厚度方向上的百分比 |

**示例：**

```json
{
  "id": "dividerNode",
  "component": "Divider",
  "styles": {
    "strokeWidth": "2vp"
  }
}
```

---

### vertical

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| vertical | boolean \| Expression \| PathBinding | 否 | 分割线方向。<br/>取值范围：true 或 false。<br/>默认值：false。<br/>false 表示横向分割线，true 表示纵向分割线 |

**示例：**

```json
{
  "id": "dividerNode",
  "component": "Divider",
  "styles": {
    "vertical": true
  }
}
```

---

### color

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| color | string \| Expression \| PathBinding | 否 | 分割线颜色。<br/>取值范围：支持任意字符串；字符串输入按颜色格式校验。<br/>默认值：浅色模式 #33000000，深色模式 #33FFFFFF。<br/>未显式设置时，主题切换会自动刷新默认分割线颜色 |

**示例：**

```json
{
  "id": "dividerNode",
  "component": "Divider",
  "styles": {
    "color": "#16A34A"
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
      "description": "Divider component for visually separating content areas",
      "properties": {
        "component": {
          "const": "Divider"
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
            "strokeWidth": {
              "oneOf": [
                {
                  "type": "number"
                },
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
              "default": "1px",
              "description": "Divider line width. Default: '1px'. Number (unit: vp) or string with unit. Invalid values use default."
            },
            "vertical": {
              "oneOf": [
                {
                  "type": "boolean",
                  "default": false
                },
                {
                  "$ref": "#/$defs/Expression"
                },
                {
                  "$ref": "#/$defs/PathBinding"
                }
              ],
              "description": "Divider direction. Default: false (horizontal). true for vertical divider."
            },
            "color": {
              "oneOf": [
                {
                  "type": "string",
                  "default": "#33000000"
                },
                {
                  "$ref": "#/$defs/Expression"
                },
                {
                  "$ref": "#/$defs/PathBinding"
                }
              ],
              "description": "Divider color in hex format. Default: light mode #33000000, dark mode #33FFFFFF."
            }
          },
          "additionalProperties": true
        }
      },
      "description": "Divider component for visually separating content areas. Supports horizontal/vertical orientation, custom width, and color."
    }
  ],
  "unevaluatedProperties": false
}
```
