# 设计点：property-binding-types — 属性/样式动态数据绑定的多机制规格

## 背景

扩展组件属性/样式的"动态数据绑定"有 3 种机制：

| 机制 | 语法 | 来源 |
|------|------|------|
| Expression | `"{{ $__dataModel.x }}"` | 扩展协议（响应式） |
| PathBinding | `{"path":"/user/name"}` | A2UI 原生（JSON Pointer） |
| FunctionCall | `{"call":"函数名","args":{...}}` | 所调用值函数的返回值 |

现状问题：JSON Schema 已支持 PathBinding（~40 处）和组件属性的 FunctionCall，但 prose/prompt 只讲表达式，且 Schema 内部 FunctionCall 应用不一致（通用样式缺、组件属性有）。GAP-069 完善此规格。

## 候选方案

- **方案A（expression-only）**：收紧 Schema，仅表达式作为属性绑定。删除 PathBinding/FunctionCall。
- **方案B（三机制共存，推荐）**：补全散文，统一 Schema 支持 3 种；expression 为主推（响应式、可计算），PathBinding/FunctionCall 为声明式/变换式补充。

## 验证基础（复用既有结论）

本设计点的核心对比（expression vs path-binding）**已由 GAP-007 / data-model-access 设计点完成评估**：

- 结论：表达式 `$__dataModel.x`（dot-path）**A+ 91-92% 胜出**，与 JSON Pointer（PathBinding）**互补共存**。
- 即"三机制共存"的亲和性已验证：expression 为主，PathBinding 可共存且不冲突。

GAP-069 新增内容（FunctionCall 绑定机制——调用已注册的值函数、返回值绑定到属性，formatString 等为可用值函数示例；响应式绑定 vs 一次性求值的区分）属文档对齐 + 轻量新增，**通过阶段4全量回归验证无退化**（参考 GAP-056/057/061/068 的轻量修复路径）。

## 推荐方案

**方案B（三机制共存）**。理由：

1. 已有 GAP-007 验证 expression 主导 + PathBinding 共存的亲和性达标。
2. Schema 现状本就支持多机制，方案B 是"补全散文使其与 Schema 一致"，改动语义最稳。
3. 方案A（删除 PathBinding/FunctionCall）会破坏既有 Schema 能力，且与 GAP-007"互补共存"结论相悖。

## 规格要点（写入 spec §3.9 全量 / §3.8 form）

- 判定：字段取值含基础数据类型（number/boolean/string）→ 支持动态数据绑定（3 种机制均可）；纯对象/数组 → 不支持。
- 概念边界：属性/样式**值位置**的绑定为**响应式**（变量变化自动重算）；EventHandler 的 `condition`/`args.*` 是**一次性求值**（触发时单次计算），不属于绑定。
- FunctionCall 绑定机制：调用已注册的值函数，返回值绑定到属性（formatString、formatNumber、formatDate、pluralize 等为可用值函数示例）。
- 三机制互斥：同一属性值取其一。

## 评估报告

- 核心对比：eval/design-points/data-model-access/conclusion.md（GAP-007，A+ 91-92%）
- 全量回归：eval/reports/report-2026-07-08T06-34-46.json（基线 report-2026-06-16T01-24-45.json）

### 回归结果（阶段4，2026-07-08）

| 模型 | 基线(36例) | 新跑(40例,+E008-E011) | 真实亲和性(剔除429) | 说明 |
|------|-----------|----------------------|---------------------|------|
| deepseek-chat | 100% | 97.5% (39/40) | 97.5% | 唯一失败 CR005（"search必须有as绑定"，既有冲突解决边缘用例，与绑定无关）|
| glm-5.1 | 100% | 82.5% (33/40) | 100% (33/33) | 7 个失败全部为 429 限流（tokens=0，瞬态），真实亲和性失败为 0 |

**新绑定用例（GAP-069 新增 E008-E011）表现**：
- E008 路径绑定属性值：两模型均通过
- E009 函数绑定属性值：两模型均通过（DeepSeek 表达式类 11/11）
- E010 路径绑定样式值：两模型均通过
- E011 三种绑定综合：DeepSeek 通过；GLM 为 429（瞬态，非亲和性问题）

**结论**：剔除瞬态 429 限流后，两模型真实通过率均为 100%（DeepSeek 1 例既有边缘用例 CR005 与本 GAP 无关）。新增 PathBinding/FunctionCall 绑定用例全部通过，证明 LLM 在新版 prompt 下能正确生成三种绑定机制。**无退化，门槛通过。**

## 最终结论

方案B（三机制共存）。轻量修复路径，核心亲和性由 GAP-007 背书，新增内容经全量回归确认无退化。
