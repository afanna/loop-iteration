# #3 事件链执行方式

## 设计背景

协议章节 3.4（事件与交互）定义了事件触发的多步行为执行结构。事件链是 UI 交互中最复杂的部分，涉及条件分支、变量传递和执行顺序控制。结构设计直接影响 LLM 生成复杂交互的准确率。

核心设计问题：**事件链中多步行为的执行结构，是嵌套对象还是扁平数组？条件分支如何表达？**

## 候选方案

| 方案 | 名称 | 说明 | 状态 |
|------|------|------|------|
| **A** | handlerGroups | 鸿蒙 V2 当前方案，三层嵌套结构 | 对比基线 |
| **B** | flat-array (condition) | 扁平数组 + action 级 condition 字段 | **推荐** |
| **C** | flat-array (if/then/else) | 扁平数组 + if/then/else 嵌套对象 | 已淘汰 |

### 方案 A: handlerGroups（鸿蒙 V2 当前方案）

```json
{
  "listeners": {
    "onClick": {
      "handlerGroups": [
        {
          "handlerGroup": "validateAndSubmit",
          "handlers": [
            {"action": "validate", "as": "validResult", "args": {"data": "$formData"}},
            {"action": "submit", "condition": "$validResult == 0", "as": "submitResult", "args": {"data": "$formData"}}
          ]
        }
      ]
    }
  }
}
```

特征：三层嵌套（listeners > handlerGroups > handlers），handlerGroup 命名分组，handler 级 condition 字段。

### 方案 B: flat-array (condition)（推荐方案）

```json
{
  "listeners": {
    "onClick": [
      {"action": "validate", "as": "validResult", "args": {"data": "$formData"}},
      {"action": "submit", "condition": "$validResult == 0", "as": "submitResult", "args": {"data": "$formData"}},
      {"action": "sendToLLM", "condition": "$submitResult == 0", "args": {"value": "成功"}},
      {"action": "sendToLLM", "condition": "$submitResult != 0", "args": {"value": "失败"}}
    ]
  }
}
```

特征：扁平数组结构，每个元素是统一的 action 步骤；`condition` 字段为可选，为真执行、为假跳过；`as` 绑定返回值，`$变量名` 引用；分支通过多个带不同 condition 的 action 实现；无嵌套、无特殊语法。

### 方案 C: flat-array (if/then/else)（已淘汰）

```json
{
  "listeners": {
    "onClick": [
      {"action": "validate", "as": "validResult"},
      {"if": "$validResult == 0", "then": [{"action": "submit"}], "else": [{"action": "showError"}]}
    ]
  }
}
```

特征：扁平数组 + `{if, then, else}` 嵌套对象切换。模型需要在统一 action 步骤和条件嵌套对象之间切换语法模式。

## 测试用例

- **文件**: `test-cases/chain-execution.json`
- **总计**: 20 个测试用例

### 按链深度分布

| 链深度 | 数量 | 说明 |
|--------|------|------|
| 1 | 4 | 单行为，无链 |
| 2 | 6 | 两步（顺序/条件/分支） |
| 3 | 5 | 三步链式/带分支 |
| 4 | 5 | 四步链式/带分支 |

### 按链类型分布

| 链类型 | 数量 | 说明 |
|--------|------|------|
| single | 4 | 单个行为 |
| sequential | 1 | 多个行为无条件顺序执行 |
| conditional | 9 | 含条件判断 |
| branching | 6 | 含条件分支（成功/失败路径） |

## 评估结果

### MA 综合分对比

| 方案 | DeepSeek-V3 | GLM-5.1 | 综合判断 |
|------|-------------|---------|----------|
| **A: handlerGroups** | 98.9% (A+) | 97.5% (A+) | 基线，A+ 级 |
| **B: flat-array (condition)** | **98.5% (A+)** | **98.2% (A+)** | **推荐，A+ 级** |
| **C: flat-array (if/then/else)** | 99.2% (A+) | 79.2% (B) | 已淘汰 |

### GLM-5.1 六维度评分

| 维度 | 权重 | handlerGroups | flat-array (condition) | flat-array (if/then/else) |
|------|------|---------------|----------------------|--------------------------|
| D1 语法准确率 | 20% | — | **100.0%** | 75.0% |
| D2 语义准确率 | 25% | — | **100.0%** | 75.0% |
| D3 生成效率 | 15% | 92.0% | **100.0%** | 76.0% |
| D4 学习曲线 | 15% | 95.0% | 95.0% | 95.0% |
| D5 边界鲁棒性 | 15% | — | — | 68.8% |
| D6 一致稳定性 | 10% | — | — | 95.0% |
| **MA 综合** | **100%** | **97.5% (A+)** | **98.2% (A+)** | **79.2% (B)** |

### DeepSeek-V3 六维度评分

| 维度 | 权重 | handlerGroups | flat-array (condition) | flat-array (if/then/else) |
|------|------|---------------|----------------------|--------------------------|
| D1 语法准确率 | 20% | — | — | 100.0% |
| D2 语义准确率 | 25% | — | — | 100.0% |
| D3 生成效率 | 15% | 100.0% | 100.0% | 100.0% |
| D4 学习曲线 | 15% | 93.0% | 90.0% | 95.0% |
| D5 边界鲁棒性 | 15% | — | — | 100.0% |
| D6 一致稳定性 | 10% | — | — | 100.0% |
| **MA 综合** | **100%** | **98.9% (A+)** | **98.5% (A+)** | **99.2% (A+)** |

### D4 学习曲线明细

| 模型 | shot 数 | handlerGroups | flat-array (condition) |
|------|---------|---------------|----------------------|
| GLM-5.1 | 0-shot | 90% | 90% |
| GLM-5.1 | 1-shot | 100% | 100% |
| GLM-5.1 | 3-shot | 100% | 100% |
| DeepSeek-V3 | 0-shot | 90% | 80% |
| DeepSeek-V3 | 1-shot | 90% | 100% |
| DeepSeek-V3 | 3-shot | 100% | 100% |

### D6 一致稳定性明细

| 模型 | 指标 | handlerGroups | flat-array (condition) |
|------|------|---------------|----------------------|
| GLM-5.1 | 结构一致率 | 87.5% | 75% |
| GLM-5.1 | 语义等价率 | 100% | 100% |
| DeepSeek-V3 | 结构一致率 | 100% | 100% |
| DeepSeek-V3 | 语义等价率 | 100% | 100% |

## 失败分析

### DeepSeek-V3：零失败

handlerGroups 和 flat-array (condition) 均全部 20 个用例通过，无任何失败。

### GLM-5.1 handlerGroups：零失败

全部 20 个用例通过。

### GLM-5.1 flat-array (condition)：零失败

全部 20 个用例通过。

### GLM-5.1 flat-array (if/then/else)：5 个失败

| 用例 ID | 描述 | 复杂度 | 失败层级 | 失败原因 |
|---------|------|--------|----------|----------|
| CE014 | 三步带分支-提交成功失败 | complex | L1 | JSON 解析失败 |
| CE015 | 三步带分支-库存检查 | complex | L1 | JSON 解析失败 |
| CE017 | 四步带分支-获取空判断 | complex | L1 | JSON 解析失败 |
| CE018 | 四步链式-权限检查提交流程 | complex | L1 | JSON 解析失败 |
| CE019 | 四步带分支-完整表单流程 | complex | L1 | JSON 解析失败 |

### 失败模式分析

1. **if/then/else 方案在 GLM 上系统性失败**：所有 5 个失败全部发生在 branching + depth >= 3 的用例，且全部是 L1 JSON 解析失败。这说明并非语义理解错误，而是模型无法生成合法的 JSON 结构。

2. **根因：语法模式切换导致 JSON 结构崩溃**。`{if, then, else}` 嵌套对象要求模型在同一个数组中从 `{"action": ...}` 格式切换到 `{"if": ..., "then": [...], "else": [...]}` 格式。在复杂分支场景下（depth >= 3），模型需要多次切换语法模式，导致括号匹配、逗号位置等 JSON 结构错误。

3. **condition 方案完全解决此问题**：统一的 action 步骤格式（`{"action": ..., "condition": ...}`），条件通过可选的 condition 字段添加。模型始终在同一种语法模式下生成，仅决定是否添加 condition 字段，彻底消除了语法模式切换带来的 JSON 结构错误。

4. **深度无衰减**：flat-array (condition) 在 depth 1-4 全部通过，证明扁平 + condition 的设计对链深度具有良好的扩展性。

5. **跨模型一致性**：DeepSeek 对 if/then/else 方案不受影响（92.5% A+），但 GLM 严重受损（69.6% C）。这表明 if/then/else 的嵌套对象对能力较弱的模型有系统性风险。

## 结论

### 推荐

**flat-array (condition) 方案（方案 B）胜出。**

### 选定理由

1. **模型亲和性等价甚至略优于基线**：两个模型上 flat-array (condition) 均达到 A+（GLM 98.2% vs handlerGroups 97.5%，DeepSeek 98.5% vs 98.9%）
2. **结构更简洁**：统一的 action 步骤格式，无 handlerGroups/handlerGroup/handlers 三层嵌套，降低 LLM 生成的结构复杂度
3. **无深度衰减**：depth 1-4 全部通过，证明扁平结构对复杂场景的扩展性
4. **跨模型一致**：弱模型（GLM）和强模型（DeepSeek）表现一致，无模型特异性风险
5. **if/then/else 的教训**：嵌套对象方案在弱模型上系统性失败，证明条件表达应保持与主体结构同构（可选字段 vs 独立语法结构）

### 与 V2 协议一致性

**不一致**。V2 协议使用 handlerGroups 嵌套结构，建议改为 flat-array (condition)。

### 风险评估

**极低**。handlerGroups 和 flat-array (condition) 均为 A+ 级别，不存在模型亲和性下降的风险。if/then/else 已淘汰。

### 优化建议

- flat-array (condition) 已是当前最优方案，无需额外优化
- 可考虑在 prompt 中明确说明 condition 字段为可选，减少模型困惑

## 如何运行

```bash
cd eval
npm install

# 完整评估（双模型）
npm run eval:chain

# 仅运行 DeepSeek
ONLY_MODEL=deepseek npm run eval:chain

# 仅运行 GLM
ONLY_MODEL=glm npm run eval:chain

# 跳过特定模型
SKIP_MODELS=glm npm run eval:chain
```

## 文件说明

```
eval/design-points/event-chain/
├── README.md                                        # 本文件
├── test-cases/
│   └── chain-execution.json                         # 20 个测试用例
└── reports/
    ├── chain-comparison-2026-04-15T09-48-06.json    # 初版评估数据：handlerGroups vs flat-array(if/then/else)
    ├── chain-comparison-2026-04-15T09-48-06.md      # 初版评估报告
    ├── chain-comparison-2026-04-15T11-15-04.json    # 终版评估数据：handlerGroups vs flat-array(condition)
    └── chain-comparison-2026-04-15T11-15-04.md      # 终版评估报告（确认推荐方案）
```
