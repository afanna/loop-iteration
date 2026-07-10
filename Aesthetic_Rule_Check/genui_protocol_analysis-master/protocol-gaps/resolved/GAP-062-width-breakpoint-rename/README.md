# GAP-062: __WindowWidthBreakpoint → __WidthBreakpoint 重命名

## 问题描述

当前 `$__WindowWidthBreakpoint` 以"窗口"为参照物计算断点。在生成式 UI 场景中，A2UI Surface 常被限制在外层容器内，窗口尺寸变化而容器未变时，生成内容不应受影响。断点的参照物应为 A2UI Surface 所在的外层容器，而非应用窗口。

## 修复方案

1. 全局重命名：`__WindowWidthBreakpoint` → `__WidthBreakpoint`（~250 处，36 个文件）
2. 语义描述更新：spec 和 JSON schema 中将"窗口宽度"改为"容器/A2UI Surface 外层容器宽度"
3. 策略感知变体同步：`$data.windowBreakpoint` → `$data.widthBreakpoint`、`$WindowWidthBreakpoint` → `$WidthBreakpoint`

## 影响范围

- 协议规范（3 文件）、JSON Schema、EBNF
- Prompt 摘要（4 文件）
- 测试用例（4 活跃 + 5 历史设计点）
- Eval 源码（3 文件）
- 文档（4 文件）

## 验证方式

轻量修复 — 全量回归验证。运行 `npm run eval` + `npm run eval:full-protocol`，确认通过率 ≥ 修改前。

## 评估报告

- `eval/reports/` — 全量回归 (`npm run eval`): **100% (36/36)**，双模型均无退化
- `eval/reports/full-protocol-2026-06-05T13-52-04.md` — 完整协议: deepseek-chat **96.4% (A+)**，FP-07 响应式测试全部通过

## 最终结论

**已合入。** `$__WindowWidthBreakpoint` → `$__WidthBreakpoint` 重命名，断点参照物从应用窗口改为 A2UI Surface 外层容器。全量回归 100% 无退化，完整协议 A+。commit `9e28b47`。
