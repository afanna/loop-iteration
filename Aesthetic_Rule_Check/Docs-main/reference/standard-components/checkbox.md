# CheckBox 组件

CheckBox 为选择框组件，通常用于某选项的打开或关闭。

**起始版本：**  API Version 20

## 特有属性

除支持[通用属性](overview.md)，还支持以下特有属性：

| 特有属性 | 说明 |
|------|------|
| [checks](#checks) | 客户端验证规则数组 |
| [label](#label) | 选择框名称 |
| [value](#value) | 选中状态 |

### checks

客户端验证规则数组，数组中任一校验项不通过时无法更改选中状态。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| checks | [CheckRule[]](../types.md#checkrule) | 否 | 设置客户端验证规则数组。 <br/> 取值范围：支持["required"](../functions/validation.md###required)、["regex"](../functions/validation.md###regex)、["length"](../functions/validation.md###length)、["numeric"](../functions/validation.md###numeric)、["email"](../functions/validation.md###email) 验证规则，其他验证规则不生效。<br> 默认值：[]。  |

可选验证规则类型具体说明如下：

| 名称 | 值 | 说明 |
|----|---------|------|
| "required" | - | 校验输入值是否为空。 |
| "regex" | - | 对输入值进行正则匹配校验。 |
| "length" | - | 对输入值进行长度检验。 |
| "numeric" | - | 对输入值进行数字类型检验。 |
| "email" | - | 对输入值进行邮箱地址格式检验。 |

**示例DSL：**

```json
{
    "version": "v0.9",
    "updateComponents": {
        "surfaceId": "checkBox_surface",
        "components": [
            {
                "id": "demoCheckbox",
                "component": "CheckBox",
                "label": "选择",
                "value": true,
                "checks": [
                    {
                        "condition": {
                            "call": "required",
                            "args": {
                                "value": "CHECKS 内容"
                            },
                            "returnType": "boolean"
                        },
                        "message": "标签不能为空"
                    }
                ]
            }
        ]
    }
}
```

---

### label

设置选择框名称。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| label | DynamicString | 是 | 选择框名称。 <br/> 取值范围：支持任意字符串。<br> 默认值：""。 |

**示例DSL：**

```json
{
    "version": "v0.9",
    "updateComponents": {
        "surfaceId": "checkBox_surface",
        "components": [
            {
                "id": "demoCheckbox",
                "component": "CheckBox",
                "label": "选择框名称",
                "value": true
            }
        ]
    }
}
```

---

### value

设置多选框选中状态。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| value | DynamicBoolean | 是 | 选择框选中状态。 <br/> 取值范围："true"代表被选中，"false"代表未选中。<br> 默认值："false"。 |

**示例DSL：**

```json
{
    "version": "v0.9",
    "updateComponents": {
        "surfaceId": "checkBox_surface",
        "components": [
            {
                "id": "demoCheckbox",
                "component": "CheckBox",
                "label": "选择框名称",
                "value": true
            }
        ]
    }
}
```

---

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
          "const": "CheckBox"
        },
        "label": {
          "$ref": "../common_types.json#/$defs/DynamicString",
          "description": "The text to display next to the checkbox."
        },
        "value": {
          "$ref": "../common_types.json#/$defs/DynamicBoolean",
          "description": "The current state of the checkbox (true for checked, false for unchecked)."
        }
      },
      "required": [
        "component",
        "label",
        "value"
      ]
    }
  ],
  "unevaluatedProperties": false
}
```

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
