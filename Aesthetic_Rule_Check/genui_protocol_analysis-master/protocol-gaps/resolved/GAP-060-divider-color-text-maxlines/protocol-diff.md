# GAP-060 协议修改

## 修改 1: §4.2.2.1.2 Divider 样式 — color 默认值

- 位置: specification/harmonyos-a2ui-protocol.md 第 1788 行
- 修改前: `字符串(16进制)，默认值：'#33182431'`
- 修改后: `16进制字符串，默认值：浅色模式#33000000，深色模式#33FFFFFF`
- 理由: 遵循 UX 定义，与 Toggle、TextInput、Radio 等组件的双模式默认值格式保持一致

## 修改 2: §4.2.1.4 Text 样式 — maxLines 默认值

- 位置: specification/harmonyos-a2ui-protocol.md 第 1743 行
- 修改前: `数字，取值范围：[0, inf]`
- 修改后: `数字，默认值：inf。取值范围：[0, inf]。当不设置或设置非法值时，不限制最大行数。`
- 理由: 明确默认行为，与 TextInput 的 maxLines（默认 3）区分

## 修改 3: spec/json/extended_catalog.json — Divider color

- 修改前: `"default": "#33182431"`, description 为 `Default: '#33182431'`
- 修改后: `"default": "#33000000"`, description 为 `Default: light mode #33000000, dark mode #33FFFFFF`

## 修改 4: spec/json/extended_catalog.json — Text maxLines

- 修改前: description 为 `Range: [0, inf]`
- 修改后: description 为 `Default: inf (no limit when unset or invalid). Range: [0, inf]`
