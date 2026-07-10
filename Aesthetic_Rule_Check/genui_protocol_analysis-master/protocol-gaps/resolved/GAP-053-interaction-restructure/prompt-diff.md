# GAP-053 Prompt 修改

## 修改: protocol-harmonyos-extended.md
- "表达式不可用字段": `listeners` → `onClick, onChange, onAppear, onReachStart, onReachEnd, onBreakpointChange`
- "事件结构"段: `listeners: { onClick: [...] }` → `onClick: [...]` 直接属性
- "handler 对象"段标题: → "action 对象"，内容同步更新

## 修改: protocol-summary.md
- Button 组件字段: `listeners` → `onClick`
- Button 组件示例: `listeners: { onClick: [...] }` → `onClick: [...]`
- "表达式不可用字段": `listeners` → `onClick, onChange, onAppear`
- "事件结构层级": `listeners → 事件名 → actions数组` → `事件名 → action数组`

## 修改: protocol-harmonyos-inline.md
- "组件公共属性": `listeners`(可选) → 事件监听属性如`onClick`/`onChange`等(可选)
- Button 示例: `listeners: { onClick: [...] }` → `onClick: [...]`
- Select 示例: `listeners: { onChange: [...] }` → `onChange: [...]`
- "表达式不可用字段": `listeners` → `onClick, onChange, onAppear`
- "事件结构层级": 同上

## 修改: protocol-inline-summary.md
- Button 组件字段: `listeners` → `onClick`
- 多组件示例中 resetBtn: `listeners: { onClick: [...] }` → `onClick: [...]`
- Button 示例注释: `通用交互 — 使用 listeners` → `通用交互 — 使用事件监听`
- "表达式不可用字段": `listeners` → `onClick, onChange, onAppear`
- "事件结构层级": 同上

## Few-shot 修改
- eval/src/cli/eval-interaction-restructure.ts 中已包含新格式的 few-shot 示例
- 其他评估脚本（如 eval-button-action-ab.ts）的历史 few-shot 不修改
