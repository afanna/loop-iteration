# 亲和性设计评估总览

基于鸿蒙 A2UI 协议设计的各章节，梳理出所有可独立进行量化模型亲和性评估的设计决策点。
- [亲和性设计评估总览](#亲和性设计评估总览)
  - [设计点总览](#设计点总览)
  - [MA 范围说明](#ma-范围说明)
  - [主要失败模式汇总](#主要失败模式汇总)
  - [待评估的设计点](#待评估的设计点)
    - [P0 — 核心设计决策](#p0--核心设计决策)
    - [P1 — 重要设计细节](#p1--重要设计细节)
    - [P2 — 表达式设计](#p2--表达式设计)
    - [P3 — 变量引用设计](#p3--变量引用设计)
  - [统计](#统计)
  - [关键发现](#关键发现)
  - [评估流程](#评估流程)

## 设计点总览

| #   | 设计点                                 | 协议章节    | MA 范围（胜出方案）         | V2 一致  | 主要失败模式                                                    | 详细报告                                        |
| --- | ----------------------------------- | ------- | ------------------- | ------ | --------------------------------------------------------- | ------------------------------------------- |
| ~~1~~ | ~~变量引用方式~~ → 合并至 #24 | 3.5/4.4 | — | — | — | — |
| 2   | 表达式包装方式 `{{ }}` vs `{"expr":}`      | 3.5     | A+ 90-91%           | 相同     | 无失败                                                       | [结论](expression-function/conclusion.md)     |
| 3   | 事件链执行方式 handlerGroups vs flat-array | 3.4     | A+ 91-93%           | **不同** | if/then/else 方案 GLM 复杂场景 JSON 解析失败                        | [结论](event-chain/conclusion.md)             |
| 4   | 组件命名：unified-name + catalog 隔离      | 3.1/3.2 | A+ 99.6% (unified)  | **不同** | GLM extended-prefix CN14 遗漏 Radio 组件（unified-name 通过）     | [结论](component-naming/conclusion.md)        |
| 5   | 样式属性组织方式                            | 3.3     | A+ 92%              | 相同     | 无失败                                                       | [结论](style-organization/conclusion.md)      |
| 6   | 条件渲染设计                              | 3.6.3   | **C 65%**           | 相同     | children ID 匹配失败；三元/If 组件边界混淆；Visibility/Switch 模型无法理解    | [结论](conditional-rendering/conclusion.md)   |
| 7   | 数据模型访问语法                            | 4.4.4   | A+ 91-92%           | **结论修正** | dot-path(表达式) + json-pointer(path属性) 互补共存，非互斥    | [结论](data-model-access/conclusion.md)       |
| ~~8~~ | ~~列表循环内置变量~~ → 合并至 #24 | 4.4.4 | — | — | — | — |
| 9   | 交互行为结构                              | 4.3.2   | A+ 92%              | 相同     | DeepSeek event-context AS12 输出截断（唯一的残留失败）                 | [结论](action-structure/conclusion.md)        |
| 10  | 样式值类型系统                             | 4.2     | A 87% / A+ 93%      | 相同     | 复杂样式属性遗漏                                                  | [结论](style-value-type/conclusion.md)        |
| 11  | 表达式数据类型                             | 4.4.2   | A 90% / A+ 93%      | 相同     | 无失败（D6 一致性差异）                                             | [结论](expression-datatype/conclusion.md)     |
| 12  | 表达式运算符范围                            | 4.4.3   | A 89% / A+ 91%      | 相同     | DeepSeek 避免 `!` 运算符，倾向交换三元分支                              | [结论](operator-scope/conclusion.md)          |
| 13  | 表达式使用范围约束                           | 3.5     | A 87% / B 76%       | 相同     | GLM 复杂场景 JSON 截断；DeepSeek 偶尔在 children 用表达式               | [结论](expression-scope/conclusion.md)        |
| 14  | 表达式内置函数                             | 4.4.5   | A 82% / A+ 92%      | 相同     | coexist 方案 D6 一致性低（GLM 13%），模型选择歧义                        | [结论](expression-function/conclusion.md)     |
| ~~15~~ | ~~三层变量模型~~ → 合并至 #24 | 4.4.4 | — | — | — | — |
| ~~16~~ | ~~`${var_name}` 与 `$var_name` 区别~~ → 被 #25 取代 | 4.4.4 | — | — | 变量引用 vs 模板语法的分离不清，被 template-interpolation 取代 | — |
| 17  | 函数调用 `$func()` 语法                   | 4.4.5   | A 89% / A+ 93%      | 相同     | interp 方案 0-shot 仅 25%（两个模型一致）                            | [结论](function-call/conclusion.md)           |
| 18  | 表达式 JSON Pointer 变量引用 `${/path}`    | 3.5     | A+ 92.5%            | 新增能力   | 无失败（两策略完全一致）                                              | [结论](json-pointer-ref/conclusion.md)        |
| ~~19~~ | ~~扩展事件交互 DataModel 表达式访问~~ → 合并至 #24 | 4.4.4 | — | — | — | — |
| ~~20~~ | ~~模板字符串变量引用语法 `${var}` vs `$var`~~ → 被 #25 取代 | 3.5 | — | — | 与 #16 重复，被 template-interpolation 取代 | — |
| 21  | 响应式断点表达方式                           | 3.6     | A+ 98.7% / A+ 97.7% | 相同     | 两方案亲和性一致（MA差异<1%），优化 few-shot 后全部通过                       | [结论](responsive-breakpoint/conclusion.md)   |
| 22  | 渐变颜色属性组织方式                          | 4.2     | A+ 95.3-97.1%       | 待定     | 旧版失败主要来自校验噪声；修正规则后 A/B/C 全部达到 A/A+，A 综合最优，C 一致性最佳         | [结论](color-gradient-property/conclusion.md) |
| 23  | Select组件设计（option结构+选中模型）           | 4.1.2   | A+ 93.2%            | 相同     | index-based A+ 93.2% (0-shot 100%)；label+value C 66.5%（LLM 不知 label 字段） | [结论](select-component/conclusion.md)        |
| **24** | **4.4.4 变量体系**（整合 #1+#8+#15+#19）  | 4.4.4   | **A+ 90.8%**          | 相同     | GLM A+ 92.1% 零失败；DeepSeek A 89.5%（2例属性名差异）；列表/as绑定/冲突 100% | [结论](variable-system/conclusion.md)         |
| 25  | 模板字符串求值语法 `$var` + `${expr}`        | 4.4.2, 4.4.5 | **A+ 95.7%/93.2%** | **新增** | `$var` 是变量唯一引用形式，`${expr}` 是模板内求值语法；策略 A (template-text) 双模型 A+, DS 95.7% | [结论](template-interpolation/conclusion.md)  |

## MA 范围说明

格式为 `GLM最低-DeepSeek最高` 或 `DeepSeek最低-DeepSeek最高`。MA 为胜出方案的综合分，格式：
- `A+ 93%` — DeepSeek 达到 A+
- `C 61%` — GLM 仅达 C 级
- `A+ 93% / C 61%` — DeepSeek A+ 但 GLM 仅 C

## 主要失败模式汇总

| 失败模式 | 涉及设计点 | 说明 |
|---------|----------|------|
| **GLM JSON 输出截断** | #1, #6, #13 | GLM-5.1 在 complex 用例中输出 token 超限，JSON 被截断无法解析。根因是模型输出能力而非协议设计问题。#4 和 #9 已通过提升 max_tokens 至 20480 解决 |
| **同名变量冲突** | #1, #15, #19 | as 绑定与数据模型变量同名时，模型难以同时引用新旧值。#19 评估表明 explicit-datamodel（`$__DataModel.xxx`）可消除歧义 |
| **children ID 匹配** | #1, #6 | children 为 ID 数组时，验证规则要求包含变量引用，与实际结构不符。测试用例设计问题 |
| **条件渲染语义** | #6 | 三元表达式场景混淆 Text/If 组件边界；Visibility/Switch 方案模型根本无法理解 |
| **外部模板引用** | #8 | 旧版评估 auto-bind 定义不准确已修正；实际 A2UI 协议使用 componentId 兄弟模板引用，LLM 可在 JSON 数组中表达 |
| **模型避免 `!` 运算符** | #12 | DeepSeek 倾向交换三元分支而非使用 `!`，是模型行为模式非协议问题 |
| **共存方案一致性** | #14 | coexist 方案中模型随机选择格式化方式，D6 语义等价率降至 13% |

## 待评估的设计点

**#24 变量体系 — 待评估。**

### P0 — 核心设计决策

- **#24 变量体系** — 整合 #1+#8+#15+#19，56 用例，待运行

### P1 — 重要设计细节

（全部完成）

### P2 — 表达式设计

（全部完成）

### P3 — 变量引用设计

（全部完成）

## 统计

- **已完成**: 23
- **待评估**: 0（P0: 0 / P1: 0 / P2: 0 / P3: 0）
- **与 V2 协议一致**: 18 / 23
- **建议调整**: 1（#3 事件链建议 flat-array）
- **MA ≥ A 级**: 22 / 23（仅 #6 在 GLM 上为 C 级）
- **MA ≥ A+ 级（DeepSeek）**: 19 / 23

当前共有 23 个设计点，已全部完成。

## 关键发现

1. **协议整体亲和性良好**：21/23 设计点在 DeepSeek 上达到 A 或 A+，核心语法设计对 LLM 友好
2. **GLM 主要瓶颈是输出能力**：而非协议理解。GLM 的失败多数是 JSON 输出截断，不是语法/语义错误。提升 max_tokens 至 20480 后 #4 和 #9 的截断问题已解决
3. **条件渲染是最弱环节**：#6 Extended.If 即使胜出也仅 C 级（65%），需协议层面优化
4. **列表循环内置变量需 few-shot 引导**：#8 A2UI 协议相对路径变量（`$name` 而非 `$item.name`）0-shot 为 0%，但 1-shot 即达 50-70%。协议设计可学习，非缺陷
5. **多数设计点模型不敏感**：#5 样式组织、#2 表达式包装、#16 变量引用语法、#18 JSON Pointer 引用等，方案间差异 <3%
6. **JSON Pointer 引用语法完全兼容**：#18 `${/json_pointer}` 与当前 `$__DataModel.xxx` 语法亲和性完全一致（A+ 92.5%），可安全引入
7. **`${var}` 与 `$var` 亲和性无差异**：#20 两方案 MA 差异 <1%（A 81-82%），模型对两种变量引用语法同等亲和，维持当前 `$var` 设计即可
8. **响应式断点两种方式亲和性一致**：#21 `$__WidthBreakpoint` 和 `$__WindowSize.width` 亲和性无显著差异（MA 差异 <1%），两种策略均达 A+。多组件场景需 few-shot 示例引导数组输出格式
9. **Select index-based 达 A+ 93.2%**：#23 优化测试用例 + few-shot 后，从 B (70.6%) 跃升至 A+ (93.2%)。低分根因是测试噪音，非协议设计问题。0-shot 100%，无需 few-shot

## 评估流程

每个设计点按照以下流程执行：

1. 在 `eval/design-points/<design-point>/` 下创建子目录
2. 编写 `README.md`，说明设计背景、候选方案、测试用例
3. 在 `test-cases/` 中放置策略感知的测试用例 JSON（含 `shared_rules` + `strategy_rules`）
4. 在 `eval/src/cli/` 中新建对应的评估入口脚本
5. 在 `eval/src/config.ts` 中添加对应的加载函数
6. 在 `eval/package.json` 中添加 npm script
7. 运行评估，报告输出到 `reports/`
8. 在 `README.md` 中补充评估结论
