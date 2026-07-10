# ExtendedRadio 组件

ExtendedRadio（component 值：Radio，运行时兼容旧写法 Extended.Radio）是单选框组件，提供相应的用户交互选择项。

**起始版本：**  API Version 20

## 使用前提

该组件属于扩展 Catalog 内置组件。创建控制器时使用 CatalogFactory.extended()，并在 createSurface 中使用 ohos.a2ui.extended.catalog。

```ts
import {
  CatalogFactory,
  SurfaceControllerFactory
} from '@arkui-genius/genui'

const controller = SurfaceControllerFactory.createSurfaceController({
  uiContext: uiContext,
  catalog: CatalogFactory.extended()
})
```

## 字段类型区分

除支持[通用属性](overview.md)，还支持以下字段：

| 字段名 | 字段类型 | 说明 |
|------|------|------|
| [value](#value) | 私有属性 | 当前单选框的值 |
| [checked](#checked) | 私有属性 | 单选框的选中状态 |
| [group](#group) | 私有属性 | 所属群组名称 |
| [styles.checkedBackgroundColor](#stylescheckedbackgroundcolor) | 私有样式 | 选中状态底板颜色 |
| [styles.unCheckedBorderColor](#stylesuncheckedbordercolor) | 私有样式 | 未选中状态描边颜色 |
| [styles.indicatorColor](#stylesindicatorcolor) | 私有样式 | 选中状态内部圆饼颜色 |

## 属性字段

### value

当前单选框的值。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 是 | 当前单选框的值。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失时 schema 校验不通过；<br/> 非法 object 取默认值 ""；<br/> 属性归一化值非 string 类型，可兼容为 string 则取兼容结果，不可兼容则取默认值 "" 。 |
| Schema 校验与DFX | 静态值类型非 string 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-radio-surface",
    "components": [
      {
        "id": "optionA",
        "component": "Radio",
        "value": "option_a",
        "group": "answerGroup"
      }
    ]
  }
}
```

---

### checked

设置单选框的选中状态。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| checked | boolean | 否 | true：单选框被选中；false：单选框不被选中。默认值：false。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 false；<br/> 非法 object 取默认值 false；<br/> 属性归一化值非 boolean 类型，可兼容为 boolean 则取兼容结果，不可兼容则取默认值 false 。 |
| Schema 校验与DFX | 静态值类型非 boolean 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-radio-surface",
    "components": [
      {
        "id": "optionA",
        "component": "Radio",
        "value": "a",
        "checked": true,
        "group": "answerGroup"
      }
    ]
  }
}
```

---

### group

当前单选框的所属群组名称。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| group | string | 否 | 相同 group 的 Radio 只能有一个被选中。默认值：空字符串。 |

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
    "surfaceId": "extended-radio-surface",
    "components": [
      {
        "id": "radio1",
        "component": "Radio",
        "value": "a",
        "group": "myGroup"
      },
      {
        "id": "radio2",
        "component": "Radio",
        "value": "b",
        "group": "myGroup"
      }
    ]
  }
}
```


## 私有样式字段（styles）

### styles.checkedBackgroundColor

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.checkedBackgroundColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 选中状态底板颜色。16 进制字符串，默认值：light #FF0A59F7，dark #FF317AF7。 |

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
    "surfaceId": "extended-radio-surface",
    "components": [
      {
        "id": "myRadio",
        "component": "Radio",
        "value": "a",
        "group": "myGroup",
        "styles": {
          "checkedBackgroundColor": "#FFAAFF"
        }
      }
    ]
  }
}
```

---

### styles.unCheckedBorderColor

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.unCheckedBorderColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 未选中状态描边颜色。16 进制字符串，默认值：light #33FFFFFF，dark #33FFFFFF。 |

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
    "surfaceId": "extended-radio-surface",
    "components": [
      {
        "id": "myRadio",
        "component": "Radio",
        "value": "a",
        "group": "myGroup",
        "styles": {
          "unCheckedBorderColor": "#CCCCCC"
        }
      }
    ]
  }
}
```

---

### styles.indicatorColor

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.indicatorColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 选中状态内部圆饼颜色。16 进制字符串，默认值：light #FFFFFFFF，dark #FFFFFFFF。 |

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
    "surfaceId": "extended-radio-surface",
    "components": [
      {
        "id": "myRadio",
        "component": "Radio",
        "value": "a",
        "group": "myGroup",
        "styles": {
          "indicatorColor": "#FFFFFF"
        }
      }
    ]
  }
}
```

---

## 运行时行为

- 相同 group 的 Radio 组件只能有一个被选中，选中新的会自动取消其他已选中的。
- 单选框选中状态改变时触发 onChange 事件。
- checked 可用于初始化选中状态。

## 示例

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-radio-surface",
    "components": [
      {
        "id": "radioOption1",
        "component": "Radio",
        "value": "option_a",
        "checked": true,
        "group": "answerGroup",
        "styles": {
          "checkedBackgroundColor": "#FFAAFF",
          "unCheckedBorderColor": "#CCCCCC",
          "indicatorColor": "#FFFFFF"
        }
      },
      {
        "id": "radioOption2",
        "component": "Radio",
        "value": "option_b",
        "checked": false,
        "group": "answerGroup",
        "styles": {
          "checkedBackgroundColor": "#FFAAFF",
          "unCheckedBorderColor": "#CCCCCC",
          "indicatorColor": "#FFFFFF"
        }
      }
    ]
  }
}
```

## 事件

### onChange

| 事件 | 适用组件 | 触发时机 | 回调数据 |
|------|------|------|------|
| onChange | Radio | 单选框选中状态改变时触发 | { isChecked: boolean }，isChecked 为当前选中状态。 |

## 私有函数

### getRadioValue

获取指定群组中当前选中的组件的value属性值。返回类型：string。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| group | string | 是 | Radio 组件的群组名称，与 ExtendedRadio 的 group 属性一致。 |

返回值：选中 Radio 的 value 属性值。

说明：
- 当group中无选中项时，返回空字符串 ""。
- 当group不存在时，返回空字符串 ""。
- 当未传入group值时，该functionCall失效。

#### 示例

此示例中点击Button后可获取："male"。

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "survey_surface",
    "components": [
      {
        "id": "genderMale",
        "component": "Radio",
        "checked": true,
        "value": "male",
        "group": "answerGroup"
      },
      {
        "id": "genderFemale",
        "component": "Radio",
        "checked": false,
        "value": "female",
        "group": "answerGroup"
      },
      {
        "id": "myButton",
        "component": "Button",
        "label": "click to get",
        "action": {
          "functionCall": {
            "call": "getRadioValue",
            "args": {
              "group": "answerGroup"
            },
            "returnType": "string"
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
  "description": "Returns the value text of the selected Radio component in the target group. If the group has no selected item or the group does not exist, returns an empty string (\"\"). If args.group is omitted, the functionCall is invalid.",
  "properties": {
    "call": {
      "const": "getRadioValue"
    },
    "args": {
      "type": "object",
      "properties": {
        "group": {
          "$ref": "../common_types.json#/$defs/DynamicString",
          "description": "The target Radio group name."
        }
      },
      "required": [
        "group"
      ],
      "additionalProperties": false
    },
    "returnType": {
      "const": "string"
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
          "const": "Radio"
        },
        "value": {
          "type": "string",
          "description": "Value of the current radio button. Required."
        },
        "checked": {
          "type": "boolean",
          "description": "Selected state of the radio button. Default: false. true means selected, false means unselected.",
          "default": false
        },
        "group": {
          "type": "string",
          "description": "Group name of the current radio button. Default is an empty string. Only one Radio in the same group can be selected."
        },
        "checkedBackgroundColor": {
          "type": "string",
          "description": "Background color in the selected state. Hex color string. Default follows the theme emphasis background. Dark theme: #FF317AF7. Light theme: #FF0A59F7."
        },
        "unCheckedBorderColor": {
          "type": "string",
          "description": "Border color in the unselected state. Hex color string. Default follows the switch-off outline theme color. Dark theme: #66FFFFFF. Light theme: #66000000."
        },
        "indicatorColor": {
          "type": "string",
          "description": "Inner dot color in the selected state. Hex color string. Default follows the contrary foreground theme color. The default for both dark and light themes is #FFFFFFFF."
        }
      },
      "required": [
        "component",
        "value"
      ]
    }
  ],
  "additionalProperties": true
}
```

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
