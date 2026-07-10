# 表达式实战

> **起始版本：**  API Version 20
>
> 表达式是**鸿蒙扩展协议 Catalog** 新增能力，需使用 CatalogFactory.extended()。

---

## 场景：构建一个"响应式数据看板"

从零构建一个数据看板卡片，展示销售额、订单数和状态。要求：不同数据范围显示不同颜色、移动端/平板自适应、深色模式适配。

---

## 1. 基础绑定与拼接

先从最简单的数据展示开始：

```json
// 数据
{ "updateDataModel": {
  "surfaceId": "dashboard",
  "value": { "sales": 15800, "orders": 342, "status": "normal" }
}}

// 组件
{ "id": "salesText", "component": "Text",
  "content": "{{ '今日销售额：¥' + $__dataModel.stats.sales }}" }

{ "id": "ordersText", "component": "Text",
  "content": "{{ '订单数：' + $__dataModel.stats.orders + ' 单' }}" }
```

+ 在字符串 + 数字时自动拼接为字符串；两个数字相加时做数值加法。

---

## 2. 条件颜色

根据数据范围动态改变颜色：

```json
{ "id": "salesText", "component": "Text",
  "content": "{{ '¥' + $__dataModel.stats.sales }}",
  "styles": {
    "fontSize": "28fp",
    "fontWeight": "bold",
    "fontColor": "{{ $__dataModel.stats.sales >= 10000 ? '#52C41A' : $__dataModel.stats.sales >= 5000 ? '#FAAD14' : '#FF4D4F' }}"
  }
}
```

三元可嵌套——销售额 ≥10000 绿色，≥5000 黄色，<5000 红色。

---

## 3. 状态图标切换

```json
{ "id": "statusText", "component": "Text",
  "content": "{{ $__dataModel.stats.status == 'normal' ? '✅ 运行正常' : $__dataModel.stats.status == 'warning' ? '⚠️ 需关注' : '❌ 异常' }}",
  "styles": {
    "fontColor": "{{ $__dataModel.stats.status == 'normal' ? '#52C41A' : $__dataModel.stats.status == 'warning' ? '#FAAD14' : '#FF4D4F' }}"
  }
}
```

---

## 4. 循环列表：订单明细

用 children 模板对象遍历订单明细数组生成每一行：

```json
{ "id": "orderDetailList", "component": "List",
  "children": {
    "componentId": "detailRow",
    "path": "/order/details",
    "indexVar": "lineIndex",
    "itemVar": "detail"
  }
}

{ "id": "detailRow", "component": "Row", "children": ["detailNoText", "detailNameText", "detailAmountText"] }
{ "id": "detailNoText", "component": "Text",
  "content": "{{ $lineIndex + 1 }}" }
{ "id": "detailNameText", "component": "Text",
  "content": "{{ $detail.name + ' x ' + $detail.quantity }}" }
{ "id": "detailAmountText", "component": "Text",
  "content": "{{ '¥' + ($detail.price * $detail.quantity) }}" }
```

上例声明了 lineIndex 和 detail，因此模板内使用 $lineIndex 和 $detail 渲染序号、名称、数量和小计金额。

---

## 5. 深色模式适配

```json
{ "id": "dashboardCard", "component": "Column",
  "children": ["title", "salesText", "ordersText", "statusText"],
  "styles": {
    "backgroundColor": "{{ $__colorMode == 'dark' ? '#1A1A2E' : '#FFFFFF' }}",
    "borderRadius": 12,
    "padding": "20vp"
  }
}

{ "id": "title", "component": "Text",
  "content": "数据看板",
  "styles": {
    "fontColor": "{{ $__colorMode == 'dark' ? '#FFFFFF' : '#1A1A1A' }}",
    "fontSize": "18fp",
    "fontWeight": "bold"
  }
}
```

当系统切换深色模式时，$__colorMode 自动变为 "dark"，所有引用它的表达式重新求值。

---

## 6. 自适应布局

```json
{ "id": "adaptiveLayout", "component": "If",
  "condition": "{{ $__widthBreakpoint == 'xs' || $__widthBreakpoint == 'sm' }}",
  "childrenIf": ["narrowDashboard"],
  "childrenElse": ["wideDashboard"] }

// 窄屏：垂直排列
{ "id": "narrowDashboard", "component": "Column",
  "children": ["salesText", "ordersText", "statusText"],
  "styles": { "padding": "12vp" } }

// 宽屏：水平排列
{ "id": "wideDashboard", "component": "Row",
  "children": ["salesText", "ordersText", "statusText"],
  "styles": { "padding": "24vp" },
  "justify": "spaceAround" }
```

---

## 7. 常见错误排查

### 变量名拼写错误

```
❌ {{ $__dataModel.stats.Sales }}     — 大小写敏感
✅ {{ $__dataModel.stats.sales }}

❌ {{ $item.Name }}                   — 字段名大小写敏感
✅ {{ $item.name }}
```

### 引号使用错误

```
❌ {{ "Hello " + name }}              — 双引号用于 JSON，表达式内用单引号
✅ {{ 'Hello ' + $__dataModel.user.name }}

❌ {{ 'It\'s OK' }}                   — 不支持转义
✅ {{ "It's OK" }} 或 {{ 'Its OK' }}
```

### 类型不匹配

```
❌ {{ $__dataModel.count + 1 + '件' }} — 先做数值加法，count=3 时结果是 4件
✅ {{ '' + $__dataModel.count + '件' }} — 先转成字符串，count=3 时结果是 3件
```

+ 的规则是：任一操作数为字符串则转为字符串拼接；否则做数值加法。需要强制拼接时，可以先拼接空字符串。

### 作用域遮蔽

```json
// 外层循环
{ "id": "orderList", "component": "List",
  "children": { "componentId": "orderRow", "path": "/orders", "itemVar": "order" } }
{ "id": "orderRow", "component": "Column", "children": ["detailList"] }

// 内层循环：如果也声明 itemVar: "order"，内层 $order 会遮蔽外层 $order
{ "id": "detailList", "component": "List",
  "children": { "componentId": "detailNameText", "path": "details", "itemVar": "order" } }
```

在内层模板中，$order 解析为内层明细变量；退出内层后，外层 $order 恢复可见。若内层使用其他名称（如 itemVar: "detail"），则 $order 和 $detail 都可访问。

### 超出作用域

局部变量超出作用域后不生效。模板循环变量只在当前模板实例及其子组件中可用，不能在模板外的兄弟组件里使用：

```json
{ "id": "orderDetailList", "component": "List",
  "children": { "componentId": "detailIdText", "path": "/order/details", "itemVar": "detail" } }

{ "id": "detailIdText", "component": "Text", "content": "{{ $detail.id }}" }

// summaryText 不在 detailIdText 模板实例内，$detail 在这里不可用
{ "id": "summaryText", "component": "Text", "content": "{{ $detail.id }}" }
```

上例 summaryText 不在 detailIdText 模板实例及其子组件内，不能使用 $detail。

### 作用域优先级

普通变量查找优先级为 as > 循环变量 > $context > 全局变量。模板事件里如果 as 使用了循环变量同名声明，绑定成功后的后续 handler 会读取 as 值：

```json
{ "id": "orderDetailList", "component": "List",
  "children": { "componentId": "detailRow", "path": "/order/details" } }

{ "id": "detailRow", "component": "Row",
  "onClick": [
    { "call": "setDataModel", "args": { "path": "/debug/before", "value": "{{ $item.id }}" } },
    { "call": "getSelectValue", "args": { "componentId": "optionSelect" }, "as": "item" },
    { "call": "setDataModel", "args": { "path": "/debug/after", "value": "{{ $item }}" } }
  ]
}
```

第一个 handler 的 $item 是循环项；第三个 handler 的 $item 是 as 返回值，遮蔽外层循环项。$__dataModel、$__widthBreakpoint 和 $__colorMode 属于 $__ 全局命名空间，不会被局部变量遮蔽。

### 非法局部变量名

itemVar、indexVar 和事件链 as 都使用同一套局部变量命名规则，声明时不写 $。命名说明见[局部变量命名规则](../concepts/variable-system.md#局部变量命名规则)。非法名称只记录 warning，不中断渲染或事件链：

| 场景 | 降级行为 |
|------|----------|
| 单个 itemVar 或 indexVar 非法 | 对应字段回退为 $item 或 $index |
| 同层 indexVar == itemVar | 两个自定义绑定都失败，回退 $index 和 $item |
| 非法 as | handler 仍执行，但不创建变量 |
| as 函数无返回值或返回无效值 | 不创建变量，事件链继续 |

### 表达式不执行

1. 确认使用了 CatalogFactory.extended()（扩展 Catalog）
2. 确认 {{ }} 中无多余空格或换行
3. 确认变量存在于 DataModel 中且路径正确
4. 确认不是标准组件属性；A2UI 标准协议中的 {{ $item.name }} 会按普通字符串保留

---

## 运算符速查

| 优先级 | 运算符 | 用途 |
|--------|--------|------|
| 1 | () | 分组 |
| 2 | . [] | 成员访问 / 数组访问 |
| 3 | ! | 逻辑非 |
| 4 | * / % | 乘除取模 |
| 5 | + - | 加减 / 字符串拼接 |
| 6 | < > <= >= | 比较 |
| 7 | == != | 相等 |
| 8 | && | 逻辑与 |
| 9 | \|\| | 逻辑或 |
| 10 | ?: | 三元条件 |

---

## 调试技巧

- **分步调试**：拆开复杂表达式，先用 Text 显示中间值
- **利用 visibility**：临时显示调试信息，调完后去掉
- **简化验证**：先写最简单表达式（{{ $__dataModel.x }}）确认数据绑定没问题，再逐步加条件
- **性能考量**：每次 DataModel 变化时所有依赖表达式都会重新求值。避免在表达式中写复杂计算逻辑——应放到自定义函数中

---

相关指南：
→ [使用扩展组件](using-extended-components.md) | → [表达式语言概念](../concepts/expression-language.md) | → [变量系统概念](../concepts/variable-system.md)
