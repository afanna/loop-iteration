# prompts — 协议摘要模板

## 文件

- `protocol-summary.md` — 鸿蒙智能体UI协议v2.0 的摘要，作为评估时的 System Prompt 上下文

## 用法

由 `eval/src/config.ts` 的 `loadProtocolSummary()` 加载，注入到所有评估的 System Prompt 中。

修改此文件会影响所有评估结果，谨慎修改。

## 同步规则

`protocol-summary.md` 是 `specification/harmonyos-a2ui-protocol.md` 的精简版。当 spec 中以下内容发生变更时，必须同步更新本文件：

- 语法规则（表达式 `{{ }}`、变量前缀等）
- 组件列表或组件属性
- 事件类型或 EventHandler 结构
- 样式属性
- 扩展函数清单

更新后修改文件头部的版本标记（最后同步日期、commit hash）。
