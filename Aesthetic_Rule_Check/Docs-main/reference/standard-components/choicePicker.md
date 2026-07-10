# ChoicePicker 组件

ChoicePicker 组件用于给用户固定选择列表。

**起始版本：**  API Version 20


## 特有属性

除支持[通用属性](overview.md)，还支持以下特有属性：

| 属性 | 说明 |
|------|------|
| [checks](#checks) | 客户端验证规则数组 |
| [label](#label) | 选项组标题 |
| [options](#options) | 可选项列表 |
| [value](#value) | 当前选中值列表 |
| [variant](#variant) | 选择模式 |
| [displayStyle](#displayStyle) | 展示样式 |
| [filterable](#filterable) | 是否显示搜索框 |

### checks

客户端验证规则数组。用户每次变更选中项后都会执行校验；校验失败时会在组件下方显示错误信息，但不会阻止用户继续选择，也不会自动回滚当前选中状态。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| checks | [CheckRule[]](../types.md#checkrule) | 否 | 设置客户端验证规则数组。<br/>取值范围：支持["required"](../functions/validation.md#required)、["regex"](../functions/validation.md#regex)、["length"](../functions/validation.md#length)、["numeric"](../functions/validation.md#numeric)、["email"](../functions/validation.md#email) 验证规则，其他验证规则不生效。<br/>默认值：[]。 |

可选验证规则类型具体说明如下：

| 取值 | 说明 |
|------|------|
| "required" | 校验输入值是否为空。 |
| "regex" | 对输入值进行正则匹配校验。 |
| "length" | 对输入值进行长度检验。 |
| "numeric" | 对输入值进行数字类型检验。 |
| "email" | 对输入值进行邮箱地址格式检验。 |

**示例DSL：**

限制当前组件最多选择 2 项。

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "choice_picker_surface",
    "components": [
      {
        "component": "ChoicePicker",
        "id": "colorPicker",
        "options": [
          {
            "label": "红色",
            "value": "red"
          },
          {
            "label": "蓝色",
            "value": "blue"
          },
          {
            "label": "绿色",
            "value": "green"
          }
        ],
        "value": {
          "path": "/form/colors"
        },
        "checks": [
          {
            "condition": {
              "call": "length",
              "args": {
                "value": {
                  "path": "/form/colors"
                },
                "max": 2
              },
              "returnType": "boolean"
            },
            "message": "最多只能选择 2 项"
          }
        ]
      }
    ]
  }
}
```

---

### label

选项组标题。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| label | [DynamicString](../functions/functioncall.md#dynamicstring) | 否 | 选项组标题。支持字面量字符串、数据绑定或返回字符串的函数调用。设置后会显示在选项列表上方。<br/>取值范围：支持任意字符串。<br/>默认值：""。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "choice_picker_surface",
    "components": [
      {
        "component": "ChoicePicker",
        "id": "colorPicker",
        "label": "颜色标签单选",
        "options": [
          {
            "label": "红色",
            "value": "red"
          },
          {
            "label": "蓝色",
            "value": "blue"
          }
        ],
        "value": [
          "blue"
        ]
      }
    ]
  }
}
```

---

### options

可选项列表。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| options | [array](../functions/functioncall.md#returntype-枚举值) | 是 | 可选项列表。每一项都包含 label 和 value 两个字段。label 支持 [DynamicString](../functions/functioncall.md#dynamicstring)，value 为稳定字符串值。<br/>默认值：无（必填项）。 |

选项项结构说明如下：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| label | [DynamicString](../functions/functioncall.md#dynamicstring) | 是 | 选项展示文案。 |
| value | string | 是 | 选项稳定值。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "choice_picker_surface",
    "components": [
      {
        "component": "ChoicePicker",
        "id": "colorPicker",
        "options": [
          {
            "label": "红色",
            "value": "red"
          },
          {
            "label": "蓝色",
            "value": "blue"
          },
          {
            "label": {
              "path": "/dictionary/colors/greenLabel"
            },
            "value": "green"
          }
        ],
        "value": [
          "blue"
        ]
      }
    ]
  }
}
```

---

### value

当前选中值列表。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | [DynamicStringList](../functions/functioncall.md#dynamicstringlist) | 是 | 当前选中值列表。建议绑定到字符串数组数据模型。运行时会在用户选择变化后同步选中值回写到绑定数据。为兼容历史写法，当前实现也能处理部分单字符串输入，但新增场景建议统一使用字符串数组。<br/>默认值：[]。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "choice_picker_surface",
    "components": [
      {
        "component": "ChoicePicker",
        "id": "colorPicker",
        "options": [
          {
            "label": "红色",
            "value": "red"
          },
          {
            "label": "蓝色",
            "value": "blue"
          },
          {
            "label": "绿色",
            "value": "green"
          }
        ],
        "value": {
          "path": "/form/colors"
        }
      }
    ]
  }
}
```

---

### variant

选择模式。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| variant | string | 否 | 选择模式。<br/>取值范围：支持 "multipleSelection"、"mutuallyExclusive"。<br/>默认值："mutuallyExclusive"。未设置或传入非法值时按 "mutuallyExclusive" 处理。为避免歧义，建议始终显式传值。 |

可选字符串枚举值的具体说明如下：

| 取值 | 说明 |
|------|------|
| "multipleSelection" | 允许同时选中多个选项。用户可逐个点击选项来添加或取消选中，选中值以数组形式回写到数据模型。 |
| "mutuallyExclusive" | 同一时刻最多选中一个选项。选中新选项时自动取消之前的选择；点击已选中项可取消选中，此时无任何选中项。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "choice_picker_surface",
    "components": [
      {
        "component": "ChoicePicker",
        "id": "colorPicker",
        "variant": "mutuallyExclusive",
        "options": [
          {
            "label": "红色",
            "value": "red"
          },
          {
            "label": "蓝色",
            "value": "blue"
          },
          {
            "label": "绿色",
            "value": "green"
          }
        ],
        "value": [
          "blue"
        ]
      }
    ]
  }
}
```

---

### displayStyle

展示样式。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| displayStyle | string | 否 | 展示样式。<br/>取值范围：支持 "checkbox"、"chips"。<br/>默认值："checkbox"。 |

可选字符串枚举值的具体说明如下：

| 取值 | 说明 |
|------|------|
| "checkbox" | 复选框样式。 |
| "chips" | 标签块样式。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "choice_picker_surface",
    "components": [
      {
        "component": "ChoicePicker",
        "id": "colorPicker",
        "displayStyle": "chips",
        "options": [
          {
            "label": "红色",
            "value": "red"
          },
          {
            "label": "蓝色",
            "value": "blue"
          },
          {
            "label": "绿色",
            "value": "green"
          }
        ],
        "value": [
          "blue"
        ]
      }
    ]
  }
}
```

---

### filterable

是否显示搜索框。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| filterable | boolean | 否 | 是否显示搜索框。开启后组件会按选项的 label 和 value 做不区分大小写的过滤匹配。<br/>默认值：false。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "choice_picker_surface",
    "components": [
      {
        "component": "ChoicePicker",
        "id": "colorPicker",
        "filterable": true,
        "options": [
          {
            "label": "红色",
            "value": "red"
          },
          {
            "label": "蓝色",
            "value": "blue"
          },
          {
            "label": "绿色",
            "value": "green"
          }
        ],
        "value": [
          "blue"
        ]
      }
    ]
  }
}
```

---

## DFX 说明

当宿主通过 [registerErrorCallback](../API/surface-controller.md#registererrorcallback) 注册错误回调时，ChoicePicker 的选项配置异常会通过 [onError](../API/surface-controller.md#errorcallback) 上报。

| 场景 | code值 | warning code | error message | 运行时处理 |
|------|--------|--------------|---------------|------------|
| options 数组为空 | 2001 | ERROR_CODE_INVALID_VALUE | Property options expects a non-empty array, drop current component | 丢弃该 ChoicePicker 组件 |
| option 缺少 label | 2001 | ERROR_CODE_INVALID_VALUE | Property option.label is required, option has been dropped | 丢弃该 option |
| option 缺少 value | 2001 | ERROR_CODE_INVALID_VALUE | Property option.value is required, option has been dropped | 丢弃该 option |
| 多选时 value 不是数组 | 2001 | ERROR_CODE_INVALID_VALUE | Property value expects array type when variant is multipleSelection, value has been wrapped as single-element array | 将 value 转换为单元素数组 [value] |
| 单选时 value 是数组 | 2001 | ERROR_CODE_INVALID_VALUE | Property value expects string type when variant is mutuallyExclusive, first element of array has been used as value | 取数组第一个元素作为 value |

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
      "description": "A component that allows selecting one or more options from a list.",
      "properties": {
        "component": {
          "const": "ChoicePicker"
        },
        "label": {
          "$ref": "../common_types.json#/$defs/DynamicString",
          "description": "The label for the group of options."
        },
        "variant": {
          "type": "string",
          "description": "A hint for how the choice picker should be displayed and behave.",
          "enum": [
            "multipleSelection",
            "mutuallyExclusive"
          ],
          "default": "mutuallyExclusive"
        },
        "options": {
          "type": "array",
          "description": "The list of available options to choose from.",
          "items": {
            "type": "object",
            "properties": {
              "label": {
                "description": "The text to display for this option.",
                "$ref": "../common_types.json#/$defs/DynamicString"
              },
              "value": {
                "type": "string",
                "description": "The stable value associated with this option."
              }
            },
            "required": [
              "label",
              "value"
            ],
            "additionalProperties": false
          }
        },
        "value": {
          "$ref": "../common_types.json#/$defs/DynamicStringList",
          "description": "The list of currently selected values. This should be bound to a string array in the data model."
        },
        "displayStyle": {
          "type": "string",
          "description": "The display style of the component.",
          "enum": [
            "checkbox",
            "chips"
          ],
          "default": "checkbox"
        },
        "filterable": {
          "type": "boolean",
          "description": "If true, displays a search input to filter the options.",
          "default": false
        }
      },
      "required": [
        "component",
        "options",
        "value"
      ]
    }
  ],
  "unevaluatedProperties": false
}
```

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
