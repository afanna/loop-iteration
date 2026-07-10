# GAP-004 亲和性评估报告

## A/B 对比评估

- eval/design-points/component-naming/reports/component-naming-comparison-2026-04-18T23-41-42.* — DeepSeek-V3
- eval/design-points/component-naming/reports/component-naming-comparison-2026-04-22T07-42-45.* — GLM-5.1 (max_tokens=20480)

### 结论

| 方案 | DeepSeek-V3 | GLM-5.1 | 平均 MA |
|------|-------------|---------|---------|
| **unified-name** | 100.0% (A+) | **99.2% (A+)** | **99.6%** |
| extended-prefix (当前) | 100.0% (A+) | 95.5% (A+) | 97.8% |

## 全量回归

- eval/reports/full-protocol-2026-05-01T15-36-07.md — 101 用例全量评估

### 结果

| 模型 | MA (基线 → GAP-004) | D6 (基线 → GAP-004) |
|------|---------------------|---------------------|
| glm-5.1 | 99.5% → 99.4% | 100% → 100% |
| deepseek-chat | 97.7% → **98.6%** | 96% → **100%** |

无命名相关退化，deepseek-chat 一致性和鲁棒性显著提升。
