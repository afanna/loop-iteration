# GAP-003: 事件链执行方式 — handlerGroups vs flat-array

## 阶段 1：发现与登记

**发现日期**: 2026-04-15

**问题描述**:

协议章节 3.4（交互扩展）定义了事件触发的多步行为执行结构，采用 handlerGroups 三层嵌套：

```
listeners → handlerGroups[] → handlers[]
```

核心问题：**事件链中多步行为的执行结构，是嵌套对象还是扁平数组？条件分支如何表达？** 三层嵌套是否对 LLM 友好？是否有更简洁的等价方案？

**影响范围**:
- 协议章节: 3.4（交互扩展）、4.3（交互）、4.3.2（交互行为）
- 测试分类: FP-05 (events)

**候选方案**:

| 方案 | 名称 | 结构 | 说明 |
|------|------|------|------|
| A | handlerGroups | 三层嵌套 `listeners→handlerGroups[]→handlers[]` | 鸿蒙 V2 当前方案 |
| B | flat-array (condition) | 扁平数组，action 级 condition 字段 | 简化方案 |
| C | flat-array (if/then/else) | 扁平数组 + `{if,then,else}` 嵌套 | 备选方案 |

## 阶段 2：亲和性验证

**验证方式**: affinity-design A/B 对比（实质性修复）

**验证计划**:
- 在 `eval/design-points/event-chain/` 创建评估
- 20 个测试用例，覆盖 depth 1-4，类型 single/sequential/conditional/branching
- 双模型评估：DeepSeek-V3 + GLM-5.1
- 6 维度评分 + D4 学习曲线 + D6 一致性

**评估报告**:
- 初版（淘汰方案C）: `eval/design-points/event-chain/reports/chain-comparison-2026-04-15T09-48-06.md`
- 终版（确认推荐）: `eval/design-points/event-chain/reports/chain-comparison-2026-04-15T11-15-04.md`
- 设计文档: `eval/design-points/event-chain/README.md`

### 评估结论

| 方案 | DeepSeek-V3 | GLM-5.1 | 综合判断 |
|------|-------------|---------|----------|
| A: handlerGroups | 98.9% (A+) | 97.5% (A+) | 基线，A+ 级 |
| **B: flat-array (condition)** | **98.5% (A+)** | **98.2% (A+)** | **推荐** |
| C: flat-array (if/then/else) | 99.2% (A+) | 79.2% (B) | 已淘汰 |

### 关键发现

1. **flat-array (condition) 在 GLM 上略优于基线**（98.2% vs 97.5%）
2. **结构更简洁**：统一的 action 步骤格式，无三层嵌套
3. **无深度衰减**：depth 1-4 全部通过
4. **if/then/else 方案系统性问题**：语法模式切换导致 GLM 在 complex 场景下 JSON 结构崩溃

### 选定方案: **B — flat-array (condition)**

## 阶段 3：导出修改

### 协议修改 (protocol-diff.md)

⚠️ **状态：评估完成，推荐修改，但尚未实际修改协议文档。** 这是本缺口待执行的动作。

修改范围：
1. `specification/harmonyos-a2ui-protocol.md` 第 3.4 节（交互扩展）
   - listeners 结构从 `{handlerGroups: [{handlers: [...]}]}` 改为 `[{action: ..., condition: ...}]`
2. 第 4.3 节（交互）
   - 事件对象结构从嵌套改为扁平
3. 第 4.3.2 节（交互行为）
   - 行为定义增加 condition 字段描述

### Prompt 修改 (prompt-diff.md)

在 `eval/prompts/protocol-v2-summary.md` 中：
- 修改交互事件部分的描述，反映扁平数组结构
- 新增规则：condition 字段为可选，为真执行、为假跳过

### 新增测试用例

从 eval/design-points/event-chain/test-cases/chain-execution.json（20 个策略感知用例）中，抽取可复用的部分，加入全量测试套件的 FP-05 分类。

## 阶段 4：全量回归

⚠️ **待执行**（协议修改后才能运行）

预期动作：
1. 修改 spec + prompt-summary
2. 运行 `npm run eval`
3. 对比修改前报告 `eval/reports/full-protocol-2026-04-25T09-46-22.md`
4. 确认 FP-05 (events) 分类通过率 ≥ 修改前（100%）

## 阶段 5：归档

⚠️ **待执行**（协议修改并回归通过后）

状态: 评估完成，推荐 flat-array (condition)，等待协议修改决策。

## 追溯链

```
GAPS.md → GAP-003 (本文件)
  → eval/design-points/event-chain/README.md (设计评估)
  → eval/design-points/event-chain/reports/chain-comparison-2026-04-15T11-15-04.md (验证报告)
  → specification/harmonyos-a2ui-protocol.md §3.4, §4.3, §4.3.2 (待修改)
  → eval/prompts/protocol-v2-summary.md (待修改)
  → eval/test-cases/full-protocol/FP-05-events.json (待新增)
```
