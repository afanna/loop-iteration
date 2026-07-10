# GAP-042 Prompt 修改记录

## 修改 1: `protocol-harmonyos-extended.md` 变量引用表

**位置**: `eval/prompts/protocol-harmonyos-extended.md` → 变量引用

**新增**:
```
- `$item.fieldName` — 列表模板中引用当前项字段（如 `$item.name`、`$item.price`）
- `$item` — 循环当前项对象（模板渲染中）
```

**修改**: `$var` 描述从通用改为具体：
```
- `$var` — 引用当前作用域变量：as 绑定（`$validResult`）、自定义 itemVar（`$product.name`）
```

---

## 修改 2: `eval-variable-system.ts` System Rule 8

**修改前**:
```
"8. 列表模板渲染...模板中用$fieldName相对路径引用字段..."
```

**修改后**:
```
"8. 列表模板渲染...模板中用$item.fieldName引用当前项字段（如$item.name、$item.price），
   用$index引用索引。自定义itemVar时用$customName.fieldName。"
```

---

## 修改 3: `eval-variable-system.ts` Few-shot 示例 2

**修改前**:
```
输入："生成List显示/products数据，模板显示每个商品的$name和$price"
输出：{"text": "{{ $name + ' - ¥' + $price }}"}
```

**修改后**:
```
输入："生成List显示/products数据，模板显示每个商品的$item.name和$item.price"
输出：{"text": "{{ $item.name + ' - ¥' + $item.price }}"}
```
