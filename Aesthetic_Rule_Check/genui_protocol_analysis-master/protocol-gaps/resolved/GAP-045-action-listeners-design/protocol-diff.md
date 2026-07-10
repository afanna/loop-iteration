# GAP-045 协议修改

## 修改 1: §3.4 清理示例中残留 `id` + 增加设计决策说明

- 位置: specification/harmonyos-a2ui-protocol.md §3.4
- 修改前: 两个示例均含 `"id": "validate_form"`，无设计决策说明
- 修改后: 移除 `id` 字段，新增"设计决策"段落说明为何 listeners 不混合 action
- 理由:
  1. `id` 是 `$handlerResult["id"]` 时代的残留，GAP-043 已从 Handler interface 删除
  2. 设计决策说明防止未来有人提议混合 action + listeners

## 修改 2: §3.5 规则 6 更新

- 位置: specification/harmonyos-a2ui-protocol.md §3.5 line 556
- 修改前: "交互行为中的id和type不可使用"
- 修改后: "交互行为中的call和as不可使用（这些字段标识行为类型和变量绑定，不可动态计算）"
- 理由: `id` 和 `type` 已不存在于 Handler interface，应约束实际存在的字段 `call` 和 `as`

## 修改 3: §4.3.2 各行为示例清理 `id`

- 位置: specification/harmonyos-a2ui-protocol.md §4.3.2
- 涉及行为: setDataModel, sendToLLM, setAttributes, navigate, scrollTo
- 修改前: 每个示例均有 `"id": "..."`
- 修改后: 移除所有 `id` 字段
- 理由: 与 Handler interface 保持一致

## 修改 4: JSON Schema catalog 示例清理 `id`

- 位置: specification/harmonyos-a2ui-protocol.md JSON Schema 章节
- 涉及: setDataModel examples (2个), navigate example (1个)
- 修改前: 示例中含 `"id": "set_loading"`, `"id": "delete_item"`, `"id": "navigate_to_tab"`
- 修改后: 移除所有 `id` 字段
- 理由: 与 Handler interface 保持一致
