# GAP-063 协议修改

## 修改 1: §4.2.1.6 Navigation → NavContainer 组件定义
- 位置: specification/harmonyos-a2ui-protocol.md §4.2.1.6
- 修改前: Navigation 布局组件，含 children、currentIndex、title 三个属性 + backgroundColor 样式
- 修改后: NavContainer 布局组件，仅含 children、currentIndex 两个属性，无样式属性
- 理由: Navigation 组件与 ArkUI 原生能力差距过大，实际只需 router 式页面跳转。NavContainer 定位为纯堆叠容器，删除 title（非容器职责）和 backgroundColor（无导航栏）。

## 修改 2: §3.4.1 函数总表 navigate 说明
- 位置: specification/harmonyos-a2ui-protocol.md §3.4.1
- 修改前: `Navigation子页面跳转`，参数说明 `要操作的目标Navigation组件`
- 修改后: `NavContainer子页面跳转`，参数说明 `要操作的目标NavContainer组件`
- 理由: 组件重命名，navigate 函数参数结构不变，仅描述文本更新

## 修改 3: §3.4.2 navigate 使用示例
- 位置: specification/harmonyos-a2ui-protocol.md §3.4.2
- 修改前: `Navigation 子页面跳转`，示例中 componentId 为 `main_navigation`
- 修改后: `NavContainer 子页面跳转`，示例中 componentId 为 `main_nav_container`
- 理由: 组件重命名，示例同步更新

## 修改 4: JSON Schema extended_catalog.json
- 位置: specification/json/extended_catalog.json
- 修改前:
  - `"Navigation"` 组件 Schema（含 title 必选 + backgroundColor 样式）
  - `NavigateArgs` 描述含 "Navigation component"
  - `navigate` 函数描述含 "Navigation component"
- 修改后:
  - `"NavContainer"` 组件 Schema（无 title、无样式）
  - `NavigateArgs` 描述改为 "NavContainer"
  - `navigate` 函数描述改为 "NavContainer"
- 理由: 协议修改同步到 JSON Schema

## 修改 5: 修改记录表
- 位置: specification/harmonyos-a2ui-protocol.md 头部 `## 修改记录`
- 新增: `| 2026-06-06 | GAP-063：Navigation 组件重新定位为 NavContainer — 删除 title 属性和 backgroundColor 样式，纯堆叠容器 + navigate 子页面跳转 | §3.4.1, §3.4.2, §4.2.1.6, JSON Schema |`
