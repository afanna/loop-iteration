# GAP-051 协议修改记录

## 修改 1: §4.5.1 命名规范 — 表后新增 NOTE

**位置**: §4.5.1 命名规范 → 表格下方

**修改前**:
```
| `__` 开头 | 全局系统变量 | `$__WidthBreakpoint`, `$__DataModel` | 变量名以双下划线开头，框架提供，全局可访问 |
| 无前缀 | DataModel/局部变量 | `$item.name`, `$validResult`, `$context` | 变量名无特殊前缀，作用域上下文决定含义 |
```

（无 NOTE）

**修改后**:
```
| `__` 开头 | 全局系统变量 | `$__WidthBreakpoint`, `$__DataModel` | 变量名以双下划线开头，框架提供，全局可访问 |
| 无前缀 | DataModel/局部变量 | `$item.name`, `$validResult`, `$context` | 变量名无特殊前缀，作用域上下文决定含义 |

> **注意**：`$__DataModel` 虽归类于全局系统变量，但其作用域限定于所在 surface。与 `$__WidthBreakpoint` 等真正的 app 级全局变量不同——每个 surface 拥有独立的 DataModel 实例，组件只能访问其所属 surface 的 DataModel，无法跨 surface 访问。不同 surface 的 DataModel 通过对应的 `updateDataModel` 消息（含 `surfaceId`）独立管理。
```

**理由**: 澄清 `$__DataModel` 的 surface 级作用域，消除与真正全局变量的歧义。

---

## 修改 2: §4.5.2 全局系统变量 — `$__DataModel` 说明

**位置**: §4.5.2 全局系统变量 → 表格

**修改前**:
```
| `$__DataModel` | object | 数据模型根对象，通过点路径访问其属性 |
```

**修改后**:
```
| `$__DataModel` | object | 数据模型根对象，通过点路径访问其属性。作用域限定于所在 surface，不同 surface 的 DataModel 相互隔离。 |
```

**理由**: 直接在变量说明中标注 surface scope。

---

## 修改 3: §4.5.6 作用域与冲突解决 — 优先级表后新增说明

**位置**: §4.5.6 作用域与冲突解决 → 优先级表下方、"同名冲突处理规则"前

**修改前**:
```
| 4（最低） | 全局系统变量 | `$__WidthBreakpoint` | 全局可访问 |

**同名冲突处理规则：**
```

**修改后**:
```
| 4（最低） | 全局系统变量 | `$__WidthBreakpoint` | 全局可访问（注：`$__DataModel` 限定于所在 surface） |

> `$__DataModel` 虽在优先级表中属于"全局系统变量"层级，但其实际作用域为 surface 级。跨 surface 场景下，每个 surface 拥有独立的 DataModel 实例，`$__DataModel` 仅指向当前 surface 的 DataModel。

**同名冲突处理规则：**
```

**理由**: 优先级表涉及变量查找顺序，需在此处注明 `$__DataModel` 的 surface 级特性。
