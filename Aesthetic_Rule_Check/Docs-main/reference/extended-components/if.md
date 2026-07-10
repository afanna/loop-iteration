# If 组件

If 是条件渲染组件，根据 condition 表达式求值结果动态渲染不同分支的子组件。If 为虚拟节点，不产生原生 UI 节点，不支持样式、事件和[通用属性](overview.md)中的 accessibility。

分支挂载遵循组件树关系：如果某个组件的父组件位于 childrenIf 分支，而该组件自身位于 childrenElse 分支，condition 为 true 时父组件被挂载，父子组件都会显示；condition 为 false 时父组件不挂载，该组件也不会单独显示。

## 属性

| 属性 | 说明 |
|------|------|
| [condition](#condition) | 条件表达式 |
| [childrenIf](#childrenif) | 条件为 true 时渲染的子组件 ID 列表 |
| [childrenElse](#childrenelse) | 条件为 false 时渲染的子组件 ID 列表 |

### condition

条件表达式，求值结果决定渲染哪个分支。表达式使用 {{ }} 语法包裹。

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| condition | [Expression](../types.md#expression) | 是 | 条件表达式。求值为 true 时渲染 childrenIf，求值为 false 时渲染 childrenElse。非布尔类型按 JS falsy 规则强制转换：0、空字符串、null、undefined、NaN → false，其余 → true。 |

condition 支持引用以下变量：

| 变量 | 说明 |
|------|------|
| [$__widthBreakpoint](../../concepts/variable-system.md#①-全局系统变量) | 当前窗口断点，值为 xs / sm / md / lg / xl |
| [$__colorMode](../../concepts/variable-system.md#①-全局系统变量) | 当前颜色模式，值为 light / dark |
| [$__dataModel.*](../../concepts/variable-system.md#②-datamodel-变量) | DataModel 数据路径，如 $__dataModel.user.isAdmin |

**示例DSL：**

静态布尔值条件：

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "if_surface",
    "components": [
      {
        "component": "If",
        "id": "myIf",
        "condition": "{{ true }}",
        "childrenIf": ["helloText"],
        "childrenElse": ["emptyText"]
      },
      {
        "component": "Text",
        "id": "helloText",
        "content": "条件成立"
      },
      {
        "component": "Text",
        "id": "emptyText",
        "content": "条件不成立"
      }
    ]
  }
}
```

引用全局变量实现响应式布局切换：

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "if_surface",
    "components": [
      {
        "component": "If",
        "id": "responsiveLayout",
        "condition": "{{ $__widthBreakpoint == 'sm' }}",
        "childrenIf": ["singleColumn"],
        "childrenElse": ["doubleColumn"]
      },
      {
        "component": "Column",
        "id": "singleColumn",
        "children": ["item1"]
      },
      {
        "component": "Row",
        "id": "doubleColumn",
        "children": ["item1"]
      },
      {
        "component": "Text",
        "id": "item1",
        "content": "内容"
      }
    ]
  }
}
```

---

### childrenIf

条件为 true 时渲染的子组件 ID 列表。

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| childrenIf | string[] | 否 | condition 求值为 true 时挂载到父组件原生节点树的子组件 ID 列表。<br/> 取值范围：List[String]，每个字符串为同一 components 数组中的组件 id。<br/> 默认值：[]。未设置或为空时不挂载任何子组件。 |

---

### childrenElse

条件为 false 时渲染的子组件 ID 列表。

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| childrenElse | string[] | 否 | condition 求值为 false 时挂载到父组件原生节点树的子组件 ID 列表。<br/> 取值范围：List[String]，每个字符串为同一 components 数组中的组件 id。<br/> 默认值：[]。未设置或为空时不挂载任何子组件。 |

**示例DSL：**

未声明 childrenElse 表示条件为 false 时不渲染任何内容：

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "if_surface",
    "components": [
      {
        "component": "If",
        "id": "showAdmin",
        "condition": "{{ $__dataModel.user.isAdmin }}",
        "childrenIf": ["adminPanel"]
      },
      {
        "component": "Text",
        "id": "adminPanel",
        "content": "管理员面板"
      }
    ]
  }
}
```

---

## 异常处理策略

| 场景 | 示例场景 | 预期行为 | DFX 处理策略 |
|------|----------|---------|--------------|
| condition 缺失 | 仅声明 component: "If"，未配置 condition | 默认挂载 childrenElse 分支 | 通过 [onError](../API/surface-controller.md#errorcallback) 上报 ERROR_SCHEMA_WARNING（2001），warnings[i].code 为 ERROR_CODE_REQUIRED_MISS。 |
| condition 类型不支持 | condition 被配置为布尔值、对象或数组 | 默认挂载 childrenElse 分支 | 通过 [onError](../API/surface-controller.md#errorcallback) 上报 ERROR_SCHEMA_WARNING（2001），warnings[i].code 为 ERROR_CODE_TYPE_MISMATCH。 |
| condition 为空字符串 | condition 被配置为 "" | 默认挂载 childrenElse 分支 | 通过 [onError](../API/surface-controller.md#errorcallback) 上报 ERROR_SCHEMA_WARNING（2001），warnings[i].code 为 ERROR_CODE_INVALID_VALUE。 |
| condition 首次求值失败 | 首屏渲染时 {{ $__dataModel.user.isAdmin }} 中 user 尚未注入，或表达式结果为 undefined | 默认挂载 childrenElse 分支 | 通过 [onError](../API/surface-controller.md#errorcallback) 上报 ERROR_SCHEMA_WARNING（2001），warnings[i].code 为 ERROR_CODE_INVALID_VALUE。 |
| condition 切换时求值失败 | 已显示 childrenIf 后，后续一次数据刷新导致表达式结果为 undefined | 默认挂载 childrenElse 分支 | 通过 [onError](../API/surface-controller.md#errorcallback) 上报 ERROR_SCHEMA_WARNING（2001），warnings[i].code 为 ERROR_CODE_INVALID_VALUE。 |
| condition 求值为 falsy 非布尔值 | condition 返回 0、空字符串、null 或 NaN，如 {{ '' }} | 按 JS falsy 规则转为 false，挂载 childrenElse | 通过 [onError](../API/surface-controller.md#errorcallback) 上报 ERROR_SCHEMA_WARNING（2001），warnings[i].code 为 ERROR_CODE_INVALID_VALUE。 |
| childrenIf / childrenElse 不是数组 | childrenIf 被配置为 "adminPanel" | 该分支子组件列表回退为空数组 | 通过 [onError](../API/surface-controller.md#errorcallback) 上报 ERROR_SCHEMA_WARNING（2001），warnings[i].code 为 ERROR_CODE_TYPE_MISMATCH。 |
| childrenIf / childrenElse 包含非字符串元素 | childrenIf 为 ["title", 42, "footer"] | 跳过非字符串元素，继续挂载其他合法 ID | 通过 [onError](../API/surface-controller.md#errorcallback) 上报 ERROR_SCHEMA_WARNING（2001），warnings[i].code 为 ERROR_CODE_TYPE_MISMATCH。 |
| 子组件 ID 不存在 | childrenIf 中包含 "adminPanel"，但 components 中没有该 id | 跳过该 ID，继续挂载其他可用子组件 | 通过 [onError](../API/surface-controller.md#errorcallback) 上报 ERROR_SCHEMA_WARNING（2001），warnings[i].code 为 ERROR_CODE_UNDEFINED_FIELD。 |

错误码和错误回调的完整说明见 [错误码参考](../errors.md)、[onError](../API/surface-controller.md#errorcallback) 和 [Schema 校验](../schema-validation.md)。

---

## 组件Schema

```json
{
  "type": "object",
  "allOf": [
    {
      "type": "object",
      "properties": {
        "component": {
          "const": "If",
          "description": "Component type. Must be \"If\"."
        },
        "id": {
          "type": "string",
          "description": "Unique component identifier within the surface. If missing or invalid, the component item is discarded."
        },
        "condition": {
          "description": "Condition expression. When true, renders childrenIf; when false, renders childrenElse. Must be an expression wrapped in {{...}}. If missing, has an unsupported type, is an empty string, or fails to evaluate, childrenElse is rendered by default. Missing values report SCHEMA_WARNING, unsupported types report SCHEMA_WARNING, and empty strings or evaluation failures report SCHEMA_WARNING.",
          "$ref": "#/$defs/Expression"
        },
        "childrenIf": {
          "description": "Array of child component IDs to render when condition evaluates to true. If missing, defaults to an empty array. If not an array, this branch falls back to an empty array and reports SCHEMA_WARNING. Non-string items are skipped with SCHEMA_WARNING. Child IDs that do not exist in components are skipped with SCHEMA_WARNING.",
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "childrenElse": {
          "description": "Array of child component IDs to render when condition evaluates to false. If missing, defaults to an empty array. If not an array, this branch falls back to an empty array and reports SCHEMA_WARNING. Non-string items are skipped with SCHEMA_WARNING. Child IDs that do not exist in components are skipped with SCHEMA_WARNING.",
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      },
      "required": [
        "component",
        "id",
        "condition"
      ]
    }
  ],
  "unevaluatedProperties": false
}
```

---

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
