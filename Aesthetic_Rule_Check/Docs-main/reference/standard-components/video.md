# Video 组件

Video 组件用于显示视频资源。

**起始版本：**  API Version 20

## 特有属性

除支持[通用属性](overview.md)，还支持以下特有属性：

| 属性 | 说明 |
|------|------|
| [url](#url) | 视频的数据源URL |

### url

视频的数据源URL

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| url | [DynamicString](../functions/functioncall.md#dynamicstring) | 是 | 视频的数据源URL。 <br/>取值范围：支持任意字符串。当前运行时要求可解析为非空字符串，空字符串会导致视频无法播放。<br/>默认值：""。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "video_surface",
    "components": [
      {
        "component": "Video",
        "id": "video1",
        "url": "https://www.runoob.com/try/demo_source/movie.mp4"
      }
    ]
  }
}
```

## DFX 说明

当宿主通过 [registerErrorCallback](../API/surface-controller.md#registererrorcallback) 注册错误回调时，Video 的视频配置异常会通过 [onError](../API/surface-controller.md#errorcallback) 上报。


| 场景 | code 值 | warning code | error message | 运行时处理 |
|------|---------|--------------|---------------|------------|
| url 不是有效的视频格式 | 2001 | ERROR_CODE_INVALID_VALUE | Property url expects a supported video resource format, drop current component | 丢弃该 Video 组件 |


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
          "const": "Video"
        },
        "url": {
          "$ref": "../common_types.json#/$defs/DynamicString",
          "description": "The URL of the video to display."
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
