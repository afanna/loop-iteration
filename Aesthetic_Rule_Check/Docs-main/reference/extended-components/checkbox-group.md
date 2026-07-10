# ExtendedCheckboxGroup 组件

ExtendedCheckboxGroup（协议名：CheckboxGroup）是复选框群组管理组件，用于统一管理一组具有相同 group 名称的 [Checkbox](checkbox.md)，支持全选/取消全选操作。

**起始版本：**  API Version 20

## 使用前提

该组件属于预置扩展组件，由底层扩展组件工厂自动注册，使用鸿蒙扩展协议时无需手动安装定义。

## 字段类型区分

除支持[通用属性](overview.md)，还支持以下字段：

| 字段名 | 字段类型 | 说明 |
|------|------|------|
| [group](#group) | 私有属性 | 群组名称，关联同名的 Checkbox |
| [selectAll](#selectall) | 私有属性 | 是否全选 |
| [selectedColor](#stylesselectedcolor) | 私有样式 | 选中状态填充颜色 |
| [unSelectedColor](#stylesunselectedcolor) | 私有样式 | 未选中状态描边颜色 |
| [mark](#stylesmark) | 私有样式 | 选中勾选样式 |
| [checkboxShape](#stylescheckboxshape) | 私有样式 | 复选框形状 |

## 属性字段

### group

设置群组名称，该名称需与关联的 [Checkbox](checkbox.md) 的 group 属性保持一致。CheckboxGroup 会自动管理所有同名 Checkbox 的全选状态。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| group | string | 否 | 群组名称，需与 Checkbox 的 group 属性一致。默认值：空字符串。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 ""；<br/>非法 object 取默认值 ""；<br/>属性归一化值非 string 类型，可兼容为 string 则取兼容结果，不可兼容则取默认值 ""。 |
| Schema 校验与DFX | 静态值类型非 string 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-checkbox-group-surface",
    "components": [
      {
        "id": "fruitGroup",
        "component": "CheckboxGroup",
        "group": "fruits"
      },
      {
        "id": "apple",
        "component": "Checkbox",
        "label": "苹果",
        "group": "fruits"
      },
      {
        "id": "banana",
        "component": "Checkbox",
        "label": "香蕉",
        "group": "fruits"
      }
    ]
  }
}
```

---

### selectAll

设置是否全选群组内所有复选框。若同组的 Checkbox 显式设置了 select 属性，则 Checkbox 的优先级高于 selectAll。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| selectAll | boolean | 否 | 控制是否全选。<br/>取值范围：true：全选；false：取消全选。<br/>默认值：false。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 false；<br/> 属性值超出枚举范围取默认值 false；<br/> 非法 object 取默认值 false；<br/>属性归一化值非 boolean 类型，可兼容为 boolean 则取兼容结果，不可兼容则取默认值 false。 |
| Schema 校验与DFX | 静态值类型非 boolean 输出 ERROR_CODE_TYPE_MISMATCH；<br/>静态值超出枚举范围输出 ERROR_CODE_INVALID_VALUE；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-checkbox-group-surface",
    "components": [
      {
        "id": "fruitGroup",
        "component": "CheckboxGroup",
        "group": "fruits",
        "selectAll": true
      },
      {
        "id": "apple",
        "component": "Checkbox",
        "label": "苹果",
        "group": "fruits"
      },
      {
        "id": "banana",
        "component": "Checkbox",
        "label": "香蕉",
        "group": "fruits"
      }
    ]
  }
}
```

---

## 私有样式字段（styles）

### styles.selectedColor

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.selectedColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 被选中或部分选中状态的填充颜色。16 进制字符串，支持 "#RRGGBB" 和 "#AARRGGBB" 格式。默认值：light #FF3F97E9，dark #FF007DFF。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取主题默认色；<br/> 属性值为非法 object 取主题默认色；<br/> 属性归一化值非 string 类型，可兼容为 string 则取兼容结果，不可兼容则取主题默认色。 |
| Schema 校验与DFX | 静态值类型非 string 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-checkbox-group-surface",
    "components": [
      {
        "id": "fruitGroup",
        "component": "CheckboxGroup",
        "group": "fruits",
        "styles": {
          "selectedColor": "#007DFF"
        }
      }
    ]
  }
}
```

---

### styles.unSelectedColor

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.unSelectedColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 未选中状态描边颜色。16 进制字符串，支持 "#RRGGBB" 和 "#AARRGGBB" 格式。默认值：light #66FFFFFF，dark #66182431。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取主题默认色；<br/> 属性值为非法 object 取主题默认色；<br/> 属性归一化值非 string 类型，可兼容为 string 则取兼容结果，不可兼容则取主题默认色。 |
| Schema 校验与DFX | 静态值类型非 string 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-checkbox-group-surface",
    "components": [
      {
        "id": "fruitGroup",
        "component": "CheckboxGroup",
        "group": "fruits",
        "styles": {
          "unSelectedColor": "#CCCCCC"
        }
      }
    ]
  }
}
```

---

### styles.mark

设置选中勾选图标样式，统一应用于群组内的所有复选框。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.mark | object | 否 | 勾选图标样式对象。 |

mark 对象属性：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| strokeColor | string | 否 | 勾选图标描边颜色。16 进制字符串，默认值：light #FFFFFFFF，dark #FFFFFFFF。 |
| size | number | 否 | 勾选图标大小，单位 vp。默认大小与多选框组件宽度相同。 |
| strokeWidth | number | 否 | 勾选图标描边宽度，单位 vp。默认值：2.0。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值；<br/> 属性值为非法 object 取默认值。 |
| Schema 校验与DFX | 属性值类型非 object 输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-checkbox-group-surface",
    "components": [
      {
        "id": "fruitGroup",
        "component": "CheckboxGroup",
        "group": "fruits",
        "styles": {
          "mark": {
            "strokeColor": "#FFFFFF",
            "strokeWidth": 2
          }
        }
      }
    ]
  }
}
```

---

### styles.checkboxShape

设置群组内复选框的形状，统一应用于所有关联的复选框。CheckboxGroup 内所有未单独设置 shape 的 Checkbox，其形状将与 CheckboxGroup 保持一致；已单独设置 shape 的 Checkbox，其形状优先于 CheckboxGroup 的设置。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.checkboxShape | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 复选框形状，默认值：circle。 |

可选枚举值：

| 值 | 说明 |
|------|------|
| circle | 圆形复选框 |
| rounded_square | 圆角方形复选框 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 circle；<br/> 属性值超出枚举范围取默认值 circle；<br/> 非法 object 取默认值 circle。 |
| Schema 校验与DFX | 静态值类型非 string 输出 ERROR_CODE_TYPE_MISMATCH；<br/>静态值超出枚举范围输出 ERROR_CODE_INVALID_VALUE；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-checkbox-group-surface",
    "components": [
      {
        "id": "fruitGroup",
        "component": "CheckboxGroup",
        "group": "fruits",
        "styles": {
          "checkboxShape": "rounded_square"
        }
      }
    ]
  }
}
```

---

## 运行时行为

- CheckboxGroup 通过 group 属性与一组 [Checkbox](checkbox.md) 联动，group 名称相同的 Checkbox 会自动归入该群组。
- 设置 selectAll 为 true 时，群组内所有 Checkbox 会被选中；设置为 false 时，所有 Checkbox 取消选中。
- CheckboxGroup 的全选状态有三种：
  - **全部已选**（0）：群组内所有 Checkbox 均已选中。
  - **部分选中**（1）：群组内部分 Checkbox 已选中。
  - **全部未选**（2）：群组内所有 Checkbox 均未选中。
- 群组状态变化时触发 onChange 事件。
- 可通过内置函数 [getCheckboxGroupValues](../functions/component-value.md#getcheckboxgroupvalues) 获取群组中所有选中 Checkbox 的 value 文本数组。

## 示例

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-checkbox-group-surface",
    "components": [
      {
        "id": "selectAllGroup",
        "component": "CheckboxGroup",
        "group": "hobby",
        "selectAll": false,
        "styles": {
          "checkboxShape": "rounded_square",
          "selectedColor": "#007DFF",
          "unSelectedColor": "#CCCCCC",
          "mark": {
            "strokeColor": "#FFFFFF",
            "strokeWidth": 2
          }
        }
      },
      {
        "id": "reading",
        "component": "Checkbox",
        "label": "阅读",
        "select": false,
        "group": "hobby"
      },
      {
        "id": "music",
        "component": "Checkbox",
        "label": "音乐",
        "select": true,
        "group": "hobby"
      },
      {
        "id": "sports",
        "component": "Checkbox",
        "label": "运动",
        "select": false,
        "group": "hobby"
      }
    ]
  }
}
```

## 事件

### onChange

| 事件 | 适用组件 | 触发时机 | 回调数据 |
|------|------|------|------|
| onChange | CheckboxGroup | 群组内任一复选框选中状态改变时触发 | { value: string[], status: string }，value 为所有选中的勾选框名称数组；status 为全选状态："All" 全选、"Part" 部分选中、"None" 全不选。 |

## 私有函数

### getCheckboxGroupValues

获取指定群组中所有选中 [ExtendedCheckbox](checkbox.md) 的 **value 文本值数组**。返回类型：string[]。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| group | string | 是 | Checkbox 群组名称，与 Checkbox 的 group 属性一致。 |

函数遍历当前 Surface 上所有组件，匹配 group 相同且 select 为 true 的 Checkbox，收集其 value 文本。

说明：
- 当group中无选中项时，返回空数组 []。
- 当group不存在时，返回空数组 []。
- 当未传入group值时，该functionCall失效。

#### 示例

此示例中点击Button后可获取：["banana", "orange"]。

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "preference_surface",
    "components": [
      {
        "id": "fruitGroup",
        "component": "CheckboxGroup",
        "group": "fruits",
        "selectAll": false
      },
      {
        "id": "apple",
        "component": "Checkbox",
        "label": "苹果",
        "select": false,
        "value": "apple",
        "group": "fruits"
      },
      {
        "id": "banana",
        "component": "Checkbox",
        "label": "香蕉",
        "select": true,
        "value": "banana",
        "group": "fruits"
      },
      {
        "id": "orange",
        "component": "Checkbox",
        "label": "橙子",
        "select": true,
        "value": "orange",
        "group": "fruits"
      },
      {
        "id": "myButton",
        "component": "Button",
        "label": "click to get",
        "action": {
          "functionCall": {
            "call": "getCheckboxGroupValues",
            "args": {
              "group": "fruits"
            },
            "returnType": "array"
          }
        }
      }
    ]
  }
}
```

#### 函数Schema

```json
{
  "type": "object",
  "description": "Returns the value texts of all selected Checkbox components in the target group. If the group has no selected item or the group does not exist, returns an empty array ([]). If args.group is omitted, the functionCall is invalid.",
  "properties": {
    "call": {
      "const": "getCheckboxGroupValues"
    },
    "args": {
      "type": "object",
      "properties": {
        "group": {
          "$ref": "../common_types.json#/$defs/DynamicString",
          "description": "The target CheckboxGroup group name."
        }
      },
      "required": [
        "group"
      ],
      "additionalProperties": false
    },
    "returnType": {
      "const": "array"
    }
  },
  "required": [
    "call",
    "args"
  ],
  "unevaluatedProperties": false
}
```

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
      "type": "object",
      "properties": {
        "component": {
          "const": "CheckboxGroup"
        },
        "group": {
          "type": "string",
          "description": "The group name that links checkboxes together.",
          "default": ""
        },
        "selectAll": {
          "type": "boolean",
          "description": "Whether to select all checkboxes in the group. If a Checkbox in the same group explicitly sets select, that Checkbox select value takes precedence over selectAll.",
          "default": false
        },
        "selectedColor": {
          "type": "string",
          "description": "The fill color when selected. Hex color string. Supports #RRGGBB and #AARRGGBB. Default follows the theme activated text color.",
          "default": "#007DFF"
        },
        "unSelectedColor": {
          "type": "string",
          "description": "The border/outline color when not selected. Hex color string. Supports #RRGGBB and #AARRGGBB. Default follows the theme switch-off outline color.",
          "default": "#182431"
        },
        "mark": {
          "type": "object",
          "description": "The mark style of the checkmark.",
          "properties": {
            "strokeColor": {
              "type": "string",
              "description": "The stroke color of the checkmark.",
              "default": "#FFFFFF"
            },
            "size": {
              "type": "number",
              "description": "Internal checkmark size in vp. Default size is the same as the checkbox width."
            },
            "strokeWidth": {
              "type": "number",
              "description": "The stroke width of the checkmark in vp.",
              "default": 2.0
            }
          }
        },
        "checkboxShape": {
          "type": "string",
          "description": "Shape of CheckboxGroup and checkboxes in the group. Checkboxes in the group that do not explicitly set shape inherit checkboxShape. Checkboxes that explicitly set shape use their own shape with higher priority.",
          "enum": ["circle", "rounded_square"],
          "default": "circle"
        }
      },
      "required": [
        "component"
      ]
    }
  ],
  "additionalProperties": true
}
```

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
