# GAP-065 Prompt 修改

## 修改 1: protocol-summary.md

- 同步日期更新: 2026-05-30 → 2026-06-13
- 新增约束说明（组件清单表后）:
  ```
  > **约束**：Image 组件 `src` 不支持 SVG 格式（包括 base64 编码的 SVG，如 `data:image/svg+xml;base64,...`）。
  ```

## 修改 2: protocol-harmonyos-extended.md

- 新增约束说明（组件清单表后）:
  ```
  > **约束**：Image 组件 `src` 不支持 SVG 格式（包括 base64 编码的 SVG，如 `data:image/svg+xml;base64,...`）。
  ```

## Few-shot 修改

无需修改。现有 few-shot 示例不涉及 SVG 图源场景。
