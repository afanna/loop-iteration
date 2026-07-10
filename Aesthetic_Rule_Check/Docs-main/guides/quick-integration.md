# 快速集成

将 GenUI HAR 集成到 HarmonyOS 应用，完成初始化配置。

> 建议先阅读 [架构概览](../introduction/architecture.md) 以理解整体数据流。

## 前置条件

- DevEco Studio 6.0.0(20)

## 1. 安装 HAR

```bash
ohpm install @arkui-genius/genui
```

在 oh-package.json5 中添加：

```json5
{
  "dependencies": {
    "@arkui-genius/genui": "latest"
  }
}
```

## 2. 导入 API

```ts
import {
  CatalogFactory,
  SurfaceController,
  SurfaceControllerFactory,
  SurfaceEventType,
  SurfaceErrorCode,
  MultiSurfaceController,
  UIRendererComponent,
  PromptBuilder,
  Capabilities
} from '@arkui-genius/genui'
```

## 3. 最小集成代码

```ts
import {
  CatalogFactory,
  SurfaceController,
  SurfaceControllerFactory,
  SurfaceEventType,
  SurfaceErrorCode,
  UIRendererComponent
} from '@arkui-genius/genui'

@Entry
@Component
struct Index {
  @State controller: SurfaceController | null = null

  aboutToAppear(): void {
    // ① 创建 Controller（CatalogFactory.basic() = A2UI 标准协议；CatalogFactory.extended() = 扩展协议）
    this.controller = SurfaceControllerFactory.createSurfaceController({
      uiContext: this.getUIContext(),
      catalog: CatalogFactory.basic(),
      eventCallback: (eventType: SurfaceEventType, ctrl: SurfaceController) => {
        console.log(`Surface 事件: ${eventType}`)
      }
    })

    // ② 注册回调
    this.controller.registerActionReceiver((action: string) => {
      console.log(`用户操作: ${action}`)
    })
    this.controller.registerErrorCallback((code: SurfaceErrorCode, msg: string) => {
      console.error(`错误 [${code}]: ${msg}`)
    })
  }

  aboutToDisappear(): void {
    this.controller?.destroy()
  }

  build() {
    Column() {
      UIRendererComponent({ surfaceController: this.controller })
        .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
  }
}
```

## 4. 验证集成

集成完成后，发送一段静态 DSL 确认渲染链路正常：

### 完整可运行示例

```ts
import {
  CatalogFactory,
  SurfaceController,
  SurfaceControllerFactory,
  SurfaceEventType,
  SurfaceErrorCode,
  UIRendererComponent
} from '@arkui-genius/genui'

@Entry
@Component
struct Index {
  @State controller: SurfaceController | null = null

  aboutToAppear(): void {
    // ① 创建 Controller
    this.controller = SurfaceControllerFactory.createSurfaceController({
      uiContext: this.getUIContext(),
      catalog: CatalogFactory.basic(),
      eventCallback: (eventType: SurfaceEventType, ctrl: SurfaceController) => {
        console.log(`Surface 事件: ${eventType}`)
      }
    })

    // ② 注册回调
    this.controller.registerActionReceiver((action: string) => {
      console.log(`用户操作: ${action}`)
    })
    this.controller.registerErrorCallback((code: SurfaceErrorCode, msg: string) => {
      console.error(`错误 [${code}]: ${msg}`)
    })

    // ③ 验证：发送 DSL 创建 Surface 并渲染组件
    this.controller!.handleMessage(
      '{"version":"v0.9","createSurface":{"surfaceId":"test","catalogId":"https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"}}')
    this.controller!.handleMessage(
      '{"version":"v0.9","updateComponents":{"surfaceId":"test","components":[{"id":"root","component":"Text","text":"Genui 集成成功"}]}}')
  }

  aboutToDisappear(): void {
    this.controller?.destroy()
  }

  build() {
    Column() {
      UIRendererComponent({ surfaceController: this.controller })
        .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
  }
}
```

如果你看到屏幕上显示 "GenUI 集成成功"，说明集成已完成。

## 5. 选择 Catalog

```ts
CatalogFactory.basic()       // Basic Catalog：A2UI 标准协议，18 个标准组件，无表达式/样式
CatalogFactory.extended()    // 鸿蒙扩展协议 Catalog：21 个扩展组件，支持表达式、样式、自适应
```

选择后即决定了后续 DSL 中可用的组件体系。同一 Surface 不可切换，需删除后重建。

## 初始化流程总结

```
① CatalogFactory.basic() → SurfaceControllerFactory.createSurfaceController()  // 选择组件体系，创建控制器
    ↓
② registerActionReceiver() + registerErrorCallback()                          // 注册事件和错误回调
    ↓
③ UIRendererComponent({ surfaceController })                                  // 绑定到 ArkUI 组件
    ↓
④ controller.handleMessage(dsl)                                               // 开始接收 DSL 消息渲染
```

## 与 quickstart 的关系

| | quickstart.md | 本指南 |
|---|---|---|
| 定位 | 教程 — 第一次体验 GenUI | 操作指南 — 正式项目集成 |
| 内容 | 5 分钟最小代码跑通 | 完整初始化配置、错误处理、验证步骤 |
| 何时读 | 第一次接触 | 开始实际开发时 |

---

相关指南：
→ [创建 Surface](creating-surfaces.md) | → [构建 UI（标准组件）](building-ui-standard.md) | → [版本兼容性](version-compatibility.md) | → [LLM 集成](integrating-llm.md)
