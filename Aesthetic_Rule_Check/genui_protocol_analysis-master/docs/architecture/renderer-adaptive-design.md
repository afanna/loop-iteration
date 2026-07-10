# 鸿蒙 A2UI 生成式 UI Renderer 多设备自适应架构设计

**日期**: 2026-04-28
**状态**: 草案
**依赖**: 鸿蒙 A2UI 协议 v2.0（基于 A2UI v0.9 扩展）、ArkUI 一多能力

---

## 一、背景与目标

### 1.1 问题域

鸿蒙 A2UI 是一个生成式 UI 协议——LLM 输出 JSON DSL，客户端 Renderer 解析 DSL 并渲染为原生 ArkUI 组件树。由于鸿蒙生态覆盖手机、平板、折叠屏、桌面等多形态设备，Renderer 必须具备多设备自适应能力，使同一份 DSL 在不同屏幕尺寸上呈现合理的 UI。

### 1.2 核心目标

**A2UI Renderer 的职责不是自行实现自适应逻辑，而是正确使用 ArkUI 引擎已提供的一多（一次开发多端部署）能力。** 具体包括三层：

1. **组件级自适应** — 将 A2UI 扩展组件正确映射到 ArkUI 原生组件，利用 ArkUI 组件内置的多态实现
2. **布局级自适应** — 将 A2UI 布局描述映射到 ArkUI 的拉伸/压缩/弹性/断点布局能力
3. **协议级自适应** — 执行 A2UI 协议中的响应式表达式、断点变量和条件渲染，驱动布局和属性的动态变化

---

## 二、ArkUI 一多能力概述

ArkUI 提供了一套完整的一多（一次开发多端部署）能力体系，A2UI Renderer 的核心任务就是正确使用这些能力。

### 2.1 长度单位体系

| 单位 | 说明 | 渲染映射 |
|------|------|----------|
| vp | Virtual Pixel，虚拟像素，与屏幕密度无关 | 默认单位，直接映射 |
| fp | Font Pixel，字体像素，随系统字体缩放设置变化 | 文本相关属性使用 |
| % | 百分比，相对于父容器尺寸 | 映射为 ArkUI 百分比值 |

A2UI 协议中的数值默认单位为 vp，字符串可带单位后缀（`"16vp"`、`"14fp"`、`"50%"`）。Renderer 需要解析并转换为 ArkUI 对应的长度值。

### 2.2 自适应布局策略

ArkUI 提供了三种自适应尺寸策略，对应 A2UI 协议中的枚举值：

| 策略 | 对应 ArkUI 枚举 | 行为 |
|------|----------------|------|
| `wrapContent` | `AdaptiveSizeStrategy.WRAP_CONTENT` | 组件尺寸由内容决定，不参与父容器剩余空间分配 |
| `matchParent` | `AdaptiveSizeStrategy.MATCH_PARENT` | 组件尺寸填充父容器可用空间 |
| `fixAtIdealSize` | `AdaptiveSizeStrategy.FIX_AT_IDEAL_SIZE` | 组件保持理想尺寸，不受父容器尺寸约束 |

这些策略应用在组件的 `width`/`height` 属性上，决定组件在容器内的尺寸行为。

### 2.3 Flex 布局能力（Row/Column 映射）

ArkUI 的 Row/Column 基于 Flex 布局模型，提供三种关键自适应能力：

**拉伸（Stretch）**：子组件沿交叉轴拉伸填充容器
- 对应 `alignItems: "stretch"`（注意：A2UI 协议中使用 `"start"/"center"/"end"` 对应 ArkUI 的 `HorizontalAlign.Start/Center/End` 或 `VerticalAlign.Top/Center/Bottom`）

**压缩（Compress）**：当空间不足时，子组件可被压缩
- 通过 `constraintSize: { minWidth, maxWidth }` 控制压缩范围

**弹性（Flex）**：子组件按权重分配剩余空间
- 对应 `layoutWeight` 属性（类似 CSS `flex-grow`）
- A2UI 协议中 `layoutWeight: 1` 映射为 ArkUI `layoutWeight(1)`

**主轴对齐**（justifyContent）：
- `"start"`, `"center"`, `"end"` — 子组件在主轴方向的对齐位置
- `"spaceBetween"`, `"spaceAround"`, `"spaceEvenly"` — 子组件在主轴方向的分布方式

**交叉轴对齐**（alignItems）：
- `"start"` — 子组件在交叉轴起点对齐
- `"center"` — 子组件在交叉轴居中对齐
- `"end"` — 子组件在交叉轴终点对齐

### 2.4 断点系统

ArkUI 内置断点系统，与 A2UI 协议的断点定义一致：

| 断点 | 屏幕宽度范围 | 典型设备 | A2UI 变量值 |
|------|-------------|----------|-------------|
| xs | < 576px | 小屏手机 | `"xs"` |
| sm | 576px - 768px | 大屏手机 | `"sm"` |
| md | 768px - 992px | 平板竖屏 | `"md"` |
| lg | 992px - 1200px | 平板横屏/小屏笔记本 | `"lg"` |
| xl | > 1200px | 桌面显示器 | `"xl"` |

ArkUI 通过 `BreakpointSystem` 管理断点，组件可通过 `onBreakpointChange` 回调感知断点变化。

### 2.5 断点感知组件（List/Grid/GridRow）

这些 ArkUI 组件已内置断点自适应行为：

- **GridRow**：根据当前断点自动调整列数，子组件 `GridCol` 可通过 `span` 指定在不同断点下占据的列数
- **Grid**：支持 `columnsTemplate` 属性动态定义列模板，如 `"1fr 1fr 1fr"` 表示三列等宽
- **List**：支持 `listDirection` 在水平和垂直间切换，支持 `lanes` 属性定义不同断点下的列数

---

## 三、A2UI Renderer 架构设计

### 3.1 总体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    A2UI Renderer                             │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ Protocol │  │  Expression  │  │   Responsive Engine   │  │
│  │  Parser  │  │  Evaluator   │  │  (Breakpoint Monitor) │  │
│  └────┬─────┘  └──────┬───────┘  └───────────┬───────────┘  │
│       │               │                      │               │
│       ▼               ▼                      ▼               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │              Component Mapping Layer                  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │   │
│  │  │ Static   │ │ Layout   │ │ Adaptive │ │ Condi-  │  │   │
│  │  │ Widget   │ │ Container│ │ Container│ │ tional  │  │   │
│  │  │ Mapper   │ │ Mapper   │ │ Mapper   │ │ Mapper  │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────────┘  │   │
│  └───────────────────────┬───────────────────────────────┘   │
│                          ▼                                    │
│  ┌───────────────────────────────────────────────────────┐   │
│  │              ArkUI Component Tree                      │   │
│  │  Row / Column / Text / Button / List / Grid / ...     │   │
│  └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

Renderer 由四个核心子系统组成：

1. **Protocol Parser** — 解析 A2UI JSON 消息流（`createSurface`/`updateComponents`/`updateDataModel`/`deleteSurface`），构建组件邻接表和 DataModel
2. **Expression Evaluator** — 对 `{{ }}` 包裹的表达式进行词法分析、语法分析（EBNF 文法）、求值，返回计算结果
3. **Responsive Engine** — 监听窗口尺寸变化和断点切换，触发依赖表达式的重新求值和组件树更新
4. **Component Mapping Layer** — 将 A2UI 扩展组件映射为 ArkUI 原生组件，并正确配置自适应属性

### 3.2 组件映射策略

A2UI Renderer 的组件映射遵循**按组件类别分层映射**的策略：

#### 3.2.1 静态展示组件 — 直接映射，利用 ArkUI 多态实现

以下组件直接一对一映射到 ArkUI 原生组件，ArkUI 引擎已针对不同设备形态提供了多态实现：

| A2UI 组件 | ArkUI 映射 | 多态说明 |
|-----------|-----------|----------|
| `Extended.Text` | `Text` | 字体渲染、断行策略、fontSize 缩放由 ArkUI 自动处理 |
| `Extended.Button` | `Button` | 按钮尺寸、点击区域、圆角根据设备自动调整 |
| `Extended.TextInput` | `TextInput` | 键盘类型、输入框高度、光标样式自动适配 |
| `Extended.Image` | `Image` | 图片解码、缩放、缓存策略由 ArkUI 管理 |
| `Extended.Icon` | `SymbolGlyph` / `Image` | 图标渲染策略（单色/多色/透明度） |
| `Extended.Divider` | `Divider` | 分割线样式、方向 |
| `Extended.Toggle` | `Toggle` | 开关组件，样式类型（Checkbox/Button/Switch） |
| `Extended.Progress` | `Progress` | 进度条样式（线性/环形/胶囊） |
| `Extended.Radio` | `Radio` | 单选框，分组互斥由 `RadioGroup` 管理 |
| `Extended.Checkbox` | `Checkbox` | 多选框 |
| `Extended.CheckboxGroup` | `CheckboxGroup` | 多选框群组，全选/不全选联动 |
| `Extended.Slider` | `Slider` | 滑块，拖拽交互 |
| `Extended.Video` | `Video` | 视频播放 |
| `Extended.Web` | `Web` | 内嵌网页 |

**映射原则**：A2UI 组件的每个属性直接映射为 ArkUI 组件的同名或对应属性，无需额外包装。

#### 3.2.2 布局容器组件 — 映射并启用自适应布局能力

布局容器组件是 Renderer 需要重点关注的部分，必须正确启用 ArkUI 的拉伸/压缩/弹性能力：

##### Row / Column 映射

```
Extended.Row  ──►  Row({ space: <space> })
Extended.Column ──► Column({ space: <space> })
```

映射要点：
- `children` 数组按顺序映射为子组件，ID 引用通过邻接表解析
- `space` 映射为 Row/Column 的 `space` 参数（子组件间距）
- `styles.justifyContent` 映射为 `justifyContent` 枚举（主轴分布）
- `styles.alignItems` 映射为 `alignItems` 枚举（交叉轴对齐）
- 子组件的 `styles.layoutWeight: 1` 映射为 `.layoutWeight(1)`（弹性比例）
- 子组件的 `styles.width: "matchParent"` 映射为宽度填充
- 子组件的 `styles.constraintSize` 映射为 `.constraintSize({ minWidth, maxWidth })`（压缩约束）

##### Stack 映射

```
Extended.Stack ──► Stack({ alignContent: Alignment.TopStart })
```

- 子组件按数组顺序叠放，后添加的在上层
- 通过 `alignContent` 控制子组件在栈内的对齐方式

##### Tabs / TabContent 映射

```
Extended.Tabs      ──► Tabs({ index, vertical, scrollable })
Extended.TabContent ──► TabContent() { .tabBar(title, icon) }
```

- `tabIndex` 控制当前显示的 Tab 页
- `vertical` 控制 TabBar 的排列方向（横/竖）
- `scrollable` 控制 Tab 是否可滚动

#### 3.2.3 断点感知容器组件 — 启用自适应布局

##### List 映射

```
Extended.List ──► List({ space, scroller })
```

- `children` 为静态数组时，直接渲染子组件列表
- `children` 为模板对象 `{ componentId, path }` 时，使用 `ForEach` / `LazyForEach` 循环渲染
- `styles.listDirection` 控制滚动方向（手机通常垂直、平板可水平）
- `styles.scrollBar` 控制滚动条显示

##### Grid 映射

```
Extended.Grid ──► Grid()
```

- `columnsTemplate` 动态控制列数，结合 `$__WindowSize` 表达式实现响应式列数切换：
  ```
  "columnsTemplate": "{{ $__WindowSize.width < 600 ? '1fr 1fr' :
                         $__WindowSize.width < 900 ? '1fr 1fr 1fr' :
                         '1fr 1fr 1fr 1fr' }}"
  ```
- `rowsGap` / `columnsGap` 控制行列间距

##### GridRow 映射

```
Extended.GridRow ──► GridRow({ columns, breakpoints })
                      ├── GridCol({ span, offset }) // 子组件
                      └── ...
```

- GridRow 是 ArkUI 中最核心的断点自适应布局组件
- 支持 `breakpoints` 属性定义断点值与列数的映射
- 子组件 `GridCol` 的 `span` 在不同断点下可占有不同列数
- `onBreakpointChange` 事件回调用于响应断点切换（可以联动表达式系统触发重新求值）

### 3.3 表达式求值引擎

表达式系统是 Renderer 的核心子系统，负责在运行时对 `{{ }}` 包裹的表达式求值。

#### 3.3.1 表达式生命周期

```
DSL解析 → 注册表达式 → 初始求值 → 设置ArkUI属性
                                    ↓
                           [依赖变量变化]
                                    ↓
                            重新求值 → 更新ArkUI属性
```

#### 3.3.2 变量依赖追踪

表达式求值引擎需要维护变量之间的依赖关系：

```
表达式: "{{ $__WidthBreakpoint == 'sm' ? 14 : 18 }}"
依赖变量: [$__WidthBreakpoint]

表达式: "{{ $__WindowSize.width < 768 ? 8 : 16 }}"
依赖变量: [$__WindowSize.width]
```

当依赖变量发生变化时（如窗口尺寸变化导致断点切换），引擎自动重新计算表达式并将新值应用到对应的 ArkUI 组件属性上。

#### 3.3.3 变量体系

| 变量 | 类型 | 变更触发源 | 说明 |
|------|------|-----------|------|
| `$__DataModel` | object | `updateDataModel` 消息 | 应用数据模型 |
| `$__WindowSize` | `{width, height}` | 窗口 resize 事件 | 当前窗口像素尺寸 |
| `$__WidthBreakpoint` | string | 断点切换事件 | 当前断点枚举值 |
| `$__ColorMode` | string | 系统深色模式切换 | `"light"` / `"dark"` |
| `$index` | number | 列表循环迭代 | 当前循环索引 |
| `$item` | any | 列表循环迭代 | 当前循环数据项 |
| `$handlerResult['id']` | any | handler 执行完成 | 前置 handler 返回值(仅在 handlerGroups 模式) |

#### 3.3.4 运算符优先级

表达式引擎实现的运算符优先级（从高到低）：

1. `()` — 括号分组
2. `.` `[]` — 成员访问、数组索引
3. `!` — 逻辑非
4. `*` `/` `%` — 乘除取模
5. `+` `-` — 加减（遵循 JS 风格类型转换：`number + string` → string）
6. `>` `>=` `<` `<=` — 大小比较
7. `==` `!=` — 等值比较
8. `&&` — 逻辑与
9. `||` — 逻辑或
10. `? :` — 三元条件

#### 3.3.5 表达式求值的作用域

表达式可用于以下字段：
- `content` (Extended.Text)
- `text` (Extended.TextInput)
- `condition` (Extended.If)
- `enabled` (Extended.Button / Extended.Toggle / Extended.TextInput)
- `styles.*` (所有组件)
- `src` (Extended.Image)
- `value` (Extended.Progress / Extended.Slider / Extended.Toggle)

不可用于：`component`、`id`、`children`、`childrenIf`、`childrenElse`、`listeners`、`theme`、`label`、`placeholder`

### 3.4 条件渲染引擎

`Extended.If` 是 Renderer 需要特殊处理的组件类型——它是"元组件"，不直接映射到 ArkUI 组件，而是控制子组件树的组装。

```
Extended.If
  ├── condition: "{{ $__WidthBreakpoint == 'sm' }}"
  ├── childrenIf: ["mobileNav"]      ← 条件为真时渲染这个分支
  └── childrenElse: ["desktopNav"]   ← 条件为假时渲染这个分支
```

渲染逻辑：

```
IF condition 求值为 true
  → 从邻接表中取出 childrenIf 引用的组件 ID 列表
  → 递归构建这些组件
ELSE
  → 从邻接表中取出 childrenElse 引用的组件 ID 列表
  → 递归构建这些组件
```

**响应式行为**：当 `condition` 表达式依赖的变量变化时（如窗口断点从 `sm` 变为 `md`），条件重新求值，Renderer 重新选择分支并更新 UI 树。

### 3.5 响应式更新机制

整个响应式更新链路如下：

```
窗口尺寸变化
  │
  ▼
ArkUI onAreaChange / onConfigurationUpdate 回调
  │
  ▼
Responsive Engine 更新 $__WindowSize / $__WidthBreakpoint
  │
  ▼
依赖追踪系统查找所有依赖这些变量的表达式
  │
  ▼
Expression Evaluator 重新求值
  │
  ▼
将新值写入对应的 ArkUI 组件属性
  │
  ▼
ArkUI 自动触发重新布局和重绘
```

**关键设计点**：

1. **批量更新** — 同一帧内的多次变量变化应批量处理，避免多次重复求值
2. **精确依赖追踪** — 只重新求值依赖了变化变量的表达式，而非全量重算
3. **条件渲染联动** — `Extended.If` 的 `condition` 表达式重新求值后，可能需要切换整个子组件树
4. **Grid 布局联动** — `columnsTemplate` 表达式重新求值后，Grid 的列数动态变化

---

## 四、多设备自适应的三层架构

### 4.1 三层架构总览

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: 协议级自适应（Protocol-Driven Adaptation）          │
│ - Extended.If 条件渲染切换整个布局子树                       │
│ - 响应式表达式驱动属性变化                                   │
│ - 断点变量 + 窗口尺寸变量                                    │
│ - 数据驱动（DataModel → UI 更新）                            │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: 布局级自适应（Layout-Driven Adaptation）            │
│ - Row/Column Flex 拉伸/压缩/弹性                             │
│ - Grid/GridRow 断点自适应列数                                │
│ - List 方向/列数自适应                                       │
│ - justifyContent / alignItems / layoutWeight                │
├─────────────────────────────────────────────────────────────┤
│ Layer 1: 组件级自适应（Component-Level Adaptation）          │
│ - ArkUI 原生组件的多态实现                                   │
│ - vp/fp/% 单位体系                                           │
│ - fontSize / 字体缩放                                        │
│ - 深色模式 / ColorMode                                       │
└─────────────────────────────────────────────────────────────┘
```

**核心原则**：上层控制策略，下层提供能力。Layer 3 的表达式/条件渲染决定"用哪种布局"，Layer 2 的 Flex/Grid 决定"布局如何伸缩"，Layer 1 的组件多态保证"单个组件在任意设备上正常工作"。

### 4.2 典型设备适配策略矩阵

| 适配维度 | 小屏手机 (xs/sm) | 平板 (md/lg) | 桌面 (xl) |
|---------|-----------------|-------------|----------|
| 导航栏 | 底部 Tab 或汉堡菜单 | 侧边栏或顶部 Tab | 完整顶栏+侧边栏 |
| 内容布局 | 单列垂直滚动 | 双列或网格 | 多列或宽内容区 |
| 网格列数 | 2列 | 3-4列 | 4-6列 |
| 字体大小 | 14fp | 16fp | 18fp |
| 间距 | 8-12vp | 16-24vp | 24-32vp |
| 列表方向 | 垂直滚动 | 垂直/水平 | 水平展开或网格 |
| 弹窗/对话框 | 全屏或底部弹出 | 居中弹窗 | 居中弹窗 |

### 4.3 一个完整的自适应示例

通过以下 DSL，Renderer 可以自动在不同设备上呈现差异化的 UI：

**平板/桌面（宽度 >= 768px）**：顶栏导航 + 双列布局（主内容70% + 侧边栏28%）
**手机（宽度 < 768px）**：汉堡菜单导航 + 单列布局（100%宽度、无侧边栏）

Renderer 的处理流程：

1. 解析 `Extended.If` 组件 `responsive_nav`：`condition` 依赖 `$__WidthBreakpoint`
2. 解析 `Extended.If` 组件 `page_content`：`condition` 依赖 `$__WindowSize.width`
3. 解析 `article_title` 的 `fontSize`：链式三元表达式依赖 `$__WidthBreakpoint`
4. 解析 `product_grid` 的 `columnsTemplate`：链式三元表达式依赖 `$__WindowSize.width`
5. 注册所有表达式依赖，建立依赖追踪图
6. 初始求值后构建 ArkUI 组件树
7. 当窗口尺寸变化时，Responsive Engine 更新变量值 → 重新求值 → 更新 UI

---

## 五、Renderer 实现参考

### 5.1 核心数据结构

```typescript
// 组件邻接表：以 id 为键的扁平映射
interface ComponentRegistry {
  [id: string]: A2UIComponent
}

// 表达式注册表：跟踪每个表达式及其依赖
interface ExpressionBinding {
  id: string                    // 表达式唯一 ID
  raw: string                   // 原始表达式字符串 "{{ expr }}"
  ast: ExpressionNode           // 解析后的 AST
  dependencies: string[]        // 依赖的变量名列表
  targetComponentId: string     // 目标组件 ID
  targetProperty: string        // 目标属性路径，如 "styles.fontSize"
}

// 响应式变量上下文
interface ReactiveContext {
  windowSize: { width: number; height: number }
  windowBreakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  colorMode: 'light' | 'dark'
  dataModel: any
  loopVars: Map<string, any>   // $index, $item 等循环变量
}
```

### 5.2 映射伪代码

```typescript
function mapComponent(a2uiComp: A2UIComponent, registry: ComponentRegistry, ctx: ReactiveContext): ArkUIComponent {
  switch (a2uiComp.component) {
    // 条件渲染 — 特殊处理：不是映射为组件，而是选择分支
    case 'Extended.If':
      const condition = evaluateExpression(a2uiComp.condition, ctx)
      const branchIds = condition ? a2uiComp.childrenIf : a2uiComp.childrenElse
      // 注意：If 本身不映射为 ArkUI 组件，它透明地委托到选中分支
      return mapChildren(branchIds, registry, ctx)

    // 布局容器
    case 'Extended.Column':
      return Column({ space: a2uiComp.space })
        .justifyContent(mapJustify(a2uiComp.styles?.justifyContent))
        .alignItems(mapAlign(a2uiComp.styles?.alignItems))
        .children(mapChildren(a2uiComp.children, registry, ctx))

    case 'Extended.Row':
      return Row({ space: a2uiComp.space })
        .justifyContent(mapJustify(a2uiComp.styles?.justifyContent))
        .alignItems(mapAlign(a2uiComp.styles?.alignItems))
        .children(mapChildren(a2uiComp.children, registry, ctx))

    case 'Extended.Grid':
      return Grid()
        .columnsTemplate(evaluateExpression(a2uiComp.styles?.columnsTemplate, ctx))
        .rowsGap(a2uiComp.styles?.rowsGap)
        .columnsGap(a2uiComp.styles?.columnsGap)
        .children(mapChildren(a2uiComp.children, registry, ctx))

    case 'Extended.GridRow':
      return GridRow({ columns: 12, breakpoints: { value: ['320vp', '600vp', '840vp'], reference: BreakpointsReference.WindowSize } })
        .onBreakpointChange((breakpoint) => { ctx.windowBreakpoint = breakpoint; triggerReevaluation() })
        .children(mapGridCols(a2uiComp.children, registry, ctx))

    case 'Extended.List':
      return List({ space: a2uiComp.space })
        .listDirection(mapDirection(a2uiComp.styles?.listDirection))
        .scrollBar(mapScrollBar(a2uiComp.styles?.scrollBar))
        .children(
          isTemplate(a2uiComp.children)
            ? LazyForEach(a2uiComp.children.path, item => mapComponent(a2uiComp.children.componentId, ...))
            : mapChildren(a2uiComp.children, registry, ctx)
        )

    // 静态组件 — 直接映射
    case 'Extended.Text':
      return Text(evaluateExpression(a2uiComp.content, ctx))
        .fontSize(evaluateExpression(a2uiComp.styles?.fontSize, ctx))
        .fontWeight(a2uiComp.styles?.fontWeight)
        .textAlign(mapTextAlign(a2uiComp.styles?.textAlign))

    // ... 其他组件映射
  }
}
```

### 5.3 表达式求值关键实现

```typescript
function evaluateExpression(raw: string | undefined, ctx: ReactiveContext): any {
  if (!raw) return undefined
  if (!isExpression(raw)) return raw  // 非表达式直接返回原值

  const expr = stripBraces(raw)       // 去掉 {{ }}
  const ast = parse(expr)             // EBNF 文法解析
  const deps = extractDependencies(ast) // 提取依赖变量
  registerDependencies(exprId, deps)  // 注册依赖追踪

  return evaluate(ast, {
    $__WindowSize: ctx.windowSize,
    $__WidthBreakpoint: ctx.windowBreakpoint,
    $__ColorMode: ctx.colorMode,
    $__DataModel: ctx.dataModel,
    $index: ctx.loopVars.get('$index'),
    $item: ctx.loopVars.get('$item'),
  })
}
```

---

## 六、LLM 生成多设备自适应 DSL 的 Skill 设计

为了让 LLM 能够生成合理利用上述多设备自适应能力的 A2UI DSL，需要设计一个指导 Skill。

### 6.1 Skill 核心指导原则

**原则 1：优先使用布局自适应能力，而非条件渲染**
- 能用 `layoutWeight` 解决的不写 `Extended.If`
- 能用 `justifyContent: "spaceBetween"` 解决的不写多套布局
- 条件渲染（`Extended.If`）仅用于需要替换整个布局子树的场景

**原则 2：断点枚举优先于像素值**
- 推荐 `$__WidthBreakpoint == 'sm'` 而非 `$__WindowSize.width < 768`
- 断点枚举语义清晰、无魔数、LLM 亲和性高（0-shot 90%+）
- 仅在需要非标准断点阈值时使用像素值比较

**原则 3：使用链式三元表达式处理多断点属性**
```json
// 小屏14fp、平板18fp、桌面24fp
"fontSize": "{{ $__WidthBreakpoint == 'sm' ? 14 : $__WidthBreakpoint == 'md' ? 18 : 24 }}"

// 而非三个 Extended.If 组件
```

**原则 4：利用 Grid 的 columnsTemplate 而非多个 If 分支**
```json
// 一个组件解决
"columnsTemplate": "{{ $__WindowSize.width < 600 ? '1fr 1fr' : $__WindowSize.width < 900 ? '1fr 1fr 1fr' : '1fr 1fr 1fr 1fr' }}"

// 而非三个 Grid 放在三个 If 分支中
```

### 6.2 多设备适配决策树

```
需要多设备适配？
  │
  ├── 仅属性值变化（字号、间距、颜色）？
  │     → 使用响应式表达式: "fontSize": "{{ $__WidthBreakpoint == 'sm' ? 14 : 18 }}"
  │
  ├── 仅布局方向/排列方式变化？
  │     → 如果是 List 方向，使用 listDirection 表达式
  │     → 如果是 Grid 列数，使用 columnsTemplate 表达式
  │     → 如果是 Row/Column 切换，使用 Extended.If
  │
  ├── 需要显示/隐藏某个区域？
  │     → 使用 Extended.If + 断点条件: "condition": "{{ $__WidthBreakpoint == 'sm' }}"
  │
  └── 需要完全不同的布局结构？
        → 使用 Extended.If 选择不同的组件子树
```

### 6.3 常见场景的 DSL 模式

**场景 1：响应式网格**（最推荐的模式）
```json
{
  "id": "grid",
  "component": "Extended.Grid",
  "children": ["p1", "p2", "p3", "p4", "p5", "p6"],
  "styles": {
    "columnsTemplate": "{{ $__WindowSize.width < 600 ? '1fr 1fr' : $__WindowSize.width < 900 ? '1fr 1fr 1fr' : '1fr 1fr 1fr 1fr' }}",
    "columnsGap": 16,
    "rowsGap": 16
  }
}
```

**场景 2：导航栏切换**（需要不同的组件结构）
```json
{"id": "nav", "component": "Extended.If", "condition": "{{ $__WidthBreakpoint == 'sm' }}", "childrenIf": ["mobileNav"], "childrenElse": ["desktopNav"]},
{"id": "mobileNav", "component": "Extended.Row", "children": ["menuBtn", "title"], "styles": {"justifyContent": "spaceBetween", "padding": 12}},
{"id": "desktopNav", "component": "Extended.Row", "children": ["logo", "navLinks", "searchBtn"], "styles": {"justifyContent": "spaceBetween", "padding": "16 24"}}
```

**场景 3：单列/双列切换**（布局结构变化）
```json
{"id": "content", "component": "Extended.If", "condition": "{{ $__WindowSize.width >= 768 }}", "childrenIf": ["twoCol"], "childrenElse": ["oneCol"]},
{"id": "twoCol", "component": "Extended.Row", "children": ["main", "side"]},
{"id": "oneCol", "component": "Extended.Column", "children": ["main"]}
```

**场景 4：响应式属性**（仅属性值变化，结构不变）
```json
{
  "id": "title",
  "component": "Extended.Text",
  "content": "{{ $__DataModel.title }}",
  "styles": {
    "fontSize": "{{ $__WidthBreakpoint == 'sm' ? 20 : $__WidthBreakpoint == 'md' ? 24 : 32 }}",
    "padding": "{{ $__WidthBreakpoint == 'sm' ? 8 : 16 }}"
  }
}
```

---

## 七、与协议评价体系的关系

本架构设计基于 `eval/design-points/` 下 22 个设计点的量化评估结论，关键决策均有数据支撑：

| 架构决策 | 评估依据 | MA 评分 |
|---------|---------|---------|
| `Extended.If` 作为条件渲染方案 | `conditional-rendering/` #6 | DS 98.5% + GLM 90.4% = A+ |
| 断点枚举 `$__WidthBreakpoint` 优先 | `responsive-breakpoint/` #21 | DS 98.7% + GLM 96.7% = A+ |
| `$__WindowSize.width` 数值比较共存 | `responsive-breakpoint/` #21 | DS 98.0% + GLM 97.7% = A+ |
| `{{ }}` 表达式包装语法 | `expression-function/` #2 | 双模型 97-98% A+ |
| unified-name + catalog 隔离组件命名 | `component-naming/` #4 | 双模型 99.6% A+ (推荐 unified-name) |
| styles 独立样式对象 | `style-organization/` #5 | 双模型 99-100% A+ |
| dot-path `$__DataModel.xxx` 数据访问 | `data-model-access/` #7 | 双模型 98% A+ |
| `layoutWeight` 弹性布局 | `style-value-type/` #10 延伸 | 列入混合值类型方案 |

---

## 八、当前实现与架构设计的差距分析

> 基于 `~/code/A2UIRender/genui`（`@ohos/genui` v1.0.0）代码库的全面审查。

### 8.1 两套 Catalog 的定位

A2UI Renderer 需要处理两套不同的组件 Catalog，它们分属不同的协议定义和 Schema：

```
Catalog A: A2UI v0.9 原生协议 (basic_catalog.json)
  ├── 组件名: "Text", "Button", "Row", "Column", "List", "Image", ...
  ├── 数据绑定: {"path": "/user/name"}  JSON Pointer
  ├── 函数调用: {"call": "formatDate", "args": {...}}
  └── 状态: ✅ 已实现（当前 genui 代码库）

Catalog B: 鸿蒙 A2UI 扩展协议 (HarmonyOS extended catalog)
  ├── 组件名: "Extended.Text", "Extended.Button", "Extended.Row", ...
  ├── 数据绑定: {{ $__DataModel.user.name }}  表达式语法
  ├── 响应式变量: $__WidthBreakpoint, $__WindowSize, $__ColorMode
  ├── 条件渲染: Extended.If
  └── 状态: ❌ 未实现（本文档设计的架构目标）
```

**当前 genui 实现的是 Catalog A（A2UI 原生协议组件），Catalog B（鸿蒙 A2UI 扩展协议组件）尚未实现。两套 Catalog 的组件映射到 ArkUI 时，都需要考虑多设备自适应问题。**

### 8.2 当前实现总览

当前 genui 模块是一个 **C++ 原生渲染 + ArkTS 调度** 的混合架构 HAR 包：

- **C++ 层**：负责实际的 ArkUI 节点创建和属性设置（通过 NAPI），包括组件工厂（`NativeComponentFactory`）、数据模型（`DataModel`）、绑定引擎（`BindingEngine`）、函数注册表
- **ArkTS 层**：负责消息调度、Schema 校验（`SchemaValidator`）、Catalog 管理（`Catalog` + `CatalogItem`）、自定义组件桥接

`NativeComponentFactory` 的组件注册表（`NativeComponentFactory.cpp`）：
```cpp
{"Text",      []() { return std::make_shared<TextComponent>(); }},
{"Button",    []() { return std::make_shared<ButtonComponent>(); }},
{"Row",       []() { return std::make_shared<RowComponent>(); }},
{"Column",    []() { return std::make_shared<ColumnComponent>(); }},
{"List",      []() { return std::make_shared<ListComponent>(); }},
{"Image",     []() { return std::make_shared<ImageComponent>(); }},
{"TextField", []() { return std::make_shared<TextFieldComponent>(); }},
{"Slider",    []() { return std::make_shared<SliderComponent>(); }},
{"CheckBox",  []() { return std::make_shared<CheckboxComponent>(); }},
{"Card",      []() { return std::make_shared<CardComponent>(); }}
```

这些都是 **A2UI 原生协议（Catalog A）** 的组件，组件名无 `Extended.` 前缀，数据绑定使用 `{path: "..."}` JSON Pointer 格式。

### 8.3 Catalog A（A2UI 原生协议组件）的多设备自适应差距

这 10 个已实现的组件映射到 ArkUI 时，**同样需要考虑多设备自适应**。以下是每个组件的一多能力现状和差距：

#### 8.3.1 布局容器组件（Row / Column / List）

| 组件 | ArkUI 节点 | 已实现的布局能力 | 多设备自适应差距 |
|------|-----------|----------------|-----------------|
| Row | `NODE_ROW` | justifyContent(start/center/end/spaceAround/spaceBetween/spaceEvenly), alignItems(start/center/end) | **① stretch 对齐不支持**（代码明确标记为不支持）**② 缺少 constraintSize**（minWidth/maxWidth），无法控制压缩范围 |
| Column | `NODE_COLUMN` | 同上 | 同上 |
| List | `NODE_LIST` | direction(horizontal/vertical), align(start/center/end/stretch) | **① 缺少 lanes 属性**，无法在不同断点下自动调整列数 **② 缺少 listDirection 响应式切换能力** |

**Row/Column 通用属性已实现**：`layoutWeight`（→ `NODE_LAYOUT_WEIGHT`）、`widthPercent`/`heightPercent`（→ `NODE_WIDTH_PERCENT`/`NODE_HEIGHT_PERCENT`）、`padding`（四向）、`margin`（四向）、`borderRadius`。

**关键缺失**：
- `alignItems: "stretch"` — ArkUI 中 Row 的 `NODE_ROW_ALIGN_ITEMS` 和 Column 的 `NODE_COLUMN_ALIGN_ITEMS` 均未处理 stretch 枚举值。这意味着子组件无法沿交叉轴拉伸填充，这是 CSS Flexbox 中最常用的自适应模式之一
- `constraintSize` — 缺少 `{minWidth, maxWidth}` / `{minHeight, maxHeight}` 约束，组件无法在拉伸的同时设置尺寸边界
- `wrapContent` / `matchParent` — 当前通过 width/height 百分比隐式控制尺寸策略，未定义为显式的自适应枚举

#### 8.3.2 静态展示组件（Text / Button / Image / TextField / Slider / CheckBox / Card）

| 组件 | 已实现的多态能力 | 多设备自适应差距 |
|------|----------------|-----------------|
| Text | variant(h1-h5/caption/body) 预设字号阶梯 | **① 无动态 fontSize** — 字体大小无法基于断点或窗口宽度动态变化（如 `$__WidthBreakpoint == 'sm' ? 14 : 18`）**② 无 maxLines/textOverflow** — 不同宽度下文本截断行为未定义 |
| Button | variant(default/primary/borderless) 预设样式，action + checks | **① 按钮尺寸固定** — 无法基于设备形态自动调整高度/内边距 **② 无 enabled 表达式绑定** — 无法根据 DataModel 动态控制可用态 |
| TextField | variant(shortText/number/obscured/longText)，复合节点(Label+Input+Error) | **① 双向绑定仅支持 DataModel path** — 无法与 `{{ }}` 表达式变量联动 **② 键盘类型未暴露为属性** |
| Image | variant(icon/avatar/smallFeature/mediumFeature/largeFeature/header) 6 种预设尺寸，fit | **① 无 srcset / 多分辨率图片选择** **② 缺少 objectFit 细粒度控制**（当前仅 fit 属性） |
| Slider | 复合节点(Text+Slider)，min/max/value 支持 DataBinding | — 基本能力完备，多设备自适应依赖父容器布局 |
| CheckBox | 复合节点(Text+Checkbox)，label/value 支持 DataBinding | — 同上 |
| Card | 默认样式(阴影/圆角/边框/内边距)，width/height | **① 缺少 elevation / 阴影强度随设备调整** **② 缺少不同断点下的内边距预设** |

### 8.4 Catalog B（鸿蒙 A2UI 扩展协议组件）的实现状态

Catalog B 是完全新建的组件体系，目前**没有任何实现**。需要在 Renderer 中新增以下内容：

#### 8.4.1 新增布局组件（阻塞多设备自适应的核心）

| 组件 | 对应 ArkUI 节点 | 多设备自适应角色 | 优先级 |
|------|----------------|-----------------|--------|
| `Extended.Stack` | `NODE_STACK` | 叠放布局 — 徽标、浮动按钮、图片叠加、前后层切换 | **P0** |
| `Extended.Grid` | `NODE_GRID` | 动态网格 — columnsTemplate 表达式根据断点调整列数（如 `"1fr 1fr"` → `"1fr 1fr 1fr 1fr"`） | **P0** |
| `Extended.GridRow` | `NODE_GRID_ROW` | 断点自适应网格 — GridCol span 随断点自动变化，onBreakpointChange 联动表达式系统 | **P0** |

**说明**：Grid 和 GridRow 是 ArkUI 断点自适应布局的核心组件。缺少它们意味着 Renderer 完全无法利用 ArkUI 的断点感知网格能力。这是 Catalog B 中阻塞多设备自适应的最高优先级项。

#### 8.4.2 新增交互组件

| 组件 | 对应 ArkUI 组件 | 多态说明 | 优先级 |
|------|----------------|---------|--------|
| `Extended.Toggle` | `Toggle` | 开关组件，支持 Checkbox/Button/Switch 三种样式，不同设备可选用不同样式 | P1 |
| `Extended.Progress` | `Progress` | 进度条，支持线性/环形/胶囊三种样式 | P1 |
| `Extended.Radio` | `Radio` + `RadioGroup` | 单选框，分组互斥，不同设备上点击区域自动适配 | P1 |
| `Extended.CheckboxGroup` | `CheckboxGroup` | 多选框群组，全选/不全选联动 | P1 |

#### 8.4.3 已在 Catalog A 中实现、需要在 Catalog B 中新增对应版本的组件

这些组件在 Catalog A 中已有 A2UI 原生版本，但 Catalog B 需要新增鸿蒙扩展版本，差异在于：
- 命名加 `Extended.` 前缀
- 属性体系不同（如 `Extended.Text.content` vs A2UI `Text.text`）
- 支持 `styles` 对象
- 支持 `{{ }}` 表达式
- 支持 `listeners` 事件系统

| Catalog A (已实现) | Catalog B (未实现) | 属性差异 |
|-------------------|-------------------|---------|
| `Text` | `Extended.Text` | `text` → `content`，新增 styles（fontSize/fontWeight/fontColor/textAlign/maxLines/textOverflow/minFontScale/maxFontScale） |
| `Button` | `Extended.Button` | `child`(引用子组件ID) → `label`(直接字符串)，新增 styles + enabled 表达式 + listeners |
| `TextField` | `Extended.TextInput` | 组件名变化，`value` → `text`，新增 placeholder/maxLength + onChange 事件 |
| `Image` | `Extended.Image` | `url` → `src`，新增 styles + listeners |
| `Row` | `Extended.Row` | 新增 styles（justifyContent/alignItems/layoutWeight/constraintSize）+ 模板渲染（indexVar/itemVar） |
| `Column` | `Extended.Column` | 同上 |
| `List` | `Extended.List` | 新增 styles（listDirection/scrollBar）+ 模板渲染（componentId/path/indexVar/itemVar） |
| `CheckBox` | `Extended.Checkbox` | 命名差异（驼峰 → 首字母大写其余小写），新增 group/select + onChange 事件 |
| `Card` | `Extended.Card` | `child`(引用子组件ID) → `children`(数组)，新增 styles |

#### 8.4.4 新增协议级组件

| 组件 | 类型 | 说明 | 优先级 |
|------|------|------|--------|
| `Extended.If` | 条件渲染元组件 | 根据 condition 表达式选择 childrenIf/childrenElse 分支，是实现不同设备上组件树结构切换的核心 | **P0** |
| `Extended.Divider` | 展示组件 | 已在 Catalog A 中通过 ETS 自定义组件（`CustomDivider`）部分实现，需在 Catalog B 中以原生 C++ 实现 | P2 |
| `Extended.Icon` | 展示组件 | 已在 Catalog A 中通过 ETS 自定义组件（`CustomIcon`）部分实现，需在 Catalog B 中以原生 C++ 实现 | P2 |

### 8.5 表达式系统差距

这是 Catalog B 与 Catalog A 之间**最大的协议级差异**。

| 能力 | Catalog B 设计（本文架构） | Catalog A 当前实现 | 差距 |
|------|--------------------------|-------------------|------|
| 数据绑定语法 | `{{ expr }}` 表达式 | `{"path": "/user/name"}` JSON Pointer | **完全不同** |
| 运算符支持 | 完整运算符：算术/比较/逻辑/三元/成员访问 | 无运算符，仅路径读取 + 函数调用 | **完全缺失** |
| 表达式求值引擎 | EBNF 文法解析 + AST 求值 | `DataBinding` + `FunctionCall` 显式 JSON 格式 | **需新建** |
| 变量体系 | `$__DataModel`, `$__WindowSize`, `$__WidthBreakpoint`, `$__ColorMode`, `$index`, `$item`, `$handlerResult` | 仅 DataModel 路径（`/path/to/field`）+ 函数返回值 | **大部分缺失** |
| 依赖追踪 | 表达式 → 依赖变量 → 自动重求值 | `BindingEngine` 仅追踪 path → 组件属性 | **需扩展** |
| 模板字符串 | `` {{ `Hello, ${$name}` }} `` | `formatString` 函数调用 | **Catalog B 新增能力** |
| 内置函数 | `format()`, `size()` | `formatDate`, `formatNumber`, `formatCurrency`, `formatString`, `pluralize`, `and`, `or`, `not`, `openUrl` 等 | 函数集合不同，Catalog B 需独立定义 |

**核心矛盾**：Catalog A 的数据绑定是 `DynamicValue` 类型（`{path: "..."}` 或 `{call: "..."}` 二选一），Catalog B 使用 `{{ }}` 模板语法。这是两种不同的数据绑定范式。Renderer 需要同时支持两种范式——Catalog A 的组件使用 `{path}` 绑定，Catalog B 的组件使用 `{{ }}` 表达式。

### 8.6 响应式系统差距

响应式系统是 Catalog B 独有的能力，Catalog A 不具备。

| 能力 | 所属 Catalog | 当前状态 | 差距 |
|------|-------------|---------|------|
| 断点系统 xs/sm/md/lg/xl | Catalog B | 无 | **完全缺失** |
| `$__WidthBreakpoint` 变量 | Catalog B | 无 | **完全缺失** |
| `$__WindowSize {width, height}` 变量 | Catalog B | `viewportWidthVp_`/`viewportHeightVp_` 仅用于根节点约束 | **已有基础设施，需暴露为变量** |
| `$__ColorMode` 变量 | Catalog B | 无 | **完全缺失** |
| 响应式更新链路 | Catalog B | `BindingEngine` 仅在 DataModel 变化时通知绑定组件 | **链路不完整** |
| GridRow onBreakpointChange | Catalog B | 无 GridRow 组件 | **完全缺失** |

**当前已有的基础设施**（可被 Catalog B 复用）：
- `SurfaceSlot::SetViewportSize()` 已接收窗口尺寸变化
- `UIRendererComponent.ets` 已通过 `onSizeChange` 事件驱动视口更新
- `BindingEngine` 已有数据变更通知机制，可扩展为通用的变量依赖追踪

### 8.7 条件渲染差距

`Extended.If` 是 Catalog B 独有的元组件类型。

| 能力 | 当前状态 | 差距 |
|------|---------|------|
| `Extended.If` 元组件 | 无 | **完全缺失 — 需在 SurfaceSlot 描述符处理流程中新增分支选择逻辑** |
| 条件表达式求值 | 无 | **依赖 Catalog B 的表达式系统** |
| 响应式分支切换 | 无 | **条件变量变化时需要销毁/重建子树** |

**影响**：没有 `Extended.If`，Catalog B 无法实现不同设备上的组件树结构切换（如手机汉堡菜单导航 vs 平板完整顶栏导航）。

### 8.8 差距汇总

```
                    Catalog A (A2UI v0.9)          Catalog B (鸿蒙 A2UI 扩展)
                    ════════════════════          ══════════════════════════
实现状态              ✅ 10个组件已实现              ❌ 完全未实现

布局容器              Row, Column, List             Extended.Row, Extended.Column
                                                    Extended.List, Extended.Stack
                                                    Extended.Grid, Extended.GridRow

静态组件              Text, Button, Image           对应 Extended.* 版本
                     TextField, Slider,             + Extended.Toggle, Extended.Progress
                     CheckBox, Card                 + Extended.Radio, Extended.CheckboxGroup

数据绑定              {path: "/..."}                {{ expr }}
                      {call: "func", args: {...}}   包括运算符、变量、函数

多设备自适应能力
  ├── Flex 布局       部分实现（缺 stretch/          需在 Extended.* 版本中完整实现
  │                   constraintSize）              并增加 wrapContent/matchParent
  ├── 断点系统         无                            需新建
  ├── 响应式变量       无                            需新建
  ├── 条件渲染         无                            需新建 Extended.If
  ├── 动态网格         无                            需新建 Extended.Grid/GridRow
  └── 深色模式         无                            需新建 $__ColorMode

可复用的基础设施
  ├── DataModel       ✅ 路径读写 + 订阅通知          可直接复用
  ├── BindingEngine   ✅ 数据变更 → 组件属性更新      可扩展为变量依赖追踪
  ├── ViewportSize    ✅ 窗口尺寸接收                需暴露为表达式变量
  ├── Catalog 系统    ✅ 组件注册 + Schema 校验       需新增 Extended.* 组件注册
  └── 自定义组件桥     ✅ CustomComponentFactory      可直接复用
```

### 8.9 推进策略

两套 Catalog 的工作可以并行推进：

**路径 1 — 补齐 Catalog A 的多设备自适应能力**（在现有代码上修改）：
1. Row/Column 增加 `stretch` 对齐支持
2. Row/Column 增加 `constraintSize` 属性
3. List 增加 `lanes` 属性（不同断点下列数自适应）

**路径 2 — 新建 Catalog B**（全新代码）：
1. 新建 `NativeComponentFactory` 中 `Extended.*` 组件的注册 + C++ 实现
2. 新建 Expression Evaluator 子系统（`{{ }}` 解析 + AST 求值）
3. 新建 Responsive Engine 子系统（断点检测 + 变量更新 + 依赖追踪）
4. 新建 Extended.If 条件渲染处理（SurfaceSlot 描述符处理流程扩展）
5. 新建 Catalog B 的 Schema 定义文件

**建议优先顺序**：先推进路径 2 的 P0 项（`Extended.Grid`/`Extended.GridRow`/`Extended.Stack`/`Extended.If` + 响应式变量），因为这是鸿蒙 A2UI 扩展协议多设备自适应的核心差异化能力。路径 1 的改进可以作为 Catalog A 的质量提升并行推进。

---

## 九、后续工作

后续工作按两条路径组织——**路径 1** 补齐 Catalog A（A2UI 原生协议组件）的多设备自适应短板，**路径 2** 新建 Catalog B（鸿蒙 A2UI 扩展协议组件）。

### 9.1 P0 — 阻塞多设备自适应的关键项

| 序号 | 路径 | 工作项 | 依赖 | 涉及模块 |
|------|------|--------|------|---------|
| 1 | **路径 2** | **实现 `Extended.Grid` 组件** — C++ `NODE_GRID` + columnsTemplate + rowsGap/columnsGap | — | `components/` 新建 |
| 2 | **路径 2** | **实现 `Extended.GridRow` 组件** — C++ `NODE_GRID_ROW` + breakpoints + onBreakpointChange 联动表达式 | — | `components/` 新建 |
| 3 | **路径 2** | **实现 `Extended.Stack` 组件** — C++ `NODE_STACK` + alignContent | — | `components/` 新建 |
| 4 | **路径 2** | **实现 `Extended.If` 条件渲染** — SurfaceSlot 描述符处理流程增加元组件分支选择 + 响应式子树切换 | 8 | SurfaceSlot 流程扩展 |
| 5 | **路径 2** | **新建 Responsive Engine** — 断点检测（xs/sm/md/lg/xl）+ `$__WidthBreakpoint` / `$__WindowSize` / `$__ColorMode` 变量 | — | 新建 `responsive/` 模块 |
| 6 | **路径 1** | **补齐 Row/Column alignItems: stretch** — `NODE_ROW_ALIGN_ITEMS` / `NODE_COLUMN_ALIGN_ITEMS` 增加 stretch 枚举处理 | — | RowComponent / ColumnComponent |
| 7 | **路径 1** | **补齐 Row/Column constraintSize** — `NODE_CONSTRAINT_SIZE` {minWidth, maxWidth, minHeight, maxHeight} | — | RowComponent / ColumnComponent |

### 9.2 P1 — 提升多设备自适应完整度

| 序号 | 路径 | 工作项 | 依赖 | 涉及模块 |
|------|------|--------|------|---------|
| 8 | **路径 2** | **新建 Expression Evaluator** — `{{ }}` EBNF 解析 + AST 求值 + 运算符（算术/比较/逻辑/三元/成员访问）+ 变量作用域 | — | 新建 `expression/` 模块 |
| 9 | **路径 2** | **扩展 BindingEngine 为变量依赖追踪引擎** — 表达式 → 依赖变量图 → 批量重求值 → ArkUI 属性更新 | 5, 8 | BindingEngine 重构 |
| 10 | **路径 2** | **实现响应式更新链路** — 窗口变化 → 变量更新 → 依赖追踪 → 表达式重求值 → 属性更新 → Extended.If 分支切换 | 5, 9 | ResponsiveEngine |
| 11 | **路径 2** | **新建 Catalog B 组件注册** — `NativeComponentFactory` 增加 `Extended.*` 组件类型 + Schema 定义文件 | — | NativeComponentFactory + schema/ |
| 12 | **路径 2** | **实现 Catalog B 交互组件** — Extended.Toggle, Extended.Progress, Extended.Radio, Extended.CheckboxGroup | 11 | `components/` 新建 |
| 13 | **路径 2** | **实现 Catalog B 静态组件** — Extended.Text, Extended.Button, Extended.TextInput, Extended.Image, Extended.Row, Extended.Column, Extended.List, Extended.Checkbox, Extended.Card 的鸿蒙扩展版本 | 11 | `components/` 新建 |
| 14 | **路径 1** | **List 增加 lanes 属性** — 不同断点下列数自适应 | — | ListComponent |

### 9.3 P2 — 补充完善

| 序号 | 路径 | 工作项 | 依赖 | 涉及模块 |
|------|------|--------|------|---------|
| 15 | **路径 2** | GridRow 断点 span/offset DSL 协议设计 + 亲和性评估 | 2 | 协议设计 + affinity-design |
| 16 | — | 多设备测试用例补充（基于第四章自适应策略矩阵） | 1-14 | eval/test-cases/ |
| 17 | — | Skill 集成 — 第六节指导原则实现为 Prompt 或独立 skill 文件 | — | eval/prompts/ |
| 18 | **路径 2** | Extended.Divider / Extended.Icon 从 ETS 自定义组件迁移到 Catalog B C++ 原生实现 | 11 | `components/` |
| 19 | — | 端到端验证 — Catalog A + Catalog B 在真机/模拟器多设备形态 UI 渲染 | 1-14 | 集成测试 |

### 9.4 实施建议

1. **两条路径可并行推进**：路径 1（Catalog A 补齐）改动范围小、风险低，可快速提升现有 A2UI 原生协议的多设备自适应能力；路径 2（Catalog B 新建）是全新功能，需要独立的设计和开发周期
2. **路径 2 内部依赖顺序**：先建 Responsive Engine（#5）→ 再建 Expression Evaluator（#8）→ 再建组件（Grid/GridRow/Stack + If + 静态组件），因为组件依赖表达式和响应式变量
3. **Catalog 共存策略**：`NativeComponentFactory` 需要同时注册两套组件名（如 `"Text"` 和 `"Extended.Text"` 指向不同实现），通过 `catalogId` 区分消息属于哪个 Catalog，确保 Catalog A 的现有功能不受 Catalog B 开发影响
4. **genui-form (ArkTS 渲染器) 可先行验证**：`docs/architecture-render-backend.md` 已规划的 genui-form 纯 ArkTS 渲染器，可以在 ETS 端快速验证表达式引擎和响应式系统，成熟后再下沉到 C++ 层
5. **两套 Catalog 的共性基础设施应统一**：`DataModel`、`BindingEngine`、`ViewportSize` 传播、`SchemaValidator` 等对两套 Catalog 是通用的，应提取为共享模块，避免重复实现

---

## 附录 A：A2UI 协议多设备适配能力速查

| 能力 | 协议机制 | 协议章节 |
|------|---------|---------|
| 长度单位 | vp / fp / % | 3.6.1 |
| 自适应尺寸策略 | wrapContent / matchParent / fixAtIdealSize | 3.6.1 |
| 断点系统 | xs/sm/md/lg/xl，$__WidthBreakpoint | 3.6.2 |
| 窗口尺寸 | $__WindowSize { width, height } | 3.6.2 |
| 深色模式 | $__ColorMode "light"/"dark" | 4.4.4 |
| 条件渲染 | Extended.If { condition, childrenIf, childrenElse } | 3.6.3 |
| 响应式表达式 | `{{ expr }}` + 自动重新求值 | 3.6.2 / 4.4.7 |
| Flex 布局 | Row/Column + justifyContent/alignItems/layoutWeight | 3.6.1 |
| 动态网格 | Grid + columnsTemplate 表达式 | 3.6.4 综合示例 |
| 断点感知布局 | GridRow + onBreakpointChange | 4.1.2 |

## 附录 B：ArkUI 一多能力与 A2UI 映射速查

| ArkUI 一多能力 | A2UI 协议表达 | Renderer 映射 |
|---------------|-------------|--------------|
| `layoutWeight` | `styles.layoutWeight: 1` | `.layoutWeight(1)` |
| `constraintSize` | `styles.constraintSize: {minWidth, maxWidth}` | `.constraintSize(...)` |
| `justifyContent` | `styles.justifyContent: "spaceBetween"` | `FlexAlign.SpaceBetween` |
| `alignItems` | `styles.alignItems: "center"` | `alignItems: VerticalAlign.Center` |
| `BreakpointSystem` | `$__WidthBreakpoint` 变量 | `onBreakpointChange` 回调 → 变量更新 |
| `GridRow.columns` | GridRow + GridCol span | 协议待扩展 |
| `Grid.columnsTemplate` | `styles.columnsTemplate: "1fr 1fr 1fr"` | `columnsTemplate('1fr 1fr 1fr')` |
| `List.lanes` | 协议待扩展 | 可通过 `listDirection` 间接控制 |
| `mediaQuery` | `$__WindowSize.width` 表达式 | `onAreaChange` 回调 → 变量更新 |
