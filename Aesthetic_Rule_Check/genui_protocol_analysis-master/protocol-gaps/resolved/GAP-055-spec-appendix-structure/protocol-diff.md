# GAP-055 协议修改

## 修改 1: 重组第 4 章附件目录结构

- 位置: `specification/harmonyos-a2ui-protocol.md` §4
- 修改前: §4 按“组件 / 样式 / 事件监听附录 / 表达式 / 变量系统 / JSON Schema”横向组织。
- 修改后: §4 调整为“附件 / A2UI 原生组件 / 扩展协议 / JSON Schema”；扩展协议内按“组件 / 公共能力”组织，组件下再按通用属性、通用样式、通用事件、展示组件、交互组件、布局组件、容器组件、条件组件分类。
- 理由: 降低同一扩展组件规格跨章节查找成本，提升附件结构可读性。

## 修改 2: 更新第 4 章内部引用锚点

- 位置: `specification/harmonyos-a2ui-protocol.md` §3, §4
- 修改前: 引用旧章节锚点，如 `#43-事件监听附录`、`#45-变量系统`、`#452-全局系统变量` 等。
- 修改后: 引用重组后的新章节锚点。
- 理由: 保持 Markdown 内部链接可定位。

## 修改 3: 通用事件与组件私有事件分层

- 位置: `specification/harmonyos-a2ui-protocol.md` §4.2.1.3 及各组件 `**事件**` 小节
- 修改前: `4.2.1.3 通用事件` 同时包含 `onClick`、`onAppear` 以及组件私有事件（如 TextInput `onChange`、List `onReachStart/onReachEnd`、Select `onSelect` 等）；各组件事件小节仅引用通用事件。
- 修改后: `4.2.1.3 通用事件` 仅保留 `onClick`、`onAppear` 两项；其他非通用事件回归对应组件小节（TextInput/Toggle/Radio/Checkbox/CheckboxGroup/Select/List/Tabs）。
- 理由: 保持“通用事件”语义边界清晰，避免组件私有事件混入通用事件目录。

## 约束

- 不删除协议内容。
- 不修改已有字段含义、事件语义、表达式规则、变量规则或 JSON Schema 逻辑。
- 不新增协议能力。
