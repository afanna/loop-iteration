# PromptBuilder

PromptBuilder 用于基于 [Catalog](./catalog.md#catalog) 与 A2UI 协议版本，生成可发送给 LLM 的系统提示词，以及组件、函数、协议消息的 JSON Schema 文本。面向 [LLM 集成](../../guides/integrating-llm.md) 场景，将当前 HAR 支持的协议规则、组件能力和函数能力整理成 LLM 可理解的形式。

> **说明：**
>
> - 本模块接口从 OpenHarmony API Version 13 开始支持，环境要求见 [README](../../README.md#环境要求)。
> - 本页接口均为静态方法，可直接通过 PromptBuilder 调用。
> - version 入参是 A2UI 消息协议版本。当前 SDK 支持的消息协议版本为 BASIC_CATALOG_PROTOCOL_VERSION_V09。扩展能力由传入的 CatalogFactory.extended() 决定，PromptBuilder 仍传 BASIC_CATALOG_PROTOCOL_VERSION_V09。

## 导入模块

```ts
import { PromptBuilder, Catalog } from '@arkui-genius/genui'
```

## PromptBuilder

```ts
class PromptBuilder
```

提示词与 Schema 生成工具类，全部为静态方法，无需实例化。

| 方法 | 说明 |
|------|------|
| [buildInstruction](#buildinstruction) | 基于 Catalog 生成完整 LLM system prompt。 |
| [getComponentSchema](#getcomponentschema) | 生成组件 Schema 文档。 |
| [getFunctionSchema](#getfunctionschema) | 生成函数 Schema 文档。 |
| [getProtocolMessageSchema](#getprotocolmessageschema) | 生成协议消息 Schema 文档。 |

### buildInstruction

```ts
static buildInstruction(catalog: Catalog, version?: string): string
```

**接口说明：**

基于指定 Catalog 生成可直接作为 LLM system message 使用的提示词，包含 A2UI 协议规则、组件与函数组成的统一 JSON Schema，以及协议消息示例。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| catalog | [Catalog](./catalog.md#catalog) | 是 | 能力目录，决定 prompt 中包含的组件、函数与 catalogId。 |
| version | string | 否 | 目标 A2UI 消息协议版本。当前 SDK 支持 BASIC_CATALOG_PROTOCOL_VERSION_V09。扩展 Catalog 生成提示词时也传该值。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| string | 生成成功时返回完整 system prompt；目标协议版本不受支持时返回空字符串。 |

**示例：**

```ts
import {
  CatalogFactory,
  PromptBuilder,
  BASIC_CATALOG_PROTOCOL_VERSION_V09
} from '@arkui-genius/genui'

const catalog = CatalogFactory.extended()
const systemPrompt = PromptBuilder.buildInstruction(catalog, BASIC_CATALOG_PROTOCOL_VERSION_V09)

const messages = [
  { role: 'system', content: systemPrompt },
  { role: 'user', content: '帮我生成一个用户信息表单' }
]
```

### getComponentSchema

```ts
static getComponentSchema(catalog: Catalog, version?: string): string
```

**接口说明：**

基于指定 Catalog 生成组件 Schema 文档，用于单独获取当前组件能力的 JSON Schema 约束。适合在不需完整 system prompt 时，单独向云侧 Agent、调试工具或校验工具提供组件 Schema。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| catalog | [Catalog](./catalog.md#catalog) | 是 | 能力目录，从中提取组件项。 |
| version | string | 否 | 目标 A2UI 消息协议版本。当前 SDK 支持 BASIC_CATALOG_PROTOCOL_VERSION_V09。扩展 Catalog 生成组件 Schema 时也传该值。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| string | 生成成功时返回组件 Schema 文本；目标协议版本不受支持时返回空字符串。 |

**示例：**

```ts
import {
  CatalogFactory,
  PromptBuilder,
  BASIC_CATALOG_PROTOCOL_VERSION_V09
} from '@arkui-genius/genui'

const catalog = CatalogFactory.extended()
const componentSchema = PromptBuilder.getComponentSchema(catalog, BASIC_CATALOG_PROTOCOL_VERSION_V09)
```

### getFunctionSchema

```ts
static getFunctionSchema(catalog: Catalog, version?: string): string
```

**接口说明：**

基于指定 Catalog 生成函数 Schema 文档，用于单独获取当前本地函数能力的 JSON Schema 约束。适合单独向 LLM 或云侧 Agent 提供函数调用约束。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| catalog | [Catalog](./catalog.md#catalog) | 是 | 能力目录，从中提取函数项。 |
| version | string | 否 | 目标 A2UI 消息协议版本。当前 SDK 支持 BASIC_CATALOG_PROTOCOL_VERSION_V09。扩展 Catalog 生成函数 Schema 时也传该值。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| string | 生成成功时返回函数 Schema 文本；目标协议版本不受支持时返回空字符串。 |

**示例：**

```ts
import {
  CatalogFactory,
  PromptBuilder,
  BASIC_CATALOG_PROTOCOL_VERSION_V09
} from '@arkui-genius/genui'

const catalog = CatalogFactory.extended()
const functionSchema = PromptBuilder.getFunctionSchema(catalog, BASIC_CATALOG_PROTOCOL_VERSION_V09)
```

### getProtocolMessageSchema

```ts
static getProtocolMessageSchema(version?: string): string
```

**接口说明：**

生成 A2UI 协议消息 Schema，描述指定协议版本支持的顶层消息结构（createSurface、updateComponents、updateDataModel、deleteSurface）。若只需约束 LLM 输出的协议消息结构，而不需组件和函数能力，可单独使用本方法。

**支持的版本：** OpenHarmony API Version 13 及以上。

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| version | string | 否 | 目标 A2UI 协议版本，建议传 [Version](./version.md) 常量。未传入时使用当前 HAR 支持的默认协议版本。 |

**返回值：**

| 类型 | 说明 |
|------|------|
| string | 生成成功时返回协议 Schema 文本；目标协议版本不受支持时返回空字符串。 |

**示例：**

```ts
import { PromptBuilder, BASIC_CATALOG_PROTOCOL_VERSION_V09 } from '@arkui-genius/genui'

const protocolSchema = PromptBuilder.getProtocolMessageSchema(BASIC_CATALOG_PROTOCOL_VERSION_V09)
```

---

↑ [返回 API 速查](./README.md)
