# Schema 校验

Schema校验指是基于预先定义的数据结构约束规范（Schema 元描述），对入参 JSON / 结构化数据开展合法性校验的机制。通过标准化规则约束字段必填属性、数据类型、字符长度、取值范围、嵌套结构、枚举值域等数据特征，在数据解析、业务加载前置环节校验并上报不合规数据，保障业务逻辑运行稳定。

## 校验对象与错误码总览

Schema校验对象总体分为三项：Message消息、Function函数、Component组件。

Schema 相关错误码分为两层：

1. 外层数字码：作为 [registerErrorCallback(code, errorMsg)](./errors.md#注册错误回调) 中的 code 上报。
2. 内层字符串码：只出现在 ERROR_SCHEMA_WARNING = 2001 的 JSON 字符串 里，用于标识具体 warning 类型。

### 外层 SurfaceErrorType

| SurfaceErrorType | 数值 | 说明 |
|--------------------|------|------|
| ERROR_SCHEMA_WARNING | 2001 | 内部 warnings[i].code 为 [SchemaErrorCode](./schema-validation.md#内层-schemaerrorcode) |
| ERROR_SCHEMA_DSL_EMPTY | 2002 | DSL 为空白字符串（阻断错误） |
| ERROR_SCHEMA_JSON_PARSE_FAILED | 2003 | DSL JSON 解析失败（阻断错误） |
| ERROR_SCHEMA_ROOT_NOT_OBJECT | 2004 | DSL 根节点不是 object（阻断错误） |
| ERROR_SCHEMA_MESSAGE_OPERATION_INVALID | 2101 | 缺少已知消息体或存在未知 operation（阻断错误） |
| ERROR_SCHEMA_MESSAGE_MULTIPLE_BODIES | 2102 | 同时存在多个消息体（阻断错误） |
| ERROR_SCHEMA_MESSAGE_BODY_INVALID | 2103 | 消息体不是 object（阻断错误） |
| ERROR_SCHEMA_SURFACE_ID_MISSING | 2104 | 消息体缺少非空 surfaceId（阻断错误） |
| ERROR_SCHEMA_COMPONENTS_INVALID | 2105 | updateComponents.components 不是 array（阻断错误） |
| ERROR_SCHEMA_CATALOG_ID_MISSING | 2106 | createSurface.catalogId 缺失或为空（阻断错误） |
| ERROR_SCHEMA_VERSION_INVALID | 2107 | version 缺失、为空或类型非法（阻断错误） |

### 内层 SchemaErrorCode

| 字符串值 | 含义 | 典型 warnings[i].message |
|----------|------|----------------------------|
| ERROR_CODE_REQUIRED_MISS | 必填字段缺失、空字符串或数组长度不足 | Message surfaceId is required、Property action is required, fallback to default value |
| ERROR_CODE_INVALID_VALUE | 值违反约束、枚举非法、分支不匹配、动态描述符不支持 | Field value is not in enum list, fallback to default enum value、Property <key> does not support dynamic binding, path '<path>' has been ignored |
| ERROR_CODE_UNDEFINED_FIELD | 字段未在 schema 或本地白名单中定义，忽略 | Root field <key> is undefined in schema and has been removed、Property <key> is undefined in native local schema and has been ignored |
| ERROR_CODE_TYPE_MISMATCH | 类型不匹配，后续通常会强转、fallback 或忽略 | Root JSON must be an object、Property <key> expects number value, got type '<type>', compatibility normalization has been applied |
| ERROR_CODE_SCHEMA_PARSE_FAILED | DSL JSON 解析失败 | DSL JSON parse failed |

### errorMsg 说明

| 回调 code | 说明 |
|-------------|------|
| ERROR_SCHEMA_WARNING | 聚合本次消息产生的所有 schema warning |
| ERROR_SCHEMA_* 阻断错误 | native 处理失败时的直接错误描述，如 dsl json parse failed、root json must be an object、updateComponents.components is invalid |

ERROR_SCHEMA_WARNING 的 errorMsg 示例：

```json
{
  "type": "schemaWarning",
  "warningCount": 2,
  "warnings": [
    {
      "code": "ERROR_CODE_REQUIRED_MISS",
      "message": "Message surfaceId is required",
      "path": "updateComponents.surfaceId",
      "itemType": "message",
      "itemName": "updateComponents"
    },
    {
      "code": "ERROR_CODE_UNDEFINED_FIELD",
      "message": "Property unknownProp is undefined in native local schema and has been ignored",
      "path": "text1.unknownProp",
      "itemType": "component",
      "itemName": "Text"
    }
  ]
}
```

## Message 消息校验

| 校验项 | SchemaError code | 错误信息 | 结果 |
| --- | --- | --- | --- |
| DSL 为空白字符串 | ERROR_SCHEMA_DSL_EMPTY | dsl is empty | 中断渲染 |
| version 缺失、非 string 或空白 | ERROR_SCHEMA_VERSION_INVALID | version is invalid | 中断渲染 |
| DSL JSON 解析失败 | ERROR_SCHEMA_JSON_PARSE_FAILED | DSL JSON parse failed | 中断渲染 |
| root 不是 object | ERROR_SCHEMA_ROOT_NOT_OBJECT | Root JSON must be an object | 中断渲染 |
| 顶层消息体缺失 | ERROR_SCHEMA_MESSAGE_OPERATION_INVALID | Message body is missing, expected exactly one of createSurface, updateComponents, updateDataModel, deleteSurface | 中断渲染 |
| 顶层 operation 非法 | ERROR_SCHEMA_MESSAGE_OPERATION_INVALID | Message operation is unknown | 中断渲染 |
| 同时存在多个消息体 | ERROR_SCHEMA_MESSAGE_MULTIPLE_BODIES | Message contains multiple bodies, only one is allowed | 中断渲染 |
| operation 不支持 | ERROR_SCHEMA_MESSAGE_OPERATION_INVALID | Message operation is not supported | 中断渲染 |
| 消息 body 不是 object | ERROR_SCHEMA_MESSAGE_BODY_INVALID | <messageKey> body is invalid | 中断渲染 |
| surfaceId 缺失或空字符串 | ERROR_SCHEMA_SURFACE_ID_MISSING | <messageKey>.surfaceId is invalid | 中断渲染 |
| createSurface.catalogId 缺失或空字符串 | ERROR_SCHEMA_CATALOG_ID_MISSING | createSurface.catalogId is invalid | 中断渲染 |
| updateComponents.components 不是数组 | ERROR_SCHEMA_COMPONENTS_INVALID | updateComponents.components is invalid | 中断渲染 |
| updateDataModel.path 与 value 同时缺失 | ERROR_CODE_REQUIRED_MISS | Message updateDataModel requires path or value, fallback path to "/" | fallback 到 path="/" |
| root 未定义字段 | ERROR_CODE_UNDEFINED_FIELD | Root field <key> is undefined in schema and has been removed | 忽略该字段 |
| createSurface.catalogId 与 SurfaceController 的 catalog.id 不一致 | ERROR_CODE_INVALID_VALUE | Message catalogId differs from SurfaceController catalog.id and native processing will use createSurface.catalogId | 继续渲染，使用 createSurface.catalogId |

说明：

1. <messageKey> 是 createSurface、updateComponents、updateDataModel、deleteSurface 之一。

## Function 函数校验

| 校验项 | SchemaError code | 错误信息 | 结果 |
| --- | --- | --- | --- |
| 顶层 call 缺失或空字符串 | ERROR_CODE_REQUIRED_MISS | Property call is required | 该 Function 失效 |
| call 存在但不是字符串 | ERROR_CODE_TYPE_MISMATCH | Property call expects string value | 该 Function 失效 |
| call 是空字符串 | ERROR_CODE_REQUIRED_MISS | Property call is required | 该 Function 失效 |
| anyOf / oneOf 无匹配分支 | ERROR_CODE_INVALID_VALUE | Value does not match any allowed schema branch, fallback to closest branch | fallback 到最接近分支 |
| object 字段类型不匹配 | ERROR_CODE_TYPE_MISMATCH | Object field type mismatch, fallback to default object value | fallback 到 {} |
| object required 字段缺失，且 schema 无可补属性 schema | ERROR_CODE_REQUIRED_MISS | Property <key> is required | 记录 warning |
| object required 字段缺失，且可按 schema 补默认值 | ERROR_CODE_REQUIRED_MISS | Property <key> is required, fallback to default value | 自动补 fallback |
| object 未定义字段 | ERROR_CODE_UNDEFINED_FIELD | Property <key> is undefined in schema and has been removed | 忽略该字段 |
| array 字段类型不匹配 | ERROR_CODE_TYPE_MISMATCH | Array field type mismatch, fallback to default array value | fallback 到 [] |
| array 长度低于 minItems | ERROR_CODE_REQUIRED_MISS | Array size is smaller than schema minimum, append default item | 追加默认 item |
| 标量字段类型不匹配 | ERROR_CODE_TYPE_MISMATCH | Field type mismatch, fallback to schema default for type <type> | fallback 到 schema 默认值 |
| const 不匹配 | ERROR_CODE_INVALID_VALUE | Field does not match const constraint, fallback to const value | fallback 到默认值 |
| enum 不匹配 | ERROR_CODE_INVALID_VALUE | Field value is not in enum list, fallback to default enum value | fallback 到默认值 |
| pattern 不匹配 | ERROR_CODE_INVALID_VALUE | Field value does not match schema pattern, fallback to default value | fallback 到默认值 |

## Component 组件校验

| 校验项 | SchemaError code | 错误信息 | 结果 |
| --- | --- | --- | --- |
| descriptor 缺少 id | ERROR_CODE_REQUIRED_MISS | Property id is required, drop current item | 当前组件项被丢弃 |
| descriptor 缺少 component | ERROR_CODE_REQUIRED_MISS | Property component is required, drop current item | 当前组件项被丢弃 |
| children 既不是数组也不是模板 object | ERROR_CODE_TYPE_MISMATCH | Property children expects array or template object, got type '<type>', field has been ignored | 忽略该字段 |
| required 属性缺失 | ERROR_CODE_REQUIRED_MISS | Property <key> is required, fallback to default value | 保持默认值 |
| 顶层未知字段 | ERROR_CODE_UNDEFINED_FIELD | Property <key> is undefined in native local schema and has been ignored | 忽略 |
| accessibility.* 未知字段 | ERROR_CODE_UNDEFINED_FIELD | Property accessibility.<key> is undefined in native local schema and has been ignored | 忽略 |
| accessibility 不是 object | ERROR_CODE_TYPE_MISMATCH | Property accessibility expects object value | 忽略该字段 |
| string 属性类型不匹配 | ERROR_CODE_TYPE_MISMATCH | Property <name> expects string value, got type '<type>', value has been coerced to string | 转字符串并继续 |
| number 属性类型不匹配 | ERROR_CODE_TYPE_MISMATCH | Property <name> expects number value, got type '<type>', compatibility normalization has been applied | fallback 后继续 |
| boolean 属性类型不匹配 | ERROR_CODE_TYPE_MISMATCH | Property <name> expects boolean value, got type '<type>', compatibility normalization has been applied | fallback 后继续 |
| enum 值非法 | ERROR_CODE_INVALID_VALUE | Property <name> got invalid enum value '<candidate>', fallback to '<fallback>' | fallback 到 enum 默认值 |
| enum 类型不匹配 | ERROR_CODE_TYPE_MISMATCH | Property <name> expects string enum value, got type '<type>', fallback to '<fallback>' | fallback 到 enum 默认值 |
| 传入 object literal，但既不是 {path} 也不是 {call} | ERROR_CODE_TYPE_MISMATCH | Property <key> expects direct value or dynamic descriptor, object literal has been dropped | 删除该字段 |
| 属性不支持动态 path 绑定 | ERROR_CODE_INVALID_VALUE | Property <key> does not support dynamic binding, path '<path>' has been ignored | 移除 binding |
| checks 不是数组 | ERROR_CODE_TYPE_MISMATCH | Property checks expects array value, got type '<type>', field has been ignored | 忽略 |
| checks[i] 不是 object | ERROR_CODE_TYPE_MISMATCH | Property checks item expects object value, got type '<type>', item has been ignored | 忽略该 item |
| checks[i].condition 缺失 | ERROR_CODE_REQUIRED_MISS | Property condition is required, field has been ignored | 忽略该条件 |
| checks[i].condition 不是 object | ERROR_CODE_TYPE_MISMATCH | Property condition expects object value, got type '<type>', field has been ignored | 忽略该条件 |
| checks[i].message 缺失 | ERROR_CODE_REQUIRED_MISS | Property message is required, fallback to default value | fallback 到默认值 |
| checks[i].message 不是 string | ERROR_CODE_TYPE_MISMATCH | Property message expects string value, got type '<type>', fallback to default value | fallback 到默认值 |
| action 不是 object | ERROR_CODE_TYPE_MISMATCH | Property action expects object value, got type '<type>', field has been ignored | 忽略 |
| action 同时包含 event 与 functionCall | ERROR_CODE_INVALID_VALUE | Property action cannot contain both event and functionCall, field has been ignored | 忽略 |
| action 同时缺少 event 与 functionCall | ERROR_CODE_REQUIRED_MISS | Property action requires event or functionCall, field has been ignored | 忽略 |
| action.event 不是 object | ERROR_CODE_TYPE_MISMATCH | Property event expects object value, got type '<type>', field has been ignored | 忽略 |
| action.event.name 缺失 | ERROR_CODE_REQUIRED_MISS | Property name is required, field has been ignored | 忽略 |
| action.event.name 不是 string | ERROR_CODE_TYPE_MISMATCH | Property name expects string value, got type '<type>', field has been ignored | 忽略 |
| action.event.context 不是 object | ERROR_CODE_TYPE_MISMATCH | Property context expects object value, got type '<type>', fallback to empty object | fallback 到空 object |
| action.functionCall 不是 object | ERROR_CODE_TYPE_MISMATCH | Property functionCall expects object value, got type '<type>', field has been ignored | 忽略 |

> **关于通用样式**：上表描述的是 ArkTS 通用 Schema 校验器对组件字段的处理能力。运行时，styles 内的通用样式（width / height / margin / ... / clip 等）的异常值容错由**样式解析层**统一处理，并不逐字段经过本表所述校验。通用样式的实际非法值行为（重置为默认值、钳制、必填性等）以 [扩展组件总览 · 通用样式异常值与容错](./extended-components/overview.md#通用样式异常值与容错) 为准。

---

↑ [返回 Reference 总览](../README.md#reference-api-速查)
