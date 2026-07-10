# GAP-063 Prompt 修改

## 修改: eval/prompts/protocol-summary.md
- 组件表: `Navigation | children, currentIndex, title` → `NavContainer | children, currentIndex`
- 函数表: `Navigation 子页面跳转` → `NavContainer 子页面跳转`

## 修改: eval/prompts/protocol-harmonyos-extended.md
- 组件表: `Navigation | 导航容器 | children, currentIndex, title` → `NavContainer | 导航容器 | children, currentIndex`
- 函数表: `Navigation 子页面跳转` → `NavContainer 子页面跳转`

## 修改: eval/prompts/protocol-inline-summary.md
- 组件列表: `` `Navigation` `` → `` `NavContainer` ``
- 函数表: `Navigation 子页面跳转` → `NavContainer 子页面跳转`

## 修改: eval/prompts/protocol-harmonyos-inline.md
- 组件列表: `` `Navigation` `` → `` `NavContainer` ``

## Few-shot 修改
- eval/src/prompt/few-shot-examples.ts:
  - event 分类示例3: navigate args 从 `{"url": "/login"}` 改为 `{"componentId": "main_nav", "targetComponentId": "login_page"}`，修复旧参数格式

## 测试用例修改
- eval/test-cases/events.json:
  - EV002: task 从 `navigate动作，传入参数url为'/home'` 改为 `navigate动作，componentId为'app_nav'，targetComponentId为'home_page'`，validation 更新
  - EV004: task 从 `navigate到'/login'` 改为 `navigate到NavContainer组件'app_nav'的子页面'login_page'`
- eval/test-cases/full-protocol/FP-02-layout.json:
  - FP0207: `Extended.Navigation` → `NavContainer`，删除 title 相关验证
- eval/test-cases/full-protocol/FP-05-events.json:
  - FP0505: hints 中 `Navigation组件` → `NavContainer组件`
- eval/test-cases/full-protocol/FP-08-integration.json:
  - FP0801: task 中 `navigate到'/home'` → `navigate跳转到NavContainer组件'app_nav'的子页面'home_page'`
