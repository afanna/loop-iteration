# 验证函数

验证函数用于对数据进行校验，返回 boolean 表示是否通过。常用于输入组件的 [checks](../standard-components/textfield.md#checks) 验证规则中。

> 以下示例均为 **DSL 消息片段**，是 LLM 生成的模型产物，而非开发者手写的代码。

## 函数列表

### required

验证值是否非空。当值为 null、空字符串、空数组或空对象时返回 false，否则返回 true。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | any | 是 | 待验证的值。支持字面量或路径绑定（{ "path": "..." }，路径指向当前 Surface 的数据模型）。 |

**FunctionCall 片段：**

```json
{
  "call": "required",
  "args": { "value": { "path": "username" } },
  "returnType": "boolean"
}
```

**DSL 示例：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "form_surface",
    "components": [
      {
        "id": "usernameField",
        "component": "TextField",
        "label": "用户名",
        "checks": [
          {
            "condition": {
              "call": "required",
              "args": { "value": { "path": "username" } },
              "returnType": "boolean"
            },
            "message": "用户名不能为空"
          }
        ]
      }
    ]
  }
}
```

---

### regex

使用正则表达式验证字符串是否完全匹配。

> **正则表达式（Regular Expression）** 是一种描述字符串匹配模式的形式化语言，广泛用于文本搜索和验证。例如 ^1[3-9]\d{9}$ 匹配中国大陆手机号，^\d{6}$ 匹配 6 位数字验证码。更多介绍可参考 [MDN 正则表达式指南](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions)。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | string | 是 | 待验证的字符串。支持路径绑定。 |
| pattern | string | 是 | 正则表达式模式，使用完整匹配（std::regex_match）。 |

**FunctionCall 片段：**

```json
{
  "call": "regex",
  "args": {
    "value": { "path": "phone" },
    "pattern": "^1[3-9]\\d{9}$"
  },
  "returnType": "boolean"
}
```

**DSL 示例：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "form_surface",
    "components": [
      {
        "id": "phoneField",
        "component": "TextField",
        "label": "手机号",
        "checks": [
          {
            "condition": {
              "call": "regex",
              "args": { "value": { "path": "phone" }, "pattern": "^1[3-9]\\d{9}$" },
              "returnType": "boolean"
            },
            "message": "请输入有效的手机号"
          }
        ]
      }
    ]
  }
}
```

---

### length

验证字符串长度是否在指定范围内。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | string | 是 | 待验证的字符串。支持路径绑定。 |
| min | number | 否 | 最小长度（含）。默认值：无（不限制下界）。 |
| max | number | 否 | 最大长度（含）。默认值：无（不限制上界）。 |

说明：min 和 max 至少需要提供一个。仅提供 min 时验证下界，仅提供 max 时验证上界，同时提供时验证范围。如果两者均未提供，函数返回 false（验证不通过）。

**FunctionCall 片段：**

```json
{
  "call": "length",
  "args": {
    "value": { "path": "password" },
    "min": 6,
    "max": 20
  },
  "returnType": "boolean"
}
```

**DSL 示例：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "form_surface",
    "components": [
      {
        "id": "passwordField",
        "component": "TextField",
        "label": "密码",
        "checks": [
          {
            "condition": {
              "call": "length",
              "args": { "value": { "path": "password" }, "min": 6, "max": 20 },
              "returnType": "boolean"
            },
            "message": "密码长度应为 6-20 位"
          }
        ]
      }
    ]
  }
}
```

---

### numeric

验证数值是否在指定范围内。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | number | 是 | 待验证的数值。支持路径绑定。 |
| min | number | 否 | 最小值（含）。默认值：无（不限制下界）。 |
| max | number | 否 | 最大值（含）。默认值：无（不限制上界）。 |

说明：min 和 max 至少需要提供一个。仅提供 min 时验证下界，仅提供 max 时验证上界，同时提供时验证范围。如果未提供任何范围参数，函数返回 false。

**FunctionCall 片段：**

```json
{
  "call": "numeric",
  "args": {
    "value": { "path": "age" },
    "min": 0,
    "max": 150
  },
  "returnType": "boolean"
}
```

**DSL 示例：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "form_surface",
    "components": [
      {
        "id": "ageField",
        "component": "TextField",
        "label": "年龄",
        "checks": [
          {
            "condition": {
              "call": "numeric",
              "args": { "value": { "path": "age" }, "min": 0, "max": 150 },
              "returnType": "boolean"
            },
            "message": "请输入有效的年龄（0-150）"
          }
        ]
      }
    ]
  }
}
```

---

### email

验证字符串是否符合邮箱地址格式。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | string | 是 | 待验证的邮箱地址。支持路径绑定。 |

说明：使用 RFC 5322 兼容的正则表达式进行匹配。**RFC 5322** 是互联网标准中定义电子邮件地址格式的规范（[RFC 5322](https://www.rfc-editor.org/rfc/rfc5322)），规定了 local-part@domain 结构及合法字符集。

**FunctionCall 片段：**

```json
{
  "call": "email",
  "args": { "value": { "path": "email" } },
  "returnType": "boolean"
}
```

**DSL 示例：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "form_surface",
    "components": [
      {
        "id": "emailField",
        "component": "TextField",
        "label": "邮箱",
        "checks": [
          {
            "condition": {
              "call": "email",
              "args": { "value": { "path": "email" } },
              "returnType": "boolean"
            },
            "message": "请输入有效的邮箱地址"
          }
        ]
      }
    ]
  }
}
```

## 在组件中使用

验证函数通常在 checks 数组中作为 [CheckRule](../types.md#checkrule) 的 condition 使用。以下示例组合了多个验证规则：

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "form_surface",
    "components": [
      {
        "id": "emailField",
        "component": "TextField",
        "label": "邮箱",
        "value": "",
        "checks": [
          {
            "condition": {
              "call": "required",
              "args": { "value": { "path": "email" } },
              "returnType": "boolean"
            },
            "message": "邮箱不能为空"
          },
          {
            "condition": {
              "call": "email",
              "args": { "value": { "path": "email" } },
              "returnType": "boolean"
            },
            "message": "请输入有效的邮箱地址"
          }
        ]
      }
    ]
  }
}
```

## 注意事项

- condition 字段类型为 [DynamicBoolean](../types.md#dynamicboolean)，因此函数的 returnType 应为 "boolean"。
- message 会在验证失败时显示给用户，请提供清晰的错误提示。
- 可以组合多个 [CheckRule](../types.md#checkrule)，按数组顺序依次执行。
- numeric 函数要求 value 必须是 number 类型，非数字值会直接返回 false。

## 参考链接

- [函数概览](overview.md)
- [格式化函数](format.md)
- [逻辑函数](logic.md)
- [FunctionCall 类型说明](functioncall.md)

---

↑ [返回文档导航](../../README.md)
