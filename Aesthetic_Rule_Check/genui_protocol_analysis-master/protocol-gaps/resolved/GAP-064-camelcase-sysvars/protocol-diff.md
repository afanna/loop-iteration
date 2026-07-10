# GAP-064 协议修改

## 修改 1: 系统变量重命名（全局替换）

涉及三个变量的所有引用，从 `$__PascalCase` 改为 `$__camelCase`：

| 变量 | 修改前 | 修改后 |
|------|--------|--------|
| 数据模型 | `$__DataModel` | `$__dataModel` |
| 断点 | `$__WidthBreakpoint` | `$__widthBreakpoint` |
| 颜色模式 | `$__ColorMode` | `$__colorMode` |

### 影响的协议章节
- §4.2.2.2 变量系统总述
- §4.2.2.2.2 全局系统变量
- §4.2.2.2.3 DataModel 变量
- §4.4.7 / §4.4.8 EBNF 语法规则
- §4.5.6 优先级表
- JSON Schema (`extended_catalog.json`) — 属性键名 + 描述 + 示例
- EBNF (`expression_grammar.ebnf`) — 语法规则中的字面量

### 理由
1. PascalCase 在 JS/TS 生态中通常表示类型名/类名，与实际语义（运行时值实例）不一致
2. 与表达式体系中其他变量（`$item`, `$index`, `$context`）的 camelCase 风格统一
3. `$__` 前缀不变，优先级保护机制不受影响

## 修改 2: 修改记录表
- 位置: specification/harmonyos-a2ui-protocol.md 头部 `## 修改记录`
- 新增 GAP-064 记录
- 修复 GAP-046/051/062 历史记录中被全局替换误伤的变量名（恢复为原始值）
