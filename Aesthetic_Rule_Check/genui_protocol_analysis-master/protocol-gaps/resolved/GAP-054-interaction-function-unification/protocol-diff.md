# GAP-054 协议修改

## 修改 1: 新增 §3.4 扩展函数

- 位置: `specification/harmonyos-a2ui-protocol.md` §3.4
- 修改前: `getRadioValue`、`getCheckboxGroupValues`、`getToggleValue`、`getSelectValue` 单独位于 §3.5 “扩展内置函数”；`break`、`sendToAssistant`、`setDataModel`、`setAttributes`、`scrollTo`、`navigate` 位于 §4.3.2 “交互行为”。
- 修改后: 新增 §3.4 “扩展函数”，统一列出上述 10 个可调用能力，并增加“仅用于交互”列。
- 理由: 统一 `{call,args}` 调用心智模型，并把返回类型收敛到函数定义中，减少模型在“函数”和“行为”之间切换导致的生成错误。

## 修改 2: 事件监听章节顺延为 §3.5

- 位置: `specification/harmonyos-a2ui-protocol.md` §3.5
- 修改前: `### 3.4 事件监听与交互`，子章节为 §3.4.1 到 §3.4.4。
- 修改后: `### 3.5 事件监听与交互`，子章节顺延为 §3.5.1 到 §3.5.4。
- 理由: 为新增 §3.4 扩展函数腾出章节，并保持扩展协议结构为“组件/样式/函数/事件/表达式”。

## 修改 3: 删除旧 §3.5 扩展内置函数

- 位置: `specification/harmonyos-a2ui-protocol.md` 原 §3.5
- 修改前: 单独描述 4 个 getXxx 函数。
- 修改后: 旧章节删除，内容合并进入 §3.4。
- 理由: 避免同一类 call 形态在多个章节重复描述。

## 修改 4: 同步锚点和修改记录

- 位置: `specification/harmonyos-a2ui-protocol.md` 修改记录、§4.3
- 修改前: 多处链接仍指向 `#34-事件监听与交互`、`#344-自定义行为扩展` 等旧锚点。
- 修改后: 更新为 `#35-事件监听与交互`、`#343-自定义扩展函数`，并同步历史记录中的章节号。
- 理由: 保持文档内部链接可用，避免章节号误导。

## 修改 5: 删除 EventHandler.returnType 字段

- 位置: `specification/harmonyos-a2ui-protocol.md` §3.5.1
- 修改前: EventHandler 数据结构表包含 `returnType` 字段，用于声明行为返回值类型。
- 修改后: 删除 `returnType` 字段，EventHandler 仅作为函数调用包装层，返回值类型由 `call` 指向的函数定义负责。
- 理由: 避免在 EventHandler 和函数定义两处重复声明返回类型，减少协议概念冗余。

## 修改 6: 自定义扩展机制从 EventHandler 移到扩展函数

- 位置: `specification/harmonyos-a2ui-protocol.md` §3.4.3, §3.5
- 修改前: §3.5.4 “自定义行为扩展”在事件监听章节中通过 `handlers` 定义自定义交互行为。
- 修改后: 删除 §3.5.4，在 §3.4 新增“自定义扩展函数”；扩展 catalog 通过 `functions` 定义函数的 `args`、`returnType` 和 `interactionOnly`，EventHandler 仅通过 `call` 引用函数。
- 理由: EventHandler 已定位为函数调用包装器，扩展点应属于函数系统而不是事件监听包装器。

## 修改 7: 删除调用处 returnType 示例

- 位置: `specification/harmonyos-a2ui-protocol.md` §3.4.2
- 修改前: `action.event.context` 中的 `{ call, args }` 示例同时带有 `returnType`。
- 修改后: 调用对象只保留 `call` 和 `args`，返回类型由 §3.4.1/§3.4.3 的函数定义声明。
- 理由: 避免调用处和函数定义重复声明返回类型。

## 修改 8: 删除 §4.3.2 交互行为附录

- 位置: `specification/harmonyos-a2ui-protocol.md` §4.3
- 修改前: §4.3 同时包含事件监听表和 §4.3.2 “交互行为”表/示例。
- 修改后: §4.3 改为“事件监听附录”，仅保留事件类型、触发条件和事件上下文数据；可调用函数统一引用 §3.4 “扩展函数”。
- 理由: §4.3.2 与 §3.4 扩展函数重复，且“交互行为”概念会干扰 `EventHandler = 函数调用包装器` 的新模型。

## 修改 9: 刷新 §4.6.2 extended schema

- 位置: `specification/harmonyos-a2ui-protocol.md` §4.6.2
- 修改前: schema 中 `EventHandler` 仍包含 `returnType`；顶层使用 `handlers` 注册预定义行为；Button 未声明原生 `action` 属性；schema 文案仍使用 custom behaviors / catalog handlers 旧概念。
- 修改后: 删除 `EventHandler.returnType`，新增 `FunctionCall` 和 `ExtendedFunctionDefinition`；顶层 `handlers` 迁移为 `extendedFunctions`，包含 §3.4.1 的 10 个扩展函数；新增 getXxx 参数定义；Button 按原生协议通过 `common_types.json#/$defs/Action` 增加可选 `action` 属性；表达式函数 `size()` 保持在 `$defs.Function`，不纳入 `extendedFunctions`。
- 理由: schema 与 §3.4/§3.5 的最终设计保持一致：扩展函数定义返回类型，调用处 `{call,args}`，EventHandler 只负责事件链包装。
