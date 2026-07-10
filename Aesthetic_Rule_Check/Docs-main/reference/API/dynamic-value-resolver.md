# DynamicValueResolver

DynamicValueResolver 用于在[自定义组件](../../guides/creating-custom-components.md)和[本地函数](../../guides/creating-custom-functions.md)中解析 DSL 里的动态值（[DynamicValue](../types.md#dynamicvalue)），包括字面量、[DataModel](../../concepts/data-model-and-binding.md#datamodel-是什么) 路径绑定（形如 { "path": ... }）和函数调用（形如 { "call": ..., "args": ... }）。

通过它，宿主侧代码无需自己解析 JSON Pointer 或调用 Catalog 函数，统一由渲染引擎完成求值；既支持一次性取值（[evaluateValue](#evaluatevalue)），也支持响应式订阅（[resolvePropertyValue](#resolvepropertyvalue)），当 DataModel 路径或函数入参发生变化时自动推送最新结果。

> **说明：**
>
> - 本模块接口从 OpenHarmony API Version 13 开始支持，环境要求见 [README](../../README.md#环境要求)。
> - DynamicValueResolver 实例**不能直接构造**，由渲染引擎注入：
>   - 自定义组件中通过 [CustomComponentAttribute.resolver](./catalog-item.md#customcomponentattribute) 取得。
>   - 本地函数中通过 [FunctionContext.resolver](./client-function.md#functioncontext) 取得。
> - resolver 的生命周期与所在组件实例 / 一次函数调用绑定，离开作用域后其订阅自动失效，无需手动取消。

## 导入模块

```ts
import { DynamicValueResolver, ResolveValueCallback } from '@arkui-genius/genui'
```

> 通常只需导入类型用于声明；运行期实例由引擎注入，见[获取方式](#获取方式)。

## 获取方式

DynamicValueResolver 不通过 new 创建，只能从下列入口获取：

| 场景 | 获取入口 | 类型声明 |
|------|---------|----------|
| 自定义组件 | attr.resolver（attr 为 [@Builder](../../guides/creating-custom-components.md#step-1定义-builder) 的 [CustomComponentAttribute](./catalog-item.md#customcomponentattribute) 参数） | attr.resolver: DynamicValueResolver |
| 本地函数 | context.resolver（context 为 [FunctionCall](./client-function.md#functioncall) 的第二个参数 [FunctionContext](./client-function.md#functioncontext)） | context.resolver: DynamicValueResolver |

## ResolveValueCallback

```ts
type ResolveValueCallback<T> = (param: T) => void
```

[resolvePropertyValue](#resolvepropertyvalue) 注册的回调类型，接收解析后的最新值。

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| param | T | 是 | 最近一次解析得到的值，类型由调用方泛型 T 决定。 |

回调被触发的时机：

1. 注册时立即用**当前值**触发一次。
2. 当绑定的 DataModel 路径或函数入参发生变化时，用**最新值**再次触发。

## DynamicValueResolver

```ts
interface DynamicValueResolver
```

动态值解析器，提供一次性求值与响应式订阅两种能力。两种方式都接受任意 [DynamicValue](../../concepts/data-model-and-binding.md#dynamicvalue字面量-vs-数据绑定-vs-函数调用) 形态（字面量 / path 绑定 / FunctionCall），由引擎统一识别并求值。

| 方法 | 说明 |
|------|------|
| [resolvePropertyValue](#resolvepropertyvalue) | 订阅一个动态值，值变化时通过回调持续推送（响应式）。 |
| [evaluateValue](#evaluatevalue) | 同步解析一个动态值并返回（一次性）。 |

### resolvePropertyValue

```ts
resolvePropertyValue<T>(key: string, value: A2UIValueType, callback: ResolveValueCallback<T>): void
```

**接口说明：**

解析一个动态值，并通过 callback 投递当前值及未来更新。注册后回调会立即用当前值触发一次；当 value 为 DataModel 路径绑定或含动态入参的函数调用时，对应数据变化后会再次触发回调。

适合需要**随 DataModel 实时刷新**的场景，例如自定义组件内部维护状态、本地函数需要观察某个绑定输入。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| key | string | 是 | 该绑定的逻辑标识，便于在日志和错误链路中定位，通常用属性名命名，例如 title、styles.color。key 不参与取值，仅作标识。 |
| value | [A2UIValueType](./types.md#a2uivaluetype) | 是 | 待解析的动态值，可为字面量、{ "path": "/user/name" } 形态的路径绑定，或 { "call": "...", "args": {...} } 形态的函数调用。 |
| callback | [ResolveValueCallback](#resolvevaluecallback)\<T\> | 是 | 接收解析结果的回调，泛型 T 为期望的目标类型。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| void | 无返回值。解析结果通过 callback 异步推送。 |

**value 形态与回调行为：**

| value 形态 | 示例 | 回调行为 |
|--------------|------|----------|
| 字面量 | "Hello" / 42 / true | 立即用该字面量触发一次，之后不再触发。 |
| 路径绑定 | { "path": "/user/name" } | 用 DataModel 中该路径的当前值触发；路径值被 [updateDataModel](../messages.md#updatedatamodel) 更新后再次触发。 |
| 函数调用 | { "call": "formatCurrency", "args": { "value": { "path": "/price" } } } | 用函数计算结果触发；当其入参依赖的 DataModel 路径变化导致结果变化时再次触发。 |

**错误处理：**

解析失败（例如路径不存在、引用未注册的函数、表达式非法）时，引擎会通过 [SurfaceController.registerErrorCallback](./surface-controller.md#registererrorcallback) 上报对应的错误码（如 [DYNAMIC_VALUE_RESOLVE_FAILED](./types.md#surfaceerrorcode)、[GLOBAL_VARIABLE_NOT_FOUND](./types.md#surfaceerrorcode)、[ILLEGAL_EXPRESSION](./types.md#surfaceerrorcode)），回调不会被触发。

**示例：**

在状态化子组件的 aboutToAppear 中调用 resolvePropertyValue 订阅动态值。完整可运行示例见[示例 3](#示例-3响应式订阅resolvepropertyvalue)。

```ts
import { DynamicValueResolver } from '@arkui-genius/genui'

@Component
struct TitleView {
  private resolver: DynamicValueResolver | null = null
  private titleDescriptor: Record<string, Object> | null = null
  @State title: string = ''

  aboutToAppear(): void {
    // 订阅 title：注册时立即用当前值触发，之后该路径的 DataModel 变化会再次触发
    this.resolver?.resolvePropertyValue<string>(
      'title',
      this.titleDescriptor,
      (value: string) => {
        this.title = value
      }
    )
  }

  build() {
    Text(this.title).fontSize(16)
  }
}
```

### evaluateValue

```ts
evaluateValue<T>(value: A2UIValueType): T
```

**接口说明：**

同步解析一个动态值并返回结果，**只求值一次**，不建立订阅。传入字面量时直接做类型转换；传入路径绑定时读取 DataModel 当前值；传入函数调用时执行并返回结果。

适合在 [@Builder](../../guides/creating-custom-components.md#step-1定义-builder) 渲染体内一次性取值。需要特别注意的是，自定义组件的 @Builder 仅在 changeReason 为 UPDATE_COMPONENT（由 [updateComponents](../messages.md#updatecomponents) 触发）、THEME_MODE_CHANGE、BREAKPOINT_CHANGE 三种情形下才会被引擎重新调用；**单纯的 [updateDataModel](../messages.md#updatedatamodel) 不会触发 @Builder 重新执行**。因此 evaluateValue 读到的路径值，只在这三种重渲染发生时才会刷新——若希望自定义组件在 DataModel 变化时立即更新，应改用 [resolvePropertyValue](#resolvepropertyvalue) 订阅。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| value | [A2UIValueType](./types.md#a2uivaluetype) | 是 | 待解析的动态值，可为字面量、路径绑定或函数调用。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| T | 解析后的值，类型由调用方泛型 T 决定。路径或函数返回 null / undefined 时，调用方应自行处理缺省值。 |

**示例：**

```ts
import { CustomComponentAttribute } from '@arkui-genius/genui'

@Builder
function PriceTag(attr: CustomComponentAttribute) {
  // 同步解析；title / price 可能是字面量、{ "path": ... } 或 { "call": ... }
  const title = attr.resolver.evaluateValue<string>(attr.customProps?.title) ?? '未命名'
  const price = attr.resolver.evaluateValue<number>(attr.customProps?.price) ?? 0

  Text(`${title}：￥${price.toFixed(2)}`)
    .fontSize(16)
}
```

## resolvePropertyValue 与 evaluateValue 对比

| 维度 | resolvePropertyValue | evaluateValue |
|------|----------------------|---------------|
| 调用方式 | 异步，通过回调拿值 | 同步，直接返回值 |
| 是否订阅后续变化 | 是，DataModel 变化会再次触发回调 | 否，只取调用瞬间的值 |
| 典型场景 | 自定义组件内部状态、需要细粒度响应 DataModel 刷新 | @Builder 渲染体一次性取值、本地函数内同步求参 |
| 生命周期 | 与组件实例 / 函数调用绑定，自动清理 | 无状态 |

选择建议：

- 自定义组件取值，且只需在组件更新（updateComponents）、主题或断点变化时刷新 → 用 **evaluateValue**，写在 @Builder 体内即可，配合上述三种 changeReason 触发的重新调用保持最新。
- 自定义组件需要在 **updateDataModel 改变某路径时立即刷新**（@Builder 不会被这次更新重新调用）→ 必须用 **resolvePropertyValue** 订阅，并在带 @State 的状态化子组件中接收回调。完整写法见[示例 3](#示例-3响应式订阅resolvepropertyvalue)。

## 使用示例

### 示例 1：自定义组件中一次性取值（evaluateValue）

自定义一个 PriceTag 组件，注册到扩展 Catalog；DSL 中用路径绑定传入价格，由 evaluateValue 在渲染时取值。

```ts
import {
  CatalogFactory,
  CatalogItem,
  CustomComponentAttribute,
  SurfaceController,
  SurfaceControllerFactory,
  UIRendererComponent
} from '@arkui-genius/genui'
import { wrapBuilder } from '@kit.ArkUI'

@Builder
function PriceTag(attr: CustomComponentAttribute) {
  const title = attr.resolver.evaluateValue<string>(attr.customProps?.title) ?? '未命名'
  const price = attr.resolver.evaluateValue<number>(attr.customProps?.price) ?? 0

  Column() {
    Text(title).fontSize(14).fontColor('#666666')
    Text(`￥${price.toFixed(2)}`).fontSize(20).fontWeight(FontWeight.Bold)
  }
  .alignItems(HorizontalAlign.Start)
}

const priceTagItem: CatalogItem = {
  name: 'PriceTag',
  schemaProvider: (version) => JSON.stringify({
    type: 'object',
    properties: {
      title: { type: 'string', description: '商品名称，支持路径绑定' },
      price: { type: 'number', description: '价格，支持路径绑定' }
    },
    required: ['title', 'price']
  }),
  componentBuilder: wrapBuilder(PriceTag)
}

@Entry
@Component
struct PriceTagDemo {
  @State controller: SurfaceController | null = null

  aboutToAppear(): void {
    // ① 用扩展 Catalog + 自定义组件创建控制器
    const catalog = CatalogFactory.extended()
    catalog.addCatalogItem(priceTagItem)

    this.controller = SurfaceControllerFactory.createSurfaceController({
      uiContext: this.getUIContext(),
      catalog: catalog
    })

    // ② 创建 Surface
    this.controller?.handleMessage(JSON.stringify({
      version: 'v0.9',
      createSurface: { surfaceId: 'main', catalogId: 'ohos.a2ui.extended.catalog' }
    }))

    // ③ 组件用 path 绑定 DataModel
    this.controller?.handleMessage(JSON.stringify({
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'root', component: 'PriceTag',
            title: { path: '/goods/name' },
            price: { path: '/goods/price' }
          }
        ]
      }
    }))

    // ④ 填充数据，evaluateValue 在渲染时读到 '耳机' 和 199
    this.controller?.handleMessage(JSON.stringify({
      version: 'v0.9',
      updateDataModel: {
        surfaceId: 'main', path: '/',
        value: { goods: { name: '耳机', price: 199 } }
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
    .width('100%').height('100%').padding(24)
  }
}
```

> 自定义组件会在 [updateDataModel](../messages.md#updatedatamodel) 引起 changeReason === UPDATE_COMPONENT 时被重新调用，evaluateValue 随之取到最新值。

### 示例 2：本地函数中解析动态入参（evaluateValue）

本地函数的入参 params 可能包含嵌套的动态值（路径绑定、函数调用）。通过 context.resolver.evaluateValue 可在函数体内把它们一次性求值。

```ts
import { CatalogFactory, ClientFunction } from '@arkui-genius/genui'

const applyDiscount: ClientFunction = {
  name: 'applyDiscount',
  schemaProvider: (version) => JSON.stringify({
    type: 'object',
    properties: {
      price: { type: 'number', description: '原价，支持路径绑定' },
      rate: { type: 'number', description: '折扣比例 0~1' }
    },
    required: ['price', 'rate']
  }),
  functionCall: (params, context) => {
    const args = params as Record<string, Object>
    // price 可能是 { "path": "/goods/price" }，这里同步解析
    const price = context.resolver.evaluateValue<number>(args.price) ?? 0
    const rate = context.resolver.evaluateValue<number>(args.rate) ?? 0
    const finalPrice = price * (1 - rate)
    if (finalPrice < 0) {
      context.onError('折后价格不能为负')
      return price
    }
    return Number(finalPrice.toFixed(2))
  }
}

const catalog = CatalogFactory.extended()
catalog.addClientFunction(applyDiscount)
```

在 DSL 中即可嵌套使用：

```json
{
  "id": "finalPrice", "component": "Text",
  "text": {
    "call": "applyDiscount",
    "args": {
      "price": { "path": "/goods/price" },
      "rate": 0.15
    },
    "returnType": "number"
  }
}
```

### 示例 3：响应式订阅（resolvePropertyValue）

当自定义组件需要随某个 DataModel 路径**自动刷新**（例如展示一个持续更新的拍卖价），用 resolvePropertyValue 建立订阅。由于 @Builder 本身无状态，将引擎注入的 resolver 与待绑定的描述符透传给一个带 @State 的状态化子组件，在其 aboutToAppear 中订阅；DataModel 中对应路径变化时回调自动触发，界面随之刷新。

```ts
import {
  CatalogFactory,
  CatalogItem,
  CustomComponentAttribute,
  DynamicValueResolver,
  SurfaceController,
  SurfaceControllerFactory,
  UIRendererComponent
} from '@arkui-genius/genui'
import { wrapBuilder } from '@kit.ArkUI'

// 状态化子组件：通过 resolver 订阅价格，DataModel 中该路径变化时自动刷新
@Component
struct AuctionPriceView {
  private resolver: DynamicValueResolver | null = null
  private priceDescriptor: Record<string, Object> | null = null
  @State currentPrice: number = 0

  aboutToAppear(): void {
    this.resolver?.resolvePropertyValue<number>(
      'price',
      this.priceDescriptor,
      (price: number) => {
        this.currentPrice = price
      }
    )
  }

  build() {
    Text(`当前价：￥${this.currentPrice.toFixed(2)}`)
      .fontSize(24)
      .fontColor('#E8312F')
  }
}

@Builder
function AuctionPrice(attr: CustomComponentAttribute) {
  // 将引擎注入的 resolver 与 DSL 中的价格描述符透传给状态化子组件
  AuctionPriceView({
    resolver: attr.resolver,
    priceDescriptor: attr.customProps?.price as Record<string, Object>
  })
}

const auctionPriceItem: CatalogItem = {
  name: 'AuctionPrice',
  schemaProvider: (version) => JSON.stringify({
    type: 'object',
    properties: {
      price: { type: 'number', description: '当前拍卖价，支持路径绑定' }
    },
    required: ['price']
  }),
  componentBuilder: wrapBuilder(AuctionPrice)
}

@Entry
@Component
struct AuctionPriceDemo {
  @State controller: SurfaceController | null = null

  aboutToAppear(): void {
    // ① 创建控制器并注册自定义组件
    const catalog = CatalogFactory.extended()
    catalog.addCatalogItem(auctionPriceItem)

    this.controller = SurfaceControllerFactory.createSurfaceController({
      uiContext: this.getUIContext(),
      catalog: catalog
    })

    // ② 创建 Surface
    this.controller?.handleMessage(JSON.stringify({
      version: 'v0.9',
      createSurface: { surfaceId: 'main', catalogId: 'ohos.a2ui.extended.catalog' }
    }))

    // ③ 下发组件，price 绑定到 /auction/currentPrice
    this.controller?.handleMessage(JSON.stringify({
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'root', component: 'AuctionPrice',
            price: { path: '/auction/currentPrice' }
          }
        ]
      }
    }))

    // ④ 写入初始价格，订阅回调触发，界面显示 1200
    this.controller?.handleMessage(JSON.stringify({
      version: 'v0.9',
      updateDataModel: {
        surfaceId: 'main', path: '/auction',
        value: { currentPrice: 1200 }
      }
    }))

    // ⑤ 2 秒后更新价格，订阅回调再次触发，界面自动刷新为 1250
    setTimeout(() => {
      this.controller?.handleMessage(JSON.stringify({
        version: 'v0.9',
        updateDataModel: {
          surfaceId: 'main', path: '/auction/currentPrice',
          value: 1250
        }
      }))
    }, 2000)
  }

  aboutToDisappear(): void {
    this.controller?.destroy()
  }

  build() {
    Column() {
      UIRendererComponent({ surfaceController: this.controller })
        .layoutWeight(1)
    }
    .width('100%').height('100%').padding(24)
  }
}
```

## 相关文档

- [数据模型与绑定（概念）](../../concepts/data-model-and-binding.md) — DynamicValue 三种形态、JSON Pointer 路径、双向绑定。
- [CatalogItem API](./catalog-item.md) — CustomComponentAttribute.resolver 的来源与全部属性。
- [ClientFunction API](./client-function.md) — FunctionContext.resolver 的来源与 onError 用法。
- [Types API](./types.md) — A2UIValueType、SurfaceErrorCode（解析失败错误码）。

---

↑ [返回 API 速查](./README.md)
