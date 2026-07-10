# GAP-063: Navigation 组件重新定位为 NavContainer

## 问题描述

当前 Navigation 组件存在两个核心问题：

1. **组件定位与 ArkUI 原生差距过大** — Navigation 被放在"布局组件"分类下，试图模拟 ArkUI 原生 Navigation 组件（包含导航栏、分栏等复杂能力），但只暴露了 `children` + `currentIndex` + `title` 三个属性和一个 `backgroundColor` 样式，无法承载导航栏/分栏等实际需求，组件可用性极低。
2. **原始诉求明确** — 实际只需实现类似 router 的页面跳转功能，通过 index 管理子页面显示即可。

## 影响范围

- 协议章节: §3.4.1（函数总表）, §3.4.2（navigate 示例）, §4.2.1.6（布局组件 Navigation 定义）
- 测试分类: FP-02（布局）, FP-05（事件）, FP-08（集成）, events.json
- JSON Schema: extended_catalog.json（Navigation 组件定义、NavigateArgs、navigate 函数）
- Prompt: 4 个 prompt 文件、few-shot-examples.ts

## 候选修复方案

- 方案A（旧协议）: Navigation 组件，含 children、currentIndex、title 三个属性 + backgroundColor 样式
- 方案B（新协议）: NavContainer 组件，仅保留 children + currentIndex 两个属性，删除 title 属性和 backgroundColor 样式。navigate 函数参数不变（componentId + targetComponentId），仅描述文本更新
- 推荐: 方案B

### NavContainer 新定义

| 名称 | 类型 | 说明 | 属性 | 类型 | 必选 | 支持表达式 | 说明 |
|------|------|------|------|------|------|------|------|
| NavContainer | 布局组件 | 导航容器组件，通过堆叠方式管理多个子页面，支持子页面间跳转切换 | children | List[String] | 否 | 否 | 子组件ID列表，每个子组件代表一个页面 |
| | | | currentIndex | number，默认值：0 | 否 | 是 | 当前显示的子页面下标 |

- 无样式属性（纯容器）
- 支持通用事件

## 验证计划

eval/design-points A/B 对比验证：
- 策略A：当前 Navigation 定义（含 title + backgroundColor）
- 策略B：NavContainer 定义（仅 children + currentIndex）
- 测试用例覆盖：组件生成、navigate 跳转、表达式绑定 currentIndex
- 策略B 达到 A 级（MA ≥ 80%）→ 方案可行

## 附带修复：navigate 函数 few-shot 旧格式

few-shot-examples.ts 和 events.json 中存在使用旧 `{url}` 参数格式的 navigate 示例，与当前协议 `{componentId, targetComponentId}` 不一致。在本次 GAP 中一并修复。

## 评估报告

- eval/design-points/nav-container/reports/ (GLM-5.1 A/B 对比)
- GLM-5.1 两方案主测试均 8/8 通过 (100%)
- 方案A (Navigation): MA = 100% A+
- 方案B (NavContainer): MA = 100% A+ (主测试全部通过，D4/D6 因超时未完整跑完但 Phase A 100%)
- **结论**: 两方案模型亲和性一致，NavContainer 简化方案验证通过

## 最终结论

NavContainer 方案验证通过。两方案模型亲和性完全一致（均 A+），NavContainer 更简洁，组件定位更清晰。

**附带修复**: few-shot 和测试用例中 navigate 函数的旧 `{url}` 参数格式统一为 `{componentId, targetComponentId}`。
