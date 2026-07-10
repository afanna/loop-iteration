# 消息格式参考

## 协议消息信封

每条 A2UI 消息是一个 JSON 对象，顶层必须包含 version 字段，且只包含下列四个消息体之一：

```json
{
  "version": "v0.9",
  "<消息类型>": { ... }
}
```

## createSurface

创建一个新的 UI Surface。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| surfaceId | string | 是 | Surface 唯一标识 |
| catalogId | string | 是 | 绑定的 Catalog ID |
| theme | object | 否 | 主题配置：{ "primaryColor", "darkPrimaryColor" }。标准协议使用；扩展组件不解析该字段 |
| sendDataModel | boolean | 否 | 是否在每次 Action 中附带 DataModel 快照 |

```json
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "main",
    "catalogId": "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json",
    "theme": {
      "primaryColor": "#0A59F7"
    },
    "sendDataModel": true
  }
}
```

> theme 仅对标准 Catalog 生效。使用 ohos.a2ui.extended.catalog 时，扩展组件不解析该字段。

## updateComponents

提供或更新组件定义。组件以扁平邻接表形式提供。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| surfaceId | string | 是 | 目标 Surface ID |
| components | array | 是 | 组件对象数组，每个必须有 id 和 component |

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "main",
    "components": [
      { "id": "root", "component": "Column", "children": ["title", "btn"] },
      { "id": "title", "component": "Text", "text": "Hello" }
    ]
  }
}
```

## updateDataModel

更新 Surface 的数据模型。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| surfaceId | string | 是 | 目标 Surface ID |
| path | string | 否 | JSON Pointer 路径，默认 / |
| value | any | 否 | 新数据；未提供时删除对应 key |

```json
{
  "version": "v0.9",
  "updateDataModel": {
    "surfaceId": "main",
    "path": "/user",
    "value": { "name": "Alice", "age": 28 }
  }
}
```

## deleteSurface

销毁一个 Surface。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| surfaceId | string | 是 | 要删除的 Surface ID |

```json
{
  "version": "v0.9",
  "deleteSurface": {
    "surfaceId": "main"
  }
}
```

## Action（客户端→服务端）

用户交互事件消息格式：

```json
{
  "version": "v0.9",
  "action": {
    "name": "submitForm",
    "surfaceId": "main",
    "sourceComponentId": "submit-btn",
    "timestamp": "2026-05-26T10:00:00Z",
    "context": { "email": "alice@example.com" }
  }
}
```

| 字段 | 说明 |
|------|------|
| name | 事件名称 |
| surfaceId | 来源 Surface |
| sourceComponentId | 触发交互的组件 ID |
| timestamp | ISO 8601 时间戳 |
| context | 事件上下文数据 |

## catalogId 值

### Basic Catalog

```
https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json
```

### 鸿蒙扩展协议 Catalog

```
ohos.a2ui.extended.catalog
```

---

↑ [返回 Reference 总览](../README.md#reference-api-速查)
