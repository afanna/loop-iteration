# GAP-060 Prompt 修改

## 无需修改

Prompt 摘要文件（protocol-summary.md、protocol-harmonyos-extended.md 等）均未包含 Divider color 默认值或 Text maxLines 属性的描述。本次仅修改协议规范和 JSON Schema 中的默认值定义，不影响 LLM 看到的 System Prompt。

## 测试用例

FP0114 (Divider) 和 FP0308 (Text maxLines) 均测试显式设置值的行为，不涉及默认值，无需修改。
