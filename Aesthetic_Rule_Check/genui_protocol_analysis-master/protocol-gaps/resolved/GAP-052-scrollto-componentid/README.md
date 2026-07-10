# GAP-052: scrollTo 行为缺少 componentId — 无法指定目标 List 组件

## 问题描述

`scrollTo` 行为当前定义为：

```json
{
  "call": "scrollTo",
  "args": {
    "xOffset": 0,
    "yOffset": 0
  }
}
```

缺少 `componentId` 参数，运行时无法确定要滚动哪个 List 组件。对比同表的对标 action：

| Action | 目标参数 | 
|--------|---------|
| `setAttributes` | `id`（指定要修改属性的组件） |
| `navigate` | `componentId`（指定 Navigation 组件） |
| **`scrollTo`** | **缺失** |

同时 spec 描述为"List滑动**顶部或底部**"，与参数语义（任意偏移量）不匹配。

附加问题：测试用例 FP0511 中 scrollTo handler 残留 `id` 字段（GAP-043 已删除）。

## 影响范围

- 协议章节: §4.3.2（预定义行为表 + scrollTo 详细说明 + 示例）; JSON Schema §ScrollToArgs + scrollTo example
- Prompt 文件: protocol-harmonyos-extended.md、protocol-summary.md
- 测试用例: FP-05-events.json FP0511

## 修复方案

1. scrollTo 新增 `componentId` 参数（string，必需），用于指定目标 List 组件
2. 行为描述从"List滑动顶部或底部"改为"滚动 List 到指定位置"
3. 更新 §4.3.2 行为表、参数表、示例
4. 更新 JSON Schema ScrollToArgs + example
5. 更新 prompt 文件
6. 修复测试用例：补充 componentId，移除残留 id

## 验证计划

**类型**: 简化路径（类比 GAP-043，修复 broken 定义，全量回归确认无退化）

1. 修改 spec + prompt + test-case
2. 运行 `npm run eval` 全量回归
3. 若 scrollTo 用例 0-shot 通过率低 → 补一个 few-shot 示例

## 评估报告

- `eval/reports/report-2026-05-08T01-26-29.json`（35/36, 97.2%，L005 Grid预存失败，scrollTo 修改无退化）

## 最终结论

全量回归通过（35/36, 97.2%），唯一失败为 L005 Grid 布局（预存问题，非本次变更引入）。

修改内容：
- §4.3.2 行为表: scrollTo 新增 componentId 参数，描述改为"滚动 List 到指定位置"
- §4.3.2 scrollTo 详细说明: 更新示例 + 参数表增加 componentId
- JSON Schema ScrollToArgs: 新增 componentId property，required 设为 ["componentId"]
- JSON Schema scrollTo example: 补充 componentId，移除残留 id
- protocol-harmonyos-extended.md / protocol-summary.md: 同步更新
- test-case FP0511: 任务描述更新 + validation 增加 componentId 检查 + 修复 Extended.Button→Button
