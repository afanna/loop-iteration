# ExtendedCheckbox 组件

ExtendedCheckbox（协议名：Checkbox）是复选框组件，用于表示单个选项的选中或取消状态，支持标签文本、自定义样式和分组联动。

**起始版本：**  API Version 20

## 使用前提

该组件属于预置扩展组件，由底层扩展组件工厂自动注册，使用鸿蒙扩展协议时无需手动安装定义。

## 字段类型区分

除支持[通用属性](overview.md)，还支持以下字段：

| 字段名 | 字段类型 | 说明 |
|------|------|------|
| [label](#label) | 私有属性 | 复选框旁的显示文本 |
| [select](#select) | 私有属性 | 复选框的选中状态 |
| [value](#value) | 私有属性 | 非渲染的文本内容，仅用于 getCheckBoxGroupValues 获取 |
| [group](#group) | 私有属性 | 所属群组名称，用于与 CheckboxGroup 联动 |
| [selectedColor](#stylesselectedcolor) | 私有样式 | 选中状态填充颜色 |
| [unselectedColor](#stylesunselectedcolor) | 私有样式 | 未选中状态描边颜色 |
| [mark](#stylesmark) | 私有样式 | 选中勾选样式 |
| [shape](#stylesshape) | 私有样式 | 复选框形状 |

## 属性字段

### label

设置复选框旁的显示文本。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| label | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 复选框旁的显示文本。默认值：空字符串。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 ""；<br/> 非法 object 取默认值 ""；<br/> 属性归一化值非 string 类型，可兼容为 string 则取兼容结果，不可兼容则取默认值 "" 。 |
| Schema 校验与DFX | 静态值类型非 string 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-checkbox-surface",
    "components": [
      {
        "id": "myCheckbox",
        "component": "Checkbox",
        "label": "同意用户协议"
      }
    ]
  }
}
```

---

### select

设置复选框的选中状态。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| select | [ExtendedDynamicBoolean](../types.md#extendeddynamicboolean) | 否 | true：选中；false：未选中。默认值：false。 |

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
    "surfaceId": "extended-checkbox-surface",
    "components": [
      {
        "id": "myCheckbox",
        "component": "Checkbox",
        "label": "同意用户协议",
        "select": true
      }
    ]
  }
}
```

---

### value

非渲染的文本内容，仅用于 getCheckBoxGroupValues 获取。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 非渲染的文本内容，仅用于 getCheckboxGroupValues 获取。默认值：空字符串。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 ""；<br/> 非法 object 取默认值 ""；<br/> 属性归一化值非 string 类型，可兼容为 string 则取兼容结果，不可兼容则取默认值 "" 。 |
| Schema 校验与DFX | 静态值类型非 string 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-checkbox-surface",
    "components": [
      {
        "id": "myCheckbox",
        "component": "Checkbox",
        "label": "同意用户协议",
        "value": "agreed"
      }
    ]
  }
}
```

---

### group

设置复选框所属的群组名称，用于与 [CheckboxGroup](checkbox-group.md) 联动。相同 group 名称的 Checkbox 可由同一个 CheckboxGroup 统一管理。未配合使用 CheckboxGroup 组件时，此值无用。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| group | string | 否 | 群组名称。默认值：空字符串。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 ""；<br/> 非法 object 取默认值 ""；<br/> 属性归一化值非 string 类型，可兼容为 string 则取兼容结果，不可兼容则取默认值 "" 。 |
| Schema 校验与DFX | 静态值类型非 string 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-checkbox-surface",
    "components": [
      {
        "id": "apple",
        "component": "Checkbox",
        "label": "苹果",
        "select": false,
        "group": "fruits"
      },
      {
        "id": "banana",
        "component": "Checkbox",
        "label": "香蕉",
        "select": true,
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
| styles.selectedColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 选中状态填充颜色。16 进制字符串，支持 "#RRGGBB" 和 "#AARRGGBB" 格式。默认值：light #FF0A59F7，dark #FF317AF7。 |

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
    "surfaceId": "extended-checkbox-surface",
    "components": [
      {
        "id": "myCheckbox",
        "component": "Checkbox",
        "label": "同意",
        "styles": {
          "selectedColor": "#007DFF"
        }
      }
    ]
  }
}
```

---

### styles.unselectedColor

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.unselectedColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 未选中状态描边颜色。16 进制字符串，支持 "#RRGGBB" 和 "#AARRGGBB" 格式。默认值：light #33FFFFFF，dark #33FFFFFF。 |

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
    "surfaceId": "extended-checkbox-surface",
    "components": [
      {
        "id": "myCheckbox",
        "component": "Checkbox",
        "label": "同意",
        "styles": {
          "unselectedColor": "#CCCCCC"
        }
      }
    ]
  }
}
```

---

### styles.mark

设置选中勾选图标样式。

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
    "surfaceId": "extended-checkbox-surface",
    "components": [
      {
        "id": "myCheckbox",
        "component": "Checkbox",
        "label": "同意",
        "styles": {
          "mark": {
            "strokeColor": "#FFFFFF",
            "size": 12,
            "strokeWidth": 2
          }
        }
      }
    ]
  }
}
```

---

### styles.shape

设置复选框的形状。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.shape | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 复选框形状，默认值：circle。 |

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
    "surfaceId": "extended-checkbox-surface",
    "components": [
      {
        "id": "myCheckbox",
        "component": "Checkbox",
        "label": "同意",
        "styles": {
          "shape": "rounded_square"
        }
      }
    ]
  }
}
```

---

## 运行时行为

- 用户点击复选框时，value 状态会自动切换。
- 当设置了 group 属性时，该复选框可与同组的 [CheckboxGroup](checkbox-group.md) 联动，由 CheckboxGroup 统一管理全选/取消全选状态。
- 复选框状态切换时会触发 onChange 事件。
- value 属性支持数据绑定，可通过路径绑定同步数据模型。

## 示例

### 基础用法

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-checkbox-surface",
    "components": [
      {
        "id": "agreeCheckbox",
        "component": "Checkbox",
        "label": "同意用户协议",
        "select": false,
        "styles": {
          "shape": "rounded_square",
          "selectedColor": "#007DFF",
          "unselectedColor": "#CCCCCC",
          "mark": {
            "strokeColor": "#FFFFFF",
            "size": 12,
            "strokeWidth": 2
          }
        }
      }
    ]
  }
}
```

### 与 CheckboxGroup 联动

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-checkbox-surface",
    "components": [
      {
        "id": "checkgroup",
        "component": "CheckboxGroup",
        "group": "fruits",
        "selectAll": false
      },
      {
        "id": "apple",
        "component": "Checkbox",
        "label": "苹果",
        "select": false,
        "group": "fruits"
      },
      {
        "id": "banana",
        "component": "Checkbox",
        "label": "香蕉",
        "select": true,
        "group": "fruits"
      },
      {
        "id": "orange",
        "component": "Checkbox",
        "label": "橙子",
        "select": false,
        "group": "fruits"
      }
    ]
  }
}
```

## 事件

### onChange

| 事件 | 适用组件 | 触发时机 | 回调数据 |
|------|------|------|------|
| onChange | Checkbox | 复选框选中状态改变时触发 | { value: boolean }，value 为当前勾选状态。 |

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
          "const": "Checkbox"
        },
        "label": {
          "type": "string",
          "description": "The text to display next to the checkbox. Type: string. Default is an empty string."
        },
        "select": {
          "type": "boolean",
          "description": "Selected state of the checkbox. If CheckboxGroup.selectAll is set for the same group but this Checkbox explicitly sets select, this select value takes precedence.",
          "default": false
        },
        "value": {
          "type": "string",
          "description": "Semantic identifier for the checkbox. Not rendered visually. Used by getCheckboxGroupValues."
        },
        "selectedColor": {
          "type": "string",
          "description": "The fill color when selected. Hex color string. Supports #RRGGBB and #AARRGGBB formats.",
          "default": "#007DFF"
        },
        "unselectedColor": {
          "type": "string",
          "description": "The border/outline color when not selected. Hex color string. Supports #RRGGBB and #AARRGGBB formats.",
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
        "shape": {
          "type": "string",
          "description": "The shape of the checkbox. If CheckboxGroup.checkboxShape is set for the same group but this Checkbox explicitly sets shape, this shape value takes precedence.",
          "enum": ["circle", "rounded_square"],
          "default": "circle"
        },
        "group": {
          "type": "string",
          "description": "CheckboxGroup name that this checkbox belongs to. Type: string. Default is an empty string. This value is not used when the Checkbox is not used with a CheckboxGroup.",
          "default": ""
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
