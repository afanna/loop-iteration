# GAP-004: 组件命名 Extended 前缀 → unified-name + catalogId 隔离

## 问题描述

当前协议规定所有扩展组件以 `Extended.` 为前缀命名（如 `Extended.Text`、`Extended.Button`）。亲和性评估显示 unified-name（无前缀，通过 `catalogId` 区分来源）模型亲和性更优。

**核心问题**：
1. `Extended.` 前缀增加 token 成本（每组件名 ~3 tokens vs ~1 token）
2. GLM 模型下 unified-name 一致性 (D6) 达 100%，而 extended-prefix 仅 87.5%
3. CN14 用例（Radio 组件）中，unified-name 是唯一通过 GLM 的策略
4. 带前缀的组件名在 LLM 训练数据中频率更低，导致识别偏差

## 影响范围

- **协议章节**: §3.1, §3.2, §3.6, §4.3, §4.4, JSON Schema（全文所有 `Extended.XXX` 引用）
- **测试分类**: FP-01, FP-02
- **Prompt 文件**: `eval/prompts/protocol-harmonyos-extended.md`, `protocol-harmonyos-inline.md`
- **Few-shot**: `eval/src/prompt/few-shot-examples.ts`

## 候选修复方案

**方案：unified-name + catalogId 隔离**（推荐，A+ 99.6%）

- 移除所有 `Extended.` 前缀，组件名与原生统一（如 `Text`、`Button`）
- 扩展组件通过 `catalogId` 字段区分来源：`"catalogId": "harmonyos"` 表示鸿蒙扩展组件
- 无 `catalogId` 或 `catalogId: "a2ui"` 表示 A2UI 原生组件
- 第三方可注册自己的 catalog

## 验证计划

- **类型**: 实质性修复 — affinity-design A/B 对比验证 ✅ 已完成
- **评估维度**: 6 维评分 (D1-D6)
- **测试用例**: 15 个（component-naming.json）
- **预期**: unified-name 达到 A 级 (≥80%)

## 评估报告

- eval/design-points/component-naming/reports/component-naming-comparison-2026-04-18T23-41-42.* — DeepSeek-V3
- eval/design-points/component-naming/reports/component-naming-comparison-2026-04-22T07-42-45.* — GLM-5.1 (max_tokens=20480)

### 评估结论

| 方案 | DeepSeek-V3 | GLM-5.1 | 平均 MA | 等级 |
|------|-------------|---------|---------|------|
| **unified-name** | **100.0% (A+)** | **99.2% (A+)** | **99.6%** | **A+** |
| extended-prefix（当前） | 100.0% (A+) | 95.5% (A+) | 97.8% | A+ |
| short-prefix | 100.0% (A+) | 95.5% (A+) | 97.8% | A+ |

**推荐 unified-name + catalogId 隔离**，理由：
1. 模型亲和性最优（A+ 99.6%）
2. 消除前缀 token 成本
3. LLM 对无前缀名称识别更准确
4. GLM D5/D6 均达 100%
5. 通过 `catalogId` 解决组件名冲突

## 最终结论

**已合入** — 2026-05-01，commit `1dfec4e`。

全量回归 (npm run eval:full-protocol, 101 用例) 结果:
- glm-5.1: MA 99.4% (A+), 无命名相关退化
- deepseek-chat: MA 98.6% (A+), D6 一致性从 96% 跳至 100% (+4pp)，验证了统一命名消除一致性问题的假设
- component 分类: 双模型持平，无退化
- integration 分类: 双模型均提升 10pp

统一命名 + catalogId 隔离方案成功落地，协议命名规则从 `Extended.` 前缀迁移至统一命名。
