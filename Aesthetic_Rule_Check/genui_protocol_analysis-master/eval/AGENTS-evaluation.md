# affinity-evaluation (now in eval/)

鸿蒙智能体UI协议v2.0 的整体模型亲和性量化评估。

## 目的

协议设计完成后，使用完整的测试用例集进行端到端评估，判断协议是否达到生产可用标准（MA >= 80，A级）。

## 目录结构

- `test-cases/` — 完整协议的测试用例，按分类组织
  - `expressions.json` — 表达式语法
  - `events.json` — 事件绑定与交互
  - `layout.json` — 布局组件
  - `components.json` — 基础组件
  - `mixed.json` — 综合场景
  - `conflict-resolution.json` — 冲突处理
- `reports/` — 评估报告

## 运行方式

```bash
cd eval
npm run eval            # 运行完整协议评估
npm run eval:comparison # 运行冲突解决对比实验
```

报告输出到此目录的 `reports/`。

## 测试用例格式

基础格式（非策略感知）：
```json
{
  "id": "EXPR001",
  "name": "用例名称",
  "task_description": "描述LLM需要生成的UI组件",
  "category": "expressions",
  "complexity": "simple",
  "expected_output": { "component": "Text", "required_fields": [...] },
  "requirements": [...]
}
```
