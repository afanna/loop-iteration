# GAP-061 协议修改

## 修改 1: §4.2.1.4 Button 样式 — 新增 minFontSize

- 位置: specification/harmonyos-a2ui-protocol.md 第 1834-1835 行
- 修改前: maxFontSize 行后直接跟 fontScaleMode，无 minFontSize
- 修改后: 在 maxFontSize 与 fontScaleMode 之间插入 minFontSize 行
- 内容: `| minFontSize | 文本最小显示大小 | 数字，单位 fp。需配合maxFontSize或布局大小限制使用，单独设置不生效。minFontSize小于或等于0时，自适应字号不生效，此时按照fontSize属性的值生效，未设置时按照其默认值生效。 | 否 | 是 | "minFontSize": 12 |`
- 理由: Button 的 maxFontSize 已引用 minFontSize 作为配合属性，但 minFontSize 从未定义。Text 和 TextInput 均有此配对。

## 修改 2: spec/json/extended_catalog.json — Button schema minFontSize

- 位置: extended_catalog.json Button styles 段，maxFontSize 与 fontScaleMode 之间
- 修改前: 无 minFontSize 定义
- 修改后: 新增 minFontSize 属性，与 Text.minFontSize 定义一致，description 调整为不涉及 maxLines
