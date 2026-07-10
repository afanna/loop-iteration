# #7 数据模型访问语法 — 模型亲和性评估

## 1. 设计背景

- **协议章节**: 4.4.4（数据模型）
- **核心问题**: 数据模型的变量读取使用 dot-path（`{{ $__DataModel.user.name }}`）还是 json-pointer（`{"path": "/user/name"}`）？
- **评估动机**: 数据模型访问是 UI 动态化的核心能力。dot-path 可嵌入表达式（模板字符串、算术、条件），json-pointer 是 A2UI 原生格式但表达力受限。需量化评估确定最优方案。
- **与 V2 协议一致性**: 相同（V2 使用 dot-path）

**评估前提**: 变量写入统一使用 `updateDataModel`（与 A2UI 一致），不作为评估变量。仅评估读取/引用语法。

## 2. 候选方案

| 方案 | 读取语法 | 示例 | 能否嵌入表达式 |
|------|----------|------|--------------|
| **A: dot-path**（推荐） | `{{ $__DataModel.user.name }}` | `{"content": "{{ $__DataModel.user.name }}"}` | 可以 |
| **B: json-pointer** | `{"path": "/user/name"}` | `{"content": {"path": "/user/name"}}` | 不可以 |

**写入方式（两种方案相同）**: 通过 `setDataModel` / `getDataModel` 的 `path` 参数使用 JSON Pointer 格式（与 A2UI 一致）。

**A: dot-path 示例（推荐）：**
```json
{"content": "{{ $__DataModel.user.name }}"}
{"content": "{{ `你好, ${$__DataModel.user.name}` }}"}
{"content": "{{ $__DataModel.price * $__DataModel.quantity }}"}
{"styles": {"fontSize": "{{ $__DataModel.config.fontSize }}"}}
```

**B: json-pointer 示例：**
```json
{"content": {"path": "/user/name"}}
{"content": {"path": "/user/name"}}                    // 无法嵌入"你好,"
{"content": {"path": "/price"}}                         // 无法表达 price * quantity
```

**核心差异**: dot-path 可自然嵌入模板字符串、算术运算、条件表达式；json-pointer 的 `{"path": ...}` 结构只能表示单一数据路径，无法组合。

## 3. 测试用例

- **文件**: `test-cases/data-model-access.json`
- **总计**: 20 个

| 复杂度 | 数量 | ID 范围 | 覆盖场景 |
|--------|------|---------|----------|
| simple | 4 | DM001-DM004 | 单一字段读取、嵌套字段读取、TextInput 绑定、Progress 值绑定 |
| medium | 8 | DM005-DM012 | 模板字符串、条件渲染、样式动态值、setDataModel 写入、多字段模板、getDataModel、局部变量+数据模型、List 路径绑定 |
| complex | 8 | DM013-DM020 | 深层嵌套(4层)、多字段+样式、数据模型+算术、条件样式、事件链读写、List 渲染+写入、格式化函数、四字段模板+写入 |

- **边界用例**: 8 个（DM013-DM020）

## 4. 量化评估结果

### 4.1 综合维度评分

**DeepSeek-V3**（报告: `2026-04-22T16-22-11`）:

| 维度 | 权重 | dot-path | json-pointer |
|------|------|----------|-------------|
| D1 语法准确率 | 20% | **100.0%** | 100.0% |
| D2 语义准确率 | 25% | **100.0%** | 79.0% |
| D3 生成效率 | 15% | **100.0%** | 68.0% |
| D4 学习曲线 | 15% | **95.0%** | 85.0% |
| D5 边界鲁棒性 | 15% | **100.0%** | 56.3% |
| D6 一致稳定性 | 10% | **95.0%** | 80.0% |
| **MA 综合** | | **98.8% (A+)** | **79.1% (B)** |

**GLM-5.1**（报告: `2026-04-22T13-47-33`）:

| 维度 | 权重 | dot-path | json-pointer |
|------|------|----------|-------------|
| D1 语法准确率 | 20% | **100.0%** | 100.0% |
| D2 语义准确率 | 25% | **100.0%** | 91.0% |
| D3 生成效率 | 15% | **100.0%** | 80.0% |
| D4 学习曲线 | 15% | **100.0%** | 95.0% |
| D5 边界鲁棒性 | 15% | **100.0%** | 81.3% |
| D6 一致稳定性 | 10% | **85.0%** | 67.5% |
| **MA 综合** | | **98.5% (A+)** | **87.9% (A)** |

### 4.2 综合对比

| 方案 | DeepSeek-V3 | GLM-5.1 | 平均 MA | 等级 |
|------|-------------|---------|---------|------|
| **dot-path** | **98.8% (A+)** | **98.5% (A+)** | **98.7%** | **A+** |
| json-pointer | 79.1% (B) | 87.9% (A) | 83.5% | A |

### 4.3 D4 学习曲线明细

| 模型 | 策略 | 0-shot | 1-shot | 3-shot |
|------|------|--------|--------|--------|
| DeepSeek-V3 | dot-path | 90% | 100% | 100% |
| DeepSeek-V3 | json-pointer | 90% | 80% | 80% |
| GLM-5.1 | dot-path | 100% | 100% | 100% |
| GLM-5.1 | json-pointer | 90% | 100% | 100% |

dot-path 在 GLM 上 0-shot 即达满分。json-pointer 在 DeepSeek 上 0-shot 仅 90% 且 1/3-shot 降至 80%，说明模型难以完全掌握 json-pointer 语法。

### 4.4 D6 一致性明细

| 模型 | 策略 | 结构一致率 | 语义等价率 |
|------|------|-----------|-----------|
| DeepSeek-V3 | dot-path | 88% | 100% |
| DeepSeek-V3 | json-pointer | 50% | 100% |
| GLM-5.1 | dot-path | 63% | 100% |
| GLM-5.1 | json-pointer | 38% | 88% |

dot-path 语义等价率均为 100%。json-pointer 结构一致率较低，说明模型在重复生成时 json-pointer 格式变化更大。

## 5. 失败用例分析

### DeepSeek-V3

**dot-path: 0 个失败**（20/20 全部通过）。

**json-pointer（7 个失败）**:

| 用例 ID | 用例名称 | 复杂度 | 失败描述 |
|---------|----------|--------|----------|
| DM005 | 模板字符串 | medium | content 仅 `{"path": "/user/name"}`，不包含"你好"文字 |
| DM009 | 多字段模板 | medium | 模型用 `$user.name` 表达式而非 path 对象 |
| DM014 | 多字段+样式 | complex | styles 用 expr 表达式而非 path 对象 |
| DM015 | 数据模型+算术 | complex | content 用 `$price * $quantity` 表达式（无法用 path 表示算术） |
| DM016 | 条件样式 | complex | styles 用 `$status > 0 ? ...` 表达式（无法用 path 表示条件） |
| DM019 | 格式化函数 | complex | content 用 `formatNumber($product.price, 2)` 表达式 |
| DM020 | 四字段+写入 | complex | children 中部分字段缺失 path 引用 |

### GLM-5.1

**dot-path: 0 个失败**（20/20 全部通过）。

**json-pointer（3 个失败）**:

| 用例 ID | 用例名称 | 复杂度 | 失败描述 |
|---------|----------|--------|----------|
| DM011 | 数据模型+局部变量 | medium | 模型用 `${$greeting}, ${$user.name}` 表达式而非 path 对象 |
| DM015 | 数据模型+算术 | complex | 模型用 `$price * $quantity` 表达式（无法用 path 表示算术） |
| DM016 | 条件样式 | complex | 模型用 `$status > 0 ? ...` 表达式（无法用 path 表示条件） |

### 失败模式分类

| 失败类型 | dot-path | json-pointer |
|----------|----------|-------------|
| L1 JSON 解析失败 | 0 | 0 |
| L2 字段缺失 | 0 | 0 |
| L3 模式不匹配 | 0 | 0 |
| L4 规则违反 | 0 | 10 (DeepSeek 7 + GLM 3) |
| **总失败数** | **0** | **10** |

### 根因分析

1. **json-pointer 表达力不足是根本问题**: `{"path": "/user/name"}` 只能表示单一数据路径。当场景需要：
   - 模板文字+数据（DM005 "你好, " + name）
   - 多字段引用（DM009 name + score）
   - 算术运算（DM015 price * quantity）
   - 条件表达式（DM016 status > 0 ? ...）
   - 函数调用（DM019 formatNumber）
   
   LLM 自然地退回到 `{{ }}` 表达式或 `{"expr": "..."}` 格式，因为这是训练数据中最常见的数据绑定模式。

2. **GLM 比 DeepSeek 更适应 json-pointer**: GLM 仅 3 个失败 vs DeepSeek 7 个，因为 GLM 在简单/中等场景能正确使用 json-pointer。但在涉及算术、条件等复杂场景时，两者都退回到表达式格式。

3. **dot-path 在双模型上零失败**: `{{ $__DataModel.xxx }}` 格式与 JavaScript 模板字符串高度一致，是 LLM 训练数据中最常见的数据绑定模式，无需额外学习。

### 优化建议

- 当前 dot-path 设计无需优化
- **两种方式共存，各司其职**：dot-path 和 json-pointer 不是互斥方案，而是服务于协议的不同场景

## 6. 结论

**协议需同时支持 dot-path 和 json-pointer，两者互补而非竞争。**

- **dot-path** (`$__DataModel.xxx.yyy`) — 用于**表达式中嵌入数据模型值**。评估验证：双模型 A+（DS 98.8%, GLM 98.5%），20/20 零失败。适用于字符串插值、算术运算、条件表达式、函数调用等需要将数据值与表达式组合的场景。

- **json-pointer** (`/user/name`) — 用于**路径规范**。适用于：
  - A2UI 原生 `updateDataModel` / `setDataModel` 的 `path` 参数
  - 模板渲染的 `children.path` 字段（如 `{"path": "/users"}`）
  - A2UI 原生 `{"path": "/user/name"}` 格式在简单单路径取值场景

**为什么原评估不能简单地说"dot-path 胜出，json-pointer 淘汰"**：

1. json-pointer 是 A2UI 原生协议的路径规范，`updateDataModel`、模板渲染的 `path` 字段都依赖它
2. dot-path 和 json-pointer 服务于不同的协议层面——dot-path 解决"如何在表达式中取值"，json-pointer 解决"如何指定数据路径"
3. 原评估中将 json-pointer 用于表达式场景（如 `{"content": {"path": "/user/name"}}`），这本身就是用错了地方——json-pointer 的语义是"路径"，不是"表达式求值"

**修正后的结论**：

| 场景 | 使用 | 理由 |
|------|------|------|
| 表达式内容/样式/条件 | dot-path `$__DataModel.xxx` | 可嵌入算术、条件、函数、模板字符串 |
| updateDataModel/setDataModel path | json-pointer `/path/to/field` | A2UI 原生规范 |
| 模板渲染 children.path | json-pointer `/users` | A2UI 原生规范 |
| 简单单值绑定（非表达式上下文） | json-pointer `{"path": "/name"}` | A2UI 原生规范，可选 |

## 7. 如何运行

```bash
cd eval
npm install

# 完整评估（双模型 x 二策略）
npm run eval:data-model

# 仅运行 DeepSeek
ONLY_MODEL=deepseek npm run eval:data-model

# 仅运行 GLM
ONLY_MODEL=glm npm run eval:data-model
```

**报告文件**:
- `reports/data-model-access-comparison-2026-04-22T13-47-33.*` — GLM
- `reports/data-model-access-comparison-2026-04-22T16-22-11.*` — DeepSeek
