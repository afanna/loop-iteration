# 多设备自适应

> **起始版本：** API Version 20
>
> 多设备自适应是鸿蒙扩展协议新增能力，仅在 ohos.a2ui.extended.catalog [Catalog](catalogs.md) 下可用。

## 概述

鸿蒙扩展协议支持组件级别的多设备自适应能力，让同一个 DSL 在不同屏幕尺寸的设备上呈现最佳布局。其主要依赖两个机制：单位系统和响应式断点。

## 单位系统

| 单位 | 说明 | 示例 |
|------|------|------|
| vp | 虚拟像素（Virtual Pixel）。基于屏幕密度缩放，确保不同设备上的物理尺寸一致。 | "100vp" |
| fp | 字体像素（Font Pixel）。与 vp 类似，但会跟随用户字体大小设置缩放。 | "16fp" |
| % | 百分比。相对于父容器的尺寸。 | "50%" |
| 纯数字 | 默认使用 vp。 | 16（等同于 16vp） |

```json
{
  "styles": {
    "width": "100%",       // 占满父容器宽度
    "height": "200vp",     // 固定高度
    "fontSize": "16fp",    // 跟随系统字体大小
    "padding": "16vp",
    "margin": "8vp"
  }
}
```

## 布局策略

| 策略 | 说明 |
|------|------|
| wrapContent | 内容自适应——容器尺寸跟随内容大小 |
| matchParent | 父组件对应宽/高为定值时填充父容器——容器占满已确定的可用空间 |

```json
{ "styles": { "width": "matchParent", "height": "wrapContent" } }
```

matchParent 仅在父组件对应方向的尺寸为定值时生效；如果父组件尺寸不确定，应使用 %、vp、wrapContent，或先为父组件设置确定尺寸。

## 响应式断点

GenUI 提供 5 个响应式断点。断点值由框架自动写入全局变量 $__widthBreakpoint。

断点切换内部基于 ArkUI 的 onSizeChange 回调触发。该回调在布局尺寸发生变化时返回组件尺寸；受计算精度影响，返回值可能与设备真实物理尺寸存在细微差异，因此断点判断应以框架计算后的有效宽度和 $__widthBreakpoint 为准。

| 断点 | 有效宽度范围 | 典型场景 |
|------|--------------|----------|
| xs | < 320vp | 极窄窗口、小窗 |
| sm | >= 320vp 且 < 600vp | 手机竖屏、窄屏布局 |
| md | >= 600vp 且 < 840vp | 横屏手机、平板竖屏、中等宽度窗口 |
| lg | >= 840vp 且 < 1440vp | 平板横屏、常见桌面窗口 |
| xl | >= 1440vp | 超宽桌面窗口 |

在横屏或超宽窗口下，框架会先结合窗口宽高比计算有效宽度，再决定断点，避免仅因窗口过宽而误判为更大的档位。

通过全局变量 $__widthBreakpoint 在 {{ }} 表达式中使用：

```json
{
  "id": "responsive_text",
  "component": "Text",
  "content": "{{ $__widthBreakpoint == 'sm' ? '窄屏显示' : '宽屏显示' }}",
  "styles": {
    "fontSize": "{{ $__widthBreakpoint == 'xs' ? '14fp' : $__widthBreakpoint == 'sm' ? '16fp' : '20fp' }}"
  }
}
```

## If 条件组件

If 组件用于根据条件（表达式）动态显示或隐藏 UI 分支：

```json
{
  "id": "conditional_section",
  "component": "If",
  "condition": "{{ $__widthBreakpoint == 'xl' }}",
  "childrenIf": ["wide_layout"],
  "childrenElse": ["narrow_layout"]
}
```

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| condition | string | 是 | 表达式，求值为 true 时渲染 childrenIf |
| childrenIf | string[] | 否 | 条件为 true 时渲染的子组件 ID 列表，默认为空数组 |
| childrenElse | string[] | 否 | 条件为 false 时渲染的子组件 ID 列表，默认为空数组 |

### 条件渲染示例

```json
{
  "updateComponents": {
    "surfaceId": "adaptive",
    "components": [
      { "id": "root", "component": "Column", "children": ["header", "adaptive_section"] },

      { "id": "header", "component": "Text",
        "content": "{{ '当前断点：' + $__widthBreakpoint }}" },

      { "id": "adaptive_section", "component": "If",
        "condition": "{{ $__widthBreakpoint == 'xs' || $__widthBreakpoint == 'sm' }}",
        "childrenIf": ["narrow_content"],
        "childrenElse": ["wide_row"] },

      { "id": "narrow_content", "component": "Column",
        "children": ["title_text", "desc_text", "image"],
        "styles": { "padding": "16vp" } },

      { "id": "wide_row", "component": "Row",
        "children": ["image", "text_col"],
        "styles": { "padding": "24vp" } },

      { "id": "text_col", "component": "Column",
        "children": ["title_text", "desc_text"] },

      { "id": "title_text", "component": "Text",
        "content": "产品详情" },
      { "id": "desc_text", "component": "Text",
        "content": "这是一段产品描述" },
      { "id": "image", "component": "Image",
        "styles": { "width": "100%" } }
    ]
  }
}
```

当窗口宽度变化时，If 组件的 condition 重新求值，自动切换 childrenIf 和 childrenElse 分支。

## 端侧设备信息获取

如果需要在端侧获取当前设备的断点信息（用于设备感知定向生成或调试），可通过以下方式：

```ts
import display from '@ohos.display'

function getCurrentBreakpoint(): string {
  const displayInfo = display.getDefaultDisplaySync()
  const widthVp = displayInfo.width / displayInfo.densityPixels
  const heightVp = displayInfo.height / displayInfo.densityPixels
  const aspectRatio = heightVp > 0 ? widthVp / heightVp : 1
  const effectiveWidthVp = aspectRatio > 1 ? widthVp / aspectRatio : widthVp

  if (effectiveWidthVp < 320) return 'xs'
  if (effectiveWidthVp < 600) return 'sm'
  if (effectiveWidthVp < 840) return 'md'
  if (effectiveWidthVp < 1440) return 'lg'
  return 'xl'
}
```

> 端侧获取的断点值仅用于 LLM Prompt 注入或日志调试。DSL 中的自适应应使用 $__widthBreakpoint 全局变量，由框架自动维护。

## 与 LLM 集成

[PromptBuilder](../reference/API/prompt-builder.md) 生成的系统提示词已自动包含 $__widthBreakpoint 变量、If 组件的 Schema 和用法说明。LLM 能力根据这些信息生成自适应 DSL。

三种 LLM 集成策略：

- **策略 A（定向生成）**：将端侧检测到的断点值注入 Prompt，LLM 仅为当前设备生成 DSL
- **策略 B（定向+重生成）**：策略 A 基础上监听窗口变化，断点变化时自动重新调用 LLM
- **策略 C（通用自适应 DSL）**：追加增量指令，LLM 生成包含 If 组件和断点表达式的通用 DSL

完整的 Prompt 模板和 DSL 模式速查见 [多设备自适应最佳实践](../guides/multi-device-best-practices.md)。

---

← 上一节：[扩展组件一多部署](extension-multi-deployment.md) | ↑ [概念层总览](overview.md)
