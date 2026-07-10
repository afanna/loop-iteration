# Slider 组件

Slider 为滑动条组件，通常用于快速调节设置值，如音量调节、亮度调节等应用场景。

**起始版本：**  API Version 20

## 特有属性

除支持[通用属性](overview.md)，还支持以下特有属性：

| 特有属性 | 说明 |
|------|------|
| [checks](#checks) | 客户端验证规则数组 |
| [label](#label) | 滑块标签 |
| [value](#value) | 当前进度值 |
| [min](#min) | 设置最小值 |
| [max](#max) | 设置最大值 |

### checks

客户端验证规则数组，数组中任一校验项不通过时无法滑动。

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
        "surfaceId": "slider_surface",
        "components": [
            {
                "id": "demoSlider",
                "component": "Slider",
                "label": "选择",
                "value": 50,
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

滑块标签。

**起始版本：**  API Version 20

| 属性  | 类型          | 必填 | 说明                                                         |
| ----- | ------------- | ---- | ------------------------------------------------------------ |
| label | [DynamicString](../types.md#dynamicstring) | 是   | 滑块标签。 <br/>取值范围：支持任意字符串。<br>默认值：""。 |

**示例DSL：**

```json
{
    "version": "v0.9",
    "updateComponents": {
        "surfaceId": "slider_surface",
        "components": [
            {
                "id": "demoSlider",
                "component": "Slider",
                "weight": 2,
                "label": "Slider 名称"
            }
        ]
    }
}
```

---

### min

最小值。

**起始版本：**  API Version 20

| 属性  | 类型   | 必填 | 说明                                                  |
| ----- | ------ | ---- | ----------------------------------------------------- |
| value | number | 否   | 最小值。 <br/>取值范围：支持任意数字。<br>默认值：0。 |

**示例DSL：**

```json
{
    "id": "demoSlider",
    "component": "Slider",
    "weight": 2,
    "label": "Slider 名称",
    "min": 10
}
```

---

### max

最大值。

**起始版本：**  API Version 20

| 属性  | 类型   | 必填 | 说明                                                     |
| ----- | ------ | ---- | -------------------------------------------------------- |
| value | number | 是   | 最大值。 <br/>取值范围： 支持任意数字。<br>默认值：100。 |

说明：

- min >= max异常情况，min取默认值0，max取默认值100。

**示例DSL：**

```json
{
    "version": "v0.9",
    "updateComponents": {
        "surfaceId": "slider_surface",
        "components": [
            {
                "id": "demoSlider",
                "component": "Slider",
                "weight": 2,
                "label": "Slider 名称",
                "max": 100
            }
        ]
    }
}
```

---

### value

当前进度值。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| value | [DynamicNumber](../functions/functioncall.md#dynamicnumber) | 是 | 当前进度值。 <br/>取值范围： [min, max]，小于min时取min，大于max时取max。<br>默认值：与属性min的取值一致。 |

**示例DSL：**

```json
{
    "version": "v0.9",
    "updateComponents": {
        "surfaceId": "slider_surface",
        "components": [
            {
                "id": "demoSlider",
                "component": "Slider",
                "weight": 2,
                "label": "Slider 名称",
                "max": 100,
                "value": 50
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
          "const": "Slider"
        },
        "label": {
          "$ref": "../common_types.json#/$defs/DynamicString",
          "description": "The label for the slider."
        },
        "min": {
          "type": "number",
          "description": "The minimum value of the slider. Defaults to 0. Together with `max`, it defines the inclusive selectable range; `min` should be less than `max`.",
          "default": 0
        },
        "max": {
          "type": "number",
          "description": "The maximum value of the slider. Required. Together with `min`, it defines the inclusive selectable range; `max` should be greater than `min`."
        },
        "value": {
          "$ref": "../common_types.json#/$defs/DynamicNumber",
          "description": "The current value of the slider. It should be within the inclusive range defined by `min` and `max`; renderers may clamp out-of-range values."
        }
      },
      "required": [
        "component",
        "value",
        "max"
      ]
    }
  ],
  "unevaluatedProperties": false
}
```

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
