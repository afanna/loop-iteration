# GAP-058 协议修改

## 修改 1: Radio 组件删除 indicatorType 属性

### specification/harmonyos-a2ui-protocol.md 第 1925 行

**修改前：**
```markdown
| | | | group | string，默认值：空字符串 | 否 | 是 | 当前单选框的所属群组名称，相同group的Radio只能有一个被选中。 |
| | | | indicatorType | 字符串枚举值，默认值：tick<br>"tick":系统默认TICK图标<br>"dot":系统默认DOT图标 | 否 | 是 | 配置单选框的选中样式。未设置时按照RadioIndicatorType.TICK进行显示。 |
```

**修改后：**
```markdown
| | | | group | string，默认值：空字符串 | 否 | 是 | 当前单选框的所属群组名称，相同group的Radio只能有一个被选中。 |
```

**理由：** 删除 indicatorType 属性

---

## 修改 2: JSON Schema 删除 indicatorType 定义

### specification/json/extended_catalog.json 第 4389-4397 行

**修改前：**
```json
            "indicatorType": {
              "description": "Selection indicator style. Default: 'tick'. 'tick': checkmark indicator. 'dot': dot indicator.",
              "type": "string",
              "enum": [
                "tick",
                "dot"
              ],
              "default": "tick"
            },
```

**修改后：**
（已删除）

**理由：** 与协议文档保持一致，删除 indicatorType 属性定义
