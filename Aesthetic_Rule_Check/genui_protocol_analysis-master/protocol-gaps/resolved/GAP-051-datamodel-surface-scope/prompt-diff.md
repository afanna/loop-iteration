# GAP-051 Prompt 修改记录

## 修改 1: `protocol-summary.md` — `$__DataModel` 描述

**位置**: `eval/prompts/protocol-summary.md` → 变量系统 → 全局系统变量

**修改前**:
```
- `$__DataModel` — 数据模型根对象，通过点路径访问属性
```

**修改后**:
```
- `$__DataModel` — 数据模型根对象，通过点路径访问属性（限定于所在 surface，不同 surface 的数据独立）
```

---

## 修改 2: `protocol-harmonyos-extended.md` — 全局变量表

**位置**: `eval/prompts/protocol-harmonyos-extended.md` → 变量引用 → 全局变量

**修改前**:
```
- `$__DataModel.path.to.field` — 全局数据模型（绝对路径）
```

**修改后**:
```
- `$__DataModel.path.to.field` — 数据模型绝对路径（限定于当前 surface）
```

---

## 修改 3: `protocol-harmonyos-extended.md` — 全局变量表（table）

**位置**: `eval/prompts/protocol-harmonyos-extended.md` → 全局变量 → 表格

**修改前**:
```
| $__DataModel | object | 应用数据模型 |
```

**修改后**:
```
| $__DataModel | object | 当前 surface 数据模型（surface 级，非全局） |
```
