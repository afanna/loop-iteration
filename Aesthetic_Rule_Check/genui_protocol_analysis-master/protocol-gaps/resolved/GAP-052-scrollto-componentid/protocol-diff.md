# GAP-052 协议修改记录

## 修改 1: §4.3.2 预定义行为表 — scrollTo 新增 componentId

**位置**: §4.3.2 预定义行为类型表

**修改前**:
```
| scrollTo | List滑动顶部或底部 | void | xOffset | number... |
| | | | yOffset | number... |
```

**修改后**:
```
| scrollTo | 滚动 List 到指定位置 | void | componentId | string<br>要操作的目标List组件ID |
| | | | xOffset | number... |
| | | | yOffset | number... |
```

**理由**: 缺少 componentId 无法指定目标 List，对标 navigate、setAttributes 的惯例。

---

## 修改 2: §4.3.2 scrollTo 详细说明 + 示例

**修改前**:
```
* **scrollTo**：List向顶部或底部滑动。

示例：
{
  "call": "scrollTo",
  "args": {
    "xOffset": 10
  }
}

参数说明：
| xOffset | number | 是 | ...
| yOffset | number | 是 | ...
```

**修改后**:
```
* **scrollTo**：滚动 List 到指定位置。

示例：
{
  "call": "scrollTo",
  "args": {
    "componentId": "targetList",
    "xOffset": 0,
    "yOffset": 0
  }
}

参数说明：
| componentId | string | 是 | 要操作的目标List组件ID |
| xOffset | number | 是 | ...
| yOffset | number | 是 | ...
```

---

## 修改 3: JSON Schema ScrollToArgs — 新增 componentId

**位置**: JSON Schema §ScrollToArgs

**修改**: properties 新增 componentId 定义，additionalProperties 改为 true。

## 修改 4: JSON Schema scrollTo example — 补充 componentId

**修改前**: args 只有 yOffset: 0
**修改后**: args 有 componentId: "targetList", yOffset: 0
