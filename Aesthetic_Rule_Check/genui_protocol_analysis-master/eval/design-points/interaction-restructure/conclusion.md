# 交互协议结构优化 — 亲和性 A/B 对比评估

## 设计点

评估扩展组件交互协议的结构变更：去除 `listeners` 包装层，事件名直接作为组件属性，`Handler` 改名 `Action`。

## 策略

| 策略 | 结构 | 说明 |
|------|------|------|
| `listeners-handler` | `listeners: { onClick: [{call, as?, args?, condition?}] }` | 当前协议结构 |
| `direct-action` | `onClick: [{call, as?, args?, condition?}]` | 提议的新结构 |

## 运行方式

```bash
cd eval
npm run eval:interaction-restructure
```

## 测试用例

文件: `test-cases/interaction-restructure.json`

约 20 个策略感知测试用例，覆盖：

1. **基础事件监听** — onClick 单行为、多行为链、onAppear
2. **条件执行** — condition 分支
3. **as 变量绑定** — validate + as + 后续引用
4. **多事件组件** — 同一组件 onClick + onChange
5. **Button action 共存** — action 表单提交 + onClick 通用交互
6. **复杂链式** — 长链、嵌套参数
7. **边界/异常** — break 跳出

## 评估结果

（运行后填写）
