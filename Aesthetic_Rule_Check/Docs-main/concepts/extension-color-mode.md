# 扩展组件默认深浅色

> **起始版本：** API Version 20
>
> 本文说明鸿蒙扩展协议下扩展组件的默认深浅色。使用扩展组件默认深浅色能力时，需要启用扩展 Catalog，并在 [createSurface](../reference/messages.md#createsurface) 中使用 ohos.a2ui.extended.catalog。

## 概述

扩展组件支持在 DSL 中通过组件属性或 styles 对象设置颜色。颜色取值遵循以下优先级：

1. DSL 显式设置了颜色属性时，渲染结果以 DSL 为准。
2. DSL 未设置颜色属性时，组件根据当前深浅色模式使用默认颜色。
3. 当显式颜色也需要跟随深浅色变化时，DSL 可通过 [表达式语言](expression-language.md) 读取 $__colorMode。

深浅色模式来源与切换接口与标准协议一致，详见 [主题与色彩模式](theme-and-color-mode.md)；扩展组件的一多部署能力见 [扩展组件一多部署](extension-multi-deployment.md)。

> **说明**
>
> 下方字段路径按 [扩展组件参考](../reference/extended-components/overview.md) 整理；颜色值按当前默认映射记录。个别字段在协议 schema 与组件参考中存在命名差异，生成 DSL 时请优先使用本文和组件参考中的写法。

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
    "surfaceId": "extended-color-demo",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
}
```

## 颜色生效规则

| 场景 | 生效规则 |
|------|----------|
| DSL 显式设置颜色属性 | 使用 DSL 中的颜色值，不再使用默认色 |
| DSL 未设置颜色属性 | 组件根据当前 light / dark 模式使用下方默认值 |
| 系统深浅色切换 | 组件自动切换未显式设置的默认色；显式设置的颜色保持 DSL 值 |
| 调用 [updateThemeMode](../reference/API/surface-controller.md#updatethememode) 手动切换 | 组件按目标 ThemeMode 刷新未显式设置的默认色；固定显式颜色保持 DSL 值；引用 $__colorMode 的表达式颜色会重新求值 |

> **说明：**
>
> UIRendererComponent 不支持开发者在外部包裹 ArkUI WithTheme 来覆盖 GenUI Surface 主题。通过 WithTheme 设置的主题色和局部深浅色不会传递到 GenUI 渲染链路，因此不会影响扩展组件的默认深浅色或 $__colorMode。扩展组件不会解析 createSurface 中的 theme 字段；如需品牌化或业务颜色，请在 DSL 中显式设置颜色属性，如需主动控制深浅色，请调用 [updateThemeMode](../reference/API/surface-controller.md#updatethememode)。

颜色格式遵循 #RRGGBB 或 #AARRGGBB，详见 [颜色格式](theme-and-color-mode.md#颜色格式)。

## 颜色设置示例

### 固定显式颜色

下面示例中，Text.styles.fontColor 使用 DSL 指定值；TextInput 未设置 placeholderColor、caretColor、underlineColor 等属性，因此这些属性继续使用默认深浅色值。

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-color-demo",
    "components": [
      {
        "id": "root",
        "component": "Column",
        "children": ["title", "nameInput"]
      },
      {
        "id": "title",
        "component": "Text",
        "content": "用户信息",
        "styles": {
          "fontColor": "#FF0A59F7"
        }
      },
      {
        "id": "nameInput",
        "component": "TextInput",
        "text": { "path": "/profile/name" },
        "placeholder": "请输入姓名"
      }
    ]
  }
}
```

### 跟随深浅色的显式颜色

如果业务要求显式颜色也跟随深浅色切换，可以使用 $__colorMode：

```json
{
  "id": "modeAwareText",
  "component": "Text",
  "content": "跟随深浅色的显式颜色",
  "styles": {
    "fontColor": "{{ $__colorMode == 'dark' ? '#E5FFFFFF' : '#E5000000' }}"
  }
}
```

## 默认色

下表合并记录公共样式和组件颜色字段。完整属性、类型和异常值处理见各组件参考文档。

| 组件 | 字段路径 | 深色模式 | 浅色模式 | 说明 |
|------|----------|----------|----------|------|
| [公共样式](../reference/extended-components/overview.md#styles-通用样式) | [styles.shadow.color](../reference/extended-components/overview.md#shadow) | #FF000000 | #FF000000 | 当 styles.shadow 对象未显式设置 color 时，组件使用该默认色；未设置 shadow 时，组件不产生阴影 |
| [公共样式](../reference/extended-components/overview.md#styles-通用样式) | [styles.backgroundColor](../reference/extended-components/overview.md#backgroundcolor) | #00000000 | #00000000 | DSL 未显式设置时，公共样式默认使用透明色；具体渲染效果仍受组件自身规格影响 |
| [公共样式](../reference/extended-components/overview.md#styles-通用样式) | [styles.borderColor](../reference/extended-components/overview.md#bordercolor) | #FF000000 | #FF000000 | DSL 未显式设置时，公共样式默认使用透明色；具体渲染效果仍受组件自身规格影响 |
| [Radio](../reference/extended-components/radio.md) | styles.checkedBackgroundColor | #FF317AF7 | #FF0A59F7 | 选中态底板颜色 |
| [Radio](../reference/extended-components/radio.md) | styles.uncheckedBorderColor | #33FFFFFF | #33FFFFFF | 未选中态描边颜色 |
| [Radio](../reference/extended-components/radio.md) | styles.indicatorColor | #FFFFFFFF | #FFFFFFFF | 选中态内部圆饼颜色 |
| [Toggle](../reference/extended-components/toggle.md) | styles.selectedColor | #FF006CDE | #FF007DFF | 打开态背景颜色 |
| [Toggle](../reference/extended-components/toggle.md) | styles.unSelectedColor | #19FFFFFF | #19000000 | 关闭态背景颜色 |
| [Toggle](../reference/extended-components/toggle.md) | styles.switchPointColor | #FFE5E5E5 | #FFFFFFFF | 圆形滑块颜色 |
| [TextInput](../reference/extended-components/text-input.md) | styles.placeholderColor | #99FFFFFF | #99182431 | 提示文本颜色 |
| [TextInput](../reference/extended-components/text-input.md) | styles.caretColor | #FF5291FF | #FF007DFF | 光标颜色 |
| [TextInput](../reference/extended-components/text-input.md) | styles.selectedBackgroundColor | #33006CDE | #33007DFF | 文本选中底板颜色 |
| [TextInput](../reference/extended-components/text-input.md) | styles.underlineColor | #33FFFFFF | #33182431 | 下划线颜色；四种状态默认值相同，typing、error、disable 可单独设置 |
| [TextInput](../reference/extended-components/text-input.md) | styles.fontColor | #E5FFFFFF | #FF182431 | 输入文本颜色 |
| [Button](../reference/extended-components/button.md) | styles.fontColor | #FF5291FF | #FF0A59F7 | 按钮文本颜色 |
| [Checkbox](../reference/extended-components/checkbox.md) | styles.selectedColor | #FF0A59F7 | #FF317AF7 | 选中态填充颜色 |
| [Checkbox](../reference/extended-components/checkbox.md) | styles.unselectedColor | #66000000 | #66000000. | 未选中态描边颜色 |
| [Checkbox](../reference/extended-components/checkbox.md) | styles.mark.strokeColor | #FFFFFFFF | #FFFFFFFF | 勾选标记描边颜色 |
| [CheckboxGroup](../reference/extended-components/checkbox-group.md) | styles.selectedColor | #FF3F97E9 | #FF007DFF | 全选或部分选中颜色 |
| [CheckboxGroup](../reference/extended-components/checkbox-group.md) | styles.unselectedColor | #66FFFFFF | #66182431 | 未选中颜色 |
| [CheckboxGroup](../reference/extended-components/checkbox-group.md) | styles.mark.strokeColor | #FFFFFFFF | #FFFFFFFF | 勾选标记描边颜色 |
| [Select](../reference/extended-components/select.md) | fontColor | #E5FFFFFF | #E5000000 | 下拉按钮文本颜色 |
| [Select](../reference/extended-components/select.md) | selectedOptionBgColor | #33317AF7 | #33007DFF | 选中选项背景颜色 |
| [Select](../reference/extended-components/select.md) | selectedOptionFontColor | #FF3F97E9 | #FF007DFF | 选中选项文本颜色 |
| [Select](../reference/extended-components/select.md) | optionBgColor | #00000000 | #00000000 | 未选中选项背景颜色 |
| [Select](../reference/extended-components/select.md) | optionFontColor | #DBFFFFFF | #FF182431 | 未选中选项文本颜色 |
| [Select](../reference/extended-components/select.md) | menuBackgroundColor | #00000000 | #00000000 | 下拉菜单背景颜色 |
| [Progress](../reference/extended-components/progress.md) | styles.color (type=linear) | #FF317AF7 | #FF0A59F7 | 线性进度前景色 |
| [Progress](../reference/extended-components/progress.md) | styles.color (type=eclipse) | #19FFFFFF | #19000000 | 月蚀样式默认色 |
| [Text](../reference/extended-components/text.md) | styles.decoration.color | #99FFFFFF | #FF000000 | 文本装饰线颜色 |
| [Text](../reference/extended-components/text.md) | styles.fontColor | #99FFFFFF | #E5000000 | 文本颜色 |
| [Divider](../reference/extended-components/divider.md) | styles.color | #33FFFFFF | #33000000 | 分割线颜色 |
| [TabContent](../reference/extended-components/tab-content.md) | styles.selectColor | #FFF4F8FF | #FF1F64FF | 选中态标题文字颜色，由 Tabs 页签栏消费 |
| [TabContent](../reference/extended-components/tab-content.md) | styles.unselectedColor | #FFDADDE2 | #FF182431 | 非选中态标题文字颜色，由 Tabs 页签栏消费 |
| [TabContent](../reference/extended-components/tab-content.md) | styles.defaultBackgroundColor | #FF171A1E | #FFFFFFFF | 非选中态页签背景色 |
| [TabContent](../reference/extended-components/tab-content.md) | styles.selectBackgroundColor | #00000000 | #FFFFFFFF | 选中态页签背景色 |
| [TabContent](../reference/extended-components/tab-content.md) | styles.defaultBorderColor | #FF171A1E | #FFFFFFFF | 非选中态页签边框色 |
| [TabContent](../reference/extended-components/tab-content.md) | styles.selectBorderColor | #FF3778E8 | #FFFFFFFF | 选中态页签边框色 |

## 生成建议

| 目标 | 建议 |
|------|------|
| 使用系统默认深浅色 | 不在 DSL 中写对应颜色属性，组件会使用默认色 |
| 固定品牌或业务色 | 在 DSL 中显式设置颜色属性 |
| 显式颜色也要跟随深浅色 | 使用 $__colorMode 表达式输出不同颜色 |

生成扩展组件 DSL 时，建议优先保留默认色。只有在业务明确要求品牌化、状态强化或语义化颜色时，才显式写颜色属性。扩展组件的完整属性清单见 [扩展组件参考](../reference/extended-components/overview.md)。

---

← 上一节：[主题与色彩模式](theme-and-color-mode.md) | → 下一节：[扩展组件一多部署](extension-multi-deployment.md) | ↑ [概念层总览](overview.md)
