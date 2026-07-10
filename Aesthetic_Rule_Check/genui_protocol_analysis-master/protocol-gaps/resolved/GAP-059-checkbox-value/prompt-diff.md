# GAP-059 Prompt 修改

## 修改: protocol-summary.md + protocol-harmonyos-extended.md

- 修改前: `| Checkbox | label, group, select, onChange |`
- 修改后: `| Checkbox | label, value, group, select, onChange |`
- 理由: 新增 `value` 属性需要让 LLM 知晓

## 修改: protocol-inline-summary.md / protocol-harmonyos-inline.md

无需修改，这两个文件仅列出组件名称和函数名称，不涉及详细属性列表。

## 修改: prompt-builder.ts

规则 #5 无需修改 — "Toggle和Checkbox建议包含'label'作为展示文本" 仍然成立。

## 测试用例

- FP0111: task 新增 `value` 属性说明 + validation 新增 `value` 字段检查 + hints 新增 value 提示
