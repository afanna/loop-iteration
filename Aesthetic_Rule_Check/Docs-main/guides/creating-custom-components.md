# 自定义组件

自定义组件用于把业务专属 ArkUI 视图注册到 GenUI。公开接口以 [CatalogItem](../reference/API/catalog-item.md#catalogitem) 为注册单元：组件名称、Schema 和组件构建器放入 Catalog，再通过 DSL 的 component 字段使用。

---

## 何时创建自定义组件

| 场景 | 方案 |
|------|------|
| 标准组件或扩展组件能满足需求 | 直接使用已有组件 |
| 需要业务专属视觉组件 | 创建自定义组件 |
| 需要固定业务布局和渲染逻辑 | 创建自定义组件 |
| 只是调整颜色、间距、圆角 | 使用扩展组件 styles，参见 [扩展组件样式](../reference/extended-components/overview.md#styles-通用样式) |

---

## Step 1：定义 Builder

```ts
import {
  CustomComponentAttribute,
  ThemeMode
} from '@arkui-genius/genui'

@Builder
function WeatherCard(attr: CustomComponentAttribute) {
  const city = attr.resolver.evaluateValue<string>(attr.customProps?.city) ?? '未知城市'
  const temperature = attr.resolver.evaluateValue<number>(attr.customProps?.temperature) ?? 0
  const condition = attr.resolver.evaluateValue<string>(attr.customProps?.condition) ?? '晴'
  const theme = attr.componentTheme
  const brandColor = theme.colorMode === ThemeMode.DARK
    ? (theme.darkPrimaryColor ?? theme.primaryColor ?? '#0A59F7')
    : (theme.primaryColor ?? '#0A59F7')

  Column() {
    Text(city)
      .fontSize(20)
      .fontWeight(FontWeight.Bold)
      .fontColor('#FFFFFF')
    Text(`${temperature}°C`)
      .fontSize(40)
      .fontWeight(FontWeight.Bold)
      .fontColor('#FFFFFF')
      .margin({ top: 8 })
    Text(condition)
      .fontSize(16)
      .fontColor('#DCEBFF')
      .margin({ top: 6 })
  }
  .width('280vp')
  .padding(20)
  .borderRadius(12)
  .backgroundColor(brandColor)
}
```

customProps 包含 DSL 中除 id 和 component 外的自定义属性。属性值可以是字面量、路径绑定或函数调用，读取时用 attr.resolver.evaluateValue 解析。

---

## Step 2：创建 CatalogItem

```ts
import { CatalogItem } from '@arkui-genius/genui'
import { wrapBuilder } from '@kit.ArkUI'

const weatherCardItem: CatalogItem = {
  name: 'WeatherCard',
  schemaProvider: (_version: string): string => JSON.stringify({
    type: 'object',
    properties: {
      city: { type: 'string', description: '城市名称，支持路径绑定' },
      temperature: { type: 'number', description: '当前温度，单位为摄氏度，支持路径绑定' },
      condition: { type: 'string', description: '天气状况，例如晴、多云、雨、雪' }
    },
    required: ['city', 'temperature']
  }),
  componentBuilder: wrapBuilder(WeatherCard)
}
```

name 必须与 DSL 中 component 字段一致。schemaProvider 的返回值会被 PromptBuilder 用于生成 LLM 能力说明，也会用于运行期 Schema 校验。

---

## Step 3：注册到 Catalog

```ts
import {
  Catalog,
  CatalogFactory,
  SurfaceController,
  SurfaceControllerFactory
} from '@arkui-genius/genui'

const catalog: Catalog = CatalogFactory.extended()
catalog.addCatalogItem(weatherCardItem)

const controller: SurfaceController = SurfaceControllerFactory.createSurfaceController({
  uiContext: this.getUIContext(),
  catalog: catalog
})
```

自定义组件必须在创建 SurfaceController 前加入 Catalog。运行期追加 CatalogItem 不会自动重建已经创建的控制器。

---

## Step 4：在 DSL 中使用

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "weather-demo",
    "components": [
      {
        "id": "root",
        "component": "WeatherCard",
        "city": "杭州",
        "temperature": 28,
        "condition": "多云"
      }
    ]
  }
}
```

如果属性绑定 DataModel，可把字面量改为路径绑定：

```json
{
  "id": "root",
  "component": "WeatherCard",
  "city": { "path": "/weather/city" },
  "temperature": { "path": "/weather/temperature" },
  "condition": { "path": "/weather/condition" }
}
```

---

## 完整示例

```ts
import {
  CatalogFactory,
  CatalogItem,
  CustomComponentAttribute,
  BASIC_CATALOG_PROTOCOL_VERSION_V09,
  SurfaceController,
  SurfaceControllerFactory,
  ThemeMode,
  UIRendererComponent
} from '@arkui-genius/genui'
import { wrapBuilder } from '@kit.ArkUI'

@Builder
function WeatherCard(attr: CustomComponentAttribute) {
  const city = attr.resolver.evaluateValue<string>(attr.customProps?.city) ?? '未知城市'
  const temperature = attr.resolver.evaluateValue<number>(attr.customProps?.temperature) ?? 0
  const condition = attr.resolver.evaluateValue<string>(attr.customProps?.condition) ?? '晴'
  const theme = attr.componentTheme
  const brandColor = theme.colorMode === ThemeMode.DARK
    ? (theme.darkPrimaryColor ?? theme.primaryColor ?? '#0A59F7')
    : (theme.primaryColor ?? '#0A59F7')

  Column() {
    Text(city)
      .fontSize(20)
      .fontWeight(FontWeight.Bold)
      .fontColor('#FFFFFF')
    Text(`${temperature}°C`)
      .fontSize(40)
      .fontWeight(FontWeight.Bold)
      .fontColor('#FFFFFF')
      .margin({ top: 8 })
    Text(condition)
      .fontSize(16)
      .fontColor('#DCEBFF')
      .margin({ top: 6 })
  }
  .width('280vp')
  .padding(20)
  .borderRadius(12)
  .backgroundColor(brandColor)
}

const weatherCardItem: CatalogItem = {
  name: 'WeatherCard',
  schemaProvider: (_version: string): string => JSON.stringify({
    type: 'object',
    properties: {
      city: { type: 'string', description: '城市名称，支持路径绑定' },
      temperature: { type: 'number', description: '当前温度，单位为摄氏度，支持路径绑定' },
      condition: { type: 'string', description: '天气状况，例如晴、多云、雨、雪' }
    },
    required: ['city', 'temperature']
  }),
  componentBuilder: wrapBuilder(WeatherCard)
}

@Entry
@Component
struct WeatherCardDemo {
  @State controller: SurfaceController | null = null

  aboutToAppear(): void {
    const catalog = CatalogFactory.extended()
    catalog.addCatalogItem(weatherCardItem)

    this.controller = SurfaceControllerFactory.createSurfaceController({
      uiContext: this.getUIContext(),
      catalog: catalog
    })

    this.controller?.handleMessage(JSON.stringify({
      version: BASIC_CATALOG_PROTOCOL_VERSION_V09,
      createSurface: {
        surfaceId: 'weather-demo',
        catalogId: 'ohos.a2ui.extended.catalog'
      }
    }))

    this.controller?.handleMessage(JSON.stringify({
      version: BASIC_CATALOG_PROTOCOL_VERSION_V09,
      updateComponents: {
        surfaceId: 'weather-demo',
        components: [
          {
            id: 'root',
            component: 'WeatherCard',
            city: '杭州',
            temperature: 28,
            condition: '多云'
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
    .width('100%')
    .height('100%')
    .padding(24)
  }
}
```

---

## 响应 DataModel 更新

自定义组件的 Builder 会在 updateComponents、主题模式变化和断点变化时重新执行。单纯 updateDataModel 不会重新执行 Builder。需要随 DataModel 实时刷新时，在状态化子组件中使用 resolvePropertyValue 订阅。

```ts
import {
  A2UIValueType,
  CustomComponentAttribute,
  DynamicValueResolver
} from '@arkui-genius/genui'

@Component
struct ReactiveTextView {
  private resolver: DynamicValueResolver | null = null
  private textValue: A2UIValueType = ''
  @State text: string = ''

  aboutToAppear(): void {
    this.resolver?.resolvePropertyValue<string>('text', this.textValue, (value: string) => {
      this.text = value
    })
  }

  build() {
    Text(this.text).fontSize(16)
  }
}

@Builder
function LiveText(attr: CustomComponentAttribute) {
  ReactiveTextView({
    resolver: attr.resolver,
    textValue: attr.customProps?.text
  })
}
```

---

## CustomComponentAttribute 字段

| 字段 | 说明 |
|------|------|
| type | 组件类型名，与 CatalogItem.name 一致 |
| id | 组件 ID |
| surfaceId | 当前 Surface ID |
| customProps | DSL 中除 id 和 component 外的自定义属性 |
| protocolVersion | 当前 Surface 使用的协议版本 |
| catalogId | 当前 Surface 绑定的 Catalog 标识 |
| componentTheme | 主题、深浅色和断点上下文 |
| resolver | 动态值解析器，用于解析路径绑定和函数调用 |
| changeReason | 本次 Builder 被调用的原因 |

完整字段定义见 [CatalogItem API](../reference/API/catalog-item.md#customcomponentattribute)。

---

相关指南：
→ [自定义函数](creating-custom-functions.md) | → [定义 Catalog](defining-catalogs.md) | → [数据模型与绑定](../concepts/data-model-and-binding.md) | → [DynamicValueResolver API](../reference/API/dynamic-value-resolver.md)
