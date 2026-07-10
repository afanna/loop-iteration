# Surface 与消息

A2UI 协议通过 4 种消息类型驱动 UI 的创建、更新和销毁。GenUI 通过 [SurfaceController.handleMessage()](../reference/API/surface-controller.md#handlemessage) 接收这些消息并处理。理解 Surface 生命周期和消息传递是使用 GenUI 的第一步。

## Surface 是什么

**Surface** 是 GenUI 中一个独立的 UI 区域。每个 Surface 有自己的：

- 组件树（由 updateComponents 消息构建）
- 数据模型（由 updateDataModel 消息填充）
- 独立的生命周期（创建 → 更新 → 销毁）
- 绑定的 Catalog（决定可用哪套组件）

一个应用可以有多个 Surface，分别渲染不同的 UI 区域。

## 四种消息类型

消息通过 [SurfaceController.handleMessage()](../reference/API/surface-controller.md#handlemessage) 喂入。每条消息是一个 JSON 对象，包含一个顶层 key 来标识消息类型：

### createSurface

创建一个新的 Surface 并指定其基本配置。

```json
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "main-page",
    "catalogId": "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json",
    "theme": {
      "primaryColor": "#00BFFF"
    }
  }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| surfaceId | 是 | Surface 的唯一标识，后续消息通过此 ID 引用 |
| catalogId | 是 | 绑定的 Catalog，决定可用哪套组件 |
| theme | 否 | 主题配置（品牌色等），仅标准协议支持 |

**A2UI 标准协议**（18 个标准组件）：

```ts
controller.handleMessage(
  '{"version":"v0.9",' +
  '"createSurface":{' +
  '"surfaceId":"main-page",' +
  '"catalogId":"https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"' +
  '}}'
)
```

**鸿蒙扩展协议**（21 个扩展组件 + styles + 表达式 + 事件链）：

```ts
controller.handleMessage(JSON.stringify({
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "main-page",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
}))
```

> 💡 catalogId 决定了这个 Surface 用哪套组件体系。填标准地址走标准协议，填 ohos.a2ui.extended.catalog 走扩展协议。theme 仅在标准协议下生效。端侧 Controller 需要用 CatalogFactory.extended() 创建，以启用扩展组件的渲染能力。同一个 Surface 不能混用两套组件。详见 [A2UI 与鸿蒙扩展](../introduction/a2ui-and-harmonyos.md)。

### updateComponents

向指定 Surface 提供或更新组件定义。组件以扁平邻接表的形式提供。

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "main-page",
    "components": [
      { "id": "root", "component": "Column", "children": ["title"] },
      { "id": "title", "component": "Text", "text": "Hello" }
    ]
  }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| surfaceId | 是 | 目标 Surface ID |
| components | 是 | 组件对象数组，每个必须有 id 和 component |

### updateDataModel

更新 Surface 的数据模型，触发数据绑定刷新。

```json
{
  "version": "v0.9",
  "updateDataModel": {
    "surfaceId": "main-page",
    "path": "/user",
    "value": { "name": "Alice", "age": 28 }
  }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| surfaceId | 是 | 目标 Surface ID |
| path | 否 | JSON Pointer 路径，默认 / |
| value | 否 | 新数据，未提供时删除对应 key |

### deleteSurface

删除一个 Surface 及其所有组件和数据。

```json
{
  "version": "v0.9",
  "deleteSurface": {
    "surfaceId": "main-page"
  }
}
```

## Surface 生命周期与事件回调

通过创建 SurfaceController 时传入的事件回调，你可以监听 Surface 的状态变化：

```ts
import { SurfaceController, SurfaceEventType, SurfaceControllerFactory } from '@arkui-genius/genui'

const eventCallback = (eventType: SurfaceEventType, controller: SurfaceController) => {
  switch (eventType) {
    case SurfaceEventType.SURFACE_CREATED:
      console.log('Surface 已创建')
      break
    case SurfaceEventType.SURFACE_COMPONENTS_UPDATED:
      console.log('组件已更新')
      break
    case SurfaceEventType.SURFACE_DATA_MODEL_UPDATED:
      console.log('数据模型已更新')
      break
    case SurfaceEventType.SURFACE_DELETED:
      console.log('Surface 已删除')
      break
  }
}

const controller = SurfaceControllerFactory.createSurfaceController({
  uiContext: this.getUIContext(),
  catalog,
  eventCallback
})
```

| SurfaceEventType | 触发时机 |
|------------------|----------|
| SURFACE_CREATED | createSurface 消息处理完成 |
| SURFACE_COMPONENTS_UPDATED | updateComponents 消息处理完成 |
| SURFACE_DATA_MODEL_UPDATED | updateDataModel 消息处理完成 |
| SURFACE_DELETED | deleteSurface 消息处理完成 |

## 典型消息序列

一个典型的 UI 渲染会话：

```
1. createSurface(surfaceId: "main")        ← 初始化 Surface
2. updateComponents(surfaceId: "main", ...)  ← 提供组件结构
3. updateDataModel(surfaceId: "main", ...)   ← 填充数据
   [用户看到 UI]
4. updateDataModel(surfaceId: "main", ...)   ← 数据更新，UI 自动刷新
5. updateComponents(surfaceId: "main", ...)  ← 组件结构更新
   [UI 实时变化]
6. deleteSurface(surfaceId: "main")          ← 销毁 Surface
```

消息可以多次发送。在 Surface 存活期内，updateComponents 和 updateDataModel 可以反复调用，GenUI 会自动合并增量更新。

消息按投喂顺序处理，但屏幕只呈现下一帧的最终状态。不要在同一轮同步流程中连续发送 createSurface、updateComponents、deleteSurface，否则 Surface 可能已被删除，页面看起来像没有渲染。用于展示的消息和用于清理的 deleteSurface 应分开调度。

## 完整示例：用户资料卡片

以下示例展示了一个完整的 GenUI 渲染会话——从创建 Surface 到销毁，覆盖所有四种消息类型、事件回调和 Action 处理：

```ts
import {
  CatalogFactory,
  SurfaceController,
  SurfaceControllerFactory,
  SurfaceEventType,
  UIRendererComponent
} from '@arkui-genius/genui'

// ① 准备 Catalog（决定可用哪套组件）
const catalog = CatalogFactory.basic()

// ② 定义事件回调，监听 Surface 生命周期
const eventCallback = (eventType: SurfaceEventType, controller: SurfaceController) => {
  switch (eventType) {
    case SurfaceEventType.SURFACE_CREATED:
      console.log('Surface 已创建')
      break
    case SurfaceEventType.SURFACE_COMPONENTS_UPDATED:
      console.log('组件已更新')
      break
    case SurfaceEventType.SURFACE_DATA_MODEL_UPDATED:
      console.log('数据已更新')
      break
    case SurfaceEventType.SURFACE_DELETED:
      console.log('Surface 已销毁')
      break
  }
}

// ③ 创建 SurfaceController
const controller = SurfaceControllerFactory.createSurfaceController({
  uiContext: this.getUIContext(),
  catalog,
  eventCallback
})

// ④ 注册 Action 接收器（处理用户交互）
controller.registerActionReceiver((action: string) => {
  const parsed = JSON.parse(action)
  // parsed.action.name → "editProfile"
  // parsed.action.sourceComponentId → "btn"
  console.log(`用户操作: ${parsed.action.name}`)
})

// ⑤ 创建 Surface
controller.handleMessage(
  '{"version":"v0.9",' +
  '"createSurface":{' +
  '"surfaceId":"profile",' +
  '"catalogId":"https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json",' +
  '"theme":{"primaryColor":"#00BFFF"}' +
  '}}'
)

// ⑥ 提交组件结构（用 path 绑定数据）
controller.handleMessage(
  '{"version":"v0.9",' +
  '"updateComponents":{' +
  '"surfaceId":"profile",' +
  '"components":[' +
  '{"id":"root","component":"Column","children":["name","role","btn"]},' +
  '{"id":"name","component":"Text","text":{"path":"/user/name"}},' +
  '{"id":"role","component":"Text","text":{"path":"/user/role"}},' +
  '{"id":"btn","component":"Button","child":"btn_text",' +
  '"action":{"event":{"name":"editProfile"}}},' +
  '{"id":"btn_text","component":"Text","text":"编辑资料"}' +
  ']}}'
)

// ⑦ 填充数据 → UI 自动渲染
controller.handleMessage(
  '{"version":"v0.9",' +
  '"updateDataModel":{' +
  '"surfaceId":"profile",' +
  '"path":"/",' +
  '"value":{"user":{"name":"Alice","role":"工程师"}}' +
  '}}'
)
```

在 ArkUI 页面中渲染：

```ts
// ⑧ 绑定到 UIRendererComponent，自动渲染
build() {
  UIRendererComponent({ surfaceController: this.controller })
}
```

Surface 存活期间，可反复更新数据和组件：

```ts
// ⑨ 数据更新 → UI 自动刷新（无需重发组件）
controller.handleMessage(
  '{"version":"v0.9",' +
  '"updateDataModel":{' +
  '"surfaceId":"profile",' +
  '"path":"/user/role",' +
  '"value":"高级工程师"' +
  '}}'
)

// ⑩ 组件结构更新（追加或覆盖）
controller.handleMessage(
  '{"version":"v0.9",' +
  '"updateComponents":{' +
  '"surfaceId":"profile",' +
  '"components":[' +
  '{"id":"root","component":"Column","children":["name","role","bio","btn"]},' +
  '{"id":"bio","component":"Text","text":{"path":"/user/bio"}}' +
  ']}}'
)

// 同步补充新字段的数据
controller.handleMessage(
  '{"version":"v0.9",' +
  '"updateDataModel":{' +
  '"surfaceId":"profile",' +
  '"path":"/user/bio",' +
  '"value":"热爱编程，专注于跨端 UI 框架"' +
  '}}'
)
```

页面退出时销毁 Surface：

```ts
// ⑪ 销毁 Surface，释放资源
controller.handleMessage(
  '{"version":"v0.9",' +
  '"deleteSurface":{"surfaceId":"profile"}' +
  '}'
)
```

上面的示例覆盖了 GenUI 的完整工作流：

| 步骤 | 消息类型 | 说明 |
|------|---------|------|
| ⑤ | createSurface | 初始化 Surface，绑定 Catalog 和主题 |
| ⑥ | updateComponents | 提交组件骨架，用 { "path": "..." } 声明数据绑定 |
| ⑦ | updateDataModel | 填充数据，组件自动渲染 |
| ⑨ | updateDataModel | 增量更新数据，UI 自动刷新 |
| ⑩ | updateComponents | 增量更新组件结构 |
| ⑪ | deleteSurface | 销毁 Surface |

## 状态查询

Surface 的生命周期变化通过创建控制器时传入的 eventCallback 获取；处理过程中的错误通过 [registerErrorCallback](../reference/API/surface-controller.md#registererrorcallback) 获取。多 Surface 栈顶查询见 [MultiSurfaceController.getLatestSurfaceId](../reference/API/multi-surface-controller.md#getlatestsurfaceid)。

```ts
// 处理错误：DSL 解析失败、协议版本不支持等
controller.registerErrorCallback((code, errorMsg) => {
  console.info(`Error: ${code} - ${errorMsg}`)
})
```

---


← 概念层总览：[overview](overview.md)

→ 下一节：[组件与布局](components-and-layout.md)

> **延伸阅读**：[A2UI 官方文档 - 消息类型](https://a2ui.org/reference/messages/)
