# 使用扩展组件

> **使用的 Catalog**：鸿蒙扩展协议 Catalog（ohos.a2ui.extended.catalog）
> **对应组件参考**：[extended-components/](../reference/extended-components/overview.md)
> **默认深浅色**：[扩展组件默认深浅色](../concepts/extension-color-mode.md)
> 扩展组件与 Basic Catalog 不可在同一 Surface 混用

---

## 场景：将"商品详情页"升级为扩展组件版本

前面用标准组件构建了商品详情页。现在用扩展组件重写，获得样式控制、表达式联动、自适应布局和扩展特有组件的能力。

---

## 初始化

使用扩展组件前，需要创建一个基于鸿蒙扩展协议 Catalog 的 Surface。与标准组件的初始化流程类似，区别在于 Catalog 类型选择为鸿蒙扩展协议 Catalog，catalogId 需要传入扩展组件专用标识符。

```ts
import { CatalogFactory, SurfaceController, SurfaceControllerFactory } from '@arkui-genius/genui'

// 创建鸿蒙扩展协议 Catalog 实例
const catalog = CatalogFactory.extended()

// 用扩展 Catalog 初始化 SurfaceController
const controller = SurfaceControllerFactory.createSurfaceController({
  uiContext: this.getUIContext(),
  catalog: catalog
})

// 向控制器发送 createSurface 指令，创建一个使用扩展组件的 Surface
controller.handleMessage(
  '{"version":"v0.9",' +
  '"createSurface":{' +
  '"surfaceId":"product-extended",' +
  '"catalogId":"ohos.a2ui.extended.catalog"' +
  '}}'
)
```

> **注意**：扩展组件与标准组件使用不同的 catalogId，两者不可在同一 Surface 中混用。如需了解标准组件的初始化方式，请参阅 [构建 UI（标准组件）](building-ui-standard.md)。

---

## 1. 从标准组件迁移：属性名差异

升级到扩展组件时，需要主要属性名变化：

| 标准组件写法 | 扩展组件写法 |
|-------------|-------------|
| "text": "..." | "content": "..." |
| "url": "..." | "src": "..." |
| Button.child + Text | Button.label 直接写字符串 |
| 无样式 | "styles": { ... } |

```json
// 标准组件
{ "component": "Text", "text": "蓝牙降噪耳机", "variant": "h3" }

// 扩展组件
{ "component": "Text", "content": "蓝牙降噪耳机",
  "styles": { "fontSize": "22fp", "fontWeight": "bold" } }
```

---

## 2. styles 样式对象

扩展组件的核心能力是 styles 对象，所有扩展组件共享 15 种通用样式。相比标准组件的 variant 预设，styles 提供了精细化的样式控制。

### 默认深浅色

扩展组件的颜色属性可以不写。未显式设置时，组件会根据当前深浅色模式使用默认色；显式设置后，则固定使用 DSL 中的颜色值。

如果需要自定义颜色也跟随深浅色切换，使用 $__colorMode 表达式：

```json
{
  "id": "statusText",
  "component": "Text",
  "content": "处理中",
  "styles": {
    "fontColor": "{{ $__colorMode == 'dark' ? '#E5FFFFFF' : '#E5000000' }}"
  }
}
```

扩展组件颜色字段路径和默认值见 [扩展组件默认深浅色](../concepts/extension-color-mode.md)。

### 文本样式

```json
{ "id": "title", "component": "Text",
  "content": "蓝牙降噪耳机",
  "styles": {
    "fontSize": "22fp",
    "fontWeight": "bold",
    "fontColor": "#1A1A1A",
    "maxLines": 2,
    "textOverflow": "ellipsis",
    "textAlign": "left",
    "wordBreak": "breakAll"
  }
}
```

### 容器样式

```json
{ "id": "card", "component": "Column",
  "children": ["title", "desc"],
  "styles": {
    "padding": "16vp",
    "backgroundColor": "#FFFFFF",
    "borderRadius": 12,
    "shadow": { "radius": 8, "color": "#1A000000", "offsetX": 0, "offsetY": 4 }
  }
}
```

### 按钮样式

```json
{ "id": "buyBtn", "component": "Button",
  "label": "立即购买",
  "action": { "event": { "name": "placeOrder" } },
  "styles": {
    "backgroundColor": "#0A59F7",
    "borderRadius": 8,
    "fontSize": "16fp",
    "fontWeight": "bold",
    "padding": "12vp"
  }
}
```

### 条件样式（visible/hidden）

```json
{ "id": "discountBadge", "component": "Text",
  "content": "限时优惠",
  "styles": {
    "visibility": "{{ $__dataModel.product.discount > 0 ? 'visible' : 'hidden' }}",
    "backgroundColor": "#FF4D4F",
    "fontColor": "#FFFFFF",
    "borderRadius": 4,
    "padding": "4vp",
    "fontSize": "12fp"
  }
}
```

---

## 3. 表达式联动

扩展组件支持 {{ }} 表达式，可以实现数据驱动的动态样式和内容。

```json
{ "id": "priceText", "component": "Text",
  "content": "{{ '¥' + $__dataModel.product.price }}",
  "styles": {
    "fontSize": "20fp",
    "fontWeight": "bold",
    "fontColor": "{{ $__dataModel.product.price > 1000 ? '#FF4D4F' : '#52C41A' }}"
  }
}

{ "id": "stockText", "component": "Text",
  "content": "{{ $__dataModel.product.stock > 0 ? '库存：' + $__dataModel.product.stock + '件' : '暂时缺货' }}",
  "styles": {
    "fontColor": "{{ $__dataModel.product.stock > 0 ? '#52C41A' : '#FF4D4F' }}"
  }
}
```

---

## 4. 扩展专属交互组件

扩展组件提供了一套独立于标准组件的交互控件：

### TextInput（替代 TextField）

```json
{ "id": "emailInput", "component": "TextInput",
  "text": { "path": "/order/email" },
  "placeholder": "请输入邮箱",
  "type": "email",
  "maxLength": 50,
  "styles": {
    "placeholderColor": "#999999",
    "fontSize": "14fp",
    "padding": "8vp",
    "borderRadius": 6,
    "borderWidth": 1,
    "borderColor": "#E5E5E5"
  }
}
```

### Toggle（替代 CheckBox）

```json
{ "id": "subscribeToggle", "component": "Toggle",
  "label": "订阅促销邮件",
  "isOn": false,
  "styles": {
    "selectedColor": "#0A59F7",
    "margin": "8vp"
  }
}
```

### Radio / Select

```json
{ "id": "genderRadio", "component": "Radio",
  "value": "male",
  "checked": true,
  "group": "gender",
  "label": "先生"
}

{ "id": "citySelect", "component": "Select",
  "options": [
    { "value": "beijing", "label": "北京" },
    { "value": "shanghai", "label": "上海" }
  ],
  "value": { "path": "/order/city" },
  "selected": 0
}
```

### Progress

```json
{ "id": "orderProgress", "component": "Progress",
  "value": { "path": "/order/step" },
  "total": 3,
  "type": "capsule",
  "styles": {
    "color": "#0A59F7",
    "margin": "8vp"
  }
}
```

---

## 5. 自适应布局

利用 $__widthBreakpoint 和 If 组件实现移动端竖排、平板横排：

```json
{ "id": "adaptiveContainer", "component": "If",
  "condition": "{{ $__widthBreakpoint == 'xs' || $__widthBreakpoint == 'sm' }}",
  "childrenIf": ["narrowLayout"],
  "childrenElse": ["wideLayout"] },

// 窄屏：垂直排列
{ "id": "narrowLayout", "component": "Column",
  "children": ["image", "info"],
  "styles": { "padding": "12vp" } },

// 宽屏：水平排列
{ "id": "wideLayout", "component": "Row",
  "children": ["image", "info"],
  "styles": { "padding": "24vp" },
  "justify": "spaceBetween" }
```

---

## 6. 完整商品详情页（扩展版 DSL）

组合以上所有元素，最终 DSL：

```json
// createSurface
{ "version": "v0.9", "createSurface": {
  "surfaceId": "product-extended",
  "catalogId": "ohos.a2ui.extended.catalog",
  "sendDataModel": true
}}

// 组件
{ "version": "v0.9", "updateComponents": {
  "surfaceId": "product-extended",
  "components": [
    { "id": "root", "component": "Column",
      "children": ["header", "discountBadge", "image", "desc", "priceText", "stockText",
                   "rating", "citySelect", "emailInput", "subscribeToggle", "buyBtn"] },

    { "id": "header", "component": "Text",
      "content": "{{ $__dataModel.product.name }}",
      "styles": { "fontSize": "22fp", "fontWeight": "bold", "padding": "16vp" } },

    { "id": "discountBadge", "component": "Text",
      "content": "限时优惠",
      "styles": { "visibility": "{{ $__dataModel.product.discount > 0 ? 'visible' : 'hidden' }}",
        "backgroundColor": "#FF4D4F", "fontColor": "#FFFFFF", "borderRadius": 4, "padding": "4vp" } },

    { "id": "image", "component": "Image",
      "src": "{{ $__dataModel.product.image }}",
      "styles": { "width": "100%", "height": "200vp" },
      "objectFit": "cover" },

    { "id": "desc", "component": "Text",
      "content": "{{ $__dataModel.product.description }}",
      "styles": { "fontSize": "14fp", "fontColor": "#666666", "padding": "8vp" } },

    { "id": "priceText", "component": "Text",
      "content": "{{ '¥' + $__dataModel.product.price }}",
      "styles": { "fontSize": "20fp", "fontWeight": "bold",
        "fontColor": "{{ $__dataModel.product.price > 1000 ? '#FF4D4F' : '#52C41A' }}" } },

    { "id": "stockText", "component": "Text",
      "content": "{{ $__dataModel.product.stock > 0 ? '库存：' + $__dataModel.product.stock + '件' : '暂时缺货' }}" },

    { "id": "rating", "component": "Select",
      "options": [{"value":"5","label":"⭐⭐⭐⭐⭐"},{"value":"4","label":"⭐⭐⭐⭐"},{"value":"3","label":"⭐⭐⭐"}],
      "value": { "path": "/review/rating" }, "selected": 0 },

    { "id": "citySelect", "component": "Select",
      "options": [{"value":"beijing","label":"北京"},{"value":"shanghai","label":"上海"}],
      "value": { "path": "/order/city" } },

    { "id": "emailInput", "component": "TextInput",
      "text": { "path": "/order/email" },
      "placeholder": "请输入邮箱", "type": "email",
      "styles": { "fontSize": "14fp", "padding": "8vp", "borderRadius": 6,
        "borderWidth": 1, "borderColor": "#E5E5E5" } },

    { "id": "subscribeToggle", "component": "Toggle",
      "label": "订阅促销邮件", "isOn": false },

    { "id": "buyBtn", "component": "Button",
      "label": "立即购买",
      "action": { "event": { "name": "placeOrder", "context": {
        "product": { "path": "/product/name" },
        "price": { "path": "/product/price" },
        "city": { "call": "getSelectValue", "args": { "componentId": "citySelect" }, "returnType": "string" },
        "email": { "path": "/order/email" }
      }}},
      "styles": { "backgroundColor": "#0A59F7", "borderRadius": 8,
        "fontSize": "16fp", "fontWeight": "bold", "padding": "12vp" } }
  ]
}}

// 数据
{ "version": "v0.9", "updateDataModel": {
  "surfaceId": "product-extended", "path": "/",
  "value": {
    "product": { "name": "蓝牙降噪耳机", "price": 899, "stock": 45, "discount": 100,
      "image": "https://example.com/product.jpg",
      "description": "主动降噪 | 30小时续航 | Hi-Res认证" },
    "order": { "quantity": 1, "city": "beijing", "email": "user@example.com" }
  }
}}
```

---

## 7. 动态模板子组件

扩展容器（List、Grid、Column、Row、Stack）的 children 除了使用静态 ID 数组，还可以使用**模板对象**从 DataModel 数组动态生成子组件。

### 基本用法

模板对象由两个必填字段组成：

- componentId：引用同一 components 列表中的模板组件 ID
- path：JSON Pointer 路径，指向 DataModel 中的数组

```json
// 容器：用模板对象声明 children
{ "id": "productList", "component": "List",
  "children": { "componentId": "productRow", "path": "/products" } }

// 模板组件：定义每一项的结构
{ "id": "productRow", "component": "Row",
  "children": ["prodName", "prodPrice"] }

{ "id": "prodName", "component": "Text", "content": { "path": "name" } }
{ "id": "prodPrice", "component": "Text", "content": { "path": "price" } }
```

框架遍历 path 指向的数据数组，为每个元素实例化一份模板组件，模板内部的 { "path": "xxx" } 绑定到当前数据项。

### 模板实例 ID 自动生成

使用模板对象时，**不需要担心组件 ID 重复**。框架会为每个数据项自动生成唯一的实例 ID，规则为：

```
{arrayPath}{templateComponentId}:{itemIndex}:{originalId}
```

以上面的 productRow 为例，3 条数据会生成：

| 数据项 | 生成的实例 ID |
|--------|-------------|
| 蓝牙耳机 | /productsproductRow:0:productRow |
| 充电宝 | /productsproductRow:1:productRow |
| 数据线 | /productsproductRow:2:productRow |

模板子组件（如 prodName、prodPrice）也会递归生成唯一 ID（如 /productsproductRow:0:prodName）。模板嵌套时，内层模板的实例 ID 同样自动生成。

> **注意**：静态 children（ID 数组模式）中，组件 ID 由 DSL 编写者保证唯一；模板模式下由框架自动保证。

对应的数据：

```json
{ "version": "v0.9", "updateDataModel": {
  "surfaceId": "demo", "value": {
    "products": [
      { "name": "蓝牙耳机", "price": "¥899" },
      { "name": "充电宝", "price": "¥129" },
      { "name": "数据线", "price": "¥39" }
    ]
  }
}}
```

渲染结果：List 中出现 3 行，分别显示"蓝牙耳机 ¥899"、"充电宝 ¥129"、"数据线 ¥39"。

### 嵌套模板

componentId 指向的模板描述符也可以是容器组件，该容器的 children 再用模板对象，形成嵌套。内层模板的 path 使用**相对路径**（不带前导 /），相对于当前数据项解析：

```json
// 外层：遍历 /categories
{ "id": "categoryList", "component": "List",
  "children": { "componentId": "categoryCard", "path": "/categories" } }

// 外层模板：包含一个内层 List
{ "id": "categoryCard", "component": "Column",
  "children": ["catTitle", "itemList"] }

{ "id": "catTitle", "component": "Text", "content": { "path": "title" } }

// 内层：遍历当前分类下的 items（相对路径）
{ "id": "itemList", "component": "List",
  "children": { "componentId": "itemRow", "path": "items" } }

{ "id": "itemRow", "component": "Text", "content": { "path": "name" } }
```

对应的数据结构：

```json
{
  "categories": [
    { "title": "饮品", "items": [{ "name": "美式" }, { "name": "拿铁" }] },
    { "title": "主食", "items": [{ "name": "汉堡" }, { "name": "薯条" }] }
  ]
}
```

关于模板中的 $item、$index、itemVar、indexVar 等循环变量，详见 [表达式实战 → 模板循环变量](working-with-expressions.md)。

---

## 流式渲染模板列表

扩展容器的动态模板（children: { componentId, path }）支持描述符分批到达时的渐进式渲染。这非常适合 LLM 流式生成 UI 的场景——容器和数据先到达，模板描述符逐步补充。

```json
// 第1帧：容器 + 数据模型先到
{ "version": "v0.9", "updateComponents": {
  "surfaceId": "demo",
  "components": [
    { "id": "menuList", "component": "List", "children": { "componentId": "menuItem", "path": "/menu" } }
  ]
}}

{ "version": "v0.9", "updateDataModel": { "surfaceId": "demo", "value": { "menu": [
  { "name": "咖啡", "price": 28 }, { "name": "拿铁", "price": 32 }
]}}}

// 第2帧：模板描述符到达后自动渲染
{ "version": "v0.9", "updateComponents": {
  "surfaceId": "demo",
  "components": [
    { "id": "menuItem", "component": "Row", "children": [
      { "id": "menuName", "component": "Text", "content": "{{ $item.name }}" },
      { "id": "menuPrice", "component": "Text", "content": "¥{{ $item.price }}" }
    ]}
  ]
}}
// → List 自动渲染两个菜单项
```

如果模板根描述符包含嵌套子模板，子模板描述符也可以在后续帧中到达，渲染器会在每帧自动重试 pending 的容器。

---

## 标准 vs 扩展：选择指南

| 需求 | 选择 |
|------|------|
| 最简单的表单、信息展示 | Basic Catalog（标准组件） |
| 需要品牌色、圆角、阴影、渐变等定制样式 | 鸿蒙扩展协议 Catalog |
| 需要根据数据动态改变颜色/内容 | 鸿蒙扩展协议 Catalog（表达式） |
| 需要移动端/平板不同布局 | 鸿蒙扩展协议 Catalog（自适应） |
| 需要 Select/Radio/Toggle 等交互控件 | 鸿蒙扩展协议 Catalog |

---

相关指南：
→ [构建 UI（标准组件）](building-ui-standard.md) | → [扩展组件默认深浅色](../concepts/extension-color-mode.md) | → [扩展组件一多部署](../concepts/extension-multi-deployment.md) | → [自定义组件](creating-custom-components.md) | → [表达式实战](working-with-expressions.md) | → [组件参考](../reference/extended-components/overview.md)
