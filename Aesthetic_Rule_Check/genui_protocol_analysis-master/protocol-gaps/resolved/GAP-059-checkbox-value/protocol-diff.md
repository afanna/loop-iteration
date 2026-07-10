# GAP-059 协议修改

## 修改 1: §4.2.2.1.5 Checkbox 属性表 — 新增 value 属性

- 位置: specification/harmonyos-a2ui-protocol.md 第 1941 行
- 修改前: `label` 属性描述含 "当 Checkbox 组件用于 group 中且被选中时，label 属性所设置的文本可在交互上下文中通过 getCheckboxGroupValues 函数获取"
- 修改后: `label` 回归纯展示文本描述；新增 `value` 属性行，描述为语义化标识（不绘制显示），用于 group 区分和 getCheckboxGroupValues 获取
- 理由: 与 Radio 组件 `value` 属性保持一致，语义化标识与展示文本分离

## 修改 2: §3.4.1 函数总表 — getCheckboxGroupValues 说明

- 位置: specification/harmonyos-a2ui-protocol.md 第 666 行
- 修改前: "获取指定群组中所有被选中 Checkbox 组件的 value 文本值数组"
- 修改后: "获取指定群组中所有被选中 Checkbox 组件的 value 属性值数组"
- 理由: 明确从 `value` 属性获取，与新增 property 匹配

## 修改 3: spec/json/extended_catalog.json — Checkbox schema

- 位置: specification/json/extended_catalog.json Checkbox 定义
- 修改前: 无 `value` 属性
- 修改后: 新增 `value` 字段 (type: string)，description 说明为语义化标识，可通过 getCheckboxGroupValues 获取

## 修改 4: spec/json/extended_catalog.json — CheckboxGroupChangeEventData 无需修改

- `value` 字段描述 "Names of all checked checkboxes" 泛义兼容，不特指 source
