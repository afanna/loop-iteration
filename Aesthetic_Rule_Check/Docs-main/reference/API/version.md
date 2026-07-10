# Version

GenUI 对外暴露的协议版本常量。当前 SDK 中，A2UI 消息协议版本用于 [PromptBuilder](./prompt-builder.md#promptbuilder)、DSL 顶层 version 和 [SchemaProvider](./types.md#schemaprovider) 入参；扩展协议版本用于 [Capabilities](./capabilities.md#capabilities) 能力声明。

> **说明：**
>
> - 本模块接口从 OpenHarmony API Version 13 开始支持，环境要求见 [README](../../README.md#环境要求)。
> - 当前 DSL 顶层 version 与 PromptBuilder version 均使用 BASIC_CATALOG_PROTOCOL_VERSION_V09。
> - EXTENDED_CATALOG_PROTOCOL_VERSION_V100 表示扩展协议能力版本，不作为当前 DSL 顶层 version 或 PromptBuilder version 传入。

## 导入模块

```ts
import {
  BASIC_CATALOG_PROTOCOL_VERSION_V09,
  EXTENDED_CATALOG_PROTOCOL_VERSION_V100
} from '@arkui-genius/genui'
```

## BASIC_CATALOG_PROTOCOL_VERSION_V09

```ts
const BASIC_CATALOG_PROTOCOL_VERSION_V09: string = 'v0.9'
```

A2UI 消息协议版本。当前 SDK 的 DSL 顶层 version、PromptBuilder version 和 SchemaProvider version 均使用该值。使用 [CatalogFactory.extended()](./factories.md#catalogfactoryextended) 生成扩展能力提示词时也传入该值。

## EXTENDED_CATALOG_PROTOCOL_VERSION_V100

```ts
const EXTENDED_CATALOG_PROTOCOL_VERSION_V100: string = 'v1.0.0'
```

鸿蒙扩展协议能力版本，对应 [CatalogFactory.extended()](./factories.md#catalogfactoryextended) 创建的扩展能力集，并通过 [Capabilities.getSupportedExtendedProtocolVersions](./capabilities.md#getsupportedextendedprotocolversions) 查询。当前 SDK 不把该值作为 DSL 顶层 version 或 PromptBuilder version 使用。

## 使用示例

```ts
import {
  CatalogFactory,
  PromptBuilder,
  BASIC_CATALOG_PROTOCOL_VERSION_V09
} from '@arkui-genius/genui'

// 基础协议 Catalog 生成提示词
const basicPrompt = PromptBuilder.buildInstruction(
  CatalogFactory.basic(),
  BASIC_CATALOG_PROTOCOL_VERSION_V09
)

// 扩展 Catalog 生成提示词：仍使用 A2UI 消息协议版本 v0.9
const extendedPrompt = PromptBuilder.buildInstruction(
  CatalogFactory.extended(),
  BASIC_CATALOG_PROTOCOL_VERSION_V09
)
```

---

↑ [返回 API 速查](./README.md)
