# 扩展函数参考

> **Catalog**：鸿蒙扩展协议 Catalog（ohos.a2ui.extended.catalog）
>
> 扩展函数是鸿蒙扩展协议特有的函数，与 A2UI 内置函数互补。

## 函数列表（10 个）

### 获取组件值

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| [getRadioValue](../extended-components/radio.md#getradiovalue) | group: string | string | 获取指定群组中当前选中的 [Radio](../extended-components/radio.md) 的 value 值 |
| [getCheckboxGroupValues](../extended-components/checkbox-group.md#getcheckboxgroupvalues) | group: string | string[] | 获取指定群组中所有选中的 [CheckboxGroup](../extended-components/checkbox-group.md) 的 value 值数组 |
| [getToggleValue](../extended-components/toggle.md#gettogglevalue) | componentId: string | { isOn, label } | 获取指定 [Toggle](../extended-components/toggle.md) 的开关状态和标签 |
| [getSelectValue](../extended-components/select.md#getselectvalue) | componentId: string | string | 获取指定 [Select](../extended-components/select.md) 的当前选中值 |

### 数据操作

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| setDataModel | path, value | void | 设置 [DataModel](../../concepts/data-model-and-binding.md) 中指定路径的值 |
| setAttributes | id, attributes | void | 动态设置指定组件的属性 |

### 导航与滚动

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| navigate | url, params? | void | 导航到指定页面 |
| scrollTo | id, position | void | 滚动到指定位置 |

### 控制流

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| break | 无 | void | 中断当前 [EventHandler](../extended-components/overview.md#eventhandler-结构) 链的执行 |

### 通信

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| sendToAssistant | message | void | 向 [Agent](../../concepts/agent-deployment-models.md)/LLM 发送消息 |

## DSL 使用示例

### 获取组件值作为 Action 上下文

```json
{ "id": "submitBtn", "component": "Button",
  "label": "提交",
  "action": { "event": { "name": "submitForm", "context": {
    "gender": { "call": "getRadioValue", "args": { "group": "genderRadio" }, "returnType": "string" },
    "interests": { "call": "getCheckboxGroupValues", "args": { "group": "interestsGroup" }, "returnType": "array" },
    "agreed": { "call": "getToggleValue", "args": { "componentId": "agreementToggle" }, "returnType": "object" }
  }}}
}
```

### EventHandler 链

```json
{ "onClick": [
  { "call": "getSelectValue", "args": { "componentId": "citySelect" }, "as": "selectedCity" },
  { "call": "navigate", "args": { "url": "{{ '/city/' + $selectedCity }}" } }
]}
```

### 设置 DataModel

```json
{ "call": "setDataModel",
  "args": { "path": "/form/submitted", "value": true } }
```

---

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
