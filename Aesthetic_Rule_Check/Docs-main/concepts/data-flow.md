# 数据流

[A2UI 协议](../introduction/a2ui-and-harmonyos.md#a2ui-是什么) 是传输层无关的——它定义 [消息格式](../reference/messages.md#协议消息信封) 的语义契约，但不规定具体的传输格式。[GenUI](../introduction/what-is-genui.md) 通过 [handleMessage()](../reference/API/surface-controller.md#handlemessage) 方法接收每条消息，独立于消息的来源和传输方式。

## 消息到达 → 内部处理

每条消息通过 [controller.handleMessage(json)](../reference/API/surface-controller.md#handlemessage) 进入 GenUI。GenUI 逐条同步处理，自动管理内部的组件缓冲和 [数据模型](data-model-and-binding.md#datamodel-是什么)：

```ts
controller.handleMessage('{"version":"v0.9","createSurface":{"surfaceId":"main",...}}')
controller.handleMessage('{"version":"v0.9","updateComponents":{"surfaceId":"main",...}}')
controller.handleMessage('{"version":"v0.9","updateDataModel":{"surfaceId":"main",...}}')
```

每次 [handleMessage()](../reference/API/surface-controller.md#handlemessage) 调用是同步处理，GenUI 内部会自动合并增量变更。

每条消息会立即更新内部状态，但不保证单独产生可见帧。如果同一轮同步流程中先创建、更新 Surface，又立即发送 [deleteSurface](../reference/messages.md#deletesurface)，下一帧可能只看到已删除后的空状态。需要观察中间结果时，将展示消息分帧投喂，并延后清理消息。

## 消息顺序与容错

A2UI 的 [消息格式](../reference/messages.md#协议消息信封) 有推荐的顺序，但 GenUI 不强制要求严格顺序：

```
推荐顺序：createSurface → updateComponents → updateDataModel

容错行为：
  · updateComponents 早于对应 createSurface 到达 → 整条消息被丢弃
  · updateDataModel 早于对应 createSurface 到达 → 整条消息被丢弃
  · 组件间 children 引用的 id 尚未到达 → 占位，等到达后补渲染
```

[createSurface](../reference/messages.md#createsurface) 必须先于 [updateComponents](../reference/messages.md#updatecomponents) 和 [updateDataModel](../reference/messages.md#updatedatamodel) 到达，否则后两者会被丢弃。组件之间（[children](../reference/types.md#childlist) 引用）的到达顺序没有严格要求——GenUI 会等待引用的组件就绪后补渲染。

## 增量更新与合并

同一 [Surface](surfaces-and-messages.md#surface-是什么) 的组件可以通过多次 [updateComponents](../reference/messages.md#updatecomponents) 逐步追加或覆盖。下面以 [Column](../reference/standard-components/column.md) 容器和 [Text](../reference/standard-components/text.md) 组件为例：

```ts
// 第一帧：骨架
controller.handleMessage(updateComponents('main', [
  { "id": "root", "component": "Column", "children": ["title"] },
  { "id": "title", "component": "Text", "text": "加载中..." }
]))

// 第二帧：追加内容（同时更新 root 的 children）
controller.handleMessage(updateComponents('main', [
  { "id": "root", "component": "Column", "children": ["title", "content"] },
  { "id": "content", "component": "Text", "text": "内容已加载" }
]))
```

GenUI 内部的组件缓冲使用 **upsert** 语义：同一 [id](../reference/types.md#componentid) 的组件后到达的覆盖先到达的，不同 [id](../reference/types.md#componentid) 的组件累加到缓冲池中。

[updateDataModel](../reference/messages.md#updatedatamodel) 同样支持增量更新——可以只更新某个 [JSON Pointer 路径](data-model-and-binding.md#json-pointer-路径) 的值，而不需要发送完整的 [数据模型](data-model-and-binding.md#datamodel-是什么)。

## Surface 路由

消息通过 [surfaceId](../reference/messages.md#createsurface) 字段路由到目标 [Surface](surfaces-and-messages.md#surface-是什么)：

- 每个 [surfaceId](../reference/messages.md#createsurface) 对应一个独立的组件缓冲区和 [DataModel](data-model-and-binding.md#datamodel-是什么)
- 不同 [Surface](surfaces-and-messages.md#surface-是什么) 之间的消息互不干扰
- [MultiSurfaceController](../reference/API/multi-surface-controller.md#multisurfacecontroller) 统一管理多个 Surface 的消息分发和页面栈

```
handleMessage(msg)
    │
    └─→ 解析 surfaceId
          │
          ├─→ Surface A 缓冲池 → 组件更新 → 渲染
          ├─→ Surface B 缓冲池 → 组件更新 → 渲染
          └─→ 未匹配 → 丢弃（surfaceId 不存在对应 Surface）
```

## 示例：渐进式加载详情卡片

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

    // ① 创建 Surface
    setTimeout(() => {
      this.controller?.handleMessage(`{
        "version": "v0.9",
        "createSurface": {
          "surfaceId": "main",
          "catalogId": "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"
        }
      }`);
    }, 300);

    // ② 第一帧：先发送骨架组件
    setTimeout(() => {
      this.controller?.handleMessage(`{
        "version": "v0.9",
        "updateComponents": {
          "surfaceId": "main",
          "components": [
            {
              "id": "root",
              "component": "Column",
              "children": ["title", "status"]
            },
            {
              "id": "title",
              "component": "Text",
              "text": "订单详情",
              "variant": "h2"
            },
            {
              "id": "status",
              "component": "Text",
              "text": "加载中..."
            }
          ]
        }
      }`);
    }, 600);

    // ③ 第二帧：数据先到达 DataModel
    setTimeout(() => {
      this.controller?.handleMessage(`{
        "version": "v0.9",
        "updateDataModel": {
          "surfaceId": "main",
          "path": "/order",
          "value": {
            "status": "第一批数据已到达",
            "summary": "商品总价：CNY 299.00",
            "detail": "配送中，预计今天 18:00 前送达"
          }
        }
      }`);
    }, 900);

    // ④ 第三帧：补充组件，并让 status 改为数据绑定
    setTimeout(() => {
      this.controller?.handleMessage(`{
        "version": "v0.9",
        "updateComponents": {
          "surfaceId": "main",
          "components": [
            {
              "id": "root",
              "component": "Column",
              "children": ["title", "status", "summary", "detail"]
            },
            {
              "id": "status",
              "component": "Text",
              "text": { "path": "/order/status" }
            },
            {
              "id": "summary",
              "component": "Text",
              "text": { "path": "/order/summary" }
            },
            {
              "id": "detail",
              "component": "Text",
              "text": { "path": "/order/detail" }
            }
          ]
        }
      }`);
    }, 1200);

    // ⑤ 数据更新：绑定组件自动刷新
    setTimeout(() => {
      this.controller?.handleMessage(`{
        "version": "v0.9",
        "updateDataModel": {
          "surfaceId": "main",
          "path": "/order/status",
          "value": "全部消息处理完成"
        }
      }`);
    }, 1500);
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

![data-flow-example](./figures/data-flow-example.gif)

## 渐进式模板渲染

> **扩展组件专属**：渐进式模板渲染仅在扩展组件（Extended Catalog）的容器组件中生效。标准组件（Basic Catalog）的模板不支持 pending 延迟展开和自动重建。

当使用动态模板（children: { componentId, path }）时，模板描述符可以分多个 updateComponents 批次到达。渲染器采用渐进式策略，每批到达后立即尝试渲染，不等待子树完整。

### 时序示例

```ts
// 批次1: 容器 + 数据先到，模板描述符尚未到达
this.controller?.handleMessage(`{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "main",
    "components": [
      { "id": "list", "component": "List", "children": { "componentId": "itemTpl", "path": "/items" } }
    ]
  }
}`);
this.controller?.handleMessage(`{
  "version": "v0.9",
  "updateDataModel": { "surfaceId": "main", "value": { "items": [{"name":"A"}, {"name":"B"}] } }
}`);
// → 渲染器: list 标记为 pending（itemTpl 描述符缺失）

// 批次2: 模板根描述符到达
this.controller?.handleMessage(`{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "main",
    "components": [
      { "id": "itemTpl", "component": "Text", "content": "{{ $item.name }}" }
    ]
  }
}`);
// → 渲染器: pending 容器重新展开，模板实例渲染到 UI

// 批次3: 如果模板根还有子模板引用，子模板描述符后续到达
this.controller?.handleMessage(`{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "main",
    "components": [
      { "id": "nestedTpl", "component": "Image", "src": "{{ $item.icon }}" }
    ]
  }
}`);
// → 渲染器: 子树完整性检查通过，渲染完成
```

### 行为规则

1. 容器描述符到达但模板 componentId 不在描述符缓冲池中时，容器标记为 pending，不阻塞其他组件。
2. 每次 updateComponents 后，渲染器重新尝试展开所有 pending 容器。
3. 每次展开都立即触发 UI 渲染（渐进式），用当前已有的描述符渲染，不等待子树完整。
4. 渲染器递归检查模板子树引用的所有描述符是否已到达；若有缺失，容器保持 pending。
5. 模板描述符更新时（同一 componentId 再次下发），渲染器自动重建所有模板实例以反映最新描述符。

---

← 上一节：[数据模型与绑定](data-model-and-binding.md) | → 下一节：[交互与函数](actions-and-functions.md) | ↑ [概念层总览](overview.md)

> **延伸阅读**：[A2UI 官方文档 - 数据流](https://a2ui.org/concepts/data-flow/)
