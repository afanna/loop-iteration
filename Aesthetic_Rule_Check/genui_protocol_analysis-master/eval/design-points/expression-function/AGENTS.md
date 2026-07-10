# expression-function — 表达式与函数设计亲和性分析

## 设计描述

对比 A2UI v0.9 和鸿蒙A2UI协议在表达式语法、函数调用、数据绑定方式上的设计差异，通过量化评估确定模型最亲和的方案。

核心设计决策点：
1. ~~表达式包装方式（结构化 vs 字符串）~~ → **已决策：inline `{{ }}`**
2. 函数调用语法（JSON对象 vs 行内语法）
3. 逻辑运算方式（函数 vs 运算符）
4. 内置函数集合规模
5. ~~字符串格式化方式~~ → **已决策：两者共存（template-literal 为主、format 为辅）**

## P0 决策结论

**表达式包装方式：inline `{{ }}`**

量化评估结果（GLM-5.1 + DeepSeek-V3，20 用例）：
- inline MA: 94.5% / 94.5% vs wrapped MA: 93.9% / 94.5% — 无显著差异
- 推荐 inline：客户端实现更简洁统一（string 单类型 + `{{ }}` 定界符），无类型歧义

报告：`reports/expr-wrap-comparison-2026-04-15T11-22-56.*`

## P2 #14 决策结论

**字符串格式化方式：两者共存（template-literal 为主、format 为辅）**

量化评估结果（GLM-5.1 + DeepSeek-V3，20 用例）：
- format MA: 93.9% / 94.5% | template-literal MA: 94.5% / 94.5% | coexist MA: 91.0% / 91.7%
- format 和 template-literal 无显著差异（平均 94.2% vs 94.5%），coexist 有所下降但仍为 A+ 等级
- 推荐共存：实际协议需要两种方式配合使用，D2/D5 下降仅影响极端复杂场景

报告：`reports/builtin-func-comparison-2026-04-16T16-17-54.*`（GLM）, `reports/builtin-func-comparison-2026-04-16T17-12-34.*`（DeepSeek）

## 状态

P0 已完成。P2 #14 已完成。待推进 P1 及其余 P2/P3 量化验证。
