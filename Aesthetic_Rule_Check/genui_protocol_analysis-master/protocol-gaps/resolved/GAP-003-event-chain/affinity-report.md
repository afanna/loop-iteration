# GAP-003 亲和性验证报告引用

## 评估来源

本缺口的亲和性验证通过 `eval/design-points/event-chain/` 的设计点评估完成。

## 评估报告路径

- **终版报告（确认推荐方案 B）**:
  `eval/design-points/event-chain/reports/chain-comparison-2026-04-15T11-15-04.md`
  - 对比: handlerGroups (A) vs flat-array/condition (B)
  - 双模型: DeepSeek-V3 + GLM-5.1
  - 用例数: 20

- **初版报告（淘汰方案 C）**:
  `eval/design-points/event-chain/reports/chain-comparison-2026-04-15T09-48-06.md`
  - 对比: handlerGroups (A) vs flat-array/if-then-else (C)
  - 双模型: DeepSeek-V3 + GLM-5.1
  - 用例数: 20

## 评估设计文档

`eval/design-points/event-chain/README.md` — 完整的设计背景、候选方案、测试用例分布、六维度评分、失败分析、结论。

## 评估结论摘要

| 方案 | DeepSeek MA | GLM MA | 判断 |
|------|-------------|--------|------|
| A: handlerGroups (当前) | 98.9% (A+) | 97.5% (A+) | 基线 |
| **B: flat-array/condition (推荐)** | **98.5% (A+)** | **98.2% (A+)** | **胜出** |
| C: flat-array/if-then-else | 99.2% (A+) | 79.2% (B) | 淘汰 |

**推荐理由**: 方案 B 亲和性与基线等价（均为 A+），结构更简洁，无深度衰减，跨模型一致性更好。
