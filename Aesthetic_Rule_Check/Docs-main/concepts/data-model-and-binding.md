# 数据模型与绑定

[A2UI 协议](../introduction/a2ui-and-harmonyos.md#a2ui-是什么) 支持将 [UI 结构（组件）](components-and-layout.md#邻接表模型)与 UI 数据（[DataModel](#datamodel-是什么)）分离。组件定义界面骨架，DataModel 填充内容。这种分离使得 [Agent](agent-deployment-models.md) 可以在不改变组件结构的情况下更新 UI 内容。

## DataModel 是什么

DataModel 是每个 [Surface](surfaces-and-messages.md#surface-是什么) 的内部 JSON 数据存储。它由 [updateDataModel](../reference/messages.md#updatedatamodel) 消息填充，组件通过 [JSON Pointer](#json-pointer-路径) 路径从中读取数据。

```json
// 填充 DataModel
{
  "updateDataModel": {
    "surfaceId": "main",
    "path": "/",
    "value": {
      "user": { "name": "Alice", "role": "Engineer" },
      "stats": { "projects": 12, "years": 5 }
    }
  }
}
```

## DynamicValue：字面量 vs 数据绑定 vs 函数调用

组件的属性支持三种值的来源，称为 [DynamicValue](../reference/types.md#dynamicvalue)：

### 字面量（Literal）

直接写在 JSON 中的固定值：

```json
{ "id": "t1", "component": "Text", "text": "Hello World" }
```

### 数据绑定（[DataBinding](../reference/types.md#databinding) / Path）

从 [DataModel](#datamodel-是什么) 中读取值，使用 [JSON Pointer](#json-pointer-路径) 路径：

```json
// 绑定到 /user/name
{ "id": "t1", "component": "Text", "text": { "path": "/user/name" } }
```

当 [updateDataModel](../reference/messages.md#updatedatamodel) 更新 /user/name 时，[Text](../reference/standard-components/text.md) 组件自动刷新显示内容。

### 函数调用（[FunctionCall](../reference/functions/functioncall.md#类型定义)）

通过内置函数（如 [formatCurrency](../reference/functions/format.md#formatcurrency)）动态计算值：

```json
{ "id": "t1", "component": "Text",
  "text": { "call": "formatCurrency", "args": { "value": { "path": "/price" }, "currency": "CNY" }, "returnType": "string" } }
```

## JSON Pointer 路径

A2UI 使用 [RFC 6901 JSON Pointer](https://datatracker.ietf.org/doc/html/rfc6901) 进行数据定位：

| 路径 | 含义 |
|------|------|
| /user/name | 根路径下的 user.name |
| / | 整个 DataModel |
| /items/0 | items 数组的第一个元素 |

## 数据绑定示例

下面示例先用 [updateComponents](../reference/messages.md#updatecomponents) 声明 [Column](../reference/standard-components/column.md) 容器和 [Text](../reference/standard-components/text.md) 组件，再用 [updateDataModel](../reference/messages.md#updatedatamodel) 填充和更新数据。

```json
// Step 1: 创建组件，用 path 绑定
{
  "updateComponents": {
    "surfaceId": "main",
    "components": [
      { "id": "root", "component": "Column", "children": ["name", "role", "years"] },
      { "id": "name", "component": "Text",
        "text": { "path": "/user/name" } },
      { "id": "role", "component": "Text",
        "text": { "path": "/user/role" } },
      { "id": "years", "component": "Text",
        "text": { "path": "/stats/years" } }
    ]
  }
}

// Step 2: 填充数据，组件自动刷新
{
  "updateDataModel": {
    "surfaceId": "main",
    "path": "/",
    "value": {
      "user": { "name": "Alice", "role": "Engineer" },
      "stats": { "years": 5 }
    }
  }
}

// Step 3: 更新数据，UI 实时变化
{
  "updateDataModel": {
    "surfaceId": "main",
    "path": "/user/role",
    "value": "Senior Engineer"
  }
}
```

## 双向绑定（输入组件）

[交互组件](components-and-layout.md#组件类型体系)（[TextField](../reference/standard-components/textfield.md)、[CheckBox](../reference/standard-components/checkbox.md)、[Slider](../reference/standard-components/slider.md) 等）与 [DataModel](#datamodel-是什么) 建立**双向绑定**：

- **读取**：组件渲染时从 [DataModel](#datamodel-是什么) 读取初始值
- **写入**：用户操作后立即更新 [DataModel](#datamodel-是什么) 中的值

```json
{ "id": "email", "component": "TextField",
  "label": "Email",
  "value": { "path": "/form/email" }  // 双向绑定
}
```

用户输入 "alice@example.com" → [DataModel](#datamodel-是什么) 中 /form/email 立即更新。

## DynamicString / DynamicNumber / DynamicBoolean

A2UI 为不同数据类型定义了专门的 [DynamicValue](../reference/types.md#dynamicvalue) 子类型：

| 类型 | 用于 | 支持的来源 |
|------|------|-------------|
| [DynamicString](../reference/types.md#dynamicstring) | 文本、URL、标签 | string 字面量 / path / [FunctionCall](../reference/functions/functioncall.md#类型定义) → string |
| [DynamicNumber](../reference/types.md#dynamicnumber) | 数值、数量 | number 字面量 / path / [FunctionCall](../reference/functions/functioncall.md#类型定义) → number |
| [DynamicBoolean](../reference/types.md#dynamicboolean) | 开关、可见性 | boolean 字面量 / path / [FunctionCall](../reference/functions/functioncall.md#类型定义) → boolean |
| [DynamicStringList](../reference/types.md#dynamicstringlist) | 多选列表 | string[] 字面量 / path / [FunctionCall](../reference/functions/functioncall.md#类型定义) → array |

## GenUI 中的数据绑定

在 ArkUI 中，你不需要手动解析 path。[GenUI](../introduction/what-is-genui.md) 通过 [SurfaceController](../reference/API/surface-controller.md#surfacecontroller) 的 [handleMessage()](../reference/API/surface-controller.md#handlemessage) 自动处理数据绑定：

```ts
// 创建 Controller
const controller = SurfaceControllerFactory.createSurfaceController({
  uiContext: this.getUIContext(),
  catalog: CatalogFactory.basic()
})

// 喂入组件（使用 path 绑定）
setTimeout(() => {
  controller.handleMessage(`{
    "version": "v0.9",
    "updateComponents": {
      "surfaceId": "main",
      "components": [
        { "id": "name", "component": "Text",
          "text": { "path": "/user/name" } }
      ]
    }
  }`)
}, 300)

// 填充数据
setTimeout(() => {
  controller.handleMessage(`{
    "version": "v0.9",
    "updateDataModel": {
      "surfaceId": "main",
      "path": "/user/name",
      "value": "Alice"
    }
  }`)
}, 600)
```

### 示例：用户信息回显表单

运行前请先完成 [快速上手](../introduction/quickstart.md) 中的工程创建与 GenUI 安装。

```ts
// xxx.ets
import {
  CatalogFactory,
  SurfaceController,
  SurfaceControllerFactory,
  UIRendererComponent
} from '@arkui-genius/genui'

@Entry
@Component
struct Index {
  @State controller: SurfaceController | null = null

  aboutToAppear(): void {
    this.controller = SurfaceControllerFactory.createSurfaceController({
      uiContext: this.getUIContext(),
      catalog: CatalogFactory.basic()
    });

    setTimeout(() => {
      this.controller?.handleMessage(`{
        "version": "v0.9",
        "createSurface": {
          "surfaceId": "main",
          "catalogId": "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"
        }
      }`);
    }, 300);

    setTimeout(() => {
      this.controller?.handleMessage(`{
        "version": "v0.9",
        "updateComponents": {
          "surfaceId": "main",
          "components": [
            {
              "id": "root",
              "component": "Column",
              "children": ["title", "nameText", "emailField", "emailPreview"]
            },
            {
              "id": "title",
              "component": "Text",
              "text": "数据绑定示例",
              "variant": "h2"
            },
            {
              "id": "nameText",
              "component": "Text",
              "text": { "path": "/user/name" }
            },
            {
              "id": "emailField",
              "component": "TextField",
              "label": "Email",
              "value": { "path": "/form/email" }
            },
            {
              "id": "emailPreview",
              "component": "Text",
              "text": { "path": "/form/email" }
            }
          ]
        }
      }`);
    }, 600);

    setTimeout(() => {
      this.controller?.handleMessage(`{
        "version": "v0.9",
        "updateDataModel": {
          "surfaceId": "main",
          "path": "/",
          "value": {
            "user": { "name": "Alice" },
            "form": { "email": "alice@example.com" }
          }
        }
      }`);
    }, 900);
  }

  aboutToDisappear(): void {
    this.controller?.destroy();
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

![data-model-and-binding-example](./figures/data-model-and-binding-example.gif)

---

← 上一节：[组件与布局](components-and-layout.md) | → 下一节：[数据流](data-flow.md) | ↑ [概念层总览](overview.md)

> **延伸阅读**：[A2UI 官方文档 - 数据绑定](https://a2ui.org/concepts/data-binding/)
