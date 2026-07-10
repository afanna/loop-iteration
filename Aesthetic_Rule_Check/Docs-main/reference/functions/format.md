# 格式化函数

格式化函数用于将数据转换为特定格式的字符串，返回类型为 string。常用于 [DynamicString](../types.md#dynamicstring) 属性值的动态生成。

> 以下示例均为 **DSL 消息片段**，是 LLM 生成的模型产物，而非开发者手写的代码。

## 函数列表

### formatString

模板字符串格式化，支持 ${expr} 占位符语法。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | string | 是 | 包含占位符的模板字符串。 |

说明：模板中的 ${path} 会被替换为数据模型中对应路径的值；${funcName(arg1:'val',...)} 会被替换为函数调用的返回值。这不是 JavaScript 的模板字符串，而是 A2UI 协议自定义的占位符语法，由客户端渲染引擎在运行时解析。

**FunctionCall 片段：**

```json
{
  "call": "formatString",
  "args": {
    "value": "您好，${name}！您有 ${count} 条新消息。"
  },
  "returnType": "string"
}
```

**DSL 示例：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "greeting_surface",
    "components": [
      {
        "id": "greeting",
        "component": "Text",
        "text": {
          "call": "formatString",
          "args": { "value": "您好，${user.name}！您有 ${notifications.count} 条新消息。" },
          "returnType": "string"
        }
      }
    ]
  }
}
```

---

### formatNumber

将数值格式化为指定小数位数的字符串，支持千分位分隔。返回类型：string。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | number | 是 | 待格式化的数值。支持路径绑定。 |
| decimals | number | 否 | 小数位数，取值范围 [0, 20]。默认值：2。 |
| grouping | boolean | 否 | 是否启用千分位分隔符（逗号）。true：启用（如 1,234,567.89）；false：不启用（如 1234567.89）。默认值：false。 |

说明：decimals 缺失时使用默认值 2。取值超出 [0, 20] 范围（如 25）或为非有限值（NaN/Infinity）时，函数返回空字符串 ""。负值（如 -2）会被取绝对值处理（等同于 2）。

**FunctionCall 片段：**

```json
{
  "call": "formatNumber",
  "args": {
    "value": { "path": "price" },
    "decimals": 2,
    "grouping": true
  },
  "returnType": "string"
}
```

输出示例："1,234,567.89"

**DSL 示例：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "product_surface",
    "components": [
      {
        "id": "priceText",
        "component": "Text",
        "text": {
          "call": "formatNumber",
          "args": { "value": { "path": "product.price" }, "decimals": 2, "grouping": true },
          "returnType": "string"
        }
      }
    ]
  }
}
```

---

### formatCurrency

将数值格式化为货币字符串，输出格式为 "{currency} {formatted_number}"。返回类型：string。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | number | 是 | 待格式化的数值。支持路径绑定。 |
| currency | string | 是 | 货币代码，如 "CNY"、"USD"、"EUR"。 |
| decimals | number | 否 | 小数位数，取值范围 [0, 20]。默认值：2。 |
| grouping | boolean | 否 | 是否启用千分位分隔符。true：启用（如 CNY 1,234.56）；false：不启用（如 CNY 1234.56）。默认值：false。 |

说明：decimals 的异常处理与 [formatNumber](#formatnumber) 一致：缺失时使用默认值 2，超出 [0, 20] 或非有限值返回空字符串 ""，负值取绝对值。

**FunctionCall 片段：**

```json
{
  "call": "formatCurrency",
  "args": {
    "value": { "path": "amount" },
    "currency": "CNY",
    "decimals": 2,
    "grouping": true
  },
  "returnType": "string"
}
```

输出示例："CNY 1,234.56"

**DSL 示例：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "order_surface",
    "components": [
      {
        "id": "totalPrice",
        "component": "Text",
        "text": {
          "call": "formatCurrency",
          "args": { "value": { "path": "order.total" }, "currency": "CNY", "decimals": 2, "grouping": true },
          "returnType": "string"
        }
      }
    ]
  }
}
```

---

### formatDate

将 ISO 8601 日期字符串按照指定模式格式化。返回类型：string。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | string | 是 | ISO 8601 格式的日期字符串，如 "2026-05-19" 或 "2026-05-19T14:30:00"。 |
| format | string | 是 | 格式化模式字符串，使用下表的模式字符组合。 |

模式字符说明：

| 模式 | 输出 | 说明 |
|------|------|------|
| yyyy | 2026 | 四位年份 |
| yy | 26 | 两位年份 |
| MMMM | January | 月份全称 |
| MMM | Jan | 月份缩写 |
| MM | 01 | 两位月份 |
| M | 1 | 月份 |
| dd | 19 | 两位日期 |
| d | 19 | 日期 |
| EEEE | Monday | 星期全称 |
| E | Mon | 星期缩写 |
| HH | 14 | 24 小时制两位小时 |
| H | 14 | 24 小时制小时 |
| hh | 02 | 12 小时制两位小时 |
| h | 2 | 12 小时制小时 |
| mm | 30 | 两位分钟 |
| m | 30 | 分钟 |
| ss | 00 | 两位秒数 |
| s | 0 | 秒数 |
| a | AM / PM | 上午/下午标识 |

**FunctionCall 片段：**

```json
{
  "call": "formatDate",
  "args": {
    "value": "2026-05-19T14:30:00",
    "format": "yyyy年MM月dd日 HH:mm"
  },
  "returnType": "string"
}
```

输出："2026年05月19日 14:30"

**DSL 示例：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "date_surface",
    "components": [
      {
        "id": "dateText",
        "component": "Text",
        "text": {
          "call": "formatDate",
          "args": { "value": { "path": "event.date" }, "format": "yyyy年MM月dd日 HH:mm" },
          "returnType": "string"
        }
      }
    ]
  }
}
```

---

### pluralize

基于 CLDR 复数规则，根据数值和当前系统语言选择正确的复数形式。返回类型：string。

> **CLDR**（Common Locale Data Repository，通用区域数据仓库）是 Unicode 联盟定义的本地化数据标准。**复数规则**是 CLDR 中定义的一套规则，用于根据数值和语言环境自动选择正确的语法形式。例如英语中 "1 item"（单数）和 "2 items"（复数），俄语则有 "1 элемент"（单数）、"2 элемента"（少量）、"5 элементов"（大量）三种形式。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | number | 是 | 数量值。支持路径绑定。 |
| zero | string | 否 | 零个时的文本（如拉脱维亚语、阿拉伯语）。默认值：无（回退到 other）。 |
| one | string | 否 | 单数时的文本。默认值：无（回退到 other）。 |
| two | string | 否 | 两个时的文本（如阿拉伯语、威尔士语）。默认值：无（回退到 other）。 |
| few | string | 否 | 少量时的文本（如俄语、波兰语）。默认值：无（回退到 other）。 |
| many | string | 否 | 大量时的文本（如俄语、波兰语）。默认值：无（回退到 other）。 |
| other | string | 否 | 默认/其他情况的文本。建议始终提供。默认值：无。 |

说明：
- 函数根据系统语言和数值自动选择 CLDR 复数类别（zero、one、two、few、many、other）。
- 如果当前类别对应的参数未提供，会回退到 other。
- 中文、英文等语言使用 one/other 两种形式；俄语、波兰语等使用 one/few/many/other；阿拉伯语使用全部六种形式。

**FunctionCall 片段：**

```json
{
  "call": "pluralize",
  "args": {
    "value": { "path": "count" },
    "one": "1 项物品",
    "other": "${value} 项物品"
  },
  "returnType": "string"
}
```

**DSL 示例：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "cart_surface",
    "components": [
      {
        "id": "cartCount",
        "component": "Text",
        "text": {
          "call": "pluralize",
          "args": { "value": { "path": "cart.itemCount" }, "one": "1 件商品", "other": "${value} 件商品" },
          "returnType": "string"
        }
      }
    ]
  }
}
```

## 参考链接

- [函数概览](overview.md)
- [验证函数](validation.md)
- [FunctionCall 类型说明](functioncall.md)

---

↑ [返回文档导航](../../README.md)
