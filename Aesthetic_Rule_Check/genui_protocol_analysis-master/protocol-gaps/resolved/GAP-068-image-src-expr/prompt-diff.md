# GAP-068 Prompt 修改

## 无 Prompt 变更

本次为 JSON Schema 与 prose 一致性对齐，**不涉及 System Prompt 或 Few-shot 修改**。

- `eval/prompts/protocol-summary.md`：第 35 行 `| Image | src |` 保持不变（摘要表无表达式列，prose §4.2.1.4 已为权威）。
- `eval/src/prompt/few-shot-examples.ts`：无新增/修改。

理由：评估 System Prompt 走 `protocol-summary.md`（人类可读摘要），不直接向 LLM 暴露 catalog JSON Schema；prose 早已声明「支持表达式: 是」，LLM 语义理解不变。
