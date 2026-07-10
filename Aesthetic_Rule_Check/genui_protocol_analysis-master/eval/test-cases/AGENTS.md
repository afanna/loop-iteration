# test-cases — 完整协议测试用例

## 文件说明

| 文件 | 分类 | 说明 |
|------|------|------|
| `expressions.json` | 表达式 | 动态表达式语法（模板字符串、三元运算符、函数调用等） |
| `events.json` | 事件 | 事件绑定与交互（onClick, onChange, action链等） |
| `layout.json` | 布局 | 布局组件（Column, Row, List, Grid等） |
| `components.json` | 组件 | 基础组件（Text, Button, TextInput, Toggle等） |
| `mixed.json` | 混合 | 综合场景（多组件组合、复杂交互） |
| `conflict-resolution.json` | 冲突解决 | 变量名冲突、作用域边界场景 |

## 用例格式

```json
{
  "id": "EXPR001",
  "name": "用例名称",
  "task_description": "描述LLM需要生成的UI组件和功能",
  "category": "expressions",
  "complexity": "simple|medium|complex",
  "expected_output": {
    "component": "Text",
    "required_fields": ["component", "content"],
    "patterns": [{"field": "content", "must_contain": "变量引用"}]
  },
  "requirements": [
    {"type": "field_is_expr", "field": "content", "description": "content使用expr格式"}
  ]
}
```

## 用法

由 `eval/src/cli/index.ts` 加载运行。运行命令：
```bash
cd eval && npm run eval
```
