# GAP-062 Prompt 修改

## 修改: 全局重命名

- `protocol-summary.md`、`protocol-harmonyos-extended.md`、`protocol-harmonyos-inline.md`、`protocol-inline-summary.md`：所有 `$__WindowWidthBreakpoint` → `$__WidthBreakpoint`
- `prompt-builder.ts`：规则文本 + `.replace()` 正则中同步更新，包括 flat/two-layer 策略变体
- `few-shot-examples.ts`：所有示例中的变量引用同步更新

## 未修改

- breakpoint 枚举值（xs/sm/md/lg/xl）不变
- 表达式使用模式不变
- LLM 看到的使用方式完全一致，仅变量名缩短
