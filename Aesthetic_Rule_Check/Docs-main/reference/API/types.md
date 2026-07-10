# Types

GenUI SDK 对外暴露的通用值类型、回调签名与状态枚举，涵盖动态值载体、Schema 提供函数、Surface 生命周期事件、操作状态码、主题模式与响应式断点。这些类型被控制器、Catalog、自定义组件等各模块共用。

> **说明：**
>
> - 本模块接口从 OpenHarmony API Version 13 开始支持，环境要求见 [README](../../README.md#环境要求)。
> - 本页仅列出跨模块复用的基础类型；与具体接口强相关的类型（如 [SurfaceControllerOption](./surface-controller.md#surfacecontrolleroption)）在其所属接口页内说明。

## 导入模块

```ts
import {
  A2UIValueType,
  SchemaProvider,
  SurfaceEventType,
  SurfaceErrorCode,
  ThemeMode,
  Breakpoint
} from '@arkui-genius/genui'
```

## A2UIValueType

```ts
type A2UIValueType =
  | string
  | number
  | boolean
  | null
  | undefined
  | A2UIValueType[]
  | Record<string, Object>
```

A2UI 载荷与本地函数支持的字面量值类型。支持标量（string / number / boolean）、空值（null / undefined）、数组以及对象，并允许递归嵌套，用于描述 DSL 中的动态值、DataModel 内容和函数入参 / 返回值。

## SchemaProvider

```ts
type SchemaProvider = (version: string) => string
```

返回指定协议版本对应 JSON Schema 字符串的函数类型，用于向 [CatalogItem](./catalog-item.md#catalogitem) 和 [ClientFunction](./client-function.md#clientfunction) 提供组件或函数的 Schema。

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| version | string | 是 | 目标 A2UI 消息协议版本。当前 SDK 传入 v0.9，取值见 [Version](./version.md)。 |

返回值：string，序列化后的 JSON Schema 字符串。

## SurfaceEventType

Surface 生命周期事件枚举。A2UI 消息处理后，控制器通过 [SurfaceEventCallback](./surface-controller.md#surfaceeventcallback) 把事件类型回调给宿主。

| 名称 | 值 | 说明 |
|--------|------|------|
| UNKNOWN | -1 | 未知或不支持的 Surface 事件。 |
| SURFACE_CREATED | 0 | 创建了新的 Surface。 |
| SURFACE_COMPONENTS_UPDATED | 1 | Surface 组件已新增或更新。 |
| SURFACE_DATA_MODEL_UPDATED | 2 | Surface 数据模型已更新。 |
| SURFACE_DELETED | 3 | Surface 已删除。 |

## SurfaceErrorCode

Surface 控制链路的统一状态码。既用于描述控制器操作结果（例如 [pop](./multi-surface-controller.md#pop) 的返回值），也通过 [registerErrorCallback](./surface-controller.md#registererrorcallback) 上报给宿主，覆盖 DSL 处理、Schema 校验、Action / Function 执行、表达式解析、多 Surface 栈管理等场景。

| 名称 | 值 | 说明 |
|--------|------|------|
| NO_ERROR | 0 | 操作成功完成。 |
| NO_SURFACE_MATCHED | 1001 | 未找到与请求匹配的 Surface。 |
| NATIVE_PROCESS_FAILED | 1002 | Native 消息处理失败。 |
| UNSUPPORTED_PROTOCOL_VERSION | 1003 | 请求的 A2UI 协议版本不受支持。 |
| COMPONENT_DROPPED_ON_INVALID_PARAMETER | 1004 | 组件因参数非法被丢弃。 |
| FALLBACK_WARNING | 1101 | 回退流程完成，但产生告警。 |
| SCHEMA_WARNING | 2001 | Schema 校验产生告警。 |
| SCHEMA_DSL_EMPTY | 2002 | 输入 DSL 为空。 |
| SCHEMA_JSON_PARSE_FAILED | 2003 | 输入 DSL 不是合法 JSON。 |
| SCHEMA_ROOT_NOT_OBJECT | 2004 | JSON 根节点不是对象。 |
| SCHEMA_MESSAGE_OPERATION_INVALID | 2101 | 消息操作缺失或非法。 |
| SCHEMA_MESSAGE_MULTIPLE_BODIES | 2102 | 单个 payload 中包含多个消息体。 |
| SCHEMA_MESSAGE_BODY_INVALID | 2103 | 消息体内容非法。 |
| SCHEMA_SURFACE_ID_MISSING | 2104 | 缺少必需的 Surface 标识。 |
| SCHEMA_COMPONENTS_INVALID | 2105 | 组件数据缺失或非法。 |
| SCHEMA_CATALOG_ID_MISSING | 2106 | 缺少 Catalog 标识。 |
| SCHEMA_VERSION_INVALID | 2107 | 声明了非法的 Schema 或协议版本。 |
| ACTION_NOT_REGISTER | 3001 | 未注册本地 Action 接收器。 |
| LOCAL_FUNCTION | 3101 | 本地函数执行失败。 |
| ACTION_PARSE_FAILED | 3201 | Action payload 解析失败。 |
| DYNAMIC_VALUE_RESOLVE_FAILED | 3202 | 动态值解析失败。 |
| GLOBAL_VARIABLE_NOT_FOUND | 3203 | 引用的全局变量名不受支持。 |
| ILLEGAL_EXPRESSION | 3204 | 表达式语法非法，或使用了不支持的表达式形式。 |
| MULTI_SURFACE_DISABLED | 11001 | 当前控制器未启用多 Surface 模式。 |
| MULTI_SURFACE_ONLY_ONE_SURFACE | 11002 | 仅剩一个 Surface，返回导航被阻止。 |
| MULTI_SURFACE_EMPTY_STACK | 11003 | 当前 Surface 栈为空。 |
| MULTI_SURFACE_MAX_SURFACE_LIMIT_REACHED | 11004 | 已达到 Surface 数量上限。 |
| MULTI_SURFACE_ALREADY_EXISTS | 11005 | 请求的 Surface 已存在。 |

## ThemeMode

主题模式枚举，用于 [updateThemeMode](./surface-controller.md#updatethememode) 设置 Surface 的浅色 / 深色模式。

| 名称 | 值 | 说明 |
|--------|------|------|
| LIGHT | 0 | 浅色主题。 |
| DARK | 1 | 深色主题。 |

## Breakpoint

响应式断点枚举，描述当前屏幕宽度档位。引擎根据屏宽判定断点，并通过 [ComponentTheme.breakpoint](./catalog-item.md#componenttheme) 传递给自定义组件，用于多设备自适应布局。

| 名称 | 值 | 说明 |
|--------|------|------|
| XS | 0 | 超小屏宽度。 |
| SM | 1 | 小屏宽度。 |
| MD | 2 | 中等屏宽度。 |
| LG | 3 | 大屏宽度。 |
| XL | 4 | 超大屏宽度。 |

---

↑ [返回 API 速查](./README.md)
