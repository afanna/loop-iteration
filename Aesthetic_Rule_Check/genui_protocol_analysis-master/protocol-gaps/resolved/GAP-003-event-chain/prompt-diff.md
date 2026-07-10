# GAP-003 Prompt 修改

> ⚠️ 状态: 评估完成，推荐修改，待实际执行。

## 修改: eval/prompts/protocol-v2-summary.md

### 交互事件部分

**修改前**（handlerGroups 描述）:
```
事件监听使用 listeners 字段，结构为：
{
  "listeners": {
    "onClick": {
      "handlerGroups": [{
        "condition": "表达式（可选）",
        "handlers": [{ "id": "...", "call": "...", "args": {...} }]
      }]
    }
  }
}
```

**修改后**（flat-array 描述）:
```
事件监听使用 listeners 字段，结构为：
{
  "listeners": {
    "onClick": [
      { "id": "...", "call": "...", "args": {...}, "condition": "表达式（可选）" }
    ]
  }
}
行为按数组顺序执行。condition 字段可选：为真时执行该行为，为假时跳过。
```

### 新增规则

在 System Prompt 的"重要规则"中新增：
```
规则 N: 事件监听 listeners 的事件值是一个行为数组（不是对象）。每个行为按顺序执行。
规则 N+1: 行为的 condition 字段为可选。condition 为真时执行该行为，为假时跳过。无 condition 时默认执行。
规则 N+2: 条件分支通过多个带不同 condition 的行为实现，无需 handlerGroups 嵌套。
```

## Few-shot 修改

在 `eval/src/prompt/few-shot-examples.ts` 中：

**修改现有事件示例**（如果有）：
- 将 handlerGroups 嵌套结构改为扁平数组

**新增示例**（建议）：
- 一个带两个条件分支的 onClick 示例（如：校验成功 → 提交，校验失败 → 提示错误）
- 展示多个 action 按顺序排列，通过 condition 控制分支
