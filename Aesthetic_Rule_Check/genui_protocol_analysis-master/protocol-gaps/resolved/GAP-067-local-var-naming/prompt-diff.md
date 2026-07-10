# GAP-067 Prompt 修改

## 修改 1: protocol-summary.md

- 同步日期更新: GAP-065, GAP-066 → GAP-065, GAP-066, GAP-067
- 新增命名约束说明（变量查找优先级行后）:
  ```
  > **命名约束**：itemVar、indexVar、as 的自定义变量名必须以字母或下划线开头，仅包含字母、数字、下划线（如 product、idx、validResult）。值不含 $ 前缀（引用时自动拼 $）。同一模板中 indexVar 与 itemVar 相同时，自定义名失效，回退默认 $item / $index。
  ```

## 修改 2: protocol-harmonyos-extended.md

- 新增命名约束说明（变量列表后）:
  ```
  > **命名约束**：itemVar、indexVar、as 的自定义变量名必须以字母或下划线开头，仅包含字母、数字、下划线（如 product、idx、validResult）。值不含 $ 前缀（引用时自动拼 $）。同一模板中 indexVar 与 itemVar 相同时，自定义名失效，回退默认 $item / $index。
  ```

## Few-shot 修改

无需修改。现有 few-shot 示例使用的变量名（product、validResult 等）已符合命名规范。
