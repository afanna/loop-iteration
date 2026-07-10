# ClientFunction

ClientFunction 是 Catalog 中的本地函数注册单元，描述一个自定义函数的名称、Schema 与实现。引擎在 DSL 中遇到函数调用（FunctionCall）时，按名称匹配并执行对应的 ClientFunction。函数上下文 [FunctionContext](#functioncontext) 同时提供数据绑定解析器（[DynamicValueResolver](./dynamic-value-resolver.md#dynamicvalueresolver)）与错误上报能力。

> **说明：**
>
> - 本模块接口从 OpenHarmony API Version 13 开始支持，环境要求见 [README](../../README.md#环境要求)。
> - ClientFunction 通过 [Catalog.addClientFunction](./catalog.md#addclientfunction) 注册到 Catalog。
> - 自定义函数的完整开发流程见[自定义函数指南](../../guides/creating-custom-functions.md)。

## 导入模块

```ts
import {
  ClientFunction,
  FunctionCall,
  FunctionContext,
  FunctionErrorReporter,
  A2UIValueType
} from '@arkui-genius/genui'
```

## FunctionErrorReporter

```ts
type FunctionErrorReporter = (errorMessage: string) => void
```

[FunctionContext.onError](#functioncontext) 的类型，自定义函数执行过程中遇到业务异常时调用。错误会通过 [SurfaceController.registerErrorCallback](./surface-controller.md#registererrorcallback) 以 [LOCAL_FUNCTION](./types.md#surfaceerrorcode) 错误码上报给宿主。

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| errorMessage | string | 是 | 错误信息。 |

## FunctionContext

```ts
interface FunctionContext
```

函数执行上下文，作为 [FunctionCall](#functioncall) 的第二个参数，由引擎在调用函数时注入。

| 名称 | 类型 | 只读 | 可选 | 说明 |
|--------|------|------|------|------|
| resolver | [DynamicValueResolver](./dynamic-value-resolver.md#dynamicvalueresolver) | 否 | 否 | 动态值解析器，用于解析入参中嵌套的路径绑定与函数调用。 |
| onError | [FunctionErrorReporter](#functionerrorreporter) | 否 | 否 | 错误上报回调。 |

## FunctionCall

```ts
type FunctionCall = (params: A2UIValueType, context: FunctionContext) => A2UIValueType
```

本地函数的实现类型。params 对应 DSL 中 FunctionCall.args 解析后的参数对象，可能包含字面量、路径绑定或嵌套函数调用；返回值为函数计算结果，回填给调用方组件。

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| params | [A2UIValueType](./types.md#a2uivaluetype) | 是 | 函数入参。若需解析其中嵌套的动态值，使用 context.resolver。 |
| context | [FunctionContext](#functioncontext) | 是 | 函数执行上下文。 |

返回值：[A2UIValueType](./types.md#a2uivaluetype)，函数计算结果。

## ClientFunction

```ts
interface ClientFunction
```

本地函数注册单元，描述自定义函数的名称、Schema 与实现。

| 名称 | 类型 | 只读 | 可选 | 说明 |
|--------|------|------|------|------|
| name | string | 否 | 否 | 函数名称，需与 DSL 中 FunctionCall.call 一致。 |
| schemaProvider | [SchemaProvider](./types.md#schemaprovider) | 否 | 否 | 函数 Schema 提供函数，返回 JSON Schema 字符串，供 [PromptBuilder](./prompt-builder.md#promptbuilder) 生成提示词与引擎校验使用。 |
| functionCall | [FunctionCall](#functioncall) | 否 | 否 | 函数执行实现。 |

## 使用示例

下面注册一个折扣计算函数 applyDiscount：解析入参中的原价（可能是路径绑定）与折扣率，计算折后价；折后价为负时通过 onError 上报业务错误。

```ts
import {
  CatalogFactory,
  ClientFunction,
  SurfaceController,
  SurfaceControllerFactory,
  UIRendererComponent
} from '@arkui-genius/genui'

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

@Entry
@Component
struct ClientFunctionDemo {
  @State controller: SurfaceController | null = null

  aboutToAppear(): void {
    const catalog = CatalogFactory.extended()
    catalog.addClientFunction(applyDiscount)

    this.controller = SurfaceControllerFactory.createSurfaceController({
      uiContext: this.getUIContext(),
      catalog: catalog
    })

    this.controller?.handleMessage(JSON.stringify({
      version: 'v0.9',
      createSurface: { surfaceId: 'main', catalogId: 'ohos.a2ui.extended.catalog' }
    }))

    this.controller?.handleMessage(JSON.stringify({
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'finalPrice', component: 'Text',
            text: {
              call: 'applyDiscount',
              args: {
                price: { path: '/goods/price' },
                rate: 0.15
              },
              returnType: 'number'
            }
          }
        ]
      }
    }))

    this.controller?.handleMessage(JSON.stringify({
      version: 'v0.9',
      updateDataModel: {
        surfaceId: 'main', path: '/',
        value: { goods: { price: 199 } }
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

---

↑ [返回 API 速查](./README.md)
