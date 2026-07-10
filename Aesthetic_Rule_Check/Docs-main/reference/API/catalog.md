# Catalog

Catalog 负责定义和管理 A2UI 渲染引擎使用的能力集，包含自定义组件（[CatalogItem](./catalog-item.md#catalogitem)）和本地函数（[ClientFunction](./client-function.md#clientfunction)），是创建 [SurfaceController](./surface-controller.md#surfacecontroller) 的必要参数。Catalog 实例通过 [CatalogFactory](./factories.md#catalogfactory) 创建。

> **说明：**
>
> - 本模块接口从 OpenHarmony API Version 13 开始支持，环境要求见 [README](../../README.md#环境要求)。
> - Catalog 不能直接 new，通过 [CatalogFactory.basic](./factories.md#catalogfactorybasic) / [extended](./factories.md#catalogfactoryextended) / [createCatalog](./factories.md#catalogfactorycreatecatalog) 创建。
> - 基础协议 Catalog 与扩展协议 Catalog 的差异见 [A2UI 与鸿蒙扩展](../../introduction/a2ui-and-harmonyos.md)。

## 导入模块

```ts
import { Catalog, CatalogItem, ClientFunction } from '@arkui-genius/genui'
```

## Catalog

```ts
interface Catalog
```

能力集管理接口，提供组件项与本地函数项的增删查。实例由 [CatalogFactory](./factories.md#catalogfactory) 创建，可在传入控制器之前补充自定义能力。

**方法概览：**

| 方法 | 说明 |
|------|------|
| [addCatalogItem](#addcatalogitem) | 添加或替换一个组件项。 |
| [removeCatalogItem](#removecatalogitem) | 按名称移除组件项。 |
| [hasCatalogItem](#hascatalogitem) | 查询是否已注册指定名称的组件项。 |
| [getAllCatalogItemNames](#getallcatalogitemnames) | 返回全部已注册组件项的名称。 |
| [addClientFunction](#addclientfunction) | 添加或替换一个本地函数。 |
| [removeClientFunction](#removeclientfunction) | 按名称移除本地函数。 |
| [hasClientFunction](#hasclientfunction) | 查询是否已注册指定名称的本地函数。 |
| [getAllClientFunctionNames](#getallclientfunctionnames) | 返回全部已注册本地函数的名称。 |

### addCatalogItem

```ts
addCatalogItem(catalogItem: CatalogItem): boolean
```

**接口说明：**

添加一个组件项；若已存在同名组件项则替换。同名判断以 [CatalogItem.name](./catalog-item.md#catalogitem) 为准。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| catalogItem | [CatalogItem](./catalog-item.md#catalogitem) | 是 | 要添加或替换的组件项。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| boolean | true 表示添加或替换成功。 |

### removeCatalogItem

```ts
removeCatalogItem(name: string): boolean
```

**接口说明：**

按名称移除组件项。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 组件名称，需与 [CatalogItem.name](./catalog-item.md#catalogitem) 一致。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| boolean | true 表示移除成功；false 表示不存在该名称的组件项。 |

### hasCatalogItem

```ts
hasCatalogItem(name: string): boolean
```

**接口说明：**

查询是否已注册指定名称的组件项。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 要查询的组件名称。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| boolean | true 表示已注册；false 表示未注册。 |

### getAllCatalogItemNames

```ts
getAllCatalogItemNames(): string[]
```

**接口说明：**

返回当前 Catalog 中全部已注册组件项的名称。

**支持的版本：** OpenHarmony API Version 13 及以上。

**返回值：**

| 类型 | 说明 |
|------|------|
| string[] | 已注册组件项名称列表。 |

### addClientFunction

```ts
addClientFunction(clientFunction: ClientFunction): boolean
```

**接口说明：**

添加一个本地函数；若已存在同名函数则替换。同名判断以 [ClientFunction.name](./client-function.md#clientfunction) 为准。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| clientFunction | [ClientFunction](./client-function.md#clientfunction) | 是 | 要添加或替换的本地函数项。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| boolean | true 表示添加或替换成功。 |

### removeClientFunction

```ts
removeClientFunction(name: string): boolean
```

**接口说明：**

按名称移除本地函数。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 函数名称，需与 [ClientFunction.name](./client-function.md#clientfunction) 一致。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| boolean | true 表示移除成功；false 表示不存在该名称的函数。 |

### hasClientFunction

```ts
hasClientFunction(name: string): boolean
```

**接口说明：**

查询是否已注册指定名称的本地函数。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 要查询的函数名称。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| boolean | true 表示已注册；false 表示未注册。 |

### getAllClientFunctionNames

```ts
getAllClientFunctionNames(): string[]
```

**接口说明：**

返回当前 Catalog 中全部已注册本地函数的名称。

**支持的版本：** OpenHarmony API Version 13 及以上。

**返回值：**

| 类型 | 说明 |
|------|------|
| string[] | 已注册本地函数名称列表。 |

## 使用示例

下面创建一个扩展 Catalog，注册一个自定义组件与一个本地函数，再交给控制器使用。

```ts
import {
  Catalog,
  CatalogFactory,
  CatalogItem,
  ClientFunction,
  CustomComponentAttribute,
  SurfaceController,
  SurfaceControllerFactory,
  UIRendererComponent
} from '@arkui-genius/genui'
import { wrapBuilder } from '@kit.ArkUI'

@Builder
function MyTag(attr: CustomComponentAttribute) {
  const text = attr.resolver.evaluateValue<string>(attr.customProps?.text) ?? ''
  Text(text).fontSize(14).padding(8).borderRadius(8).backgroundColor('#EEF1F4')
}

const myTagItem: CatalogItem = {
  name: 'MyTag',
  schemaProvider: (version) => JSON.stringify({
    type: 'object',
    properties: { text: { type: 'string', description: '标签文本' } },
    required: ['text']
  }),
  componentBuilder: wrapBuilder(MyTag)
}

const toUpper: ClientFunction = {
  name: 'toUpper',
  schemaProvider: (version) => JSON.stringify({
    type: 'object',
    properties: { value: { type: 'string' } },
    required: ['value']
  }),
  functionCall: (params, _context) => {
    const args = params as Record<string, Object>
    return String(args.value).toUpperCase()
  }
}

@Entry
@Component
struct CatalogDemo {
  @State controller: SurfaceController | null = null

  aboutToAppear(): void {
    const catalog = CatalogFactory.extended()
    catalog.addCatalogItem(myTagItem)
    catalog.addClientFunction(toUpper)

    console.info(`组件: ${catalog.getAllCatalogItemNames().join(', ')}`)
    console.info(`函数: ${catalog.getAllClientFunctionNames().join(', ')}`)

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
            id: 'root', component: 'MyTag',
            text: { call: 'toUpper', args: { value: 'hello' }, returnType: 'string' }
          }
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
    .width('100%').height('100%').padding(24)
  }
}
```

---

↑ [返回 API 速查](./README.md)
