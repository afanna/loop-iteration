# GAP-056 Prompt 修改

## 修改: eval/prompts/protocol-harmonyos-extended.md

### 组件清单表格更新

- **位置**: 第 19-20 行
- **修改前**:
  ```
  | Row | 水平布局 | children, space |
  | Column | 垂直布局 | children, space |
  ```
- **修改后**:
  ```
  | Row | 水平布局 | children, itemMargin |
  | Column | 垂直布局 | children, itemMargin |
  ```

### 基础示例更新

- **位置**: 第 56 行
- **修改前**:
  ```json
  {"id":"root","component":"Column","children":["title","submitBtn"],"space":16}
  ```
- **修改后**:
  ```json
  {"id":"root","component":"Column","children":["title","submitBtn"],"itemMargin":16}
  ```

## 修改: eval/prompts/protocol-summary.md

### 常用组件表格更新

- **位置**: 第 20 行
- **修改前**:
  ```
  | Row / Column | children, space |
  ```
- **修改后**:
  ```
  | Row / Column | children, itemMargin |
  ```

### 组件示例更新

- **位置**: 第 43 行
- **修改前**:
  ```json
  {"id":"root","component":"Column","children":["title","submitBtn"],"space":16}
  ```
- **修改后**:
  ```json
  {"id":"root","component":"Column","children":["title","submitBtn"],"itemMargin":16}
  ```

## Few-shot 修改

本次修改为轻量修复，属性语义未变，仅命名调整。无需修改 few-shot 示例，现有示例中的 `space` 属性已同步更新为 `itemMargin`。
