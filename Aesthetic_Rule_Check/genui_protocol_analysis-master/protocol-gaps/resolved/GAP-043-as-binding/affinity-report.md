# GAP-043 亲和性验证报告

## 验证方式

实质性修复 — affinity-design A/B 对比验证。GAP-043 改变了行为结果变量的引用语法。

根据 AGENTS.md 规范中的 Pre-modification Gate，GAP-043 的成熟度评估和验证数据由 `eval/design-points/variable-system` 的以下章节提供：

## 关键评估数据

| 指标 | 数据 |
|------|------|
| 评估框架 | `eval/src/cli/eval-variable-system.ts` |
| 协议摘要 | `eval/prompts/protocol-harmonyos-extended.md` |
| 测试用例 | T4 行为链 (10) + T5 同名冲突 (10) + T6 混合 (6) = 26 用例 |
| DeepSeek | 26/26 通过, MA 98.0% |
| GLM | 26/26 通过, MA 97.0% |

## 设计评估文档

详见 `eval/design-points/variable-system/README.md`:

- §1.3 — as 命名绑定的设计与 handlerResult 对比
- §3.5 — 决策 5: as 命名绑定 vs handlerResult 索引引用
- §2.3 — 行为链变量使用场景（场景 12-18）
- §7.1.4 — $item.fieldName 六维评分（含 T4/T5/T6 通过率）

## 报告文件

- `eval/design-points/variable-system/reports/variable-system-deepseek-2026-05-01T06-52-16.json`
- `eval/design-points/variable-system/reports/variable-system-glm-2026-05-01T08-39-59.json`
