# GAP-069: 动态数据绑定能力规格完善

## 问题描述

扩展组件属性/样式的"动态数据绑定能力"在 prose（规格散文）、JSON Schema、LLM prompt 三处不一致，且只描述了 3 种绑定机制中的 1 种。

### 动态数据绑定的 3 种机制

| 类型 | 来源 | 语法 | 求值来源 |
|------|------|------|----------|
| PathBinding | A2UI 原生 | `{"path":"/user/name"}` | DataModel JSON Pointer |
| FunctionCall | A2UI 原生 | `{"call":"函数名","args":{...}}` | 所调用值函数的返回值 |
| Expression | 扩展协议 | `"{{ $__dataModel.x }}"` | 扩展表达式系统 |

### 发现的 3 处不一致

**1. JSON Schema 内部矛盾 — FunctionCall 各字段不统一**
- `extended_catalog.json` 中 `FunctionCall` 仅被引用 2 次，而 `Expression`/`PathBinding` 各约 40 次。
- 通用样式（CommonStyles）用内联 `oneOf:[字面量, Expression, PathBinding]` → **不含 FunctionCall**。
- 组件私有属性（经 `ExtendedDynamicString/Number/Boolean`）→ **含 FunctionCall**。
- form_catalog.json 同样模式（Expression/PathBinding 各 50 次、FunctionCall 仅 1 次）。

**2. prose 表格 vs Schema vs 判定原则对不上**
- 表格列名仅"支持表达式"，未涵盖 PathBinding/FunctionCall。
- shadow 取值含字符串枚举（基础数据类型 string），按"含基础数据类型即支持"原则应为"是"，但表格/Schema 现为"否"。

**3. LLM prompt 完全没提 PathBinding/FunctionCall 作为属性值**
- `protocol-summary.md` 的"表达式适用字段"只讲 `{{ }}`，LLM 从未被告知可用 `{"path":}` 或 `{"call":}` 作为组件属性值。Schema 已声明但 prompt/few-shot/测试用例整套生态只训练表达式。

## 影响范围

- 协议章节: §3.6（表达式）、新增 §3.9（全量）/ §3.8（form）动态数据绑定能力、§4.2.1 组件表格、§4.2.2 公共能力
- JSON Schema: extended_catalog.json、form_catalog.json
- LLM prompt: eval/prompts/protocol-*.md（5 份摘要）
- 测试分类: FP-01（组件）、FP-03（样式）、FP-04（表达式/数据绑定）

## 候选修复方案（已与决策方确认锁定）

### 锁定决策

1. **绑定模型**：扩展组件属性/样式官方支持 3 种绑定（PathBinding / FunctionCall / Expression）
2. **判定原则**：取值类型 **含基础数据类型（number/boolean/string）→ 是**；纯对象/数组 → 否（是/否值与现状一致）
3. **新章节**：独立"动态数据绑定能力"——全量 **§3.9** / form **§3.8**；§3.6 表达式原样保留并交叉引用
4. **概念边界**：显式区分**响应式绑定**（属性/样式值位置，属绑定）vs **一次性求值**（EventHandler `condition`/`args.*`，触发时单次计算，不属绑定）
5. **FunctionCall 机制**：调用已注册的值函数，返回值绑定到属性（`formatString`/`formatNumber`/`formatDate`/`pluralize` 等为可用值函数示例，非机制定义）
6. **示例**：逐机制 + 对照 + 综合

### 自动收口项（按既定原则）

- **shadow**：取值含字符串枚举（string 基础数据类型）→ 按"含即支持"改判 **是** + Schema 补绑定
- **列头**：`支持表达式` → `支持动态数据绑定`（是/否值不变），表注指向新章节

### 新章节骨架

```
动态数据绑定能力（§3.9 全量 / §3.8 form）
├─ 定义：属性/样式"值位置"的动态解析与响应式更新
├─ 三种机制（互斥，取其一）
│   PathBinding {"path":} / FunctionCall {"call":,"args":}（调用值函数）/ Expression "{{}}"
├─ 适用规则：含基础数据类型→是（以 catalog Schema 联合类型为准）
├─ 响应式 vs 一次性求值（对照表 + 边界说明，交叉引用 §3.5/§3.6）
└─ 示例：例1 PathBinding / 例2 FunctionCall 属性值 / 例3 Expression响应式
       例4 对照(EventHandler一次性求值，非绑定) / 例5 综合页面
```

## 验证计划

**类型**：实质性修复（LLM 需学习新行为）→ eval/design-points A/B 对比验证

- 设计点：`eval/design-points/property-binding-types`
- 策略A（旧协议）：仅表达式作为属性绑定
- 策略B（新协议）：3 种绑定机制均可
- 测试用例：覆盖 PathBinding / FunctionCall / Expression 三种属性绑定 + 响应式/一次性求值区分
- 预期指标：策略 B 达 A 级（MA ≥ 80%），且 D1（结构）/D2（正确性）相对 A 无退化
- **门槛**：若 B 退化或未达 A 级 → 回退重设计（如降级为"表达式为主 + PathBinding，排除 FunctionCall"）

## 评估报告

- 核心对比：eval/design-points/data-model-access/conclusion.md（GAP-007，表达式 vs 路径绑定，A+ 91-92%，互补共存）
- 设计点结论：eval/design-points/property-binding-types/conclusion.md
- 全量回归：eval/reports/report-2026-07-08T06-34-46.json（基线 report-2026-06-16T01-24-45.json）

回归结果：剔除瞬态 429 限流，DeepSeek 97.5%（仅 CR005 既有边缘用例失败，与本 GAP 无关）、GLM 真实通过率 100%（7 个失败全为 429）。新增 E008-E011 绑定用例两模型均通过。**无退化，门槛通过。**

## 最终结论

方案B（三机制共存）合入。新增 §3.9（全量）/ §3.8（form）动态数据绑定能力章节；§4.2.1 表格列头改名为「支持动态数据绑定」；shadow 按含基础数据类型原则改判支持绑定；JSON Schema（extended 40 + form 50 处）补齐 FunctionCall 一致性；5 份 prompt 同步。轻量修复路径（核心亲和性由 GAP-007 背书），全量回归确认无退化。
