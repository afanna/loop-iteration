# Image 组件

用于渲染扩展图片组件。与基础 Image 组件不同，扩展版本使用特有属性 src 作为图片源字段，并通过特有样式 objectFit、aspectRatio 控制展示方式。

## 特有属性

除支持[通用属性](overview.md)外，还支持以下特有属性：

| 字段名 | 说明 |
|------|------|
| [src](#src) | 图片资源地址 |

### src

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| src | string \| Expression \| PathBinding | 是 | 图片资源地址。<br/>取值范围：支持任意字符串，base64编码的svg格式不支持。<br/>默认值：""。<br/>字段缺失时按空字符串处理 |

当 src 为空字符串时，组件会清空当前图片源，可用于回退到背景色、占位态或其他外层容器效果。

**示例：**

```json
{
  "id": "imageNode",
  "component": "Image",
  "src": "resources/base/media/background.png"
}
```

## 特有样式

支持以下特有样式：

| 字段名 | 说明 |
|------|------|
| [objectFit](#objectfit) | 图片填充模式 |
| [aspectRatio](#aspectratio) | 图片宽高比 |

### objectFit

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| objectFit | string \| Expression \| PathBinding | 否 | 图片填充模式。<br/>取值范围：支持任意字符串，支持 "fill"、"contain"、"cover"、"auto"、"none"、"scaleDown"、"topStart"、"top"、"topEnd"、"start"、"center"、"end"、"bottomStart"、"bottom"、"bottomEnd"、"matrix"，其余字符串按默认值处理。<br/>默认值："cover"。<br/>"fill" 表示拉伸填满容器；"contain" 表示完整显示图片并保持宽高比；"cover" 表示覆盖容器并在必要时裁剪；"auto" 表示交由系统自动处理；"none" 表示保持原始尺寸；"scaleDown" 表示在 none 和 contain 间选择较小效果；"topStart"、"top"、"topEnd"、"start"、"center"、"end"、"bottomStart"、"bottom"、"bottomEnd" 表示原始尺寸下的不同对齐位置；"matrix" 表示原始尺寸矩阵模式 |

**示例：**

```json
{
  "id": "imageNode",
  "component": "Image",
  "src": "resources/base/media/background.png",
  "styles": {
    "objectFit": "cover"
  }
}
```

---

### aspectRatio

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| aspectRatio | number \| Expression \| PathBinding | 否 | 图片宽高比。<br/>取值范围：大于 0 的数值。<br/>默认值：1.0。<br/>通常与固定宽度或固定高度配合使用，例如 1.0 表示正方形，1.5 表示宽大于高，0.5 表示高大于宽。仅设置宽度时，高度 = 宽度 / 宽高比；仅设置高度时，宽度 = 高度 * 宽高比；同时设置宽高和宽高比时，会按宽高比重算高度；constraintSize 的优先级高于 aspectRatio。 <br/>超出范围使用默认值。 |

**示例：**

```json
{
  "id": "imageNode",
  "component": "Image",
  "src": "resources/base/media/background.png",
  "styles": {
    "aspectRatio": 1.5
  }
}
```

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
      "description": "Image component for displaying local, network, or resource images",
      "properties": {
        "component": {
          "const": "Image"
        },
        "src": {
          "description": "Image source URL or local resource path. Supports expression binding for dynamic image source. SVG format is not supported, including base64-encoded SVG (e.g., data:image/svg+xml;base64,...).",
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
        "src"
      ]
    },
    {
      "type": "object",
      "properties": {
        "styles": {
          "type": "object",
          "properties": {
            "aspectRatio": {
              "oneOf": [
                {
                  "type": "number",
                  "default": 1.0
                },
                {
                  "$ref": "#/$defs/Expression"
                },
                {
                  "$ref": "#/$defs/PathBinding"
                }
              ],
              "description": "Width-to-height ratio (width/height). Default: 1.0. When only width is set, height = width/ratio. When only height is set, width = height*ratio. When both set with ratio, height is recalculated. constraintSize takes priority over aspectRatio."
            },
            "objectFit": {
              "oneOf": [
                {
                  "type": "string",
                  "enum": [
                    "fill",
                    "contain",
                    "cover",
                    "auto",
                    "none",
                    "scaleDown",
                    "topStart",
                    "top",
                    "topEnd",
                    "start",
                    "center",
                    "end",
                    "bottomStart",
                    "bottom",
                    "bottomEnd",
                    "matrix"
                  ],
                  "default": "cover"
                },
                {
                  "$ref": "#/$defs/Expression"
                },
                {
                  "$ref": "#/$defs/PathBinding"
                }
              ],
              "description": "Image fill mode. Default: 'cover'. 'fill': stretch to fill. 'contain': fit inside maintaining ratio. 'cover': fill covering bounds. 'auto': proportional scaling. 'none': original size centered. 'scaleDown': shrink or keep original. Also supports alignment positions: topStart/top/topEnd/start/center/end/bottomStart/bottom/bottomEnd, and 'matrix' for custom positioning."
            }
          },
          "additionalProperties": true
        }
      },
      "description": "Image component for displaying local, network, or resource images. Supports aspect ratio and various object-fit modes."
    }
  ],
  "unevaluatedProperties": false
}
```
