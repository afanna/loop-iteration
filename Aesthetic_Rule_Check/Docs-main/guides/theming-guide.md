# 主题定制

通过 createSurface.theme 配置品牌色，GenUI 自动将品牌色应用到受影响的组件，同时支持深色模式跟随和手动控制。本文介绍的是标准协议下的主题能力。若当前 Surface 使用扩展协议，需要注意扩展组件不会解析 createSurface 中的 theme 字段；相关颜色行为见 [扩展组件默认深浅色](../concepts/extension-color-mode.md)。

---

## 配置品牌色

在创建 Surface 时指定：

```json
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "themed-page",
    "catalogId": "https://a2ui.org/specification/v0_9/standard_catalog.json",
    "theme": {
      "primaryColor": "#0A59F7",
      "darkPrimaryColor": "#4D8FFF"
    }
  }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| primaryColor | 是 | 浅色模式品牌色 |
| darkPrimaryColor | 否 | 深色模式品牌色。缺失时对 primaryColor RGB 取反 |

> theme 仅在标准协议下生效。扩展组件不会解析 createSurface 中的 theme 字段。

### 颜色格式

| 用法 | 格式 | Alpha |
|------|------|-------|
| 简单 | #0A59F7 | 自动补为 FF |
| 带透明度 | #800A59F7 | 使用显式 Alpha |

---

## 深色模式

### 自动跟随

无需代码。当系统切换深浅色模式时：
1. GenUI 自动选择 primaryColor 或 darkPrimaryColor
2. 受影响的组件自动刷新

扩展协议同样支持跟随系统或通过 updateThemeMode() 切换深浅色；扩展组件的颜色行为见 [扩展组件默认深浅色](../concepts/extension-color-mode.md)。

### 手动控制

如需脱离系统设置自行控制：

```ts
import { ThemeMode } from '@arkui-genius/genui'

controller.updateThemeMode(ThemeMode.DARK)   // 强制深色
controller.updateThemeMode(ThemeMode.LIGHT)  // 强制浅色

const current = controller.getThemeMode()    // LIGHT(0) / DARK(1)
```

#### ThemeMode 枚举

| 名称 | 值 | 说明 |
|------|----|------|
| LIGHT | 0 | 浅色模式 |
| DARK | 1 | 深色模式 |

### 标准协议下的品牌色生效规则

| 当前模式 | 配置 | 生效色 |
|----------|------|--------|
| 浅色 | 有 primaryColor | primaryColor |
| 浅色 | 无 primaryColor | 组件默认色 |
| 深色 | 有 darkPrimaryColor | darkPrimaryColor |
| 深色 | 只有 primaryColor | primaryColor RGB 取反 |
| 深色 | 都无 | 组件默认色 |

---

## 受品牌色影响的标准组件

| 组件 | 影响 |
|------|------|
| **Button** | primary 和 default 类型背景色；borderless 类型文字色 |
| **CheckBox** | 选中色 |
| **Slider** | 已选轨道色 |
| **ChoicePicker** | checkbox 选中色、chips 选中背景 |
| **DateTimeInput** | 日期选择器选中色、确认按钮背景 |
| **Tabs** | 选中 tab 文字色、指示器色 |

### 不受影响的组件及原因

| 组件 | 原因 |
|------|------|
| **Text**、**Card**、**Column**、**Row**、**Image**、**List**、**TextField**、**Modal** | 使用默认样式，未接入主题系统 |
| **AudioPlayer**、**Video** | 样式由播放器内部控制，未接入主题系统 |
| **Divider** | 分割线样式固定，未接入主题系统 |
| **Icon** | 图标颜色由独立属性控制，未关联品牌色 |

---

## 每 Surface 独立主题

在标准协议下，createSurface.theme 仅作用于当前 Surface。多 Surface 可以有不同品牌色：

```json
// 首页 — 蓝色
{ "createSurface": { "surfaceId": "home", "theme": { "primaryColor": "#0A59F7" } } }

// 个人页 — 绿色
{ "createSurface": { "surfaceId": "profile", "theme": { "primaryColor": "#52C41A" } } }
```

### 主题影响范围

| 范围类型 | 说明 |
|----------|------|
| 单 Surface | 标准协议下的 createSurface.theme 仅作用于当前 Surface |
| 多 Surface | 各 Surface 的主题配置相互独立 |
| 多 Controller | updateThemeMode() 影响该 Controller 下的所有 Surface |

---

## 自定义组件主题感知

在 @Builder 中通过 attr.componentTheme 读取当前主题上下文。componentTheme 下的 6 个属性都不是必定有值，建议始终使用可选链和默认值兜底。

其中，componentTheme.primaryColor 只有在标准协议场景且 DSL 的 createSurface.theme.primaryColor 已配置时才有值；componentTheme.darkPrimaryColor 只有在标准协议场景且 DSL 的 createSurface.theme.darkPrimaryColor 已显式配置时才有值。扩展协议下，由于扩展组件不会解析 createSurface 中的 theme 字段，这两个字段通常为空；此时自定义组件通常只读取 colorMode、breakpoint 等上下文，并自行做好颜色兜底。

示例：

```ts
import { ThemeMode } from '@arkui-genius/genui'

@Builder
function MyComponent(attr: CustomComponentAttribute) {
  const theme = attr.componentTheme
  const brandColor = theme?.colorMode === ThemeMode.DARK
    ? (theme?.darkPrimaryColor ?? theme?.primaryColor ?? '#0A59F7')
    : (theme?.primaryColor ?? '#0A59F7')

  Text('品牌色标题')
    .fontColor(brandColor)
}
```

| 属性 | 是否必定有值 | 说明 |
|------|--------------|------|
| componentTheme.primaryColor | 否 | 当前 Surface 的浅色品牌色配置。仅在标准协议场景且 DSL 的 createSurface.theme.primaryColor 已配置时有值 |
| componentTheme.colorMode | 否 | 当前 Surface 生效的色彩模式。读取时请做好空值兜底 |
| componentTheme.breakpoint | 否 | 当前 Surface 生效的响应式断点。读取时请做好空值兜底 |
| componentTheme.darkPrimaryColor | 否 | 当前 Surface 的深色品牌色配置。仅在标准协议场景且 DSL 的 createSurface.theme.darkPrimaryColor 已显式配置时有值 |
| componentTheme.iconUrl | 否 | 当前 Agent 或工具的图标 URL。读取时请做好空值兜底 |
| componentTheme.agentDisplayName | 否 | 当前 Agent 或工具的展示名称。读取时请做好空值兜底 |

---

## 深色模式测试

开发时验证深色模式效果：

1. 在模拟器/真机设置中切换深色模式
2. 或在代码中手动切换：controller.updateThemeMode(ThemeMode.DARK)
3. 检查以下要点：
   - 背景色是否反转
   - 标准协议下的品牌色是否切换到 darkPrimaryColor，或在未配置时正确回退到 primaryColor 的 RGB 取反结果
   - 文字是否可读
   - 自定义组件是否在 componentTheme.primaryColor、componentTheme.darkPrimaryColor 为空时正确回退到默认值；扩展协议下不应依赖这两个字段

---

相关指南：
→ [主题概念](../concepts/theme-and-color-mode.md) | → [扩展组件默认深浅色](../concepts/extension-color-mode.md) | → [自定义组件](creating-custom-components.md) | → [定义 Catalog](defining-catalogs.md)
