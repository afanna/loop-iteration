# ExtendedToggle 组件

ExtendedToggle（component 值：Toggle，运行时兼容旧写法 Extended.Toggle）是开关组件，用于表示或切换两种状态（如开/关）。

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
| [isOn](#ison) | 私有属性 | 开关是否打开 |
| [enabled](#enabled) | 私有属性 | 是否可以切换状态 |
| [label](#label) | 私有属性 | 开关旁的显示文本 |
| [styles.selectedColor](#stylesselectedcolor) | 私有样式 | 打开状态背景颜色 |
| [styles.unSelectedColor](#stylesunselectedcolor) | 私有样式 | 关闭状态背景颜色 |
| [styles.switchPointColor](#stylesswitchpointcolor) | 私有样式 | 圆形滑块颜色 |

## 属性字段

### isOn

开关是否打开。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| isOn | boolean | 否 | true：打开；false：关闭。默认值：false。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 true；<br/> 非法 object 取默认值 true；<br/> 属性归一化值非 boolean 类型，可兼容为 boolean 则取兼容结果，不可兼容则取默认值 true 。 |
| Schema 校验与DFX | 静态值类型非 boolean 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-toggle-surface",
    "components": [
      {
        "id": "myToggle",
        "component": "Toggle",
        "isOn": true,
        "label": "Wi-Fi"
      }
    ]
  }
}
```

---

### enabled

是否可以切换状态。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| enabled | boolean | 否 | true：可以切换状态；false：不可以切换状态。默认值：true。 |

**异常处理、Schema校验与DFX：**

| 维度 | 规格 |
| --- | --- |
| 异常处理 | 属性缺失取默认值 true；<br/> 非法 object 取默认值 true；<br/> 属性归一化值非 boolean 类型，可兼容为 boolean 则取兼容结果，不可兼容则取默认值 true 。 |
| Schema 校验与DFX | 静态值类型非 boolean 输出 ERROR_CODE_TYPE_MISMATCH；<br/> 动态值为非法 object 输出 ERROR_CODE_INVALID_VALUE；<br/>动态值（表达式、路径绑定与函数调用）为有效object，但结果值类型不匹配，输出 ERROR_CODE_TYPE_MISMATCH；<br/>动态值（表达式、路径绑定与函数调用）为有效object，结果值类型匹配，但超出了取值范围或枚举范围，输出 ERROR_CODE_INVALID_VALUE。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-toggle-surface",
    "components": [
      {
        "id": "myToggle",
        "component": "Toggle",
        "isOn": false,
        "enabled": false,
        "label": "不可切换"
      }
    ]
  }
}
```

---

### label

设置开关旁的显示文本。

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| label | string | 否 | 支持任意字符串。默认值：空字符串。 |

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
    "surfaceId": "extended-toggle-surface",
    "components": [
      {
        "id": "myToggle",
        "component": "Toggle",
        "isOn": false,
        "label": "蓝牙"
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
| styles.selectedColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 打开状态背景颜色。16 进制字符串，默认值：light #FF007DFF，dark #FF006CDE。 |

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
    "surfaceId": "extended-toggle-surface",
    "components": [
      {
        "id": "myToggle",
        "component": "Toggle",
        "isOn": true,
        "label": "Wi-Fi",
        "styles": {
          "selectedColor": "#34C759"
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
| styles.unSelectedColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 关闭状态背景颜色。16 进制字符串，默认值：light #19000000，dark #19FFFFFF。 |

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
    "surfaceId": "extended-toggle-surface",
    "components": [
      {
        "id": "myToggle",
        "component": "Toggle",
        "isOn": false,
        "label": "飞行模式",
        "styles": {
          "unSelectedColor": "#E5E5EA"
        }
      }
    ]
  }
}
```

---

### styles.switchPointColor

**起始版本：**  API Version 20

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles.switchPointColor | [ExtendedDynamicString](../types.md#extendeddynamicstring) | 否 | 圆形滑块颜色。16 进制字符串，默认值：light #FFFFFFFF，dark #FFE5E5E5。 |

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
    "surfaceId": "extended-toggle-surface",
    "components": [
      {
        "id": "myToggle",
        "component": "Toggle",
        "isOn": true,
        "label": "Wi-Fi",
        "styles": {
          "switchPointColor": "#FFFFFF"
        }
      }
    ]
  }
}
```

---

## 运行时行为

- 用户点击开关时，isOn 状态会自动切换。
- enabled 为 false 时，开关不可交互。
- 开关状态切换时会触发 onChange 事件。

## 示例

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-toggle-surface",
    "components": [
      {
        "id": "wifiToggle",
        "component": "Toggle",
        "isOn": false,
        "enabled": true,
        "label": "Wi-Fi",
        "styles": {
          "selectedColor": "#34C759",
          "unSelectedColor": "#E5E5EA",
          "switchPointColor": "#FFFFFF"
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
| onChange | Toggle | 开关状态切换时触发 | { isOn: boolean }，isOn 为当前开关状态。 |

## 私有函数

### getToggleValue

获取组件的当前状态。返回类型：object。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| componentId | string | 是 | 目标 Toggle 组件的 componentId。 |

返回值包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| isOn | boolean | 开关是否打开。true：打开；false：关闭。 |
| label | string | 开关旁的文本标签。 |

说明：
- 当componentId无对应组件，或对于组件非Toggle类型时，返回空对象 {}。
- 当未传入componentId时，该functionCall失效。

#### 示例

此示例中点击Button后可获取：{ "isOn": true, "label": "Wi-Fi" }。

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "settings_surface",
    "components": [
      {
        "id": "wifiToggle",
        "component": "Toggle",
        "label": "Wi-Fi",
        "isOn": true
      },
      {
        "id": "myButton",
        "component": "Button",
        "label": "click to get",
        "action": {
          "functionCall": {
            "call": "getToggleValue",
            "args": {
              "componentId": "wifiToggle"
            },
            "returnType": "object"
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
  "description": "Returns the on/off state and label text of the target Extended.Toggle component. If args.componentId does not match a component or the matched component is not an Extended.Toggle component, returns an empty object ({}). If args.componentId is omitted, the functionCall is invalid.",
  "properties": {
    "call": {
      "const": "getToggleValue"
    },
    "args": {
      "type": "object",
      "properties": {
        "componentId": {
          "$ref": "../common_types.json#/$defs/DynamicString",
          "description": "The target Extended.Toggle component ID."
        }
      },
      "required": [
        "componentId"
      ],
      "additionalProperties": false
    },
    "returnType": {
      "const": "object"
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
          "const": "Toggle"
        },
        "isOn": {
          "type": "boolean",
          "description": "Whether the toggle is on. Type: boolean. Default: false. true means on, false means off.",
          "default": false
        },
        "enabled": {
          "type": "boolean",
          "description": "Whether the toggle can switch state. Type: boolean. Default: true. true means switchable, false means disabled.",
          "default": true
        },
        "selectedColor": {
          "type": "string",
          "description": "Background color in the on state. Hex color string. Default follows the theme emphasis color. Dark theme: #33317AF7. Light theme: #330A59F7."
        },
        "unSelectedColor": {
          "type": "string",
          "description": "Background color in the off state. Hex color string. Default is about 0x337F7F7F. Dark theme: #19FFFFFF. Light theme: #0C000000."
        },
        "switchPointColor": {
          "type": "string",
          "description": "Round slider color. Hex color string. Default follows the contrary foreground theme color."
        },
        "label": {
          "type": "string",
          "description": "Text displayed next to the toggle. Type: string. Default is an empty string."
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
