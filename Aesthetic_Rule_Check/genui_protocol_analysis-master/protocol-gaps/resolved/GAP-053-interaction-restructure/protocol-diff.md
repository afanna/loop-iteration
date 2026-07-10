# GAP-053 协议修改

## 修改 1: §3.4 标题与核心描述
- 位置: specification/harmonyos-a2ui-protocol.md 第 506-527 行
- 修改前: 标题"交互扩展"，使用 `listeners` 对象包裹事件
- 修改后: 标题"事件监听与交互"，事件名直接作为组件属性
- 理由: 亲和性验证确认直接属性方案更优（GAP-053 A/B 对比 GLM 100% vs 96.5%）

## 修改 2: §3.4 Button action 属性说明
- 位置: specification/harmonyos-a2ui-protocol.md 第 541-578 行
- 修改前: `listeners` → `onClick: [...]` 包裹在 listeners 内
- 修改后: 通用交互使用 `onClick: [...]` 直接属性
- 理由: 统一事件监听方式，去除 listeners 包装层

## 修改 3: §3.4 设计决策段
- 位置: specification/harmonyos-a2ui-protocol.md 第 580-601 行
- 修改前: "为何扩展协议使用 listeners + flat-action"
- 修改后: "为何扩展协议使用事件名直接属性 + flat-action"，新增第 5 条 GAP-053 验证数据
- 理由: 更新设计决策，反映新的结构选择

## 修改 4: §4.1.2 扩展组件公共属性
- 位置: specification/harmonyos-a2ui-protocol.md 第 907 行
- 修改前: `均还包含styles和listeners两个公共属性`
- 修改后: `均还包含styles公共属性和支持事件监听（事件名直接作为组件属性）`
- 理由: listeners 不再是独立属性，事件名直接作为组件属性

## 修改 5: §4.1.2 Button action 描述
- 位置: specification/harmonyos-a2ui-protocol.md 第 914 行
- 修改前: `action 优先级高于 listeners：有 action 时只触发 action，没有 action 时触发 listeners`
- 修改后: `action 优先级高于事件监听：有 action 时只触发 action，没有 action 时触发事件监听`

## 修改 6: §4.3 交互章节
- 位置: specification/harmonyos-a2ui-protocol.md 第 1174-1211 行
- 修改前: `通过新增listeners字段定义交互事件`，Event对象结构说明
- 修改后: `事件监听直接作为组件属性使用`，事件属性结构说明
- 理由: 结构变更的核心体现

## 修改 7: §4.3.2 Handler → Action
- 位置: specification/harmonyos-a2ui-protocol.md 第 1308-1317 行
- 修改前: `每个交互行为（Handler）是一个对象`，`interface Handler`
- 修改后: `每个交互行为（Action）是一个对象`，`interface Action`
- 理由: 术语统一，Handler 改名 Action

## 修改 8: §4.5.4.2 行为链变量示例
- 位置: specification/harmonyos-a2ui-protocol.md 第 2189-2205 行
- 修改前: `listeners: { onClick: [...] }`
- 修改后: `onClick: [...]` 直接属性

## 修改 9: JSON Schema 重构
- 位置: specification/harmonyos-a2ui-protocol.md 第 3700-3771 行
- 修改前: `Listeners` + `EventHandler` + `Handler`（三层定义）
- 修改后: 事件属性直接在 ExtendedComponent properties + `ActionChain` + `Action`
- 理由: Schema 结构与协议变更对齐

## 修改 10: JSON Schema 描述文本
- 多处 description 中 `handler` → `action`
- `handlerRestriction` → `actionRestriction`

## 修改 11: 修改记录表
- 新增 GAP-053 修改记录行
