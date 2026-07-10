# 扩展组件一多部署

> **起始版本：** API Version 20
>
> 本文说明鸿蒙扩展协议下当前项目内置扩展组件的“一次实现，多端部署”能力。使用一多部署能力时，需要启用扩展 Catalog，并在 [createSurface](../reference/messages.md#createsurface) 中使用 ohos.a2ui.extended.catalog。

## 概述

扩展组件提供“一次实现，多端部署”能力。同一份 DSL 在不同窗口断点下渲染时，支持一多部署的组件会根据当前断点调整尺寸、间距或列数等布局参数；如果 DSL 显式设置了对应布局属性，组件优先使用 DSL 中的显式值。

断点来源、宽度范围和表达式用法见 [多设备自适应](multi-device-adaptation.md)。扩展组件默认深浅色见 [扩展组件默认深浅色](extension-color-mode.md)。

## 使用说明

### 启用扩展 Catalog

应用侧创建 SurfaceController 时，需要传入扩展 Catalog。

```ts
import { CatalogFactory, SurfaceControllerFactory } from '@arkui-genius/genui'

const catalog = CatalogFactory.extended()
const controller = SurfaceControllerFactory.createSurfaceController({
  uiContext: this.getUIContext(),
  catalog,
  eventCallback: this.surfaceEventCallback
})
```

### 声明扩展组件集

DSL 通过 createSurface.catalogId 声明扩展组件集。

```json
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "extended-layout-demo",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
}
```

## 内置适配组件

| 组件 | 影响范围 | 内置行为 |
|------|----------|----------|
| 所有支持 styles.width / styles.height 的扩展组件 | 尺寸自适应 | 父组件对应宽/高为定值时，matchParent 填充父容器；wrapContent 根据内容收缩 |
| [Row](../reference/extended-components/row.md) / [Column](../reference/extended-components/column.md) | justifyContent 主轴分布 | DSL 使用 spaceBetween / spaceAround / spaceEvenly 时，子项间距随容器尺寸自动调整 |
| [Grid](../reference/extended-components/grid.md) | 列数 / columnsTemplate 默认值 | DSL 未显式设置列模板时，Grid 根据断点自动选择默认列模板 |
| [List](../reference/extended-components/list.md) | 列表型内容的默认列数 | 组件内部根据断点调整列表型内容的布局密度 |

> **说明**
>
> 显式配置优先级高于内置默认值。如果 DSL 已经明确设置了某个布局属性，组件优先使用 DSL 值；只有 DSL 没有提供对应属性时，组件才使用下方内置断点规格。

## 公共布局协议值

除 Grid / List 的断点默认值外，公共样式和 Row / Column 的主轴分布值也属于一多适配的基础能力。DSL 使用这些协议值后，不需要为不同设备分别生成多套布局；组件尺寸或子项间距会跟随父容器和内容自动变化。

| 协议值 | ArkUI 行为 | 多端适配作用 | 适用属性 | 适用场景 |
|------|----------|------------|----------|------|
| matchParent | 父组件对应宽/高为定值时，组件大小填充父容器（100%） | 父容器尺寸确定时，组件自动拉伸填满可用空间 | width、height | 公共样式 |
| wrapContent | 组件大小自适应子内容 | 组件根据内容自动收缩，避免浪费空间 | width、height | 公共样式 |
| spaceBetween | 子元素均匀分布，首尾对齐边缘 | 子项在不同容器宽度下自动调整间距 | justifyContent | Row / Column |
| spaceAround | 子元素均匀分布，首尾间距为中间间距的一半 | 子项在不同容器宽度下自动调整间距 | justifyContent | Row / Column |
| spaceEvenly | 子元素完全均匀分布 | 子项在不同容器宽度下自动调整间距 | justifyContent | Row / Column |

> matchParent 只在父组件对应方向的尺寸为定值时生效。例如 width: "matchParent" 需要父组件宽度已确定，height: "matchParent" 需要父组件高度已确定；如果父组件使用 wrapContent 或未给出确定尺寸，应改用 %、vp、wrapContent，或先为父组件设置确定尺寸。

## Grid 内置规格

[Grid](../reference/extended-components/grid.md) 的默认列模板会按断点调整。Grid 组件内部已经实现断点映射，开发者不需要在 DSL 中手写以下映射。

| 断点名称 | Grid 列模板 | 列数 |
|----------|-------------|------|
| xs | "1fr 1fr" | 2 |
| sm | "1fr 1fr" | 2 |
| md | "1fr 1fr 1fr" | 3 |
| lg | "1fr 1fr 1fr 1fr 1fr" | 5 |
| xl | "1fr 1fr 1fr 1fr 1fr" | 5 |

如果业务需要覆盖默认列数，可以在 DSL 中显式设置 columnsTemplate。此时 Grid 优先使用显式值，内置断点默认列数不再生效。

## List 内置规格

[List](../reference/extended-components/list.md) 的列表型内容会按断点调整默认列数。List 组件内部已经实现断点映射，开发者不需要新增 DSL 字段。

| 断点名称 | List 列数 |
|----------|-----------|
| xs | 1 |
| sm | 1 |
| md | 2 |
| lg | 3 |
| xl | 3 |

## 自定义组件接入

自定义组件不会自动获得 Grid / List 的内部适配逻辑。如果业务希望自定义组件也具备“一次实现，多端部署”能力，开发者需要在自定义组件实现中接入断点策略。

### 接入原则

| 接入点 | 说明 |
|--------|------|
| 明确影响范围 | 先确定断点会影响哪些内部布局属性，例如列数、主轴方向、间距、字号或辅助内容显隐 |
| 实现默认映射 | 在组件内部根据当前断点选择默认布局值，例如复用上方 Grid / List 的列数映射 |
| 保留显式覆盖 | DSL 或自定义属性显式传入布局值时，组件优先使用显式值；未传时才使用断点默认值 |
| 响应断点变化 | 窗口断点变化后，自定义组件需要重新计算布局并刷新 UI |
| 更新 Schema | 如果组件暴露可覆盖的属性，需要在 [schemaProvider](../guides/creating-custom-components.md#step-2定义-schema) 中说明这些属性是可选覆盖项，不是使用一多能力的必填项 |

### 开发步骤

1. 在自定义组件内部封装断点到布局值的映射函数。
2. 自定义组件渲染时先读取 DSL 显式属性；如果 DSL 没有提供显式属性，再读取 CustomComponentAttribute.componentTheme.breakpoint 并套用默认映射。
3. 窗口断点变化时，自定义组件重新计算布局。
4. 组件文档需要说明“未设置时自动适配，设置后以设置值为准”。

### 完整示例

以下示例展示 AdaptiveMetricsGrid 自定义组件如何接入断点映射。

```ts
import {
  Breakpoint,
  CatalogFactory,
  CatalogItem,
  CustomComponentAttribute,
  SurfaceController,
  SurfaceControllerFactory,
  SurfaceErrorCode,
  UIRendererComponent
} from '@arkui-genius/genui'
import { wrapBuilder } from '@kit.ArkUI'

function defaultColumnsTemplate(bp: Breakpoint | undefined): string {
  if (bp === Breakpoint.XS || bp === Breakpoint.SM) {
    return '1fr 1fr'
  }
  if (bp === Breakpoint.MD) {
    return '1fr 1fr 1fr'
  }
  return '1fr 1fr 1fr 1fr 1fr'
}

function resolveColumnsTemplate(
  explicitValue: Object | undefined,
  bp: Breakpoint | undefined
): string {
  if (typeof explicitValue === 'string' && explicitValue.length > 0) {
    return explicitValue
  }
  return defaultColumnsTemplate(bp)
}

function resolveGap(value: Object | undefined): number {
  if (typeof value === 'number' && value >= 0) {
    return value
  }
  return 12
}

interface MetricItem {
  label: string
  value: string
}

function resolveMetricItems(value: Object | undefined): MetricItem[] {
  if (!Array.isArray(value)) {
    return []
  }

  const items: MetricItem[] = []
  const rawItems = value as Record<string, Object>[]
  for (const rawItem of rawItems) {
    const label = typeof rawItem.label === 'string' ? rawItem.label : ''
    const metricValue = typeof rawItem.value === 'string' ? rawItem.value : ''
    if (label.length > 0 || metricValue.length > 0) {
      items.push({ label, value: metricValue })
    }
  }
  return items
}

@Builder
function AdaptiveMetricsGrid(attr: CustomComponentAttribute): void {
  const props = attr.customProps ?? {}
  const columnsTemplate = resolveColumnsTemplate(
    props.columnsTemplate,
    attr.componentTheme?.breakpoint
  )
  const gap = resolveGap(props.gap)
  const items = resolveMetricItems(props.items)

  Grid() {
    ForEach(items, (item: MetricItem) => {
      GridItem() {
        Column() {
          Text(item.value)
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
          Text(item.label)
            .fontSize(12)
            .fontColor('#99000000')
            .margin({ top: 4 })
        }
        .padding(12)
        .borderRadius(8)
        .backgroundColor('#0D000000')
      }
    }, (item: MetricItem) => `${item.label}-${item.value}`)
  }
  .columnsTemplate(columnsTemplate)
  .columnsGap(gap)
  .rowsGap(gap)
  .width('100%')
}

const adaptiveMetricsGridItem: CatalogItem = {
  name: 'AdaptiveMetricsGrid',
  componentBuilder: wrapBuilder(AdaptiveMetricsGrid),
  schemaProvider: (_version: string): string => JSON.stringify({
    type: 'object',
    properties: {
      items: {
        type: 'array',
        description: '指标卡片列表。未提供时组件展示为空列表。',
        items: {
          type: 'object',
          properties: {
            label: { type: 'string', description: '指标名称' },
            value: { type: 'string', description: '指标值' }
          },
          required: ['label', 'value']
        }
      },
      columnsTemplate: {
        type: 'string',
        description: '可选列模板。传入后覆盖组件内部按断点计算的默认列数。'
      },
      gap: {
        type: 'number',
        description: '可选卡片间距，单位 vp。未传时默认 12。'
      }
    },
    required: ['items']
  })
}

@Entry
@Component
struct AdaptiveMetricsGridDemo {
  @State controller: SurfaceController | null = null

  aboutToAppear(): void {
    // 将自定义组件注册到 Catalog，再使用该 Catalog 创建 SurfaceController。
    const catalog = CatalogFactory.extended()
    catalog.addCatalogItem(adaptiveMetricsGridItem)
    this.controller = SurfaceControllerFactory.createSurfaceController({
      uiContext: this.getUIContext(),
      catalog,
      eventCallback: (_eventType, _controller) => {}
    })
    this.controller.registerErrorCallback((code: SurfaceErrorCode, errorMsg: string) => {
      console.error(`GenUI error ${code}: ${errorMsg}`)
    })

    this.controller.handleMessage(DSL)
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

如果自定义组件只需要让 DSL 在不同断点下生成不同属性值，可以继续使用 $__widthBreakpoint 表达式；这种方式属于 DSL 级自适应，不等同于组件内部的一多部署能力。更多多设备布局能力说明见 [多设备自适应](multi-device-adaptation.md) 和 [多设备自适应最佳实践](../guides/multi-device-best-practices.md)。

## 面向模型的一多能力 Prompt 示例

以下内容可作为补充 prompt 追加到模型的 system prompt 或工具说明中，用于指导模型生成具备“一次实现，多端部署”能力的扩展组件 DSL：

```text
你正在生成 A2UI 扩展组件 DSL。生成布局时优先使用扩展组件内置的一多部署能力，让同一份 DSL 在手机、折叠屏、平板和桌面窗口中自适应。

断点说明：
- 框架按当前窗口宽度自动计算断点，取值只有 xs、sm、md、lg、xl。
- xs: 0-320vp，sm: 320-600vp，md: 600-840vp，lg: 840-1024vp，xl: 1024vp+。
- 当窗口缩放、设备旋转、折叠屏展开或收起等行为导致窗口宽度跨越断点范围时，断点会切换，组件应随新断点重新计算布局。
- 断点切换内部基于 onSizeChange 回调触发；该回调在布局变化时返回尺寸，受计算精度影响可能与真实物理尺寸存在细微差异。生成 DSL 时应以 $__widthBreakpoint 的取值为准，不要依赖物理尺寸做精确分支。
- 布局结构不同，例如单列和双列切换、有无侧边栏切换时，使用 If 组件并让 condition 引用 $__widthBreakpoint。
- 只有属性值不同，例如字号、间距、显隐、padding、width 时，使用 {{ }} 表达式和三元表达式引用 $__widthBreakpoint。

Grid 和 List：
- Grid 未显式设置 columnsTemplate 时，组件内部按断点选择默认列模板：xs/sm 为 2 列，md 为 3 列，lg/xl 为 5 列。
- List 的列表型内容按断点调整默认列数：xs/sm 为 1 列，md 为 2 列，lg/xl 为 3 列。
- 不要为了默认列数手写 columnsTemplate；只有业务需要覆盖默认列数时才显式设置 columnsTemplate。显式值优先于组件内置断点默认值。

Row 和 Column：
- Row 的主轴是水平方向，Column 的主轴是垂直方向。
- justifyContent 可使用 spaceBetween、spaceAround、spaceEvenly，让子项在主轴方向上随容器尺寸自动分布。
- 当使用这些主轴均分值时，不要再依赖固定 itemMargin 表达子项间距。

公共 width / height：
- styles.width 和 styles.height 可使用 matchParent 或 wrapContent。
- matchParent 表示在父组件对应方向尺寸已确定时填充父容器；父组件尺寸不确定时，不要使用 matchParent，应改用 100%、vp、wrapContent，或先为父组件设置确定尺寸。
- wrapContent 表示组件尺寸根据内容收缩，适合内容宽高不固定、希望避免浪费空间的场景。

$__widthBreakpoint：
- $__widthBreakpoint 是表达式全局变量，可在 {{ }} 中读取当前窗口宽度断点。
- 变量名必须写作 $__widthBreakpoint，注意双下划线和大小写；不要写成 $widthBreakpoint、$breakpoint 或其他名称。
- 示例：
  {
    "id": "adaptiveTitle",
    "component": "Text",
    "content": "销售概览",
    "styles": {
      "fontSize": "{{ $__widthBreakpoint == 'xs' || $__widthBreakpoint == 'sm' ? 16 : 22 }}",
      "width": "wrapContent"
    }
  }
```

---

← 上一节：[扩展组件默认深浅色](extension-color-mode.md) | → 下一节：[多设备自适应](multi-device-adaptation.md) | ↑ [概念层总览](overview.md)
