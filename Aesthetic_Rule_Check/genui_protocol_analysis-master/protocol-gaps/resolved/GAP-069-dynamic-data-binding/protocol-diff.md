# GAP-069 协议修改（specification/harmonyos-a2ui-protocol.md + form + JSON Schema）

## 修改 1: 全量协议新增 §3.9 动态数据绑定能力
- 位置: specification/harmonyos-a2ui-protocol.md（§3.8 多端自适应之后，§4 附录之前）
- 修改前: 无此章节
- 修改后: 新增 §3.9，含 5 个子节：3.9.1 三种绑定机制（PathBinding/FunctionCall/Expression）、3.9.2 适用规则（含基础数据类型→支持）、3.9.3 响应式绑定 vs 一次性求值、3.9.4 示例（5 例）、3.9.5 与其他章节关系
- 理由: 数据绑定能力原先散落在 §3.6 表达式中，PathBinding/FunctionCall 无独立归属；新增章节统述三种机制并澄清响应式 vs 一次性求值的易混点

## 修改 2: §1.5 文档组织 TOC
- 位置: §1.5 文档组织表格 §3 行
- 修改前: "...子组件模板生成、多端自适应"
- 修改后: "...子组件模板生成、多端自适应、动态数据绑定"
- 理由: 目录补入新章节

## 修改 3: §3.6.1 规则 8 泛化
- 位置: §3.6.1 表达式约束第 8 条
- 修改前: "组件的各属性是否支持表达式...声明为 `Expression` 类型的联合类型"
- 修改后: "组件的各属性/样式是否支持动态数据绑定...声明为 `Expression` / `PathBinding` / `FunctionCall` 的联合类型...见 §3.9"
- 理由: 由"表达式"泛化为"动态数据绑定"，指向新章节

## 修改 4: §4.2.1 表格列头改名
- 位置: §4.2.1 全部属性表（20）+ 样式表（18）列头
- 修改前: `支持表达式`
- 修改后: `支持动态数据绑定`
- 理由: 列含义从单一表达式扩展为三种绑定机制；是/否值不变

## 修改 5: shadow 审计
- 位置: §4.2.1.2 通用样式 shadow 行
- 修改前: 支持表达式=否
- 修改后: 支持动态数据绑定=是
- 理由: shadow 取值含字符串枚举（基础数据类型 string），按"含基础数据类型→支持"原则应为是。其余否字段（constraintSize/linearGradient/decoration/cancelButton/mark/menuAlign）均为纯对象，维持否

## 修改 6: form 协议新增 §3.8 动态数据绑定能力
- 位置: specification/harmonyos-a2ui-form-protocol.md（§3.7 之后，§4 之前）
- 修改前: 无此章节
- 修改后: 新增 §3.8（与全量 §3.9 同构，示例改用 form 通用组件）
- 理由: form 协议同步（form 无多端自适应，故编号为 §3.8）
- 同步: form §3.6.1 规则 8 泛化、§4.2.1 列头改名、shadow 审计

## 修改 7: JSON Schema — extended_catalog.json 补齐 FunctionCall
- 位置: specification/json/extended_catalog.json
- 修改前: 通用样式（CommonStyles）用内联 oneOf [字面量, Expression, PathBinding]，缺 FunctionCall；组件私有属性经 ExtendedDynamic* 含 FunctionCall
- 修改后: 全部 40 个含 PathBinding 的 oneOf 补齐 FunctionCall，三种机制一致
- 理由: 消除 Schema 内部 FunctionCall 应用不一致

## 修改 8: JSON Schema — shadow 补绑定
- 位置: extended_catalog.json + form_catalog.json shadow 定义
- 修改前: shadow oneOf=[object, string-enum]，无绑定
- 修改后: oneOf=[object, string-enum, Expression, PathBinding, FunctionCall]
- 理由: 与 prose 改判"是"对齐

## 修改 9: JSON Schema — form_catalog.json 补齐 FunctionCall
- 位置: specification/json/form_catalog.json
- 修改前: 50 个含 PathBinding 的 oneOf 缺 FunctionCall
- 修改后: 补齐 FunctionCall，三种机制一致

## 修改 10: 表格列头改名 + 去权威（措辞精炼）
- 位置: 两份 spec §4.2.1 全部属性/样式表表头 + §3.9.2/§3.8.2
- 修改前: 列头「支持动态数据绑定」；§3.9.2「权威以所属 catalog...」
- 修改后: 列头「支持动态数据类型」；§3.9.2「以所属 catalog...」（去"权威"）；同步 §3.9.5/§3.8.5 列名引用

## 修改 11: ExtendedDynamic* 类型说明 + schema 全面收敛
- 位置: spec §3.9.2（全量）/ §3.8.2（form）；extended_catalog.json + form_catalog.json
- 修改前: §3.9.2 仅模糊一句"声明为 Expression/PathBinding/FunctionCall 的联合类型"；schema 中字段内联三元组 [Expression, PathBinding, FunctionCall]，form_catalog 无 ExtendedDynamicValueRef 定义
- 修改后:
  - §3.9.2/§3.8.2 扩写为 ExtendedDynamic* 类型说明（镜像 a2ui Dynamic*）：介绍 ExtendedDynamicValueRef（三源联合）+ ExtendedDynamicString/Number/Boolean（字面量 ∪ ValueRef），并说明约束字面量字段以「约束字面量 + ExtendedDynamicValueRef」声明
  - schema 全面收敛：所有字段级内联 [Expression, PathBinding, FunctionCall] 三元组 → 单个 `$ref: ExtendedDynamicValueRef`（字面量分支含约束原样保留，语义等价）；form_catalog 新增 ExtendedDynamicValueRef 定义
  - 组件私有属性已有的 ExtendedDynamicString/Number/Boolean 引用不变
- 理由: 用类型名说明 schema 如何定义"支持动态数据类型"，统一 schema 表述、消除三元组重复

## 修改 12: 对象子字段递归绑定
- 位置: spec §3.9.2（全量）/ §3.8.2（form）；extended_catalog.json + form_catalog.json
- 修改前: §3.9.2 "对象分支的子字段不可单独绑定"（过严）；schema 中 UI 数据对象字段的基础数据类型子字段（margin.top、shadow.color、constraintSize.minWidth 等）为裸 number/string/boolean，不可绑定
- 修改后:
  - §3.9.2/§3.8.2 重写为"对象/结构体取值字段"：基础数据类型→支持的判定适用于任意层级的取值位置，对象内基础数据类型子字段可单独绑定；对象/数组子字段（如 linearGradient.colors）不可
  - schema：UI 数据对象字段（margin/padding/borderRadius/constraintSize/shadow/linearGradient/backgroundImageSizeWithStyle + form 的 decoration/mark）的基础数据类型子字段追加 ExtendedDynamicValueRef（ext 25 + form 30 处），保留 default 等约束，enum/数组子字段不动
  - 不触碰：表达式文法元数据表、event.name、functionCall.call（协议结构/标识符，§3.6.1 规则 6 排除）
- 理由: "基础数据类型→支持"原则应递归适用于值位置，"不可单独绑定"与原则相悖

## 修改 13: 补充不支持动态数据类型的字段例外
- 位置: spec §3.9.2（全量）/ §3.8.2（form）；eval/prompts/protocol-summary.md
- 修改前: §3.9.2 仅笼统说"基础数据类型→支持"，未显式排除结构/标识字段
- 修改后: 新增"不支持动态数据类型的字段"声明——`id`、`component`、`children`、事件属性（`onXxx`）、`action` 为结构标识/协议结构字段，即便取值含基础数据类型（如 id/component 为 string）也不支持动态数据类型；`children` 模板 path 属 §3.7 模板渲染机制，不属此范畴
- 理由: 这些字段本就不持有动态绑定（schema 中无 ExtendedDynamic*），需在 prose 显式声明，避免"含基础数据类型→支持"被误用于 id/component 等
- schema 影响: 无（id/component/onClick/action/children 在 schema 中本就无 ExtendedDynamic*）

## 修改记录表
- 位置: specification/modification-history.md 头部 ## 修改记录（倒序最前）
- 新增条目: | 2026-07-08 | GAP-069：动态数据绑定能力规格完善... | §1.5, §3.6.1, §3.9, §4.2.1, JSON Schema |
- 同步: specification/modification-history-form.md 新增 form 条目
