# Tabs 组件

扩展标签页容器组件，用于承载多个 [TabContent](tab-content.md) 子页面。

## 使用前提

该组件属于扩展 Catalog 内置组件，通常与 TabContent 配套使用。创建控制器时使用 CatalogFactory.extended()，并在 createSurface 中使用 ohos.a2ui.extended.catalog。

```ts
import {
  CatalogFactory,
  SurfaceControllerFactory
} from '@arkui-genius/genui'

const controller = SurfaceControllerFactory.createSurfaceController({
  uiContext: uiContext,
  catalog: CatalogFactory.extended()
})
```

## 字段类型区分

除支持 [通用属性](overview.md#通用属性) 和 [styles 通用样式](overview.md#styles-通用样式)，还支持以下字段：

| 字段名 | 字段类型 | 说明 |
|------|------|------|
| [barPosition](#barposition) | 属性 | 页签栏位置 |
| [children](#children) | 属性 | 页签子项列表（[TabContent](tab-content.md)） |
| [vertical](#vertical) | 属性 | 是否纵向布局 |
| [scrollable](#scrollable) | 属性 | 是否支持滑动切页 |
| [tabIndex](#tabindex) | 属性 | 当前被激活的页面索引（按数字索引处理） |
| [styles](#styles) | 样式 | 通用样式对象（当前无专用私有样式字段） |

## 属性字段

### barPosition

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| barPosition | string | 否 | 取值支持：start、end、right、bottom。默认值：start。其中 end、right、bottom 最终都会落到同一侧显示效果。 |

### children

页签子项列表，子项应为 [TabContent](tab-content.md)。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| children | [ChildList](../types.md#childlist) | 否 | 支持[静态子组件列表](../types.md#静态子组件列表)或[动态模板](../types.md#动态模板) { componentId, path }。默认值：[]。未配置或解析后为空时，会继续尝试从命名子内容中取页签。 |

#### children 运行时行为（模板模式）

- 静态数组模式下，数组中的每一项都应指向一个 [TabContent](tab-content.md) 组件；非 TabContent 子项会在渲染前被过滤掉。
- 模板对象模式下，componentId 引用模板组件 [ComponentId](../types.md#componentid)，id 等于 componentId 的组件描述符就是模板描述符；path 使用 [DataBinding](../types.md#databinding) 中同样的 JSON Pointer 写法指向数组数据。
- 运行时会读取 path 指向的数组，并按数组顺序生成页签子项；如果 path 没有解析到数组，或模板对象缺少 componentId / path，则本次按空页签列表处理。
- slots 可以理解为“命名子内容插槽”，也就是自定义组件传进来的多块子内容，详见 [容器组件：slot 和 slots](../../guides/creating-custom-components.md#容器组件slot-和-slots)。
- 当 children 未配置，或配置后没有解析出可用子项时，Tabs 会继续尝试从这些命名子内容中取页签。
- 如果插槽名里存在 tab-0、tab-1 这类名字，就优先按这个顺序显示；如果没有，则按拿到的子内容顺序显示。

### vertical

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| vertical | [DynamicBoolean](../types.md#dynamicboolean) | 否 | 是否纵向布局。true 表示页签栏和内容区按纵向组织，false 表示按横向组织。默认值：false。 |

### scrollable

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| scrollable | [DynamicBoolean](../types.md#dynamicboolean) | 否 | 是否允许手势滑动切页。true 表示用户可以滑动切换页签；false 表示不能用手势滑动切页，只能通过点击页签，或通过更新绑定到 tabIndex 的数据模型值、updateComponents / setAttributes 修改 tabIndex 来切换。默认值：true。 |

### tabIndex

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tabIndex | [DynamicNumber](../types.md#dynamicnumber) | 否 | 当前被激活的页面索引。建议传入数字、[DataBinding](../types.md#databinding) 或返回数字的 [FunctionCall](../functions/functioncall.md)。默认值：0。运行时会按索引处理并裁剪到 [0, children.length - 1]。 |

说明：
- 文档层建议直接传数字或动态数字，不建议传字符串数字。
- 当传入值小于 0 或超过子项范围时，最终会回退到有效索引边界。

## 样式字段（styles）

### styles

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles | object | 否 | 支持 [styles 通用样式](overview.md#styles-通用样式)。当前 Tabs 暂无专用私有样式字段。 |

## 运行时行为

- 当最终无可用子项时，组件不会渲染 Tabs 主体。
- 用户点击页签会更新当前索引，并触发页签栏重绘（用于样式同步）。
- barPosition、vertical、scrollable、tabIndex 的非法输入都会回退到默认行为。
- tabIndex 会按当前子项数量裁剪到有效范围。

## 示例

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "extended-tabs-surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateDataModel": {
    "surfaceId": "extended-tabs-surface",
    "value": {
      "tabsState": {
        "activeIndex": 1
      }
    }
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-tabs-surface",
    "components": [
      {
        "id": "root",
        "component": "Tabs",
        "barPosition": "bottom",
        "children": ["tabHome", "tabOrders"],
        "tabIndex": { "path": "/tabsState/activeIndex" },
        "scrollable": true,
        "vertical": false,
        "styles": {},
        "weight": 1
      },
      {
        "id": "tabHome",
        "component": "TabContent",
        "title": "Home",
        "children": ["homePage"]
      },
      {
        "id": "tabOrders",
        "component": "TabContent",
        "title": "Orders",
        "children": ["ordersPage"]
      },
      {
        "id": "homePage",
        "component": "Text",
        "content": "欢迎来到首页"
      },
      {
        "id": "ordersPage",
        "component": "Text",
        "content": "这里展示订单列表"
      }
    ]
  }
}
]
```

### 模板模式示例

建议先下发 updateDataModel，再下发引用该数组的 updateComponents。当前运行时如果先收到模板容器、后收到首次数组数据，通常还需要再补发一次容器的 updateComponents 才会生成首批实例。

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "tabs_template_surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateDataModel": {
    "surfaceId": "tabs_template_surface",
    "value": {
      "pages": [
        { "title": "首页", "body": "欢迎使用 GenUI" },
        { "title": "设置", "body": "在此配置偏好" }
      ]
    }
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "tabs_template_surface",
    "components": [
      {
        "id": "root",
        "component": "Tabs",
        "children": { "componentId": "tabContentTpl", "path": "/pages" }
      },
      {
        "id": "tabContentTpl",
        "component": "TabContent",
        "title": { "path": "title" },
        "children": ["pageContent"]
      },
      {
        "id": "pageContent",
        "component": "Text",
        "content": { "path": "body" }
      }
    ]
  }
}
]
```

上例中，Tabs 遍历 /pages 数组，为每个页面生成一个 TabContent 标签页，页签文字和页面内容分别取自数据项的 title（如"首页"）和 body（如"欢迎使用 GenUI"）。

#### children 运行时行为（模板模式）

> **注意**：以下渐进式渲染行为为扩展组件专属。

使用模板对象模式时，children 具有以下运行时行为：

1. **延迟展开**：如果模板 componentId 对应的描述符尚未到达，Tabs 会被标记为 pending，不阻塞其他组件渲染。
2. **渐进式渲染**：每批描述符到达后立即尝试渲染，不等待模板子树完整。
3. **自动重建**：同一 componentId 的模板描述符再次下发时，Tabs 自动重建所有模板实例。
4. **数据驱动刷新**：DataModel 中模板 path 绑定的数组数据发生变化时（通过 updateDataModel 消息或 EventHandler setDataModel），渲染器自动同步刷新所有模板实例。数组长度变化时自动增减实例数量，数组项内容变化时已有实例自动更新。
5. **即时渲染**：Tabs 使用即时渲染模式（eager），所有模板实例在展开时一次性创建。

## 事件

支持[通用事件](overview.md#通用事件属性)，并支持以下组件私有事件：

| 事件 | 适用组件 | 触发时机 | 回调数据 |
|------|------|------|------|
| onChange | Tabs | 当前显示 Tab 值发生变化时触发 | { index: number }，index 为当前被激活的页面索引（从 0 开始）。 |

## 组件Schema

```json
{
  "type": "object",
  "allOf": [
    {
      "$ref": "../common_types.json#/$defs/ComponentCommon"
    },
    {
      "$ref": "../common_types.json#/$defs/CatalogComponentCommon"
    },
    {
      "type": "object",
      "properties": {
        "component": {
          "const": "Tabs"
        },
        "barPosition": {
          "type": "string",
          "enum": ["start", "end", "right", "bottom"],
          "description": "Tab bar position. 'start' and 'end' are canonical values."
        },
        "children": {
          "$ref": "../common_types.json#/$defs/ChildList",
          "description": "Tab content component IDs or template source. Child component type must be TabContent."
        },
        "vertical": {
          "$ref": "../common_types.json#/$defs/DynamicBoolean"
        },
        "scrollable": {
          "$ref": "../common_types.json#/$defs/DynamicBoolean"
        },
        "tabIndex": {
          "$ref": "../common_types.json#/$defs/DynamicNumber"
        },
        "styles": {
          "description": "Shared extended component styles. No dedicated Tabs style fields are defined currently.",
          "allOf": [
            {
              "$ref": "../common_types.json#/$defs/ExtendedCommonStyles"
            }
          ]
        }
      },
      "required": [
        "component"
      ]
    }
  ],
  "additionalProperties": true
}
```

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
