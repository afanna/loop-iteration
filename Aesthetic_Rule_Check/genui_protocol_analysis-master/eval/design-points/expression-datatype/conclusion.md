# #11 表达式数据类型 — 协议验证评估

## 1. 设计背景

- **协议章节**: 4.4.2（数据类型）+ 4.4.6（类型转换）
- **核心问题**: 鸿蒙 A2UI 协议定义的类型系统（三种基本类型 + 自动转换规则）是否模型亲和？
- **评估动机**: 验证协议 4.4.2 + 4.4.6 的设计对 LLM 生成的友好程度，而非方案选型。

## 2. 协议设计

鸿蒙 A2UI 协议定义了一个 **typed + 自动转换** 的类型系统：

### 2.1 三种基本类型（4.4.2）

```json
{"content": "{{ 'Hello, ' + $name }}"}     // string: 单引号
{"content": "{{ $price * $quantity }}"}     // number: 裸写
{"condition": "{{ $age >= 18 }}"}           // boolean: true/false（必须小写）
{"content": "{{ `共${$count}件` }}"}        // 模板字符串: 反引号 + ${}
```

### 2.2 自动类型转换（4.4.6）

| 运算 | 转换规则 |
|------|----------|
| string + number | number转string，拼接 |
| string + boolean | boolean转string，拼接 |
| number + string | number转string，拼接 |
| boolean + number | boolean转number（true=1, false=0） |
| !value | 转boolean，取反 |

**注意**: 已改为 symmetric（JS风格），`number + string` 与 `string + number` 行为一致：拼接。GAP-011 结论修正合入。

## 3. 测试用例

- **文件**: `test-cases/expr-datatype-v2.json`
- **总计**: 20 个测试用例
- **难度分布**: simple 5 / medium 5 / complex 10
- **边界用例**: 5 个（D01-D05）
- **风险用例**: 4 个（B03, B04, D01, D03）— 标记了不对称规则或特殊转换行为

| 类别 | 数量 | ID 范围 | 覆盖场景 |
|------|------|---------|----------|
| A 字面量语法 | 5 | A01-A05 | string 单引号、number 裸写、boolean 小写、模板字符串、比较运算 |
| B 转换规则 | 5 | B01-B05 | string+number、string+boolean、number+string（不对称）、boolean+number、!取反 |
| C 转换+运算符 | 5 | C01-C05 | 比较→三元、布尔+数字+字符串、嵌套算术、formatNumber、多类型混合 |
| D 边界/风险 | 5 | D01-D05 | number+非数字字符串、复杂条件拼接、布尔算术、嵌套三元、复杂算术+括号 |

## 4. 量化评估结果

### 4.1 综合维度评分

**GLM-5.1**:

| 维度 | 权重 | 得分 |
|------|------|------|
| D1 语法准确率 | 20% | 100.0% |
| D2 语义准确率 | 25% | 100.0% |
| D3 生成效率 | 15% | 100.0% |
| D4 学习曲线 | 15% | 100.0% |
| D5 边界鲁棒性 | 15% | 100.0% |
| D6 一致稳定性 | 10% | 70.0% |
| **MA 综合** | | **97.0% (A+)** |

**DeepSeek-V3**:

| 维度 | 权重 | 得分 |
|------|------|------|
| D1 语法准确率 | 20% | 100.0% |
| D2 语义准确率 | 25% | 100.0% |
| D3 生成效率 | 15% | 100.0% |
| D4 学习曲线 | 15% | 100.0% |
| D5 边界鲁棒性 | 15% | 100.0% |
| D6 一致稳定性 | 10% | 92.5% |
| **MA 综合** | | **99.2% (A+)** |

### 4.2 类别通过率

| 类别 | GLM-5.1 | DeepSeek-V3 |
|------|---------|-------------|
| A 字面量语法 | 5/5 | 5/5 |
| B 转换规则 | 5/5 | 5/5 |
| C 转换+运算符 | 5/5 | 5/5 |
| D 边界/风险 | 5/5 | 5/5 |

**20/20 全部通过，0 个失败用例。**

### 4.3 D4 学习曲线

| 模型 | 0-shot | 1-shot | 3-shot |
|------|--------|--------|--------|
| GLM-5.1 | 100% | 100% | 100% |
| DeepSeek-V3 | 100% | 100% | 100% |

两个模型 0-shot 即达 100%，表明协议类型系统无需额外学习即可被模型正确应用。

## 5. 风险分析

### 5.1 不对称转换规则（已解决）

协议 4.4.6 中 `number + string` 与 `string + number` 行为原来不对称，评估证实为亲和性风险点。**GAP-011 已合入，改为 symmetric（JS风格）。**

| 用例 | 验证点 | GLM-5.1 | DeepSeek-V3 |
|------|--------|----------|-------------|
| B03 | number + '元' | OK — 用模板字符串 `${$total}元` | OK — 直接 `$total + '元'` |
| D01 | number + 'abc' | OK — 用模板字符串 `${$count}abc` | OK — 直接 `$count + 'abc'` |

**分析**: 在原 asymmetric 规则下，模型通过模板字符串（GLM）或 JS 语义（DeepSeek）绕过了不对称规则，未真正遵循 `number + string → 尝试转number`。改为 symmetric 后，两模型的行为（模板字符串、`+` 拼接）均符合协议，消除了亲和性风险。

### 5.2 与已有评估的交叉验证

在 `expression-function` 设计点下已有 asymmetric vs symmetric 对比评估（[报告](../expression-function/reports/type-conv-comparison-2026-04-15T12-49-53.md)），symmetric 在所有维度上均优于 asymmetric，该数据是 GAP-011 改为 symmetric 的核心依据：

| 模型 | asymmetric (旧设计) | symmetric (JS风格) | 差值 |
|------|---------------------|-------------------|------|
| GLM-5.1 | 86.5% (A) | **97.5% (A+)** | +11.0% |
| DeepSeek-V3 | 86.5% (A) | **100.0% (A+)** | +13.5% |

symmetric（JS风格）在所有维度上均优于 asymmetric，D4 学习曲线差距尤其大（+19~23%）。这是 GAP-011 将 `+` 运算符类型转换改为 symmetric 的核心依据。

## 6. 结论

- **评估类型**: 协议验证（非方案对比）
- **验证结果**: 协议 4.4.2 + 4.4.6 类型系统 MA 均 >96%，达到 A+ 级
- **综合评分**: GLM 97.0% (A+) + DeepSeek 99.2% (A+) = 平均 **98.1% (A+)**
- **与协议一致性**: 相同（直接验证协议设计）

### 风险提示（已解决）

原 `number + string → 尝试转number` 的不对称规则已被 GAP-011 修正为 symmetric（JS风格）：
1. 本评估中模型通过模板字符串（GLM）或 JS 语义（DeepSeek）绕过了原不对称规则
2. asymmetric vs symmetric 对比评估证实 symmetric 显著优于 asymmetric（+7.6~9.7%）
3. **结论**: 已合入 — `+` 运算符的类型转换改为 symmetric（JS风格）

## 7. 如何运行

```bash
cd eval
npm install

# 协议验证评估（双模型）
npm run eval:datatype-v2

# 仅运行 DeepSeek
ONLY_MODEL=deepseek npm run eval:datatype-v2

# 仅运行 GLM
ONLY_MODEL=glm npm run eval:datatype-v2
```

### 报告文件

```
eval/design-points/expression-datatype/
├── README.md                                                    # 本文件
├── test-cases/
│   ├── expression-datatype.json                                 # 原评估测试用例（已废弃）
│   └── expr-datatype-v2.json                                    # 协议验证测试用例（20 个）
└── reports/
    ├── expr-datatype-v2-2026-04-24T03-10-16.*                   # 协议验证报告
    ├── expr-datatype-comparison-2026-04-16T15-57-33.*           # 原三方案对比报告（已废弃）
    └── type-conv-comparison-2026-04-15T12-49-53.*               # asymmetric vs symmetric 报告（expression-function 目录）
```
