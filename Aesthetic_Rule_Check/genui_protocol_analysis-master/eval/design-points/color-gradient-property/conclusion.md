# 渐变颜色属性组织方式亲和性评估

## 1. 设计背景

- **协议章节**: 4.2（样式属性）
- **核心问题**: 公共渐变颜色能力应如何组织，才能既表达三种渐变互斥，又尽量降低 LLM 的生成负担
- **评估动机**:
  - 这三个渐变类型互斥，实际运行时如果同时设置，只会生效最后一个
  - 如果协议允许三属性并列，LLM 可能在一个组件上同时输出多个渐变字段，产生“语法合法但语义被覆盖”的隐性错误
  - 如果协议改为统一 `colorGradient.type + colorGradient.param`，LLM 需要额外做一次类型和参数对象配对，也可能引入新的认知负担
  - 如果使用“单入口 + 单键对象”，则可以同时保留互斥语义和较直接的类型表达，值得纳入正式对比
- **与 V2 协议一致性**: 待定，依据重跑后的评估结果决定

## 2. 候选方案

### A: unified-gradient

使用统一的 `colorGradient` 属性，显式声明渐变类型和参数：

```json
{
  "styles": {
    "colorGradient": {
      "type": "linearGradient",
      "param": {
        "angle": "45deg",
        "colors": [["#FF6B6B", 0], ["#4ECDC4", 1]],
        "repeating": false
      }
    }
  }
}
```

优点：
- 天然只会出现一个渐变入口，不会出现三属性共存后“最后一个覆盖前两个”的隐性错误
- LLM 需要显式做类型选择，输出意图更清晰

风险：
- 需要同时维护 `type` 和 `param` 的配对关系
- `param` 是联合类型对象，LLM 可能出现 “type 是线性渐变，但 param 写成径向参数” 的问题

### B: separate-gradients

直接暴露三个独立属性，只设置其中一个：

```json
{
  "styles": {
    "linearGradient": {
      "angle": "45deg",
      "colors": [["#FF6B6B", 0], ["#4ECDC4", 1]],
      "repeating": false
    }
  }
}
```

优点：
- 就地表达，字段名直接体现渐变类型
- 不需要额外的 `type + param` 配对

风险：
- 三个属性并列，LLM 更容易一次输出多个梯度字段
- “同时写了多个，最终只生效最后一个”的运行语义对模型不直观
- sweep / radial 参数较复杂时，LLM 可能误选错误的根属性名

### C: keyed-gradient

使用统一入口 `colorGradient`，但不用 `type + param`，而是在 `colorGradient` 下保留一个唯一子键：

```json
{
  "styles": {
    "colorGradient": {
      "linearGradient": {
        "angle": "45deg",
        "colors": [["#FF6B6B", 0], ["#4ECDC4", 1]],
        "repeating": false
      }
    }
  }
}
```

优点：
- 保留单入口，结构上天然表达“只能有一种渐变”
- 不需要 `type + param` 配对，类型直接由 key 表达
- 对 LLM 更接近“看见字段名就写对应参数对象”的生成模式

风险：
- 仍然需要约束 `colorGradient` 下只能有一个子键
- 虽然第二轮已经完成跑分，但仍需继续观察真实业务场景下是否会出现“同时生成多个子键”的边界问题

## 3. 测试用例设计

- **文件**: `test-cases/color-gradient-property.json`
- **总计**: 15 个测试用例
- **复杂度分布**:
  - simple: 5
  - medium: 5
  - complex: 5
- **边界用例**: 6 个

覆盖场景：
- 线性渐变基础场景：`angle` / `direction` / `repeating`
- 角度渐变基础场景：`center` / `start` / `end` / `rotation`
- 径向渐变基础场景：`center` / `radius`
- 多颜色 stop
- 百分比、角度字符串、数值混合
- 与常规样式组合
- 明确要求“只能保留一种渐变”
- 容易诱发多个渐变字段共存的边界场景

本轮已修正测试规则：
- 不再把“红色/橙色/紫色/粉色”强绑定为某个固定 hex
- 对 `radius` 等长度值，不再强制要求只能是未加引号的数值字面量
- 把验证重点从“精确字面值”转为“结构正确、类型正确、关键参数存在、互斥语义正确”

## 4. 评估维度

沿用现有 6 维评估：

- **D1 语法准确率**: JSON 合法，字段结构正确
- **D2 语义准确率**: 选对渐变类型，参数与需求匹配
- **D3 生成效率**: token 与重试开销
- **D4 学习曲线**: 0-shot / 1-shot / 3-shot 表现
- **D5 边界鲁棒性**: 多属性互斥、覆盖语义、复杂参数组合
- **D6 一致稳定性**: 多次生成是否稳定选择同一组织方式

本设计点的核心观察项：

1. unified-gradient 是否能明显降低“多个渐变字段同时出现”的错误
2. separate-gradients 是否会在 sweep/radial 场景下更容易直接命中正确字段
3. unified-gradient 是否会出现 `type` 和 `param` 不匹配
4. keyed-gradient 是否能同时兼顾“互斥语义”与“类型直达”
5. separate-gradients 在边界场景下是否容易出现覆盖语义隐患

## 5. 全部报告汇总

当前目录下共有两轮正式报告：

1. **第一轮 A/B 对比**
   - [color-gradient-property-comparison-2026-04-25T08-46-56.md](D:/code/Arkui/Genui/genui_analysis/eval/design-points/color-gradient-property/reports/color-gradient-property-comparison-2026-04-25T08-46-56.md)
   - [color-gradient-property-comparison-2026-04-25T08-46-56.json](D:/code/Arkui/Genui/genui_analysis/eval/design-points/color-gradient-property/reports/color-gradient-property-comparison-2026-04-25T08-46-56.json)
2. **第二轮 A/B/C 对比**
   - [color-gradient-property-comparison-2026-04-25T09-46-07.md](D:/code/Arkui/Genui/genui_analysis/eval/design-points/color-gradient-property/reports/color-gradient-property-comparison-2026-04-25T09-46-07.md)
   - [color-gradient-property-comparison-2026-04-25T09-46-07.json](D:/code/Arkui/Genui/genui_analysis/eval/design-points/color-gradient-property/reports/color-gradient-property-comparison-2026-04-25T09-46-07.json)

### 5.1 第一轮报告总结：A/B 对比

**适用说明**:
- 只比较 A: unified-gradient 和 B: separate-gradients
- 当时的测试规则对颜色字面值和 `radius` 表现形式约束偏严
- 这轮结果可作为早期基线，但不宜直接作为最终决策

**glm-4-plus**（`2026-04-25T08-46-56`）:

| 维度 | A: unified-gradient | B: separate-gradients |
|------|---------------------|-----------------------|
| D1 语法准确率 | 100.0% | 100.0% |
| D2 语义准确率 | 80.0% | **84.0%** |
| D3 生成效率 | 66.7% | 66.7% |
| D4 学习曲线 | **50.0%** | 48.0% |
| D5 边界鲁棒性 | 80.0% | 80.0% |
| D6 一致稳定性 | 95.0% | 95.0% |
| **MA 综合** | **79.0% (B)** | **79.7% (B)** |

**deepseek-chat**（`2026-04-25T08-46-56`）:

| 维度 | A: unified-gradient | B: separate-gradients |
|------|---------------------|-----------------------|
| D1 语法准确率 | 100.0% | 100.0% |
| D2 语义准确率 | **84.0%** | 80.0% |
| D3 生成效率 | **73.3%** | 66.7% |
| D4 学习曲线 | 50.0% | **57.0%** |
| D5 边界鲁棒性 | **90.0%** | 80.0% |
| D6 一致稳定性 | 80.0% | 80.0% |
| **MA 综合** | **81.0% (A)** | **78.6% (B)** |

**第一轮双模型汇总**:

| 方案 | glm-4-plus | deepseek-chat | 平均 MA | 等级 |
|------|------------|---------------|---------|------|
| **A: unified-gradient** | 79.0% (B) | **81.0% (A)** | **80.0%** | A/B 临界 |
| B: separate-gradients | **79.7% (B)** | 78.6% (B) | 79.2% | B |

第一轮结论：
- A 仅以约 0.8 个百分点小幅领先
- 差异不大
- 这轮失败主要受旧校验规则噪声影响

### 5.2 第二轮报告总结：A/B/C 对比

**适用说明**:
- 引入了 C: keyed-gradient
- 测试规则已修正，更聚焦结构、类型和互斥语义
- 这轮应作为当前主结论依据

**glm-4-plus**（`2026-04-25T09-46-07`）:

| 维度 | A | B | C |
|------|---|---|---|
| D1 语法准确率 | 100.0% | 100.0% | 100.0% |
| D2 语义准确率 | 100.0% | 100.0% | 100.0% |
| D3 生成效率 | 100.0% | 100.0% | 100.0% |
| D4 学习曲线 | 80.0% | **91.0%** | 73.0% |
| D5 边界鲁棒性 | 100.0% | 100.0% | 100.0% |
| D6 一致稳定性 | 82.5% | 85.0% | **95.0%** |
| **MA 综合** | **95.3% (A+)** | **97.1% (A+)** | **95.5% (A+)** |

**deepseek-chat**（`2026-04-25T09-46-07`）:

| 维度 | A | B | C |
|------|---|---|---|
| D1 语法准确率 | 100.0% | 100.0% | 100.0% |
| D2 语义准确率 | **100.0%** | 96.0% | 96.0% |
| D3 生成效率 | **93.3%** | 86.7% | **93.3%** |
| D4 学习曲线 | **75.0%** | 72.0% | 72.0% |
| D5 边界鲁棒性 | **100.0%** | 90.0% | 90.0% |
| D6 一致稳定性 | 70.0% | 75.0% | **90.0%** |
| **MA 综合** | **92.2% (A+)** | **88.8% (A)** | **91.3% (A+)** |

**第二轮双模型汇总**:

| 方案 | glm-4-plus | deepseek-chat | 平均 MA | 等级 |
|------|------------|---------------|---------|------|
| **A: unified-gradient** | 95.3% (A+) | **92.2% (A+)** | **93.8%** | **A+** |
| **B: separate-gradients** | **97.1% (A+)** | 88.8% (A) | 93.0% | A+/A |
| **C: keyed-gradient** | 95.5% (A+) | 91.3% (A+) | 93.4% | A+ |

第二轮结论：
- 三个方案全部达到 A 或 A+
- A 的双模型平均 MA 最高，为 **93.8%**
- B 在 `glm-4-plus` 上最好，但在 `deepseek-chat` 上最弱
- C 的平均分略低于 A，但 D6 一致性最好，结构稳定性更优

### 5.3 两轮报告的差异结论

两轮报告差异很大，根因不是模型突然变化，而是**测试规则从“字面值苛校验”改成了“结构/语义校验”**。

这意味着：
- 第一轮结果主要说明旧校验噪声很大
- 第二轮结果才更接近真实的协议亲和性

因此，本目录后续讨论和协议决策应**以第二轮报告为主**，第一轮只保留作历史参考。

## 6. 第一轮失败原因分析

### 6.1 失败统计

| 模型 | unified-gradient | separate-gradients |
|------|------------------|-------------------|
| glm-4-plus | 5 | 4 |
| deepseek-chat | 4 | 5 |

### 6.2 代表性失败用例

1. **CG001 / CG004 / CG005**
   - 任务描述写的是颜色语义，如“红到橙”“蓝到青”“紫到粉”
   - 旧校验却要求固定 hex 字面值
   - 模型输出的颜色语义其实是对的，只是不等于指定 hex

2. **CG008 / CG015**
   - 旧校验把 `radius` 写成 `"48"` 判失败，只接受 `48`
   - 但如果协议里的 `Length` 允许字符串或数值，这不应视为真实失败

### 6.3 根因判断：用例问题还是设计问题

第一轮这组“失败较多”的结果，**主要是用例/校验问题，不是纯粹的协议设计问题**。

可以拆成两部分看：

1. **用例/校验问题是主因**
   - 旧规则把颜色语义题误校验成固定 hex 记忆题
   - 旧规则把长度值的表现形式限制得过严
   - 因此很多失败实际上是“验证规则噪声”，不是“模型不会选渐变类型”

2. **设计问题也存在，但不是当前失败数的主要来源**
   - `separate-gradients` 的问题是互斥关系只在文档语义里，没编码到结构里
   - `unified-gradient` 的问题是 `type + param` 增加了一次额外配对负担
   - 这两个都是真问题，但在旧规则下被更大的校验噪声掩盖了

### 6.4 原始假设验证情况

本次评估最初假设是：

- unified-gradient 可能因为“天然互斥”而明显优于 separate-gradients
- separate-gradients 可能因为三字段并列而更容易出现覆盖语义错误

**结果没有强烈验证这个假设。**

原因：
- 在这 15 个用例里，模型并没有大量出现“同时输出多个渐变字段”的失败
- 真正拉低分数的，主要是颜色和半径等字面值细节
- 也就是说，这轮实验更像是在测“旧验证规则对字面值的苛刻程度”，而不是纯粹测“互斥组织方式”

因此，这个设计点当前更合理的判断是：
- 旧版 A/B 结果只能作为**参考基线**
- 不能据此下强结论说 `unified-gradient` 已显著胜出
- 也不能据此下强结论说 `separate-gradients` 明显不可用

## 7. 是否有更好的方案

有。第二轮新增并已完成评估的 **C: keyed-gradient**，就是比原始 A/B 更值得关注的方案：

```json
{
  "styles": {
    "colorGradient": {
      "radialGradient": {
        "center": ["50%", "50%"],
        "radius": 36,
        "colors": [["#FACC15", 0], ["rgba(250,204,21,0)", 1]],
        "repeating": false
      }
    }
  }
}
```

它比 A/B 更平衡：

1. **比 B 好**
   - 保留单入口，结构层面表达“只能有一个渐变”
   - 不会把互斥关系完全留给文档说明

2. **比 A 好**
   - 不需要 `type + param` 两段式配对
   - LLM 看到 key 就能直接生成对应参数对象

3. **对校验也更友好**
   - 可以直接检查 `colorGradient` 下是否只有一个子键
   - 比检查 `type` 和 `param` 的配对更直接

所以从工程判断看，**C 的结构表达比 B 更安全，也比 A 更直接**。第二轮跑分也证明它确实是强备选，但当前综合分仍略低于 A，因此更适合作为候补方案而非首选。

## 8. 最终结论

基于当前目录下**全部报告**，应当这样看：

1. **历史结论**
   - 第一轮 A/B 结果表明两方案差异不大
   - 但这轮受旧校验规则影响较大，只能作历史基线

2. **当前主结论**
   - 第二轮三方案结果显示，**A: unified-gradient** 的双模型平均 MA 最高，当前综合最优
   - **C: keyed-gradient** 非常接近 A，且 D6 一致性最佳，是最有潜力的替代方案
   - **B: separate-gradients** 在 GLM 上非常强，但跨模型稳定性最弱

### 综合推荐

| 方案 | 双模型平均 MA | 结论 |
|------|---------------|------|
| **A: unified-gradient** | **93.8%** | **当前推荐** |
| C: keyed-gradient | 93.4% | 备选，结构一致性最好 |
| B: separate-gradients | 93.0% | 可接受，但跨模型稳定性略弱 |

**推荐：当前优先采用 A: unified-gradient (`colorGradient.type + param`)。**

理由：
1. 第二轮三方案对比中，A 的综合平均分最高
2. A 在 `deepseek-chat` 上表现最好，且边界鲁棒性达到 100%
3. A 用统一入口编码了“渐变互斥”语义，协议可读性也较好

同时补充：
1. C 与 A 的差距很小，属于值得继续观察的强备选
2. 如果后续实践中发现 `type + param` 配对对生成质量有额外负担，可以优先考虑切换到 C
3. B 并不是不可用，只是从跨模型稳定性看，不如 A/C 平衡

## 9. 如何运行

```bash
cd eval
npm install

# 全量评估
npm run eval:color-gradient

# 只跑 DeepSeek
ONLY_MODEL=deepseek npm run eval:color-gradient

# 只跑 GLM
ONLY_MODEL=glm npm run eval:color-gradient
```

报告输出目录：

```text
eval/design-points/color-gradient-property/reports/
```
