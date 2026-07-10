# SurfaceController

SurfaceController 是单 Surface 控制器，负责接收 [A2UI DSL 消息](../messages.md#协议消息信封)、驱动渲染并维护当前 Surface 状态。通过 [SurfaceControllerFactory.createSurfaceController](./factories.md#surfacecontrollerfactorycreatesurfacecontroller) 创建实例，再把实例传入 [UIRendererComponent](./ui-renderer-component.md#uirenderercomponent) 完成渲染。

> **说明：**
>
> - 本模块接口从 OpenHarmony API Version 13 开始支持，环境要求见 [README](../../README.md#环境要求)。
> - SurfaceController 不能直接 new，必须通过 [SurfaceControllerFactory](./factories.md#surfacecontrollerfactory) 创建。
> - 需要多 Surface 栈管理（push/pop、右滑返回）时，改用 [MultiSurfaceController](./multi-surface-controller.md#multisurfacecontroller)。

## 导入模块

```ts
import {
  SurfaceController,
  SurfaceControllerOption,
  SurfaceEventCallback,
  ActionReceiver,
  ErrorCallback,
  SchemaWarningInfo,
  ThemeMode,
  SurfaceEventType,
  SurfaceErrorCode
} from '@arkui-genius/genui'
```

## ActionReceiver

```ts
type ActionReceiver = (action: string) => void
```

[registerActionReceiver](#registeractionreceiver) 注册的用户交互回调类型。组件点击、提交等行为会被引擎转换为 Action JSON 字符串后投递给该回调。

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| action | string | 是 | A2UI Action JSON 字符串，结构见下方说明。 |

Action JSON 字符串结构：

```json
{
  "version": "v0.9",
  "action": {
    "name": "clicked",
    "surfaceId": "main",
    "sourceComponentId": "submit-btn",
    "timestamp": "2026-04-30T10:00:00Z",
    "context": { "key": "value" }
  }
}
```

## ErrorCallback

```ts
type ErrorCallback = (code: SurfaceErrorCode, errorMsg: string) => void
```

[registerErrorCallback](#registererrorcallback) 注册的错误回调类型。

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | [SurfaceErrorCode](./types.md#surfaceerrorcode) | 是 | 错误码。 |
| errorMsg | string | 是 | 错误信息。 |

## SchemaWarningInfo

```ts
interface SchemaWarningInfo
```

[reportSchemaWarning](#reportschemawarning) 的入参，描述一次自定义 Schema 告警。

| 名称 | 类型 | 只读 | 可选 | 说明 |
|--------|------|------|------|------|
| code | [SurfaceErrorCode](./types.md#surfaceerrorcode) | 否 | 否 | 错误码，与 [ErrorCallback](#errorcallback) 的 code 一致，建议使用 SCHEMA_WARNING。 |
| errorMsg | string | 否 | 否 | 错误信息，建议放入可解析的 JSON 字符串，描述组件名、校验选项与告警列表。 |

## SurfaceEventCallback

```ts
type SurfaceEventCallback = (
  eventType: SurfaceEventType,
  controller: SurfaceController,
  surfaceId: string
) => void
```

[SurfaceControllerOption.eventCallback](#surfacecontrolleroption) 配置的 Surface 生命周期事件回调，在 A2UI 消息处理完成后触发。

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| eventType | [SurfaceEventType](./types.md#surfaceeventtype) | 是 | Surface 生命周期事件类型。 |
| controller | [SurfaceController](#surfacecontroller) | 是 | 触发事件的控制器实例。 |
| surfaceId | string | 是 | 本次事件对应的 Surface ID。 |

## SurfaceControllerOption

```ts
interface SurfaceControllerOption
```

创建控制器时的初始化选项，作为 [SurfaceControllerFactory.createSurfaceController](./factories.md#surfacecontrollerfactorycreatesurfacecontroller) / [createMultiSurfaceController](./factories.md#surfacecontrollerfactorycreatemultisurfacecontroller) 的入参。

| 名称 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| uiContext | UIContext | 是 | 来自 @ohos.arkui.UIContext 的 UIContext，通常通过 this.getUIContext() 获取。 |
| catalog | [Catalog](./catalog.md#catalog) | 是 | 定义可用组件与函数的能力集。 |
| eventCallback | [SurfaceEventCallback](#surfaceeventcallback) | 否 | Surface 生命周期事件回调。 |

## SurfaceController

```ts
interface SurfaceController
```

单 Surface 控制器，接收 A2UI DSL 消息并维护当前 Surface 状态。

| 方法 | 说明 |
|------|------|
| [handleMessage](#handlemessage) | 投递一条 A2UI DSL 消息。 |
| [registerActionReceiver](#registeractionreceiver) | 注册用户交互回调。 |
| [registerErrorCallback](#registererrorcallback) | 注册错误回调。 |
| [enableSchemaWarningReport](#enableschemawarningreport) | 开启或关闭 Schema 告警上报。 |
| [reportSchemaWarning](#reportschemawarning) | 上报一次自定义 Schema 告警。 |
| [setFontSizeScale](#setfontsizescale) | 设置当前 Surface 的字号缩放比例。 |
| [updateThemeMode](#updatethememode) | 设置当前 Surface 的主题模式。 |
| [destroy](#destroy) | 销毁控制器并释放资源。 |

### handleMessage

```ts
handleMessage(dsl: string): void
```

**接口说明：**

向控制器投递一条 A2UI DSL 消息。成功时会更新内部 Surface 状态，并触发 [SurfaceEventCallback](#surfaceeventcallback)。

DSL 顶层应包含 version 字段；当 version 超出当前 HAR 支持范围时，当前消息不会继续渲染，并通过 [registerErrorCallback](#registererrorcallback) 收到 [UNSUPPORTED_PROTOCOL_VERSION](./types.md#surfaceerrorcode)。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| dsl | string | 是 | A2UI DSL JSON 字符串，支持 createSurface、updateComponents、updateDataModel、deleteSurface 等消息类型，详见 [消息格式参考](../messages.md)。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| void | 无返回值。 |

**示例：**

```ts
import {
  CatalogFactory,
  SurfaceController,
  SurfaceControllerFactory,
  SurfaceEventType,
  UIRendererComponent
} from '@arkui-genius/genui'

@Entry
@Component
struct HandleMessagePage {
  @State controller: SurfaceController | null = null

  aboutToAppear(): void {
    this.controller = SurfaceControllerFactory.createSurfaceController({
      uiContext: this.getUIContext(),
      catalog: CatalogFactory.basic(),
      eventCallback: (eventType: SurfaceEventType, ctrl: SurfaceController, surfaceId: string) => {
        console.info(`surface event: ${eventType}, surfaceId: ${surfaceId}`)
      }
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

### registerActionReceiver

```ts
registerActionReceiver(onAction: ActionReceiver): void
```

**接口说明：**

注册用户交互回调。组件点击、提交等行为会被转换为 [Action JSON 字符串](#actionreceiver) 投递给该回调。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| onAction | [ActionReceiver](#actionreceiver) | 是 | 用户交互回调。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| void | 无返回值。 |

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
struct ActionPage {
  @State controller: SurfaceController | null = null

  aboutToAppear(): void {
    this.controller = SurfaceControllerFactory.createSurfaceController({
      uiContext: this.getUIContext(),
      catalog: CatalogFactory.basic()
    })

    this.controller?.registerActionReceiver((action: string) => {
      const actionObj = JSON.parse(action)
      console.info(`Action: ${actionObj.action.name}, component: ${actionObj.action.sourceComponentId}`)
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
          { id: 'root', component: 'Column', children: ['submit-btn'] },
          { id: 'submit-btn', component: 'Button', text: '提交' }
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

### registerErrorCallback

```ts
registerErrorCallback(onError: ErrorCallback): void
```

**接口说明：**

注册错误回调。DSL 解析失败、协议版本不支持、Schema 校验告警、本地函数异常等情况会通过该回调通知宿主。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| onError | [ErrorCallback](#errorcallback) | 是 | 错误回调，接收错误码与错误信息。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| void | 无返回值。 |

**示例：**

```ts
import {
  CatalogFactory,
  SurfaceController,
  SurfaceControllerFactory,
  SurfaceErrorCode,
  UIRendererComponent
} from '@arkui-genius/genui'

@Entry
@Component
struct ErrorPage {
  @State controller: SurfaceController | null = null

  aboutToAppear(): void {
    this.controller = SurfaceControllerFactory.createSurfaceController({
      uiContext: this.getUIContext(),
      catalog: CatalogFactory.basic()
    })

    this.controller?.registerErrorCallback((code: SurfaceErrorCode, errorMsg: string) => {
      switch (code) {
        case SurfaceErrorCode.SCHEMA_WARNING:
          console.warn(`Schema 校验告警: ${errorMsg}`)
          break
        case SurfaceErrorCode.UNSUPPORTED_PROTOCOL_VERSION:
          console.error(`协议版本不支持: ${errorMsg}`)
          break
        default:
          console.error(`Error [${code}]: ${errorMsg}`)
          break
      }
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
    .width('100%').height('100%')
  }
}
```

### enableSchemaWarningReport

```ts
enableSchemaWarningReport(enableSchemaWarningReport: boolean): void
```

**接口说明：**

开启或关闭 Schema 告警上报。开启后，标准组件 Schema 校验产生的告警，以及通过 [reportSchemaWarning](#reportschemawarning) 上报的告警，都会通过 [registerErrorCallback](#registererrorcallback) 通知宿主。该开关只影响告警上报，不改变 [handleMessage](#handlemessage) 的基本渲染流程。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| enableSchemaWarningReport | boolean | 是 | true 表示允许上报 Schema 告警；false 表示关闭。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| void | 无返回值。 |

**示例：**

```ts
this.controller?.enableSchemaWarningReport(true)
this.controller?.registerErrorCallback((code, errorMsg) => {
  console.warn(`Schema warning [${code}]: ${errorMsg}`)
})
```

### reportSchemaWarning

```ts
reportSchemaWarning(schemaWarningInfo: SchemaWarningInfo): void
```

**接口说明：**

上报一次自定义 Schema 告警。宿主在自行完成扩展 Schema 校验后，可把结果包装为 [SchemaWarningInfo](#schemawarninginfo) 传入；当 Schema 告警上报开关开启时，该告警会通过 [registerErrorCallback](#registererrorcallback) 通知宿主。

建议 code 使用 SurfaceErrorCode.SCHEMA_WARNING，并在 errorMsg 中放入可解析的 JSON 字符串，描述组件名、校验选项和告警列表。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| schemaWarningInfo | [SchemaWarningInfo](#schemawarninginfo) | 是 | 待上报的 Schema 告警信息。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| void | 无返回值。 |

**示例：**

```ts
import { SchemaWarningInfo, SurfaceErrorCode } from '@arkui-genius/genui'

const schemaWarningInfo: SchemaWarningInfo = {
  code: SurfaceErrorCode.SCHEMA_WARNING,
  errorMsg: JSON.stringify({
    type: 'customSchemaWarning',
    component: 'WeatherCard',
    warnings: [
      {
        code: 'ERROR_CODE_TYPE_MISMATCH',
        message: 'Property title expects string',
        path: 'weatherCard.title',
        actualType: 'number'
      }
    ]
  })
}

this.controller?.enableSchemaWarningReport(true)
this.controller?.reportSchemaWarning(schemaWarningInfo)
```

### setFontSizeScale

```ts
setFontSizeScale(scale: number): void
```

**接口说明：**

设置当前 Surface 渲染时使用的字号缩放比例，作用于后续渲染的组件。常用于跟随系统字号设置或无障碍场景。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| scale | number | 是 | 字号缩放系数，1.0 表示原始大小，大于 1 放大，小于 1 缩小。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| void | 无返回值。 |

**示例：**

```ts
// 字号放大到 1.2 倍
this.controller?.setFontSizeScale(1.2)
```

### updateThemeMode

```ts
updateThemeMode(mode: ThemeMode): void
```

**接口说明：**

设置当前 Controller 管理的 Surface 主题模式（浅色 / 深色）。若需 Surface 跟随系统深浅色变化，开发者需在宿主页面监听系统环境配置，读取 colorMode 后转换为 [ThemeMode](./types.md#thememode) 再调用本接口同步。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| mode | [ThemeMode](./types.md#thememode) | 是 | 目标主题模式。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| void | 无返回值。 |

**示例：**

```ts
import { ThemeMode } from '@arkui-genius/genui'

this.controller?.updateThemeMode(ThemeMode.DARK)
```

### destroy

```ts
destroy(): void
```

**接口说明：**

销毁控制器并释放底层渲染资源。销毁后其他接口调用会被安全忽略，不会抛出异常。应在宿主页面 aboutToDisappear 中调用。

**支持的版本：** OpenHarmony API Version 13 及以上。

**返回值：**

| 类型 | 说明 |
|------|------|
| void | 无返回值。 |

**示例：**

```ts
aboutToDisappear(): void {
  this.controller?.destroy()
}
```

---

↑ [返回 API 速查](./README.md)
