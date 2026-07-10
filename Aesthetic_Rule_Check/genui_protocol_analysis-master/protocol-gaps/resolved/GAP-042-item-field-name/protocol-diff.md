# GAP-042 协议修改记录

## 修改 1: 路径语法规则表

**位置**: §4.4.4 路径语法规则

**修改前**:
| 相对路径 | $xxx.yyy['zzz'] | $firstName['length'] | 从当前作用域开始 |

**修改后**:
| 相对路径（默认） | $item.fieldName | $item.firstName, $item.price | 模板中当前项的字段 |
| 相对路径（自定义） | $customVar.fieldName | $product.name（itemVar="product"） | 通过 itemVar 自定义变量名 |

---

## 修改 2: 相对路径描述和示例

**位置**: §4.4.4 相对路径

**修改前**: 使用 `$firstName`/`$lastName` 隐式字段引用，特点描述"使用 $ 前缀标识相对路径"

**修改后**: 使用 `$item.firstName`/`$item.lastName` 显式字段引用，特点描述"使用 `$item.fieldName` 显式引用当前项字段"

---

## 修改 3: 混合使用示例

**位置**: §4.4.4 混合使用示例

**修改前**: `$text`、`$author` 隐式引用
**修改后**: `$item.text`、`$item.author` 显式引用

---

## 修改 4: 嵌套列表示例

**位置**: §4.4.4 循环变量

**修改前**: `$name` 隐式引用内层学生名
**修改后**: `$item.name` 显式引用

---

## 修改 5: 使用场景

**修改前**: `$name, $price, $category` / `$isLoading, $error` / `$user.profile.age`
**修改后**: `$item.name, $item.price, $item.category` / `$item.user.profile.age` / `$product.name`（itemVar）
