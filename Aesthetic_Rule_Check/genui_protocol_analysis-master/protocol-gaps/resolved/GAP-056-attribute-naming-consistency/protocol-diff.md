# GAP-056 协议修改

## 修改 1: Row 组件 space → itemMargin
- **位置**: specification/harmonyos-a2ui-protocol.md 第 1714 行
- **修改前**:
  ```
  | | | | space | number | 横向布局元素水平方向间距。space为负数或者justifyContent设置为"spaceBetween"、"spaceAround"、"spaceEvenly"时，space不生效。默认值：0，非法值：按默认值处理。单位：vp |
  ```
- **修改后**:
  ```
  | | | | itemMargin | number | 横向布局元素水平方向间距。itemMargin为负数或者justifyContent设置为"spaceBetween"、"spaceAround"、"spaceEvenly"时，itemMargin不生效。默认值：0，非法值：按默认值处理。单位：vp |
  ```
- **理由**: 统一属性命名规范，`itemMargin` 语义更清晰，明确表示子元素间距。

## 修改 2: Column 组件 space → itemMargin
- **位置**: specification/harmonyos-a2ui-protocol.md 第 1734 行
- **修改前**:
  ```
  | | | | space | number | 纵向布局元素垂直方向间距。space为负数或者justifyContent设置为"spaceBetween"、"spaceAround"、"spaceEvenly"时，space不生效。默认值：0，非法值：按默认值处理。单位：vp |
  ```
- **修改后**:
  ```
  | | | | itemMargin | number | 纵向布局元素垂直方向间距。itemMargin为负数或者justifyContent设置为"spaceBetween"、"spaceAround"、"spaceEvenly"时，itemMargin不生效。默认值：0，非法值：按默认值处理。单位：vp |
  ```
- **理由**: 与 Row 组件保持一致，统一属性命名规范。

## 修改 3: Radio uncheckedBorderColor → unCheckedBorderColor
- **位置**: specification/harmonyos-a2ui-protocol.md 第 1603 行
- **修改前**:
  ```
  | uncheckedBorderColor | 未选中状态描边颜色 | 16进制字符串 | 否 | "uncheckedBorderColor": "#FFAAFF" |
  ```
- **修改后**:
  ```
  | unCheckedBorderColor | 未选中状态描边颜色 | 16进制字符串 | 否 | "unCheckedBorderColor": "#FFAAFF" |
  ```
- **理由**: 统一驼峰命名规范，`unChecked` 而非 `unchecked`。

## 修改 4: Checkbox unselectedColor → unSelectedColor
- **位置**: specification/harmonyos-a2ui-protocol.md 第 1629 行
- **修改前**:
  ```
  | unselectedColor | 设置多选框非选中状态颜色。 | 16进制字符串 | 否 | "unselectedColor": "#FFAAFF" |
  ```
- **修改后**:
  ```
  | unSelectedColor | 设置多选框非选中状态颜色。 | 16进制字符串 | 否 | "unSelectedColor": "#FFAAFF" |
  ```
- **理由**: 统一驼峰命名规范，`unSelected` 而非 `unselected`。

## 修改 5: CheckboxGroup unselectedColor → unSelectedColor
- **位置**: specification/harmonyos-a2ui-protocol.md 第 1655 行
- **修改前**:
  ```
  | unselectedColor | 设置非选中状态颜色。 | 16进制字符串 | 否 | "unselectedColor": "#FFAAFF" |
  ```
- **修改后**:
  ```
  | unSelectedColor | 设置非选中状态颜色。 | 16进制字符串 | 否 | "unSelectedColor": "#FFAAFF" |
  ```
- **理由**: 与 Checkbox 组件保持一致，统一驼峰命名规范。

## 修改 6: TabContent selectColor → selectedColor
- **位置**: specification/harmonyos-a2ui-protocol.md 第 1881 行
- **修改前**:
  ```
  | selectColor | 当前选中tab的标题颜色 | 16进制字符串 | 否 | `"selectColor": "#FFABCD"` |
  ```
- **修改后**:
  ```
  | selectedColor | 当前选中tab的标题颜色 | 16进制字符串 | 否 | `"selectedColor": "#FFABCD"` |
  ```
- **理由**: 统一使用过去分词形式 `selected`，语义更准确。

## 修改 7: TabContent unselectedColor → unSelectedColor
- **位置**: specification/harmonyos-a2ui-protocol.md 第 1882 行
- **修改前**:
  ```
  | unselectedColor | 默认的标题颜色 | 16进制字符串 | 否 | `"unselectedColor": "#FFABCD"` |
  ```
- **修改后**:
  ```
  | unSelectedColor | 默认的标题颜色 | 16进制字符串 | 否 | `"unSelectedColor": "#FFABCD"` |
  ```
- **理由**: 统一驼峰命名规范，`unSelected` 而非 `unselected`。

## 修改 8: TabContent selectBackgroundColor → selectedBackgroundColor
- **位置**: specification/harmonyos-a2ui-protocol.md 第 1884 行
- **修改前**:
  ```
  | selectBackgroundColor | 当前选中的tab背景色 | 16进制字符串 | 否 | `"selectBackgroundColor": "#FFABCD"` |
  ```
- **修改后**:
  ```
  | selectedBackgroundColor | 当前选中的tab背景色 | 16进制字符串 | 否 | `"selectedBackgroundColor": "#FFABCD"` |
  ```
- **理由**: 统一使用过去分词形式 `selected`，与其他属性保持一致。

## 修改 9: TabContent selectBorderColor → selectedBorderColor
- **位置**: specification/harmonyos-a2ui-protocol.md 第 1886 行
- **修改前**:
  ```
  | selectBorderColor | 选中的tab边框颜色 | 16进制字符串 | 否 | `"selectBorderColor": "#FFABCD"` |
  ```
- **修改后**:
  ```
  | selectedBorderColor | 选中的tab边框颜色 | 16进制字符串 | 否 | `"selectedBorderColor": "#FFABCD"` |
  ```
- **理由**: 统一使用过去分词形式 `selected`，与其他属性保持一致。
