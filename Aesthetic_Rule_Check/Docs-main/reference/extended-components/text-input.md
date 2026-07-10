# ExtendedTextInput 组件

ExtendedTextInput（component 值：TextInput，运行时兼容旧写法 Extended.TextInput）是文本输入框组件，用于接收用户输入的文字内容。

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
| [text](#text) | 私有属性 | 默认文本内容 |
| [placeholder](#placeholder) | 私有属性 | 提示文本内容 |
| [enabled](#enabled) | 私有属性 | 是否允许输入 |
| [maxLength](#maxlength) | 私有属性 | 最大输入字符数 |
| [type](#type) | 私有属性 | 输入框类型 |
| [styles.placeholderColor](#stylesplaceholdercolor) | 私有样式 | 提示文本颜色 |
| [styles.cancelButton](#stylescancelbutton) | 私有样式 | 右侧清除按钮样式 |
| [styles.caretColor](#stylescaretcolor) | 私有样式 | 光标颜色 |
| [styles.selectedBackgroundColor](#stylesselectedbackgroundcolor) | 私有样式 | 文本选中底板颜色 |
| [styles.showUnderline](#stylesshowunderline) | 私有样式 | 是否开启下划线 |
| [styles.underlineColor](#stylesunderlinecolor) | 私有样式 | 下划线颜色 |
| [styles.fontSize](#stylesfontsize) | 私有样式 | 字体大小 |
| [styles.fontWeight](#stylesfontweight) | 私有样式 | 字体粗细 |
| [styles.fontColor](#stylesfontcolor) | 私有样式 | 字体颜色 |
| [styles.textAlign](#stylestextalign) | 私有样式 | 水平对齐方式 |
| [styles.maxFontSize](#stylesmaxfontsize) | 私有样式 | 文本最大显示字号 |
| [styles.minFontSize](#stylesminfontsize) | 私有样式 | 文本最小显示字号 |
| [styles.wordBreak](#styleswordbreak) | 私有样式 | 文本断行规则 |
| [styles.maxLines](#stylesmaxlines) | 私有样式 | 文本最大行数 |
| [styles.fontScaleMode](#stylesfontscalemode) | 私有样式 | 字体缩放模式 |
| [styles.minFontScale](#stylesminfontscale) | 私有样式 | 最小字体缩放比例 |
| [styles.maxFontScale](#stylesmaxfontscale) | 私有样式 | 最大字体缩放比例 |

## 属性字段

### text

默认文本内容。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| text | string | 否 | 输入框默认文本内容。默认值：空字符串。 |

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
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "text": "Hello World"
      }
    ]
  }
}
```

---

### placeholder

单行文本输入框的默认提示文本内容。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| placeholder | string | 否 | 提示文本。默认值：空字符串。 |

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
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "placeholder": "请输入内容"
      }
    ]
  }
}
```

---

### enabled

是否允许输入。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| enabled | boolean | 否 | true 表示允许，false 表示禁用。默认值：true。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 true；<br/> 非法 object 取默认值 true；<br/> 属性归一化值非 boolean 类型，可兼容为 boolean 则取兼容结果，不可兼容则取默认值 true 。 |
| Schema 校验与DFX | 静态值类型非 boolean 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。|

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "enabled": false,
        "placeholder": "不可编辑"
      }
    ]
  }
}
```

---

### maxLength

最大输入字符数。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| maxLength | number | 否 | 最大输入字符数。默认值：Infinity（可无限输入）。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失 reset 为无限制；属性归一化值非 number 类型，可兼容为 number 则取兼容结果，不可兼容则 reset 为无限制；非有限值或 <=0 视为无限制；超过 int32 上限 clamp 到 int32 上限。 |
| Schema 校验与DFX | 静态值类型非 number 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。|

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "maxLength": 50,
        "placeholder": "最多输入50个字符"
      }
    ]
  }
}
```

---

### type

输入框类型。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 字符串枚举值，默认值：normal。 |

可选枚举值：

| 值 | 说明 |
|------|------|
| normal | 基本输入模式，无特殊限制 |
| number | 纯数字输入模式，不支持负数、小数 |
| phoneNumber | 电话号码输入模式，支持输入数字、空格、+、-、*、#、(、)，长度不限 |
| email | 邮箱地址输入模式，支持数字、字母、下划线、小数点、!、#、$、%、&、'、"、@、+、-、/、=、?、^、\`、{、} |
| password | 密码输入模式 |
| numberPassword | 数字密码输入模式 |
| userName | 用户名输入模式 |
| newPassword | 新密码输入模式 |
| numberDecimal | 数字小数输入模式 |
| url | URL 输入模式 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 normal；<br/> 非法 object 取默认值 normal；<br/> 属性归一化值非 string 类型，可兼容为 string 则取兼容结果，不可兼容则取默认值 normal 。 |
| Schema 校验与DFX | 静态值类型非 string 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。|

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "emailInput",
        "component": "TextInput",
        "type": "email",
        "placeholder": "请输入邮箱地址"
      }
    ]
  }
}
```

---

## 私有样式字段（styles）

### styles.placeholderColor

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.placeholderColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 提示文本颜色。16 进制字符串，默认值：light #99182431，dark #99FFFFFF。 |

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
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "placeholder": "提示文本",
        "styles": {
          "placeholderColor": "#999999"
        }
      }
    ]
  }
}
```

---

### styles.cancelButton

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.cancelButton | object | 否 | 右侧清除按钮样式。默认值：{ style: "input" }。 |

cancelButton 对象属性：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| style | string | 否 | 枚举值："constant"（常显）、"invisible"（常隐）、"input"（输入时显示）。默认 "input"。 |
| fontColor | string | 否 | 清除按钮字体颜色，16 进制字符串。默认值：null。 |
| fontSize | number | 否 | 清除按钮字体大小，单位 fp。默认值：16。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值。 |
| Schema 校验与DFX | 静态值类型非 object 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。|

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "placeholder": "输入后显示清除按钮",
        "styles": {
          "cancelButton": {
            "style": "input",
            "fontColor": "#aeaeae",
            "fontSize": 16
          }
        }
      }
    ]
  }
}
```

---

### styles.caretColor

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.caretColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 光标颜色。16 进制字符串，默认值：light #007DFF，dark #5291FF。 |

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
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "styles": {
          "caretColor": "#FF0000"
        }
      }
    ]
  }
}
```

---

### styles.selectedBackgroundColor

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.selectedBackgroundColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 文本选中底板颜色。16 进制字符串，默认值：light #33007DFF，dark #33006CDE。 |

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
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "styles": {
          "selectedBackgroundColor": "#33007DFF"
        }
      }
    ]
  }
}
```

---

### styles.showUnderline

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.showUnderline | [ExtendedDynamicBoolean](../types.md#extendeddynamicboolean) | 否 | 是否开启下划线。true：开启，false：不开启。默认值：false。下划线只支持 type 为 normal 类型。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 false；<br/> 非法 object 取默认值 false；<br/> 属性归一化值非 boolean 类型，可兼容为 boolean 则取兼容结果，不可兼容则取默认值 false 。 |
| Schema 校验与DFX | 静态值类型非 boolean 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。|

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "type": "normal",
        "styles": {
          "showUnderline": true
        }
      }
    ]
  }
}
```

---

### styles.underlineColor

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.underlineColor | object | 否 | 设置下划线颜色。四个属性都是可选，类型均为 16 进制颜色字符串。默认值：light #33182431，dark #33FFFFFF（四种状态相同）。 |

underlineColor 对象属性：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| typing | string | 否 | 键入时下划线颜色。默认值：light #33182431，dark #33FFFFFF。 |
| normal | string | 否 | 非特殊状态时下划线颜色。默认值：light #33182431，dark #33FFFFFF。 |
| error | string | 否 | 错误时下划线颜色。默认值：light #33182431，dark #33FFFFFF。 |
| disable | string | 否 | 禁用时下划线颜色。默认值：light #33182431，dark #33FFFFFF。 |

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
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "type": "normal",
        "styles": {
          "showUnderline": true,
          "underlineColor": {
            "typing": "#FF4256C1",
            "normal": "#CCCCCC",
            "error": "#FF0000",
            "disable": "#EEEEEE"
          }
        }
      }
    ]
  }
}
```

---

### styles.fontSize

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.fontSize | [ExtendedDynamicNumber](../types.md#extendeddynamicnumber) | 否 | 字体大小，单位 fp。默认值：16。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 16 fp；<br/> 非法 object 取默认值 16 fp；<br/> 属性归一化值非 number 类型，可兼容为 number 则取兼容结果，不可兼容则取默认值 16 fp 。 |
| Schema 校验与DFX | 静态值类型非 number 输出 ERROR_CODE_TYPE_MISMATCH；<br/>静态值 <=0 输出 ERROR_CODE_INVALID_VALUE；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "styles": {
          "fontSize": 18
        }
      }
    ]
  }
}
```

---

### styles.fontWeight

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.fontWeight | [ExtendedDynamicNumber](../types.md#extendeddynamicnumber) | 否 | 字体粗细。默认值：normal。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 500；<br/> 非法 object 取默认值 500；<br/> 属性归一化值非 number\|string 类型，可兼容为 number\|string 则取兼容结果，不可兼容则取默认值 500 。 |
| Schema 校验与DFX | 静态值类型非 string/number 输出 ERROR_CODE_TYPE_MISMATCH；<br/>string 类型的静态值超出枚举范围输出 ERROR_CODE_INVALID_VALUE；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |


**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "styles": {
          "fontWeight": "bold"
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
| styles.fontColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 字体颜色。16 进制字符串，默认值：light #182431，dark #E5FFFFFF。 |

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
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "styles": {
          "fontColor": "#333333"
        }
      }
    ]
  }
}
```

---

### styles.textAlign

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.textAlign | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 水平对齐方式，默认值：start。枚举值："start"（水平对齐首部）、"center"（水平居中对齐）、"end"（水平对齐尾部）、"justify"（双端对齐，按 TextAlign.Start 处理）。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 start；<br/> 非法 object 取默认值 start；<br/> 属性归一化值非 string 类型，可兼容为 string 则取兼容结果，不可兼容则取默认值 start 。 |
| Schema 校验与DFX | 静态值类型非 string 输出 ERROR_CODE_TYPE_MISMATCH；<br/>静态值超出枚举范围输出 ERROR_CODE_INVALID_VALUE；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "styles": {
          "textAlign": "center"
        }
      }
    ]
  }
}
```

---

### styles.maxFontSize

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.maxFontSize | [ExtendedDynamicNumber](../types.md#extendeddynamicnumber) | 否 | 文本最大显示字号，单位 fp。需配合 minFontSize 以及 maxLines（内联输入风格且编辑态时使用）或布局大小限制使用，单独设置不生效。自适应字号生效时 fontSize 设置不生效。maxFontSize 小于等于 0 或小于 minFontSize 时，自适应字号不生效。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | maxFontSize 小于等于 0 或小于 minFontSize 时，自适应字号不生效，此时字体大小按照 fontSize 属性的值生效。 |
| Schema 校验与DFX | 静态值类型非 number 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "styles": {
          "minFontSize": 12,
          "maxFontSize": 24
        }
      }
    ]
  }
}
```

---

### styles.minFontSize

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.minFontSize | [ExtendedDynamicNumber](../types.md#extendeddynamicnumber) | 否 | 文本最小显示字号，单位 fp。需配合 maxFontSize 以及 maxLines 或布局大小限制使用，单独设置不生效。自适应字号生效时 fontSize 设置不生效。minFontSize 小于或等于 0 时，自适应字号不生效。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | minFontSize 小于等于 0 或大于 maxFontSize 时，自适应字号不生效，此时字体大小按照 fontSize 属性的值生效。 |
| Schema 校验与DFX | 静态值类型非 number 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "styles": {
          "minFontSize": 10,
          "maxFontSize": 20
        }
      }
    ]
  }
}
```

---

### styles.wordBreak

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.wordBreak | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 文本断行规则，默认值：normal。枚举值："normal"、"breakAll"、"breakWord"、"hyphenation"。 |

可选枚举值说明：

| 值 | 说明 |
|------|------|
| normal | CJK 文本可在任意 2 个字符间断行；Non-CJK 文本只能在空白符处断行 |
| breakWord | Non-CJK 文本可在任意 2 个字符间断行，有空白符时优先按空白符换行；CJK 文本与 normal 一致 |
| hyphenation | 每行末尾单词尝试通过连字符 - 断行，无法添加时与 breakWord 一致 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 normal；<br/> 非法 object 取默认值 normal；<br/> 属性归一化值非 string 类型，可兼容为 string 则取兼容结果，不可兼容则取默认值 normal 。 |
| Schema 校验与DFX | 静态值类型非 string 输出 ERROR_CODE_TYPE_MISMATCH；<br/>静态值超出枚举范围输出 ERROR_CODE_INVALID_VALUE；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "styles": {
          "wordBreak": "breakWord"
        }
      }
    ]
  }
}
```

---

### styles.maxLines

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.maxLines | [ExtendedDynamicNumber](../types.md#extendeddynamicnumber) | 否 | 文本最大行数。默认值：3。仅在内联模式编辑态生效。取值范围：(0, inf]。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 完整下发字段缺失 reset；完整下发解析失败或 <=0 reset；增量更新字段存在但解析失败或 <=0 reset，未出现的字段保留当前值。 |
| Schema 校验与DFX | 静态值类型非 number 输出 ERROR_CODE_TYPE_MISMATCH；<br/>静态值超出取值范围输出 ERROR_CODE_INVALID_VALUE；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "styles": {
          "maxLines": 5
        }
      }
    ]
  }
}
```

---

### styles.fontScaleMode

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.fontScaleMode | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 字体缩放模式，默认值：followSystem。枚举值："followSystem"（跟随系统）、"custom"（不跟随系统，使用自定义值）。 |

**说明**：
- **"followSystem"**（默认）：字号不随系统字体缩放变化，始终保持 fontSize 设定的原始值。适用于需要固定字号的场景。
- **"custom"**：字号跟随系统字体缩放系数进行缩放，实际显示字号 = fontSize × 系统字体缩放系数。可配合 minFontScale / maxFontScale 限制缩放范围。

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 followSystem；<br/> 属性值超出枚举范围取默认值 followSystem；<br/> 非法 object 取默认值 followSystem。 |
| Schema 校验与DFX | 静态值类型非 string 输出 ERROR_CODE_TYPE_MISMATCH；<br/>静态值超出枚举范围输出 ERROR_CODE_INVALID_VALUE；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "styles": {
          "fontScaleMode": "custom",
          "minFontScale": 0.8,
          "maxFontScale": 1.5
        }
      }
    ]
  }
}
```

---

### styles.minFontScale

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.minFontScale | [ExtendedDynamicNumber](../types.md#extendeddynamicnumber) | 否 | 最小字体缩放比例，取值范围：[0, 1]。设置的值小于 0 时按 0 处理，大于 1 时按 1 处理，异常值默认不生效。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 设置的值小于 0 时按 0 处理，大于 1 时按 1 处理，其余异常值不生效；<br/>属性缺失则该属性失效；<br/> 属性值为非法 object 则该属性失效。 |
| Schema 校验与DFX | 静态值类型非 number 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "styles": {
          "fontScaleMode": "custom",
          "minFontScale": 0.6
        }
      }
    ]
  }
}
```

---

### styles.maxFontScale

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.maxFontScale | [ExtendedDynamicNumber](../types.md#extendeddynamicnumber) | 否 | 最大字体缩放比例，取值范围：[1, inf)。设置的值小于 1 时按 1 处理，异常值默认不生效。设置 maxFontScale 属性后，showError 最多放大到 2 倍。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性值为 number 类型但小于 1 时按 1 处理；<br/>属性归一化值非 number 类型，可兼容为 number 则取兼容结果，不可兼容则该属性失效；<br/>属性缺失则该属性失效；<br/> 属性值为非法 object 则该属性失效。 |
| Schema 校验与DFX | 静态值类型非 number 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "myInput",
        "component": "TextInput",
        "styles": {
          "fontScaleMode": "custom",
          "maxFontScale": 2.0
        }
      }
    ]
  }
}
```

---

## 运行时行为

- enabled 为 false 时，输入框不可交互。
- 输入内容发生变化时触发 onChange 事件，回调参数为最新的文本框内容。
- 下划线仅在 type 为 normal 且 showUnderline 为 true 时显示。
- 字体缩放属性 minFontScale/maxFontScale 在 fontScaleMode 为 "custom" 时生效。

## 示例

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-textinput-surface",
    "components": [
      {
        "id": "emailInput",
        "component": "TextInput",
        "text": "",
        "placeholder": "请输入邮箱地址",
        "enabled": true,
        "maxLength": 100,
        "type": "email",
        "styles": {
          "placeholderColor": "#999999",
          "caretColor": "#007AFF",
          "fontColor": "#000000",
          "fontSize": 16,
          "fontWeight": "normal",
          "textAlign": "start",
          "showUnderline": true,
          "underlineColor": {
            "typing": "#FF4256C1",
            "normal": "#CCCCCC",
            "error": "#FF0000",
            "disable": "#EEEEEE"
          },
          "cancelButton": {
            "style": "input",
            "fontColor": "#aeaeae",
            "fontSize": 16
          },
          "fontScaleMode": "followSystem"
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
| onChange | TextInput | 输入内容发生变化时触发 | { value: string }，value 为当前文本框中的文本内容。 |

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
          "const": "TextInput"
        },
        "text": {
          "type": "string",
          "description": "Default text content. Type: string. Default is an empty string."
        },
        "placeholder": {
          "type": "string",
          "description": "Default prompt text for the single-line text input. Type: string. Default is an empty string."
        },
        "enabled": {
          "type": "boolean",
          "description": "Whether text input is enabled. Type: boolean. Default: true. true means enabled, false means disabled."
        },
        "maxLength": {
          "type": "number",
          "minimum": 0,
          "description": "Maximum number of input characters. Type: number. Value range: [0, inf). Default: Infinity. If unset or invalid, input length is unlimited."
        },
        "type": {
          "type": "string",
          "description": "Input box type. Options: normal, number, phoneNumber, email, password, numberPassword, userName, newPassword, numberDecimal, url.",
          "enum": [
            "normal",
            "number",
            "phoneNumber",
            "email",
            "password",
            "numberPassword",
            "userName",
            "newPassword",
            "numberDecimal",
            "url"
          ]
        },
        "placeholderColor": {
          "type": "string",
          "description": "Placeholder text color. Hex color string. Supports #RRGGBB and #AARRGGBB. Default follows the theme."
        },
        "cancelButton": {
          "type": "object",
          "description": "Style of the clear button on the right. Object format: { style, fontColor, fontSize }. All fields are optional. Default: { style: 'input' }.",
          "properties": {
            "style": {
              "type": "string",
              "description": "Clear button display mode. constant: always visible. invisible: always hidden. input: visible while input exists. Default: input.",
              "enum": [
                "constant",
                "invisible",
                "input"
              ]
            },
            "fontColor": {
              "type": "string",
              "description": "Clear button color. Hex color string. Supports #RRGGBB and #AARRGGBB."
            },
            "fontSize": {
              "type": "number",
              "description": "Clear button font size in fp."
            }
          }
        },
        "caretColor": {
          "type": "string",
          "description": "Caret color. Hex color string. Default: #007DFF. Dark theme: #5291FF. Light theme: #FF0A59F7."
        },
        "selectedBackgroundColor": {
          "type": "string",
          "description": "Text selection background color. Hex color string. Default is a theme color with about 20% opacity."
        },
        "showUnderline": {
          "type": "boolean",
          "description": "Whether to show the underline. Type: boolean. Default: false. true enables the underline, false disables it. The underline is supported only when type=normal."
        },
        "underlineColor": {
          "type": "object",
          "description": "Underline color object: { typing, normal, error, disable }. All fields are optional and use hex color strings.",
          "properties": {
            "typing": {
              "type": "string",
              "description": "Underline color while typing."
            },
            "normal": {
              "type": "string",
              "description": "Underline color in the normal state."
            },
            "error": {
              "type": "string",
              "description": "Underline color in the error state."
            },
            "disable": {
              "type": "string",
              "description": "Underline color in the disabled state."
            }
          }
        },
        "fontSize": {
          "type": "number",
          "description": "Sets the font size in fp. Default: 16fp."
        },
        "fontWeight": {
          "type": "string",
          "description": "Font weight. String enum: lighter=100, normal/regular=400, medium=500, bold=700, bolder=900. Default: normal.",
          "enum": [
            "lighter",
            "normal",
            "regular",
            "medium",
            "bold",
            "bolder"
          ]
        },
        "fontColor": {
          "type": "string",
          "description": "Font color. Hex color string. Default: #E5000000. Dark theme: #99FFFFFF. Light theme: #99000000."
        },
        "textAlign": {
          "type": "string",
          "description": "Horizontal alignment. start: leading edge. center: centered. end: trailing edge. justify: justified, handled as start.",
          "enum": [
            "start",
            "center",
            "end",
            "justify"
          ]
        },
        "maxFontSize": {
          "type": "number",
          "description": "Maximum text display size in fp. It must be used with minFontSize and maxLines or a layout size constraint; setting it alone does not take effect. When adaptive font sizing is active, fontSize does not take effect. If maxFontSize <= 0 or maxFontSize < minFontSize, fontSize or its default value is used."
        },
        "minFontSize": {
          "type": "number",
          "description": "Minimum text display size in fp. It must be used with maxFontSize and maxLines or a layout size constraint; setting it alone does not take effect. When adaptive font sizing is active, fontSize does not take effect. If minFontSize <= 0, fontSize or its default value is used."
        },
        "wordBreak": {
          "type": "string",
          "description": "Text line break rule. normal: CJK text may break between any two characters, while Non-CJK text breaks only at whitespace. breakWord: prefer break points, otherwise break between any two characters. hyphenation: try hyphenating words at line end, otherwise use breakWord.",
          "enum": [
            "normal",
            "breakAll",
            "breakWord",
            "hyphenation"
          ]
        },
        "maxLines": {
          "type": "number",
          "description": "Maximum number of text lines. Type: number. Value range: (0, inf]. Default: 3. Takes effect only in inline editing mode."
        },
        "fontScaleMode": {
          "type": "string",
          "description": "Font scaling mode. followSystem follows the system font scale. custom uses the configured custom font scale range.",
          "enum": [
            "followSystem",
            "custom"
          ],
          "default": "followSystem"
        },
        "minFontScale": {
          "type": "number",
          "description": "Minimum font scale. Value range: [0, 1]. Values less than 0 are clamped to 0, values greater than 1 are clamped to 1, and non-number values do not take effect."
        },
        "maxFontScale": {
          "type": "number",
          "description": "Maximum font scale. Value range: [1, inf). Values less than 1 are clamped to 1, and non-number values do not take effect. After this property is set, showError can scale up to 2x at most."
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
