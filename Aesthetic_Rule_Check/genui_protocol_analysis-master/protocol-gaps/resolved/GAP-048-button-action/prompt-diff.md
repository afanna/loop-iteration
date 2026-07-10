# GAP-048 Prompt 修改

## 修改 1: eval/prompts/protocol-inline-summary.md

### Button 组件描述更新

- 位置: Button 组件行（约第 18 行）
- 修改前: `| Button | 按钮 | label, theme, listeners |`
- 修改后: `| Button | 按钮 | label, theme, action, listeners |`

### 邻接表规则新增（2026-05-07）

- 位置: 组件公共属性之后
- 新增"组件输出格式（邻接表）"小节：
  - 单组件输出 JSON 对象，多组件输出 JSON 数组
  - children 必须是 ID 字符串数组，不能内联嵌套组件对象
  - 给出正确/错误示例和多组件 JSON 数组输出示例

## 修改 2: eval/src/cli/ 评估脚本

### 新增评估脚本

- 新增: eval/src/cli/eval-button-action.ts — 单策略评估
- 新增: eval/src/cli/eval-button-action-ab.ts — A/B 对比评估

### A/B 对比脚本规则更新（2026-05-07）

两个策略的规则同步更新：
- 规则 1：从"只输出一个JSON对象"改为"单组件输出对象，多组件输出数组"
- 新增规则 2：邻接表规则（children 必须是 ID 数组，不能内联嵌套）
- 规则编号顺延（原规则 2→3, 3→4, ...）

### A/B 对比 few-shot 更新（2026-05-07）

两个策略各新增示例 4（多组件邻接表 JSON 数组输出），展示：
- 提交按钮 + 取消按钮的 JSON 数组格式
- children 为 ID 引用，组件扁平化排列

### 末尾提示语更新

- 修改前: "请只输出一个JSON对象，不要包含任何其他内容。"
- 修改后: "请输出JSON（单组件输出JSON对象，多组件输出JSON数组），不要包含任何其他内容。"

## 修改 3: 测试用例规则修复（2026-05-07）

`eval/design-points/button-action/test-cases/button-action-ab.json`

- 所有 `"field": ""` 改为 `"field": "$output"`
- 原因：空 field 在验证器中是空操作（`!rule.field` 为 true 直接跳过），改为 `$output` 后实际检查整个输出字符串
- 影响：BA01-BA15 共 14 处 `not_contains` + 9 处 `contains` 规则

## 待后续修改

全量回归通过后，需要同步更新：
1. eval/prompts/protocol-inline-summary.md — Button 组件描述和示例
2. eval/src/prompt/prompt-builder.ts — 全量评估使用的系统 prompt 规则
3. eval/test-cases/ — 新增 Button action 相关测试用例
