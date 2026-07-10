# 类型系统

| 类型 | 说明 |
|------|------|
| [CheckRule](#checkrule) | 用于输入类组件的客户端校验规则 |
| [Action](#action) | 定义组件交互行为 |
| [ChildList](#childlist) | 定义容器组件子节点来源 |
| [ComponentId](#componentid) | 引用另一个组件的唯一标识符 |
| [DataBinding](#databinding) | 通过 path 从 DataModel 读取值 |
| [Expression](#expression) | 使用 {{ ... }} 表达式在运行时计算值 |
| [PathBinding](#pathbinding) | 通过 JSON Pointer 路径从 DataModel 读取值 |
| [DynamicValue](#dynamicvalue) | 表示"可在运行时解析"的通用动态值 |
| [DynamicString](#dynamicstring) | 表示"可在运行时解析为字符串"的值 |
| [DynamicNumber](#dynamicnumber) | 表示"可在运行时解析为数值"的值 |
| [DynamicBoolean](#dynamicboolean) | 表示"可在运行时解析为布尔值"的值 |
| [DynamicStringList](#dynamicstringlist) | 表示"可在运行时解析为字符串数组"的值 |
| [ExtendedDynamicValueRef](#extendeddynamicvalueref) | 扩展组件 schema 中的动态值引用 |
| [ExtendedDynamicString](#extendeddynamicstring) | 扩展组件 schema 中的字符串动态类型 |
| [ExtendedDynamicNumber](#extendeddynamicnumber) | 扩展组件 schema 中的数值动态类型 |
| [ExtendedDynamicBoolean](#extendeddynamicboolean) | 扩展组件 schema 中的布尔动态类型 |

## CheckRule

CheckRule 用于输入类组件的客户端校验规则，当前定义如下：

```json
{
  "type": "object",
  "properties": {
    "condition": { "$ref": "#/$defs/DynamicBoolean" },
    "message": { "type": "string" }
  },
  "required": ["condition", "message"],
  "additionalProperties": false
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| condition | DynamicBoolean | 是 | 校验条件，运行时求值结果必须是布尔值。 |
| message | string | 是 | 校验失败时用于提示的文本。 |

## Action

Action 定义组件交互行为，支持二选一：上报服务器事件，或执行客户端函数。

```json
{
  "oneOf": [
    {
      "type": "object",
      "properties": {
        "event": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "context": {
              "type": "object",
              "additionalProperties": { "$ref": "#/$defs/DynamicValue" }
            }
          },
          "required": ["name"],
          "additionalProperties": false
        }
      },
      "required": ["event"],
      "additionalProperties": false
    },
    {
      "type": "object",
      "properties": {
        "functionCall": { "$ref": "#/$defs/FunctionCall" }
      },
      "required": ["functionCall"],
      "additionalProperties": false
    }
  ]
}
```

| 模式 | 字段 | 说明 |
|------|------|------|
| 服务器事件 | event | 上报交互事件，至少包含 name，可选 context。 |
| 客户端函数 | functionCall | 在本地执行 FunctionCall。 |

## ChildList

ChildList 定义容器组件子节点来源，支持[静态子组件列表](#静态子组件列表)或[动态模板](#动态模板)。动态模板也称为“模板对象”，用于从 DataModel 中的数组按模板生成子组件实例。

```json
{
  "oneOf": [
    {
      "type": "array",
      "items": { "$ref": "#/$defs/ComponentId" }
    },
    {
      "type": "object",
      "properties": {
        "componentId": { "$ref": "#/$defs/ComponentId" },
        "path": { "type": "string" }
      },
      "required": ["componentId", "path"],
      "additionalProperties": false
    }
  ]
}
```

| 形态 | 写法 | 说明 |
|------|------|------|
| [静态子组件列表](#静态子组件列表) | ["title", "content"] | 直接声明子组件 ID 数组。 |
| [动态模板](#动态模板) | { "componentId": "itemTemplate", "path": "/items" } | 从 DataModel 中的数组按模板批量生成子组件。 |

### 静态子组件列表

静态子组件列表是一个 [ComponentId](#componentid) 数组。数组中的每一项都直接引用同一 components 列表中已经声明的组件，渲染时按数组顺序挂载这些组件，不会根据数据模型重复生成实例。

### 动态模板

动态模板是一个包含 componentId 和 path 的对象：

- componentId：引用同一 components 列表中定义的模板组件 ID。该 ID 所指向的组件描述符就是模板描述符，用作每个数据项的生成蓝图，不能直接内联写在 children 中。
- path：JSON Pointer 路径，指向 DataModel 中的数组。

当使用动态模板时，框架会遍历 path 指向的数据数组，并为数组中每一项实例化 componentId 指定的模板组件。模板描述符自身也可以是容器组件；如果它的 children 继续使用动态模板，内层模板的 path 可以使用相对路径，相对于当前数据项解析。

### 模板模式异常与边界处理

| 场景 | 行为 |
|------|------|
| componentId 或 path 缺失/为空 | children 被视为无效，不展开模板，容器渲染为空。 |
| path 指向的数据路径在 DataModel 中不存在 | 不展开模板，容器渲染为空。 |
| path 指向的数据不是数组 | 报告 schema 警告，不展开模板，容器渲染为空。 |
| path 指向空数组 [] | 正常展开，itemCount 为 0，容器渲染为空（无子项）。 |
| 模板描述符存在循环引用（A → B → A） | 检测到循环后停止递归，已遍历的层级正常渲染。 |
| 单个数据项的模板实例构建失败 | 跳过该项，其余数据项继续渲染。 |
| 同一 componentId 的模板描述符再次下发 | 自动重建所有模板实例，反映最新描述符。 |

#### DFX 错误码

模板模式相关的错误通过 registerErrorCallback 注册的 onError 回调上报，错误码为 ERROR_SCHEMA_WARNING（2001）。

| 错误场景 | 错误消息 |
|---------|---------|
| componentId 为空字符串 | Property children.componentId is required for template object |
| path 指向的数据类型非数组 | Property children.path expects array data source, got type '<type>' |

错误码和错误回调的完整说明见 [onError](errors.md#错误码说明)。

## ComponentId

ComponentId 表示组件的唯一标识符，是一个 string 类型值，用于引用同一 DSL 文档中其他组件的 id 字段。

```json
{
  "type": "string",
  "description": "The unique identifier for a component, used for both definitions and references within the same surface."
}
```

| 属性 | 说明 |
|------|------|
| 类型 | string |
| 用途 | 引用同文档中已声明组件的 id，用于建立组件间的父子或引用关系。 |
| 约束 | 值必须对应同一 components 数组中某个组件的 id，否则引用无效。 |

## DataBinding

DataBinding 表示通过 JSON Pointer 路径从当前 Surface 的 DataModel 读取值。

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "A JSON Pointer path to a value in the data model."
    }
  },
  "required": ["path"],
  "additionalProperties": false
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| path | string | 是 | 指向 DataModel 中某个值的 JSON Pointer 路径，如 /user/name。 |

## Expression

Expression 表示使用 {{ ... }} 包裹的表达式字符串，运行时会根据当前上下文求值。

```json
{
  "type": "string",
  "pattern": "^\\{\\{[\\s\\S]*\\}\\}$",
  "description": "Expression string wrapped in {{...}}."
}
```

| 形态 | 写法 | 说明 |
|------|------|------|
| 表达式字符串 | "{{ user.name }}" | 从上下文读取变量或执行表达式计算。 |
| 条件表达式 | "{{ $selected == '' }}" | 常用于条件判断或动态属性值。 |

## PathBinding

PathBinding 表示通过 JSON Pointer 路径从当前 Surface 的 DataModel 读取值。它与旧文档中的 DataBinding 使用相同的 { "path": "..." } 写法。

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "A JSON Pointer path to a value in the data model."
    }
  },
  "required": ["path"],
  "additionalProperties": false
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| path | string | 是 | 指向 DataModel 中某个值的 JSON Pointer 路径，如 /user/name。 |

## DynamicValue

DynamicValue 表示可在运行时解析的通用动态值。组件属性、Action 上下文和函数参数会根据声明位置进一步约束为 DynamicString、DynamicNumber、DynamicBoolean 等具体类型。

```json
{
  "oneOf": [
    { "type": "string" },
    { "type": "number" },
    { "type": "boolean" },
    { "type": "array" },
    { "$ref": "#/$defs/Expression" },
    { "$ref": "#/$defs/PathBinding" },
    { "$ref": "#/$defs/FunctionCall" }
  ]
}
```

| 形态 | 写法 | 说明 |
|------|------|------|
| 字面量 | "text"、42、true、["a", "b"] | 直接使用 JSON 字面量；数组不限制元素类型。 |
| 表达式 | "{{ user.name }}" | 通过 [Expression](#expression) 从上下文计算值。 |
| 路径绑定 | { "path": "/user/name" } | 通过 [PathBinding](#pathbinding) 从 DataModel 读取值。 |
| 函数调用 | { "call": "formatCurrency", "args": { ... }, "returnType": "string" } | 通过 [FunctionCall](functions/functioncall.md) 动态计算值。 |

## DynamicString

DynamicString 表示"可在运行时解析为字符串"的值，是 [DynamicValue](#dynamicvalue) 的字符串子类型。

```json
{
  "oneOf": [
    { "type": "string" },
    { "$ref": "#/$defs/Expression" },
    { "$ref": "#/$defs/PathBinding" },
    {
      "allOf": [
        { "$ref": "#/$defs/FunctionCall" },
        { "properties": { "returnType": { "const": "string" } } }
      ]
    }
  ]
}
```

| 形态 | 写法 | 说明 |
|------|------|------|
| 字面量字符串 | "textValue" | 设置字面量字符串。 |
| 表达式 | "{{ order.statusText }}" | 通过 [Expression](#expression) 计算字符串。 |
| 路径绑定 | { "path": "/order/statusText" } | 通过 [PathBinding](#pathbinding) 从 DataModel 读取字符串。 |
| 函数调用 | { "call": "formatCurrency", "args": { ... }, "returnType": "string" } | 通过 [FunctionCall](functions/functioncall.md) 动态计算字符串。 |

## DynamicNumber

DynamicNumber 表示"可在运行时解析为数值"的值，是 [DynamicValue](#dynamicvalue) 的数值子类型。

```json
{
  "oneOf": [
    { "type": "number" },
    { "$ref": "#/$defs/Expression" },
    { "$ref": "#/$defs/PathBinding" },
    {
      "allOf": [
        { "$ref": "#/$defs/FunctionCall" },
        { "properties": { "returnType": { "const": "number" } } }
      ]
    }
  ]
}
```

| 形态 | 写法 | 说明 |
|------|------|------|
| 字面量数值 | 100 | 设置字面量数值。 |
| 表达式 | "{{ stats.count }}" | 通过 [Expression](#expression) 计算数值。 |
| 路径绑定 | { "path": "/stats/count" } | 通过 [PathBinding](#pathbinding) 从 DataModel 读取数值。 |
| 函数调用 | { "call": "函数名", "args": { ... }, "returnType": "number" } | 通过 [FunctionCall](functions/functioncall.md) 动态计算数值。 |

## DynamicBoolean

DynamicBoolean 表示"可在运行时解析为布尔值"的值，是 [DynamicValue](#dynamicvalue) 的布尔子类型。

```json
{
  "oneOf": [
    { "type": "boolean" },
    { "$ref": "#/$defs/Expression" },
    { "$ref": "#/$defs/PathBinding" },
    {
      "allOf": [
        { "$ref": "#/$defs/FunctionCall" },
        { "properties": { "returnType": { "const": "boolean" } } }
      ]
    }
  ]
}
```

| 形态 | 写法 | 说明 |
|------|------|------|
| 字面量布尔值 | true、false | 设置字面量布尔值。 |
| 表达式 | "{{ form.accepted }}" | 通过 [Expression](#expression) 计算布尔值。 |
| 路径绑定 | { "path": "/form/accepted" } | 通过 [PathBinding](#pathbinding) 从 DataModel 读取布尔值。 |
| 函数调用 | { "call": "函数名", "args": { ... }, "returnType": "boolean" } | 通过 [FunctionCall](functions/functioncall.md) 动态计算布尔值。 |

## DynamicStringList

DynamicStringList 表示"可在运行时解析为字符串数组"的值，是 [DynamicValue](#dynamicvalue) 的字符串数组子类型。

```json
{
  "oneOf": [
    { "type": "array", "items": { "type": "string" } },
    { "$ref": "#/$defs/Expression" },
    { "$ref": "#/$defs/PathBinding" },
    {
      "allOf": [
        { "$ref": "#/$defs/FunctionCall" },
        { "properties": { "returnType": { "const": "array" } } }
      ]
    }
  ]
}
```

| 形态 | 写法 | 说明 |
|------|------|------|
| 字面量数组 | ["a", "b"] | 设置字面量字符串数组。 |
| 表达式 | "{{ selectedItems }}" | 通过 [Expression](#expression) 计算字符串数组。 |
| 路径绑定 | { "path": "/selectedItems" } | 通过 [PathBinding](#pathbinding) 从 DataModel 读取字符串数组。 |
| 函数调用 | { "call": "函数名", "args": { ... }, "returnType": "array" } | 通过 [FunctionCall](functions/functioncall.md) 动态计算字符串数组。 |

## ExtendedDynamicValueRef

ExtendedDynamicValueRef 是扩展组件 JSON Schema 中使用的动态值引用类型，表示运行时可解析的 [Expression](#expression)、[PathBinding](#pathbinding) 或 [FunctionCall](functions/functioncall.md)。

```json
{
  "oneOf": [
    { "$ref": "#/$defs/Expression" },
    { "$ref": "#/$defs/PathBinding" },
    { "$ref": "#/$defs/FunctionCall" }
  ]
}
```

## ExtendedDynamicString

ExtendedDynamicString 表示字符串字面量，或一个 [ExtendedDynamicValueRef](#extendeddynamicvalueref)。静态字符串仍按字段自身的枚举、格式等规则校验。

```json
{
  "oneOf": [
    { "type": "string" },
    { "$ref": "#/$defs/ExtendedDynamicValueRef" }
  ]
}
```

## ExtendedDynamicNumber

ExtendedDynamicNumber 表示数值字面量，或一个 [ExtendedDynamicValueRef](#extendeddynamicvalueref)。静态数值仍按字段自身的范围规则校验。

```json
{
  "oneOf": [
    { "type": "number" },
    { "$ref": "#/$defs/ExtendedDynamicValueRef" }
  ]
}
```

## ExtendedDynamicBoolean

ExtendedDynamicBoolean 表示布尔字面量，或一个 [ExtendedDynamicValueRef](#extendeddynamicvalueref)。

```json
{
  "oneOf": [
    { "type": "boolean" },
    { "$ref": "#/$defs/ExtendedDynamicValueRef" }
  ]
}
```

---

↑ [返回 Reference 总览](../README.md)
