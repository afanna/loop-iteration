# 主题与色彩模式

> **起始版本：** API Version 20
>
> 本文说明标准协议下的主题配置与品牌色能力。使用 theme 时，Surface 需绑定标准 Catalog。

## 概述

GenUI 在标准协议下支持组件级别的主题配置和系统深浅色模式跟随。Agent 可以在 [createSurface](../reference/messages.md#createsurface) 消息中指定品牌色，GenUI 自动将其应用到受影响的组件。同时，GenUI 自动跟随系统深浅色模式切换，无需应用额外处理。若使用扩展协议，请改读 [扩展组件默认深浅色](extension-color-mode.md)。

## 品牌色配置

在 createSurface 的 theme 字段中指定：

```json
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "theme-demo",
    "catalogId": "https://a2ui.org/specification/v0_9/standard_catalog.json",
    "theme": {
      "primaryColor": "#00BFFF",
      "darkPrimaryColor": "#FF6A00"
    }
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| primaryColor | string | 是 | 浅色模式品牌色 |
| darkPrimaryColor | string | 否 | 深色模式品牌色 <br/> 默认值：primaryColor 的 RGB 取反 |

> theme 仅在标准协议下生效。扩展组件不会解析 createSurface 中的 theme 字段。

### 颜色格式

| 格式 | 示例 | 说明 |
|------|------|------|
| #RRGGBB | #00BFFF | Alpha 自动补为 FF（不透明） |
| #AARRGGBB | #FF00BFFF | 保留显式 Alpha 值 |

## 深浅色模式跟随

标准协议下，GenUI 自动跟随系统色彩模式。当系统从浅色切换到深色时：

1. GenUI 检测到 ColorMode 变化
2. 主题管理器切换到对应的品牌色
3. 受影响的组件自动刷新

开发者不需要手动监听或切换——[UIRendererComponent](../reference/API/ui-renderer-component.md) 内置了这个能力。

```ts
import { UIRendererComponent } from '@arkui-genius/genui'

// 无需手动处理深浅色切换，GenUI 自动跟随系统
UIRendererComponent({
  surfaceController: this.controller
})
```

> **说明：**
>
> UIRendererComponent 不支持开发者在外部包裹 ArkUI WithTheme 来覆盖 GenUI Surface 主题。通过 WithTheme 设置的主题色和局部深浅色不会传递到 GenUI 渲染链路，因此不会影响标准协议组件的品牌色。标准协议如需配置品牌色，请使用 createSurface.theme；如需主动控制深浅色，请调用 [updateThemeMode](../reference/API/surface-controller.md#updatethememode)。扩展协议的默认深浅色和 $__colorMode 规则见 [扩展组件默认深浅色](extension-color-mode.md)。

## 标准协议下的品牌色生效规则

| 当前模式 | 配置状态 | 生效的品牌色 |
|----------|----------|-------------|
| 浅色 | primaryColor 有效 | primaryColor |
| 浅色 | primaryColor 无效 | 组件默认色 |
| 深色 | darkPrimaryColor 有效 | darkPrimaryColor |
| 深色 | 仅 primaryColor 有效 | primaryColor RGB 取反 |
| 深色 | 均无效 | 组件默认色 |

## 受品牌色影响的组件

| 组件 | 影响 |
|------|------|
| [Button](../reference/standard-components/button.md) | primary 和 default 类型背景色；borderless 类型文字色 |
| [CheckBox](../reference/standard-components/checkbox.md) | 选中状态颜色 |
| [Slider](../reference/standard-components/slider.md) | 已选轨道颜色 |
| [ChoicePicker](../reference/standard-components/choicePicker.md) | checkbox 选中色、chips 选中背景 |
| [DateTimeInput](../reference/standard-components/dateTimeInput.md) | 日期/时间选择器选中色、确认按钮背景 |
| [Tabs](../reference/standard-components/tabs.md) | 选中 tab 文字色、指示器颜色 |

不受影响的组件（使用默认样式）：[Text](../reference/standard-components/text.md)、[Card](../reference/standard-components/card.md)、[Column](../reference/standard-components/column.md)、[Row](../reference/standard-components/row.md)、[Image](../reference/standard-components/image.md)、[List](../reference/standard-components/list.md)、[TextField](../reference/standard-components/textfield.md)、[Modal](../reference/standard-components/modal.md)、[AudioPlayer](../reference/standard-components/audioPlayer.md)、[Divider](../reference/standard-components/divider.md)、[Icon](../reference/standard-components/icon.md)、[Video](../reference/standard-components/video.md)。

## 每个 Surface 独立主题

> 标准协议下，createSurface.theme 仅作用于当前 Surface。多 Surface 场景下，各 Surface 的主题配置相互独立。

## 手动切换模式

如果需要主动控制色彩模式（而非跟随系统）：

相关接口说明见 [SurfaceController](../reference/API/surface-controller.md#surfacecontroller) 和 [ThemeMode](../reference/API/types.md#thememode)：

```ts	 
import { ThemeMode } from '@arkui-genius/genui' 

// 切换到深色模式	 
controller.updateThemeMode(ThemeMode.DARK)	 

```

## 自定义组件的主题感知

自定义组件可以通过 [CustomComponentAttribute.componentTheme](../guides/creating-custom-components.md) 读取当前主题信息。componentTheme 下的 6 个属性都为可选项；其中 primaryColor 和 darkPrimaryColor 仅在标准协议且已配置 theme 时才可能有值。

完整示例、字段说明以及 primaryColor / darkPrimaryColor 的取值前提，见 [主题定制 > 自定义组件主题感知](../guides/theming-guide.md#自定义组件主题感知)。

---

← 上一节：[变量系统](variable-system.md) | → 下一节：[扩展组件默认深浅色](extension-color-mode.md) | ↑ [概念层总览](overview.md)
