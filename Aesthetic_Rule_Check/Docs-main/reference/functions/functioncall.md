# FunctionCall 类型说明

FunctionCall 是 [A2UI 协议](../../introduction/a2ui-and-harmonyos.md#a2ui-是什么)中用于调用客户端函数的核心类型。它允许 [DSL](../messages.md#协议消息信封) 在运行时触发验证、格式化、逻辑运算和组件交互等操作。

## 类型定义

```json
{
  "call": "函数名",
  "args": { "参数名": "参数值" },
  "returnType": "返回类型"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| call | string | 是 | 要调用的函数名称。支持内置函数名和通过 ClientFunction.name 注册到 Catalog 的自定义函数名。 |
| args | object | 否 | 传递给函数的参数对象。每个参数值支持字面量（string、number、boolean）、路径绑定（{ "path": "..." }）或嵌套的 FunctionCall。默认值：{}。 |
| returnType | string | 否 | 期望的函数返回类型，用于运行时类型校验。默认值："boolean"。 |

### returnType 枚举值

| 值 | 说明 |
|------|------|
| "string" | 字符串类型 |
| "number" | 数值类型 |
| "boolean" | 布尔类型 |
| "array" | 数组类型，对应 [DynamicStringList](../types.md#dynamicstringlist) |
| "object" | 对象类型 |
| "any" | 任意类型，跳过类型校验 |
| "void" | 无返回值 |

## 使用场景

> 以下所有使用场景均为 **DSL 消息中的片段**，是 [LLM](../../guides/integrating-llm.md) 生成的模型产物，而非开发者手写的代码。开发者仅需了解这些结构以便设计 Prompt 和调试。

### 1. 作为 Action 触发（functionCall）

在组件的 [action](../types.md#action) 字段中使用，响应用户交互（如点击 [ExtendedButton](../extended-components/button.md)）：

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "action_surface",
    "components": [
      {
        "id": "btn",
        "component": "Button",
        "label": "打开链接",
        "action": {
          "functionCall": {
            "call": "openUrl",
            "args": { "url": "https://example.com" },
            "returnType": "void"
          }
        }
      }
    ]
  }
}
```

Action 除了 functionCall（本地函数调用）外，还支持 event（服务器事件）：

```json
{
  "action": {
    "event": {
      "name": "submit",
      "context": {
        "value": { "path": "formData" }
      }
    }
  }
}
```

### 2. 作为 DynamicValue 表达式

FunctionCall 是 [DynamicValue](../types.md#dynamicvalue) 的三种形态之一（字面量、路径绑定、函数调用），可以直接作为组件属性值使用：

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "price_surface",
    "components": [
      {
        "component": "Text",
        "id": "price",
        "text": {
          "call": "formatCurrency",
          "args": {
            "value": { "path": "price" },
            "currency": "CNY"
          },
          "returnType": "string"
        }
      }
    ]
  }
}
```

对应的具体类型约束：

| Dynamic 类型 | returnType 约束 |
|-------------|----------------|
| [DynamicString](../types.md#dynamicstring) | "string" |
| [DynamicNumber](../types.md#dynamicnumber) | "number" |
| [DynamicBoolean](../types.md#dynamicboolean) | "boolean" |
| [DynamicStringList](../types.md#dynamicstringlist) | "array" |

#### DynamicString

DynamicString 是可动态求值为字符串的类型，支持以下三种形态：

| 形态 | 写法 | 说明 |
|------|------|------|
| 字面量 | "Hello" | 直接使用字符串常量。 |
| 路径绑定 | { "path": "title" } | 从当前 [Surface](../../concepts/surfaces-and-messages.md#surface-是什么) 的[数据模型](../../concepts/data-model-and-binding.md#datamodel-是什么)中读取指定路径的字符串值。 |
| 函数调用 | { "call": "函数名", "args": {...}, "returnType": "string" } | 调用客户端函数，返回值必须为 string。 |

常见用于 [Text](../standard-components/text.md).text、[ExtendedButton](../extended-components/button.md).label 等属性。

#### DynamicNumber

DynamicNumber 是可动态求值为数值的类型，支持以下三种形态：

| 形态 | 写法 | 说明 |
|------|------|------|
| 字面量 | 100 | 直接使用数值常量。 |
| 路径绑定 | { "path": "amount" } | 从当前 Surface 的数据模型中读取指定路径的数值。 |
| 函数调用 | { "call": "函数名", "args": {...}, "returnType": "number" } | 调用客户端函数，返回值必须为 number。 |

#### DynamicBoolean

DynamicBoolean 是可动态求值为布尔值的类型，支持以下三种形态：

| 形态 | 写法 | 说明 |
|------|------|------|
| 字面量 | true | 直接使用布尔常量。 |
| 路径绑定 | { "path": "checked" } | 从当前 Surface 的数据模型中读取指定路径的布尔值。 |
| 函数调用 | { "call": "函数名", "args": {...}, "returnType": "boolean" } | 调用客户端函数，返回值必须为 boolean。 |

常见用于 [Checkbox](../standard-components/checkbox.md).value、[CheckRule](../types.md#checkrule) 的 condition 等场景。

#### DynamicStringList

DynamicStringList 是可动态求值为字符串数组的类型，支持以下三种形态：

| 形态 | 写法 | 说明 |
|------|------|------|
| 字面量 | ["a", "b"] | 直接使用字符串数组常量。 |
| 路径绑定 | { "path": "selectedItems" } | 从当前 Surface 的数据模型中读取指定路径的字符串数组。 |
| 函数调用 | { "call": "函数名", "args": {...}, "returnType": "array" } | 调用客户端函数，返回值必须为 array。 |

### 3. 作为 CheckRule 验证条件

在输入组件的 checks 数组中，通过 condition（类型为 DynamicBoolean）调用验证函数：

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "form_surface",
    "components": [
      {
        "id": "usernameField",
        "component": "TextField",
        "checks": [
          {
            "condition": {
              "call": "required",
              "args": { "value": { "path": "username" } },
              "returnType": "boolean"
            },
            "message": "用户名不能为空"
          },
          {
            "condition": {
              "call": "length",
              "args": { "value": { "path": "username" }, "min": 3, "max": 20 },
              "returnType": "boolean"
            },
            "message": "长度应为 3-20 位"
          }
        ]
      }
    ]
  }
}
```

### 4. 嵌套函数调用

args 中的参数值本身也可以是 FunctionCall，支持函数组合。以下为 FunctionCall 片段（非完整 DSL 消息）：

```json
{
  "call": "and",
  "args": {
    "values": [
      {
        "call": "required",
        "args": { "value": { "path": "email" } },
        "returnType": "boolean"
      },
      {
        "call": "email",
        "args": { "value": { "path": "email" } },
        "returnType": "boolean"
      }
    ]
  },
  "returnType": "boolean"
}
```

## 参数值的动态解析

args 中的每个参数值在运行时会按以下规则解析：

| 值类型 | 解析方式 | 示例 |
|------|------|------|
| 字面量 | 直接使用 | "currency": "CNY" |
| 路径绑定 | 从当前 Surface 的数据模型中读取 | "value": { "path": "amount" } |
| 函数调用 | 递归执行函数 | "value": { "call": "formatNumber", "args": { "value": { "path": "price" } }, "returnType": "string" } |

> **路径绑定说明**：{ "path": "xxx" } 中的路径指向当前组件所属 Surface 的数据模型（data model）。数据模型由 LLM 在 DSL 消息中定义，路径采用点分格式（如 "user.name"、"formData.email"）。

## Action 类型

Action 是 FunctionCall 的上层封装，支持两种互斥模式：

| 模式 | 字段 | 说明 |
|------|------|------|
| 服务器事件 | event | 向服务端发送事件，包含 name 和可选 context |
| 本地函数调用 | functionCall | 在客户端执行 FunctionCall |

## 参考链接

- [函数概览](overview.md)
- [验证函数](validation.md)
- [格式化函数](format.md)
- [本地函数](local-functions.md)

---

↑ [返回文档导航](../../README.md)
