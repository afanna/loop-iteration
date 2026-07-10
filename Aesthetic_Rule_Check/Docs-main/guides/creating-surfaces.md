# 创建 Surface

[Surface](../concepts/surfaces-and-messages.md#surface-是什么) 是 [GenUI](../introduction/what-is-genui.md) 渲染的基本单元。创建并管理 Surface 是构建任何 GenUI 应用的第一步。

---

## 场景：构建一个用户信息表单

> 本示例使用 [A2UI Basic Catalog](../reference/messages.md#basic-catalog)（A2UI 标准协议，18 个标准组件）。如需使用扩展组件（表达式、样式、自适应），将 [catalogId](../reference/messages.md#catalogid-值) 改为 ohos.a2ui.extended.catalog 并参考 [使用扩展组件](using-extended-components.md)。

我们将从零开始，构建一个包含姓名输入、邮箱输入和提交按钮的表单页面。

## DSL 格式要点

- 使用 [component](../reference/standard-components/overview.md#通用属性) 字段标识组件类型（不是 type）
- 属性为扁平结构，不嵌套在 properties 中
- [Button](../reference/standard-components/button.md) 通过 [child](../reference/standard-components/button.md#child) 引用 [Text](../reference/standard-components/text.md) 组件 ID 显示按钮文字
- 容器组件通过 [children](../reference/types.md#childlist) 数组引用子组件 ID
- 每条 [DSL 消息](../reference/messages.md#协议消息信封) 的顶层必须包含 version 字段，且只包含一个消息体

### 消息类型

| 消息字段 | 说明 |
|----------|------|
| [createSurface](../reference/messages.md#createsurface) | 创建 Surface |
| [updateComponents](../reference/messages.md#updatecomponents) | 添加或更新组件 |
| [updateDataModel](../reference/messages.md#updatedatamodel) | 更新数据模型 |
| [deleteSurface](../reference/messages.md#deletesurface) | 销毁 Surface |

---

## 1. 创建 Surface

通过 [SurfaceController.handleMessage()](../reference/API/surface-controller.md#handlemessage) 方法投喂 [createSurface](../reference/messages.md#createsurface) 消息来创建 Surface：

```ts
const controller = SurfaceControllerFactory.createSurfaceController({
  uiContext: this.getUIContext(),
  catalog: CatalogFactory.basic()
})

controller.handleMessage(
  '{"version":"v0.9",' +
  '"createSurface":{' +
  '"surfaceId":"user-form",' +
  '"catalogId":"https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"' +
  '}}'
)
```

### surfaceId 命名策略

[surfaceId](../reference/messages.md#createsurface) 是 Surface 的全局唯一标识，后续所有消息通过它路由到目标 Surface。

| 场景 | 推荐命名 | 说明 |
|------|---------|------|
| 单页应用 | "main" | 简洁，只有一个 Surface |
| 多页面导航 | "product-list", "product-detail", "order-edit" | 语义化，方便调试和日志追踪 |
| LLM 动态生成 | "turn-1", "turn-2" | 多轮对话中区分不同轮次 |
| 使用 UUID | "a1b2c3d4" | 完全避免冲突，但对调试不友好 |

同一时刻，surfaceId 在 [SurfaceController](../reference/API/surface-controller.md#surfacecontroller) 范围内必须唯一。重复创建同名 Surface 会导致错误。

### catalogId 选择

| Catalog | catalogId | 适用 |
|---------|-----------|------|
| Basic Catalog | https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json | 简单表单、纯文本展示 |
| 鸿蒙扩展协议 Catalog | ohos.a2ui.extended.catalog | 需要样式、表达式、自适应 |

同一个 Surface 在创建时确定的 [catalogId](../reference/messages.md#catalogid-值) 不可更改。需要切换到另一套 [Catalog](../concepts/catalogs.md#两套-catalog二选一) 时，必须先销毁当前 Surface 再重建。

---

## 2. 提供组件结构

Surface 创建后，需要发送 [updateComponents](../reference/messages.md#updatecomponents) 来定义 [UI 结构](../concepts/components-and-layout.md#邻接表模型)。你可以一次发送全部组件，也可以**渐进式追加**。

### 渐进式追加

先发送骨架组件，再逐步追加内容：

```ts
// 第一帧：只放根容器和标题
controller.handleMessage(
  '{"version":"v0.9",' +
  '"updateComponents":{' +
  '"surfaceId":"user-form",' +
  '"components":[' +
  '{"id":"root","component":"Column","children":["title"]},' +
  '{"id":"title","component":"Text","text":"用户信息","variant":"h2"}' +
  ']}}'
)

// 第二帧：追加表单字段
controller.handleMessage(
  '{"version":"v0.9",' +
  '"updateComponents":{' +
  '"surfaceId":"user-form",' +
  '"components":[' +
  '{"id":"nameField","component":"TextField","label":"姓名","value":{"path":"/form/name"}},' +
  '{"id":"emailField","component":"TextField","label":"邮箱","value":{"path":"/form/email"},' +
  '"checks":[' +
  '{"condition":{"call":"required","args":{"value":{"path":"/form/email"}}},"message":"邮箱不能为空"},' +
  '{"condition":{"call":"email","args":{"value":{"path":"/form/email"}}},"message":"邮箱格式不正确"}' +
  ']}' +
  ']}}'
)

// 同时更新 root 的 children 列表追加新组件
controller.handleMessage(
  '{"version":"v0.9",' +
  '"updateComponents":{' +
  '"surfaceId":"user-form",' +
  '"components":[' +
  '{"id":"root","component":"Column","children":["title","nameField","emailField","submitBtn"]},' +
  '{"id":"submitBtn","component":"Button","child":"submitText",' +
  '"action":{"event":{"name":"submitForm","context":{' +
  '"name":{"path":"/form/name"},' +
  '"email":{"path":"/form/email"}}}},' +
  '"variant":"primary"},' +
  '{"id":"submitText","component":"Text","text":"提交"}' +
  ']}}'
)
```

> **注意**：[updateComponents](../reference/messages.md#updatecomponents) 使用 **upsert** 语义——[id](../reference/types.md#componentid) 首次出现则新增，id 已存在则覆盖更新。这意味着 root 组件的 [children](../reference/types.md#childlist) 可以在后续消息中追加新 ID。

---

## 3. 填充数据

[updateDataModel](../reference/messages.md#updatedatamodel) 向 Surface 的 [数据模型](../concepts/data-model-and-binding.md#datamodel-是什么) 填充或更新数据。组件中通过 { "path": "/form/name" } 绑定的属性会自动刷新。

```ts
controller.handleMessage(
  '{"version":"v0.9",' +
  '"updateDataModel":{' +
  '"surfaceId":"user-form",' +
  '"path":"/form",' +
  '"value":{"name":"张三","email":"zhangsan@example.com"}' +
  '}}'
)
```

### updateDataModel upsert 语义

| 操作 | 写法 | 行为 |
|------|------|------|
| 设置值 | "path": "/form/name", "value": "Alice" | 路径存在则更新，不存在则创建 |
| 删除值 | "path": "/form/name" （不传 value） | 移除指定路径的键 |
| 替换全部 | "path": "/" 或未提供 path | 整体替换 DataModel |

### sendDataModel：端云数据同步

当 [sendDataModel](../reference/messages.md#createsurface) 设为 true 时，每次用户触发 [Action](../reference/types.md#action)（如点击按钮），GenUI 会自动将当前 Surface 的完整 DataModel 快照附带在 [Action 消息](../reference/messages.md#action客户端服务端) 中发送给 Agent。

这在以下场景至关重要：

- **增量更新**：Agent 需要知道用户当前已经填了什么，才能生成下一步的 DSL
- **多步表单**：用户分步填写，Agent 需要累计的数据
- **上下文感知**：Agent 根据当前 UI 状态做出响应

```ts
controller.handleMessage(
  '{"version":"v0.9",' +
  '"createSurface":{' +
  '"surfaceId":"user-form",' +
  '"catalogId":"https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json",' +
  '"sendDataModel":true' +
  '}}'
)
```

---

## 4. 监听 Surface 状态

通过 [SurfaceEventCallback](../reference/API/surface-controller.md#surfaceeventcallback) 追踪 Surface 生命周期：

```ts
const eventCallback = (eventType: SurfaceEventType, controller: SurfaceController) => {
  switch (eventType) {
    case SurfaceEventType.SURFACE_CREATED:
      console.log('Surface 创建成功，可以开始发送组件')
      break
    case SurfaceEventType.SURFACE_COMPONENTS_UPDATED:
      console.log('组件更新完成')
      break
    case SurfaceEventType.SURFACE_DATA_MODEL_UPDATED:
      console.log('数据模型已更新，绑定的组件会自动刷新')
      break
    case SurfaceEventType.SURFACE_DELETED:
      console.log('Surface 已销毁')
      break
  }
}
```

处理过程中的错误（DSL 解析失败、协议版本不支持、Schema 告警等）通过 [registerErrorCallback](../reference/API/surface-controller.md#registererrorcallback) 获取：

```ts
controller.registerErrorCallback((code, errorMsg) => {
  console.error(`操作失败 [${code}]: ${errorMsg}`)
})
```

---

## 5. 销毁与重建

### 使用 deleteSurface 销毁 Surface

销毁 Surface 使用 [deleteSurface](../reference/messages.md#deletesurface) 消息。

```ts
controller.handleMessage(
  '{"version":"v0.9","deleteSurface":{"surfaceId":"user-form"}}'
)
```

销毁后，该 Surface 的所有组件和数据被清除，不可恢复。

### 何时需要重建

- 切换到不同的 Catalog
- 需要完全重置 UI 状态
- 多轮对话中开始全新的 UI 上下文

```ts
// 切换到扩展 Catalog：先删后建
controller.handleMessage(deleteSurfaceDSL)
controller.handleMessage(createSurfaceDSL)  // 使用新的 catalogId
```

---

## 6. 调试建议

| 问题 | 排查方法 |
|------|----------|
| 创建了 Surface 但没渲染 | 检查是否发送了包含 "id": "root" 的组件 |
| 更新不生效 | 确认 surfaceId 在所有消息中一致 |
| 数据绑定不显示 | 确认 [updateDataModel](../reference/messages.md#updatedatamodel) 的 path 与组件的 path 匹配 |
| 事件回调没触发 | 确认在 [SurfaceControllerFactory.createSurfaceController](../reference/API/factories.md#surfacecontrollerfactorycreatesurfacecontroller) 时传入了 eventCallback |

## 示例：创建并初始化用户信息 Surface

运行前请先完成 [快速上手](../introduction/quickstart.md) 中的工程创建与 GenUI 安装。

```ts
// xxx.ets
import {
  CatalogFactory,
  SurfaceController,
  SurfaceControllerFactory,
  UIRendererComponent
} from '@arkui-genius/genui'

@Entry
@Component
struct Index {
  @State controller: SurfaceController | null = null

  aboutToAppear(): void {
    this.controller = SurfaceControllerFactory.createSurfaceController({
      uiContext: this.getUIContext(),
      catalog: CatalogFactory.basic()
    });

    setTimeout(() => {
      this.controller?.handleMessage(`{
        "version": "v0.9",
        "createSurface": {
          "surfaceId": "user-form",
          "catalogId": "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"
        }
      }`);
    }, 300);

    setTimeout(() => {
      this.controller?.handleMessage(`{
        "version": "v0.9",
        "updateComponents": {
          "surfaceId": "user-form",
          "components": [
            {
              "id": "root",
              "component": "Column",
              "children": ["title", "nameField", "emailField"]
            },
            {
              "id": "title",
              "component": "Text",
              "text": "用户信息",
              "variant": "h2"
            },
            {
              "id": "nameField",
              "component": "TextField",
              "label": "姓名",
              "value": { "path": "/form/name" }
            },
            {
              "id": "emailField",
              "component": "TextField",
              "label": "邮箱",
              "value": { "path": "/form/email" }
            }
          ]
        }
      }`);
    }, 600);

    setTimeout(() => {
      this.controller?.handleMessage(`{
        "version": "v0.9",
        "updateDataModel": {
          "surfaceId": "user-form",
          "path": "/form",
          "value": {
            "name": "张三",
            "email": "zhangsan@example.com"
          }
        }
      }`);
    }, 900);
  }

  aboutToDisappear(): void {
    this.controller?.destroy();
  }

  build() {
    Column() {
      UIRendererComponent({ surfaceController: this.controller })
        .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
    .padding(24)
  }
}
```

![creating-surfaces-example](./figures/creating-surfaces-example.gif)

---

相关指南：
→ [构建 UI（标准组件）](building-ui-standard.md) | → [用户交互处理](handling-user-interactions.md) | → [多 Surface 管理](multi-surface-management.md)
