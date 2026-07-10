# 策略 B Prompt：定向生成 + 断点变化重生成

> **适用场景：** 多设备但 Token 敏感、可接受短暂加载延迟

## Prompt 文本

Prompt 文本与策略 A 完全相同。将 [strategy-a-directed.md](strategy-a-directed.md) 中的内容作为参考即可。

## 端侧额外实现

策略 B 的差异不在 Prompt，而在端侧：需要在检测到窗口断点变化时自动重新调用 LLM。

```ts
import display from '@ohos.display'
import {
  CatalogFactory,
  BASIC_CATALOG_PROTOCOL_VERSION_V09,
  PromptBuilder
} from '@arkui-genius/genui'

private currentBreakpoint: string = ''

aboutToAppear(): void {
  this.currentBreakpoint = this.getCurrentBreakpoint()
  this.buildPromptAndGenerate()

  display.on('change', (displayInfo) => {
    const newBp = this.calculateBreakpoint(displayInfo)
    if (newBp !== this.currentBreakpoint) {
      this.currentBreakpoint = newBp
      this.buildPromptAndGenerate()
    }
  })
}

private buildPromptAndGenerate(): void {
  const catalog = CatalogFactory.extended()
  const basePrompt = PromptBuilder.buildInstruction(catalog, BASIC_CATALOG_PROTOCOL_VERSION_V09)

  const breakpointPrompt = [
    '',
    '## 设备约束',
    '',
    `当前设备窗口断点为 "${this.currentBreakpoint}"。`,
    '请仅针对该断点生成 UI，无需使用 If 条件渲染或 $__widthBreakpoint 表达式。'
  ].join('\n')

  this.systemPrompt = basePrompt + '\n' + breakpointPrompt

  this.messages = [{ role: 'system', content: this.systemPrompt }]
}
```
