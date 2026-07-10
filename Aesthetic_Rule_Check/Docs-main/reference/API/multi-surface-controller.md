# MultiSurfaceController

MultiSurfaceController 继承自 [SurfaceController](./surface-controller.md#surfacecontroller)，以压栈 / 出栈方式管理最多 15 层 Surface，并提供右滑返回手势。通过 [SurfaceControllerFactory.createMultiSurfaceController](./factories.md#surfacecontrollerfactorycreatemultisurfacecontroller) 创建实例。

> **说明：**
>
> - 本模块接口从 OpenHarmony API Version 13 开始支持，环境要求见 [README](../../README.md#环境要求)。
> - MultiSurfaceController 不能直接 new，必须通过 [SurfaceControllerFactory](./factories.md#surfacecontrollerfactory) 创建。
> - 继承自 [SurfaceController](./surface-controller.md#surfacecontroller) 的公共方法（handleMessage、registerActionReceiver、registerErrorCallback、updateThemeMode、destroy 等）见 [SurfaceController](./surface-controller.md#surfacecontroller)，本页仅列出多 Surface 栈管理相关方法。

## 导入模块

```ts
import {
  MultiSurfaceController,
  SurfaceController,
  SurfaceErrorCode
} from '@arkui-genius/genui'
```

## MultiSurfaceController

```ts
interface MultiSurfaceController extends SurfaceController
```

多 Surface 栈控制器，在 [SurfaceController](./surface-controller.md#surfacecontroller) 公共能力基础上增加 Surface 栈管理与右滑返回。

| 方法 | 说明 |
|------|------|
| [canPop](#canpop) | 查询当前是否允许回退。 |
| [pop](#pop) | 弹出栈顶 Surface 并返回操作结果。 |
| [getLatestSurfaceId](#getlatestsurfaceid) | 获取栈顶 Surface ID。 |
| [getSurfaceList](#getsurfacelist) | 按栈顺序返回全部 Surface ID。 |
| [setBackGestureEnabled](#setbackgestureenabled) | 开启或关闭右滑返回手势。 |
| [getBackGestureEnabled](#getbackgestureenabled) | 查询右滑返回手势是否开启。 |

### canPop

```ts
canPop(): boolean
```

**接口说明：**

查询当前是否允许回退。当前 Surface 栈深度大于 1 时返回 true。

**支持的版本：** OpenHarmony API Version 13 及以上。

**返回值：**

| 类型 | 说明 |
|------|------|
| boolean | true 表示栈中至少有 2 层 Surface、允许回退；false 表示只有 0 或 1 层，不允许回退。 |

**示例：**

```ts
if (this.controller && this.controller.canPop()) {
  console.info('当前可以回退')
}
```

### pop

```ts
pop(): SurfaceErrorCode
```

**接口说明：**

弹出当前栈顶 Surface，回到上一层。栈深度大于 1 时弹出栈顶并返回 NO_ERROR；只剩一层或栈为空时返回对应错误码。

**支持的版本：** OpenHarmony API Version 13 及以上。

**返回值：**

| 类型 | 说明 |
|------|------|
| [SurfaceErrorCode](./types.md#surfaceerrorcode) | 回退操作结果。 |

**错误码：**

| 名称 | 值 | 说明 |
|--------|------|------|
| NO_ERROR | 0 | 回退成功。 |
| MULTI_SURFACE_DISABLED | 11001 | 当前控制器未启用多 Surface 模式。 |
| MULTI_SURFACE_ONLY_ONE_SURFACE | 11002 | 当前只剩一个 Surface，无法继续回退。 |
| MULTI_SURFACE_EMPTY_STACK | 11003 | Surface 栈为空，无法回退。 |

**示例：**

```ts
import { SurfaceErrorCode } from '@arkui-genius/genui'

// 拦截系统返回键：栈深度大于 1 时执行 pop，否则交给系统处理
onBackPress(): boolean {
  if (this.controller && this.controller.canPop()) {
    const code = this.controller.pop()
    if (code === SurfaceErrorCode.NO_ERROR) {
      console.info(`已回退到: ${this.controller.getLatestSurfaceId()}`)
    } else {
      console.error(`回退失败: code=${code}`)
    }
    return true
  }
  return false
}
```

### getLatestSurfaceId

```ts
getLatestSurfaceId(): string
```

**接口说明：**

获取当前栈顶 Surface ID。不存在 Surface 时返回空字符串。

**支持的版本：** OpenHarmony API Version 13 及以上。

**返回值：**

| 类型 | 说明 |
|------|------|
| string | 当前栈顶 Surface ID。不存在时返回空字符串。 |

**示例：**

```ts
const surfaceId = this.controller?.getLatestSurfaceId()
console.info(`当前栈顶 Surface: ${surfaceId}`)
```

### getSurfaceList

```ts
getSurfaceList(): string[]
```

**接口说明：**

按栈顺序返回当前所有 Surface ID，数组第一个元素为栈底，最后一个元素为栈顶。

**支持的版本：** OpenHarmony API Version 13 及以上。

**返回值：**

| 类型 | 说明 |
|------|------|
| string[] | 当前 Surface 栈中全部 Surface ID。 |

**示例：**

```ts
const list = this.controller?.getSurfaceList()
console.info(`栈底到栈顶: ${list?.join(' → ')}`)
```

### setBackGestureEnabled

```ts
setBackGestureEnabled(enable: boolean): void
```

**接口说明：**

开启或关闭右滑返回手势。开启后用户右滑可触发 [pop](#pop) 回退到上一层 Surface。若 UIRendererComponent 位于横向 Scroll、Swiper、Tabs、PanGesture 等左右可滑动宿主组件内，开启后可能与宿主滑动产生手势冲突；此类场景建议关闭返回手势，改由宿主调用 [canPop](#canpop) / [pop](#pop)。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| enable | boolean | 是 | true 表示开启右滑返回，false 表示关闭。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| void | 无返回值。 |

**示例：**

```ts
this.controller?.setBackGestureEnabled(true)
```

### getBackGestureEnabled

```ts
getBackGestureEnabled(): boolean
```

**接口说明：**

查询当前右滑返回手势是否开启。

**支持的版本：** OpenHarmony API Version 13 及以上。

**返回值：**

| 类型 | 说明 |
|------|------|
| boolean | true 表示右滑返回已开启，false 表示未开启。 |

**示例：**

```ts
const enabled = this.controller?.getBackGestureEnabled()
console.info(`右滑返回状态: ${enabled}`)
```

## 使用示例：多 Surface 栈导航

下面创建一个多 Surface 控制器，依次压入首页与详情页两层 Surface，并通过返回键 pop 回退。

```ts
import {
  CatalogFactory,
  MultiSurfaceController,
  SurfaceController,
  SurfaceControllerFactory,
  SurfaceEventType,
  UIRendererComponent
} from '@arkui-genius/genui'

@Entry
@Component
struct MultiSurfacePage {
  @State controller: MultiSurfaceController | null = null

  aboutToAppear(): void {
    this.controller = SurfaceControllerFactory.createMultiSurfaceController({
      uiContext: this.getUIContext(),
      catalog: CatalogFactory.basic(),
      eventCallback: (eventType: SurfaceEventType, ctrl: SurfaceController, surfaceId: string) => {
        console.info(`surface event: ${eventType}, surfaceId: ${surfaceId}`)
      }
    })

    this.controller?.setBackGestureEnabled(true)

    // 第 1 层：首页
    this.controller?.handleMessage(JSON.stringify({
      version: 'v0.9',
      createSurface: {
        surfaceId: 'home',
        catalogId: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json'
      }
    }))
    this.controller?.handleMessage(JSON.stringify({
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'home',
        components: [
          { id: 'root', component: 'Column', children: ['title'] },
          { id: 'title', component: 'Text', text: '首页' }
        ]
      }
    }))

    // 第 2 层：详情页（压栈）
    this.controller?.handleMessage(JSON.stringify({
      version: 'v0.9',
      createSurface: {
        surfaceId: 'detail',
        catalogId: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json'
      }
    }))
    this.controller?.handleMessage(JSON.stringify({
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'detail',
        components: [
          { id: 'root', component: 'Column', children: ['title'] },
          { id: 'title', component: 'Text', text: '详情页' }
        ]
      }
    }))

    console.info(`当前栈: ${this.controller?.getSurfaceList()?.join(' → ')}`)
  }

  onBackPress(): boolean {
    if (this.controller && this.controller.canPop()) {
      this.controller.pop()
      return true
    }
    return false
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

---

↑ [返回 API 速查](./README.md)
