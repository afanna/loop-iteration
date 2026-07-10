# GAP-057 Prompt 修改

## 修改: eval/prompts/protocol-harmonyos-extended.md

### Row 组件属性更新

- **位置**: 第 19 行
- **修改前**:
  ```
  | Row | 水平布局 | children, itemMargin |
  ```
- **修改后**:
  ```
  | Row | 水平布局 | children, itemMargin, wrap |
  ```
- **说明**: 在组件主要属性列表中添加 wrap 属性，让 LLM 知道 Row 组件支持换行控制。

### 组件清单格式调整

- **位置**: 第 19-20 行
- **说明**: Row 和 Column 组件保持独立行（已经是独立格式，无需修改）

## 修改: eval/prompts/protocol-summary.md

### Row/Column 组件属性更新

- **位置**: 第 20-21 行
- **修改前**:
  ```
  | Row / Column | children, itemMargin |
  ```
- **修改后**:
  ```
  | Row | children, itemMargin, wrap |
  | Column | children, itemMargin |
  ```
- **说明**: 将 Row/Column 合并行拆分为独立行，Row 添加 wrap 属性，Column 保持不变。

## Button 组件说明

**fontColor 样式无需在 prompt 中特别标注**：
- `fontColor` 是样式属性（style），应通过 `styles` 对象使用，而非组件属性
- 示例：`{"id": "btn1", "component": "Button", "label": "提交", "styles": {"fontColor": "#FFAAFF"}}`
- LLM 应该通过协议文档学习完整的样式列表，prompt 的组件清单只需列出主要属性（label, enabled, action, onClick）

## Few-shot 修改

本次修改为轻量新增（常见属性），无需修改 few-shot 示例。现有示例不涉及 wrap 和 fontColor 使用，不影响 LLM 学习。
