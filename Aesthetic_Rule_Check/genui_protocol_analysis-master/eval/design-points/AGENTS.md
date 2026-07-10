# eval/design-points

单点亲和性设计评估目录。每个子目录对应协议的一个设计决策点。

## 约定

每个设计点子目录包含：

```
eval/design-points/<design-point>/
├── conclusion.md    # 评估结论 + MA 评分对比 + 失败模式分析 + 最终推荐方案（必须）
├── test-cases/      # 该设计点的测试用例 JSON（评估完成后保留）
└── reports/         # 评估报告（运行时自动生成，不纳入版本控制，.gitkeep 维持目录）
```

评估完成后，**conclusion.md（结论）和 test-cases/（输入数据）均保留**。test-cases 保留的意义：脚本可重跑、可调试、可作为新评估的参考。如需重新评估，参考 `eval/src/cli/eval-variable-system.ts` 的 4 阶段结构。

**评估结论必须写入 conclusion.md**，包括：候选方案、MA 评分对比、失败模式分析、最终推荐方案。

所有设计点评估结果总览见 [README.md](README.md)。

## 新增设计点

添加新设计点时：

1. 在此目录下创建新的子目录（如 `event-interaction/`）
2. 编写 `conclusion.md`，说明设计背景、候选方案
3. 在 `test-cases/` 中放置策略感知的测试用例 JSON（含 `shared_rules` + `strategy_rules`）
4. 在 `eval/src/cli/` 中新建评估入口脚本（参考 `eval-variable-system.ts` 的 4 阶段结构）
5. 在 `eval/src/config.ts` 中添加对应的加载函数
6. 在 `eval/package.json` 中添加 npm script
7. 运行评估，报告输出到 `reports/`（本地生成，不提交）
8. 在 `conclusion.md` 中补充评估结论（MA 分、推荐方案、失败模式）

## 评估完成后提交产物

| 产物 | 提交/不提交 | 说明 |
|------|-----------|------|
| `conclusion.md` | 提交 | 评估结论，唯一权威记录 |
| `test-cases/` | 提交 | 保留，脚本可重跑 |
| `reports/` | 不提交 | gitignore，运行时生成 |
| `eval/src/cli/eval-<name>.ts` | 提交 | 评估脚本 |
| `eval/src/config.ts` 加载函数 | 提交 | 脚本依赖 |
| `eval/package.json` npm script | 提交 | 入口注册 |

## 已有设计点

| 目录 | 设计点 | 优先级 | 状态 |
|------|--------|--------|------|
| `variable-system/` | **4.4.4 变量体系** — 整合评估（全局变量 + DataModel绝对/相对路径 + 列表模板 + 行为链 + 同名冲突） | P0 | 已完成 |
| `expression-function/` | 表达式与函数设计（包装方式、函数调用、运算符、内置函数） | P0/P2 | 已完成 |
| `event-chain/` | 事件链执行方式（handlerGroups vs flat-array） | — | 已完成，flat-array (condition) 胜出 |
| `expression-datatype/` | 表达式数据类型（typed/weak/strong） | P2 | 已完成，typed (三类型) 胜出 |
| `operator-scope/` | 表达式运算符范围（全量 vs 精简子集 vs 仅三元） | P2 | 已完成，推荐 full（全量运算符） |
| `expression-scope/` | 表达式使用范围约束（仅扩展组件、仅值位置） | P2 | 已完成，维持方案A |
| `function-call/` | 函数调用语法（bare vs $func vs ${func}） | P3 | 已完成，bare（当前设计）胜出 |
| `style-value-type/` | 样式值类型系统（mixed vs string-all vs structured） | P1 | 已完成，mixed (当前设计) 胜出 |
| `action-structure/` | 交互行为结构（flat-action vs handler-format vs event-context） | P1 | 已完成，flat-action (当前设计) 胜出 |
| `data-model-access/` | 数据模型访问语法（dot-path vs json-pointer） | P0 | 已完成，dot-path (A+ 91-92%) 胜出 |
| `conditional-rendering/` | 条件渲染设计（Extended.If vs visibility vs Extended.Switch） | P0 | 已完成，Extended.If（当前设计）胜出 |
| `component-naming/` | 组件命名：是否需要 Extended 前缀 | P0 | 已完成，推荐 unified-name + catalog 隔离 |
| `json-pointer-ref/` | 表达式 JSON Pointer 变量引用 `${/path}` vs `$__DataModel.xxx` | P2 | 已完成，两方案完全一致 A+ 92.5% |
| `responsive-breakpoint/` | 响应式断点表达方式 | P1 | 已完成，两方案亲和性一致 |
| `color-gradient-property/` | 渐变颜色属性组织方式 | P1 | 已完成，A 综合最优 |
| `select-component/` | Select组件设计（option结构+选中模型） | P1 | 已完成，index-based (A+ 93.2%) 胜出 |
| `template-interpolation/` | 模板字符串求值语法：`$var` + `${expr}` | P1 | 已完成，GLM A+ 93.2% / DS A+ 95.7% |
| `button-action/` | Button action 属性 | P1 | 已完成 |
| `interaction-restructure/` | 交互协议结构优化 | P0 | 已完成 |
| `interaction-function-wrapper/` | 交互函数统一建模 | P0 | 已完成 |
