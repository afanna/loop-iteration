
# Image 组件

Image为图片组件，常用于在应用中显示图片。Image通过url引用图片数据源，支持png、jpg、jpeg、bmp、svg、webp、gif、heif和tiff类型的图片格式，不支持apng和svga格式。

**起始版本：**  API Version 20

## 特有属性

除支持[通用属性](overview.md)，还支持以下特有属性：

| 特有属性 | 说明 |
|------|------|
| [url](#url) | 图片的数据源 |
| [fit](#fit) | 图片的填充效果 |
| [variant](#variant) | 图片的尺寸变体 |

### url

图片的数据源。

**起始版本：**  API Version 20

| 属性 | 类型   | 必填 | 说明                                                         |
| ---- | ------ | ---- | ------------------------------------------------------------ |
| url  | [DynamicString](../types.md#dynamicstring) | 是   | 图片的数据源，支持网络图片。 <br/> 取值范围：支持任意字符串。<br> 默认值：""。 |

**示例DSL：**

```json
{
    "version": "v0.9",
    "updateComponents": {
        "surfaceId": "image_surface",
        "components": [
            {
                "id": "demoImage",
                "component": "Image",
                "url":"https://developer.huawei.com/allianceCmsResource/resource/HUAWEI_Developer_VUE/images/01beta/huaweizhanghao.webp"
            }
        ]
    }
}
```

---

### fit

图片的填充效果。该属性未设置时，采用默认值"contain"，保持宽高比进行缩小或者放大。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| fit | string | 否 | 图片的填充效果。 <br/>取值范围：支持"fill"、"contain"、"cover"、"none"、"scaleDown"，其余字符串按默认值处理。<br> 默认值："contain"。 |

可选字符串枚举值的具体说明如下：

| 名称          | 说明                                                         |
| :------------ | :----------------------------------------------------------- |
| "fill"      | 不保持宽高比进行放大缩小，使得图片充满显示边界，对齐方式为水平居中。<br> |
| "contain"   | 保持宽高比进行缩小或者放大，使得图片完全显示在显示边界内，对齐方式为水平居中。 |
| "cover"     | 保持宽高比进行缩小或者放大，使得图片两边都大于或等于显示边界，对齐方式为水平居中。 |
| "none"     | 保持原有尺寸进行显示，对齐方式为水平居中。                   |
| "scaleDown" | 保持宽高比进行显示，图片缩小或者保持不变，对齐方式为水平居中。 |

**示例DSL：**

```json
{
    "version": "v0.9",
    "updateComponents": {
        "surfaceId": "image_surface",
        "components": [
            {
                "id": "demoImage",
                "component": "Image",
                "url":"https://developer.huawei.com/allianceCmsResource/resource/HUAWEI_Developer_VUE/images/01beta/huaweizhanghao.webp",
                "fit": "cover"
            }
        ]
    }
}
```

---

### variant

图片的尺寸变体。

**起始版本：**  API Version 20

| 属性    | 类型   | 必填 | 说明                                                         |
| ------- | ------ | ---- | ------------------------------------------------------------ |
| variant | string | 否   | 图片的尺寸变体，单位VP。 <br/>取值范围：支持"icon"、"avatar"、"smallFeature"、"mediumFeature"、"largeFeature"、"header"，其余字符串按默认值处理。<br> 默认值："mediumFeature"。 |

可选字符串枚举值的具体说明如下：

| 名称              | 说明                         |
| :---------------- | :--------------------------- |
| "icon"          | 小图标，尺寸 32×32。<br>     |
| "avatar"        | 圆形头像，尺寸 32×32。       |
| "smallFeature"  | 小型图像，尺寸 50×50。       |
| "mediumFeature" | 中型图像，尺寸 150×150。     |
| "largeFeature"  | 大型图像，尺寸 400×400。     |
| "header"        | 横幅图片，全宽，无高度限制。 |

**示例DSL：**

```json
{
    "version": "v0.9",
    "updateComponents": {
        "surfaceId": "image_surface",
        "components": [
            {
                "id": "demoImage",
                "component": "Image",
                "url":"https://developer.huawei.com/allianceCmsResource/resource/HUAWEI_Developer_VUE/images/01beta/huaweizhanghao.webp",
                "variant": "mediumFeature"
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
          "const": "Image"
        },
        "url": {
          "$ref": "../common_types.json#/$defs/DynamicString",
          "description": "The URL of the image to display."
        },
        "fit": {
          "type": "string",
          "description": "Specifies how the image should be resized to fit its container. This corresponds to the CSS `object-fit` property. Values: `contain` preserves the image aspect ratio and fits the whole image inside the container; `cover` preserves aspect ratio and fills the container, cropping if needed; `fill` stretches the image to fill the container; `none` keeps the intrinsic image size; `scaleDown` uses the smaller result of `none` or `contain`.",
          "enum": [
            "contain",
            "cover",
            "fill",
            "none",
            "scaleDown"
          ],
          "default": "contain"
        },
        "variant": {
          "type": "string",
          "description": "A hint for the image size and style. Values: `icon` is a small symbolic image; `avatar` is a compact circular user or entity image; `smallFeature` is a small thumbnail or supporting image; `mediumFeature` is the default feature image size; `largeFeature` is a prominent large image; `header` is a wide banner-style image.",
          "enum": [
            "icon",
            "avatar",
            "smallFeature",
            "mediumFeature",
            "largeFeature",
            "header"
          ],
          "default": "mediumFeature"
        }
      },
      "required": [
        "component",
        "url"
      ]
    }
  ],
  "unevaluatedProperties": false
}
```

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
