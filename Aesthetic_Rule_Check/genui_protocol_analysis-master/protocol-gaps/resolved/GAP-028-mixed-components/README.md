# GAP-028: 原生+扩展组件混用场景未测试

## 问题描述

协议 3.1 节明确："扩展的样式属性、交互能力以及表达式均只在扩展组件上提供，A2UI 原生组件上不支持上述扩展的能力。"

但以下混用场景在 98 个全量测试用例中没有覆盖：

1. **原生 Column 包含 Extended.Text** — Extended.Text 的 styles 和表达式在原生 Column 的 children 中是否正常？
2. **Extended.Column 包含原生 Text** — 原生 Text 放在扩展容器的 children 中，行为是否一致？
3. **原生 Button 错误使用 listeners** — LLM 是否会在原生 Button 上错误地添加 listeners？
4. **Extended.Button 错误使用 action** — LLM 是否会在扩展组件上错误地使用原生 action 而非 listeners？

## 影响范围

- 协议章节: 3.1（扩展原则）、2.2（A2UI 组件）、3.2（扩展组件）
- 测试分类: FP-01 (component), FP-02 (layout)，需新增

## 候选修复方案

**这不是协议缺陷，是测试覆盖缺口。**

需要新增约 4-6 个混用测试用例，验证：
1. LLM 能正确区分原生和扩展组件的能力边界
2. LLM 不会在原生组件上使用扩展专属字段（listeners, styles, expressions）
3. 混合使用时组件树结构正确

## 验证计划

**类型**: 测试覆盖补充 — 基线验证

1. 编写混用测试用例，放入 `eval/test-cases/full-protocol/` 对应分类
2. 运行 `npm run eval`
3. 记录基线通过率
4. 如果通过率低 → 分析是否需要 prompt 引导（如新增规则"原生组件不使用 listeners"）

## 评估报告

待验证

## 最终结论

待验证
