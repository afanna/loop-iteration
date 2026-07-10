# ExtendedButton 组件

ExtendedButton（component 值：Button，运行时兼容旧写法 Extended.Button）是按钮组件，响应用户点击操作，常用于触发事件。

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
| [label](#label) | 私有属性 | 按钮文本 |
| [enabled](#enabled) | 私有属性 | 按钮是否可点击 |
| [action](#action) | 私有属性 | 点击响应事件 |
| [styles.fontSize](#stylesfontsize) | 私有样式 | 字体大小 |
| [styles.fontWeight](#stylesfontweight) | 私有样式 | 字体粗细 |
| [styles.minFontSize](#stylesminfontsize) | 私有样式 | 文本最小显示大小 |
| [styles.maxFontSize](#stylesmaxfontsize) | 私有样式 | 文本最大显示大小 |
| [styles.fontScaleMode](#stylesfontscalemode) | 私有样式 | 字体缩放模式 |
| [styles.minFontScale](#stylesminfontscale) | 私有样式 | 最小字体缩放比例 |
| [styles.maxFontScale](#stylesmaxfontscale) | 私有样式 | 最大字体缩放比例 |
| [styles.fontColor](#stylesfontcolor) | 私有样式 | 字体颜色 |

## 属性字段

### label

按钮中的文本。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| label | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 是 | 按钮文本标签。支持静态字符串、表达式和路径绑定。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 ""；<br/> 非法 object 取默认值 ""；<br/> 属性归一化值非 string 类型，可兼容为 string 则取兼容结果，不可兼容则取默认值 "" 。 |
| Schema 校验与DFX | 静态值类型非 string 输出 ERROR_CODE_TYPE_MISMATCH；<br/>属性缺失输出 ERROR_CODE_REQUIRED_MISS；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（数据绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（数据绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-button-surface",
    "components": [
      {
        "id": "myButton",
        "component": "Button",
        "label": "确认提交"
      }
    ]
  }
}
```

---

### enabled

按钮是否可点击。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| enabled | [ExtendedDynamicBoolean](../types.md#extendeddynamicboolean) | 否 | true 为可点击，false 为不可点击。默认 true。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 true；<br/> 非法 object 取默认值 true；<br/> 属性归一化值非 boolean 类型，可兼容为 boolean 则取兼容结果，不可兼容则取默认值 true 。 |
| Schema 校验与DFX | 静态值类型非 boolean 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（数据绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（数据绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-button-surface",
    "components": [
      {
        "id": "myButton",
        "component": "Button",
        "label": "不可点击",
        "enabled": false
      }
    ]
  }
}
```

---

## 私有属性字段

### action

点击按钮触发的响应事件。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | [Action](../types.md#action) | 否 | 取值范围：<br/>1. 服务器事件：{ event: { name, context } }<br/>2. 客户端函数：{ functionCall: FunctionCall }<br/>默认值：{}。 |

说明：
- action 功能不依赖 ArkUI 实现。
- 事件注册映射为 NODE_ON_CLICK_EVENT。
- action 注册 ⇒ registerNodeEvent(node, NODE_ON_CLICK_EVENT)。

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 {}，不注册点击 action；<br/>属性值非 object 取默认值 {}，不注册点击 action。 |
| Schema 校验与DFX | 属性值非 object 输出 ERROR_CODE_TYPE_MISMATCH ；<br/>。缺 event/functionCall 输出 ERROR_CODE_REQUIRED_MISS；<br/>动态值（数据绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（数据绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-button-surface",
    "components": [
      {
        "id": "myButton",
        "component": "Button",
        "label": "提交",
        "action": {
          "event": {
            "name": "submit",
            "context": {}
          }
        }
      }
    ]
  }
}
```

---

## 私有样式字段（styles）

### styles.fontSize

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.fontSize | [ExtendedDynamicNumber](../types.md#extendeddynamicnumber) | 否 | 字体大小，单位 fp。默认值：$r('sys.float.Body_L')。解析失败时回退到 16 fp。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 16 fp；<br/> 非法 object 取默认值 16 fp；<br/> 属性归一化值非 number 类型，可兼容为 number 则取兼容结果，不可兼容则取默认值 16 fp 。 |
| Schema 校验与DFX | 静态值类型非 number 输出 ERROR_CODE_TYPE_MISMATCH；<br/>静态值 <=0 输出 ERROR_CODE_INVALID_VALUE；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（数据绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（数据绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-button-surface",
    "components": [
      {
        "id": "myButton",
        "component": "Button",
        "label": "按钮文本",
        "styles": {
          "fontSize": 20
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
| styles.fontWeight | [ExtendedDynamicNumber](../types.md#extendeddynamicnumber) | 否 | 字体粗细。默认值：500。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 500；<br/> 非法 object 取默认值 500；<br/> 属性归一化值非 number\|string 类型，可兼容为 number\|string 则取兼容结果，不可兼容则取默认值 500 。 |
| Schema 校验与DFX | 静态值类型非 string/number 输出 ERROR_CODE_TYPE_MISMATCH；<br/>string 类型的静态值超出枚举范围输出 ERROR_CODE_INVALID_VALUE；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（数据绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（数据绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-button-surface",
    "components": [
      {
        "id": "myButton",
        "component": "Button",
        "label": "按钮文本",
        "styles": {
          "fontWeight": "bold"
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
| styles.minFontSize | [ExtendedDynamicNumber](../types.md#extendeddynamicnumber) | 否 | 文本最小显示大小，单位 fp。需配合 maxFontSize 以及 maxLines 或布局大小限制使用，单独设置不生效。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | minFontSize 小于等于 0 或大于 maxFontSize 时，自适应字号不生效，此时字体大小按照 fontSize 属性的值生效。 |
| Schema 校验与DFX | 静态值类型非 number 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（数据绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（数据绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-button-surface",
    "components": [
      {
        "id": "myButton",
        "component": "Button",
        "label": "按钮文本",
        "styles": {
          "minFontSize": 12,
          "maxFontSize": 20
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
| styles.maxFontSize | [ExtendedDynamicNumber](../types.md#extendeddynamicnumber) | 否 | 文本最大显示大小，单位 fp。需配合 minFontSize 以及 maxLines 或布局大小限制使用，单独设置不生效。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | maxFontSize 小于等于 0 或小于 minFontSize 时，自适应字号不生效，此时字体大小按照 fontSize 属性的值生效。 |
| Schema 校验与DFX | 静态值类型非 number 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（数据绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（数据绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-button-surface",
    "components": [
      {
        "id": "myButton",
        "component": "Button",
        "label": "按钮文本",
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

### styles.fontScaleMode

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.fontScaleMode | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 控制组件字号是否跟随系统字体缩放设置进行缩放。枚举值："followSystem"（跟随系统）、"custom"（不跟随系统，使用自定义值）。默认值 followSystem。 |

**说明**：
- **"followSystem"**（默认）：字号不随系统字体缩放变化，始终保持 fontSize 设定的原始值。适用于需要固定字号的场景。
- **"custom"**：字号跟随系统字体缩放系数进行缩放，实际显示字号 = fontSize × 系统字体缩放系数。

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 followSystem；<br/> 属性值超出枚举范围取默认值 followSystem；<br/> 非法 object 取默认值 followSystem。 |
| Schema 校验与DFX | 静态值类型非 string 输出 ERROR_CODE_TYPE_MISMATCH；<br/>静态值超出枚举范围输出 ERROR_CODE_INVALID_VALUE；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（数据绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（数据绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-button-surface",
    "components": [
      {
        "id": "myButton",
        "component": "Button",
        "label": "按钮文本",
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
| styles.minFontScale | [ExtendedDynamicNumber](../types.md#extendeddynamicnumber) | 否 | 最小字体缩放比例，取值范围：[0, 1]。设置的值小于 0 时按 0 处理，大于 1 时按 1 处理，其余异常值不生效。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 设置的值小于 0 时按 0 处理，大于 1 时按 1 处理，其余异常值不生效；<br/>属性缺失则该属性失效；<br/> 属性值为非法 object 则该属性失效。 |
| Schema 校验与DFX | 静态值类型非 number 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（数据绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（数据绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-button-surface",
    "components": [
      {
        "id": "myButton",
        "component": "Button",
        "label": "按钮文本",
        "styles": {
          "fontScaleMode": "custom",
          "minFontScale": 0.5,
          "maxFontScale": 2.0
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
| styles.maxFontScale | [ExtendedDynamicNumber](../types.md#extendeddynamicnumber) | 否 | 最大字体缩放比例，取值范围：[1, inf)。设置的值小于 1 时按 1 处理，其余异常值不生效。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性值为 number 类型但小于 1 时按 1 处理；<br/>属性归一化值非 number 类型，可兼容为 number 则取兼容结果，不可兼容则该属性失效；<br/>属性缺失则该属性失效；<br/> 属性值为非法 object 则该属性失效。 |
| Schema 校验与DFX | 静态值类型非 number 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（数据绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（数据绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-button-surface",
    "components": [
      {
        "id": "myButton",
        "component": "Button",
        "label": "按钮文本",
        "styles": {
          "fontScaleMode": "custom",
          "minFontScale": 0.5,
          "maxFontScale": 2.0
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
| styles.fontColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 字体颜色。16 进制字符串，支持 "#RRGGBB" 和 "#AARRGGBB" 格式。默认值：light #FF0A59F7，dark #5291FF。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取主题默认色；<br/> 属性值为非法 object 取主题默认色；<br/> 属性归一化值非 string 类型，可兼容为 string 则取兼容结果，不可兼容则取主题默认色。 |
| Schema 校验与DFX | 静态值类型非 string 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（数据绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（数据绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-button-surface",
    "components": [
      {
        "id": "myButton",
        "component": "Button",
        "label": "按钮文本",
        "styles": {
          "fontColor": "#FF0000"
        }
      }
    ]
  }
}
```

---

## 运行时行为

- 点击按钮会触发 action 中定义的事件。
- enabled 为 false 时，按钮不可交互。
- 字体缩放属性 minFontScale/maxFontScale 在 fontScaleMode 为 "custom" 时生效。

## 示例

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-button-surface",
    "components": [
      {
        "id": "submitBtn",
        "component": "Button",
        "label": "确认",
        "enabled": true,
        "action": {
          "event": {
            "name": "submit",
            "context": {}
          }
        },
        "styles": {
          "fontColor": "#FF0A59F7",
          "fontSize": 16,
          "fontWeight": "medium",
          "fontScaleMode": "followSystem",
          "minFontScale": 0.8,
          "maxFontScale": 1.5
        }
      }
    ]
  }
}
```

## 事件

### onClick

| 事件 | 适用组件 | 触发时机 | 回调数据 |
|------|------|------|------|
| onClick | Button | 点击 | { x: number, y: number }，点击位置相对于组件自身的坐标。 |

### action 与 onClick 优先级

Button 同时支持 action 属性和 onClick 事件监听。**action 优先级更高**：

- 有 action 时：仅执行 action，onClick 事件监听不注册
- 无 action 时：执行 onClick 事件监听

```json
// 有 action — onClick 被忽略
{
  "id": "btn1",
  "component": "Button",
  "label": "提交",
  "action": { "functionCall": { "call": "openUrl", "args": { "url": "https://example.com" } } },
  "onClick": [{ "call": "setDataModel", "args": { "path": "/clicked", "value": true } }]
}

// 无 action — onClick 生效
{
  "id": "btn2",
  "component": "Button",
  "label": "刷新",
  "onClick": [
    { "call": "setDataModel", "args": { "path": "/ui/isLoading", "value": true } },
    { "call": "setAttributes", "args": { "componentId": "btn2", "value": { "label": "加载中..." } } }
  ]
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
          "const": "Button"
        },
        "label": {
          "description": "Button text label",
          "oneOf": [
            {
              "type": "string"
            },
            {
              "$ref": "../common_types.json#/$defs/DynamicString"
            }
          ]
        },
        "enabled": {
          "description": "Whether the button is enabled",
          "oneOf": [
            {
              "type": "boolean"
            },
            {
              "$ref": "../common_types.json#/$defs/DynamicBoolean"
            }
          ],
          "default": true
        },
        "action": {
          "$ref": "../common_types.json#/$defs/Action",
          "description": "Click response action. Supports server events in the form { event: { name, context } } and client functions in the form { functionCall: FunctionCall }. Default is an empty object."
        },
        "styles": {
          "type": "object",
          "properties": {
            "fontColor": {
              "type": "string",
              "description": "Button text color in hex format."
            },
            "fontSize": {
              "type": "number",
              "description": "Font size in fp. Default is about 16fp."
            },
            "fontWeight": {
              "description": "Font weight of the text. Supports number, default 500, or string enum: lighter/normal/regular/medium/bold/bolder.",
              "oneOf": [
                {
                  "type": "number"
                },
                {
                  "type": "string",
                  "enum": [
                    "lighter",
                    "normal",
                    "regular",
                    "medium",
                    "bold",
                    "bolder"
                  ]
                }
              ]
            },
            "minFontSize": {
              "type": "number",
              "description": "Minimum text display size in fp. If minFontSize <= 0, adaptive font sizing is disabled and fontSize, or its default value, is used."
            },
            "maxFontSize": {
              "type": "number",
              "description": "Maximum text display size in fp. If maxFontSize <= 0 or maxFontSize < minFontSize, adaptive font sizing is disabled and fontSize, or its default value, is used."
            },
            "fontScaleMode": {
              "type": "string",
              "description": "Font scaling mode. followSystem follows the system font scale. custom uses the configured custom font scale range.",
              "enum": [
                "followSystem",
                "custom"
              ]
            },
            "minFontScale": {
              "type": "number",
              "description": "Minimum font zoom ratio. Value range: [0, 1]. Values less than 0 are clamped to 0, values greater than 1 are clamped to 1, and non-number values do not take effect."
            },
            "maxFontScale": {
              "type": "number",
              "description": "Maximum font zoom ratio. Value range: [1, inf). Values less than 1 are clamped to 1, and non-number values do not take effect."
            }
          },
          "additionalProperties": true
        }
      },
      "required": [
        "component",
        "label"
      ]
    }
  ],
  "additionalProperties": true
}
```

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
