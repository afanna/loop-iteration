# GAP-066 Prompt 修改

## 修改 1: protocol-summary.md

- 同步日期更新: GAP-065 → GAP-065, GAP-066
- 新增约束说明（组件清单表后，SVG 约束后）:
  ```
  > **约束**：Select 组件 `options[].symbolIcon.src` 仅支持以下图标名称：`accountCircle`, `add`, ...（共 56 个）。与原生 Icon 组件 `name` 字段一致。
  ```

## 修改 2: protocol-harmonyos-extended.md

- 新增约束说明（组件清单表后，SVG 约束后）:
  ```
  > **约束**：Select 组件 `options[].symbolIcon.src` 仅支持以下图标名称：`accountCircle`, `add`, ...（共 56 个）。与原生 Icon 组件 `name` 字段一致。
  ```

## Few-shot 修改

无需修改。现有 few-shot 示例不涉及 Select symbolIcon 场景。
