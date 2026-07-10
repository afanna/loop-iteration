# 版本兼容性

GenUI 对外提供两类版本信息：A2UI 消息协议版本和扩展协议能力版本。当前 SDK 中，PromptBuilder 的 version 入参和 DSL 顶层 version 都使用 A2UI 消息协议版本 v0.9；扩展能力通过扩展 Catalog 的 catalogId 启用。

---

## 查询支持版本

```ts
import { Capabilities, CapabilityManifest } from '@arkui-genius/genui'

const manifest: CapabilityManifest = Capabilities.getCapabilities()
const a2uiVersions: string[] = Capabilities.getSupportedA2UIProtocolVersions()
const extendedVersions: string[] = Capabilities.getSupportedExtendedProtocolVersions()

console.info(`A2UI 协议版本: ${a2uiVersions.join(', ')}`)
console.info(`扩展协议版本: ${extendedVersions.join(', ')}`)
console.info(`Catalog: ${manifest.supportedCatalogIds.join(', ')}`)
```

完整接口见 [Capabilities API](../reference/API/capabilities.md)。

---

## 使用版本常量

调用 PromptBuilder 或生成 DSL 时，使用 BASIC_CATALOG_PROTOCOL_VERSION_V09。EXTENDED_CATALOG_PROTOCOL_VERSION_V100 是扩展能力版本，当前不作为 PromptBuilder version 或 DSL 顶层 version 使用。

```ts
import { BASIC_CATALOG_PROTOCOL_VERSION_V09 } from '@arkui-genius/genui'

const messageVersion = BASIC_CATALOG_PROTOCOL_VERSION_V09
```

完整常量见 [Version API](../reference/API/version.md)。

---

## Catalog 与协议版本

CatalogFactory.basic 创建基础协议 Catalog，CatalogFactory.extended 创建鸿蒙扩展协议 Catalog。两者调用 PromptBuilder 时都使用 BASIC_CATALOG_PROTOCOL_VERSION_V09；提示词里包含哪些组件和函数由 Catalog 决定。

```ts
import {
  BASIC_CATALOG_PROTOCOL_VERSION_V09,
  CatalogFactory,
  PromptBuilder
} from '@arkui-genius/genui'

const catalog = CatalogFactory.extended()
const systemPrompt = PromptBuilder.buildInstruction(
  catalog,
  BASIC_CATALOG_PROTOCOL_VERSION_V09
)
```

自定义组件和自定义函数的 schemaProvider 会收到 version 参数。当前 SDK 会传入 v0.9。扩展组件能力不依赖该参数区分，而是由 CatalogFactory.extended 和 createSurface.catalogId 共同确定。

```ts
const schemaProvider = (version: string): string => {
  return JSON.stringify({
    type: 'object',
    properties: {
      title: { type: 'string' }
    },
    required: ['title']
  })
}
```

---

## 运行时版本检查

SurfaceController.handleMessage 会检查 DSL 顶层 version 字段。版本不受支持时，该消息不会继续渲染，并通过 registerErrorCallback 上报 UNSUPPORTED_PROTOCOL_VERSION。

```ts
import { SurfaceErrorCode } from '@arkui-genius/genui'

controller.registerErrorCallback((code: SurfaceErrorCode, errorMsg: string) => {
  if (code === SurfaceErrorCode.UNSUPPORTED_PROTOCOL_VERSION) {
    console.error(`不支持的协议版本: ${errorMsg}`)
  }
})
```

消息示例：

```ts
controller.handleMessage(JSON.stringify({
  version: BASIC_CATALOG_PROTOCOL_VERSION_V09,
  createSurface: {
    surfaceId: 'main',
    catalogId: 'ohos.a2ui.extended.catalog'
  }
}))
```

---

## 建议

1. 调用 LLM 前，使用 Capabilities 查询端侧支持的 A2UI 消息协议版本、扩展协议能力版本和 Catalog 标识。
2. PromptBuilder version 和 DSL 顶层 version 使用 BASIC_CATALOG_PROTOCOL_VERSION_V09。
3. 基础能力使用 CatalogFactory.basic，扩展能力使用 CatalogFactory.extended。
4. 扩展 Surface 的 createSurface.catalogId 使用 ohos.a2ui.extended.catalog。
5. 通过 registerErrorCallback 监听 UNSUPPORTED_PROTOCOL_VERSION，把错误反馈给上游 Agent 或 LLM。

---

相关指南：
→ [定义 Catalog](defining-catalogs.md) | → [LLM 集成](integrating-llm.md) | → [故障排查](troubleshooting.md) | → [Capabilities API](../reference/API/capabilities.md)
