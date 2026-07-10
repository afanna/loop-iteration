# 鸿蒙 A2UI 协议 — 整体模型亲和性量化评估

## 1. 评估说明

对设计完成的鸿蒙 A2UI 扩展协议进行端到端的模型亲和性整体量化评估，判断协议是否达到生产可用标准（MA >= 80，即 A 级）。

### 1.1 完整协议评估（6 维度）

完整协议评估使用 6 维度评分体系：

| 维度 | 权重 | 含义 |
|------|------|------|
| D1 语法准确率 | 20% | L1 JSON 解析 + L2 结构正确率 |
| D2 语义准确率 | 25% | L3 模式匹配 + L4 规则通过率 |
| D3 生成效率 | 15% | 首次成功率 + 重试成本 |
| D4 学习曲线 | 15% | 0/1/3-shot 准确率 |
| D5 边界鲁棒性 | 15% | medium/complex 用例通过率 |
| D6 一致稳定性 | 10% | 多次生成的结构/语义一致性 |

综合分 MA = D1·0.20 + D2·0.25 + D3·0.15 + D4·0.15 + D5·0.15 + D6·0.10

评分等级：A+ (≥90) → A (≥80) → B (≥70) → C (≥60) → D (<60)

### 1.2 基础评估（5 维度，旧版）

> 保留用于参考，新评估请使用 6 维度完整协议评估。

---

## 2. 测试用例

### 2.1 完整协议测试用例（6 维度评估用）

位于 `test-cases/full-protocol/` 目录，共 98 个测试用例，覆盖 8 个功能分类：

| 文件 | 分类 | 用例数 | 覆盖范围 |
|------|------|--------|----------|
| `FP-01-components.json` | component | 14 | Text/Button/TextInput/Image/Toggle/Select/Radio/Checkbox/Slider/Progress/Divider |
| `FP-02-layout.json` | layout | 14 | Row/Column/Stack/Grid/Tabs/Navigation/List 布局+嵌套 |
| `FP-03-styles.json` | style | 12 | styles 对象+排版+颜色+布局+单位+自适应 |
| `FP-04-expressions.json` | expression | 14 | 变量引用+运算符+三元+数组索引+$item/$index |
| `FP-05-events.json` | event | 12 | handlerGroups+condition+6 种 action+事件类型 |
| `FP-06-conditional-list.json` | conditional-list | 12 | Extended.If+List 模板+$index/$item+嵌套 If |
| `FP-07-responsive.json` | responsive | 10 | $__WindowWidthBreakpoint+响应式样式/布局 |
| `FP-08-integration.json` | integration | 10 | 多特性组合：表单+列表页+设置页+Dashboard+Tab 视图 |

复杂度分布：simple 26 / medium 50 / complex 22

### 2.2 基础测试用例（旧版）

位于 `test-cases/` 目录（非 full-protocol 子目录），共 36 个测试用例。

### 输出

评估完成后在 `reports/` 目录生成：
- JSON 格式详细报告（含 6 维度评分、分类汇总、逐用例结果）
- Markdown 格式汇总报告

---

## 3. 如何运行

### 环境准备

```bash
cd eval
npm install
```

确保 `eval/.env` 中配置了 API Key：
```
GLM_API_KEY=xxx
DEEPSEEK_API_KEY=xxx
```

### 完整协议评估（推荐）

```bash
cd eval

# 全部模型
npm run eval:full-protocol

# 仅运行特定模型
ONLY_MODEL=deepseek npm run eval:full-protocol

# 自定义报告目录
REPORTS_DIR=/path/to/reports npm run eval:full-protocol
```

报告输出到 `eval/reports/`。

### 基础评估（旧版）

```bash
cd eval
npm run eval
```

### 评分等级

A+ (≥90) → A (≥80) → B (≥70) → C (≥60) → D (<60)

Grade A 或以上表示协议的模型亲和性达到生产可用标准。

---

## 4. 已有评估报告

| 报告 | 日期 | 说明 |
|------|------|------|
| `reports/comparison-2026-04-14T08-09-00.json` | 2026-04-14 | 冲突解决对比实验 |
