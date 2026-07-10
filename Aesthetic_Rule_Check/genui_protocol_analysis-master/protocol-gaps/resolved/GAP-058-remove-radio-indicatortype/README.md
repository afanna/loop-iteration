# GAP-058: Radio 删除 indicatorType 属性

## 问题描述
Radio 组件定义了 `indicatorType` 属性，用于配置单选框的选中样式（tick/dot）。该属性需要删除。

## 影响范围
- 协议章节: §4.2 Radio 组件定义
- 测试分类: FP-01

## 修改位置
1. **specification/harmonyos-a2ui-protocol.md** 第 1925 行
   - 删除 Radio 组件属性表中的 `indicatorType` 行

2. **specification/json/extended_catalog.json**
   - 删除 Radio 组件 schema 中的 `indicatorType` 字段定义

## 验证计划
**轻量修复 — 全量回归验证**
1. 修改协议文档（spec + JSON Schema）
2. 同步更新 `eval/prompts/protocol-v2-summary.md`
3. 运行 `npm run eval` 进行全量回归
4. 确认通过率 ≥ 修改前，FP-01 分类无退化

## 评估报告
<待验证完成后填写>

## 最终结论
<归档时填写>
