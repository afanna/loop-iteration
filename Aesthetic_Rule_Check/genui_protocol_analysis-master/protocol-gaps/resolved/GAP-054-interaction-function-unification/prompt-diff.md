# GAP-054 Prompt 修改

## 修改: protocol-summary.md

- 位置: `eval/prompts/protocol-summary.md`
- 修改前: 摘要仍使用旧的 `listeners` 包装层、`sendToLLM`、Action 对象、`returnType` 调用处声明等旧交互模型。
- 修改后: 刷新为当前协议模型：事件名直接作为组件属性；EventHandler 是 `{call,args,as,condition}` 函数调用包装器；扩展函数统一使用 `{call,args}`；调用处不写 `returnType`；`sendToAssistant` 替代 `sendToLLM`；Button `action` 保持 A2UI 原生结构。
- 理由: 该文件由多数评估入口通过 `loadProtocolSummary()` 注入 System Prompt，必须与 spec 保持一致。

## 修改: protocol-harmonyos-extended.md

- 位置: `eval/prompts/protocol-harmonyos-extended.md`
- 修改前: 完整协议评估摘要仍使用旧事件/行为描述，缺少 GAP-054 的扩展函数统一建模说明。
- 修改后: 同步 §3.4/§3.5 最终设计：新增扩展函数清单、`action.event.context` 函数调用示例、EventHandler 包装器说明、事件上下文说明，并明确 `size()` 是表达式函数而非 `{call,args}` 扩展函数。
- 理由: `eval-full-protocol.ts` 通过 `loadFullProtocolSummary()` 加载该文件，完整协议评估需要看到最新协议。

## 修改: inline prompt 摘要

- 位置: `eval/prompts/protocol-inline-summary.md`, `eval/prompts/protocol-harmonyos-inline.md`
- 修改前: inline 摘要仍保留旧 Action 对象格式、`sendToLLM` 和旧事件动作描述。
- 修改后: 同步为事件名直接属性、EventHandler 包装器、扩展函数 `{call,args}`、`sendToAssistant`、Button 原生 `action` 的当前协议表述。
- 理由: prompts 目录内不应同时存在新旧交互协议，避免后续实验误加载旧摘要。

## Few-shot 修改

本轮未修改 `eval/src/prompt/few-shot-examples.ts`。现有 prompt 摘要已补充直接示例，后续若评估发现 0-shot 稳定性不足，再补充 few-shot。
