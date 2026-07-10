# GAP-065: Image 组件显式声明不支持 SVG 图源

## 问题描述

Image 扩展组件的 `src` 属性当前描述为"图片数据源（本地或网络）"，未显式声明对 SVG 格式的支持情况。这导致协议语义模糊：

- LLM 可能生成 `data:image/svg+xml;base64,...` 格式的 src，但客户端渲染层不支持 SVG 解析
- `objectFit` 的 `matrix` 模式已注明"不支持svg图源"，但 `src` 属性本身未声明排除 SVG
- 需要在 `src` 属性描述中显式声明 SVG 不受支持（包括 base64 编码的 SVG data URI）

## 影响范围

- 协议章节: §4.2.1.4（Image 扩展组件属性）
- JSON Schema: `extended_catalog.json` Image.src description
- 测试分类: FP-01（基础组件）

## 候选修复方案

**方案 A（推荐）：在 src 描述中显式声明不支持 SVG**

在 Image 组件 `src` 属性描述中增加说明："不支持 SVG 格式，包括 base64 编码的 SVG（如 data:image/svg+xml;base64,...）。"

优点：
- 不改变协议结构，仅补充描述
- 与 objectFit matrix 模式已有声明一致
- 避免歧义，降低 LLM 生成不可渲染 src 的概率

## 验证计划

轻量修复 — 全量回归验证：
1. 修改 specification + JSON Schema + prompts
2. 运行 `npm run eval`
3. 确认各分类通过率无退化

## 评估报告

- eval/reports/report-2026-06-13T08-40-05.md
- glm-5.1: 100% (36/36), deepseek-chat: 97.2% (35/36)
- deepseek-chat 唯一失败为 CR001（EventHandler condition 字段缺失），与 SVG 修改无关，属既有问题

## 最终结论

轻量修复完成。Image 组件 `src` 属性已显式声明不支持 SVG 格式（包括 base64 编码的 SVG data URI）。全量回归无退化。
