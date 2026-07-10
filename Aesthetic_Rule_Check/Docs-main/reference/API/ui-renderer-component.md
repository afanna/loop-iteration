# UIRendererComponent

UIRendererComponent 是一个 ArkUI 自定义组件，作为 A2UI 渲染结果的承载容器。将其放入页面 build 结构中并传入已创建的 [SurfaceController](./surface-controller.md#surfacecontroller)，即可显示控制器处理 DSL 后产出的界面。

> **说明：**
>
> - 本模块接口从 OpenHarmony API Version 13 开始支持，环境要求见 [README](../../README.md#环境要求)。
> - UIRendererComponent 只负责承载渲染，DSL 投递、Action / 错误回调等均通过 [SurfaceController](./surface-controller.md#surfacecontroller) 完成。
> - 传入的控制器应在宿主页面的 aboutToDisappear 中调用 [destroy()](./surface-controller.md#destroy) 释放资源。

## 导入模块

```ts
import { UIRendererComponent, SurfaceController } from '@arkui-genius/genui'
```

## UIRendererComponent

```ts
@Component
export struct UIRendererComponent {
  surfaceController: SurfaceController | null
}
```

ArkUI 自定义组件，渲染由 surfaceController 管理的 Surface 内容。

| 名称 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| surfaceController | [SurfaceController](./surface-controller.md#surfacecontroller) \| null | 否 | 当前页面使用的控制器实例。未传入时不渲染内容。 |

**示例：**

```ts
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
    })

    this.controller?.handleMessage(JSON.stringify({
      version: 'v0.9',
      createSurface: {
        surfaceId: 'main',
        catalogId: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json'
      }
    }))

    this.controller?.handleMessage(JSON.stringify({
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'main',
        components: [
          { id: 'root', component: 'Column', children: ['title'] },
          { id: 'title', component: 'Text', text: 'Hello A2UI' }
        ]
      }
    }))
  }

  aboutToDisappear(): void {
    this.controller?.destroy()
  }

  build() {
    Column() {
      UIRendererComponent({ surfaceController: this.controller })
        .layoutWeight(1)
    }
    .width('100%').height('100%')
  }
}
```

---

↑ [返回 API 速查](./README.md)
