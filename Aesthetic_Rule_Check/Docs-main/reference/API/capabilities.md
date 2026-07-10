# Capabilities

Capabilities 提供 GenUI 能力清单的查询能力，向宿主暴露当前 HAR 支持的 A2UI 协议版本、扩展协议版本和 Catalog 标识，便于在对接 LLM 或做版本协商前确认端侧能力。

> **说明：**
>
> - 本模块接口从 OpenHarmony API Version 13 开始支持，环境要求见 [README](../../README.md#环境要求)。
> - 查询结果由当前 HAR 内置决定，无需宿主额外配置。

## 导入模块

```ts
import { Capabilities, CapabilityManifest } from '@arkui-genius/genui'
```

## CapabilityManifest

```ts
interface CapabilityManifest
```

能力清单，描述当前 HAR 支持的全部能力，由 [Capabilities.getCapabilities](#getcapabilities) 返回。

| 名称 | 类型 | 只读 | 可选 | 说明 |
|--------|------|------|------|------|
| supportedA2UIProtocolVersions | string[] | 否 | 否 | 支持的标准 A2UI 协议版本列表。 |
| supportedExtendedProtocolVersions | string[] | 否 | 否 | 支持的扩展协议版本列表。 |
| supportedCatalogIds | string[] | 否 | 否 | 支持的 Catalog 标识列表。 |

## Capabilities

```ts
class Capabilities
```

能力查询工具类，全部为静态方法，无需实例化。

| 方法 | 说明 |
|------|------|
| [getSupportedA2UIProtocolVersions](#getsupporteda2uiprotocolversions) | 获取支持的标准 A2UI 协议版本列表。 |
| [getSupportedExtendedProtocolVersions](#getsupportedextendedprotocolversions) | 获取支持的扩展协议版本列表。 |
| [getCapabilities](#getcapabilities) | 获取完整能力清单。 |

### getSupportedA2UIProtocolVersions

```ts
static getSupportedA2UIProtocolVersions(): string[]
```

**接口说明：**

返回当前 HAR 支持的标准 A2UI 协议版本列表，例如 ["v0.9", "v1.0"]。

**支持的版本：** OpenHarmony API Version 13 及以上。

**返回值：**

| 类型 | 说明 |
|------|------|
| string[] | 支持的标准 A2UI 协议版本数组。 |

**示例：**

```ts
import { Capabilities } from '@arkui-genius/genui'

const versions = Capabilities.getSupportedA2UIProtocolVersions()
console.info(`支持的 A2UI 协议版本: ${versions.join(', ')}`)
```

### getSupportedExtendedProtocolVersions

```ts
static getSupportedExtendedProtocolVersions(): string[]
```

**接口说明：**

返回当前 HAR 支持的扩展协议版本列表，例如 ["v0.9"]。

**支持的版本：** OpenHarmony API Version 13 及以上。

**返回值：**

| 类型 | 说明 |
|------|------|
| string[] | 支持的扩展协议版本数组。 |

**示例：**

```ts
import { Capabilities } from '@arkui-genius/genui'

const versions = Capabilities.getSupportedExtendedProtocolVersions()
console.info(`支持的扩展协议版本: ${versions.join(', ')}`)
```

### getCapabilities

```ts
static getCapabilities(): CapabilityManifest
```

**接口说明：**

返回当前 HAR 的完整能力清单，包含标准协议版本、扩展协议版本与 Catalog 标识。适合在初始化阶段一次性采集，供 LLM 对接或版本协商使用。

**支持的版本：** OpenHarmony API Version 13 及以上。

**返回值：**

| 类型 | 说明 |
|------|------|
| [CapabilityManifest](#capabilitymanifest) | 能力清单对象。 |

**示例：**

```ts
import { Capabilities } from '@arkui-genius/genui'

const manifest = Capabilities.getCapabilities()
console.info(`A2UI 版本: ${manifest.supportedA2UIProtocolVersions.join(', ')}`)
console.info(`扩展版本: ${manifest.supportedExtendedProtocolVersions.join(', ')}`)
console.info(`Catalog: ${manifest.supportedCatalogIds.join(', ')}`)
```

---

↑ [返回 API 速查](./README.md)
