# 错误码参考

本文档说明 registerErrorCallback() 通过 code 参数上报的 SurfaceErrorCode 错误码。

## SurfaceErrorCode 枚举

```ts
export enum SurfaceErrorCode {
  NO_ERROR = 0,

  NO_SURFACE_MATCHED = 1001,
  NATIVE_PROCESS_FAILED = 1002,
  UNSUPPORTED_PROTOCOL_VERSION = 1003,
  COMPONENT_DROPPED_ON_INVALID_PARAMETER = 1004,

  FALLBACK_WARNING = 1101,

  SCHEMA_WARNING = 2001,
  SCHEMA_DSL_EMPTY = 2002,
  SCHEMA_JSON_PARSE_FAILED = 2003,
  SCHEMA_ROOT_NOT_OBJECT = 2004,

  SCHEMA_MESSAGE_OPERATION_INVALID = 2101,
  SCHEMA_MESSAGE_MULTIPLE_BODIES = 2102,
  SCHEMA_MESSAGE_BODY_INVALID = 2103,
  SCHEMA_SURFACE_ID_MISSING = 2104,
  SCHEMA_COMPONENTS_INVALID = 2105,
  SCHEMA_CATALOG_ID_MISSING = 2106,
  SCHEMA_VERSION_INVALID = 2107,

  ACTION_NOT_REGISTER = 3001,
  LOCAL_FUNCTION = 3101,
  ACTION_PARSE_FAILED = 3201,
  DYNAMIC_VALUE_RESOLVE_FAILED = 3202,
  GLOBAL_VARIABLE_NOT_FOUND = 3203,
  ILLEGAL_EXPRESSION = 3204,

  MULTI_SURFACE_DISABLED = 11001,
  MULTI_SURFACE_ONLY_ONE_SURFACE = 11002,
  MULTI_SURFACE_EMPTY_STACK = 11003,
  MULTI_SURFACE_MAX_SURFACE_LIMIT_REACHED = 11004,
  MULTI_SURFACE_ALREADY_EXISTS = 11005
}
```

## 错误码说明

这里的分类以 DSL 解析和处理链路为边界：

- 中断渲染：当前控制器消息入口收到的 DSL 消息处理失败，消息不会继续应用到目标 Surface。
- 不中断渲染：DSL 消息仍可继续应用，局部属性或 Local Function 按回退、忽略、失败处理。
- 多 Surface 栈操作：多 Surface 创建、压栈或回退操作失败。
- 其他：不属于 DSL 解析和处理链路，或不表示异常状态的错误项。

### 错误项分类对比

| 分类 | 判断标准 | 错误项 |
|------|----------|--------|
| 中断渲染 | DSL 解析或应用失败，当前消息或当前组件不会继续渲染 | NO_SURFACE_MATCHED、NATIVE_PROCESS_FAILED、UNSUPPORTED_PROTOCOL_VERSION、COMPONENT_DROPPED_ON_INVALID_PARAMETER、SCHEMA_DSL_EMPTY、SCHEMA_JSON_PARSE_FAILED、SCHEMA_ROOT_NOT_OBJECT、SCHEMA_MESSAGE_MULTIPLE_BODIES、SCHEMA_MESSAGE_BODY_INVALID、SCHEMA_SURFACE_ID_MISSING、SCHEMA_COMPONENTS_INVALID、SCHEMA_CATALOG_ID_MISSING、SCHEMA_VERSION_INVALID |
| 不中断渲染 | DSL 解析或应用过程中出现局部问题，但当前消息仍可继续处理 | FALLBACK_WARNING、SCHEMA_WARNING、LOCAL_FUNCTION |
| 多 Surface 栈操作 | 多 Surface 模式、数量限制或回退条件不满足 | MULTI_SURFACE_DISABLED、MULTI_SURFACE_ONLY_ONE_SURFACE、MULTI_SURFACE_EMPTY_STACK、MULTI_SURFACE_MAX_SURFACE_LIMIT_REACHED、MULTI_SURFACE_ALREADY_EXISTS |
| 其他 | 不属于 DSL 解析和处理链路，或不表示异常状态 | NO_ERROR、SCHEMA_MESSAGE_OPERATION_INVALID、ACTION_NOT_REGISTER、ACTION_PARSE_FAILED、DYNAMIC_VALUE_RESOLVE_FAILED、GLOBAL_VARIABLE_NOT_FOUND、ILLEGAL_EXPRESSION、5001~9000 |

### 中断渲染

| 错误类型 | code | 说明 | 典型场景 |
|----------|------|------|----------|
| NO_SURFACE_MATCHED | 1001 | 未找到匹配的 Surface，本次消息无法应用 | surfaceId 不存在、已销毁或 Surface 策略拒绝当前消息 |
| NATIVE_PROCESS_FAILED | 1002 | Native 消息处理失败，本次消息无法继续处理 | 底层解析、桥接或渲染处理异常，建议结合日志定位 |
| UNSUPPORTED_PROTOCOL_VERSION | 1003 | 协议版本不受支持，本次消息不会渲染 | DSL version 与当前 SDK 不兼容 |
| COMPONENT_DROPPED_ON_INVALID_PARAMETER | 1004 | 组件因参数非法被丢弃，当前组件不会渲染 | 组件必填参数缺失、参数类型或取值不合法且无法安全回退 |
| SCHEMA_DSL_EMPTY | 2002 | 输入 DSL 为空，本次消息不会渲染 | 控制器消息入口收到空字符串或空内容 |
| SCHEMA_JSON_PARSE_FAILED | 2003 | 输入 DSL 不是合法 JSON，本次消息不会渲染 | JSON 字符串格式错误 |
| SCHEMA_ROOT_NOT_OBJECT | 2004 | JSON 根节点不是对象，本次消息不会渲染 | DSL 顶层是数组、字符串、数字或其他非对象类型 |
| SCHEMA_MESSAGE_MULTIPLE_BODIES | 2102 | 单个消息中存在多个消息体，本次消息不会渲染 | 同一 payload 同时包含多个互斥 body |
| SCHEMA_MESSAGE_BODY_INVALID | 2103 | 消息体内容非法，本次消息不会渲染 | body 缺失、类型错误或结构不符合协议 |
| SCHEMA_SURFACE_ID_MISSING | 2104 | 缺少必需的 Surface 标识，本次消息不会渲染 | 创建、更新或删除 Surface 时未提供有效 surfaceId |
| SCHEMA_COMPONENTS_INVALID | 2105 | 组件数据缺失或非法，本次消息不会渲染 | updateComponents.components 缺失、不是数组或组件结构不合法 |
| SCHEMA_CATALOG_ID_MISSING | 2106 | Catalog 标识缺失或非法，本次消息不会渲染 | createSurface.catalogId 缺失、类型错误或无法匹配已注册目录 |
| SCHEMA_VERSION_INVALID | 2107 | 协议版本字段缺失或非法，本次消息不会渲染 | version 缺失、类型错误或格式不符合协议 |

### 不中断渲染

| 错误类型 | code | 说明 | 典型场景 |
|----------|------|------|----------|
| FALLBACK_WARNING | 1101 | 回退流程完成但存在告警，渲染继续 | 不合法的属性值回退到默认值后继续渲染 |
| SCHEMA_WARNING | 2001 | Schema 校验或组件局部容错产生告警，渲染继续 | 字段类型、结构或约束不符合预期，但可以回退、忽略或修正后继续处理；例如 If.condition 求值失败时回退到 childrenElse 或保持当前分支 |
| LOCAL_FUNCTION | 3101 | Local Function 执行失败 | 自定义函数未注册、入参校验失败、返回值类型不匹配或函数抛出异常 |

### 多 Surface 栈操作

| 错误类型 | code | 说明 | 典型场景 |
|----------|------|------|----------|
| MULTI_SURFACE_DISABLED | 11001 | 当前控制器未启用多 Surface 模式 | 使用单 Surface 控制器执行多 Surface 栈操作 |
| MULTI_SURFACE_ONLY_ONE_SURFACE | 11002 | 仅剩一个 Surface，返回导航被阻止 | 栈深度为 1 时调用 pop() |
| MULTI_SURFACE_EMPTY_STACK | 11003 | 当前 Surface 栈为空 | 栈为空、控制器已销毁或无可回退 Surface 时调用 pop() |
| MULTI_SURFACE_MAX_SURFACE_LIMIT_REACHED | 11004 | 已达到 Surface 数量上限 | MultiSurfaceController 中创建第 16 个 Surface |
| MULTI_SURFACE_ALREADY_EXISTS | 11005 | 请求的 Surface 已存在 | 使用重复的 surfaceId 创建 Surface |

### 其他

| 错误类型 | code | 说明 | 典型场景 |
|----------|------|------|----------|
| NO_ERROR | 0 | 无错误，不属于异常状态 | 正常流程 |
| SCHEMA_MESSAGE_OPERATION_INVALID | 2101 | 消息操作缺失或非法，归入其他错误项 | 未包含 createSurface、updateComponents、updateDataModel、deleteSurface 中的一个有效消息体 |
| ACTION_NOT_REGISTER | 3001 | 未注册本地 Action 接收器，不属于 DSL 解析过程 | DSL 已完成渲染后触发 action.event，但宿主未调用 registerActionReceiver |
| ACTION_PARSE_FAILED | 3201 | Action payload 解析失败，不属于 DSL 解析过程 | Action 配置或上下文不是合法结构，当前 Action 被丢弃 |
| DYNAMIC_VALUE_RESOLVE_FAILED | 3202 | 动态值解析失败，归入其他错误项 | 数据路径不存在、动态绑定求值失败或函数调用返回失败 |
| GLOBAL_VARIABLE_NOT_FOUND | 3203 | 引用的全局变量名不受支持，归入其他错误项 | 表达式中使用了未定义或不支持的全局变量。If.condition 为保持条件渲染不中断，会按局部 fail-default 规则上报 SCHEMA_WARNING（2001），不单独上报该错误码 |
| ILLEGAL_EXPRESSION | 3204 | 表达式语法非法或形式不受支持，归入其他错误项 | 表达式语法错误、引用路径非法或使用了不支持的表达式形式。If.condition 为保持条件渲染不中断，会按局部 fail-default 规则上报 SCHEMA_WARNING（2001），不单独上报该错误码 |
| 5001~9000 | - | 开发者自定义错误，不属于框架 DSL 解析错误 | 宿主业务通过 context.onError 主动上报，当前函数调用按失败处理 |

## 注册错误回调

```ts
controller.registerErrorCallback((code: SurfaceErrorCode, errorMsg: string) => {
  switch (code) {
    case SurfaceErrorCode.NO_SURFACE_MATCHED:
      console.error(`Surface 未找到: ${errorMsg}`)
      break
    case SurfaceErrorCode.UNSUPPORTED_PROTOCOL_VERSION:
      console.error(`协议版本不支持: ${errorMsg}`)
      break
    case SurfaceErrorCode.SCHEMA_JSON_PARSE_FAILED:
      console.error(`DSL JSON 解析失败: ${errorMsg}`)
      break
    case SurfaceErrorCode.ACTION_NOT_REGISTER:
      console.error(`Action 未接管: ${errorMsg}。请调用 registerActionReceiver`)
      break
    case SurfaceErrorCode.LOCAL_FUNCTION:
      console.error(`自定义函数异常: ${errorMsg}`)
      break
    default:
      console.error(`错误 [${code}]: ${errorMsg}`)
  }
})
```

## 业务错误上报（context.onError）

自定义函数可以通过 [FunctionContext](API/client-function.md#functioncontext) 的 context.onError 主动上报业务错误；ClientFunction 字段定义见 [ClientFunction API](API/client-function.md#clientfunction)。

```ts
import {
  A2UIValueType,
  Catalog,
  CatalogFactory,
  ClientFunction,
  FunctionContext,
} from '@arkui-genius/genui'

function asArgs(params: A2UIValueType): Record<string, Object> {
  if (typeof params !== 'object' || params === null || Array.isArray(params)) {
    return {} as Record<string, Object>
  }
  return params as Record<string, Object>
}

const submitOrderFunction: ClientFunction = {
  name: 'submitOrder',
  schemaProvider: (version: string): string => JSON.stringify({
    type: 'object',
    properties: {
      orderId: { type: 'string' }
    },
    required: ['orderId']
  }),
  functionCall: (params: A2UIValueType, context: FunctionContext): A2UIValueType => {
    const args: Record<string, Object> = asArgs(params)
    const orderId: Object | undefined = args.orderId
    if (typeof orderId !== 'string' || orderId.length === 0) {
      context.onError('orderId is required')
      return undefined
    }
    // ... 业务处理
    return 'ok'
  }
}

const catalog: Catalog = CatalogFactory.extended()
catalog.addClientFunction(submitOrderFunction)
```

context.onError 上报的错误信息会通过 registerErrorCallback 统一接收。

---

↑ [返回 Reference 总览](../README.md#reference-api-速查)
