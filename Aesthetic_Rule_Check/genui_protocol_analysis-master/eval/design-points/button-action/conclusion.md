# Button.action 亲和性设计评估

## 设计背景

### 问题

鸿蒙 A2UI 协议中 Button 组件只有 `listeners`（通用交互），缺少 A2UI 原生协议中 Button 的 `action` 属性（表单提交）。需要为鸿蒙扩展 Button 补充表单提交能力。

### 提案

在鸿蒙扩展 Button 组件上增加 `action` 属性，规格与 A2UI 原生协议保持一致：

- `{event: {name: string, context?: object}}` — 服务端事件（表单提交）
- `{functionCall: {call: string, args?: object}}` — 本地函数调用

**`action` 优先级高于 `listeners`**：两者可以同时存在于同一个 Button 上，但有 `action` 时只触发 `action`，没有 `action` 时触发 `listeners`。通常按场景二选一。

### 与现有设计决策的关系

协议 §3.4 有设计决策记录：不建议在扩展组件中同时支持 `action` 和 `listeners`。本次评估针对这些顾虑进行验证：
1. LLM 能否正确区分表单提交（action）和通用交互（listeners）
2. 优先级语义是否会混淆 LLM
3. action 方案与 sendToLLM 统一方案哪个亲和性更好

## 候选方案（A/B 对比）

### 方案A（button-action）：优先级双通道

Button 使用 `action` 提交表单，`listeners` 做通用交互。两者可共存，但 `action` 优先级更高（有 action 时只触发 action）。

```json
[
  {"id": "submitBtn", "component": "Button", "label": "提交",
   "action": {"event": {"name": "submitForm", "context": {"email": "{{ $__DataModel.form.email }}"}}}},
  {"id": "cancelBtn", "component": "Button", "label": "取消",
   "listeners": {"onClick": [{"call": "showToast", "args": {"message": "已取消"}}]}}
]
```

### 方案B（listeners+sendToLLM）：统一机制

所有交互统一使用 `listeners`，表单提交用 `sendToLLM` 行为。

```json
[
  {"id": "submitBtn", "component": "Button", "label": "提交",
   "listeners": {"onClick": [{"call": "sendToLLM", "args": {"value": "submitForm", "email": "{{ $__DataModel.form.email }}"}}]}},
  {"id": "cancelBtn", "component": "Button", "label": "取消",
   "listeners": {"onClick": [{"call": "showToast", "args": {"message": "已取消"}}]}}
]
```

## 测试用例

15 个测试用例（`test-cases/button-action-ab.json`），每个用例包含 `shared_rules` + `strategy_rules` 两套验证规则，支持 A/B 对比。

按复杂度分布：simple 5 / medium 5 / complex 5

按交互类型分布：

| 类型 | 数量 | 说明 |
|------|------|------|
| action-only | 5 | 纯表单提交（BA01/02/03/06/11/12） |
| listeners-only | 2 | 非表单交互（BA04/05） |
| 多组件混合 | 3 | 提交+验证/取消/重置（BA07/08/15） |
| 混淆测试 | 3 | 非提交不应提交/提交不应混用（BA10/13/14） |
| 其他组件 | 1 | Toggle 不应有 action（BA09） |

## 评估结果

### A/B 对比汇总（2026-05-07，邻接表修复后）

| 维度 | 权重 | GLM A | GLM B | DS A | DS B |
|------|------|-------|-------|------|------|
| D1 语法 | 20% | **100%** | **100%** | **100%** | **100%** |
| D2 语义 | 25% | **100%** | **100%** | **100%** | **100%** |
| D3 效率 | 15% | **100%** | **100%** | **100%** | **100%** |
| D4 学习 | 15% | 74.0% | 74.0% | **95.0%** | **95.0%** |
| D5 边界 | 15% | **100%** | **100%** | **100%** | **100%** |
| D6 一致 | 10% | 95.0% | 95.0% | 95.0% | 95.0% |
| **MA** | **100%** | **95.6% (A+)** | **95.6% (A+)** | **98.8% (A+)** | **98.8% (A+)** |

### Phase A 通过率

| 模型 | 方案A | 方案B |
|------|-------|-------|
| GLM-5.1 | **15/15 (100%)** | **15/15 (100%)** |
| DeepSeek | **15/15 (100%)** | **15/15 (100%)** |

### D4 学习曲线

| shot | GLM A | GLM B | DS A | DS B |
|------|-------|-------|------|------|
| 0-shot | 60% | 60% | 90% | 90% |
| 1-shot | 70% | 70% | 100% | 100% |
| 3-shot | 100% | 100% | 100% | 100% |

### 历史对比

| 轮次 | 日期 | 修复内容 | GLM MA | DS MA |
|------|------|----------|--------|-------|
| 第1轮 | 05-06 | 单策略评估 | A+ 95.5% | A+ 95.5% |
| 第2轮 | 05-06 | A/B对比（内联嵌套） | A+ 90.4% | A+ 95.4% |
| **第3轮** | **05-07** | **邻接表规则+规则修复** | **A+ 95.6%** | **A+ 98.8%** |

## 评估结论

### 两个方案亲和性完全一致

GLM 和 DeepSeek 的 A/B 方案 MA 分数完全相同（95.6% / 98.8%），说明 `action` 和 `sendToLLM` 在模型亲和性上没有差异，LLM 都能正确理解和生成。

### 对 §3.4 设计决策的回应

| 原有顾虑 | 评估结果 |
|----------|----------|
| 两种格式并存增加 LLM 决策分支 | **未体现**。D2 语义准确率 100%，所有场景全部通过 |
| 隐式优先级规则 LLM 难以内化 | **未体现**。LLM 正确按优先级选择 action（提交）或 listeners（交互） |
| 功能重叠导致等价表达随机选择 | **未体现**。混淆测试全部通过 |

### 邻接表修复效果

第2轮评估中 5/6 失败是 LLM 用 Column/Row 内联嵌套多组件（违反邻接表规则），修复后：
1. prompt 新增邻接表显式规则（`protocol-inline-summary.md` + 评估脚本）
2. few-shot 新增多组件 JSON 数组示例
3. 测试用例 `field: ""` 空操作规则改为 `$output` 实际校验
4. 修复后 4 策略 × 15 用例 = 60 次测试全部通过

### 最终建议

从协议语义清晰度角度，推荐方案A（button-action）：
- `action` 语义明确，表达"表单提交"意图
- `sendToLLM` 是通用通信机制，表单提交只是其一种用途
- 两者亲和性无差异，但 `action` 更利于人类理解

## 如何运行

```bash
cd eval

# 单策略评估
npm run eval:button-action

# A/B 对比评估
npm run eval:button-action-ab
```

环境变量控制：
```bash
ONLY_MODEL=deepseek npm run eval:button-action-ab   # 仅运行 DeepSeek
SKIP_MODELS=glm npm run eval:button-action-ab         # 跳过 GLM
```

报告输出到 `eval/design-points/button-action/reports/`。
