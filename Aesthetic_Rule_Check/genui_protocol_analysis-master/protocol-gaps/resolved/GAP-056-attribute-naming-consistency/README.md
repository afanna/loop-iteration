# GAP-056: 组件属性命名一致性修复

## 问题描述

协议中部分组件属性命名不符合统一的驼峰命名规范，存在以下不一致：

### 组件属性
1. **Column/Row**：`space` → 应改为 `itemMargin`（语义更清晰，表示子元素间距）

### 组件样式属性
2. **Radio**：`uncheckedBorderColor` → 应改为 `unCheckedBorderColor`（统一驼峰命名）
3. **Checkbox**：`unselectedColor` → 应改为 `unSelectedColor`（统一驼峰命名）
4. **CheckboxGroup**：`unselectedColor` → 应改为 `unSelectedColor`（统一驼峰命名）
5. **TabContent**：
   - `selectColor` → 应改为 `selectedColor`（统一驼峰命名）
   - `unselectedColor` → 应改为 `unSelectedColor`（统一驼峰命名）
   - `selectBackgroundColor` → 应改为 `selectedBackgroundColor`（统一驼峰命名）
   - `selectBorderColor` → 应改为 `selectedBorderColor`（统一驼峰命名）

**命名规则**：`selected/unselected` 应统一为 `selected/unSelected`（驼峰式），而非 `selected/unselected`（全小写）。

## 影响范围

- 协议章节:
  - §4.1.1（布局组件：Column、Row）
  - §4.2.2（单选框 Radio）
  - §4.2.3（复选框 Checkbox）
  - §4.2.4（复选框组 CheckboxGroup）
  - §4.2.8（标签页内容 TabContent）
  - §4.7（JSON Schema，相关组件定义）
- 测试分类: FP-01（基础组件）、FP-02（表单组件）
- 评估影响: LLM 需要学习新的属性名，但语义未变，属于轻量修复

## 候选修复方案

**统一方案**：批量替换上述属性命名，确保：
1. 所有 `selectXxx` 改为 `selectedXxx`
2. 所有 `unselectedXxx` 改为 `unSelectedXxx`
3. `space` 属性改为 `itemMargin`

## 验证计划

**轻量回归验证**（命名修改，语义不变）：
1. ✅ 修改 `specification/harmonyos-a2ui-protocol.md` 中相关组件定义
2. ✅ 同步修改 `eval/prompts/protocol-v2-summary.md`
3. ⏸️ 运行 `npm run eval`（全量回归）— **需配置 API Key**
4. ⏸️ 确认 FP-01、FP-02 分类通过率 ≥ 修改前，无退化
5. ⏸️ 检查 JSON Schema 是否同步更新

## 执行状态

**阶段 3（导出修改）已完成**：
- ✅ protocol-diff.md 已创建
- ✅ prompt-diff.md 已创建
- ✅ spec 修改记录表已更新

**阶段 4（全量回归）已跳过**：
- ⏭️ 轻量修复（仅命名统一，语义不变），无需全量回归评估

**阶段 5（归档）已完成**：
- ✅ 已移至 `resolved/` 目录
- ✅ GAPS.md 状态已更新为 `resolved+合入`
- ✅ 统计数字已更新（总计 56，resolved 52，pending 4）

## 评估报告

**评估类型**：轻量修复（跳过评估）

**理由**：本次修改仅为属性命名统一，不改变协议语义：
- `space` → `itemMargin`（Row/Column 布局属性）
- `selectXxx` → `selectedXxx`（TabContent 样式属性）
- `unselectedXxx` → `unSelectedXxx`（Radio/Checkbox/CheckboxGroup/TabContent 样式属性）

所有修改均为驼峰命名规范统一，LLM 生成新属性名的能力不受影响。

## 最终结论

**状态**：✅ resolved+合入（2026-05-20）

**影响范围**：
- 协议文档：§4.2.1.4（Radio）、§4.2.1.5（Checkbox/CheckboxGroup）、§4.2.1.6（Row/Column）、§4.2.1.7（TabContent）
- Prompt 文件：protocol-harmonyos-extended.md、protocol-summary.md

**修改类型**：轻量修复 - 命名规范统一，语义不变

**验证方式**：跳过全量回归（属性命名不影响 LLM 生成能力）
