# P1-9 交互行为结构 -- 模型亲和性评估

## 1. 设计背景

- **协议章节**: 4.3.2 (交互行为)
- **核心问题**: 单个行为（action）的结构体如何定义？
- **评估动机**: action 结构是事件处理的基础，结构复杂度直接影响 LLM 生成交互逻辑的准确率。不同的 action 结构设计（扁平 vs 嵌套 vs 显式 ID）对模型的 JSON 生成能力和语义理解能力影响显著。
- **与 V2 协议一致性**: 相同（Same）

## 2. 候选方案

### A: flat-action（当前设计）

扁平结构，action 名称直接作为 `action` 字段值，参数放 `args`，条件用 `condition` 字段内联：

```json
{
  "action": "navigate",
  "args": {"url": "/home"},
  "as": "result",
  "condition": "$valid == 0"
}
```

### B: handler-format

显式 `id` + `call` 字段格式，条件用 `condition`/`then`/`else`：

```json
{
  "id": "submitBtn",
  "call": "submit",
  "args": {"data": "$formData"}
}
```

### C: event-context

A2UI 事件上下文格式，嵌套结构 `{event: {name, context}}`：

```json
{
  "event": {
    "name": "onClick",
    "context": {
      "action": "submit",
      "args": {"data": "$formData"}
    }
  }
}
```

**结构复杂度对比**:

| 策略 | 层级深度 | 字段数/action | 结构特点 |
|------|----------|--------------|----------|
| flat-action | 1 层 | 2-4 | 扁平、直观 |
| handler-format | 1 层 + 条件分支 | 2-5 | 扁平、多 id 字段 |
| event-context | 2 层嵌套 | 3-5 | 嵌套、冗余包装 |

## 3. 测试用例

- **文件**: `test-cases/action-structure.json`
- **总计**: 15 个测试用例

| 复杂度 | 数量 | ID 范围 | 覆盖场景 |
|--------|------|---------|----------|
| simple | 5 | AS01-AS05 | 简单点击 Toast、点击导航、更新数据模型、TextInput onChange、打开链接 |
| medium | 5 | AS06-AS10 | 验证+条件提交、条件 setDataModel、双 action 链、onAppear 事件、Select 条件导航 |
| complex | 5 | AS11-AS15 | 三步 action 链、条件分支+as 变量绑定、Checkbox 多选+批量更新、List onReachEnd+加载更多、复杂表单提交+验证+条件+多 action |

- **边界用例**: 5 个（AS11-AS15）
- **覆盖要点**: 单 action 调用、多 action 链式调用、条件分支（if/then/else）、as 变量绑定、onReachEnd 等特殊事件

## 4. 量化评估结果

### 4.1 综合维度评分

**DeepSeek-V3**（报告: `2026-04-17T11-16-11`）:

| 维度 | 权重 | flat-action | handler-format | event-context |
|------|------|-------------|----------------|---------------|
| D1 语法准确率 | 20% | **100.0%** | **100.0%** | 93.3% |
| D2 语义准确率 | 25% | **100.0%** | **100.0%** | 93.3% |
| D3 生成效率 | 15% | **100.0%** | **100.0%** | 94.7% |
| D4 学习曲线 | 15% | **100.0%** | **100.0%** | **100.0%** |
| D5 边界鲁棒性 | 15% | **100.0%** | **100.0%** | 90.0% |
| D6 一致稳定性 | 10% | **95.0%** | **95.0%** | **95.0%** |
| **MA 综合** | | **99.5% (A+)** | **99.5% (A+)** | **94.2% (A+)** |

**GLM-5.1**（报告: `2026-04-22T04-11-52`, `max_tokens=20480`）:

| 维度 | 权重 | flat-action | handler-format | event-context |
|------|------|-------------|----------------|---------------|
| D1 语法准确率 | 20% | **100.0%** | **100.0%** | **100.0%** |
| D2 语义准确率 | 25% | **100.0%** | **100.0%** | **100.0%** |
| D3 生成效率 | 15% | **100.0%** | **100.0%** | **100.0%** |
| D4 学习曲线 | 15% | **100.0%** | **100.0%** | **100.0%** |
| D5 边界鲁棒性 | 15% | **100.0%** | **100.0%** | **100.0%** |
| D6 一致稳定性 | 10% | 95.0% | 90.0% | 95.0% |
| **MA 综合** | | **99.5% (A+)** | **99.0% (A+)** | **99.5% (A+)** |

### 4.2 综合对比

| 方案 | DeepSeek-V3 | GLM-5.1 | 平均 MA | 等级 |
|------|-------------|---------|---------|------|
| **flat-action（当前设计）** | **99.5% (A+)** | **99.5% (A+)** | **99.5%** | **A+** |
| handler-format | **99.5% (A+)** | 99.0% (A+) | 99.3% | A+ |
| event-context | 94.2% (A+) | **99.5% (A+)** | 96.9% | A+ |

### 4.3 D4 学习曲线明细

| 模型 | 策略 | 0-shot | 1-shot | 3-shot |
|------|------|--------|--------|--------|
| DeepSeek-V3 | flat-action | 100% | 100% | 100% |
| DeepSeek-V3 | handler-format | 100% | 100% | 100% |
| DeepSeek-V3 | event-context | 100% | 100% | 100% |
| GLM-5.1 | flat-action | 100% | 100% | 100% |
| GLM-5.1 | handler-format | 100% | 100% | 100% |
| GLM-5.1 | event-context | 100% | 100% | 100% |

所有策略在所有模型上 0-shot 即达满分，说明三种 action 结构对 LLM 来说都非常直觉，无需示例即可正确生成。

### 4.4 D6 一致性明细

| 模型 | 策略 | 结构一致率 | 语义等价率 |
|------|------|-----------|-----------|
| DeepSeek-V3 | flat-action | 87.5% | 100% |
| DeepSeek-V3 | handler-format | 87.5% | 100% |
| DeepSeek-V3 | event-context | 87.5% | 100% |
| GLM-5.1 | flat-action | 88% | 100% |
| GLM-5.1 | handler-format | 75% | 100% |
| GLM-5.1 | event-context | 88% | 100% |

语义等价率均为 100%。GLM handler-format 结构一致率最低（75%），说明 handler-format 在重复生成时结构变化较大，但仍保持语义正确。

### 4.5 D3 生成效率 Token 对比

**GLM-5.1（max_tokens=20480）**:

| 策略 | 最小 tokens | 最大 tokens | 平均 tokens |
|------|------------|------------|------------|
| flat-action | 3300 | 6755 | 4397 |
| handler-format | 3154 | 12051 | 5323 |
| event-context | 3205 | 7593 | 4777 |

handler-format 的最大 token 数（12051）远高于其他两个策略，主要因为 handler-format 在复杂用例（AS15 复杂表单）中每个 action 都需要额外的 `id` 字段，累积 token 开销更大。

## 5. 失败用例分析

### DeepSeek-V3

**flat-action 和 handler-format**: 0 个失败（15/15 全部通过）。

**event-context（1 个失败）**:

| 用例 ID | 用例名称 | 失败级别 | 失败描述 |
|---------|----------|----------|----------|
| AS12 | 条件分支+as 变量绑定 | L1 | JSON 解析失败 -- 输出截断 |

**失败模式**: event-context 的嵌套结构 `{event: {name, context: {...}}}` 在复杂条件分支场景下导致输出 JSON 过长，被截断无法解析。原始输出可见 JSON 在 `condition` 的 `context` 对象中被截断。

### GLM-5.1（max_tokens=20480）

**三种策略均无失败**（flat-action 15/15、handler-format 15/15、event-context 15/15 全部通过）。

> **注**: 旧版评估（`max_tokens=2048`，报告 `2026-04-17T11-27-00`）中 GLM 三种策略各有 2 个失败，全部为 L1 JSON 解析失败（输出截断）。将 `max_tokens` 从 2048 提升至 20480 后，所有用例均通过，证实原失败根因为输出长度限制而非协议理解问题。

### 失败模式对比总结

| 策略 | DeepSeek 失败数 | GLM 失败数 | 失败模式 |
|------|-----------------|------------|----------|
| flat-action | 0 | 0 | -- |
| handler-format | 0 | 0 | -- |
| event-context | 1 | 0 | L1 JSON 截断（仅 DeepSeek AS12） |

### 根因分析

1. **DeepSeek event-context AS12 是唯一的残留失败**: event-context 的嵌套包装 `{event: {name, context}}` 相比扁平结构额外增加了一层 JSON 嵌套，在复杂条件分支场景下即使有充足的 `max_tokens` 也可能触发截断。

2. **三种策略语义理解均无问题**: 模型在所有成功用例中均正确使用了对应策略的结构规范（flat-action 使用 `action`/`args`，handler-format 使用 `id`/`call`/`args`，event-context 使用 `event`/`name`/`context`）。D1/D2 在 GLM 上全部 100% 证实了这一点。

3. **handler-format 的 token 开销劣势**: 虽然 handler-format 不再导致失败，但其平均 token 数（5323）和最大 token 数（12051）均高于 flat-action（4397/6755）和 event-context（4777/7593），在大量 action 链式场景下 token 开销更大。

4. **flat-action 和 event-context 在 GLM 上表现高度一致**: 两者 MA 均为 99.5%（A+），flat-action 和 event-context 的 D1-D6 维度分数也完全相同。这说明在充足的输出空间下，GLM 对扁平结构和嵌套结构均能很好处理。

### 优化建议

- 当前 flat-action 设计无需优化，结构本身已是最优的 token 效率方案
- 若需进一步优化 DeepSeek event-context AS12 场景，可在 prompt 中引导模型使用更紧凑的 JSON 格式
- `max_tokens` 建议保持 20480，确保复杂用例有足够的输出空间

## 6. 结论

- **推荐方案**: flat-action（当前设计）胜出，双模型平均 MA 99.5%（A+ 级）
- **与 V2 协议一致性**: 相同（当前设计即 V2 协议设计）
- **风险提示**: 极低。flat-action 在两个模型上均达 A+ 级（GLM 99.5%、DeepSeek 99.5%），且无任何失败用例。

flat-action 的核心优势：

1. **跨模型一致性极佳**: flat-action 在两个模型上 MA 均为 A+ 级
2. **token 效率最优**: 扁平结构不额外消耗嵌套或 id 字段的 token，GLM 平均 4397 tokens vs handler-format 5323 tokens
3. **语义直觉性最强**: `action`/`args` 命名与主流编程语言的函数调用范式一致，符合 LLM 训练数据中的先验知识
4. **零失败率**: 在两个模型上均无任何失败用例，鲁棒性最佳

## 7. 如何运行

```bash
cd eval
npm install

# 完整评估（双模型 x 三策略）
npm run eval:action-struct

# 仅运行 DeepSeek
ONLY_MODEL=deepseek npm run eval:action-struct

# 仅运行 GLM
ONLY_MODEL=glm npm run eval:action-struct

# 自定义报告输出目录
REPORTS_DIR=/path/to/reports npm run eval:action-struct
```

**报告文件**:

```
eval/design-points/action-structure/
├── README.md                                                    # 本文件
├── test-cases/
│   └── action-structure.json                                    # 15 个测试用例
└── reports/
    ├── action-structure-comparison-2026-04-17T11-16-11.*        # DeepSeek 评估报告
    ├── action-structure-comparison-2026-04-17T11-27-00.*        # GLM 评估报告（旧版 max_tokens=2048）
    └── action-structure-comparison-2026-04-22T04-11-52.*        # GLM 评估报告（max_tokens=20480）
```
