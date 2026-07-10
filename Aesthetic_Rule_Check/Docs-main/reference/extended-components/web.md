# Web 组件

用于在页面中嵌入 Web 内容。

## 使用前提

该组件属于扩展 Catalog 内置组件。创建控制器时使用 CatalogFactory.extended()，并在 createSurface 中使用 ohos.a2ui.extended.catalog。

```ts
import {
  CatalogFactory,
  SurfaceControllerFactory
} from '@arkui-genius/genui'

const controller = SurfaceControllerFactory.createSurfaceController({
  uiContext: uiContext,
  catalog: CatalogFactory.extended()
})
```

## 属性

除支持 [通用属性](overview.md#通用属性) 和 [styles 通用样式](overview.md#styles-通用样式)，还支持以下属性：

| 属性 | 说明 |
|------|------|
| [url](#url) | Web 地址，支持静态字符串、路径绑定和函数调用 |
| [styles](#styles) | 通用样式对象（当前无专用私有样式字段） |

### url

Web 地址。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| url | [DynamicString](../types.md#dynamicstring) | 是 | 支持静态字符串、[DataBinding](../types.md#databinding) 路径绑定和返回字符串的 [FunctionCall](../functions/functioncall.md)。文档层要求必传；如果未传或解析失败，运行时会回退为空字符串 ""，不会主动加载页面。 |

说明：

- 直接传字符串时，例如 "https://example.com"，组件会把它当作当前页面地址。
- 传 { "path": "/webState/url" } 时，会从 DataModel 读取地址字符串。
- 传函数调用对象时，运行时会先执行函数，再把返回的字符串当作地址使用。

### styles

通用样式对象。

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles | object | 否 | 支持 [styles 通用样式](overview.md#styles-通用样式)。当前 Web 暂无专用私有样式字段。 |

## 运行时行为

- 组件始终渲染内置 Web 视图，src 由当前 url 驱动。
- url 为空时不会显示额外 fallback 文案，而是使用空 src。
- 当 url 从“非空旧值”变为“新的非空值”时，会额外尝试加载新地址；调用过程有异常保护，不会因为一次加载失败导致组件崩溃。
- 非法 URL 不会导致组件崩溃，失败会记录告警日志。

## 异常值与边界处理

- url 解析失败、为空或类型不匹配时，最终保持空 src，不会主动加载。
- 加载过程中若出现异常，会在组件内部兜底处理，不会因为非法地址直接抛出到组件外层。
- 文档层建议始终传可用的字符串地址或可稳定解析为字符串的动态值。
- 如果你在日志里看到 fallback 相关字样，可以把它理解为“这次 url 没解析出可用值，所以组件改用了安全空值继续渲染”；相关规则见 [链式执行规则](overview.md#链式执行规则)。

## 示例

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "extended-web-surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateDataModel": {
    "surfaceId": "extended-web-surface",
    "value": {
      "webState": {
        "url": "https://example.com"
      }
    }
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-web-surface",
    "components": [
      {
        "id": "root",
        "component": "Web",
        "url": {
          "path": "/webState/url"
        },
        "weight": 1
      }
    ]
  }
}
]
```

## 组件Schema

```json
{
  "type": "object",
  "allOf": [
    { "$ref": "../common_types.json#/$defs/ComponentCommon" },
    { "$ref": "../common_types.json#/$defs/CatalogComponentCommon" },
    {
      "type": "object",
      "properties": {
        "component": { "const": "Web" },
        "url": {
          "$ref": "../common_types.json#/$defs/DynamicString",
          "description": "Address of the web component. Accepts strings and data binding paths."
        },
        "styles": {
          "description": "Shared extended component styles. No dedicated Web style fields are defined currently.",
          "allOf": [
            { "$ref": "../common_types.json#/$defs/ExtendedCommonStyles" }
          ]
        }
      },
      "required": ["component", "url"]
    }
  ],
  "additionalProperties": true
}
```
↑ [返回 Reference 总览](../../README.md#reference-api-速查)

