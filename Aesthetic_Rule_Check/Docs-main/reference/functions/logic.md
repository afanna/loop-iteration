# 逻辑函数

逻辑函数用于组合多个布尔值，返回 boolean。常用于组合多个验证条件。

> 以下示例均为 **DSL 消息片段**，是 LLM 生成的模型产物，而非开发者手写的代码。

## 函数列表

### and

逻辑与运算。当 values 数组中**所有元素**均为 true 时返回 true，只要有一个为 false 即返回 false。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| values | boolean[] | 是 | 布尔值数组，至少包含 2 个元素。数组中的每个元素支持字面量、路径绑定或嵌套函数调用。 |

**FunctionCall 片段：**

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
              "call": "and",
              "args": {
                "values": [
                  { "call": "required", "args": { "value": { "path": "email" } }, "returnType": "boolean" },
                  { "call": "email", "args": { "value": { "path": "email" } }, "returnType": "boolean" }
                ]
              },
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

---

### or

逻辑或运算。当 values 数组中**任一元素**为 true 时返回 true，所有元素均为 false 时才返回 false。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| values | boolean[] | 是 | 布尔值数组，至少包含 2 个元素。数组中的每个元素支持字面量、路径绑定或嵌套函数调用。 |

**FunctionCall 片段：**

```json
{
  "call": "or",
  "args": {
    "values": [
      { "path": "hasPhone" },
      { "path": "hasEmail" }
    ]
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
        "id": "contactField",
        "component": "TextField",
        "label": "联系方式",
        "checks": [
          {
            "condition": {
              "call": "or",
              "args": {
                "values": [
                  { "path": "form.hasPhone" },
                  { "path": "form.hasEmail" }
                ]
              },
              "returnType": "boolean"
            },
            "message": "请至少提供手机号或邮箱"
          }
        ]
      }
    ]
  }
}
```

---

### not

逻辑非运算，对布尔值取反。输入 true 返回 false，输入 false 返回 true。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | boolean | 是 | 待取反的布尔值。支持字面量、路径绑定或嵌套函数调用。 |

**FunctionCall 片段：**

```json
{
  "call": "not",
  "args": {
    "value": { "path": "isDisabled" }
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
        "id": "submitBtn",
        "component": "Button",
        "label": "提交",
        "enabled": {
          "call": "not",
          "args": { "value": { "path": "form.isSubmitting" } },
          "returnType": "boolean"
        }
      }
    ]
  }
}
```

## 组合使用示例

逻辑函数常与验证函数组合使用，构建复杂的条件判断：

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
              "call": "and",
              "args": {
                "values": [
                  {
                    "call": "required",
                    "args": { "value": { "path": "phone" } },
                    "returnType": "boolean"
                  },
                  {
                    "call": "not",
                    "args": { "value": { "path": "isBlocked" } },
                    "returnType": "boolean"
                  }
                ]
              },
              "returnType": "boolean"
            },
            "message": "请输入有效手机号且账号未被限制"
          }
        ]
      }
    ]
  }
}
```

## 参考链接

- [函数概览](overview.md)
- [验证函数](validation.md)
- [FunctionCall 类型说明](functioncall.md)

---

↑ [返回文档导航](../../README.md)
