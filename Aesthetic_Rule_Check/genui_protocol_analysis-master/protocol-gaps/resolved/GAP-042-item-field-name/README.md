# GAP-042: 模板渲染 — $item.fieldName 替换 $fieldName 隐式引用

**优先级**: P0（强烈建议）
**日期**: 2026-05-01
**来源**: eval/design-points/variable-system — 4.4.4 变量体系统一评估

---

## 1. 当前协议设计

4.4.4 节模板渲染中，默认使用 `$fieldName` 隐式相对路径引用当前项字段：

```json
{"content": "{{ $name }}"}
{"content": "{{ $price }}"}
{"content": "{{ $text }}"}
```

LLM 通过 Rule 8 被告知：`模板中用 $fieldName 相对路径引用字段`。

---

## 2. 问题

`$name` 隐式字段展开是 A2UI 协议独有设计，与所有主流模板语言的 `item.property` 模式冲突：

| 模板语言 | 语法 |
|----------|------|
| JavaScript | `item.name` |
| Vue | `{{ item.name }}` |
| Handlebars | `{{ item.name }}` |
| Jinja2 | `{{ item.name }}` |
| Django | `{{ item.name }}` |
| Laravel Blade | `{{ $item->name }}` |
| EJS | `<%= item.name %>` |

**验证数据**（61 例，3-shot，双模型）：

| 指标 | $fieldName 设计 | $item.fieldName 设计 | 差距 |
|------|---------------|---------------------|------|
| DeepSeek MA | 92.5% (A+) | 98.0% (A+) | +5.5% |
| GLM MA | 90.4% (A+) | 97.0% (A+) | +6.6% |
| DS Phase A | 88.5% (54/61) | 100% (61/61) | +11.5% |
| GLM Phase A | 83.6% (51/61) | 100% (61/61) | +16.4% |

**失败模式 100% 相同**：LLM 生成 `$item.name` 等通用语法，验证规则要求 `$name`，LLM 输出语义正确但被判定失败。3-shot 示例无法根除——模型在训练数据模式和协议特有语法之间振荡。

---

## 3. 修改方案

### 修改内容

| 项目 | 修改前 | 修改后 |
|------|--------|--------|
| 模板字段访问 | `$name`, `$price`, `$text` | `$item.name`, `$item.price`, `$item.text` |
| 嵌套对象访问 | `$product.name`（无 itemVar 时） | `$item.product.name` |
| $index | `$index` | `$index`（**不变**） |
| 自定义 itemVar | `$product.name`（有 itemVar 时） | `$product.name`（**不变**） |
| $context / $__DataModel / as 变量 | 不变 | 不变 |

### System Prompt Rule 8

```
修改前: 8. 模板中用 $fieldName 相对路径引用字段，用 $index 引用索引。
修改后: 8. 模板中用 $item.fieldName 引用当前项字段（如 $item.name），用 $index 引用索引。
         自定义 itemVar 时用 $customName.fieldName。
```

---

## 4. 影响范围

| 影响 | 说明 |
|------|------|
| 协议 4.4.4 节 | 相对路径示例全部改为 `$item.fieldName` 形式 |
| 协议 4.4.4 节 | 删除"使用场景：$name, $price, $category"中的隐式访问示例 |
| EBNF 文法 | 相对路径语法规则更新 |
| 所有 protocol summary | 变量引用表更新 |
| **不影响** | DataModel 绝对路径（$__DataModel.xxx）、全局变量、as 绑定、$context、$index |

---

## 5. 评估报告

- `variable-system-deepseek-2026-05-01T06-52-16.json` — DeepSeek $item.fieldName 61/61 通过
- `variable-system-glm-2026-05-01T08-39-59.json` — GLM $item.fieldName 61/61 通过
- `variable-system-deepseek-2026-05-01T07-01-06.json` — DeepSeek $fieldName 54/61 (对比)
- `variable-system-glm-2026-05-01T07-06-21.json` — GLM $fieldName 51/61 (对比)
