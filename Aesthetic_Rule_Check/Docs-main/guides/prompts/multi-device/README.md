# 多设备自适应 Prompt 参考

本目录是多设备自适应场景的 Prompt 模板参考目录。目录内容包括：

- 策略模板
  - [策略 A Prompt 参考：定向生成](strategy-a-directed.md)
  - [策略 B Prompt：定向生成 + 断点变化重生成](strategy-b-directed-regenerate.md)
  - [策略 C Prompt 参考：通用自适应 DSL 生成（完整版）](strategy-c-universal-adaptive.md)
- 通用规则
  - [多设备自适应输出规范参考](output-spec-rules.md)

> 使用前提：所有模板均需追加到 [PromptBuilder API](../../../reference/API/prompt-builder.md) 生成的 system prompt 之后。PromptBuilder 已自动注入组件 Schema、变量定义和协议格式。

---

## 快速选择

- 设备固定、不考虑横竖屏：使用 [策略 A Prompt 参考：定向生成](strategy-a-directed.md)。
- 多设备但 Token 敏感：使用 [策略 B Prompt：定向生成 + 断点变化重生成](strategy-b-directed-regenerate.md)。
- 多设备、折叠屏或旋转场景：使用 [策略 C Prompt 参考：通用自适应 DSL 生成（完整版）](strategy-c-universal-adaptive.md)。

---

相关文档：
→ [多设备自适应最佳实践](../../multi-device-best-practices.md) | → [LLM 集成](../../integrating-llm.md) | → [PromptBuilder API](../../../reference/API/prompt-builder.md)
