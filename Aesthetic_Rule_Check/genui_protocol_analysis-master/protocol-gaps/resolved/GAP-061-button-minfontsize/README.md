# GAP-061: Button 扩展组件补充 minFontSize

## 问题描述

Button 组件已有 `maxFontSize` 样式，且其描述明确写了"需配合 **minFontSize** 以及 maxLines 或布局大小限制使用"，但 `minFontSize` 从未被定义。Text 和 TextInput 均有 `maxFontSize` + `minFontSize` 完整配对，Button 缺失此属性导致自适应字号功能不完整。

## 影响范围

- 协议章节: §4.2.1.4 (Button 样式)
- JSON Schema: Button 定义
- 测试分类: 无现有关联测试

## 修复方案

Button 样式表新增 `minFontSize`，参照 Text 的 `minFontSize` 定义，调整为不涉及 `maxLines`（Button 无此属性）。

## 验证方式

轻量修复 — 全量回归验证。

## 评估报告

- `eval/reports/` — 全量回归 (`npm run eval`): glm 100%, deepseek 97.2%, 无退化
- `eval/reports/full-protocol-2026-06-05T13-21-13.md` — 完整协议评估: deepseek-chat 96.8% (A+)

## 最终结论

**已合入。** Button 扩展组件新增 `minFontSize` 样式，与 `maxFontSize` 配对，与 Text/TextInput 保持一致。全量回归无退化，完整协议 A+。commit `7e3aaad`。
