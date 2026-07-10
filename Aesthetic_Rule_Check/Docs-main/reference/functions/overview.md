# 函数概览

GenUI 提供 18 个内置函数，覆盖数据验证、格式化、逻辑运算、组件值读取和系统操作。

## 为什么需要函数？

在 [A2UI 协议](../../introduction/a2ui-and-harmonyos.md#a2ui-是什么)中，LLM 生成的 DSL 是静态 JSON。为了让 UI 具备动态能力（如表单验证、数据格式化、条件显示、组件联动），协议提供了内置函数机制。函数通过 [FunctionCall](functioncall.md) 类型在 DSL 中声明式调用，运行时由客户端渲染引擎执行。

> **建议阅读顺序**：先阅读 [FunctionCall 类型说明](functioncall.md)，了解函数调用的通用结构、参数传递机制和路径绑定规则，再按需阅读各类函数的详细文档。各函数的详细参数、返回值和完整 DSL 示例见下方的分类文档。

## FunctionCall 类型

函数调用通过 FunctionCall 类型表达，它是 [A2UI 协议](../../introduction/a2ui-and-harmonyos.md#a2ui-是什么)中的核心类型之一。

```json
{
  "call": "函数名",
  "args": { "参数名": "参数值" },
  "returnType": "返回类型"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| call | string | 是 | 要调用的函数名称。 |
| args | object | 否 | 传递给函数的参数，每个参数值支持字面量、路径绑定（{ "path": "..." }）或嵌套函数调用。默认值：{}。 |
| returnType | string | 否 | 期望的返回类型。默认值："boolean"。枚举值："string"、"number"、"boolean"、["array"](functioncall.md#dynamicstringlist)、"object"、"any"、"void"。 |

FunctionCall 在 DSL 中有两种使用方式：

1. **作为 Action 触发**：通过 functionCall 字段在按钮等组件的 action 中使用，用于响应用户交互。
2. **作为 [DynamicValue](../types.md#dynamicvalue) 表达式**：直接作为属性值使用，在渲染时解析为具体值（如 [DynamicString](../types.md#dynamicstring)、[DynamicBoolean](../types.md#dynamicboolean) 等）。

详见 [FunctionCall 类型说明](functioncall.md)。

## 函数分类

### 验证函数（5 个）

| 函数 | 返回类型 | 说明 | 文档 |
|------|------|------|------|
| [required](validation.md#required) | boolean | 验证值是否非空 | [validation.md](validation.md) |
| [regex](validation.md#regex) | boolean | 使用正则表达式验证 | [validation.md](validation.md) |
| [length](validation.md#length) | boolean | 验证字符串长度范围 | [validation.md](validation.md) |
| [numeric](validation.md#numeric) | boolean | 验证数值范围 | [validation.md](validation.md) |
| [email](validation.md#email) | boolean | 验证邮箱格式 | [validation.md](validation.md) |

### 格式化函数（5 个）

| 函数 | 返回类型 | 说明 | 文档 |
|------|------|------|------|
| [formatString](format.md#formatstring) | string | 模板字符串格式化 | [format.md](format.md) |
| [formatNumber](format.md#formatnumber) | string | 数值格式化 | [format.md](format.md) |
| [formatCurrency](format.md#formatcurrency) | string | 货币格式化 | [format.md](format.md) |
| [formatDate](format.md#formatdate) | string | 日期格式化 | [format.md](format.md) |
| [pluralize](format.md#pluralize) | string | CLDR 复数形式选择 | [format.md](format.md) |

### 逻辑函数（3 个）

| 函数 | 返回类型 | 说明 | 文档 |
|------|------|------|------|
| [and](logic.md#and) | boolean | 逻辑与（所有值为 true） | [logic.md](logic.md) |
| [or](logic.md#or) | boolean | 逻辑或（任一值为 true） | [logic.md](logic.md) |
| [not](logic.md#not) | boolean | 逻辑非 | [logic.md](logic.md) |

### 组件值函数（4 个）

| 函数 | 返回类型 | 说明 | 文档 |
|------|------|------|------|
| [getToggleValue](component-value.md#gettogglevalue) | object | 获取 Toggle 组件状态 | [component-value.md](component-value.md) |
| [getRadioValue](component-value.md#getradiovalue) | string | 获取 Radio 组件选中值 | [component-value.md](component-value.md) |
| [getSelectValue](component-value.md#getselectvalue) | string | 获取 Select 组件当前选中值 | [component-value.md](component-value.md) |
| [getCheckboxGroupValues](component-value.md#getcheckboxgroupvalues) | string[] | 获取 CheckboxGroup 选中项的 value 文本数组 | [component-value.md](component-value.md) |

### 系统函数（1 个）

| 函数 | 返回类型 | 说明 | 文档 |
|------|------|------|------|
| [openUrl](system.md#openurl) | void | 打开 HTTPS 链接 | [system.md](system.md) |

## 在组件中使用函数

> 以下示例均为 **DSL 消息片段**，是 LLM 生成的模型产物，而非开发者手写的代码。开发者仅需了解这些结构以便设计 Prompt 和调试。

### 作为 Action 的本地函数调用

在 [Button](../standard-components/button.md) 等组件的 action 中通过 functionCall 触发：

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "action_surface",
    "components": [
      {
        "component": "Button",
        "id": "btn",
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

### 作为 [DynamicValue](../types.md#dynamicvalue) 表达式

直接作为属性值使用，渲染时解析为具体值：

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
          "args": { "value": { "path": "amount" }, "currency": "CNY" },
          "returnType": "string"
        }
      }
    ]
  }
}
```

### 作为 CheckRule 的验证条件

在输入组件的 [checks](../standard-components/textfield.md#checks) 中作为验证条件：

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "form_surface",
    "components": [
      {
        "component": "TextField",
        "id": "email",
        "checks": [
          {
            "condition": {
              "call": "required",
              "args": { "value": { "path": "email" } },
              "returnType": "boolean"
            },
            "message": "邮箱不能为空"
          }
        ]
      }
    ]
  }
}
```

## 本地函数

支持注册自定义函数，详见 [本地函数开发指南](local-functions.md)。

## 参考链接

- [FunctionCall 类型说明](functioncall.md)
- [验证函数](validation.md)
- [格式化函数](format.md)
- [逻辑函数](logic.md)
- [系统函数](system.md)
- [本地函数](local-functions.md)

---

↑ [返回文档导航](../../README.md)
