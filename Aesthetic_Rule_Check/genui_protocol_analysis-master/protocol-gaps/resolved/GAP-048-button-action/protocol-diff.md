# GAP-048 协议修改

## 修改 1: §3.2 扩展组件 Button 属性表 — 新增 action 属性

- 位置: specification/harmonyos-a2ui-protocol.md 约第 858-859 行
- 修改前:
```
| Button | 交互组件 | 按钮组件，响应用户点击操作，常用于触发事件。 | label | string | 按钮中的文本 |
| | | | enabled | boolean | 按钮是否可点击 |
```
- 修改后:
```
| Button | 交互组件 | 按钮组件，响应用户点击操作，常用于触发事件。 | label | string | 按钮中的文本 |
| | | | enabled | boolean | 按钮是否可点击 |
| | | | action | object | 表单提交行为。支持两种格式：{ event: { name: string, context?: object } }（向服务端提交事件）或 { functionCall: { call: string, args?: object } }（调用本地函数）。action 优先级高于 listeners。仅 Button 组件支持此属性。 |
```
- 理由: 补充表单提交能力，与 A2UI 原生协议 Button.action 规格保持一致

## 修改 2: §3.4 交互扩展 — 新增 Button action 专项说明

- 位置: specification/harmonyos-a2ui-protocol.md 约第 502-548 行（§3.4 末尾、设计决策段之前）
- 修改前: §3.4 仅描述 listeners 机制
- 修改后: 在 listeners 描述之后、设计决策段之前，新增 Button action 专项段落：

```markdown
**Button 组件的 action 属性**

Button 组件除通用 `listeners` 外，还支持 `action` 属性用于表单提交场景。`action` 与 `listeners` 的职责划分：

- `action`：表单提交、函数调用（Button 特有）
- `listeners`：UI 反馈、导航、数据操作等通用交互

`action` 优先级高于 `listeners`。两者可以同时存在于同一个 Button 上。

```json
{
  "id": "submitBtn",
  "component": "Button",
  "label": "提交",
  "action": {
    "event": {
      "name": "submitForm",
      "context": {
        "email": "{{ $__DataModel.form.email }}"
      }
    }
  },
  "listeners": {
    "onClick": [
      {"call": "validate", "args": {"data": "{{ $__DataModel.form }}"}, "as": "validResult"},
      {"call": "showToast", "condition": "{{ $validResult == 0 }}", "args": {"message": "正在提交..."}}
    ]
  }
}
```
```

- 理由: 明确 action 与 listeners 的职责划分和使用方式

## 修改 3: §3.4 设计决策 — 更新结论

- 位置: specification/harmonyos-a2ui-protocol.md 约第 537-548 行
- 修改前: "扩展组件统一使用 `listeners`，不应保留或混合 `action` 字段。"
- 修改后: 在原有设计决策段末尾追加：

```markdown
**例外：Button 组件的 action 属性**

经亲和性验证（GAP-048, eval/design-points/button-action, A+ 95.5%），在明确职责划分的前提下（`action` = 表单提交，`listeners` = 通用交互），LLM 能正确区分两者，不产生混淆。验证数据：

- action-only 场景：5/5 通过（100%）
- listeners-only 场景：2/2 通过（100%）
- both 共存场景：4/4 通过（100%）
- 混淆测试：通过（未将表单提交误用 listeners，未将非表单交互误用 action）
- D4 学习曲线：0-shot 即 100%

因此，仅 Button 组件例外支持 `action` 属性，其他扩展组件仍统一使用 `listeners`。
```

- 理由: 用实际验证数据修正原有设计决策，明确 Button 是唯一例外

## 修改 4: 修改记录表 — 新增条目

- 位置: specification/harmonyos-a2ui-protocol.md 第 3 行之后（修改记录表首行）
- 新增:
```
| 2026-05-06 | GAP-048：Button 扩展组件新增 action 属性 — 表单提交能力，与 A2UI 原生协议保持一致；更新 §3.4 设计决策。commit `XXX` | §3.2, §3.4 |
```
- 理由: 按协议修改规范记录修改追溯
