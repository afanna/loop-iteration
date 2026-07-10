# 鸿蒙 A2UI 协议缺口追踪总账

> 状态: resolved = 已解决并归档 | pending = 待处理 | blocked = 被阻塞

## 历史缺口（已完成，归档）

来自 eval/design-points/ 22 个单点设计评估，全部完成，视为 resolved。

| ID | 缺口 | 类型 | 优先级 | 状态 | 发现日期 | 关联设计点 | 关联测试 | 解决日期 |
|----|------|------|--------|------|---------|-----------|---------|---------|
| GAP-001 | 变量引用方式（作用域 + 字段访问） | 协议设计 | P1 | **resolved+合入（随 GAP-046）** | 2026-04 | eval/design-points/variable-reference | FP-04, FP-05 | 2026-05-04 |
| GAP-002 | 表达式包装方式 `{{ }}` vs `{"expr":}` | 协议设计 | P2 | **resolved+合入（prompt 已统一）** | 2026-04 | eval/design-points/expression-function | FP-04 | 2026-05-04 |
| GAP-003 | 事件链执行方式 handlerGroups vs flat-array | **协议设计** | **P0** | **resolved+合入** | 2026-04 | eval/design-points/event-chain | FP-05 | 2026-04-29 |
| GAP-004 | 组件命名 Extended 前缀 | 协议设计 | P0 | **resolved+合入** | 2026-04 | eval/design-points/component-naming | FP-01, FP-02 | 2026-05-01 — commit `1dfec4e` |
| GAP-005 | 样式属性组织方式 | 协议设计 | P1 | **resolved+合入（当前设计最优）** | 2026-04 | eval/design-points/style-organization | FP-03 | 2026-05-04 |
| GAP-006 | 条件渲染设计 Extended.If | 协议设计 | P0 | **resolved+合入（当前设计最优）** | 2026-04 | eval/design-points/conditional-rendering | FP-06 | 2026-05-04 |
| GAP-007 | 数据模型访问语法 dot-path vs json-pointer | 协议设计 | P0 | **resolved+合入（结论修正：互补共存）** | 2026-04 | eval/design-points/data-model-access | FP-04 | 2026-05-02 |
| GAP-008 | 列表循环内置变量设计 | 协议设计 | P1 | **resolved+合入（随 GAP-042 + GAP-046）** | 2026-04 | eval/design-points/list-loop-variable | FP-06 | 2026-05-04 |
| GAP-009 | 交互行为结构 | 协议设计 | P1 | **resolved+合入（随 GAP-045）** | 2026-04 | eval/design-points/action-structure | FP-05 | 2026-05-04 |
| GAP-010 | 样式值类型系统 | 协议设计 | P1 | **resolved+合入（当前设计最优）** | 2026-04 | eval/design-points/style-value-type | FP-03 | 2026-05-04 |
| GAP-011 | 表达式数据类型 | 协议设计 | P2 | **resolved+合入** | 2026-04 | eval/design-points/expression-datatype | FP-04 | 2026-05-02 — commit `a71d1d5` |
| GAP-012 | 表达式运算符范围 | 协议设计 | P2 | **resolved+合入（当前设计最优）** | 2026-04 | eval/design-points/operator-scope | FP-04 | 2026-05-04 |
| GAP-013 | 表达式使用范围约束 | 协议设计 | P2 | **resolved+合入（当前设计最优）** | 2026-04 | eval/design-points/expression-scope | FP-04 | 2026-05-04 |
| GAP-014 | 表达式内置函数设计 | 协议设计 | P2 | **resolved+合入（随 GAP-047）** | 2026-04 | eval/design-points/expression-function | FP-04 | 2026-05-04 |
| GAP-015 | 三层变量模型合理性 | 协议设计 | P3 | **resolved+合入（随 GAP-046）** | 2026-04 | eval/design-points/three-layer-variable | FP-04, FP-05 | 2026-05-04 |
| GAP-016 | ${var_name} 与 $var_name 区别 | 协议设计 | P3 | **废弃（被 #25 template-interpolation 取代）** | 2026-04 | eval/design-points/var-ref-syntax | FP-04 | 2026-05-04 |
| GAP-017 | 函数调用 $func() 语法 | 协议设计 | P3 | **resolved+合入（当前设计最优）** | 2026-04 | eval/design-points/function-call | FP-04 | 2026-05-04 |
| GAP-018 | 表达式 JSON Pointer 变量引用 | 协议设计 | P2 | **resolved+合入（随 GAP-046）** | 2026-04 | eval/design-points/json-pointer-ref | FP-04 | 2026-05-04 |
| GAP-019 | 扩展事件 DataModel 表达式访问方式 | 协议设计 | P1 | **resolved+合入（随 GAP-046）** | 2026-04 | eval/design-points/datamodel-expr-access | FP-05 | 2026-05-04 |
| GAP-020 | 模板字符串变量引用语法 | 协议设计 | P2 | **废弃（被 #25 template-interpolation 取代）** | 2026-04 | eval/design-points/template-var-syntax | FP-04 | 2026-05-04 |
| GAP-021 | 响应式断点表达方式 | 协议设计 | P1 | **resolved+合入（当前设计最优）** | 2026-04 | eval/design-points/responsive-breakpoint | FP-07 | 2026-05-04 |
| GAP-022 | 渐变颜色属性组织方式 | 协议设计 | P1 | **resolved（评估完成，A 综合最优）** | 2026-04 | eval/design-points/color-gradient-property | FP-03 | 2026-05-04 |

## 新发现缺口（已全部解决）

| ID      | 缺口                                              | 类型              | 优先级 | 状态      | 发现日期       | 关联设计点                 | 关联测试         | 解决日期 |
| ------- | ----------------------------------------------- | --------------- | --- | ------- | ---------- | --------------------- | ------------ | ---- |
| GAP-023 | 表达式 `{{` 字面量转义 — `#` 已预留，极罕见，暂不处理 | 协议规范            | P2  | **resolved（暂不处理）** | 2026-04-28 | —                     | FP-04        | 2026-05-04 |
| GAP-024 | EBNF `$dataModel` 与示例 `$__DataModel` 不一致        | 协议规范            | P0  | **resolved（随 GAP-046 合入）** | 2026-04-28 | variable-system (验证) | FP-04        | 2026-05-04 — commit `74703a0` |
| GAP-025 | `$handlerResult` 与 EBNF `$ActionResult` 命名不一致   | 协议规范            | P0  | **resolved（随 GAP-046 合入）** | 2026-04-28 | variable-system (验证) | FP-05        | 2026-05-04 — commit `74703a0` |
| GAP-026 | `$__WidthBreakpoint`/`$windowBreakpoint` 命名不一致 | 协议规范            | P0  | **resolved（随 GAP-046 合入）** | 2026-04-28 | variable-system (验证) | FP-07        | 2026-05-04 — commit `74703a0` |
| GAP-027 | 表达式求值失败时的 fallback 行为 — §4.5.7 已定义返回 `""` | 协议规范            | P0  | **resolved** | 2026-04-28 | —                     | FP-04        | 2026-05-04 |
| GAP-028 | 原生+扩展组件混用场景未测试 — 随 GAP-004 catalogId 分离后不存在混用问题 | 测试覆盖            | P1  | **resolved（无需处理）** | 2026-04-28 | component-naming      | FP-01, FP-02 | 2026-05-04 |
| GAP-029 | handlerGroups 跨组引用 `$handlerResult` 生命周期歧义      | 协议规范            | P1  | resolved | 2026-04-28 | event-chain           | FP-05        | 2026-04-29 — flat-array消除嵌套组，condition下移到行为对象 |
| GAP-030 | 事件冒泡/传播未定义 — A2UI 声明式协议无 DOM 树，不存在冒泡场景 | 协议规范            | P1  | **resolved（不适用）** | 2026-04-28 | —                     | FP-05        | 2026-05-04 |
| GAP-031 | Select symbolIcon 专项测试 — #23 已覆盖 | 测试覆盖 | P1 | **resolved** | 2026-04-28 | — | FP-01 | 2026-05-04 |
| GAP-032 | 50+ 组件大规模页面 — LLM 逐个生成，数量不影响 | 测试覆盖 | P1 | **resolved** | 2026-04-28 | — | FP-08 | 2026-05-04 |
| GAP-033 | 增量更新中表达式行为 — §4.5.7 已覆盖：变量变化触发重新求值 | 协议规范            | P1  | **resolved** | 2026-04-28 | —                     | FP-08        | 2026-05-04 |
| GAP-034 | 嵌套 If 测试 — 两 If 叠加，已有覆盖 | 测试覆盖 | P2 | **resolved** | 2026-04-28 | conditional-rendering | FP-06 | 2026-05-04 |
| GAP-035 | 并发事件处理 — action 链顺序执行模型已隐含串行语义，无并发需求 | 协议规范            | P2  | **resolved（不适用）** | 2026-04-28 | —                     | FP-05        | 2026-05-04 |
| GAP-036 | fontWeight 数字/字符串二义性 — 统一为字符串枚举值 | 协议规范            | P2  | **resolved** | 2026-04-28 | —                     | FP-03        | 2026-05-04 |
| GAP-037 | 单引号/双引号嵌套 — JSON 转义问题，非协议问题 | 协议规范 | P2 | **resolved** | 2026-04-28 | — | FP-04 | 2026-05-04 |
| GAP-038 | `$__ColorMode` 无使用示例 — §4.5.2 已补充 | 协议规范            | P2  | **resolved** | 2026-04-28 | —                     | FP-07        | 2026-05-04 |
| GAP-039 | styles token 膨胀 — 样式 catalog 管理问题 | 协议规范 | P2 | **resolved** | 2026-04-28 | style-value-type | FP-03 | 2026-05-04 |
| GAP-040 | 组件选型指南 — GAP-004 catalogId 已解决 | Prompt | P2 | **resolved** | 2026-04-28 | component-naming | FP-01, FP-02 | 2026-05-04 |
| GAP-041 | 自定义行为 LLM 未见时生成 — LLM 通用问题 | 测试覆盖 | P2 | **resolved** | 2026-04-28 | — | FP-05 | 2026-05-04 |
| GAP-042 | 模板渲染: $item.fieldName 替换 $fieldName 隐式引用 | **协议设计** | **P0** | **resolved+合入** | 2026-05-01 | eval/design-points/variable-system | FP-04, FP-06 | 2026-05-01 — commit `5098390` |
| GAP-043 | 行为结果变量: as 绑定替换 $handlerResult["id"] | **协议设计** | **P0** | **resolved+合入** | 2026-05-01 | eval/design-points/variable-system | FP-05 | 2026-05-01 — commit `ac61334` |
| GAP-044 | §3.5 path属性歧义: A2UI原生绑定path vs setDataModel args.path | 协议规范 | P1 | **resolved+合入** | 2026-05-02 | — | FP-04, FP-05 | 2026-05-02 — commit `d558034` |
| GAP-045 | 交互行为结构设计决策: 明确 flat-action 统一 server/local action，不建议混合 action + listeners；清理 §3.4/§4.3.2/JSON Schema 残留 `id` 10处 | 协议设计 | P1 | **resolved+合入** | 2026-05-02 | eval/design-points/action-structure | FP-05 | 2026-05-02 — commit `64532ac` |
| GAP-046 | 变量系统统一描述: 整合 §3.5/§3.6.2/§4.4.4/EBNF/JSON Schema 中散落的变量定义，纳入 #18/#24/#25 结论，修正 GAP-024/025/026 命名不一致 | 协议规范 | P0 | **resolved+合入** | 2026-05-04 | eval/design-points/variable-system, json-pointer-ref, template-interpolation | FP-04, FP-05, FP-07 | 2026-05-04 — commit `74703a0` |
| GAP-047 | 删除 §4.4.5 format() 表达式函数 — 模板字符串已完全覆盖字符串插值场景 | 协议设计 | P2 | **resolved+合入** | 2026-05-04 | eval/design-points/template-interpolation | — | 2026-05-04 — commit `337a6e2` |
| GAP-048 | Button 扩展组件补充 action 属性 — 表单提交能力，A+ 95.5% 验证通过 | 协议设计 | P1 | **resolved+合入** | 2026-05-06 | eval/design-points/button-action | FP-01, FP-05 | 2026-05-06 — commit `5ccf0b2` |
| GAP-049 | 字符串插值方案 — 模板字符串与 format() 暂不支持，`+` 运算符已覆盖字符串拼接场景 | 协议设计 | P2 | **resolved（暂不处理）** | 2026-05-07 | eval/design-points/template-interpolation | FP-04 | 2026-05-07 |
| GAP-050 | 表达式安全约束 — 总长度 ≤ 2048 字符、括号嵌套深度 ≤ 20 层 | 协议规范 | P2 | **resolved+合入** | 2026-05-08 | — | FP-04 | 2026-05-08 |
| GAP-051 | $__DataModel "全局"称谓歧义 — 澄清 surface 级作用域 | 协议规范 | P2 | **resolved+合入** | 2026-05-08 | — | — | 2026-05-08 |
| GAP-052 | scrollTo 缺少 componentId — 无法指定目标 List 组件 | 协议设计 | P0 | **resolved+合入** | 2026-05-08 | — | FP-05 | 2026-05-08 |
| GAP-053 | 扩展交互协议结构优化 — 去除listeners层，事件名直接作为组件属性，handler改名action | **协议设计** | **P0** | **resolved+合入** | 2026-05-11 | eval/design-points/interaction-restructure | FP-05 | 2026-05-11 |
| GAP-054 | 交互函数统一建模 — 将预定义交互行为与 getXxx 表单取值函数统一纳入扩展函数章节 | **协议设计** | **P0** | **resolved+合入** | 2026-05-14 | eval/design-points/interaction-function-wrapper | FP-05 | 2026-05-14 — commit `e254978` |
| GAP-055 | 第 4 章附件目录结构优化 — 原生组件、扩展协议、公共能力、JSON Schema 分层整理；通用事件收敛 + 组件私有事件下沉 | 协议规范 | P2 | **resolved+合入** | 2026-05-14 | — | — | 2026-05-14 — commit `18c3021` |
| GAP-056 | 组件属性命名一致性 — space→itemMargin, selectXxx→selectedXxx, unselectedXxx→unSelectedXxx | 协议规范 | P2 | **resolved+合入（轻量修复，跳过评估）** | 2026-05-20 | — | FP-01, FP-02 | 2026-05-20 |
| GAP-057 | 组件属性与样式补充 — Button 新增 fontColor 样式，Row 新增 wrap 属性 | 协议设计 | P1 | **resolved+合入（轻量新增，跳过评估）** | 2026-05-20 | — | FP-01, FP-02 | 2026-05-20 |
| GAP-058 | Radio 删除 indicatorType 属性 | 协议规范 | P2 | **resolved+合入** | 2026-05-22 | — | FP-01 | 2026-05-22 |
| GAP-059 | Checkbox 新增 value 属性 + getCheckboxGroupValues 改为从 value 获取 | 协议设计 | P1 | **resolved+合入** | 2026-06-05 | — | FP-01, FP-05 | 2026-06-05 — commit `c7e6a3a` |
| GAP-060 | Divider color 默认值遵循UX定义 + Text maxLines 默认值 inf | 协议规范 | P1 | **resolved+合入** | 2026-06-05 | — | FP-01, FP-03 | 2026-06-05 — commit `895498f` |
| GAP-061 | Button 扩展组件补充 minFontSize | 协议规范 | P1 | **resolved+合入** | 2026-06-05 | — | — | 2026-06-05 — commit `7e3aaad` |
| GAP-062 | __WindowWidthBreakpoint → __WidthBreakpoint 重命名，参照物从窗口改为 Surface 外层容器 | 协议设计 | P0 | **resolved+合入** | 2026-06-05 | — | FP-04, FP-07, FP-08 | 2026-06-05 — commit `9e28b47` |
| GAP-063 | Navigation 组件重新定位为 NavContainer — 删除 title/backgroundColor，纯堆叠容器 + navigate 跳转 | **协议设计** | **P1** | **resolved+合入** | 2026-06-06 | eval/design-points/nav-container | FP-02, FP-05, FP-08 | 2026-06-06 — commit `8da1f6e` |
| GAP-064 | 系统变量 `$__PascalCase` → `$__camelCase` 重命名 — `$__DataModel`→`$__dataModel`、`$__WidthBreakpoint`→`$__widthBreakpoint`、`$__ColorMode`→`$__colorMode` | 协议规范 | P2 | **resolved+合入** | 2026-06-06 | — | FP-04, FP-05, FP-07, FP-08 | 2026-06-06 — commit `49d3fe2` |

| GAP-065 | Image 组件 src 显式声明不支持 SVG 图源 — 包括 base64 编码的 SVG data URI | 协议规范 | P2 | **resolved+合入** | 2026-06-13 | — | FP-01 | 2026-06-13 |

| GAP-066 | Select 组件 symbolIcon.src 限定为 Icon 组件 56 个图标名枚举 | 协议规范 | P2 | **resolved+合入** | 2026-06-13 | — | FP-01 | 2026-06-13 |

| GAP-067 | 局部变量命名规范 — itemVar/indexVar/as 增加 pattern 约束 + EBNF identifier 收紧 + indexVar==itemVar 同名回退 | 协议规范 | P2 | **resolved+合入** | 2026-06-13 | — | FP-04, FP-06 | 2026-06-13 |

| GAP-068 | Image.src schema 未显式声明 Expression/PathBinding — prose「支持表达式:是」与 JSON Schema 纯 string 不一致，按 §3.6.1 规则8 schema 为权威补全联合类型 | 协议规范 | P2 | **resolved+合入（轻量修复，跳过评估）** | 2026-06-16 | — | FP-01 | 2026-06-16 |

| GAP-069 | 动态数据绑定能力规格完善 — 扩展组件属性/样式补全 PathBinding/FunctionCall/Expression 三种绑定机制，新增独立章节，统一 prose/schema/prompt | 协议设计 | P1 | **resolved+合入（轻量修复，核心对比复用 GAP-007）** | 2026-07-08 | eval/design-points/property-binding-types | FP-01, FP-03, FP-04 | 2026-07-08 |

## 统计

- 总计: 69
- resolved: 69
- pending: 0
