# GAP-064 Prompt 修改

## 修改: eval/prompts/protocol-summary.md
- 所有 `$__DataModel` → `$__dataModel`（~10 处）
- 所有 `$__WidthBreakpoint` → `$__widthBreakpoint`（~2 处）
- 所有 `$__ColorMode` → `$__colorMode`（~1 处）

## 修改: eval/prompts/protocol-harmonyos-extended.md
- 同上三组替换

## 修改: eval/prompts/protocol-inline-summary.md
- 同上三组替换

## 修改: eval/prompts/protocol-harmonyos-inline.md
- 同上三组替换

## Few-shot 修改
- eval/src/prompt/few-shot-examples.ts: ~8 处替换

## 引导规则修改
- eval/src/prompt/prompt-builder.ts:
  - 变量名引导文本: `$__DataModel` → `$__dataModel`, `$__WidthBreakpoint` → `$__widthBreakpoint`, `$__ColorMode` → `$__colorMode`
  - L161 strategy=flat 替换规则: `$__WidthBreakpoint` → `$__widthBreakpoint`

## 测试用例修改
- eval/test-cases/expressions.json: `$__WidthBreakpoint` → `$__widthBreakpoint`
- eval/test-cases/full-protocol/FP-04-expressions.json: ~12 处
- eval/test-cases/full-protocol/FP-05-events.json: ~6 处
- eval/test-cases/full-protocol/FP-06-conditional-list.json: ~15 处
- eval/test-cases/full-protocol/FP-07-responsive.json: ~25 处
- eval/test-cases/full-protocol/FP-08-integration.json: ~8 处

## 历史脚本修改
- eval/src/cli/ 下 9 个历史设计点脚本同步更新
