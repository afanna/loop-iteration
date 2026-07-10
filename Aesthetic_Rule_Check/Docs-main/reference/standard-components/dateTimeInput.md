# DateTimeInput 组件

DateTimeInput 组件用于选择日期时间。

**起始版本：**  API Version 20


## 特有属性

除支持[通用属性](overview.md)，还支持以下特有属性：

| 属性 | 说明 |
|------|------|
| [checks](#checks) | 客户端验证规则数组 |
| [value](#value) | 当前选中的日期/时间值 |
| [enableDate](#enableDate) | 是否启用日期选择 |
| [enableTime](#enableTime) | 是否启用时间选择 |
| [min](#min) | 最小可选边界 |
| [max](#max) | 最大可选边界 |
| [label](#label) | 输入框占位提示文本 |

### checks

客户端验证规则数组。用户点击弹窗中的确认按钮时执行校验；任一规则校验失败时，组件会显示错误信息并保持弹窗打开。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| checks | [CheckRule[]](../types.md#checkrule) | 否 | 设置客户端验证规则数组。<br/>取值范围：支持["required"](../functions/validation.md#required)、["regex"](../functions/validation.md#regex)、["length"](../functions/validation.md#length)、["numeric"](../functions/validation.md#numeric)、["email"](../functions/validation.md#email) 验证规则，其他验证规则不生效。<br/>默认值：[]（不执行任何校验）。 |

可选验证规则类型具体说明如下：

| 名称 | 值 | 说明 |
|----|---------|------|
| "required" | - | 校验输入值是否为空。 |
| "regex" | - | 对输入值进行正则匹配校验。 |
| "length" | - | 对输入值进行长度检验。 |
| "numeric" | - | 对输入值进行数字类型检验。 |
| "email" | - | 对输入值进行邮箱地址格式检验。 |

**示例DSL：**

设置当前组件为必填项，用户确认选择时校验 value 是否已填写。

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "date_time_surface",
    "components": [
      {
        "component": "DateTimeInput",
        "id": "appointmentTime",
        "value": {
          "path": "/form/appointmentTime"
        },
        "enableDate": true,
        "enableTime": true,
        "checks": [
          {
            "condition": {
              "call": "required",
              "args": {
                "value": {
                  "path": "/form/appointmentTime"
                }
              },
              "returnType": "boolean"
            },
            "message": "请选择预约时间"
          }
        ]
      }
    ]
  }
}
```

---

### value

当前选中的日期/时间值。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | [DynamicString](../functions/functioncall.md#dynamicstring) | 是 | 当前选中的日期/时间值。支持字面量字符串、数据绑定或返回字符串的函数调用。<br/>取值范围：日期模式建议使用 YYYY-MM-DD，时间模式建议使用 HH:mm，日期时间模式建议使用 YYYY-MM-DD HH:mm。当前运行时解析时也兼容 YYYY-MM-DDTHH:mm，但确认后回写的日期时间格式统一为 YYYY-MM-DD HH:mm。时间部分始终以 24 小时制（00:00–23:59）表示，与运行时是否以 12 小时制展示无关。<br/>默认值：""（未选择任何日期或时间，输入框显示为空或展示 label 占位文案）。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "date_time_surface",
    "components": [
      {
        "component": "DateTimeInput",
        "id": "appointmentTime",
        "value": {
          "path": "/form/appointmentTime"
        },
        "enableDate": true,
        "enableTime": true
      }
    ]
  }
}
```

---

### enableDate

是否启用日期选择。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| enableDate | boolean | 否 | 是否启用日期选择。<br/>默认值：false（不显示日期选择器）。注意：当 enableDate 和 enableTime 均为 false 时，运行时会默认启用 enableDate，参见 [DFX 说明](#dfx-说明)。 |

**示例DSL：**

仅启用日期选择。

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "date_time_surface",
    "components": [
      {
        "component": "DateTimeInput",
        "id": "holidayInput",
        "value": "2026-05-01",
        "enableDate": true,
        "enableTime": false
      }
    ]
  }
}
```

---

### enableTime

是否启用时间选择。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| enableTime | boolean | 否 | 是否启用时间选择。<br/>默认值：false（不显示时间选择器）。注意：当 enableDate 和 enableTime 均为 false 时，运行时会默认启用 enableDate，参见 [DFX 说明](#dfx-说明)。 |

**示例DSL：**

仅启用时间选择。

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "date_time_surface",
    "components": [
      {
        "component": "DateTimeInput",
        "id": "reminderTime",
        "value": "09:30",
        "enableDate": false,
        "enableTime": true
      }
    ]
  }
}
```

---

### min

最小可选边界。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| min | [DynamicString](../functions/functioncall.md#dynamicstring) | 否 | 最小可选边界。Schema 定义为 [DynamicString](../functions/functioncall.md#dynamicstring)，当前运行时仅支持字符串字面量。<br/>取值范围：可使用 YYYY-MM-DD、HH:mm 或 YYYY-MM-DD HH:mm 格式；实际应与当前启用的选择模式保持一致。<br/>默认值：未设置或解析失败时，组件按 1970-01-01 起始边界处理。当 min 晚于 max 时，运行时会忽略两者并回退到默认边界。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "date_time_surface",
    "components": [
      {
        "component": "DateTimeInput",
        "id": "appointmentTime",
        "value": "2026-05-07 10:00",
        "enableDate": true,
        "enableTime": true,
        "min": "2026-05-01 09:00"
      }
    ]
  }
}
```

---

### max

最大可选边界。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| max | [DynamicString](../functions/functioncall.md#dynamicstring) | 否 | 最大可选边界。Schema 定义为 [DynamicString](../functions/functioncall.md#dynamicstring)，当前运行时仅支持字符串字面量。<br/>取值范围：可使用 YYYY-MM-DD、HH:mm 或 YYYY-MM-DD HH:mm 格式；实际应与当前启用的选择模式保持一致。<br/>默认值：未设置或解析失败时，组件按 2100-12-31 23:59 结束边界处理。当 min 晚于 max 时，运行时会忽略两者并回退到默认边界。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "date_time_surface",
    "components": [
      {
        "component": "DateTimeInput",
        "id": "appointmentTime",
        "value": "2026-05-07 10:00",
        "enableDate": true,
        "enableTime": true,
        "max": "2026-05-31 18:00"
      }
    ]
  }
}
```

---

### label

输入框占位提示文本。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| label | [DynamicString](../functions/functioncall.md#dynamicstring) | 否 | 输入框占位提示文本。仅在当前没有可显示的有效 value 时展示。该属性会覆盖组件内置的默认占位文案，不会额外渲染成输入框上方标题。<br/>默认值：""（使用组件内置的默认占位文案）。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "date_time_surface",
    "components": [
      {
        "component": "DateTimeInput",
        "id": "appointmentTime",
        "label": "请选择预约时间",
        "value": "",
        "enableDate": true,
        "enableTime": true
      }
    ]
  }
}
```

---

## DFX 说明

当宿主通过 [registerErrorCallback](../API/surface-controller.md#registererrorcallback) 注册错误回调时，DateTimeInput 的日期配置异常会通过 [onError](../API/surface-controller.md#errorcallback) 上报。

| 场景 | code值 | warning code | error message | 运行时处理 |
|------|--------|--------------|---------------|------------|
| value 不是 ISO 8601 格式 | 2001 | ERROR_CODE_INVALID_VALUE | Property value expects ISO 8601 compatible value, fallback to default value / Property value expects ISO 8601 compatible value, value has been normalized | 尝试解析 |
| min/max 格式不正确 | 2001 | ERROR_CODE_INVALID_VALUE | Property min expects ISO 8601 compatible value, field has been ignored / Property max expects ISO 8601 compatible value, field has been ignored | 丢弃相关内容 |
| min > max | 2001 | ERROR_CODE_INVALID_VALUE | Property min must not be later than max, min and max have been ignored | 丢弃相关内容 |
| enableDate 和 enableTime 都为 false | 2001 | ERROR_CODE_INVALID_VALUE | Properties enableDate and enableTime cannot both be false, DateTimeInput remains disabled | 默认启用 enableDate |

## 组件Schema

```json
{
  "type": "object",
  "allOf": [
    {
      "$ref": "../common_types.json#/$defs/ComponentCommon"
    },
    {
      "$ref": "../common_types.json#/$defs/CatalogComponentCommon"
    },
    {
      "$ref": "../common_types.json#/$defs/Checkable"
    },
    {
      "type": "object",
      "properties": {
        "component": {
          "const": "DateTimeInput"
        },
        "value": {
          "$ref": "../common_types.json#/$defs/DynamicString",
          "description": "The selected date and/or time value in ISO 8601 format. If not yet set, initialize with an empty string."
        },
        "enableDate": {
          "type": "boolean",
          "description": "If true, allows the user to select a date.",
          "default": false
        },
        "enableTime": {
          "type": "boolean",
          "description": "If true, allows the user to select a time.",
          "default": false
        },
        "min": {
          "allOf": [
            {
              "$ref": "../common_types.json#/$defs/DynamicString"
            },
            {
              "if": {
                "type": "string"
              },
              "then": {
                "oneOf": [
                  {
                    "format": "date"
                  },
                  {
                    "format": "time"
                  },
                  {
                    "format": "date-time"
                  }
                ]
              }
            }
          ],
          "description": "The minimum allowed date/time in ISO 8601 format."
        },
        "max": {
          "allOf": [
            {
              "$ref": "../common_types.json#/$defs/DynamicString"
            },
            {
              "if": {
                "type": "string"
              },
              "then": {
                "oneOf": [
                  {
                    "format": "date"
                  },
                  {
                    "format": "time"
                  },
                  {
                    "format": "date-time"
                  }
                ]
              }
            }
          ],
          "description": "The maximum allowed date/time in ISO 8601 format."
        },
        "label": {
          "$ref": "../common_types.json#/$defs/DynamicString",
          "description": "The text label for the input field."
        }
      },
      "required": [
        "component",
        "value"
      ]
    }
  ],
  "unevaluatedProperties": false
}
```

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
