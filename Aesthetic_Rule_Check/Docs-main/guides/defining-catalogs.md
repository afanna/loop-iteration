# 定义 Catalog

[Catalog](../concepts/catalogs.md#catalog-的本质) 是 GenUI 的能力清单，决定当前 Surface 可以使用哪些组件和函数。Catalog 只能通过 [CatalogFactory](../reference/API/factories.md#catalogfactory) 创建，创建后可继续添加自定义组件和本地函数。

---

## 内置 Catalog

```ts
import { Catalog, CatalogFactory } from '@arkui-genius/genui'

const basicCatalog: Catalog = CatalogFactory.basic()
const extendedCatalog: Catalog = CatalogFactory.extended()
```

| 工厂方法 | 说明 | 常用 catalogId |
|----------|------|----------------|
| CatalogFactory.basic | A2UI 基础协议 Catalog | https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json |
| CatalogFactory.extended | 鸿蒙扩展协议 Catalog | ohos.a2ui.extended.catalog |

大多数鸿蒙应用应使用 CatalogFactory.extended。它包含扩展组件、扩展函数、表达式系统、变量系统和多设备自适应能力。

---

## 何时创建自定义 Catalog

| 场景 | 推荐做法 |
|------|----------|
| 使用标准或扩展组件即可 | 直接使用 CatalogFactory.basic 或 CatalogFactory.extended |
| 需要增加少量业务函数 | 在内置 Catalog 上调用 addClientFunction |
| 需要增加业务组件 | 在内置 Catalog 上调用 addCatalogItem |
| 需要完全独立的能力集 | 使用 CatalogFactory.createCatalog |

---

## 添加自定义函数

```ts
import {
  A2UIValueType,
  Catalog,
  CatalogFactory,
  ClientFunction,
  FunctionContext
} from '@arkui-genius/genui'

const getGreetingFunction: ClientFunction = {
  name: 'getGreeting',
  schemaProvider: (_version: string): string => JSON.stringify({
    type: 'object',
    properties: {
      name: { type: 'string', description: '用户名称，支持路径绑定' }
    }
  }),
  functionCall: (params: A2UIValueType, context: FunctionContext): A2UIValueType => {
    const args = params as Record<string, Object>
    const name = context.resolver.evaluateValue<string>(args.name) ?? '用户'
    return `欢迎，${name}`
  }
}

const catalog: Catalog = CatalogFactory.extended()
catalog.addClientFunction(getGreetingFunction)
```

完整函数写法见 [自定义函数](creating-custom-functions.md)。

---

## 添加自定义组件

```ts
import {
  Catalog,
  CatalogFactory,
  CatalogItem,
  CustomComponentAttribute
} from '@arkui-genius/genui'
import { wrapBuilder } from '@kit.ArkUI'

@Builder
function Badge(attr: CustomComponentAttribute) {
  const text = attr.resolver.evaluateValue<string>(attr.customProps?.text) ?? ''
  Text(text)
    .fontSize(14)
    .fontColor('#0A59F7')
    .padding({ left: 10, right: 10, top: 6, bottom: 6 })
    .borderRadius(6)
    .backgroundColor('#EAF2FF')
}

const badgeItem: CatalogItem = {
  name: 'Badge',
  schemaProvider: (_version: string): string => JSON.stringify({
    type: 'object',
    properties: {
      text: { type: 'string', description: '徽标文本，支持路径绑定' }
    },
    required: ['text']
  }),
  componentBuilder: wrapBuilder(Badge)
}

const catalog: Catalog = CatalogFactory.extended()
catalog.addCatalogItem(badgeItem)
```

完整组件写法见 [自定义组件](creating-custom-components.md)。

---

## 创建独立 Catalog

```ts
import {
  Catalog,
  CatalogFactory,
  CatalogItem,
  ClientFunction
} from '@arkui-genius/genui'

const components: CatalogItem[] = [badgeItem]
const clientFunctions: ClientFunction[] = [getGreetingFunction]

const catalog: Catalog = CatalogFactory.createCatalog(
  'demo.business.catalog',
  components,
  clientFunctions
)
```

独立 Catalog 的 catalogId 需要与 createSurface 消息中的 catalogId 完全一致。若仍要使用内置组件和函数，优先扩展 CatalogFactory.extended 返回的 Catalog。

---

## Catalog 与 PromptBuilder

PromptBuilder 根据 Catalog 生成 LLM 系统提示词。Catalog 中新增的组件和函数会进入生成结果。

```ts
import {
  BASIC_CATALOG_PROTOCOL_VERSION_V09,
  PromptBuilder
} from '@arkui-genius/genui'

const systemPrompt = PromptBuilder.buildInstruction(
  catalog,
  BASIC_CATALOG_PROTOCOL_VERSION_V09
)
```

如果只需要查询当前 HAR 支持的协议和 Catalog 标识，使用 Capabilities。

```ts
import { Capabilities } from '@arkui-genius/genui'

const manifest = Capabilities.getCapabilities()
console.info(`A2UI 协议版本: ${manifest.supportedA2UIProtocolVersions.join(', ')}`)
console.info(`扩展协议版本: ${manifest.supportedExtendedProtocolVersions.join(', ')}`)
console.info(`Catalog: ${manifest.supportedCatalogIds.join(', ')}`)
```

---

## 完整示例：扩展 Catalog 并渲染欢迎语

```ts
import {
  A2UIValueType,
  Catalog,
  CatalogFactory,
  ClientFunction,
  BASIC_CATALOG_PROTOCOL_VERSION_V09,
  FunctionContext,
  SurfaceController,
  SurfaceControllerFactory,
  UIRendererComponent
} from '@arkui-genius/genui'

const getGreetingFunction: ClientFunction = {
  name: 'getGreeting',
  schemaProvider: (_version: string): string => JSON.stringify({
    type: 'object',
    properties: {
      name: { type: 'string', description: '用户名称，支持路径绑定' }
    }
  }),
  functionCall: (params: A2UIValueType, context: FunctionContext): A2UIValueType => {
    const args = params as Record<string, Object>
    const name = context.resolver.evaluateValue<string>(args.name) ?? '用户'
    return `欢迎，${name}`
  }
}

@Entry
@Component
struct CatalogDemo {
  @State controller: SurfaceController | null = null

  aboutToAppear(): void {
    const catalog: Catalog = CatalogFactory.extended()
    catalog.addClientFunction(getGreetingFunction)

    this.controller = SurfaceControllerFactory.createSurfaceController({
      uiContext: this.getUIContext(),
      catalog: catalog
    })

    this.controller?.handleMessage(JSON.stringify({
      version: BASIC_CATALOG_PROTOCOL_VERSION_V09,
      createSurface: {
        surfaceId: 'main',
        catalogId: 'ohos.a2ui.extended.catalog'
      }
    }))

    this.controller?.handleMessage(JSON.stringify({
      version: BASIC_CATALOG_PROTOCOL_VERSION_V09,
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'root',
            component: 'Column',
            children: ['title', 'greeting']
          },
          {
            id: 'title',
            component: 'Text',
            text: 'Catalog 示例'
          },
          {
            id: 'greeting',
            component: 'Text',
            text: {
              call: 'getGreeting',
              args: { name: { path: '/user/name' } },
              returnType: 'string'
            }
          }
        ]
      }
    }))

    this.controller?.handleMessage(JSON.stringify({
      version: BASIC_CATALOG_PROTOCOL_VERSION_V09,
      updateDataModel: {
        surfaceId: 'main',
        path: '/',
        value: { user: { name: 'Alice' } }
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
    .width('100%')
    .height('100%')
    .padding(24)
  }
}
```

---

相关指南：
→ [自定义组件](creating-custom-components.md) | → [自定义函数](creating-custom-functions.md) | → [版本兼容性](version-compatibility.md) | → [Catalog API](../reference/API/catalog.md)
