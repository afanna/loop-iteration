# GAP-004 Prompt 修改

## 修改: protocol-harmonyos-extended.md

- **组件清单表**: 所有 32 行组件名 `Extended.XXX` → `XXX`
- **组件公共属性**: 新增 `catalogId` 字段说明
  - 修改前: `所有组件支持：id(必选), component(必选), styles(可选)`
  - 修改后: `所有组件支持：id(必选), component(必选), catalogId(可选，扩展组件为"harmonyos"), styles(可选)`

## 修改: protocol-harmonyos-inline.md

- **扩展组件清单表**: 所有 20 行组件名 `Extended.XXX` → `XXX`
- **组件使用示例**: `Extended.Text` → `Text`, `Extended.Button` → `Button`
- **组件公共属性**: 新增 `catalogId` 字段说明
  - 修改后: `所有组件支持：id(必选), component(必选), catalogId(可选，扩展组件为"harmonyos"), styles(可选), listeners(可选), visibility(可选)`

## Few-shot 修改

### few-shot-examples.ts — select-component 分类

- 示例1: `Extended.Select` → `Select`（输入描述和输出各 1 处，共 2 处）
- 示例2: `Extended.Select` → `Select`（输入描述和输出各 1 处，共 2 处）
- 示例3: `Extended.Select` → `Select`（输入描述和输出各 1 处，共 2 处）
