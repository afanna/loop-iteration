# 策略 C Prompt 参考：通用自适应 DSL 生成（完整版）

> **适用场景：** 多设备/折叠屏/旋转（推荐默认策略）
>
> 以下 --- 之间的文本可作为 system prompt 的参考内容，追加到 PromptBuilder 生成的 system prompt 之后。可根据实际场景和 Token 预算调整。

---

## 多设备自适应要求

### 断点定义规格

| 断点 | 宽度范围 | 典型设备形态 |
|------|----------|-------------|
| xs | 0-320vp | 低端机、小折叠（合屏） |
| sm | 320-600vp | 直板机竖屏、小折叠（合屏） |
| md | 600-840vp | 直板机横屏、两折叠（半展）、胖折叠、平板竖屏 |
| lg | 840-1024vp | 两折叠（全展）、三折叠（半展）、平板横屏 |
| xl | 1024vp+ | 三折叠（全展）、平板横屏、普通 PC、折叠 PC |

全局变量 $__widthBreakpoint 自动维护当前断点值（xs/sm/md/lg/xl），可在 {{ }} 表达式中使用。

### 适配规则

1. 布局结构差异（如单列 vs 双列）使用 If 组件，condition 引用 $__widthBreakpoint
2. 属性差异（如字号、间距）使用三元表达式引用 $__widthBreakpoint
3. Grid 未显式设置 columnsTemplate 时已有内置断点列数；只有需要覆盖默认列数时才生成 columnsTemplate 表达式
4. 侧边栏等辅助内容在小屏隐藏（visibility 表达式），大屏显示
5. 所有尺寸使用 vp/fp/% 单位，不要使用固定 px 值
6. 父组件宽度为定值时可使用 matchParent；父组件宽度不确定时使用 100%、vp 或 wrapContent，避免硬编码宽度

### 何时使用 If 条件渲染

当不同断点的**布局结构不同**时（如单列 vs 双列、有侧边栏 vs 无侧边栏），使用 If 组件。If 只切换引用子组件的容器，子组件 ID 必须在同一条 updateComponents 消息中定义：

```json
{
  "id": "adaptive_layout",
  "component": "If",
  "condition": "{{ $__widthBreakpoint == 'xs' || $__widthBreakpoint == 'sm' }}",
  "childrenIf": ["narrowLayout"],
  "childrenElse": ["wideLayout"]
},
{
  "id": "narrowLayout",
  "component": "Column",
  "children": ["card_1", "card_2", "card_3"],
  "styles": { "padding": "12vp" }
},
{
  "id": "wideLayout",
  "component": "Row",
  "children": ["card_1", "card_2", "card_3"],
  "styles": { "padding": "24vp", "space": 16 }
}
```

### 何时使用三元表达式

当不同断点只有**属性值不同**（如字号、间距、显隐）时，使用三元表达式：

```json
"fontSize": "{{ $__widthBreakpoint == 'sm' ? 14 : 18 }}"
```

### 断点分组建议

- 手机（xs + sm）：单列、紧凑间距、较小字号
- 平板（md + lg）：双列或多列、中等间距
- 桌面（xl）：多列 + 侧边栏、大间距

### 注意事项

- If 组件的 childrenIf 和 childrenElse 引用的组件 ID 必须在同一个 updateComponents 消息中定义
- 使用 vp/fp/% 单位，不要使用无单位的纯数字作为尺寸

## DSL 示例

### 示例 1：断点条件字号

属性差异用三元表达式，不用 If 组件：

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

字号使用 fp 或纯数字（默认 vp），不使用 px。

### 示例 2：小屏/大屏不同布局

布局结构不同时使用 If 组件：

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

vertical_list 和 horizontal_grid 中的子组件 ID（card_1 等）必须是同一批已定义的组件，If 只切换引用它们的容器。

### 示例 3：Grid 内置列数自适应

Grid 未显式设置 columnsTemplate 时，组件内部会根据断点自动选择默认列数：

```json
{
  "id": "product_grid",
  "component": "Grid",
  "children": ["p1", "p2", "p3", "p4", "p5", "p6"],
  "rowsGap": 16,
  "columnsGap": 16
}
```

默认列数为：xs/sm 2 列，md 3 列，lg/xl 5 列。只有业务需要覆盖默认列数时，才显式设置 columnsTemplate；显式值会覆盖组件内部默认值。

### 示例 4：侧边栏显隐

辅助内容在小屏隐藏、大屏显示：

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

使用 visibility: "none" 而非 "hidden"——"none" 不占布局空间，"hidden" 仍占位。

### 示例 5：间距自适应

间距随断点线性递增：

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

### 示例 6：弹性宽度布局

双栏布局使用百分比宽度 + layoutWeight：

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

百分比宽度不设 100%，预留间距。layoutWeight 让两栏按比例分配剩余空间。

## 一多敏感属性参考

以下按组件维度列出需要考虑多端适配的属性：

| 组件 | 一多敏感属性 | 典型适配方式 |
|------|------------|-------------|
| Text | styles.fontSize、styles.fontWeight、styles.padding | 小屏 14fp，大屏 20fp；三元表达式 |
| Button | styles.fontSize、styles.padding、label（文案长度） | 小屏短文案+小字号，大屏完整文案+大字号 |
| TextInput | styles.fontSize、styles.padding | 同 Text |
| Column / Row | styles.padding、styles.margin、styles.width、styles.height、component 本身（Column↔Row 切换） | 间距随断点递增；布局方向用 If 组件切换 |
| Grid | columnsTemplate、rowsGap、columnsGap | 未显式设置 columnsTemplate 时内置适配：xs/sm 2 列，md 3 列，lg/xl 5 列 |
| List | styles.padding，内部布局密度 | 内置适配：xs/sm 1 列，md 2 列，lg/xl 3 列 |
| Image | styles.width、styles.height | 小屏缩小，大屏放大；配合 visibility 在小屏隐藏 |
| Tabs | barPosition、vertical | 小屏底部横排，大屏侧边纵排 |
| Select | styles.width、styles.fontSize | 宽度和字号适配 |
| 所有容器 | styles.visibility | 辅助内容小屏 'none'，大屏 'visible' |
| 所有容器 | styles.layoutWeight、styles.width（%） | 弹性宽度分配 |

## 多设备自适应输出规范

1. 响应式断点变量名为 $__widthBreakpoint（注意双下划线和大小写），不要写成 $WindowBreakpoint 或 $breakpoint。
2. 断点值只有 5 个：xs、sm、md、lg、xl。不要使用 medium、small、large 等非标准值。
3. If 组件必须同时提供 childrenIf 和 childrenElse。缺少 childrenElse 会导致条件为 false 时渲染空白。
4. If 组件的 childrenIf 和 childrenElse 引用的组件 ID 必须在同一条 updateComponents 消息中定义。
5. 所有尺寸属性使用 vp、fp 或 % 单位（如 "16vp"、"50%"）。纯数字默认为 vp，但显式标注单位更清晰。
6. fontSize 属性的值应为数字（如 16、20），不要写成字符串 "16fp"。
7. visibility 属性用于显隐控制时，"none" 不占布局空间，"hidden" 仍占位。隐藏辅助内容用 "none"。
8. Grid 默认不需要输出 columnsTemplate；如需覆盖默认列数，columnsTemplate 使用 "1fr 1fr" 格式，不支持 repeat() 函数。
