# ExtendedSelect 组件

ExtendedSelect（协议名：Select）是下拉选择框组件，提供下拉选项列表供用户选择，常用于表单中的单选场景。

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
| [options](#options) | 私有属性 | 下拉选项列表 |
| [selected](#selected) | 私有属性 | 当前选中项索引 |
| [value](#value) | 私有属性 | 下拉框显示文本 |
| [styles.font](#stylesfont) | 私有样式 | 按钮文本字体样式 |
| [styles.fontColor](#stylesfontcolor) | 私有样式 | 按钮文本颜色 |
| [styles.selectedOptionBgColor](#stylesselectedoptionbgcolor) | 私有样式 | 选中选项背景颜色 |
| [styles.selectedOptionFont](#stylesselectedoptionfont) | 私有样式 | 选中选项字体样式 |
| [styles.selectedOptionFontColor](#stylesselectedoptionfontcolor) | 私有样式 | 选中选项文本颜色 |
| [styles.optionBgColor](#stylesoptionbgcolor) | 私有样式 | 下拉选项背景颜色 |
| [styles.optionFont](#stylesoptionfont) | 私有样式 | 下拉选项字体样式 |
| [styles.optionFontColor](#stylesoptionfontcolor) | 私有样式 | 下拉选项文本颜色 |
| [styles.space](#stylesspace) | 私有样式 | 文本与箭头图标的间距 |
| [styles.arrowPosition](#stylesarrowposition) | 私有样式 | 下拉箭头位置 |
| [styles.menuAlign](#stylesmenualign) | 私有样式 | 下拉菜单对齐方式 |
| [styles.optionWidth](#stylesoptionwidth) | 私有样式 | 下拉菜单宽度 |
| [styles.optionHeight](#stylesoptionheight) | 私有样式 | 下拉菜单最大高度 |
| [styles.menuBackgroundColor](#stylesmenubackgroundcolor) | 私有样式 | 下拉菜单背景颜色 |
| [styles.divider](#stylesdivider) | 私有样式 | 选项之间的分割线样式 |

## 属性字段

### options

设置下拉选项列表。每个选项包含一个必填的 value（显示文本），以及可选的 icon（图标资源路径）和 symbolIcon（Symbol 图标配置）。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| options | SelectOptionItem[] | 是 | 下拉选项数组。 |

SelectOptionItem 对象属性：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | string | 是 | 选项显示文本。 |
| icon | string | 否 | 选项图标资源路径。 |
| symbolIcon | object | 否 | Symbol 图标配置，优先级高于 icon。支持 src、fontSize、fontWeight、fontColor、renderingStrategy、effectStrategy。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | options 属性值非 Array 类型取默认值 []。 |
| Schema 校验与DFX | 属性值非 object 输出 ERROR_CODE_TYPE_MISMATCH；<br/> SelectOptionItem 内属性静态值类型不匹配输出 ERROR_CODE_TYPE_MISMATCH；动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          { "value": "北京" },
          { "value": "上海" },
          { "value": "广州" }
        ]
      }
    ]
  }
}
```

---

### selected

设置当前选中项的索引。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| selected | number | 否 | 选中项索引，从 0 开始。-1 表示无选中项。默认值：-1。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 -1；<br/> 非法 object 取默认值 -1；<br/> 属性归一化值非 number 类型，可兼容为 number 则取兼容结果，不可兼容则取默认值 -1；<br/> 属性归一化值超过 options 数组大小，取默认值 -1。 |
| Schema 校验与DFX | 静态值类型非 number 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          { "value": "北京" },
          { "value": "上海" },
          { "value": "广州" }
        ],
        "selected": 1
      }
    ]
  }
}
```

---

### value

设置下拉框按钮上显示的文本。选中菜单项后，按钮文本将自动更新为选中的菜单项文本。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 是 | 下拉框按钮上显示的文本，选中菜单项后自动更新为选中的菜单项文本。 |


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
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          { "value": "北京" },
          { "value": "上海" }
        ],
        "value": "请选择城市"
      }
    ]
  }
}
```

---

### styles.font

设置下拉框按钮文本的字体样式。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.font | object | 否 | 字体样式对象。 |

styles.font 对象属性：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| size | number | 否 | 字体大小，单位 fp。默认值：16。 |
| weight | string | 否 | 字体粗细。枚举值："Lighter"、"Regular"、"Medium"、"Bold"、"Bolder"。默认值："Medium"。 |


**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | font 属性值非 object 类型取默认值。 |
| Schema 校验与DFX | 属性值非 object 输出 ERROR_CODE_TYPE_MISMATCH；<br/> SelectOptionItem 内属性静态值类型不匹配输出 ERROR_CODE_TYPE_MISMATCH；动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          { "value": "北京" },
          { "value": "上海" }
        ],
        "styles": {
          "font": {
            "size": 16,
            "weight": "Medium"
          }
        }
      }
    ]
  }
}
```

---

### styles.fontColor

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.fontColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 按钮文本颜色。16 进制字符串，支持 "#RRGGBB" 和 "#AARRGGBB" 格式。默认值：light #E5FFFFFF，dark #E5000000。 |


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
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          { "value": "北京" },
          { "value": "上海" }
        ],
        "styles": {
          "fontColor": "#333333"
        }
      }
    ]
  }
}
```

---

### styles.selectedOptionBgColor

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.selectedOptionBgColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 选中选项的背景颜色。16 进制字符串，默认值：light #FF317AF7（透明度 0.4），dark #FF007DFF（透明度 0.2）。 |


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
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          { "value": "北京" },
          { "value": "上海" }
        ],
        "styles": {
          "selectedOptionBgColor": "#F0F0F0"
        }
      }
    ]
  }
}
```

---

### styles.selectedOptionFont

设置选中选项的字体样式。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.selectedOptionFont | object | 否 | 字体样式对象。 |

styles.selectedOptionFont 对象属性：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| size | number | 否 | 字体大小，单位 fp。默认值：16。 |
| weight | string | 否 | 字体粗细。默认值："Regular"。 |


**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | selectedOptionFont 属性值非 object 类型取默认值。 |
| Schema 校验与DFX | 属性值非 object 输出 ERROR_CODE_TYPE_MISMATCH；<br/> SelectOptionItem 内属性静态值类型不匹配输出 ERROR_CODE_TYPE_MISMATCH；动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          { "value": "北京" },
          { "value": "上海" }
        ],
        "styles": {
          "selectedOptionFont": {
            "size": 16,
            "weight": "Medium"
          }
        }
      }
    ]
  }
}
```

---

### styles.selectedOptionFontColor

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.selectedOptionFontColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 选中选项文本颜色。16 进制字符串，默认值：light #FF3F97E9，dark #FF007DFF。 |


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
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          { "value": "北京" },
          { "value": "上海" }
        ],
        "styles": {
          "selectedOptionFontColor": "#007DFF"
        }
      }
    ]
  }
}
```

---

### styles.optionBgColor

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.optionBgColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 下拉选项的背景颜色。16 进制字符串，默认值：light #00000000，dark #00000000。 |


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
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          { "value": "北京" },
          { "value": "上海" }
        ],
        "styles": {
          "optionBgColor": "#FFFFFF"
        }
      }
    ]
  }
}
```

---

### styles.optionFont

设置下拉选项的字体样式。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.optionFont | object | 否 | 字体样式对象。 |

styles.optionFont 对象属性：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| size | number | 否 | 字体大小，单位 fp。默认值：16。 |
| weight | string | 否 | 字体粗细。默认值："Regular"。 |


**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | selectedOptionFont 属性值非 object 类型取默认值。 |
| Schema 校验与DFX | 属性值非 object 输出 ERROR_CODE_TYPE_MISMATCH；<br/> SelectOptionItem 内属性静态值类型不匹配输出 ERROR_CODE_TYPE_MISMATCH；动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          { "value": "北京" },
          { "value": "上海" }
        ],
        "styles": {
          "optionFont": {
            "size": 14,
            "weight": "Regular"
          }
        }
      }
    ]
  }
}
```

---

### styles.optionFontColor

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.optionFontColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 下拉选项文本颜色。16 进制字符串，默认值：light #DBFFFFFF，dark #FF182431。 |


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
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          { "value": "北京" },
          { "value": "上海" }
        ],
        "styles": {
          "optionFontColor": "#666666"
        }
      }
    ]
  }
}
```

---

### styles.space

设置按钮文本与下拉箭头图标之间的间距。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.space | [ExtendedDynamicNumber](../types.md#extendeddynamicnumber) | 否 | 间距值，单位 vp。取值范围：[0, +∞)。默认值：0。设置为非法值或小于等于 8 的值时，取默认值。 |


**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 0；<br/> 非法 object 取默认值 0；<br/> 属性归一化值非 number 类型，可兼容为 number 则取兼容结果，不可兼容则取默认值 0 ；<br/> 属性归一化值小于 0 取默认值 0。 |
| Schema 校验与DFX | 静态值类型非 number 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          { "value": "北京" },
          { "value": "上海" }
        ],
        "styles": {
          "space": 8
        }
      }
    ]
  }
}
```

---

### styles.arrowPosition

设置下拉箭头相对于文本的位置。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.arrowPosition | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 默认值：end。 |

可选枚举值：

| 值 | 说明 |
|------|------|
| end | 箭头位于文本右侧（尾部） |
| start | 箭头位于文本左侧（首部） |


**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 end；<br/> 非法 object 取默认值 end；<br/> 属性归一化值非 string 类型，可兼容为 string 则取兼容结果，不可兼容则取默认值 end，兼容结果超出枚举范围取默认值 end。 |
| Schema 校验与DFX | 静态值类型非 string 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          { "value": "北京" },
          { "value": "上海" }
        ],
        "styles": {
          "arrowPosition": "end"
        }
      }
    ]
  }
}
```

---

### styles.menuAlign

设置下拉菜单相对于按钮的对齐方式。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.menuAlign | string \| object \| [ExtendedDynamicValueRef](../types.md#extendeddynamicvalueref) | 否 | 支持字符串枚举或带偏移量的对象。默认值：start。 |

字符串枚举值：

| 值 | 说明 |
|------|------|
| start | 左对齐 |
| center | 居中对齐 |
| end | 右对齐 |

对象格式属性：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| alignType | string | 否 | 对齐方式："start"、"center"、"end"。默认值："start"。 |
| offset | object | 否 | 对齐后的偏移量。 |
| offset.dx | number | 否 | 水平偏移量，单位 vp。默认值：0。 |
| offset.dy | number | 否 | 垂直偏移量，单位 vp。默认值：0。 |


**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值。 |
| Schema 校验与DFX | 静态值类型不匹配输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          { "value": "北京" },
          { "value": "上海" }
        ],
        "menuAlign": {
          "alignType": "start",
          "offset": { "dx": 0, "dy": 4 }
        }
      }
    ]
  }
}
```

---

### styles.optionWidth

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.optionWidth | [ExtendedDynamicNumber](../types.md#extendeddynamicnumber) | 否 | 下拉菜单宽度，单位 vp。未设置或为异常值/小于 56vp 时属性无效，使用默认 2 栅格宽度。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          { "value": "北京" },
          { "value": "上海" }
        ],
        "styles": {
          "optionWidth": 200
        }
      }
    ]
  }
}
```

---

### styles.optionHeight

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.optionHeight | [ExtendedDynamicNumber](../types.md#extendeddynamicnumber) | 否 | 下拉菜单最大高度，单位 vp。取值范围：(0, +∞)，传入 0 或负值时不生效。默认值：0（不生效，最大高度为屏幕可用高度的 80%）。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          { "value": "北京" },
          { "value": "上海" }
        ],
        "styles": {
          "optionHeight": 240
        }
      }
    ]
  }
}
```

---

### styles.menuBackgroundColor

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.menuBackgroundColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 下拉菜单背景颜色。16 进制字符串，默认值：light #00000000，dark #00000000。 |


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
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          { "value": "北京" },
          { "value": "上海" }
        ],
        "styles": {
          "menuBackgroundColor": "#FFFFFF"
        }
      }
    ]
  }
}
```

---

### styles.divider

设置下拉选项之间的分割线样式。设为 null 可隐藏分割线。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.divider | object \| null | 否 | 分割线样式对象，设为 null 隐藏分割线。 |

styles.divider 对象属性：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| strokeWidth | number | 否 | 分割线宽度，单位 vp。取值范围：[0, +∞)，负值忽略不生效。默认值：'1px'。 |
| color | string | 否 | 分割线颜色。16 进制字符串，非法值忽略不生效。默认值：'#33182431'。 |
| startMargin | number | 否 | 分割线起始边距，单位 vp。取值范围：[0, +∞)，负值忽略不生效。默认值：0。 |
| endMargin | number | 否 | 分割线末尾边距，单位 vp。取值范围：[0, +∞)，负值忽略不生效。默认值：0。 |


**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失使用 ArkUI 默认 divider 行为；属性值 null 隐藏 divider；属性值非 object 且非 null 忽略，保持默认；object 子字段非法则跳过该子字段；空 object 下发空 DividerOptions。 |
| Schema 校验与DFX | 静态值非 object/null 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          { "value": "北京" },
          { "value": "上海" }
        ],
        "styles": {
          "divider": {
            "strokeWidth": 1,
            "color": "#E5E5E5",
            "startMargin": 8,
            "endMargin": 8
          }
        }
      }
    ]
  }
}
```

---

## 运行时行为

- 用户点击下拉框时弹出选项列表，选择某项后自动收起。
- 选中项改变时触发 onChange 事件，回调数据包含选中项索引和文本值。
- selected 为 -1 时表示无选中项，下拉框显示 value 字段的文本内容。
- 可通过内置函数 getSelectValue 获取当前选中项的文本值。

## 示例

### 基础用法

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          { "value": "北京" },
          { "value": "上海" },
          { "value": "广州" },
          { "value": "深圳" }
        ],
        "selected": 0,
        "value": "北京",
        "styles": {
          "font": { "size": 16, "weight": "Medium" },
          "fontColor": "#333333",
          "arrowPosition": "end",
          "menuAlign": "start",
          "menuBackgroundColor": "#FFFFFF",
          "selectedOptionBgColor": "#F0F0F0",
          "selectedOptionFontColor": "#007DFF",
          "divider": {
            "strokeWidth": 1,
            "color": "#E5E5E5",
            "startMargin": 8,
            "endMargin": 8
          }
        }
      }
    ]
  }
}
```

### 带图标的选项

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-select-surface",
    "components": [
      {
        "id": "langSelect",
        "component": "Select",
        "options": [
          { "value": "简体中文", "icon": "resources/base/media/cn.png" },
          { "value": "English", "icon": "resources/base/media/en.png" },
          { "value": "日本語", "icon": "resources/base/media/jp.png" }
        ],
        "selected": -1,
        "value": "选择语言",
        "styles": {
          "optionWidth": 200,
          "optionHeight": 240,
          "menuAlign": {
            "alignType": "start",
            "offset": { "dx": 0, "dy": 4 }
          }
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
| onChange | Select | 选中选项发生变化时触发 | { index: number, value: string }，index 为选中项索引（从 0 开始），value 为选中项文本。 |

## 私有函数

### getSelectValue

获取组件的当前选中值。返回类型：string。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| componentId | string | 是 | 目标 Select 组件的 ID。 |

返回目标 Select 组件的选中项文本值。

说明：
- 当componentId指向的Select组件无选中项时，返回空字符串 ""。
- 当componentId无对应组件，或对于组件非Select类型时，返回空字符串 ""。
- 当未传入componentId时，该functionCall失效。

#### 示例

此示例中点击Button后可获取："beijing"。

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "form_surface",
    "components": [
      {
        "id": "citySelect",
        "component": "Select",
        "options": [
          {
            "label": "北京",
            "value": "beijing"
          },
          {
            "label": "上海",
            "value": "shanghai"
          },
          {
            "label": "广州",
            "value": "guangzhou"
          }
        ],
        "selected": 0
      },
      {
        "id": "myButton",
        "component": "Button",
        "label": "click to get",
        "action": {
          "functionCall": {
            "call": "getSelectValue",
            "args": {
              "componentId": "citySelect"
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
  "description": "Returns the currently selected text value of the target Select component. If the target Select component has no selected item, args.componentId does not match a component, or the matched component is not an Select component, returns an empty string (\"\"). If args.componentId is omitted, the functionCall is invalid.",
  "properties": {
    "call": {
      "const": "getSelectValue"
    },
    "args": {
      "type": "object",
      "properties": {
        "componentId": {
          "$ref": "../common_types.json#/$defs/DynamicString",
          "description": "The target Select component ID."
        }
      },
      "required": [
        "componentId"
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
          "const": "Select"
        },
        "options": {
          "$ref": "#/$defs/DynamicSelectOptions",
          "description": "Dropdown option list. Each item uses the format { value, icon, symbolIcon }. value is the option text and is required. icon is the image path. symbolIcon has higher priority than icon."
        },
        "selected": {
          "$ref": "#/$defs/DynamicSelectedIndex",
          "description": "Initial selected option index. Default: -1. -1 means no option is selected and the value text is displayed."
        },
        "value": {
          "$ref": "#/$defs/DynamicString",
          "description": "Text content of the dropdown button. Default is an empty string. After a menu item is selected, the button text is automatically updated to the selected item text."
        },
        "styles": {
          "$ref": "#/$defs/DynamicSelectStyles",
          "description": "Select private style object, including font, color, divider, arrow position, menu alignment, and menu size settings."
        }
      },
      "required": [
        "component",
        "options",
        "value"
      ]
    }
  ],
  "additionalProperties": true,
  "$defs": {
    "DataBinding": {
      "$ref": "../common_types.json#/$defs/DataBinding"
    },
    "FunctionCall": {
      "$ref": "../common_types.json#/$defs/FunctionCall"
    },
    "DynamicString": {
      "$ref": "../common_types.json#/$defs/DynamicString"
    },
    "DynamicNumber": {
      "$ref": "../common_types.json#/$defs/DynamicNumber"
    },
    "DynamicPositiveNumber": {
      "description": "Dynamic positive number.",
      "oneOf": [
        {
          "type": "number",
          "exclusiveMinimum": 0
        },
        {
          "$ref": "#/$defs/DataBinding"
        },
        {
          "allOf": [
            {
              "$ref": "#/$defs/FunctionCall"
            },
            {
              "properties": {
                "returnType": {
                  "const": "number"
                }
              }
            }
          ]
        }
      ]
    },
    "DynamicNonNegativeNumber": {
      "description": "Dynamic non-negative number.",
      "oneOf": [
        {
          "type": "number",
          "minimum": 0
        },
        {
          "$ref": "#/$defs/DataBinding"
        },
        {
          "allOf": [
            {
              "$ref": "#/$defs/FunctionCall"
            },
            {
              "properties": {
                "returnType": {
                  "const": "number"
                }
              }
            }
          ]
        }
      ]
    },
    "DynamicColor": {
      "oneOf": [
        {
          "type": "string",
          "pattern": "^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$"
        },
        {
          "$ref": "#/$defs/DataBinding"
        },
        {
          "allOf": [
            {
              "$ref": "#/$defs/FunctionCall"
            },
            {
              "properties": {
                "returnType": {
                  "const": "string"
                }
              }
            }
          ]
        }
      ]
    },
    "DynamicSelectedIndex": {
      "description": "Dynamic selected index. Static values are numbers. Default: -1. Data binding and function calls returning number are also supported.",
      "oneOf": [
        {
          "type": "number",
          "default": -1
        },
        {
          "$ref": "#/$defs/DataBinding"
        },
        {
          "allOf": [
            {
              "$ref": "#/$defs/FunctionCall"
            },
            {
              "properties": {
                "returnType": {
                  "const": "number"
                }
              }
            }
          ]
        }
      ]
    },
    "DynamicStringEnumArrowPosition": {
      "description": "Arrow position. end: text before arrow, default. start: arrow before text. Input values use lowercase strings.",
      "oneOf": [
        {
          "type": "string",
          "enum": [
            "end",
            "start"
          ],
          "default": "end"
        },
        {
          "$ref": "#/$defs/DataBinding"
        },
        {
          "allOf": [
            {
              "$ref": "#/$defs/FunctionCall"
            },
            {
              "properties": {
                "returnType": {
                  "const": "string"
                }
              }
            }
          ]
        }
      ]
    },
    "DynamicStringEnumMenuAlign": {
      "description": "Menu alignment. start: align to the leading edge in the current language direction, default. center: centered. end: align to the trailing edge. Input values use lowercase strings.",
      "oneOf": [
        {
          "type": "string",
          "enum": [
            "start",
            "center",
            "end"
          ],
          "default": "start"
        },
        {
          "$ref": "#/$defs/DataBinding"
        },
        {
          "allOf": [
            {
              "$ref": "#/$defs/FunctionCall"
            },
            {
              "properties": {
                "returnType": {
                  "const": "string"
                }
              }
            }
          ]
        }
      ]
    },
    "DynamicSymbolRenderingStrategy": {
      "description": "Symbol rendering strategy. single: monochrome mode, default. multipleColor: multi-color mode with up to three colors. multipleOpacity: layered opacity mode.",
      "oneOf": [
        {
          "type": "string",
          "enum": [
            "single",
            "multipleColor",
            "multipleOpacity"
          ],
          "default": "single"
        },
        {
          "$ref": "#/$defs/DataBinding"
        },
        {
          "allOf": [
            {
              "$ref": "#/$defs/FunctionCall"
            },
            {
              "properties": {
                "returnType": {
                  "const": "string"
                }
              }
            }
          ]
        }
      ]
    },
    "DynamicSymbolEffectStrategy": {
      "description": "Symbol effect strategy. none: no effect, default. scale: overall scale effect. hierarchical: hierarchical effect.",
      "oneOf": [
        {
          "type": "string",
          "enum": [
            "none",
            "scale",
            "hierarchical"
          ],
          "default": "none"
        },
        {
          "$ref": "#/$defs/DataBinding"
        },
        {
          "allOf": [
            {
              "$ref": "#/$defs/FunctionCall"
            },
            {
              "properties": {
                "returnType": {
                  "const": "string"
                }
              }
            }
          ]
        }
      ]
    },
    "DynamicSelectOptions": {
      "description": "Dynamic Select option list. Static values are SelectOption arrays. Data binding and function calls returning array are also supported.",
      "oneOf": [
        {
          "type": "array",
          "items": {
            "$ref": "#/$defs/SelectOption"
          }
        },
        {
          "$ref": "#/$defs/DataBinding"
        },
        {
          "allOf": [
            {
              "$ref": "#/$defs/FunctionCall"
            },
            {
              "properties": {
                "returnType": {
                  "const": "array"
                }
              }
            }
          ]
        }
      ]
    },
    "SelectOption": {
      "type": "object",
      "description": "Dropdown option object. value is the option text and is required. icon is the image path. symbolIcon is the Symbol image and has higher priority than icon.",
      "properties": {
        "value": {
          "$ref": "#/$defs/DynamicString",
          "description": "Dropdown option text content."
        },
        "icon": {
          "$ref": "#/$defs/DynamicString",
          "description": "Dropdown option image path."
        },
        "symbolIcon": {
          "$ref": "#/$defs/DynamicSymbolIcon",
          "description": "Symbol image configuration for the dropdown option. It has higher priority than icon."
        }
      },
      "required": [
        "value"
      ],
      "additionalProperties": true
    },
    "DynamicSymbolIcon": {
      "description": "Dynamic Symbol icon object. Format: { src, fontSize, fontWeight, fontColor, renderingStrategy, effectStrategy }. src is required.",
      "oneOf": [
        {
          "type": "object",
          "properties": {
            "src": {
              "$ref": "#/$defs/DynamicString",
              "description": "Symbol icon resource name."
            },
            "fontSize": {
              "$ref": "#/$defs/DynamicPositiveNumber",
              "description": "Symbol icon font size in fp. The value must be greater than 0."
            },
            "fontWeight": {
              "$ref": "#/$defs/DynamicPositiveNumber",
              "description": "Symbol icon font weight. The value must be greater than 0."
            },
            "fontColor": {
              "$ref": "#/$defs/DynamicColor",
              "description": "Symbol icon color."
            },
            "renderingStrategy": {
              "$ref": "#/$defs/DynamicSymbolRenderingStrategy",
              "description": "Symbol rendering strategy."
            },
            "effectStrategy": {
              "$ref": "#/$defs/DynamicSymbolEffectStrategy",
              "description": "Symbol effect strategy."
            }
          },
          "required": [
            "src"
          ],
          "additionalProperties": true
        },
        {
          "$ref": "#/$defs/DataBinding"
        },
        {
          "allOf": [
            {
              "$ref": "#/$defs/FunctionCall"
            },
            {
              "properties": {
                "returnType": {
                  "const": "object"
                }
              }
            }
          ]
        }
      ]
    },
    "DynamicFont": {
      "description": "Dynamic font object. Format: { size, weight, family, style }. size is in fp. family is a prioritized font list. style supports normal and italic.",
      "oneOf": [
        {
          "type": "object",
          "properties": {
            "size": {
              "$ref": "#/$defs/DynamicPositiveNumber",
              "description": "Text size in fp. The value must be greater than 0."
            },
            "weight": {
              "description": "Text font weight. Supports number or string enum: lighter=100, normal/regular=400, medium=500, bold=700, bolder=900.",
              "oneOf": [
                {
                  "type": "string"
                },
                {
                  "type": "number"
                },
                {
                  "$ref": "#/$defs/DataBinding"
                },
                {
                  "$ref": "#/$defs/FunctionCall"
                }
              ]
            },
            "family": {
              "$ref": "#/$defs/DynamicString",
              "description": "Font list. Type: string. Multiple fonts are separated by commas and matched in priority order, for example 'Arial, HarmonyOS Sans'."
            },
            "style": {
              "$ref": "#/$defs/DynamicString",
              "description": "Font style. normal: standard font style, default. italic: italic font style."
            }
          },
          "additionalProperties": true
        },
        {
          "$ref": "#/$defs/DataBinding"
        },
        {
          "allOf": [
            {
              "$ref": "#/$defs/FunctionCall"
            },
            {
              "properties": {
                "returnType": {
                  "const": "object"
                }
              }
            }
          ]
        }
      ]
    },
    "DynamicMenuAlign": {
      "description": "Dynamic menu alignment configuration. It can be a direct string value start/center/end or an object { alignType, offset }. offset uses { dx, dy } in vp. Default: { dx: 0, dy: 0 }.",
      "oneOf": [
        {
          "$ref": "#/$defs/DynamicStringEnumMenuAlign"
        },
        {
          "type": "object",
          "properties": {
            "alignType": {
              "$ref": "#/$defs/DynamicStringEnumMenuAlign",
              "description": "Alignment type: start, center, or end."
            },
            "offset": {
              "description": "Offset of the dropdown menu relative to the button after alignType is applied. Format: { dx, dy }. Default: { dx: 0, dy: 0 }.",
              "oneOf": [
                {
                  "type": "object",
                  "properties": {
                    "dx": {
                      "$ref": "#/$defs/DynamicNumber",
                      "description": "Horizontal offset in vp."
                    },
                    "dy": {
                      "$ref": "#/$defs/DynamicNumber",
                      "description": "Vertical offset in vp."
                    }
                  },
                  "additionalProperties": true
                },
                {
                  "$ref": "#/$defs/DataBinding"
                },
                {
                  "$ref": "#/$defs/FunctionCall"
                }
              ]
            }
          },
          "additionalProperties": true
        },
        {
          "$ref": "#/$defs/DataBinding"
        },
        {
          "allOf": [
            {
              "$ref": "#/$defs/FunctionCall"
            },
            {
              "properties": {
                "returnType": {
                  "const": "object"
                }
              }
            }
          ]
        }
      ]
    },
    "DynamicDivider": {
      "description": "Dynamic divider style. Object format: { strokeWidth, color, startMargin, endMargin }. null means no divider style is set.",
      "oneOf": [
        {
          "type": "null"
        },
        {
          "type": "object",
          "properties": {
            "strokeWidth": {
              "$ref": "#/$defs/DynamicPositiveNumber",
              "description": "Divider stroke width in vp. The value must be greater than 0. Default is about 1px."
            },
            "color": {
              "$ref": "#/$defs/DynamicColor",
              "description": "Divider color. Hex color string."
            },
            "startMargin": {
              "$ref": "#/$defs/DynamicNonNegativeNumber",
              "description": "Distance from the divider to the leading edge in vp. The value must be greater than or equal to 0."
            },
            "endMargin": {
              "$ref": "#/$defs/DynamicNonNegativeNumber",
              "description": "Distance from the divider to the trailing edge in vp. The value must be greater than or equal to 0."
            }
          },
          "additionalProperties": true
        },
        {
          "$ref": "#/$defs/DataBinding"
        },
        {
          "$ref": "#/$defs/FunctionCall"
        }
      ]
    },
    "DynamicSelectStyles": {
      "description": "Dynamic Select private style object. All fields are optional.",
      "oneOf": [
        {
          "type": "object",
          "properties": {
            "font": {
              "$ref": "#/$defs/DynamicFont",
              "description": "Text style of the dropdown button. Default is about { size: $r('sys.float.ohos_id_text_size_button1'), weight: medium }."
            },
            "fontColor": {
              "$ref": "#/$defs/DynamicColor",
              "description": "Text color of the dropdown button. Default follows the theme primary text color."
            },
            "selectedOptionBgColor": {
              "$ref": "#/$defs/DynamicColor",
              "description": "Background color of the selected menu option. Default follows the theme component activated color."
            },
            "selectedOptionFont": {
              "$ref": "#/$defs/DynamicFont",
              "description": "Text style of the selected menu option. Supports size, weight, family, and style. Default is about { size: body1, weight: regular }."
            },
            "selectedOptionFontColor": {
              "$ref": "#/$defs/DynamicColor",
              "description": "Text color of the selected menu option. Default follows the theme activated primary text color."
            },
            "optionBgColor": {
              "$ref": "#/$defs/DynamicColor",
              "description": "Background color of normal menu options. Default: transparent."
            },
            "optionFont": {
              "$ref": "#/$defs/DynamicFont",
              "description": "Text style of normal menu options. Supports size, weight, family, and style. Default is about { size: body1, weight: regular }."
            },
            "optionFontColor": {
              "$ref": "#/$defs/DynamicColor",
              "description": "Text color of normal menu options. Default follows the theme primary text color."
            },
            "space": {
              "$ref": "#/$defs/DynamicNonNegativeNumber",
              "description": "Spacing between the dropdown button text and arrow in vp. Default: 8. Invalid values or values <= 8 are handled as the default value."
            },
            "arrowPosition": {
              "$ref": "#/$defs/DynamicStringEnumArrowPosition",
              "description": "Arrow position of the dropdown button. Input lowercase string start or end."
            },
            "menuAlign": {
              "$ref": "#/$defs/DynamicMenuAlign",
              "description": "Alignment between the dropdown button and dropdown menu. Input lowercase string start/center/end or object { alignType, offset }."
            },
            "optionWidth": {
              "$ref": "#/$defs/DynamicPositiveNumber",
              "description": "Dropdown menu option width in vp. If unset, invalid, or less than the minimum width 56vp, it does not take effect and the default two-column grid width is used."
            },
            "optionHeight": {
              "$ref": "#/$defs/DynamicPositiveNumber",
              "description": "Maximum dropdown menu height in vp. If unset or 0, it does not take effect. The default maximum height is 80% of the available screen height."
            },
            "menuBackgroundColor": {
              "$ref": "#/$defs/DynamicColor",
              "description": "Dropdown menu background color. Hex color string. Default: transparent."
            },
            "divider": {
              "$ref": "#/$defs/DynamicDivider",
              "description": "Dropdown menu divider style."
            }
          },
          "additionalProperties": true
        },
        {
          "$ref": "#/$defs/DataBinding"
        },
        {
          "allOf": [
            {
              "$ref": "#/$defs/FunctionCall"
            },
            {
              "properties": {
                "returnType": {
                  "const": "object"
                }
              }
            }
          ]
        }
      ]
    }
  }
}
```

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
