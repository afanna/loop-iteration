# Modal 组件

模态框组件。用户点击 [trigger](#trigger) 所引用的组件（通常为 [Button](./button.md)）后，弹出 [content](#content) 所引用的组件内容。Modal 常用于确认操作、信息提示、表单填写等场景，弹框会遮挡页面其余内容，引导用户完成当前操作。

**起始版本：**  API Version 20

## 特有属性

除支持[通用属性](overview.md)，还支持以下特有属性：

| 属性 | 说明 |
|------|------|
| [trigger](#trigger) | 触发弹框的组件 ID |
| [content](#content) | 弹框内容组件 ID |

### trigger

触发弹框的组件 ID。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| trigger | string | 是 | 用于打开弹框的组件 ID。所引用的组件（通常为 [Button](./button.md)）必须与 Modal 组件处于同一个 surfaceId 的组件树中（即通过同一条 [updateComponents](../messages.md#updatecomponents) 消息声明，属于同一个 [Surface](../messages.md#createsurface)）。触发组件需配置 [action](./button.md#action) 事件且事件名（name）为 "modal.trigger"，点击后才会打开弹框。 |

**示例DSL：**

使用 [Button](./button.md) 组件作为触发器。按钮的 action 事件名需设置为 "modal.trigger"，点击后即可打开弹框。

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "modal_surface",
    "components": [
      {
        "component": "Button",
        "id": "delete-btn",
        "child": "delete-btn-text",
        "action": {
          "event": {
            "name": "modal.trigger"
          }
        }
      },
      {
        "component": "Text",
        "id": "delete-btn-text",
        "text": "删除"
      },
      {
        "component": "Text",
        "id": "confirm-dialog",
        "text": "确认删除该项目吗？"
      },
      {
        "component": "Modal",
        "id": "confirm-modal",
        "trigger": "delete-btn",
        "content": "confirm-dialog"
      }
    ]
  }
}
```

---

### content

弹框内容组件 ID。

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 弹框中展示的组件 ID。所引用的组件（如 [Text](./text.md)、[Card](./card.md) 等）必须与 Modal 组件处于同一个 surfaceId 的组件树中（即通过同一条 [updateComponents](../messages.md#updatecomponents) 消息声明，属于同一个 [Surface](../messages.md#createsurface)）。 |

**示例DSL一：**

使用简单 [Text](./text.md) 组件作为弹框内容。

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "modal_surface",
    "components": [
      {
        "component": "Button",
        "id": "info-btn",
        "child": "info-btn-text",
        "action": {
          "event": {
            "name": "modal.trigger"
          }
        }
      },
      {
        "component": "Text",
        "id": "info-btn-text",
        "text": "查看详情"
      },
      {
        "component": "Text",
        "id": "info-content",
        "text": "这是一段详细信息。"
      },
      {
        "component": "Modal",
        "id": "info-modal",
        "trigger": "info-btn",
        "content": "info-content"
      }
    ]
  }
}
```

**示例DSL二：**

使用 [Card](./card.md) + [Column](./column.md) + [Row](./row.md) 组合构建带操作按钮的确认弹框。点击「确认」上报服务器事件，点击「取消」通过 "modal.dismiss" 关闭弹框。详情请参阅 [用户交互处理](../../guides/handling-user-interactions.md)。

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "modal_surface",
    "components": [
      {
        "component": "Button",
        "id": "submit-btn",
        "child": "submit-btn-text",
        "variant": "primary",
        "action": {
          "event": {
            "name": "modal.trigger"
          }
        }
      },
      {
        "component": "Text",
        "id": "submit-btn-text",
        "text": "提交"
      },
      {
        "component": "Modal",
        "id": "submit-modal",
        "trigger": "submit-btn",
        "content": "modal-card"
      },
      {
        "component": "Card",
        "id": "modal-card",
        "child": "modal-content"
      },
      {
        "component": "Column",
        "id": "modal-content",
        "children": ["modal-title", "modal-desc", "modal-actions"],
        "justify": "start",
        "align": "center"
      },
      {
        "component": "Text",
        "id": "modal-title",
        "text": "确认提交"
      },
      {
        "component": "Text",
        "id": "modal-desc",
        "text": "提交后将无法撤回，请确认信息无误。"
      },
      {
        "component": "Row",
        "id": "modal-actions",
        "children": ["cancel-btn", "confirm-btn"],
        "justify": "spaceEvenly"
      },
      {
        "component": "Button",
        "id": "cancel-btn",
        "child": "cancel-btn-text",
        "variant": "borderless",
        "action": {
          "event": {
            "name": "modal.dismiss"
          }
        }
      },
      {
        "component": "Text",
        "id": "cancel-btn-text",
        "text": "取消"
      },
      {
        "component": "Button",
        "id": "confirm-btn",
        "child": "confirm-btn-text",
        "variant": "primary",
        "action": {
          "event": {
            "name": "submit.confirm",
            "context": {
              "action": "submit"
            }
          }
        }
      },
      {
        "component": "Text",
        "id": "confirm-btn-text",
        "text": "确认"
      }
    ]
  }
}
```

**示例DSL三：**

弹框内容中包含 [TextField](./textfield.md) 输入框，用户填写后点击提交按钮上报数据。

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "modal_surface",
    "components": [
      {
        "component": "Button",
        "id": "feedback-btn",
        "child": "feedback-btn-text",
        "action": {
          "event": {
            "name": "modal.trigger"
          }
        }
      },
      {
        "component": "Text",
        "id": "feedback-btn-text",
        "text": "意见反馈"
      },
      {
        "component": "Modal",
        "id": "feedback-modal",
        "trigger": "feedback-btn",
        "content": "feedback-card"
      },
      {
        "component": "Card",
        "id": "feedback-card",
        "child": "feedback-content"
      },
      {
        "component": "Column",
        "id": "feedback-content",
        "children": ["feedback-title", "feedback-input", "feedback-actions"],
        "justify": "start",
        "align": "center"
      },
      {
        "component": "Text",
        "id": "feedback-title",
        "text": "请输入您的反馈"
      },
      {
        "component": "TextField",
        "id": "feedback-input",
        "value": {
          "path": "/feedback/text"
        },
        "placeholder": "请描述您的建议或问题"
      },
      {
        "component": "Row",
        "id": "feedback-actions",
        "children": ["feedback-cancel-btn", "feedback-submit-btn"],
        "justify": "spaceEvenly"
      },
      {
        "component": "Button",
        "id": "feedback-cancel-btn",
        "child": "feedback-cancel-text",
        "variant": "borderless",
        "action": {
          "event": {
            "name": "modal.dismiss"
          }
        }
      },
      {
        "component": "Text",
        "id": "feedback-cancel-text",
        "text": "取消"
      },
      {
        "component": "Button",
        "id": "feedback-submit-btn",
        "child": "feedback-submit-text",
        "variant": "primary",
        "action": {
          "event": {
            "name": "feedback.submit",
            "context": {
              "text": {
                "path": "/feedback/text"
              }
            }
          }
        }
      },
      {
        "component": "Text",
        "id": "feedback-submit-text",
        "text": "提交反馈"
      }
    ]
  }
}
```

---

## DFX 说明

当宿主通过 [registerErrorCallback](../API/surface-controller.md#registererrorcallback) 注册错误回调时，Modal 的弹窗配置异常会通过 [onError](../API/surface-controller.md#errorcallback) 上报。

| 场景 | code值 | warning code | error message | 运行时处理 |
|------|--------|--------------|---------------|------------|
| Modal.trigger 引用不存在 | 2001 | ERROR_CODE_INVALID_VALUE | Property trigger references undefined component, drop current Modal component | 丢弃该 Modal 组件 |
| Modal.content 引用不存在 | 2001 | ERROR_CODE_INVALID_VALUE | Property content references undefined component, drop current Modal component | 丢弃该 Modal 组件 |

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
          "const": "Modal"
        },
        "trigger": {
          "$ref": "../common_types.json#/$defs/ComponentId",
          "description": "The ID of the component that opens the modal when interacted with (e.g., a button). Do NOT define the component inline."
        },
        "content": {
          "$ref": "../common_types.json#/$defs/ComponentId",
          "description": "The ID of the component to be displayed inside the modal. Do NOT define the component inline."
        }
      },
      "required": [
        "component",
        "trigger",
        "content"
      ]
    }
  ],
  "unevaluatedProperties": false
}
```

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
