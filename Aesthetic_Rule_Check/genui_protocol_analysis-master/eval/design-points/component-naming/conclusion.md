# #4 组件命名：是否需要 Extended 前缀

## 1. 设计背景

- **协议章节**: 3.1/3.2（组件定义）
- **核心问题**: 扩展组件的命名方式对 LLM 生成准确率是否有影响？
- **评估动机**: 当前使用 `Extended.` 前缀（如 `Extended.Text`），需量化确认是否影响模型生成
- **与 V2 协议一致性**: 相同（Same）

协议 3.1/3.2 节定义了组件命名方式。当前设计使用 `Extended.` 前缀（如 `Extended.Text`、`Extended.Button`）区分扩展组件与原生组件。本评估对比三种命名策略，量化模型对每种命名方式的亲和性差异。

## 2. 候选方案

| 策略 | 命名示例 | 说明 |
|------|----------|------|
| **A: extended-prefix**（当前设计） | `Extended.Text`、`Extended.Button` | 点分前缀，语义清晰 |
| **B: unified-name** | `Text`、`Button` | 与原生统一，靠 catalogId 区分 |
| **C: short-prefix**（H 前缀） | `HText`、`HButton` | 短前缀 H，简洁紧凑 |

**JSON 示例对比：**

A: extended-prefix（当前设计）:
```json
{"component": "Extended.Text", "content": "Hello"}
{"component": "Extended.Button", "label": "提交", "listeners": {"onClick": [{"action": "submit"}]}}
```

B: unified-name:
```json
{"component": "Text", "content": "Hello"}
{"component": "Button", "label": "提交", "listeners": {"onClick": [{"action": "submit"}]}}
```

C: short-prefix（H 前缀）:
```json
{"component": "HText", "content": "Hello"}
{"component": "HButton", "label": "提交", "listeners": {"onClick": [{"action": "submit"}]}}
```

**Token 成本对比**（每组件名）:

| 策略 | 示例 | 估算 Token 数 |
|------|------|--------------|
| extended-prefix | `Extended.Text` | ~3 tokens |
| unified-name | `Text` | ~1 token |
| short-prefix | `HText` | ~2 tokens |

每个组件名 extended-prefix 比 unified-name 多消耗约 2 tokens。假设典型场景单次会话平均 20 个组件、用户日均 3 次调用：

| 指标 | Extended vs 无前缀 | Extended vs H 前缀 |
|------|-------------------|-------------------|
| 每次额外 tokens | ~40 | ~20 |
| 千万 DAU 每日额外 tokens | 12 亿 | 3 亿 |
| 千万 DAU 月度额外 tokens | 360 亿 | 90 亿 |

按输出 token 定价（通常为输入 token 的 3-5 倍）估算，月度额外成本在千万元 DAU 规模下不可忽略。

## 3. 测试用例

- **文件**: `test-cases/component-naming.json`
- **总计**: 15 个测试用例
- **难度分布**: simple 5 / medium 5 / complex 5
- **边界用例**: 5 个（CN11-CN15）
- **组件覆盖**: 基础组件（Text/Button/TextInput）、布局组件（Column/Row）、表单组件（Toggle/Select/Radio/Checkbox）、容器组件（List/Tabs/If）

## 4. 量化评估结果

### 4.1 综合维度评分

**DeepSeek-V3**（报告: `2026-04-18T23-41-42`，15/15 通过，0 失败）:

| 维度 | 权重 | extended-prefix | unified-name | short-prefix |
|------|------|-----------------|--------------|--------------|
| D1 语法 | 20% | 100.0% | 100.0% | 100.0% |
| D2 语义 | 25% | 100.0% | 100.0% | 100.0% |
| D3 效率 | 15% | 100.0% | 100.0% | 100.0% |
| D4 学习 | 15% | 100.0% | 100.0% | 100.0% |
| D5 边界 | 15% | 100.0% | 100.0% | 100.0% |
| D6 一致 | 10% | 100.0% | 100.0% | 100.0% |
| **MA** | | **100.0% (A+)** | **100.0% (A+)** | **100.0% (A+)** |

**GLM-5.1**（报告: `2026-04-22T07-42-45`, `max_tokens=20480`）:

| 维度 | 权重 | extended-prefix | unified-name | short-prefix |
|------|------|-----------------|--------------|--------------|
| D1 语法 | 20% | 100.0% | **100.0%** | 100.0% |
| D2 语义 | 25% | 96.0% | **100.0%** | 96.0% |
| D3 效率 | 15% | 94.7% | 94.7% | 94.7% |
| D4 学习 | 15% | 100.0% | 100.0% | 100.0% |
| D5 边界 | 15% | 90.0% | **100.0%** | 90.0% |
| D6 一致 | 10% | 87.5% | **100.0%** | 87.5% |
| **MA** | | **95.5% (A+)** | **99.2% (A+)** | **95.5% (A+)** |

### 4.2 综合对比

| 方案 | DeepSeek-V3 | GLM-5.1 | 平均 MA | 等级 |
|------|-------------|---------|---------|------|
| **unified-name** | **100.0% (A+)** | **99.2% (A+)** | **99.6%** | **A+** |
| extended-prefix（当前设计） | **100.0% (A+)** | 95.5% (A+) | 97.8% | A+ |
| short-prefix | **100.0% (A+)** | 95.5% (A+) | 97.8% | A+ |

### 4.3 D4 学习曲线明细

| 模型 | 策略 | 0-shot | 1-shot | 3-shot |
|------|------|--------|--------|--------|
| DeepSeek-V3 | extended-prefix | 100% | 100% | 100% |
| DeepSeek-V3 | unified-name | 100% | 100% | 100% |
| DeepSeek-V3 | short-prefix | 100% | 100% | 100% |
| GLM-5.1 | extended-prefix | 100% | 100% | 100% |
| GLM-5.1 | unified-name | 100% | 100% | 100% |
| GLM-5.1 | short-prefix | 100% | 100% | 100% |

所有策略在所有模型上 0-shot 即达满分，命名策略对学习能力无影响。

### 4.4 D6 一致性明细

| 模型 | 策略 | 结构一致率 | 语义等价率 |
|------|------|-----------|-----------|
| DeepSeek-V3 | extended-prefix | 100% | 100% |
| DeepSeek-V3 | unified-name | 100% | 100% |
| DeepSeek-V3 | short-prefix | 100% | 100% |
| GLM-5.1 | extended-prefix | 88% | 88% |
| GLM-5.1 | unified-name | **100%** | **100%** |
| GLM-5.1 | short-prefix | 88% | 88% |

GLM unified-name 达到完美一致性（100%），而 extended-prefix 和 short-prefix 均为 88%。带有前缀的组件名在重复生成时结构变化更大。

### 4.5 D3 生成效率 Token 对比

**GLM-5.1（max_tokens=20480）**:

| 策略 | 最小 tokens | 最大 tokens | 平均 tokens |
|------|------------|------------|------------|
| extended-prefix | 2748 | 12535 | 4619 |
| unified-name | 2820 | 13731 | 4699 |
| short-prefix | 2826 | 9525 | 4518 |

三种策略平均 token 数接近。short-prefix 平均最低但差异不大（~180 tokens）。unified-name 的最大值（13731）来自 CN14 的长输出。

## 5. 失败用例分析

### DeepSeek-V3

**无失败** — 15 个用例在三种策略下全部通过。

### GLM-5.1（max_tokens=20480）

**unified-name: 0 个失败**（15/15 全部通过）。

**extended-prefix（1 个失败）**:

| 用例 ID | 用例名称 | 难度 | 失败类型 | 失败描述 |
|---------|----------|------|----------|----------|
| CN14 | Radio组+条件+导航 | complex | L4 规则违反 | 未使用 Radio 组件（用 Column 替代了 Radio 组） |

**short-prefix（1 个失败）**:

| 用例 ID | 用例名称 | 难度 | 失败类型 | 失败描述 |
|---------|----------|------|----------|----------|
| CN14 | Radio组+条件+导航 | complex | L4 规则违反 | 未使用 HRadio 组件（用 HColumn 替代了 Radio 组） |

### 失败模式分类

| 失败类型 | extended-prefix | unified-name | short-prefix |
|----------|-----------------|--------------|--------------|
| L1 JSON 解析失败 | 0 | 0 | 0 |
| L2 字段缺失 | 0 | 0 | 0 |
| L3 模式违反 | 0 | 0 | 0 |
| L4 规则违反 | 1 | 0 | 0 |
| **合计** | **1** | **0** | **1** |

> **注**: 旧版评估（`max_tokens=2048`，报告 `2026-04-19T00-08-40`）中 GLM 三种策略共有 11 个失败（extended-prefix 5 个、unified-name 4 个、short-prefix 2 个），全部为 L1 JSON 解析失败。将 `max_tokens` 提升至 20480 后，JSON 截断问题全部消除，仅保留 2 个 L4 规则违反（CN14 Radio 组件遗漏）。

### 根因分析

1. **CN14 是唯一的真实失败点**: 该用例要求使用 Radio 组件实现单选组，但 GLM 在 extended-prefix 和 short-prefix 策略下用 Column 布局容器替代了 Radio 组件，属于语义理解偏差而非语法错误。

2. **unified-name 唯一通过了 CN14**: 无前缀的组件名（`Radio`）比带前缀的（`Extended.Radio` / `HRadio`）更容易被模型识别并使用。这可能与 LLM 训练数据中 `Radio` 作为 UI 组件的频率更高有关。

3. **JSON 截断已完全消除**: 所有策略的 L1 失败数均为 0，证实之前的高失败率完全由 `max_tokens=2048` 导致。

4. **命名长度不再影响失败率**: 旧版中 extended-prefix（5 失败）> unified-name（4）> short-prefix（2）的差异是由截断概率导致的。消除截断后，三策略表现接近，差异仅来自 CN14 的语义理解问题。

### 优化建议

1. **在 prompt 中显式列出所有可用组件名**，减少模型遗漏低频组件（如 Radio）的概率
2. **CN14 类型用例可增加 few-shot 示例**，展示 Radio 组的正确用法
3. **如维持 extended-prefix 设计**，可在 prompt 中强调 `Extended.Radio` 等表单组件的存在

## 6. 结论

| 策略 | DeepSeek | GLM | 综合 | 推荐 |
|------|----------|-----|------|------|
| unified-name | A+ (100.0%) | **A+ (99.2%)** | **A+ (99.6%)** | **模型亲和性最优** |
| extended-prefix（当前设计） | A+ (100.0%) | A+ (95.5%) | A+ (97.8%) | 可接受 |
| short-prefix | A+ (100.0%) | A+ (95.5%) | A+ (97.8%) | 可接受 |

**推荐：unified-name + catalog 隔离方案。**

理由：
1. **unified-name 模型亲和性最优**（A+ 99.6%），在 GLM 上显著优于 extended-prefix（95.5% vs 99.2%）
2. **消除前缀 token 成本** — 每个组件名省 ~2 tokens，千万 DAU 月度可省 ~360 亿 tokens
3. **LLM 对无前缀名称识别更准确** — CN14 用例中 unified-name 是唯一通过 Radio 组件生成的策略
4. **GLM D5 边界和 D6 一致性均达 100%**（extended-prefix 仅 90%/87.5%），统一命名消除了一致性问题
5. **通过 `catalogId` 字段区分来源** — 解决组件名冲突问题，扩展组件通过 `catalogId` 标识所属 catalog

**组件名冲突解决方案 — catalog 隔离**：

同名组件（如 `Text`、`Button`、`Image`）在扩展组件和原生组件中属性定义不同，通过 `catalogId` 字段区分来源：

```json
// unified-name + catalogId 隔离
{"component": "Text", "catalogId": "harmonyos", "content": "Hello"}
{"component": "Button", "catalogId": "harmonyos", "label": "提交", "listeners": {"onClick": [...]}}
```

- `catalogId` 标识组件所属的组件目录（catalog），如 `"harmonyos"` 表示鸿蒙扩展组件
- 无 `catalogId` 或 `catalogId: "a2ui"` 表示 A2UI 原生组件
- 第三方可注册自己的 catalog（如 `catalogId: "my-custom-lib"`），提供同名组件的不同实现
- 兼容未来扩展需求：新增组件库只需注册新的 `catalogId`，不影响现有组件名

**风险评估**: 低。从 `Extended.` 前缀迁移至 `catalogId` 隔离需要更新所有现有组件的 component 字段和渲染器实现。建议在 v1.1 中完成此迁移，v1.0 仍保持 `Extended.` 前缀以兼容现有实现。

## 7. 如何运行

```bash
cd eval
npm install

# 仅运行 DeepSeek
ONLY_MODEL=deepseek npm run eval:comp-naming

# 仅运行 GLM（需约 40-50 分钟）
ONLY_MODEL=glm npm run eval:comp-naming

# 全部模型
npm run eval:comp-naming
```

**报告文件**:

- `reports/component-naming-comparison-2026-04-18T23-41-42.*` — DeepSeek
- `reports/component-naming-comparison-2026-04-19T00-08-40.*` — GLM（旧版 max_tokens=2048）
- `reports/component-naming-comparison-2026-04-22T07-42-45.*` — GLM（max_tokens=20480）
