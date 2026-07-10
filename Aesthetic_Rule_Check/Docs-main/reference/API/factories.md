# Factories

Factories 提供 Catalog 与控制器的工厂方法，是创建 [Catalog](./catalog.md#catalog) 与 [SurfaceController](./surface-controller.md#surfacecontroller) / [MultiSurfaceController](./multi-surface-controller.md#multisurfacecontroller) 实例的唯一入口。两个工厂类全部为静态方法，无需实例化。

> **说明：**
>
> - 本模块接口从 OpenHarmony API Version 13 开始支持，环境要求见 [README](../../README.md#环境要求)。
> - Catalog 与控制器均不能直接 new，必须通过本页工厂方法创建。

## 导入模块

```ts
import {
  CatalogFactory,
  SurfaceControllerFactory,
  Catalog,
  CatalogItem,
  ClientFunction,
  SurfaceController,
  MultiSurfaceController,
  SurfaceControllerOption
} from '@arkui-genius/genui'
```

## CatalogFactory

```ts
class CatalogFactory
```

Catalog 工厂类，创建预置或自定义的能力集实例。

| 方法 | 说明 |
|------|------|
| [basic](#catalogfactorybasic) | 创建 A2UI 基础协议 Catalog。 |
| [extended](#catalogfactoryextended) | 创建鸿蒙扩展协议 Catalog。 |
| [createCatalog](#catalogfactorycreatecatalog) | 创建自定义 Catalog。 |

### CatalogFactory.basic

```ts
static basic(): Catalog
```

**接口说明：**

创建 A2UI 基础协议 Catalog，包含标准组件集与内置函数。对应 catalogId 为 https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json，协议版本为 [BASIC_CATALOG_PROTOCOL_VERSION_V09](./version.md#basic_catalog_protocol_version_v09)。

**支持的版本：** OpenHarmony API Version 13 及以上。

**返回值：**

| 类型 | 说明 |
|------|------|
| [Catalog](./catalog.md#catalog) | 基础协议 Catalog 实例。 |

**示例：**

```ts
import { CatalogFactory } from '@arkui-genius/genui'

const catalog = CatalogFactory.basic()
```

### CatalogFactory.extended

```ts
static extended(): Catalog
```

**接口说明：**

创建鸿蒙扩展协议 Catalog，在基础组件之上扩展了扩展组件、扩展函数、表达式系统、变量系统、styles 样式对象与多设备自适应能力。对应 catalogId 为 ohos.a2ui.extended.catalog。DSL 顶层 version 和 PromptBuilder version 仍使用 [BASIC_CATALOG_PROTOCOL_VERSION_V09](./version.md#basic_catalog_protocol_version_v09)。

**支持的版本：** OpenHarmony API Version 13 及以上。

**返回值：**

| 类型 | 说明 |
|------|------|
| [Catalog](./catalog.md#catalog) | 扩展协议 Catalog 实例。 |

**示例：**

```ts
import { CatalogFactory } from '@arkui-genius/genui'

const catalog = CatalogFactory.extended()
```

### CatalogFactory.createCatalog

```ts
static createCatalog(
  catalogId: string,
  components: CatalogItem[],
  clientFunctions: ClientFunction[]
): Catalog
```

**接口说明：**

创建自定义 Catalog，使用宿主指定的 catalogId、组件项列表与本地函数列表。适合需要完全自定义组件与函数集合的场景。创建后仍可通过 [Catalog](./catalog.md#catalog) 的 addCatalogItem / addClientFunction 追加能力。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| catalogId | string | 是 | Catalog 标识，DSL 中 createSurface 的 catalogId 需与之匹配。 |
| components | [CatalogItem](./catalog-item.md#catalogitem)[] | 是 | 组件项列表。无需自定义组件时传空数组。 |
| clientFunctions | [ClientFunction](./client-function.md#clientfunction)[] | 是 | 本地函数列表。无需自定义函数时传空数组。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| [Catalog](./catalog.md#catalog) | 自定义 Catalog 实例。 |

**示例：**

```ts
import { CatalogFactory, CatalogItem, ClientFunction } from '@arkui-genius/genui'

const components: CatalogItem[] = [/* 自定义组件项 */]
const clientFunctions: ClientFunction[] = [/* 自定义函数项 */]

const catalog = CatalogFactory.createCatalog(
  'my-business-catalog',
  components,
  clientFunctions
)
```

## SurfaceControllerFactory

```ts
class SurfaceControllerFactory
```

控制器工厂类，创建单 Surface 或多 Surface 控制器实例。

| 方法 | 说明 |
|------|------|
| [createSurfaceController](#surfacecontrollerfactorycreatesurfacecontroller) | 创建单 Surface 控制器。 |
| [createMultiSurfaceController](#surfacecontrollerfactorycreatemultisurfacecontroller) | 创建多 Surface 控制器。 |

### SurfaceControllerFactory.createSurfaceController

```ts
static createSurfaceController(option: SurfaceControllerOption): SurfaceController
```

**接口说明：**

创建单 Surface 控制器，用于接收 A2UI DSL 消息并维护单个 Surface 状态。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| option | [SurfaceControllerOption](./surface-controller.md#surfacecontrolleroption) | 是 | 控制器初始化选项，包含 uiContext、catalog 与可选 eventCallback。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| [SurfaceController](./surface-controller.md#surfacecontroller) | 单 Surface 控制器实例。 |

**示例：**

```ts
import {
  CatalogFactory,
  SurfaceController,
  SurfaceControllerFactory
} from '@arkui-genius/genui'

const controller: SurfaceController = SurfaceControllerFactory.createSurfaceController({
  uiContext: this.getUIContext(),
  catalog: CatalogFactory.basic()
})
```

### SurfaceControllerFactory.createMultiSurfaceController

```ts
static createMultiSurfaceController(option: SurfaceControllerOption): MultiSurfaceController
```

**接口说明：**

创建多 Surface 控制器。在 [SurfaceController](./surface-controller.md#surfacecontroller) 公共能力基础上增加 Surface 栈管理（最多 15 层 push/pop 导航）与右滑返回手势。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| option | [SurfaceControllerOption](./surface-controller.md#surfacecontrolleroption) | 是 | 控制器初始化选项，包含 uiContext、catalog 与可选 eventCallback。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| [MultiSurfaceController](./multi-surface-controller.md#multisurfacecontroller) | 多 Surface 控制器实例。 |

**示例：**

```ts
import {
  CatalogFactory,
  MultiSurfaceController,
  SurfaceControllerFactory
} from '@arkui-genius/genui'

const controller: MultiSurfaceController = SurfaceControllerFactory.createMultiSurfaceController({
  uiContext: this.getUIContext(),
  catalog: CatalogFactory.extended()
})

controller.setBackGestureEnabled(true)
```

---

↑ [返回 API 速查](./README.md)
