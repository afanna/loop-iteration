# 交互与函数

在 A2UI 中，"用户做了什么"通过 [Action](../reference/types.md#action) 机制来表达。Action 将用户的交互行为传递给 [Agent](agent-deployment-models.md) 或执行本地操作。

## Action 的两种模式

每个交互组件（[Button](../reference/standard-components/button.md)、[TextField](../reference/standard-components/textfield.md) 等）可以通过 action 属性定义交互行为。Action 支持两种模式：

### Server Action（事件 → Agent）

将用户交互以事件形式发送给 Agent，Agent 据此决定下一轮响应：

```json
{
  "id": "submit-btn",
  "component": "Button",
  "child": "btn_text",
  "action": {
    "event": {
      "name": "submitForm",
      "context": {
        "email": { "path": "/form/email" },
        "name": { "path": "/form/name" }
      }
    }
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 事件名称，Agent 据此识别用户意图 |
| context | object | 否 | 事件携带的上下文数据，可包含 [DataModel](data-model-and-binding.md) 路径引用<br/>默认值："{}" |

### Local Action（函数调用 → 本地执行）

直接在客户端执行预定义的函数，无需经过 Agent：

```json
{
  "id": "link-btn",
  "component": "Button",
  "child": "btn_text",
  "action": {
    "functionCall": {
      "call": "openUrl",
      "args": {
        "url": "https://example.com"
      }
    }
  }
}
```

## 接收 Action 回调

在 GenUI 中，通过 [registerActionReceiver](../reference/API/surface-controller.md#registeractionreceiver) 接收 Action 事件：

```ts
controller.registerActionReceiver((action: string) => {
  // action 是 JSON 字符串
  const parsed = JSON.parse(action)

  // 典型格式：
  // {
  //   "version": "v0.9",
  //   "action": {
  //     "name": "submitForm",
  //     "surfaceId": "main",
  //     "sourceComponentId": "submit-btn",
  //     "timestamp": "2026-05-26T10:00:00Z",
  //     "context": { "email": "alice@example.com", "name": "Alice" }
  //   }
  // }

  console.log(`收到 Action: ${parsed.action.name}`)
  console.log(`来源组件: ${parsed.action.sourceComponentId}`)
  console.log(`上下文:`, parsed.action.context)

  // 将 Action 发送给 Agent/LLM 进行下一轮处理
  sendToLLM(parsed.action)
})
```

## DFX 说明

  "Action未注册"的异常通过 [registerErrorCallback](../reference/API/surface-controller.md#registererrorcallback) 注册的 onError 回调。

  | 错误类型 | code 值 | error message | 说明 |
  |------|---------|---------------|------|
  | ERROR_ACTION_NOT_REGISTER | 3001 | onAction callback is not registered | DSL 触发 action.event，但宿主未调用 registerActionReceiver。 |

  错误码和错误回调的完整说明见 [onError](../reference/errors.md#错误码说明) 。

## 内置函数

A2UI 内置了 14 个函数，按用途分类：

### 校验函数

| 函数 | 用途 |
|------|------|
| [required](../reference/functions/validation.md#required) | 值不为空 |
| [regex](../reference/functions/validation.md#regex) | 匹配正则表达式 |
| [length](../reference/functions/validation.md#length) | 字符串长度约束 |
| [numeric](../reference/functions/validation.md#numeric) | 数值范围约束 |
| [email](../reference/functions/validation.md#email) | 邮箱格式 |

### 格式化函数

| 函数 | 用途 |
|------|------|
| [formatString](../reference/functions/format.md#formatstring) | 字符串模板插值 |
| [formatNumber](../reference/functions/format.md#formatnumber) | 数字格式化 |
| [formatCurrency](../reference/functions/format.md#formatcurrency) | 货币格式化 |
| [formatDate](../reference/functions/format.md#formatdate) | 日期/时间格式化 |
| [pluralize](../reference/functions/format.md#pluralize) | 复数/单数选择 |

### 逻辑函数

| 函数 | 用途 |
|------|------|
| [and](../reference/functions/logic.md#and) | 逻辑与 |
| [or](../reference/functions/logic.md#or) | 逻辑或 |
| [not](../reference/functions/logic.md#not) | 逻辑非 |

### 系统函数

| 函数 | 用途 |
|------|------|
| [openUrl](../reference/functions/system.md#openurl) | 打开 URL |

## 函数在 DSL 中的用法

函数不仅可以作为 Action（Button 点击时执行），还可以：

### 作为动态值（[DynamicValue](../reference/types.md)）

```json
{ "id": "price_text", "component": "Text",
  "text": { "call": "formatCurrency", "args": { "value": { "path": "/price" } }, "returnType": "string" } }
```

### 作为校验规则（[CheckRule](../reference/types.md#checkrule)）

```json
{ "id": "email", "component": "TextField",
  "value": { "path": "/form/email" },
  "checks": [
    { "condition": { "call": "required", "args": { "value": { "path": "/form/email" } } },
      "message": "邮箱不能为空" },
    { "condition": { "call": "email", "args": { "value": { "path": "/form/email" } } },
      "message": "邮箱格式不正确" }
  ] }
```

## 鸿蒙扩展函数

鸿蒙扩展协议增加了 10 个函数（break、sendToAssistant、setDataModel、setAttributes、scrollTo、navigate 等），详见 [扩展函数参考](../reference/functions/extension-functions.md)。

## EventHandler 链（扩展组件）

扩展组件支持通过事件属性（如 onClick、onAppear、onChange）定义 **EventHandler 链**——一组按顺序执行的函数调用。当事件触发时，数组中的 handler 被依次执行，支持条件跳过、链中断和局部变量绑定。

与标准组件的单个 action 不同，EventHandler 链可以将多个函数调用组合为一个事件响应流程，适合需要**多步操作、条件分支或中间变量传递**的场景。

**核心能力：**

- **链式执行**：handler 按数组顺序依次执行
- **as 局部变量**：{ "call": "getRadioValue", "as": "selected" } 将返回值绑定为局部变量，后续 handler 通过 $selected 引用
- **condition 条件跳过**：{ "call": "...", "condition": "{{ $x == '' }}" } 条件为 false 时跳过
- **break 链中断**：{ "call": "break" } 立即中断整个链
- **Button action 优先级**：有 action 时 onClick 不注册

### EventHandler 结构

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| call | string | 是 | 函数名（预定义函数或自定义函数） |
| args | object | 否 | 函数参数，值支持表达式 |
| as | string | 否 | 将函数返回值绑定为局部变量，后续 handler 可通过 $变量名 引用 |
| condition | string | 否 | 执行条件表达式，为 false 时跳过该 handler |

### 支持的事件属性

| 事件属性 | 适用组件 | 触发时机 |
|----------|----------|----------|
| onClick | 所有扩展组件 | 用户点击 |
| onAppear | 所有扩展组件 | 组件首次出现 |
| onChange | TextInput, Select, Toggle | 值变更 |
| onReachStart | List | 滚动到顶部 |
| onReachEnd | List | 滚动到底部 |

### 示例

```json
{
  "id": "refreshBtn",
  "component": "Button",
  "label": "刷新",
  "onClick": [
    { "call": "setDataModel", "args": { "path": "/ui/isLoading", "value": true } },
    { "call": "setAttributes", "args": { "componentId": "refreshBtn", "value": { "label": "加载中..." } } },
    { "call": "break", "condition": "{{ $__DataModel.form.valid == false }}" },
    { "call": "openUrl", "args": { "url": "https://example.com/result" } }
  ]
}
```

### Button 的 action 优先级

Button 组件同时支持 action 属性和 onClick 事件监听。**action 优先级高于 onClick**：当 Button 定义了 action 时，onClick 不会注册。

```json
// action 生效，onClick 被忽略
{
  "id": "btn",
  "component": "Button",
  "label": "提交",
  "action": { "functionCall": { "call": "openUrl", "args": { "url": "https://example.com" } } },
  "onClick": [{ "call": "setDataModel", "args": { "path": "/clicked", "value": true } }]
}
```

### 约束

- call 和 as 字段为标识符引用，不支持表达式
- EventHandler 仅能在事件监听中使用，不可用于组件属性或样式求值

### 异常与容错

| 异常情况 | 系统行为 |
|----------|----------|
| handler 不是 JSON 对象 | 跳过该 handler，链继续 |
| handler 缺少 call 或类型非 string | 跳过该 handler，链继续 |
| condition 是对象而非表达式字符串 | 跳过该 handler，链继续 |
| as 字段存在但类型非 string | 跳过该 handler，链继续 |
| call 指定的函数名未注册 | 记录警告日志，跳过该 handler，链继续 |
| handler 执行抛出异常 | 记录错误日志，链立即中断 |
| setDataModel 的 path 为空 | 数据不更新，链继续 |
| setAttributes 的 componentId 为空或组件不存在 | 属性不更新，链继续 |
| setAttributes 的 value 不是对象 | 属性不更新，链继续 |
| Surface 已销毁 | DataModel 为空，链仍执行但数据操作无效 |
| navigate 函数（当前未实现） | 无导航效果，链继续 |
| Button 的 action 解析失败 | 清除 action，回退到 onClick 事件 |

→ EventHandler 结构与链式执行规则见 [扩展组件参考 → 通用事件属性](../reference/extended-components/overview.md#通用事件属性)
→ 实战示例见 [处理用户交互 → 扩展组件事件响应](../guides/handling-user-interactions.md#扩展组件事件响应eventhandler-链)

## 自定义函数

除了内置和扩展函数，你还可以通过 [ClientFunction](../reference/API/client-function.md#clientfunction) 注册自己的业务函数——税费计算、设备操作、数据查询等。注册后的函数可在 DSL 中作为 Action、动态值或校验条件使用。

→ 详见 [自定义函数指南](../guides/creating-custom-functions.md)

---

← 上一节：[数据流](data-flow.md) | → 下一节：[Catalog](catalogs.md) | ↑ [概念层总览](overview.md)

> **延伸阅读**：[A2UI 官方文档 - Actions](https://a2ui.org/concepts/actions/)
