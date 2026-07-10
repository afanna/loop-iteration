# GAP-043 Prompt 修改记录

## 修改 1: `protocol-harmonyos-extended.md` 变量引用表

**位置**: `eval/prompts/protocol-harmonyos-extended.md` → 变量引用

**修改前**:
```
- `$var` — 引用当前作用域变量
- `$handlerResult['handlerId']` — 前置 handler 返回值
```

**修改后**:
```
- `$var` — 引用当前作用域变量：as 绑定（`$validResult`）
- `$varName` — as 绑定局部变量（如 `$validResult`、`$userResult.data.valid`）
```

---

## 修改 2: `protocol-harmonyos-extended.md` 事件示例

**位置**: `eval/prompts/protocol-harmonyos-extended.md` → 事件交互系统

**修改前**:
```json
{
  "listeners": {
    "onClick": [
      {"id": "handler1", "call": "setDataModel", ...},
      {"id": "submit", "call": "sendToLLM",
       "condition": "{{ $handlerResult['handler1'].success == true }}", ...}
    ]
  }
}
```

**修改后**:
```json
{
  "listeners": {
    "onClick": [
      {"call": "setDataModel", "as": "result", ...},
      {"call": "sendToLLM",
       "condition": "{{ $result.success == true }}", ...}
    ]
  }
}
```

---

## 修改 3: `eval-variable-system.ts` System Rule 6

**位置**: `eval/src/cli/eval-variable-system.ts` → SYSTEM_RULES

**修改后**:
```
"6. 事件使用行为数组格式：listeners.eventName = [{call, as?, args?, condition?}]，
   按顺序执行。as绑定创建局部变量（如as:'vR'），后续行为通过$vR引用。"
```

---

## 修改 4: `eval-variable-system.ts` Rule 11-12

**新增**:
```
"11. 行为链中使用 as 绑定创建局部变量，后续行为通过 $变量名 引用。"
"12. 同名冲突时：as局部变量用$xxx，DataModel用$__DataModel.xxx显式区分。"
```
