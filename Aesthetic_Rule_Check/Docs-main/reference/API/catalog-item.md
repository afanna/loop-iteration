# CatalogItem

CatalogItem 是 Catalog 中的组件注册单元，描述一个自定义组件的名称、Schema 与构建器。配套的 [CustomComponentAttribute](#customcomponentattribute) 是引擎注入到自定义组件构建器的运行时上下文，携带属性、主题、数据绑定解析器（[DynamicValueResolver](./dynamic-value-resolver.md#dynamicvalueresolver)）等信息。

> **说明：**
>
> - 本模块接口从 OpenHarmony API Version 13 开始支持，环境要求见 [README](../../README.md#环境要求)。
> - CatalogItem 通过 [Catalog.addCatalogItem](./catalog.md#addcatalogitem) 注册到 Catalog。
> - 自定义组件的完整开发流程见[自定义组件指南](../../guides/creating-custom-components.md)。

## 导入模块

```ts
import {
  CatalogItem,
  ComponentBuilder,
  CustomComponentAttribute,
  ComponentTheme,
  ChangeReason,
  ThemeMode,
  Breakpoint
} from '@arkui-genius/genui'
```

## ComponentTheme

```ts
interface ComponentTheme
```

Surface 级主题上下文，由引擎注入到 [CustomComponentAttribute.componentTheme](#customcomponentattribute)，自定义组件据此适配品牌色、深浅色与多设备断点。所有字段均为可选。

| 名称 | 类型 | 只读 | 可选 | 说明 |
|--------|------|------|------|------|
| primaryColor | string | 否 | 是 | 当前 Surface 的品牌主色。 |
| colorMode | [ThemeMode](./types.md#thememode) | 否 | 是 | 当前色彩模式（浅色 / 深色）。 |
| breakpoint | [Breakpoint](./types.md#breakpoint) | 否 | 是 | 当前响应式断点。 |
| darkPrimaryColor | string | 否 | 是 | 深色模式下的主色覆盖值。 |
| iconUrl | string | 否 | 是 | 当前 Agent 或工具的图标 URL。 |
| agentDisplayName | string | 否 | 是 | 当前 Agent 或工具的展示名称。 |

## ChangeReason

```ts
enum ChangeReason
```

[CustomComponentAttribute.changeReason](#customcomponentattribute) 的取值，描述本次重新调用自定义组件构建器的原因。

| 名称 | 说明 |
|--------|------|
| UPDATE_COMPONENT | 组件更新，由 [updateComponents](../messages.md#updatecomponents) 触发。 |
| THEME_MODE_CHANGE | 主题模式切换。 |
| BREAKPOINT_CHANGE | 响应式断点变化。 |

> 自定义组件的 @Builder 仅在上述三种情形下才会被引擎重新调用；单纯的 [updateDataModel](../messages.md#updatedatamodel) 不会触发重渲染。若需响应 DataModel 变化，使用 [DynamicValueResolver.resolvePropertyValue](./dynamic-value-resolver.md#resolvepropertyvalue) 订阅。

## CustomComponentAttribute

```ts
interface CustomComponentAttribute
```

引擎注入到自定义组件构建器的运行时上下文，作为 [@Builder](../../guides/creating-custom-components.md#step-1定义-builder) 的入参。所有字段均为只读，由引擎在调用构建器时填充。

| 名称 | 类型 | 只读 | 可选 | 说明 |
|--------|------|------|------|------|
| type | string | 是 | 否 | 组件类型名，与 [CatalogItem.name](#catalogitem) 一致。 |
| id | string | 是 | 否 | 组件在 Surface 树中的标识。 |
| surfaceId | string | 是 | 否 | 拥有该组件实例的 Surface ID。 |
| customProps | Record\<string, Object\> | 是 | 是 | DSL 中为该组件定义的自定义属性（除 id / component 外的字段）。属性值可能是字面量、路径绑定或函数调用，可用 resolver 解析。 |
| protocolVersion | string | 是 | 否 | 当前 Surface 使用的协议版本。 |
| catalogId | string | 是 | 否 | 当前 Surface 绑定的 Catalog 标识。 |
| componentTheme | [ComponentTheme](#componenttheme) | 是 | 否 | 当前 Surface 的主题上下文。 |
| resolver | [DynamicValueResolver](./dynamic-value-resolver.md#dynamicvalueresolver) | 是 | 否 | 动态值解析器，用于解析 customProps 中的路径绑定与函数调用。 |
| changeReason | [ChangeReason](#changereason) | 是 | 否 | 本次重新调用构建器的原因。 |

## ComponentBuilder

```ts
type ComponentBuilder = WrappedBuilder<[CustomComponentAttribute]>
```

自定义组件构建器类型，基于 ArkUI 的 WrappedBuilder，接收 [CustomComponentAttribute](#customcomponentattribute) 作为唯一参数。通过 @Builder 定义函数后，使用 @kit.ArkUI 的 wrapBuilder 包装得到该类型实例。

## CatalogItem

```ts
interface CatalogItem
```

组件注册单元，描述自定义组件的名称、Schema 与构建器。

| 名称 | 类型 | 只读 | 可选 | 说明 |
|--------|------|------|------|------|
| name | string | 否 | 否 | 组件名称，需与 DSL 中 component 字段一致。 |
| schemaProvider | [SchemaProvider](./types.md#schemaprovider) | 否 | 否 | 组件 Schema 提供函数，返回 JSON Schema 字符串，供 [PromptBuilder](./prompt-builder.md#promptbuilder) 生成提示词与引擎校验使用。 |
| componentBuilder | [ComponentBuilder](#componentbuilder) | 否 | 否 | 组件构建器，由 wrapBuilder 包装 @Builder 函数得到。 |

## 使用示例

下面定义一个读取主题色并用 resolver 解析文本的自定义组件，注册为 CatalogItem 后使用。

```ts
import {
  CatalogFactory,
  CatalogItem,
  CustomComponentAttribute,
  SurfaceController,
  SurfaceControllerFactory,
  ThemeMode,
  UIRendererComponent
} from '@arkui-genius/genui'
import { wrapBuilder } from '@kit.ArkUI'

@Builder
function BrandText(attr: CustomComponentAttribute) {
  // 解析文本动态值（可能是字面量、{ "path": ... } 或 { "call": ... }）
  const text = attr.resolver.evaluateValue<string>(attr.customProps?.text) ?? ''
  // 读取主题色，适配深浅色
  const theme = attr.componentTheme
  const color = theme.colorMode === ThemeMode.DARK
    ? (theme.darkPrimaryColor ?? theme.primaryColor ?? '#0A59F7')
    : (theme.primaryColor ?? '#0A59F7')

  Text(text)
    .fontSize(16)
    .fontColor(color)
}

const brandTextItem: CatalogItem = {
  name: 'BrandText',
  schemaProvider: (version) => JSON.stringify({
    type: 'object',
    properties: {
      text: { type: 'string', description: '文本内容，支持路径绑定' }
    },
    required: ['text']
  }),
  componentBuilder: wrapBuilder(BrandText)
}

@Entry
@Component
struct BrandTextDemo {
  @State controller: SurfaceController | null = null

  aboutToAppear(): void {
    const catalog = CatalogFactory.extended()
    catalog.addCatalogItem(brandTextItem)

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
            id: 'root', component: 'BrandText',
            text: { path: '/title' }
          }
        ]
      }
    }))

    this.controller?.handleMessage(JSON.stringify({
      version: 'v0.9',
      updateDataModel: {
        surfaceId: 'main', path: '/',
        value: { title: 'Hello GenUI' }
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
