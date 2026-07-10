# 鸿蒙 A2UI 扩展协议 — 修改记录

> 本文件记录鸿蒙 A2UI 扩展协议（全量）规范的每一次修改，每条对应一个 GAP，按倒序排列。
>
> **与 `CHANGELOG.md` 的区别**：
> - 本文件是**细粒度开发追溯日志**（每个 commit/GAP 一行），在 master 分支维护，由 GAP 工作流手工编辑。
> - `CHANGELOG.md` 是**粗粒度版本发布日志**（每个 tag 一段），仅在 `1.0.0` 分支维护，由 `scripts/changelog.sh` 从 git log 自动生成。
>
> 回写指引：GAP 合入时，在本文件头部 `## 修改记录` 表格首行插入新行（详见根 `AGENTS.md` § Protocol Modification Rules）。

## 修改记录

| 日期 | 描述 | 涉及章节 |
|------|------|----------|
| 2026-07-08 | GAP-069：动态数据绑定能力规格完善 — 新增 §3.9 动态数据绑定章节（三种绑定机制 + 适用规则 + 响应式 vs 一次性求值）；§4.2.1 列头改为「支持动态数据类型」；shadow 按含基础数据类型原则改判支持绑定；JSON Schema 以 `ExtendedDynamic*` 类型统一声明（含对象子字段递归绑定）。 | §1.5, §3.6.1, §3.9, §4.2.1, JSON Schema |
| 2026-06-13 | GAP-067：局部变量命名规范 — itemVar/indexVar/as 增加 pattern 语法约束；EBNF identifier 移除 `$` 首字符；indexVar==itemVar 同名回退默认 `$item`/`$index`。新增 §4.2.2.2.7。 | §4.2.2.2, §3.7, EBNF, JSON Schema |
| 2026-06-13 | GAP-066：Select 组件 `symbolIcon.src` 增加图标名枚举约束，复用原生 Icon 组件 56 个图标名称。 | §4.2.1.5, JSON Schema |
| 2026-06-13 | GAP-065：Image 组件 `src` 属性显式声明不支持 SVG 格式（包括 base64 编码的 SVG）。 | §4.2.1.4, JSON Schema |
| 2026-06-06 | GAP-064：系统变量 `$__PascalCase` → `$__camelCase` 重命名 — `$__DataModel`→`$__dataModel`、`$__WidthBreakpoint`→`$__widthBreakpoint`、`$__ColorMode`→`$__colorMode`。commit `49d3fe2` | §4.2.2.2, §4.2.2.2.2, §4.2.2.2.3, §4.5.6, EBNF, JSON Schema |
| 2026-06-06 | GAP-063：Navigation 组件重新定位为 NavContainer — 删除 title 属性和 backgroundColor 样式，纯堆叠容器 + navigate 子页面跳转。commit `8da1f6e` | §3.4.1, §3.4.2, §4.2.1.6, JSON Schema |
| 2026-06-05 | GAP-062：`$__WindowWidthBreakpoint` → `$__WidthBreakpoint` 重命名；断点参照物从应用窗口改为 A2UI Surface 外层容器。commit `9e28b47` | §3.8.2, §4.2.2.2.2, JSON Schema, EBNF |
| 2026-06-05 | GAP-061：Button 扩展组件补充 `minFontSize` 样式，与 `maxFontSize` 配对。commit `7e3aaad` | §4.2.1.4, JSON Schema |
| 2026-06-05 | GAP-060：Divider `color` 默认值改为浅色 `#33000000` / 深色 `#33FFFFFF`（遵循UX定义）；Text `maxLines` 默认值新增 `inf`。commit `895498f` | §4.2.1.4, §4.2.2.1.2, JSON Schema |
| 2026-06-05 | GAP-059：Checkbox 新增 `value` 属性（语义化标识，不绘制显示）；`getCheckboxGroupValues` 改为从 `value` 属性获取；`label` 回归纯展示文本。commit `c7e6a3a` | §3.4.1, §4.2.2.1.5, JSON Schema |
| 2026-05-23 | §1.4 协议版本新增版本编号规则 — 遵循语义化版本 2.0.0 规范，定义 MAJOR.MINOR.PATCH 递增规则与 alpha/beta/rc 预发布阶段标识。 | §1.4 |
| 2026-05-22 | GAP-058：删除 Radio 组件 `indicatorType` 属性。 | §4.2.1.5, JSON Schema |
| 2026-05-20 | 新增 §1.4 协议版本 — 定义 A2UI 原生协议与鸿蒙扩展协议的双版本体系及演进规则。`catalogId` 从 `"ohos.a2ui.extended.catalog"` 改为 `"ohos.a2ui.extended.catalog@1.0.0"`，版本号编入 catalogId。原 §1.4 文档组织顺延为 §1.5，§1.5 约定顺延为 §1.6。 | §1.4, §1.5, §1.6, §3.1, §3.2, JSON Schema |
| 2026-05-20 | 新增 §3.7 子组件模板生成章节 — 概述模板机制、支持组件（Row/Column/List/Grid/Tabs）、循环变量与自定义（indexVar/itemVar）、嵌套模板规则、综合示例（完整协议消息）。原 §3.7 多端自适应能力顺延为 §3.8。同步更新 §1.4 文档组织表、§4.2.1.6/§4.2.2.2.3/§4.2.2.2.4.1 交叉引用。移除全文残留的 `['key']` 字符串键访问语法。commit `9f752e0` `77f0be1` | §1.4, §3.7, §3.8, §4.2.1.6, §4.2.2.2.3, §4.2.2.2.4.1, §4.2.2.1.3, §4.2.2.2.5 |
| 2026-05-20 | GAP-057：组件属性与样式补充 — Button 新增 `fontColor` 样式（文本颜色），Row 新增 `wrap` 属性（换行控制：noWrap/wrap）。 | §4.2.1.4, §4.2.1.6 |
| 2026-05-20 | GAP-056：组件属性命名一致性修复 — Row/Column 的 `space`→`itemMargin`；Radio 的 `uncheckedBorderColor`→`unCheckedBorderColor`；Checkbox/CheckboxGroup 的 `unselectedColor`→`unSelectedColor`；TabContent 的 `selectColor`/`selectBackgroundColor`/`selectBorderColor`→`selected*`，`unselectedColor`→`unSelectedColor`。统一驼峰命名规范。 | §4.2.1.6, §4.2.1.4, §4.2.1.5, §4.2.1.7 |
| 2026-05-20 | §1 协议说明重构：原三行说明扩展为 §1.1 协议概述、§1.2 设计目标、§1.3 协议架构（含两层架构图与维度对比表）、§1.4 文档组织、§1.5 约定。commit `6124947` | §1 |
| 2026-05-20 | 删除 GridRow 扩展组件；修正原生组件数量 19→18。同步更新 §1.3 架构表、§4.2.1.6 布局组件、§4.2.2.2.5 循环变量说明、extended_catalog.json、expression_grammar.ebnf | §1.3, §4.2.1.6, §4.2.2.2.5, JSON Schema |
| 2026-05-20 | §1 协议说明重构：原三行说明扩展为 §1.1 协议概述、§1.2 设计目标、§1.3 协议架构（含两层架构图与维度对比表）、§1.4 文档组织、§1.5 约定。commit `6124947` | §1 |
| 2026-05-15 | 将 §4.2.2.1.8 EBNF 文法、§4.3.1 basic_catalog.json、§4.3.2 extended_catalog.json 从协议文档剥离为独立文件（spec/json/ 目录），文档内改为文件引用链接。commit `7bb88bf` | §4.2.2.1.8, §4.3.1, §4.3.2 |
| 2026-05-15 | 修复协议文档错别字与一致性问题 — `send__DataModel`→`sendDataModel`、`sufaceId`→`surfaceId`、`sdisplayStyle`→`displayStyle`、`mormal`→`normal`、TextInput type `number`→`string`、Progress `Ring`→`ring`、TabContent fontWeight 示例修正、Column alignItems 枚举值修正、ScrollToArgs additionalProperties 修正、修复 3 处跳转链接。commit `2494eb0` | §2.1.3, §3.2, §3.6, §4.2.1, §4.2.1.4, §4.2.1.6, §4.3 |
| 2026-05-14 | GAP-055：通用事件与组件私有事件分层 — `4.2.1.3` 通用事件收敛为 `onClick`/`onAppear`；`onChange`/`onSelect`/`onReachStart`/`onReachEnd` 下沉到对应组件事件小节；组件事件引用统一为 [通用事件](#4213-通用事件) 超链接。commit `18c3021` | §4.2.1.3, §4.2.1.4, §4.2.1.5, §4.2.1.6, §4.2.1.7, §4.2.1.8 |
| 2026-05-14 | GAP-055：第 4 章附件目录结构优化 — 将附件重组为 A2UI 原生组件、扩展协议、公共能力和 JSON Schema；扩展组件按属性/样式/事件就近组织；仅调整目录结构，不修改协议逻辑。commit `680c9c2` | §4.1, §4.2, §4.3 |
| 2026-05-14 | GAP-054：交互函数统一建模 — 新增 §3.4 扩展函数，统一 getXxx 表单取值函数与预定义交互函数；事件监听与交互顺延为 §3.5；同步锚点与历史章节号。commit `e254978` | §3.4, §3.5, §3.6, §4.3 |
| 2026-05-13 | getXxx 从交互行为迁移为内置函数（§4.4→§3.4），示例改为 `action.event.context` 嵌套调用风格；章节重编号 §4.4→§4.5→§4.6；JSON Schema handlers returnType 统一为 void；修复 6 处锚点链接；sendToLLM→sendToAssistant 重命名。 | §3.4, §4.4, §4.5, §4.6, JSON Schema |
| 2026-05-11 | GAP-053：交互协议结构优化 — §3.5 "交互扩展"改为"事件监听与交互"；去除 `listeners` 包装层，事件名直接作为组件属性（如 `onClick`）；`Handler` 改名 `EventHandler`；JSON Schema `Listeners`→事件属性、取消 `ActionChain`、`Action`→`EventHandler`（避免与 A2UI 原生 `Action` 冲突）；§4.1.2/§4.3/§4.3.2/§4.5.4.2 示例同步更新。 | §3.5, §4.1.2, §4.3, §4.3.2, §4.5.4.2, JSON Schema |
| 2026-05-08 | GAP-052：scrollTo 行为新增 `componentId` 参数 — 行为表/参数表/示例/JSON Schema ScrollToArgs 同步更新；JSON Schema example 补充 componentId 并移除残留 `id`。 | §4.3.2, JSON Schema §ScrollToArgs |
| 2026-05-08 | GAP-051：澄清 `$__DataModel` surface 级作用域 — §4.5.1 新增 NOTE、§4.5.2 表描述追加、§4.5.6 优先级表追加说明，消除与 `$__WidthBreakpoint` 等真正全局变量的歧义。 | §4.5.1, §4.5.2, §4.5.6 |
| 2026-05-08 | GAP-050：表达式安全约束 — §4.4.1 新增长度 ≤ 2048 字符、括号嵌套深度 ≤ 20 层约束；§3.6 新增第 9 条索引引用。 | §4.4.1, §3.6 |
| 2026-05-06 | GAP-048：Button 扩展组件新增 action 属性 — 表单提交能力，与 A2UI 原生协议保持一致；更新 §3.5 设计决策。commit `5ccf0b2` | §3.2, §3.5 |
| 2026-05-04 | GAP-047：§4.4.5 删除 `format()` 内置函数 — 模板字符串已完全覆盖字符串插值场景；EBNF `function_call` 移除 format；JSON Schema 删除 format 条目。commit `337a6e2` | §4.4.5, §4.4.8 EBNF, JSON Schema §Function |
| 2026-05-04 | GAP-046：变量系统统一描述 — 新增 §4.5 独立变量章节，整合 §4.4.4 散落内容并纳入 #18/#24/#25 设计结论；修正 EBNF `$dataModel`→`$__DataModel`(GAP-024)、`$ActionResult`→`$handlerResult`(GAP-025)、`$windowBreakpoint`→`$__WidthBreakpoint`(GAP-026)；§4.5 JSON Schema 重新编号为 §4.6。commit `74703a0` | §4.5, §4.4.4, §3.6.2, §4.4.7, §4.4.8 EBNF |
| 2026-05-02 | GAP-011：§4.4.6 + 运算符类型转换 asymmetric → symmetric（JS风格），number + string 改为 number转string拼接，与 string + number 对称。commit `a71d1d5` | §4.4.6, 附录 TypeConversion |
| 2026-05-02 | GAP-045：§3.5 增加设计决策说明 — flat-action 统一 server/local action，不建议混合 action + listeners；清理 §3.5、§3.6、§4.3.2、JSON Schema 示例中残留的 `id` 字段（Handler interface 已删 id）。commit `64532ac` | §3.5, §3.6, §4.3.2, JSON Schema |
| 2026-05-02 | GAP-044：§3.6 表达式约束拆分"path属性"歧义 — A2UI原生数据绑定path(不支持表达式) vs setDataModel args.path(支持表达式)。commit `d558034` | §3.6 |
| 2026-05-01 | GAP-004：组件命名从 `Extended.` 前缀改为统一命名 + `catalogId` 隔离。扩展组件与原生组件使用相同名称，通过 `catalogId: "harmonyos"` 区分来源。commit `1dfec4e` | §3.1, §3.2, §3.6, §4.1, §4.3, JSON Schema |
| 2026-05-01 | GAP-042：模板渲染变量引用从 `$fieldName` 隐式语法改为 `$item.fieldName` 显式语法。相对路径特点、使用场景、混合示例全部更新。commit `5098390` | §4.4.4, EBNF |
| 2026-05-01 | GAP-043：行为结果变量从 `$handlerResult["id"]` 索引引用改为 `as` 命名绑定。Handler 接口删除 `id` 字段，新增 `as` 字段。4.4.4 局部变量表删除 handlerResult，新增 as 绑定。commit `ac61334` | §3.5, §4.3, §4.4, JSON Schema |
| 2026-04-29 | GAP-003：事件行为从三层嵌套（listener→handlerGroups→handler）改为扁平数组（listener→handler[]），condition 下移到每个行为对象。commit `95dc512` | §3.5, §4.3, §4.4, JSON Schema |
| 2026-04-25 | 6维评分公式修正、D5统一为complexity过滤、新增 #20/#21 设计点 | 全文 |
