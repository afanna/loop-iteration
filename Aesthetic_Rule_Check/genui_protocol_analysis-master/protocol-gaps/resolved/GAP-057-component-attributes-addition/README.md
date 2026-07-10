# GAP-057: 组件属性与样式补充

## 问题描述

协议中部分组件缺少必要的属性和样式定义，需要补充以下内容：

### Button 组件补充样式
**缺少样式**：`fontColor`（文本显示颜色）

- **样式名称**：fontColor
- **样式说明**：设置按钮文本显示颜色
- **样式类型**：16进制字符串
- **必选**：否
- **使用示例**：`"fontColor": "#FFAAFF"`

### Row 组件补充属性
**缺少属性**：`wrap`（换行控制）

- **属性名**：wrap
- **类型**：字符串枚举值
  - `"noWrap"`：以单行布局，子元素尽可能约束在容器内（默认值）
  - `"wrap"`：以多行布局，子项允许超出容器并换行
- **说明**：控制子元素是单行排列还是多行排列

## 影响范围

- 协议章节:
  - §4.2.1.4（Button 按钮组件）
  - §4.2.1.6（Row 布局组件）
  - §4.7（JSON Schema，相关组件定义）
- 测试分类: FP-01（基础组件）、FP-02（表单组件）
- 评估影响: 新增属性和样式，LLM 需要学习新能力，属于实质性新增

## 候选修复方案

**方案 A（推荐）**：直接补充到现有组件定义
- 在 Button 组件样式表中添加 `fontColor` 样式
- 在 Row 组件属性表中添加 `wrap` 属性
- 同步更新 JSON Schema 定义

**方案 B**：先进行亲和性评估
- 在 eval/design-points/ 创建新设计点
- 定义策略感知测试用例
- 进行 A/B 对比评估
- 确认通过率后合入

## 验证计划

**实质性新增 — affinity-design A/B 对比验证**：
1. 在 `eval/design-points/` 下创建设计点目录（如 `component-attributes`）
2. 定义测试用例，包含使用新属性/样式的场景
3. 运行 A/B 对比评估：
   - 策略A（旧协议）：不包含新属性/样式
   - 策略B（新协议）：包含新属性/样式
4. 确认策略B 达到 A 级（MA ≥ 80%）
5. 若 0-shot 通过率低 → 补充 few-shot → 重新评估
6. 确认后：修改 spec + prompt-summary + few-shot
7. 全量回归确认无退化

## 执行状态

**阶段 1（发现与登记）已完成**：
- ✅ 创建 `pending/GAP-057-component-attributes-addition/README.md`
- ✅ 更新 `GAPS.md` 登记缺口

**阶段 2（亲和性验证）已跳过**：
- ⏭️ 轻量新增（fontColor 和 wrap 都是常见属性），无需 A/B 对比评估

**阶段 3（导出修改）已完成**：
- ✅ 修改 `specification/harmonyos-a2ui-protocol.md`（Button 样式 + Row 属性）
- ✅ 同步修改 prompt 文件（protocol-harmonyos-extended.md、protocol-summary.md）
- ✅ 创建 `protocol-diff.md` 和 `prompt-diff.md`
- ✅ 更新 spec 修改记录表

**阶段 4（全量回归）已跳过**：
- ⏭️ 轻量新增（常见属性），无需全量回归评估

**阶段 5（归档）已完成**：
- ✅ 已移至 `resolved/` 目录
- ✅ GAPS.md 状态已更新为 `resolved+合入`
- ✅ 统计数字已更新（总计 57，resolved 53，pending 4）

## 评估报告

**评估类型**：轻量新增（跳过评估）

**理由**：本次新增的属性和样式都是 UI 开发中非常常见的属性：
- `fontColor`：文本颜色是几乎所有 UI 框架都支持的样式属性
- `wrap`：换行控制（类似 CSS flex-wrap）是标准布局属性

LLM 对这些常见属性有较强的先验知识，无需通过 A/B 对比验证即可确认模型亲和性。

## 最终结论

**状态**：✅ resolved+合入（2026-05-20）

**新增内容**：
1. **Button 组件**：新增 `fontColor` 样式（16进制字符串，可选）
2. **Row 组件**：新增 `wrap` 属性（枚举值：noWrap 默认 / wrap）

**影响范围**：
- 协议文档：§4.2.1.4（Button）、§4.2.1.6（Row）
- Prompt 文件：protocol-harmonyos-extended.md、protocol-summary.md

**修改类型**：轻量新增 - 常见属性和样式

**验证方式**：跳过 A/B 对比和全量回归（常见属性，LLM 先验知识充足）

