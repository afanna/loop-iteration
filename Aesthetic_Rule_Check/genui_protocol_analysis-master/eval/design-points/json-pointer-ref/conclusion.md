# #18 表达式 JSON Pointer 变量引用方式亲和性评估

## 1. 设计背景

- **协议章节**: 3.5（表达式）+ 4.4.4（内置变量）
- **核心问题**: A2UI 协议的 `formatString` 函数使用 `${/json_pointer}` 语法引用变量。如果在鸿蒙 A2UI 表达式中新增这种引用方式，是否是模型亲和的？
- **评估动机**: 鸿蒙 A2UI 当前使用 `$__DataModel.user.name` 点分语法引用数据模型，而 A2UI 的 `formatString` 使用 `${/user/name}` JSON Pointer 语法。两种语法各有优劣，需要量化评估 LLM 对两种语法的生成能力。
- **与 V2 协议一致性**: 新增能力，当前协议使用 dot-notation

## 2. 对比方案

### 方案 A: dot-notation（当前设计）

```json
{
  "component": "Extended.Text",
  "content": "{{ $__DataModel.user.name }}",
  "styles": { "fontSize": "{{ $__DataModel.ui.fontSize }}" }
}
```

### 方案 B: json-pointer（新增设计）

```json
{
  "component": "Extended.Text",
  "content": "{{ ${/user/name} }}",
  "styles": { "fontSize": "{{ ${/ui/fontSize} }}" }
}
```

### 语法对比

| 场景 | A: dot-notation | B: json-pointer |
|------|----------------|-----------------|
| 绝对路径 | `{{ $__DataModel.user.name }}` | `{{ ${/user/name} }}` |
| 嵌套属性 | `{{ $__DataModel.user.profile.city }}` | `{{ ${/user/profile/address/city} }}` |
| 数组访问 | `{{ $__DataModel.orders[0].name }}` | `{{ ${/orders/0/name} }}` |
| 模板插值 | `` {{ `Hello, $__DataModel.user.name` }} `` | `` {{ `Hello, ${/user/name}!` }} `` |
| 相对路径 | `{{ $name }}` (不变) | `{{ $name }}` (不变) |

## 3. 测试用例

- **文件**: `test-cases/json-pointer-ref.json`
- **总计**: 15 个测试用例

| 复杂度 | 数量 | ID 范围 | 覆盖场景 |
|--------|------|---------|----------|
| simple | 5 | JP01-JP05 | 单绝对路径、数字类型、条件判断、模板插值、多字段拼接 |
| medium | 5 | JP06-JP10 | 嵌套属性、数组访问、动态样式、条件+样式、事件参数 |
| complex | 5 | JP11-JP15 | 格式化函数、复杂算术、Extended.If、混合绝对/相对、复合业务 |

- **边界用例**: 5 个（JP11-JP15，全部标记 `is_edge: true`）

## 4. 量化评估结果

### 4.1 综合维度评分

**DeepSeek-V3**（报告: `2026-04-24T06-51-57`）:

| 维度 | 权重 | A: dot-notation | B: json-pointer |
|------|------|-----------------|-----------------|
| D1 语法准确率 | 20% | **100.0%** | **100.0%** |
| D2 语义准确率 | 25% | **100.0%** | **100.0%** |
| D3 生成效率 | 15% | **100.0%** | **100.0%** |
| D4 学习曲线 | 15% | **100.0%** | **100.0%** |
| D5 边界鲁棒性 | 15% | **100.0%** | **100.0%** |
| D6 一致稳定性 | 10% | **100.0%** | **100.0%** |
| **MA 综合** | | **100.0% (A+)** | **100.0% (A+)** |

**GLM-5.1**（报告: `2026-04-24T06-54-02`）:

| 维度 | 权重 | A: dot-notation | B: json-pointer |
|------|------|-----------------|-----------------|
| D1 语法准确率 | 20% | **100.0%** | **100.0%** |
| D2 语义准确率 | 25% | **100.0%** | **100.0%** |
| D3 生成效率 | 15% | **100.0%** | **100.0%** |
| D4 学习曲线 | 15% | **100.0%** | **100.0%** |
| D5 边界鲁棒性 | 15% | **100.0%** | **100.0%** |
| D6 一致稳定性 | 10% | **100.0%** | **100.0%** |
| **MA 综合** | | **100.0% (A+)** | **100.0% (A+)** |

### 4.2 综合对比

| 模型 | A: dot-notation | B: json-pointer | 差值 |
|------|-----------------|-----------------|------|
| DeepSeek-V3 | **A+ 100.0%** | **A+ 100.0%** | 0.0% |
| GLM-5.1 | **A+ 100.0%** | **A+ 100.0%** | 0.0% |

### 4.3 D4 学习曲线明细

| 模型 | shot数 | A: dot-notation | B: json-pointer |
|------|--------|-----------------|-----------------|
| DeepSeek-V3 | 0-shot | 100% | 100% |
| | 1-shot | 100% | 100% |
| | 3-shot | 100% | 100% |
| GLM-5.1 | 0-shot | 100% | 100% |
| | 1-shot | 100% | 100% |
| | 3-shot | 100% | 100% |

两个模型的 0-shot 准确率均达 100%，说明两种语法对 LLM 来说都是直觉性知识，无需示例引导。

### 4.4 失败用例分析

**两个模型、两个策略均无失败**。Phase A 60 个测试（15 × 2策略 × 2模型）全部通过。

## 5. 结论

- **评估结论**: 两种变量引用语法（dot-notation 和 json-pointer）的模型亲和性**完全一致**，均为 A+ 级（DeepSeek 100.0%, GLM 100.0%）
- **核心发现**: LLM 对 `$__DataModel.user.name` 和 `${/user/name}` 两种语法同等亲和，不存在统计学差异
- **0-shot 可用**: 两种语法均不需要 few-shot 示例即可正确生成
- **建议**: `${/json_pointer}` 语法可以安全引入鸿蒙 A2UI 表达式系统，与 A2UI 的 formatString 语法保持一致性，且不影响模型亲和性
- **共存可行性**: 由于两种语法亲和性完全一致，如果需要同时支持两种语法（渐进式迁移），不会给模型带来额外负担

## 6. 如何运行

```bash
cd eval
npm install

# 完整评估（双模型双策略）
npm run eval:json-pointer

# 仅运行 DeepSeek
ONLY_MODEL=deepseek npm run eval:json-pointer

# 仅运行 GLM
ONLY_MODEL=glm npm run eval:json-pointer
```

**报告文件**:
- `reports/json-pointer-ref-comparison-*.*`
