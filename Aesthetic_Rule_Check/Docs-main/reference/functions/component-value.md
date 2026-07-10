# 组件值函数

> **Catalog**：鸿蒙扩展协议 Catalog（ohos.a2ui.extended.catalog）
>
> 组件值函数用于在 Action 上下文或 EventHandler 链中读取扩展组件的当前状态。

## 函数列表

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| [getToggleValue](#gettogglevalue) | componentId: string | object | 获取指定 Toggle 组件状态 |
| [getRadioValue](#getradiovalue) | group: string | string | 获取指定 Radio 群组的选中值 |
| [getSelectValue](#getselectvalue) | componentId: string | string | 获取指定 Select 组件的当前选中值 |
| [getCheckboxGroupValues](#getcheckboxgroupvalues) | group: string | string[] | 获取指定 CheckboxGroup 群组的选中值数组 |

## getToggleValue

获取组件的当前状态。返回类型：object。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| componentId | string | 是 | 目标 Toggle 组件的 componentId。 |

返回值包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| isOn | boolean | 开关是否打开。true 表示打开，false 表示关闭。 |
| label | string | 开关旁的文本标签。 |

异常返回：

- componentId 无对应组件，或对应组件不是 Toggle 时，返回空对象 {}。
- 未传入 componentId 时，该 functionCall 失效。

详细说明见 [Toggle 组件私有函数](../extended-components/toggle.md#gettogglevalue)。

## getRadioValue

获取指定群组中当前选中的 Radio 组件的 value 属性值。返回类型：string。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| group | string | 是 | Radio 组件的群组名称，与 Radio 的 group 属性一致。 |

异常返回：

- group 中无选中项时，返回空字符串 ""。
- group 不存在时，返回空字符串 ""。
- 未传入 group 时，该 functionCall 失效。

详细说明见 [Radio 组件私有函数](../extended-components/radio.md#getradiovalue)。

## getSelectValue

获取 Select 组件的当前选中值。返回类型：string。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| componentId | string | 是 | 目标 Select 组件的 ID。 |

返回目标 Select 组件的选中项文本值。

异常返回：

- componentId 指向的 Select 组件无选中项时，返回空字符串 ""。
- componentId 无对应组件，或对应组件不是 Select 时，返回空字符串 ""。
- 未传入 componentId 时，该 functionCall 失效。

详细说明见 [Select 组件私有函数](../extended-components/select.md#getselectvalue)。

## getCheckboxGroupValues

获取指定群组中所有选中 Checkbox 的 value 文本值数组。返回类型：string[]。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| group | string | 是 | Checkbox 群组名称，与 Checkbox 的 group 属性一致。 |

函数遍历当前 Surface 上所有组件，匹配 group 相同且 select 为 true 的 Checkbox，收集其 value 文本。

异常返回：

- group 中无选中项时，返回空数组 []。
- group 不存在时，返回空数组 []。
- 未传入 group 时，该 functionCall 失效。

详细说明见 [CheckboxGroup 组件私有函数](../extended-components/checkbox-group.md#getcheckboxgroupvalues)。

## 使用示例

```json
{
  "id": "submitBtn",
  "component": "Button",
  "label": "提交",
  "action": {
    "event": {
      "name": "submitForm",
      "context": {
        "gender": { "call": "getRadioValue", "args": { "group": "genderRadio" }, "returnType": "string" },
        "city": { "call": "getSelectValue", "args": { "componentId": "citySelect" }, "returnType": "string" },
        "agreed": { "call": "getToggleValue", "args": { "componentId": "agreementToggle" }, "returnType": "object" },
        "interests": { "call": "getCheckboxGroupValues", "args": { "group": "interestsGroup" }, "returnType": "array" }
      }
    }
  }
}
```

---

↑ [返回函数总览](overview.md)
