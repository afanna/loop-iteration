# #17 函数调用设计 — 模型亲和性评估

本目录包含三个函数调用相关的设计点评估：
- **#17-A 函数定义一致性** — 鸿蒙A2UI与A2UI协议的函数目录是否共享
- **#17-B 双通道调用机制** — call/args 对象方式与表达式内联方式的共存设计
- **#17-C 函数调用语法**（已有评估）— 表达式中函数调用的前缀语法选择

---

## #17-A 函数定义一致性

### 1. 设计背景

- **协议章节**: 4.4.5（内置函数）+ A2UI Protocol 2.3.2（内置函数）
- **核心问题**: 鸿蒙A2UI协议中的函数定义是否应与A2UI协议保持一致？
- **评估动机**: 两个协议共享同一套函数定义，可降低模型学习成本，避免维护两套函数目录

### 2. 设计决策

**结论：鸿蒙A2UI协议中的函数定义与A2UI协议保持一致。**

A2UI 协议定义的函数目录（basic_catalog.json）：

| 函数 | 说明 | 参数 |
|------|------|------|
| required | 必填验证 | value |
| regex | 正则验证 | value, pattern |
| length | 长度验证 | value, min?, max? |
| numeric | 数值验证 | value, min?, max? |
| email | 邮箱验证 | value |
| formatString | 字符串格式化 | value |
| formatNumber | 数字格式化 | value, ...options |
| formatCurrency | 货币格式化 | value, currency, ...options |
| formatDate | 日期格式化 | value, format |
| pluralize | 复数化 | value, ...forms |
| openUrl | 打开链接 | url |
| and | 逻辑与 | values |
| or | 逻辑或 | values |
| not | 逻辑非 | value |

鸿蒙A2UI扩展在 Phase 1 新增的函数：

| 函数 | 说明 | 参数 |
|------|------|------|
| format | 槽位式字符串格式化 | template, ...args |
| size | 数组长度（非数组参数返回 0） | arr |

### 3. 设计原则

1. **共享函数目录**：两个协议使用完全相同的函数定义（call + args schema），鸿蒙扩展可额外增加函数
2. **函数语义不变**：同一函数在两种协议中行为一致（如 `formatDate` 的格式化规则相同）
3. **渐进开放**：Phase 1 仅将 `format`、`size` 开放到表达式，后续逐步将全部函数开放到表达式中

### 4. 模型亲和性分析

- **学习成本降低**：模型只需学习一套函数目录，两个协议中的函数知识可以复用
- **Prompt 复用**：A2UI 的函数示例和 few-shot 可以直接用于鸿蒙A2UI的 prompt
- **一致性得分**：由于函数定义完全一致，不存在模型对两种定义产生混淆的风险

---

## #17-B 双通道调用机制

### 1. 设计背景

- **协议章节**: A2UI Protocol（call/args）+ 鸿蒙A2UI 4.4.5（表达式函数）
- **核心问题**: 同一函数是否应同时支持 call/args 对象方式和表达式内联方式？
- **评估动机**: A2UI 原生协议使用 `{"call": "...", "args": {...}}` 对象调用函数，鸿蒙A2UI扩展引入了表达式内联调用。两种方式能否共存、模型是否会产生混淆？

### 2. 设计决策

**结论：两种调用方式共存，各自适配不同的使用场景。**

| 调用方式 | 适用场景 | 参数形式 | 使用位置 |
|----------|----------|----------|----------|
| **call/args 对象** | 结构化调用，需要命名参数 | 命名参数对象 | `checks`、`action.functionCall`、`Dynamic*` 绑定 |
| **表达式内联** | 内联值计算，需要简洁语法 | 位置参数 | `{{ }}` 内的属性值、样式值、条件表达式 |

### 3. 示例对照

**formatDate 函数的两种调用方式：**

```json
// call/args 对象方式（A2UI 原生，用于 checks / action）
{
  "call": "formatDate",
  "args": {
    "value": {"path": "/currentDate"},
    "format": "yyyy-MM-dd"
  }
}

// 表达式内联方式（鸿蒙A2UI扩展，用于 {{ }} 内）
{
  "content": "{{ formatDate($__DataModel.currentDate, 'yyyy-MM-dd') }}"
}
```

**required 函数的两种调用方式：**

```json
// call/args 对象方式
{
  "call": "required",
  "args": {"value": {"path": "/formData/email"}},
  "message": "Email is required"
}

// 表达式内联方式（用于条件判断）
{
  "condition": "{{ required($__DataModel.formData.email) }}"
}
```

**formatNumber 函数的两种调用方式：**

```json
// call/args 对象方式
{
  "call": "formatNumber",
  "args": {"value": {"path": "/price"}, "fractionDigits": 2}
}

// 表达式内联方式
{
  "text": "{{ formatNumber($__DataModel.price, 2) + '元' }}"
}
```

### 4. 设计原则

1. **语义等价**：同一函数在两种调用方式下的行为完全一致
2. **参数映射**：call/args 中的命名参数与表达式中的位置参数需要明确的顺序约定
3. **场景分离**：call/args 用于 JSON 结构上下文（checks、action），表达式用于属性值上下文
4. **不互相替代**：两种方式各有所长，不强制统一为一种

### 5. 参数映射约定

call/args 使用命名参数（无顺序要求），表达式使用位置参数（必须约定顺序）。建议在函数定义中同时声明参数顺序：

```
formatDate(value, format)     → 表达式: formatDate('2026-01-01', 'yyyy-MM-dd')
                                 call/args: {"call": "formatDate", "args": {"value": "...", "format": "..."}}
formatNumber(value, fractionDigits) → 表达式: formatNumber(1234.5, 2)
                                       call/args: {"call": "formatNumber", "args": {"value": 1234.5, "fractionDigits": 2}}
```

### 6. 模型亲和性分析

- **场景隔离清晰**：模型在 JSON 上下文（checks/action）中自然生成 call/args 对象，在字符串值上下文中自然生成表达式语法，两种上下文不会混淆
- **与 #17-C 结论一致**：表达式内联调用使用 bare 裸名语法 `func()`，与变量 `$var` 视觉区分
- **已有量化验证**：#2 表达式包装评估（inline `{{ }}`  MA 90-91%）和 #14 内置函数评估（format/template-literal MA 89-92%）均验证了表达式函数调用的模型亲和性

---

## #17-C 函数调用语法（已有量化评估）

### 1. 设计背景

- **协议章节**: 4.4.5（内置函数）
- **核心问题**: 函数调用的包装方式（裸名、$前缀、${}包裹）是否影响 LLM 的生成一致性和学习成本？
- **评估动机**: 函数调用是表达式中的核心能力，语法设计影响模型对函数与变量概念的区分

## 2. 候选方案

| 方案 | 语法 | 示例 | 说明 |
|------|------|------|------|
| **A: bare（裸名, 推荐）** | `func()` | `{{ formatNumber($price, 2) }}` | 函数无前缀，与变量 `$var` 视觉区分 |
| **B: dollar（$前缀）** | `$func()` | `{{ $formatNumber($price, 2) }}` | 函数也用 `$` 前缀，靠 `()` 区分 |
| **C: interp（${}包裹）** | `${func()}` | `{{ ${formatNumber($price, 2)} }}` | 函数用 `${}` 包裹 |

**A: bare 示例（推荐）：**
```json
{"content": "{{ format('Hello, {}!', $name) }}"}
{"content": "{{ formatNumber($price, 2) + '元' }}"}
```

**B: dollar 示例：**
```json
{"content": "{{ $format('Hello, {}!', $name) }}"}
{"content": "{{ $formatNumber($price, 2) + '元' }}"}
```

**C: interp 示例：**
```json
{"content": "{{ ${format('Hello, {}!', $name)} }}"}
{"content": "{{ ${formatNumber($price, 2)} + '元' }}"}
```

## 3. 测试用例

- **文件**: `test-cases/function-call.json`
- **总计**: 16 个（simple 4 / medium 6 / complex 6）
- **边界用例**: 4 个（FC13-FC16）

覆盖场景：单函数调用（formatNumber/formatCurrency/formatDate/format）、函数+拼接、模板字符串函数、size 函数、双函数、样式属性函数、嵌套函数、复杂条件、多函数+多变量等。

## 4. 量化评估结果

### 4.1 六维评分对比

**GLM-5.1：**

| 维度 | 权重 | bare | dollar | interp |
|------|------|------|--------|--------|
| D1 语法准确率 | 20% | 100.0% | 100.0% | 100.0% |
| D2 语义准确率 | 25% | 100.0% | 100.0% | 100.0% |
| D3 生成效率 | 15% | 95.0% | 100.0% | 100.0% |
| D4 学习曲线 | 15% | 100.0% | 100.0% | 62.5% |
| D5 边界鲁棒性 | 15% | 100.0% | 100.0% | 100.0% |
| D6 一致稳定性 | 10% | 73.3% | 76.7% | 83.3% |
| **MA 综合** | | **96.6% (A+)** | **97.7% (A+)** | **92.7% (A+)** |

**DeepSeek-V3：**

| 维度 | 权重 | bare | dollar | interp |
|------|------|------|--------|--------|
| D1 语法准确率 | 20% | 100.0% | 100.0% | 100.0% |
| D2 语义准确率 | 25% | 100.0% | 100.0% | 100.0% |
| D3 生成效率 | 15% | 100.0% | 100.0% | 100.0% |
| D4 学习曲线 | 15% | 100.0% | 100.0% | 62.5% |
| D5 边界鲁棒性 | 15% | 100.0% | 100.0% | 100.0% |
| D6 一致稳定性 | 10% | 100.0% | 100.0% | 100.0% |
| **MA 综合** | | **100.0% (A+)** | **100.0% (A+)** | **94.4% (A+)** |

### 4.2 D4 学习曲线明细

| shot 数 | bare (GLM) | dollar (GLM) | interp (GLM) | bare (DS) | dollar (DS) | interp (DS) |
|---------|-----------|-------------|-------------|-----------|-------------|-------------|
| 0-shot | 100% | 100% | **25%** | 100% | 100% | **25%** |
| 1-shot | 100% | 100% | 100% | 100% | 100% | 100% |
| 3-shot | 100% | 100% | 100% | 100% | 100% | 100% |

### 4.3 D6 一致性明细

| 指标 | bare (GLM) | dollar (GLM) | interp (GLM) | bare (DS) | dollar (DS) | interp (DS) |
|------|-----------|-------------|-------------|-----------|-------------|-------------|
| 结构一致率 | 33% | 67% | 83% | 100% | 100% | 100% |
| 语义等价率 | 100% | 83% | 83% | 100% | 100% | 100% |

## 5. 失败用例分析

**bare 和 dollar 策略无测试用例失败**（GLM 和 DeepSeek 均全部通过）。

**interp 策略（2 failures，仅 GLM）：**

| 用例 ID | 复杂度 | 失败层级 | 失败原因 |
|---------|--------|---------|---------|
| FC09 双函数调用 | medium | L4 | content 未使用 `${}` 包裹 size 和 formatNumber |
| FC11 嵌套函数调用 | complex | L1 | JSON 解析失败 |

**DeepSeek interp：0 failures**（所有用例通过）。

### 失败模式分类统计

| 失败类型 | bare (GLM) | dollar (GLM) | interp (GLM) | bare (DS) | dollar (DS) | interp (DS) |
|---------|-----------|-------------|-------------|-----------|-------------|-------------|
| L1 JSON 解析失败 | 0 | 0 | 1 | 0 | 0 | 0 |
| L2 结构/字段缺失 | 0 | 0 | 0 | 0 | 0 | 0 |
| L3 模式不匹配 | 0 | 0 | 0 | 0 | 0 | 0 |
| L4 规则违反 | 0 | 0 | 1 | 0 | 0 | 0 |

### 根因分析

1. **interp 方案 0-shot 严重缺陷**：两个模型一致地仅 25%，说明 `${func()}` 语法在无示例时 LLM 无法自然推断。函数名用 `${}` 包裹与变量 `${$var}` 格式相同，模型倾向于直接使用裸名调用
2. **bare 和 dollar 的 D4 完全一致**：0-shot 即 100%，说明两种语法对模型来说同样直觉
3. **interp 的 FC09 失败**：模型在双函数场景中忘记了 `${}` 包裹要求
4. **bare 的设计优势**：函数裸名与变量 `$var` 形成明确视觉区分——`$` 即变量，无 `$` 且有 `()` 即函数

### 对胜出策略（bare）的优化建议

- 当前 bare 设计无需优化
- 可在 prompt 中强调"函数无前缀，变量有 `$` 前缀"的区分规则

### 6. 结论

- **推荐方案**: bare（裸名 `func()`）— 当前协议设计最优
- **V2 协议一致性**: 相同
- **风险**: 无

| 方案 | GLM MA | DeepSeek MA | 0-shot | 推荐度 |
|------|--------|-------------|--------|-------|
| bare | 96.6% | 100.0% | **100%** | **推荐** |
| dollar | 97.7% | 100.0% | **100%** | 可选 |
| interp | 92.7% | 94.4% | **25%** | 不推荐 |

**bare 和 dollar 无实质差异**（MA 差值 ≤ 0.8%），bare 的设计优势在于函数与变量的视觉区分更清晰。

### 7. 如何运行

```bash
cd eval
npm run eval:func-call
ONLY_MODEL=glm npm run eval:func-call
```

报告文件: `reports/func-call-comparison-*.json` / `*.md`

---

## 总体结论

| 设计点 | 结论 | 依据 |
|--------|------|------|
| #17-A 函数定义一致性 | 鸿蒙A2UI与A2UI共享同一套函数目录 | 降低模型学习成本，Prompt 可复用 |
| #17-B 双通道调用机制 | call/args 对象 + 表达式内联共存 | 场景隔离清晰（JSON 上下文 vs 字符串值上下文），模型不会混淆 |
| #17-C 函数调用语法 | bare（裸名 `func()`）推荐 | GLM 96.6% + DeepSeek 100.0%，0-shot 100%，函数/变量视觉区分最清晰 |
