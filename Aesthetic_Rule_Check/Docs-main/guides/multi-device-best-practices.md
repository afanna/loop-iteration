# 多设备自适应最佳实践

端到端指导 LLM 生成多设备自适应 UI 的策略、Prompt 构建和 DSL 模式。

> **前置阅读：** [LLM 集成](integrating-llm.md) | [多设备自适应概念](../concepts/multi-device-adaptation.md) | [表达式实战](working-with-expressions.md)

---

## 为什么 LLM 生成需要多设备适配

鸿蒙设备的屏幕尺寸跨度极大——从手机的 320vp 到折叠屏/平板的 1400vp+。如果 LLM 生成的 DSL 只考虑单一设备尺寸，用户在小屏或大屏设备上可能会得到错乱的布局。

GenUI 的自适应能力分为三层，每层都可以由 LLM 利用：

| 层级 | 机制 | LLM 利用方式 |
|------|------|-------------|
| 单位系统 | vp/fp/% + matchParent/wrapContent | 默认使用；matchParent 仅在父组件对应宽/高为定值时使用 |
| 响应式表达式 | $__widthBreakpoint 三元表达式 | Prompt 引导 LLM 使用断点变量 |
| If 条件渲染 | [If](../reference/extended-components/if.md) 组件 + childrenIf/childrenElse | Prompt 引导 LLM 为不同断点生成不同布局树 |

---

## 三种 LLM 生成策略

基于以上三层能力，LLM 有三种集成策略，从简单到通用递进。

### 策略 A：定向生成

端侧检测当前设备的断点信息，将其注入 Prompt，LLM 仅为当前设备生成专属 DSL。

```
端侧                                              云侧
───                                              ───
① 检测当前设备断点 → "sm"
② 构建定向 Prompt:
   systemPrompt + breakpoint + userQuery
       ↓
③ HTTP SSE 请求 ───────────────────────────►
                                               ④ LLM 生成单设备 DSL（无 If、无断点表达式）
       ◄─────────────────────────────── ⑤ 返回 DSL
⑥ handleMessage() → 渲染
```

**优点：** Token 量最低、UI 针对当前设备精准优化、LLM 生成成功率高
**缺点：** 断点变化时依赖基础自适应（自动拉伸），无断点级布局切换
**适用场景：** 已知目标设备类型、Token 预算有限

```ts
const catalog = CatalogFactory.extended()
const basePrompt = PromptBuilder.buildInstruction(catalog, 'v0.9')
const breakpoint = this.getCurrentBreakpoint()

this.systemPrompt = basePrompt + '\n\n' +
  '## 设备信息\n\n' +
  `当前设备窗口断点为 "${breakpoint}"。` +
  '请仅针对该断点生成 UI，无需使用 If 条件渲染或 $__widthBreakpoint 表达式。'
```

### 策略 B：定向生成 + 断点变化重生成

结合策略 A 的精准和自适应的灵活性：初始用策略 A 生成当前断点的 DSL，同时监听窗口变化，断点变化时自动重新调用 LLM 生成新 DSL。

```
端侧                                              云侧
───                                              ───
① 检测当前断点 → "sm"
② 构建定向 Prompt → LLM 生成 DSL → 渲染
③ 监听窗口变化
④ 断点变化 → "lg"
⑤ 用新断点重新构建 Prompt
       ↓
⑥ HTTP SSE 请求 ───────────────────────────►
                                               ⑦ LLM 生成新断点 DSL
       ◄─────────────────────────────── ⑧ 返回 DSL
⑨ handleMessage() → 渲染新布局
```

**优点：** 每次 DSL 都针对当前断点精准优化、Token 单次成本低
**缺点：** 断点变化时有短暂加载延迟、需额外实现断点监听逻辑
**适用场景：** 多设备但 Token 敏感、可接受短暂加载延迟

```ts
import display from '@ohos.display'

private currentBreakpoint: string = ''

aboutToAppear(): void {
  this.currentBreakpoint = this.getCurrentBreakpoint()
  this.buildPromptAndGenerate()

  display.on('change', (displayInfo) => {
    const newBp = this.calculateBreakpoint(displayInfo)
    if (newBp !== this.currentBreakpoint) {
      this.currentBreakpoint = newBp
      this.buildPromptAndGenerate()
    }
  })
}

private buildPromptAndGenerate(): void {
  const catalog = CatalogFactory.extended()
  const basePrompt = PromptBuilder.buildInstruction(catalog, 'v0.9')

  this.systemPrompt = basePrompt + '\n\n' +
    `## 设备信息\n\n当前设备窗口断点为 "${this.currentBreakpoint}"。` +
    '请仅针对该断点生成 UI，无需使用 If 条件渲染或 $__widthBreakpoint 表达式。'

  this.messages = [{ role: 'system', content: this.systemPrompt }]
}
```

### 策略 C：通用自适应 DSL 生成

Prompt 包含完整的断点体系说明，LLM 一次生成包含 If 组件和断点表达式的通用 DSL，在所有设备上均可正常渲染。

```
端侧                                              云侧
───                                              ───
① PromptBuilder.buildInstruction()
   （已自动包含 $__widthBreakpoint
    和 If 组件的 Schema）
② 追加自适应增量指令
③ 组装 messages = [systemPrompt, userQuery]
       ↓
④ HTTP SSE 请求 ───────────────────────────►
                                               ⑤ LLM 生成通用自适应 DSL
                                                  （含 If、断点三元表达式）
       ◄─────────────────────────────── ⑥ 返回 DSL
⑦ handleMessage() → 渲染
   （所有设备同一份 DSL，自动适配）
```

**优点：** 一次生成多设备通用、断点变化时实时切换、符合"一次开发多端运行"理念
**缺点：** Token 量显著增加、LLM 生成复杂度更高、需校验 If 分支 ID 引用完整性
**适用场景：** 目标设备不确定、多设备同时使用、UI 需要响应窗口大小变化

```ts
const catalog = CatalogFactory.extended()
const basePrompt = PromptBuilder.buildInstruction(catalog, 'v0.9')

const adaptiveInstructions = [
  '',
  '## 多设备自适应要求',
  '',
  '断点定义规格：',
  '| 断点 | 宽度范围 | 典型设备形态 |',
  '|------|----------|-------------|',
  '| xs | 0-320vp | 低端机、小折叠（合屏） |',
  '| sm | 320-600vp | 直板机竖屏、小折叠（合屏） |',
  '| md | 600-840vp | 直板机横屏、两折叠（半展）、胖折叠、平板竖屏 |',
  '| lg | 840-1024vp | 两折叠（全展）、三折叠（半展）、平板横屏 |',
  '| xl | 1024vp+ | 三折叠（全展）、平板横屏、普通 PC、折叠 PC |',
  '',
  '规则：',
  '1. 布局结构差异（如单列 vs 双列）使用 If 组件，condition 引用 $__widthBreakpoint',
  '2. 属性差异（如字号、间距）使用三元表达式引用 $__widthBreakpoint',
  '3. Grid 未显式设置 columnsTemplate 时已有内置断点列数；只有需要覆盖默认列数时才生成 columnsTemplate 表达式',
  '4. 侧边栏等辅助内容在小屏隐藏（visibility 表达式），大屏显示',
  '5. 所有尺寸使用 vp/fp/% 单位，不要使用固定 px 值',
  '6. 父组件宽度为定值时可使用 matchParent；父组件宽度不确定时使用 100%、vp 或 wrapContent，避免硬编码宽度'
].join('\n')

this.systemPrompt = basePrompt + adaptiveInstructions
```

### 通用自适应 DSL 的运行场景

策略 C 生成的通用 DSL 覆盖以下典型场景，无需额外处理：

| 场景 | 触发方式 | DSL 响应 |
|------|---------|---------|
| 手机竖屏 → 横屏 | 旋转设备 | [$__widthBreakpoint](../concepts/multi-device-adaptation.md#响应式断点) 从 sm 变为 md，If 分支自动切换 |
| 折叠屏折叠 → 展开 | 折叠/展开设备 | 断点从 sm 跳到 lg，布局从单列变为多列 |
| 手机 → 平板投播 | 多设备协同 | 同一份 DSL 在平板上按 lg/xl 断点渲染 |

### 策略选择决策表

| 考量维度 | 策略 A（定向生成） | 策略 B（定向+重生成） | 策略 C（通用自适应） |
|----------|-------------------|---------------------|---------------------|
| 目标设备 | 固定单设备 | 多端但按需生成 | 不确定、多端 |
| Token 单次成本 | 最低 | 多次低（累计中等） | 一次高 |
| LLM 调用次数 | 仅首次调用 | 每次断点变化均需重新调用 | 一次生成 |
| 体验影响 | 依赖基础自适应（自动拉伸），无断点级布局切换 | 断点变化时短暂加载延迟（重新生成期间沿用旧布局） | 断点变化时实时切换布局，无感知 |
| 维护成本 | 低（DSL 简单） | 中（需额外实现断点监听逻辑） | 中（需校验 If 分支完整性） |
| 推荐场景 | 一次性展示、设备固定，且不考虑横竖屏切换 | 多设备但 Token 敏感 | 多设备/折叠屏/旋转 |

**推荐默认策略 C。** 如果应用需要支持折叠屏或响应窗口旋转，优先使用策略 C；仅在 Token 预算极度紧张且目标设备固定时使用策略 A。

---

## Prompt 构建

选定策略后，以下是每种策略对应的 Prompt 构建方法。

### 设备感知 Prompt（策略 A）

[PromptBuilder](../reference/API/prompt-builder.md#promptbuilder) 生成的 system prompt 已包含所有组件和协议的 Schema。策略 A 的关键是在此基础上追加 **设备信息约束**：

```ts
const breakpoint = this.getCurrentBreakpoint()
const breakpointHint = [
  '',
  `## 设备约束`,
  '',
  `当前设备窗口断点为 "${breakpoint}"。`,
  '',
  '请针对该断点生成 UI：',
  '- xs(0-320vp)：低端机、小折叠（合屏），极简布局，字号 12-14fp，单列',
  '- sm(320-600vp)：直板机竖屏，紧凑布局，字号 14-16fp，单列',
  '- md(600-840vp)：直板机横屏/两折叠，字号 16-18fp，可双列',
  '- lg(840-1024vp)：两折叠（全展）/平板横屏，字号 16-20fp，可多列',
  '- xl(1024vp+)：三折叠/PC，字号 18-24fp，多列+侧边栏',
  '',
  '不需要使用 If 条件渲染或 $__widthBreakpoint 表达式。直接为当前断点生成最优布局。'
].join('\n')

this.systemPrompt = basePrompt + '\n' + breakpointHint
```

### 定向 + 重生成 Prompt（策略 B）

策略 B 在策略 A 基础上增加窗口变化监听，断点变化时自动重新调用 LLM。Prompt 构建逻辑与策略 A 相同，额外需实现断点监听（见上文策略 B 代码示例）。

### 通用自适应 Prompt（策略 C）

策略 C 的关键增量指令是告诉 LLM **何时用 If、何时用表达式**：

```ts
const adaptiveInstructions = [
  '',
  '## 多设备自适应规则',
  '',
  '### 何时使用 If 条件渲染',
  '当不同断点的**布局结构不同**时（如单列 vs 双列、有侧边栏 vs 无侧边栏），使用 If 组件：',
  '',
  '```',
  '{ "component": "If",',
  '  "condition": "{{ $__widthBreakpoint == \\'xs\\' || $__widthBreakpoint == \\'sm\\' }}",',
  '  "childrenIf": ["narrowLayout"],',
  '  "childrenElse": ["wideLayout"] }',
  '```',
  '',
  '### 何时使用三元表达式',
  '当不同断点只有**属性值不同**（如字号、间距、显隐）时，使用三元表达式：',
  '',
  '```',
  '"fontSize": "{{ $__widthBreakpoint == \\'sm\\' ? 14 : 18 }}"',
  '```',
  '',
  '### 断点分组建议',
  '- 手机（xs + sm）：单列、紧凑间距、较小字号',
  '- 平板（md + lg）：双列或多列、中等间距',
  '- 桌面（xl）：多列 + 侧边栏、大间距',
  '',
  '### 注意事项',
  '- If 组件的 childrenIf 和 childrenElse 引用的组件 ID 必须在同一个 updateComponents 消息中定义',
  '- 使用 vp/fp/% 单位，不要使用无单位的纯数字作为尺寸'
].join('\n')

this.systemPrompt = basePrompt + '\n' + adaptiveInstructions
```

---

## DSL 模式速查

策略 C 的 DSL 包含 If 组件和断点表达式，其写法遵循 6 种经典模式。以下模板可作为 Few-shot 示例（少量示例提示）直接注入 Prompt，让 LLM 按相同模式生成。

### 模式 1：断点条件字号

属性差异用三元表达式，不用 If 组件。

```json
{
  "id": "title",
  "component": "Text",
  "content": "{{ $__dataModel.productName }}",
  "styles": {
    "fontSize": "{{ $__widthBreakpoint == 'xs' ? 14 : $__widthBreakpoint == 'sm' ? 18 : 24 }}",
    "fontWeight": 600,
    "textAlign": "center"
  }
}
```

**要点：** 字号使用 fp 或纯数字（默认 vp），不使用 px。

### 模式 2：小屏/大屏不同布局

布局结构不同时使用 If 组件。

```json
{
  "id": "adaptive_layout",
  "component": "If",
  "condition": "{{ $__widthBreakpoint == 'xs' || $__widthBreakpoint == 'sm' }}",
  "childrenIf": ["vertical_list"],
  "childrenElse": ["horizontal_grid"]
},
{
  "id": "vertical_list",
  "component": "Column",
  "children": ["card_1", "card_2", "card_3"],
  "styles": { "padding": "12vp" }
},
{
  "id": "horizontal_grid",
  "component": "Row",
  "children": ["card_1", "card_2", "card_3"],
  "styles": { "padding": "24vp", "space": 16 }
}
```

**要点：** vertical_list 和 horizontal_grid 中的子组件 ID（card_1 等）必须是同一批已定义的组件，If 只切换引用它们的容器。

### 模式 3：Grid 内置列数自适应

Grid 的 [columnsTemplate](../reference/extended-components/grid.md#columnstemplate) 使用表达式根据断点动态调整列数。当未显式设置 columnsTemplate 时，组件内部会根据断点自动选择默认列数：xs/sm 2 列，md 3 列，lg/xl 5 列。

```json
{
  "id": "product_grid",
  "component": "Grid",
  "children": ["p1", "p2", "p3", "p4", "p5", "p6"],
  "rowsGap": 16,
  "columnsGap": 16
}
```

**要点：** 不需要为了内置默认列数手写 $__widthBreakpoint 表达式。只有业务需要覆盖默认列数时，才显式设置 columnsTemplate；显式值会覆盖组件内部默认值。

### 模式 4：侧边栏显隐

辅助内容在小屏隐藏、大屏显示。

```json
{
  "id": "sidebar",
  "component": "Column",
  "children": ["filter_panel", "tags"],
  "styles": {
    "width": "28%",
    "visibility": "{{ $__widthBreakpoint == 'lg' || $__widthBreakpoint == 'xl' ? 'visible' : 'none' }}"
  }
}
```

**要点：** 使用 visibility: "none" 而非 "hidden"——"none" 不占布局空间，"hidden" 仍占位。

### 模式 5：间距自适应

间距随断点线性递增。

```json
{
  "id": "container",
  "component": "Column",
  "children": ["header", "content"],
  "styles": {
    "padding": "{{ $__widthBreakpoint == 'xs' ? 8 : $__widthBreakpoint == 'sm' ? 12 : 16 }}",
    "width": "100%",
    "height": "wrapContent"
  }
}
```

### 模式 6：弹性宽度布局

[双栏布局](../reference/extended-components/row.md)使用百分比宽度 + [layoutWeight](../reference/extended-components/overview.md#layoutweight)。

```json
{
  "id": "main_content",
  "component": "Column",
  "children": ["article_title", "article_body"],
  "styles": {
    "width": "70%",
    "layoutWeight": 1
  }
},
{
  "id": "sidebar",
  "component": "Column",
  "children": ["widget_list"],
  "styles": {
    "width": "28%",
    "layoutWeight": 1
  }
}
```

**要点：** 百分比宽度不设 100%，预留间距。layoutWeight 让两栏按比例分配剩余空间。

---

## 一多敏感属性速查

以上 6 种模式展示了策略 C 中常见的适配写法。以下按组件维度列出所有需要考虑一多适配的属性，帮助 LLM 在构造 DSL 时知道哪些属性需要注意使用断点表达式。

| 组件 | 一多敏感属性 | 典型适配方式 |
|------|------------|-------------|
| **Text** | styles.fontSize、styles.fontWeight、styles.padding | 小屏 14fp，大屏 20fp；三元表达式 |
| **Button** | styles.fontSize、styles.padding、label（文案长度） | 小屏短文案+小字号，大屏完整文案+大字号 |
| **TextInput** | styles.fontSize、styles.padding | 同 Text |
| **Column / Row** | styles.padding、styles.margin、styles.width、styles.height、component 本身（Column↔Row 切换） | 间距随断点递增；布局方向用 If 组件切换 |
| **Grid** | columnsTemplate、rowsGap、columnsGap | 未显式设置 columnsTemplate 时内置适配：xs/sm 2 列，md 3 列，lg/xl 5 列 |
| **List** | styles.padding，内部布局密度 | 内置适配：xs/sm 1 列，md 2 列，lg/xl 3 列 |
| **Image** | styles.width、styles.height | 小屏缩小，大屏放大；配合 visibility 在小屏隐藏 |
| **Tabs** | barPosition、vertical | 小屏底部横排，大屏侧边纵排 |
| **Select** | styles.width、styles.fontSize | 宽度和字号适配 |
| **所有容器** | styles.visibility | 辅助内容小屏 'none'，大屏 'visible'（见模式 4） |
| **所有容器** | styles.layoutWeight、styles.width（%） | 弹性宽度分配（见模式 6） |

---

## Prompt 强化规则

为了可在源头减少生成错误，避免运行时静默失败，可在策略 C 的 Prompt 中追加规则来约束 LLM 输出。

### 规则文本（可直接复制到 Prompt 中）

```
## 多设备自适应输出规范

1. 响应式断点变量名为 $__widthBreakpoint（注意双下划线和大小写），不要写成 $WindowBreakpoint 或 $breakpoint。
2. 断点值只有 5 个：xs、sm、md、lg、xl。不要使用 medium、small、large 等非标准值。
3. If 组件必须同时提供 childrenIf 和 childrenElse。缺少 childrenElse 会导致条件为 false 时渲染空白。
4. If 组件的 childrenIf 和 childrenElse 引用的组件 ID 必须在同一条 updateComponents 消息中定义。
5. 所有尺寸属性使用 vp、fp 或 % 单位（如 "16vp"、"50%"）。纯数字默认为 vp，但显式标注单位更清晰。
6. fontSize 属性的值应为数字（如 16、20），不要写成字符串 "16fp"。
7. visibility 属性用于显隐控制时，"none" 不占布局空间，"hidden" 仍占位。隐藏辅助内容用 "none"。
8. Grid 默认不需要输出 columnsTemplate；如需覆盖默认列数，columnsTemplate 使用 "1fr 1fr" 格式，不支持 repeat() 函数。
```

### 规则说明

| 规则 | LLM 常犯的错误 | 运行时表现 |
|------|---------------|-----------|
| 断点变量名 | 拼写为 $WindowBreakpoint、$__Breakpoint | 表达式求值为 undefined，三元表达式走 else 分支，不报错但布局不切换 |
| 断点值 | 使用 'medium'、'small' | 表达式永远不匹配，If 始终走 childrenElse，不报错 |
| If 双分支 | 只写 childrenIf 忘写 childrenElse | 条件为 false 时渲染空白页面 |
| If 引用 ID | childrenIf 引用的 ID 未定义 | GenUI 报 ERROR_NO_SURFACE_MATCHED，但难以定位到 If 分支问题 |
| 尺寸单位 | 使用无单位纯数字或 px | 框架接受纯数字（默认 vp），但 px 会导致不同密度屏幕显示不一致 |
| [fontSize](../reference/extended-components/text.md#fontsize) 类型 | 写成 "16fp" 字符串 | 框架回退到默认字号 |
| [visibility](../reference/extended-components/overview.md#visibility) 值 | 用 "hidden" 隐藏侧边栏 | 隐藏后仍占据布局空间，导致主内容区被挤压 |
| columnsTemplate | 使用 repeat(3, 1fr) | 解析失败，Grid 无法渲染 |

### 如果 LLM 仍然出错

完整的错误码列表和回调机制见 [故障排查](troubleshooting.md) 和 [错误码参考](../reference/errors.md#错误码说明)。

GenUI 框架的 [handleMessage()](../reference/API/surface-controller.md#handlemessage) 会在内部做结构校验（组件类型、必填属性等），并通过 [registerErrorCallback](../reference/API/surface-controller.md#registererrorcallback) 回调错误。将错误信息注入下一轮对话即可让 LLM 自行修正：

```ts
controller.registerErrorCallback((code, message) => {
  this.messages.push({
    role: 'user',
    content: `上一次输出有错误 [${code}]：${message}。请修正后重新生成。`
  })
  this.callLLM().then(dsl => {
    if (dsl) this.controller!.handleMessage(dsl)
  })
})
```

这种"错误反馈 → LLM 自修正"的模式与 [LLM 集成](integrating-llm.md) 中的错误恢复机制一致，无需在应用层额外编写校验代码。

---

## 问题排查

以上 Prompt 强化规则从源头预防 LLM 生成错误。如果运行时仍有问题，参考以下排查速查表。更通用的排查步骤见 [故障排查](troubleshooting.md)。

| 问题 | 原因 | 解决 |
|------|------|------|
| LLM 完全忽略断点变量 | Prompt 未明确要求使用 $__widthBreakpoint | 在 system prompt 末尾追加自适应增量指令（见上文 Prompt 构建章节） |
| If 组件只写了 childrenIf，没写 childrenElse | LLM 遗漏 | 追加 Prompt 强化规则第 3 条 |
| LLM 生成的 columnsTemplate 使用了 repeat() 语法 | LLM 混淆了 CSS Grid 语法 | 追加 Prompt 强化规则第 8 条，或提供 Few-shot 示例 |
| 生成的尺寸值在小屏设备上溢出 | 未考虑 xs 断点 | Prompt 中要求覆盖所有 5 个断点，或使用策略 A 针对当前设备生成 |
| Token 超限 | 通用 DSL 包含大量 If 分支 | 切换为策略 A（定向生成）或策略 B（定向+重生成），或将 UI 拆分为多个 Surface 分别生成 |
| 折叠屏展开后布局不更新 | 使用了策略 A | 折叠屏场景应使用策略 C，或在窗口大小变化时使用策略 B 自动重生成 |
| visibility: "hidden" 导致布局空白 | hidden 模式仍占据布局空间 | 追加 Prompt 强化规则第 7 条 |

---

相关指南：
→ [LLM 集成](integrating-llm.md) | → [多设备自适应概念](../concepts/multi-device-adaptation.md) | → [表达式实战](working-with-expressions.md) | → [使用扩展组件](using-extended-components.md) | → [PromptBuilder API](../reference/API/prompt-builder.md)

**即用型 Prompt 参考：** [查看所有模板](prompts/multi-device/README.md)（可作为 system prompt 参考文本）
