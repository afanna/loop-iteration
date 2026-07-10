# AudioPlayer 组件

AudioPlayer 组件用于加载音频资源。

**起始版本：**  API Version 20

## 特有属性

除支持[通用属性](overview.md)，还支持以下特有属性：

| 属性 | 说明 |
|------|------|
| [url](#url) | 音频资源地址 |
| [description](#description) | 音频描述信息 |

### url

音频资源地址。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| url | [DynamicString](../functions/functioncall.md#dynamicstring) | 是 | 音频资源地址。当前实现要求可解析为非空字符串后才允许播放。建议使用可直接访问的网络音频地址。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "audio_surface",
    "components": [
      {
        "component": "AudioPlayer",
        "id": "audio1",
        "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      }
    ]
  }
}
```

---

### description

音频描述信息。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| description | [DynamicString](../functions/functioncall.md#dynamicstring) | 否 | 音频描述信息，例如标题、摘要或辅助说明。<br/>默认值：""。未设置时播放器不展示描述文本区域。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "audio_surface",
    "components": [
      {
        "component": "AudioPlayer",
        "id": "audio2",
        "description": "每日播报示例音频",
        "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      }
    ]
  }
}
```

---

## DFX 说明

当宿主通过 [registerErrorCallback](../API/surface-controller.md#registererrorcallback) 注册错误回调时，AudioPlayer 的音频配置异常会通过 [onError](../API/surface-controller.md#errorcallback) 上报。

| 场景 | code值 | warning code | error message | 运行时处理 |
|------|--------|--------------|---------------|------------|
| url 不是有效的音频格式 | 2001 | ERROR_CODE_INVALID_VALUE | Property url expects a supported audio resource format, drop current component | 丢弃该 AudioPlayer 组件 |

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
          "const": "AudioPlayer"
        },
        "url": {
          "$ref": "../common_types.json#/$defs/DynamicString",
          "description": "The URL of the audio to be played."
        },
        "description": {
          "description": "A description of the audio, such as a title or summary.",
          "$ref": "../common_types.json#/$defs/DynamicString"
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
