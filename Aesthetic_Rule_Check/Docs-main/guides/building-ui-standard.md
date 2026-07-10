# 构建 UI（标准组件）

> **使用的 Catalog**：[A2UI Basic Catalog](defining-catalogs.md)
> **对应组件参考**：[standard-components/](../reference/standard-components/overview.md)
> 如需表达式、自适应、深度定制样式，请阅读 [使用扩展组件](using-extended-components.md)

---

## 场景：构建一个商品详情页

我们将从零构建一个商品详情页，逐步增加复杂度——从纯静态展示到动态数据绑定，再到交互操作。

最终效果：标题 → 图片 → 描述文本 → 价格（数据绑定） → 购买数量（滑块） → 购买按钮。

---

## 第一步：搭建垂直骨架

从最简单的 [Column](../reference/standard-components/column.md) 容器开始：

```ts
controller.handleMessage(
  '{"version":"v0.9",' +
  '"createSurface":{' +
  '"surfaceId":"product-detail",' +
  '"catalogId":"https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"' +
  '}}'
)

controller.handleMessage(
  '{"version":"v0.9",' +
  '"updateComponents":{' +
  '"surfaceId":"product-detail",' +
  '"components":[' +
  '{"id":"root","component":"Column","children":["title","image"]},' +
  '{"id":"title","component":"Text","text":"蓝牙降噪耳机","variant":"h3"},' +
  '{"id":"image","component":"Image",' +
  '"url":"https://example.com/headphone.jpg",' +
  '"fit":"cover","variant":"mediumFeature"}' +
  ']}}'
)
```

[Image](../reference/standard-components/image.md) 的 fit 和 variant 决定了图片的缩放方式和预设尺寸：

| fit 值 | 效果 |
|--------|------|
| cover | 铺满容器，裁剪超出部分 |
| contain | 完整显示，可能留白 |
| fill | 拉伸填充（可能变形） |

---

## 第二步：增加描述文本

追加描述组件，用不同的 [Text](../reference/standard-components/text.md) variant 区分信息层级：

```ts
// 追加组件（root 的 children 也要更新）
controller.handleMessage(
  '{"version":"v0.9",' +
  '"updateComponents":{' +
  '"surfaceId":"product-detail",' +
  '"components":[' +
  '{"id":"root","component":"Column",' +
  '"children":["title","image","desc","price"]},' +
  '{"id":"desc","component":"Text",' +
  '"text":"主动降噪 | 30小时续航 | Hi-Res认证 | 支持LDAC","variant":"body"},' +
  '{"id":"price","component":"Text",' +
  '"text":{"path":"/product/price"},"variant":"h4"}' +
  ']}}'
)
```

这里 price 的 text 使用了 { "path": "/product/price" } 而非写死字符串——它将在收到数据后自动填充。关于数据绑定和表达式的更多内容，请参阅 [使用表达式](working-with-expressions.md)。

---

## 第三步：数据绑定

发送 [updateDataModel](../concepts/surfaces-and-messages.md#updatedatamodel) 填充数据：

```ts
controller.handleMessage(
  '{"version":"v0.9",' +
  '"updateDataModel":{' +
  '"surfaceId":"product-detail",' +
  '"path":"/product",' +
  '"value":{"name":"蓝牙降噪耳机","price":899,"stock":45}' +
  '}}'
)
```

[updateDataModel](../concepts/surfaces-and-messages.md#updatedatamodel) 到达后，所有绑定了 /product/price 的组件会自动刷新显示"899"。

**原理**：GenUI 维护每个 Surface 的内部 [DataModel](../concepts/data-model-and-binding.md)  树。当 updateDataModel 修改某个路径，GenUI 自动找到所有依赖该路径的组件并触发重新求值。你不需要手动通知组件更新。详见 [使用表达式](working-with-expressions.md)。

---

## 第四步：增加交互组件

加入 [Slider](../reference/standard-components/slider.md) 控制数量，加入 [Button](../reference/standard-components/button.md) 触发购买：

```ts
controller.handleMessage(
  '{"version":"v0.9",' +
  '"updateComponents":{' +
  '"surfaceId":"product-detail",' +
  '"components":[' +
  '{"id":"root","component":"Column",' +
  '"children":["title","image","desc","price","quantityRow","buyBtn"]},' +
  '{"id":"qtyLabel","component":"Text","text":"购买数量"},' +
  '{"id":"quantity","component":"Slider",' +
  '"label":"数量","value":{"path":"/order/quantity"},"min":1,"max":10},' +
  '{"id":"buyBtn","component":"Button","child":"buyText",' +
  '"action":{"event":{"name":"placeOrder","context":{' +
  '"product":{"path":"/product/name"},' +
  '"price":{"path":"/product/price"},' +
  '"quantity":{"path":"/order/quantity"}}}},' +
  '"variant":"primary"},' +
  '{"id":"buyText","component":"Text","text":"立即购买"}' +
  ']}}'
)
```

当用户拖动滑块 → [DataModel](../concepts/data-model-and-binding.md) 中 /order/quantity 即时更新。当用户点击"立即购买"→ [registerActionReceiver](../concepts/actions-and-functions.md#接收-action-回调) 收到 event，context 中的 path 已被自动解析为实际值。

---

## 第五步：水平排列 + 权重

将数量和按钮放入 [Row](../reference/standard-components/row.md) 实现水平布局：

```ts
{ "id": "quantityRow", "component": "Row",
  "children": ["qtyLabel", "quantity"],
  "justify": "spaceBetween"
},
{ "id": "qtyLabel", "component": "Text", "text": "数量", "weight": 1 },
{ "id": "quantity", "component": "Slider",
  "label": "数量", "value": { "path": "/order/quantity" },
  "min": 1, "max": 10, "weight": 2 }
```

weight 分配剩余空间：qtyLabel 占 1/3，Slider 占 2/3。

| justify 值 | 效果 |
|-------------|------|
| start | 从主轴起点排列 |
| center | 居中排列 |
| end | 从主轴终点排列 |
| spaceBetween | 两端对齐，中间均分 |
| spaceAround | 每个元素两侧间距相等 |
| spaceEvenly | 所有间距相等 |

---

## 第六步：卡片容器 + 评星展示

用 [Card](../reference/standard-components/card.md) 包裹整体，加入 [ChoicePicker](../reference/standard-components/choicePicker.md) 评星：

```ts
// Card 包裹整页
{ "id": "root", "component": "Card", "child": "content" },
{ "id": "content", "component": "Column",
  "children": ["title", "image", "desc", "price", "rating", "quantityRow", "buyBtn"] },

// 评星选择
{ "id": "ratingLabel", "component": "Text", "text": "商品评分" },
{ "id": "rating", "component": "ChoicePicker",
  "options": [
    { "label": "⭐", "value": "1" },
    { "label": "⭐⭐", "value": "2" },
    { "label": "⭐⭐⭐", "value": "3" },
    { "label": "⭐⭐⭐⭐", "value": "4" },
    { "label": "⭐⭐⭐⭐⭐", "value": "5" }
  ],
  "value": { "path": "/review/rating" },
  "variant": "mutuallyExclusive"
}
```

---

## 第七步：校验 + Modal 确认

加入校验和 [Modal](../reference/standard-components/modal.md) 确认弹窗：

```ts
// Email 输入带校验
{ "id": "email", "component": "TextField",
  "label": "收据邮箱",
  "value": { "path": "/order/email" },
  "checks": [
    { "condition": { "call": "required", "args": { "value": { "path": "/order/email" } } },
      "message": "邮箱不能为空" },
    { "condition": { "call": "email", "args": { "value": { "path": "/order/email" } } },
      "message": "邮箱格式不正确" }
  ]
}

// 按钮仅在 email 有效时才可点击
{ "id": "buyBtn", "component": "Button",
  "child": "buyText",
  "action": { "event": { "name": "placeOrder", "context": { ... } } },
  "variant": "primary",
  "checks": [
    { "condition": { "call": "required", "args": { "value": { "path": "/order/email" } } },
      "message": "请填写邮箱" }
  ]
}
```

[Button](../reference/standard-components/button.md) 上的 checks——所有条件满足时按钮才可点击，否则自动变灰并显示 message。

---

## 组件选择决策

| 你需要... | 用这个 |
|-----------|--------|
| 垂直排列内容 | [Column](../reference/standard-components/column.md) |
| 水平排列内容 | [Row](../reference/standard-components/row.md) |
| 单个子组件的卡片风格 | [Card](../reference/standard-components/card.md) |
| 滚动列表 | [List](../reference/standard-components/list.md) |
| 弹窗确认 | [Modal](../reference/standard-components/modal.md) |
| 用户输入文本 | [TextField](../reference/standard-components/textfield.md) |
| 用户输入数字范围 | [Slider](../reference/standard-components/slider.md) |
| 用户多选/单选 | [ChoicePicker](../reference/standard-components/choicePicker.md) |
| 用户点击触发操作 | [Button](../reference/standard-components/button.md) |
| 纯文本展示 | [Text](../reference/standard-components/text.md) |
| 纯图片展示 | [Image](../reference/standard-components/image.md) |

---

---

## 完整示例

以下是整合了上述所有步骤的完整代码示例，包含：

- **SurfaceController 初始化**：创建 Surface、注册回调
- **完整组件树**：Card → Column → 所有子组件
- **数据绑定**：价格、数量、邮箱、评分
- **表单验证**：邮箱格式校验、必填校验
- **事件处理**：购买按钮点击、Action 接收

```typescript
import {
  CatalogFactory,
  SurfaceController,
  SurfaceControllerFactory,
  SurfaceEventType,
  UIRendererComponent
} from '@arkui-genius/genui'

// === DSL 类型定义 ===

interface PathBinding { path: string }

interface OptionItem { label: string; value: string }

interface CheckArgs { value: PathBinding }

interface CheckCondition { call: string; args: CheckArgs }

interface CheckRule { condition: CheckCondition; message: string }

interface ActionEventContext {
  product: PathBinding
  price: PathBinding
  quantity: PathBinding
  email: PathBinding
  rating: PathBinding
}

interface ActionEvent { name: string; context: ActionEventContext }

interface ComponentAction { event: ActionEvent }

interface ComponentDescriptor {
  id: string
  component: string
  child?: string
  children?: string[]
  text?: string | PathBinding
  url?: string
  fit?: string
  variant?: string
  label?: string
  value?: PathBinding | number | string
  min?: number
  max?: number
  weight?: number
  options?: OptionItem[]
  checks?: CheckRule[]
  action?: ComponentAction
  justify?: string
}

interface CreateSurfacePayload { surfaceId: string; catalogId: string }

interface CreateSurfaceDsl { version: string; createSurface: CreateSurfacePayload }

interface UpdateComponentsPayload { surfaceId: string; components: ComponentDescriptor[] }

interface UpdateComponentsDsl { version: string; updateComponents: UpdateComponentsPayload }

interface ProductData { name: string; price: number; stock: number }

interface OrderData { quantity: number; email: string }

interface ReviewData { rating: string }

interface DataModelValue { product: ProductData; order: OrderData; review: ReviewData }

interface UpdateDataModelPayload { surfaceId: string; path: string; value: DataModelValue }

interface UpdateDataModelDsl { version: string; updateDataModel: UpdateDataModelPayload }

// === 页面组件 ===

@Entry
@Component
struct ProductDetailPage {
  @State controller: SurfaceController | null = null

  aboutToAppear(): void {
    // ① 选择 Catalog 并创建 Controller
    this.controller = SurfaceControllerFactory.createSurfaceController({
      uiContext: this.getUIContext(),
      catalog: CatalogFactory.basic(),
      eventCallback: (eventType: SurfaceEventType, ctrl: SurfaceController) => {
        console.log(`Surface 事件: ${eventType}`)
      }
    })

    // ② 注册 Action 接收器 — 处理购买事件
    this.controller.registerActionReceiver((action: string) => {
      const data: Record<string, Object> = JSON.parse(action)
      const actionPayload = data['action'] as Record<string, Object> | null
      if (actionPayload !== null && actionPayload['name'] === 'placeOrder') {
        console.log('订单详情:', JSON.stringify(actionPayload['context']))
      }
    })

    // ③ 注册错误回调
    this.controller.registerErrorCallback((code, msg) => {
      console.error(`错误 [${code}]: ${msg}`)
    })

    // ④ 创建 Surface
    const createPayload: CreateSurfaceDsl = {
      version: 'v0.9',
      createSurface: {
        surfaceId: 'product-detail',
        catalogId: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json'
      }
    }
    this.controller!.handleMessage(JSON.stringify(createPayload))

    // ⑤ 定义组件树
    const components: ComponentDescriptor[] = [
      // 根容器
      { id: 'root', component: 'Card', child: 'content' },
      {
        id: 'content', component: 'Column',
        children: ['title', 'image', 'desc', 'price', 'ratingLabel', 'rating', 'email', 'quantityRow', 'buyBtn']
      },
      // 商品信息
      { id: 'title', component: 'Text', text: '蓝牙降噪耳机', variant: 'h3' },
      { id: 'image', component: 'Image', url: 'https://example.com/headphone.jpg', fit: 'cover', variant: 'mediumFeature' },
      { id: 'desc', component: 'Text', text: '主动降噪 | 30小时续航 | Hi-Res认证 | 支持LDAC', variant: 'body' },
      { id: 'price', component: 'Text', text: { path: '/product/price' }, variant: 'h4' },
      // 评分选择
      { id: 'ratingLabel', component: 'Text', text: '商品评分' },
      {
        id: 'rating', component: 'ChoicePicker',
        options: [
          { label: '⭐', value: '1' },
          { label: '⭐⭐', value: '2' },
          { label: '⭐⭐⭐', value: '3' },
          { label: '⭐⭐⭐⭐', value: '4' },
          { label: '⭐⭐⭐⭐⭐', value: '5' }
        ],
        value: { path: '/review/rating' },
        variant: 'mutuallyExclusive'
      },
      // 邮箱输入（带校验）
      {
        id: 'email', component: 'TextField',
        label: '收据邮箱',
        value: { path: '/order/email' },
        checks: [
          { condition: { call: 'required', args: { value: { path: '/order/email' } } }, message: '邮箱不能为空' },
          { condition: { call: 'email', args: { value: { path: '/order/email' } } }, message: '邮箱格式不正确' }
        ]
      },
      // 数量选择（水平布局）
      {
        id: 'quantityRow', component: 'Row',
        children: ['qtyLabel', 'quantity'],
        justify: 'spaceBetween'
      },
      { id: 'qtyLabel', component: 'Text', text: '数量', weight: 1 },
      {
        id: 'quantity', component: 'Slider',
        label: '数量', value: { path: '/order/quantity' }, min: 1, max: 10, weight: 2
      },
      // 购买按钮（带动作和校验）
      {
        id: 'buyBtn', component: 'Button',
        child: 'buyText',
        action: {
          event: {
            name: 'placeOrder',
            context: {
              product: { path: '/product/name' },
              price: { path: '/product/price' },
              quantity: { path: '/order/quantity' },
              email: { path: '/order/email' },
              rating: { path: '/review/rating' }
            }
          }
        },
        variant: 'primary',
        checks: [
          { condition: { call: 'required', args: { value: { path: '/order/email' } } }, message: '请填写邮箱' }
        ]
      },
      { id: 'buyText', component: 'Text', text: '立即购买' }
    ]
    const updatePayload: UpdateComponentsDsl = {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'product-detail',
        components: components
      }
    }
    this.controller!.handleMessage(JSON.stringify(updatePayload))

    // ⑥ 初始化数据模型
    const dataPayload: UpdateDataModelDsl = {
      version: 'v0.9',
      updateDataModel: {
        surfaceId: 'product-detail',
        path: '/',
        value: {
          product: { name: '蓝牙降噪耳机', price: 899, stock: 45 },
          order: { quantity: 1, email: '' },
          review: { rating: '5' }
        }
      }
    }
    this.controller!.handleMessage(JSON.stringify(dataPayload))
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
  }
}
```

---

相关指南：
→ [使用扩展组件](using-extended-components.md) | → [自定义组件](creating-custom-components.md) | → [用户交互处理](handling-user-interactions.md) | → [组件参考](../reference/standard-components/overview.md)
