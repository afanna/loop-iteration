# Text 组件

**起始版本：**  API Version 20

用于渲染扩展文本组件，参考标准 Text 组件，这里的特有属性字段为 content，并通过特有样式 styles 支持字重、换行、溢出、截断、对齐和装饰等能力。

## 特有属性

除支持[通用属性](overview.md)外，还支持以下特有属性：

| 字段名 | 说明 |
|------|------|
| [content](#content) | 文本内容 |

### content

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string \| Expression \| PathBinding | 是 | 要显示的文本内容。<br/>取值范围：支持任意字符串。<br/>默认值：""。<br/>字段缺失时按空字符串处理 |

**示例：**

```json
{
  "id": "textNode",
  "component": "Text",
  "content": "文本内容"
}
```

## 特有样式

支持以下特有样式：

| 字段名 | 说明 |
|------|------|
| [fontColor](#fontcolor) | 文本颜色 |
| [fontSize](#fontsize) | 字号 |
| [fontWeight](#fontweight) | 字重 |
| [maxLines](#maxlines) | 最大显示行数 |
| [minFontSize](#minfontsize) | 自适应字号下限 |
| [maxFontSize](#maxfontsize) | 自适应字号上限 |
| [fontScaleMode](#fontscalemode) | 字体缩放模式 |
| [minFontScale](#minfontscale) | 字体缩放倍率下限 |
| [maxFontScale](#maxfontscale) | 字体缩放倍率上限 |
| [textOverflow](#textoverflow) | 超长文本溢出处理方式 |
| [textAlign](#textalign) | 文本对齐方式 |
| [wordBreak](#wordbreak) | 单词换行策略 |
| [decoration](#decoration) | 文本装饰线配置 |

### fontColor

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| fontColor | string \| Expression \| PathBinding | 否 | 文本颜色。<br/>取值范围：支持任意字符串；字符串输入按颜色格式校验。<br/>默认值：浅色模式 #E5000000，深色模式 #99FFFFFF。<br/>未显式设置时，主题切换会自动刷新默认字体颜色 |

**示例：**

```json
{
  "id": "textNode",
  "component": "Text",
  "content": "文本内容",
  "styles": {
    "fontColor": "#2563EB"
  }
}
```

---

### fontSize

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| fontSize | number \| Expression \| PathBinding | 否 | 文本字号，单位 fp。<br/>默认值：16。 |

**示例：**

```json
{
  "id": "textNode",
  "component": "Text",
  "content": "文本内容",
  "styles": {
    "fontSize": 18
  }
}
```

---

### fontWeight

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| fontWeight | number \| Expression \| PathBinding | 否 | 文本字重。<br/>取值范围：支持 100 到 900 的数值，步长为 100。<br/>默认值：400。<br/>超出范围使用默认值。 |

**示例：**

```json
{
  "id": "textNode",
  "component": "Text",
  "content": "文本内容",
  "styles": {
    "fontWeight": 700
  }
}
```

---

### maxLines

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| maxLines | number \| Expression \| PathBinding | 否 | 最大显示行数。<br/>取值范围：[0, inf]。<br/>默认值：无限制。<br/>超出范围使用默认值。 |

**示例：**

```json
{
  "id": "textNode",
  "component": "Text",
  "content": "这是一段较长的文本内容",
  "styles": {
    "maxLines": 2
  }
}
```

---

### minFontSize

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| minFontSize | number \| Expression \| PathBinding | 否 | 自适应字号下限，单位 fp。<br/>取值范围：大于 0 的数值。<br/>默认值：未设置。<br/>需配合 maxFontSize 以及 maxLines 或布局大小限制使用，单独设置不生效；仅正数生效 |

**示例：**

```json
{
  "id": "textNode",
  "component": "Text",
  "content": "文本内容",
  "styles": {
    "minFontSize": 12
  }
}
```

---

### maxFontSize

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| maxFontSize | number \| Expression \| PathBinding | 否 | 自适应字号上限，单位 fp。<br/>取值范围：大于 0 的数值，且应不小于 minFontSize。<br/>默认值：未设置。<br/>需配合 minFontSize 以及 maxLines 或布局大小限制使用，单独设置不生效；仅正数生效 |

**示例：**

```json
{
  "id": "textNode",
  "component": "Text",
  "content": "文本内容",
  "styles": {
    "maxFontSize": 20
  }
}
```

---

### fontScaleMode

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| fontScaleMode | string \| Expression \| PathBinding | 否 | 字体缩放模式。<br/>取值范围：支持任意字符串，支持 "followSystem" 和 "custom"，其余字符串按默认值处理。<br/>默认值："followSystem"。<br/>"followSystem" 表示跟随系统字体缩放设置；"custom" 表示不跟随系统，使用自定义的 minFontScale 和 maxFontScale。 |

**示例：**

```json
{
  "id": "textNode",
  "component": "Text",
  "content": "文本内容",
  "styles": {
    "fontScaleMode": "custom"
  }
}
```

---

### minFontScale

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| minFontScale | number \| Expression \| PathBinding | 否 | 最小字体缩放比例。<br/>取值范围：[0, 1]。<br/>默认值：跟随系统字体缩放设置。<br/>仅在 fontScaleMode 为 custom 时生效。设置的值小于 0 时按 0 处理，大于 1 时按 1 处理。 |

**示例：**

```json
{
  "id": "textNode",
  "component": "Text",
  "content": "文本内容",
  "styles": {
    "minFontScale": 0.8
  }
}
```

---

### maxFontScale

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| maxFontScale | number \| Expression \| PathBinding | 否 | 最大字体缩放比例。<br/>取值范围：[1, inf)。<br/>默认值：跟随系统字体缩放设置。<br/>仅在 fontScaleMode 为 custom 时生效。设置的值小于 1 时按 1 处理。 |

**示例：**

```json
{
  "id": "textNode",
  "component": "Text",
  "content": "文本内容",
  "styles": {
    "maxFontScale": 1.6
  }
}
```

---

### textOverflow

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| textOverflow | string \| Expression \| PathBinding | 否 | 超长文本的溢出处理方式。<br/>取值范围：支持任意字符串，支持 "none"、"clip"、"ellipsis"、"marquee"，其余字符串按默认值处理。<br/>默认值："clip"。<br/>"none" 表示不启用额外溢出效果；"clip" 表示超出部分直接裁剪；"ellipsis" 表示超出部分显示 ellipsis 标记；"marquee" 表示单行跑马灯效果。 |

**示例：**

```json
{
  "id": "textNode",
  "component": "Text",
  "content": "这是一段较长的文本内容",
  "styles": {
    "textOverflow": "ellipsis"
  }
}
```

---

### textAlign

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| textAlign | string \| Expression \| PathBinding | 否 | 文本对齐方式。<br/>取值范围：支持任意字符串，支持 "start"、"center"、"end"、"justify"，其余字符串按默认值处理。<br/>默认值："start"。<br/>"start" 表示行首对齐；"center" 表示居中对齐；"end" 表示行尾对齐；"justify" 表示两端对齐。 |

**示例：**

```json
{
  "id": "textNode",
  "component": "Text",
  "content": "文本内容",
  "styles": {
    "textAlign": "center"
  }
}
```

---

### wordBreak

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| wordBreak | string \| Expression \| PathBinding | 否 | 单词换行策略。<br/>取值范围：支持任意字符串，支持 "normal"、"breakAll"、"breakWord"、"hyphenation"，其余字符串按默认值处理。<br/>默认值："breakWord"。<br/>"normal" 表示使用默认换行策略；"breakAll" 表示任意字符间允许换行；"breakWord" 表示优先按单词换行，必要时拆词；"hyphenation" 表示允许连字符断词。 |

**示例：**

```json
{
  "id": "textNode",
  "component": "Text",
  "content": "wordBreakExample",
  "styles": {
    "wordBreak": "breakAll"
  }
}
```

---

### decoration

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| decoration | object | 否 | 文本装饰线对象。<br/>默认值：不设置；未设置时等同于不绘制装饰线 |
| decoration.type | string | 否 | 装饰线类型。<br/>取值范围：支持任意字符串，支持 "none"、"underline"、"overline"、"linethrough"，其余字符串按默认值处理。<br/>默认值："none" |
| decoration.color | string | 否 | 装饰线颜色。<br/>取值范围：支持任意字符串；字符串输入按颜色格式校验。<br/>默认值：浅色模式 #FF000000，深色模式 #99FFFFFF。<br/>未显式设置时，主题切换会自动刷新默认装饰线颜色 |
| decoration.style | string | 否 | 装饰线样式。<br/>取值范围：支持任意字符串，支持 "solid"、"double"、"dotted"、"dashed"、"wavy"，其余字符串按默认值处理。<br/>默认值："solid" |
| decoration.thicknessScale | number | 否 | 装饰线粗细倍率。<br/>默认值：1.0 |

**示例：**

```json
{
  "id": "textNode",
  "component": "Text",
  "content": "文本内容",
  "styles": {
    "decoration": {
      "type": "underline"
    }
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
      "properties": {
        "component": {
          "const": "Text"
        },
        "content": {
          "description": "Text content to display. Supports expression binding for dynamic content.",
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
          ]
        }
      },
      "required": [
        "component",
        "content"
      ]
    },
    {
      "type": "object",
      "properties": {
        "styles": {
          "type": "object",
          "properties": {
            "textOverflow": {
              "oneOf": [
                {
                  "type": "string",
                  "enum": [
                    "none",
                    "clip",
                    "ellipsis",
                    "marquee"
                  ],
                  "default": "clip"
                },
                {
                  "$ref": "#/$defs/Expression"
                },
                {
                  "$ref": "#/$defs/PathBinding"
                }
              ],
              "description": "Text overflow behavior when content exceeds maxLines. Default: 'clip'. 'none': truncate at max lines. 'clip': same as none. 'ellipsis': show ellipsis for overflow. 'marquee': scroll text in single line. Must be used with maxLines."
            },
            "decoration": {
              "type": "object",
              "description": "Text decoration line style. Object {type, color, style, thicknessScale}. Default: {type:'none', color:'black', style:'solid', thicknessScale:1.0}. type: none/underline/overline/linethrough. style: solid/double/dotted/dashed/wavy.",
              "properties": {
                "type": {
                  "type": "string",
                  "enum": [
                    "none",
                    "underline",
                    "overline",
                    "linethrough"
                  ],
                  "default": "none"
                },
                "color": {
                  "type": "string"
                },
                "style": {
                  "type": "string",
                  "enum": [
                    "solid",
                    "double",
                    "dotted",
                    "dashed",
                    "wavy"
                  ],
                  "default": "solid"
                },
                "thicknessScale": {
                  "type": "number",
                  "default": 1.0
                }
              }
            },
            "fontSize": {
              "oneOf": [
                {
                  "type": "number",
                  "default": 16
                },
                {
                  "$ref": "#/$defs/Expression"
                },
                {
                  "$ref": "#/$defs/PathBinding"
                }
              ],
              "description": "Font size in fp. Default: 16fp."
            },
            "fontWeight": {
              "oneOf": [
                {
                  "type": "number",
                  "default": 400,
                  "minimum": 100
                },
                {
                  "$ref": "#/$defs/Expression"
                },
                {
                  "$ref": "#/$defs/PathBinding"
                }
              ],
              "description": "Font weight. Default: 400. Range: [100, 900] in steps of 100."
            },
            "fontColor": {
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
              "description": "Font color in hex format (e.g. '#333333')."
            },
            "textAlign": {
              "oneOf": [
                {
                  "type": "string",
                  "enum": [
                    "start",
                    "center",
                    "end",
                    "justify"
                  ],
                  "default": "start"
                },
                {
                  "$ref": "#/$defs/Expression"
                },
                {
                  "$ref": "#/$defs/PathBinding"
                }
              ],
              "description": "Horizontal text alignment. Default: 'start'. Options: start (align leading), center, end (align trailing), justify (both edges)."
            },
            "maxLines": {
              "oneOf": [
                {
                  "type": "number",
                  "minimum": 0
                },
                {
                  "$ref": "#/$defs/Expression"
                },
                {
                  "$ref": "#/$defs/PathBinding"
                }
              ],
              "description": "Maximum number of text lines. Default: inf (no limit when unset or invalid). Range: [0, inf]. Use with textOverflow for overflow behavior."
            },
            "wordBreak": {
              "oneOf": [
                {
                  "type": "string",
                  "enum": [
                    "normal",
                    "breakAll",
                    "breakWord",
                    "hyphenation"
                  ],
                  "default": "breakWord"
                },
                {
                  "$ref": "#/$defs/Expression"
                },
                {
                  "$ref": "#/$defs/PathBinding"
                }
              ],
              "description": "Word break rule. Default: 'breakWord'. 'normal': CJK breaks anywhere, non-CJK at whitespace. 'breakAll': break anywhere. 'breakWord': prefer word boundaries, fallback to anywhere. 'hyphenation': try hyphen at line end."
            },
            "maxFontSize": {
              "oneOf": [
                {
                  "type": "number"
                },
                {
                  "$ref": "#/$defs/Expression"
                },
                {
                  "$ref": "#/$defs/PathBinding"
                }
              ],
              "description": "Maximum adaptive font size in fp. Must be used with minFontSize and maxLines or layout constraints. No effect when maxFontSize <= 0 or maxFontSize < minFontSize."
            },
            "minFontSize": {
              "oneOf": [
                {
                  "type": "number"
                },
                {
                  "$ref": "#/$defs/Expression"
                },
                {
                  "$ref": "#/$defs/PathBinding"
                }
              ],
              "description": "Minimum adaptive font size in fp. Must be used with maxFontSize and maxLines or layout constraints. No effect when minFontSize <= 0."
            },
            "fontScaleMode": {
              "oneOf": [
                {
                  "type": "string",
                  "enum": [
                    "followSystem",
                    "custom"
                  ],
                  "default": "followSystem"
                },
                {
                  "$ref": "#/$defs/Expression"
                },
                {
                  "$ref": "#/$defs/PathBinding"
                }
              ],
              "description": "Font scaling mode. Default: 'followSystem'. 'followSystem': use system setting. 'custom': use custom minFontScale/maxFontScale."
            },
            "minFontScale": {
              "oneOf": [
                {
                  "type": "number",
                  "minimum": 0
                },
                {
                  "$ref": "#/$defs/Expression"
                },
                {
                  "$ref": "#/$defs/PathBinding"
                }
              ],
              "description": "Minimum font scale ratio. Default: follow system. Range: [0, 1]. Values < 0 treated as 0, > 1 treated as 1."
            },
            "maxFontScale": {
              "oneOf": [
                {
                  "type": "number",
                  "minimum": 1
                },
                {
                  "$ref": "#/$defs/Expression"
                },
                {
                  "$ref": "#/$defs/PathBinding"
                }
              ],
              "description": "Maximum font scale ratio. Default: follow system. Range: [1, inf). Values < 1 treated as 1."
            }
          },
          "additionalProperties": true
        }
      },
      "description": "Display component for rendering text content. Supports font styling, color, text overflow, word break, and adaptive font sizing."
    }
  ],
  "unevaluatedProperties": false
}
```
