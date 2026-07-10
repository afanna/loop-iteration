# select-component — Select 组件模型亲和性设计

## 设计决策

评估 `Extended.Select` 的 3 种候选设计方案的 LLM 亲和性：

1. **label+value** — Web HTML 对齐，`{label, value}` 选项对 + DataModel 绑定
2. **value-only** — 当前设计的 web 化修正，value 既是显示也是提交值
3. **selected-index** — 当前协议 4.1.2 设计，索引式静态选中

## 测试用例

- `test-cases/select-component.json` — 25 例，覆盖 basic/form/dynamic/label-value-separation/multimodal/complex-layout 场景

测试用例使用策略感知格式：`shared_rules`（结构校验）+ `strategy_rules`（按策略区分的字段校验）。

## 运行

```bash
cd eval
npm run eval:select-component
```

## 评估结论

**推荐 index-based（当前协议设计）**：DeepSeek MA 93.2% (A+)，远超 A+ 门槛 (90%)。0-shot 达 100%。

**label+value (Web HTML 对齐) 不适合 JSON 协议上下文**：MA 67.1% (C)，LLM 不知道 `label` 字段约定。

**value-only 为强备选**：MA 86.8% (A)，结构最简，但无法表达"显示≠提交"。

## 已有评估报告

| 报告文件 | 内容 |
|---------|------|
| `select-comparison-2026-04-29T02-52-08.*` | v1 初版 DeepSeek 三策略对比 (70.6% B) |
| `select-comparison-2026-04-29T04-15-27.*` | v2 优化版 DeepSeek 三策略对比 (95.5% A+) |
