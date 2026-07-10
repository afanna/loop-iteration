# LLM 集成

端到端集成 LLM 时，宿主侧需要完成四件事：查询端侧能力、构建 system prompt、把 LLM 输出投递给 GenUI、把用户 Action 回传给对话上下文。

> **前置阅读：** [快速集成](quick-integration.md) | [创建 Surface](creating-surfaces.md)
>
> **相关概念：** [Agent 部署模式](../concepts/agent-deployment-models.md) | [消息格式](../reference/messages.md) | [数据流](../concepts/data-flow.md)

---

## 总体流程

```
Capabilities 查询版本与 Catalog → PromptBuilder 生成 system prompt → 调用 LLM → controller.handleMessage 渲染 → registerActionReceiver 回传交互
```

---

## 获取端侧能力

Capabilities 用于查询当前 HAR 支持的协议版本和 Catalog 标识。

```ts
import { Capabilities, CapabilityManifest } from '@arkui-genius/genui'

const manifest: CapabilityManifest = Capabilities.getCapabilities()
console.info(`A2UI 协议版本: ${manifest.supportedA2UIProtocolVersions.join(', ')}`)
console.info(`扩展协议版本: ${manifest.supportedExtendedProtocolVersions.join(', ')}`)
console.info(`Catalog: ${manifest.supportedCatalogIds.join(', ')}`)
```

这些信息适合上报给云侧 Agent 做版本协商。组件、函数和协议消息 Schema 由 PromptBuilder 生成。

---

## 构建 system prompt

```ts
import {
  Catalog,
  CatalogFactory,
  BASIC_CATALOG_PROTOCOL_VERSION_V09,
  PromptBuilder
} from '@arkui-genius/genui'

const catalog: Catalog = CatalogFactory.extended()
const systemPrompt: string = PromptBuilder.buildInstruction(
  catalog,
  BASIC_CATALOG_PROTOCOL_VERSION_V09
)
```

systemPrompt 包含协议规则、可用组件 Schema、可用函数 Schema 和消息示例，可直接作为 LLM 的 system message。需要多设备自适应时，在该文本后追加断点和 If 组件规则，详见 [多设备自适应最佳实践](multi-device-best-practices.md)。

如果云侧只需要独立 Schema，可分别生成：

```ts
const componentSchema = PromptBuilder.getComponentSchema(
  catalog,
  BASIC_CATALOG_PROTOCOL_VERSION_V09
)
const functionSchema = PromptBuilder.getFunctionSchema(
  catalog,
  BASIC_CATALOG_PROTOCOL_VERSION_V09
)
const messageSchema = PromptBuilder.getProtocolMessageSchema(
  BASIC_CATALOG_PROTOCOL_VERSION_V09
)
```

---

## 初始化控制器

```ts
import {
  CatalogFactory,
  SurfaceController,
  SurfaceControllerFactory,
  UIRendererComponent
} from '@arkui-genius/genui'

@Entry
@Component
struct LlmDrivenPage {
  @State controller: SurfaceController | null = null

  aboutToAppear(): void {
    const catalog = CatalogFactory.extended()
    this.controller = SurfaceControllerFactory.createSurfaceController({
      uiContext: this.getUIContext(),
      catalog: catalog
    })
  }

  aboutToDisappear(): void {
    this.controller?.destroy()
  }

  build() {
    Column() {
      UIRendererComponent({ surfaceController: this.controller })
        .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
  }
}
```

---

## 渲染 LLM 输出

LLM 可返回单条 A2UI 消息，也可返回 JSONL 多条消息。宿主侧逐条调用 handleMessage。

```ts
function renderDslMessages(controller: SurfaceController, dslMessages: string[]): void {
  dslMessages.forEach((dsl: string) => {
    controller.handleMessage(dsl)
  })
}
```

单条消息示例：

```ts
controller.handleMessage(JSON.stringify({
  version: BASIC_CATALOG_PROTOCOL_VERSION_V09,
  createSurface: {
    surfaceId: 'main',
    catalogId: 'ohos.a2ui.extended.catalog'
  }
}))
```

JSONL 流式输出可用以下函数处理。输入流的每一项是一行文本，函数只投递以 JSON 对象形式开始的行。

```ts
async function renderJsonlStream(
  controller: SurfaceController,
  stream: AsyncIterable<string>
): Promise<void> {
  for await (const line of stream) {
    const trimmed = line.trim()
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      controller.handleMessage(trimmed)
    }
  }
}
```

---

## 交互回环

用户点击、提交等 Server Action 会通过 registerActionReceiver 回调给宿主。宿主把 Action 转成下一轮用户消息，交给 LLM 继续生成 DSL。

```ts
type ChatMessage = {
  role: string
  content: string
}

function registerActionLoop(
  controller: SurfaceController,
  messages: ChatMessage[],
  requestNextDsl: () => Promise<string[]>
): void {
  controller.registerActionReceiver((actionJson: string) => {
    const payload = JSON.parse(actionJson) as Record<string, Object>
    messages.push({
      role: 'user',
      content: `用户操作：${JSON.stringify(payload)}`
    })

    requestNextDsl().then((dslMessages: string[]) => {
      renderDslMessages(controller, dslMessages)
    })
  })
}
```

---

## 错误反馈

框架在 handleMessage 内部处理 JSON、协议消息、Schema、Action 和函数错误，并通过 registerErrorCallback 上报。将错误写入对话上下文，可以让下一轮 LLM 修正输出。

```ts
import { SurfaceErrorCode } from '@arkui-genius/genui'

function registerErrorFeedback(
  controller: SurfaceController,
  messages: ChatMessage[]
): void {
  controller.registerErrorCallback((code: SurfaceErrorCode, errorMsg: string) => {
    messages.push({
      role: 'user',
      content: `上一条 A2UI 消息处理失败，错误码 ${code}，错误信息 ${errorMsg}。请重新输出合法 A2UI JSON。`
    })
  })
}
```

常见错误处理建议：

| 问题 | 处理方式 |
|------|----------|
| JSON 解析失败 | 在 prompt 中要求直接输出 JSON 或 JSONL，不要包裹 Markdown |
| 组件不存在 | 确认 PromptBuilder 使用的 Catalog 与控制器 Catalog 一致 |
| 函数不存在 | 确认自定义函数已在创建控制器前加入 Catalog |
| 协议版本不支持 | 使用 Capabilities 查询版本，并使用 Version 常量生成消息 |
| DataModel 路径为空 | 在 prompt 中提供 DataModel 结构和路径约束 |

---

## 多设备适配

当目标设备包含手机、折叠屏和平板时，推荐使用通用自适应 DSL：PromptBuilder 生成基础 prompt 后，追加断点变量、If 组件和表达式规则，让 LLM 输出覆盖所有断点的布局。

```ts
const adaptivePrompt = systemPrompt + '\n' + [
  '生成适配所有断点的 A2UI DSL。',
  '布局结构差异使用 If 组件。',
  '字号、间距、显隐等属性差异使用 $__widthBreakpoint 表达式。',
  '输出必须是 JSON 或 JSONL，不要使用 Markdown 代码块。'
].join('\n')
```

完整规则和模板见 [多设备自适应最佳实践](multi-device-best-practices.md)。

---

## 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| LLM 生成的 JSON 无法解析 | 输出夹杂 Markdown 或解释文本 | 在 prompt 中要求只输出 JSON 或 JSONL |
| 组件不存在报错 | PromptBuilder 与控制器使用了不同 Catalog | 复用同一个 Catalog 实例生成 prompt 和创建控制器 |
| Action 回调未触发 | DSL 使用了 functionCall 而不是 event | Server Action 使用 action.event，本地函数使用 action.functionCall |
| 流式响应截断 | 网络流中断或 JSON 行不完整 | 只投递完整 JSON 行，并在业务网络层做重连 |
| 折叠屏展开后布局不更新 | LLM 只为单一断点生成 DSL | 使用通用自适应 DSL 或在断点变化后重新请求 LLM |

---

相关指南：
→ [Agent 部署模式概念](../concepts/agent-deployment-models.md) | → [用户交互处理](handling-user-interactions.md) | → [故障排查](troubleshooting.md) | → [多设备自适应最佳实践](multi-device-best-practices.md) | → [PromptBuilder API](../reference/API/prompt-builder.md)
