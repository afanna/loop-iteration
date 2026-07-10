# GAP-053: 扩展交互协议结构优化

## 问题描述

当前扩展组件的交互协议使用 `listeners` 对象作为事件监听的包装层，内部的行为对象称为 `Handler`。这种设计存在以下问题：

1. **多余的嵌套层**：`listeners: { onClick: [...] }` 中 `listeners` 本身不携带任何额外信息，只是事件名到行为数组的映射容器。去掉这一层可以让结构更扁平。
2. **术语不统一**：`Handler`（处理器）概念与前端框架常见的事件回调模式不一致。改用 `action`（行为）更贴近 A2UI 原生协议的 `action` 概念，也符合 LLM 训练数据中常见的 "event → action" 模式。
3. **概念名称需要转变**：当前 §3.4 标题为"交互扩展"，应改为"事件监听与交互"，更准确地描述扩展组件的事件监听和交互行为。

## 核心变更

| 维度 | 策略A（当前） | 策略B（提议） |
|------|-------------|-------------|
| 包装层 | `listeners: { onClick: [...] }` | `onClick: [...]`（事件名直接作为组件属性） |
| 行为对象名称 | Handler | Action |
| Handler interface | `interface Handler { call, as?, args?, condition? }` | `interface Action { call, as?, args?, condition? }` |
| 概念标题 | §3.4 "交互扩展" | §3.4 "事件监听与交互" |

### 结构对比

**策略A（当前）**：
```json
{
  "id": "btn",
  "component": "Button",
  "label": "提交",
  "listeners": {
    "onClick": [
      {"call": "validate", "as": "result", "args": {"data": "{{ $__DataModel.form }}"}},
      {"call": "sendToLLM", "condition": "{{ $result == 0 }}", "args": {"value": "submit"}}
    ]
  }
}
```

**策略B（提议）**：
```json
{
  "id": "btn",
  "component": "Button",
  "label": "提交",
  "onClick": [
    {"call": "validate", "as": "result", "args": {"data": "{{ $__DataModel.form }}"}},
    {"call": "sendToLLM", "condition": "{{ $result == 0 }}", "args": {"value": "submit"}}
  ]
}
```

### 不变的部分

- Button 的 `action` 属性保留（表单提交专用，与事件监听独立）
- 原生 A2UI 组件的 `action.event`/`action.functionCall` 不变
- Action 对象的 `{call, as?, args?, condition?}` 字段结构不变
- 预定义行为列表不变（break, sendToLLM, setDataModel, setAttributes, scrollTo, navigate）
- 事件类型不变（onClick, onAppear, onChange 等）
- `as` 变量绑定、`condition` 条件执行、事件上下文等语义不变

## 影响范围

- 协议章节: §3.4（交互扩展→事件监听与交互）、§4.3（交互）、§4.3.1（交互事件）、§4.3.2（交互行为）、§4.1.2（扩展组件定义）
- 测试分类: FP-05（交互相关）
- Prompt 文件: eval/prompts/ 下所有包含 `listeners` 的文件
- Few-shot 示例: eval/src/prompt/few-shot-examples.ts

## 候选修复方案

- 方案A: 维持当前 `listeners` + `Handler` 结构（对照组）
- 方案B: 去除 `listeners` 层，事件名直接作为组件属性，`Handler` 改名 `Action`（提议方案）
- 推荐: 方案B — 更扁平、更贴近前端框架惯例、减少嵌套层级

## 验证计划

**实质性修复 — affinity-design A/B 对比验证**

- 设计点: `eval/design-points/interaction-restructure/`
- 策略: `listeners-handler`（当前）vs `direct-action`（提议）
- 测试用例: 约 20 个策略感知测试用例
- 覆盖场景:
  - 基础事件监听（onClick 单行为、多行为链、onAppear）
  - 条件执行（condition 分支、链式条件）
  - as 变量绑定（validate + as + 后续引用）
  - 多事件组件（同一组件 onClick + onChange）
  - Button action 共存（action 表单提交 + onClick 通用交互）
  - 复杂链式（长链 4+ 行为、嵌套参数）
  - 边界/异常（空 action 链、break 跳出）
- 模型: GLM + DeepSeek
- 评估维度: D1-D6 全量 6 维度
- 通过标准: 策略B 达到 A 级（MA >= 80%），且不低于策略A

## 评估报告

- eval/design-points/interaction-restructure/reports/interaction-restructure-ab-2026-05-11T10-23-09.md
- eval/design-points/interaction-restructure/reports/interaction-restructure-ab-2026-05-11T10-23-09.json

### 评估结果汇总

**20 个测试用例 × 2 模型 × 2 策略 = 80 次测试**

| 模型 | 方案A: listeners+Handler | 方案B: 直接属性+Action | 差异 |
|------|------------------------|----------------------|------|
| **GLM** | MA: 96.5% (A+) | MA: **100.0% (A+)** | +3.5% |
| **DeepSeek** | MA: 96.0% (A+) | MA: **99.0% (A+)** | +3.0% |

**逐维度对比（GLM / DeepSeek）**：

| 维度 | 权重 | 方案A | 方案B | 说明 |
|------|------|-------|-------|------|
| D1 语法 | 20% | 100% / 100% | 100% / 100% | 持平 |
| D2 语义 | 25% | 97% / 97% | **100% / 100%** | B 优于 A |
| D3 效率 | 15% | 95% / 95% | **100% / 100%** | B 优于 A |
| D4 学习 | 15% | 90% / 90% | **100% / 100%** | B 优于 A（0-shot 即 100%） |
| D5 边界 | 15% | 100% / 100% | 100% / 100% | 持平 |
| D6 一致 | 10% | 95% / 90% | **100% / 90%** | GLM B 更优 |

**关键发现**：

1. **方案B（直接属性）全面优于方案A（listeners）** — 双模型 MA 均高于方案A
2. **方案B 实现了零样本 100% 通过** — 0-shot 即可正确生成，无需 few-shot 引导
3. **方案A 的唯一失败模式一致** — IR001 在双模型上都失败，原因是 LLM 天然倾向直接写 `onClick` 而非包在 `listeners` 里
4. **Button action 共存无影响** — 方案B 下 IR009/IR010（Button action 场景）全部通过

## 最终结论

**推荐方案B（事件名直接属性 + Action）**。评估数据确认：

- 双模型均达到 **A+ 级**（MA >= 96%），远超 A 级门槛（80%）
- 方案B 在所有 6 个维度上均不低于方案A，其中 D2（语义）、D3（效率）、D4（学习曲线）显著优于方案A
- 0-shot 100% 通过率证明 LLM 天然偏好"事件名直接作为属性"的模式，无需额外学习成本

下一步：按 protocol-gaps 流程进入阶段3（导出修改）→ 阶段4（全量回归）→ 阶段5（归档）。
