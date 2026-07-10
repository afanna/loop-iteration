# 自定义函数

自定义函数允许 DSL 调用宿主侧业务逻辑，例如价格计算、数据查询和设备能力调用。函数通过 [ClientFunction](../reference/API/client-function.md#clientfunction) 描述，并通过 [Catalog.addClientFunction](../reference/API/catalog.md#addclientfunction) 加入 Catalog。

---

## 何时使用自定义函数

| 场景 | 方案 |
|------|------|
| 简单算术、字符串拼接、三元判断 | [表达式](working-with-expressions.md) |
| 税费、折扣、校验等业务计算 | 自定义函数 |
| 本地缓存或数据库查询 | 自定义函数 |
| 设备能力调用 | 自定义函数 |

---

## Step 1：声明函数

```ts
import {
  A2UIValueType,
  ClientFunction,
  FunctionContext
} from '@arkui-genius/genui'

function asArgs(params: A2UIValueType): Record<string, Object> {
  if (typeof params !== 'object' || params === null || Array.isArray(params)) {
    return {}
  }
  return params as Record<string, Object>
}

const calculateTaxFunction: ClientFunction = {
  name: 'calculateTax',
  schemaProvider: (_version: string): string => JSON.stringify({
    type: 'object',
    properties: {
      price: { type: 'number', description: '商品价格，单位为元，支持路径绑定' },
      rate: { type: 'number', description: '税率，例如 0.13' }
    },
    required: ['price']
  }),
  functionCall: (params: A2UIValueType, context: FunctionContext): A2UIValueType => {
    const args = asArgs(params)
    const price = context.resolver.evaluateValue<number>(args.price) ?? 0
    const rate = context.resolver.evaluateValue<number>(args.rate) ?? 0.13
    return (price * rate).toFixed(2)
  }
}

const isValidPhoneFunction: ClientFunction = {
  name: 'isValidPhone',
  schemaProvider: (_version: string): string => JSON.stringify({
    type: 'object',
    properties: {
      phone: { type: 'string', description: '中国大陆手机号，支持路径绑定' }
    },
    required: ['phone']
  }),
  functionCall: (params: A2UIValueType, context: FunctionContext): A2UIValueType => {
    const args = asArgs(params)
    const phone = context.resolver.evaluateValue<string>(args.phone) ?? ''
    return /^1[3-9]\d{9}$/.test(phone)
  }
}
```

FunctionContext.resolver 会解析参数中的字面量、路径绑定和嵌套函数调用。业务异常可通过 context.onError 上报，错误会进入 SurfaceController.registerErrorCallback。

---

## Step 2：加入 Catalog

```ts
import { Catalog, CatalogFactory } from '@arkui-genius/genui'

const catalog: Catalog = CatalogFactory.extended()
catalog.addClientFunction(calculateTaxFunction)
catalog.addClientFunction(isValidPhoneFunction)
```

函数名在当前 Catalog 内应保持唯一。addClientFunction 遇到同名函数会替换旧定义。

---

## Step 3：在 DSL 中调用

在 DSL 中，call 写 ClientFunction.name，args 写本次调用参数，returnType 写函数返回值类型。

### 作为 Action

```json
{
  "id": "calcBtn",
  "component": "Button",
  "label": "计算税费",
  "action": {
    "functionCall": {
      "call": "calculateTax",
      "args": { "price": 100, "rate": 0.13 },
      "returnType": "string"
    }
  }
}
```

### 作为动态值

```json
{
  "id": "taxLabel",
  "component": "Text",
  "text": {
    "call": "calculateTax",
    "args": {
      "price": { "path": "/order/total" },
      "rate": 0.13
    },
    "returnType": "string"
  }
}
```

### 作为校验条件

```json
{
  "id": "phone",
  "component": "TextField",
  "label": "手机号",
  "value": { "path": "/form/phone" },
  "checks": [
    {
      "condition": {
        "call": "isValidPhone",
        "args": { "phone": { "path": "/form/phone" } },
        "returnType": "boolean"
      },
      "message": "手机号格式不正确"
    }
  ]
}
```

---

## 配合 PromptBuilder

函数加入 Catalog 后，PromptBuilder 会读取函数 Schema，生成给 LLM 的能力说明。

```ts
import {
  BASIC_CATALOG_PROTOCOL_VERSION_V09,
  PromptBuilder
} from '@arkui-genius/genui'

const instruction: string = PromptBuilder.buildInstruction(
  catalog,
  BASIC_CATALOG_PROTOCOL_VERSION_V09
)
```

---

## 注意事项

- **函数名唯一**：不要覆盖内置函数或其他业务函数。
- **注册时机**：创建 SurfaceController 前准备好 Catalog，并把该 Catalog 传入控制器工厂。
- **参数解析**：需要支持路径绑定或嵌套函数调用时，使用 FunctionContext.resolver。
- **错误上报**：业务错误使用 FunctionContext.onError，上层通过 registerErrorCallback 统一接收。
- **同步返回**：FunctionCall 是同步接口；异步结果应通过后续业务消息更新 DataModel 或组件。

---

相关指南：
→ [自定义组件](creating-custom-components.md) | → [定义 Catalog](defining-catalogs.md) | → [函数参考](../reference/functions/overview.md) | → [ClientFunction API](../reference/API/client-function.md)
