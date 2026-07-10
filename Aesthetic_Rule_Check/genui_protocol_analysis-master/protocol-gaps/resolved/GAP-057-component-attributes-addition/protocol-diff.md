# GAP-057 协议修改

## 修改 1: Button 组件新增 fontColor 样式
- **位置**: specification/harmonyos-a2ui-protocol.md 第 1510 行
- **修改前**:
  ```
  | 样式名称 | 样式说明 | 样式类型 | 必选 | 使用示例 |
  |----------|----------|----------|------|----------|
  | fontSize | 设置字体大小，默认16 fp | 数字，单位为fp | 否 | "fontSize": 16 |
  ```
- **修改后**:
  ```
  | 样式名称 | 样式说明 | 样式类型 | 必选 | 使用示例 |
  |----------|----------|----------|------|----------|
  | fontColor | 设置按钮文本显示颜色 | 16进制字符串 | 否 | "fontColor": "#FFAAFF" |
  | fontSize | 设置字体大小，默认16 fp | 数字，单位为fp | 否 | "fontSize": 16 |
  ```
- **理由**: Button 组件缺少文本颜色控制，fontColor 是常见的样式属性，补充后可支持自定义按钮文本颜色。

## 修改 2: Row 组件新增 wrap 属性
- **位置**: specification/harmonyos-a2ui-protocol.md 第 1717 行
- **修改前**:
  ```
  | Row | 布局组件 | 水平方向线性布局，将子组件沿水平方向排列。 | children | List[String] 或者 object { componentId: string, path: string } | 子组件ID列表 或者 模板组件ID和循环数据路径 |
  | | | | itemMargin | number | 横向布局元素水平方向间距。itemMargin为负数或者justifyContent设置为"spaceBetween"、"spaceAround"、"spaceEvenly"时，itemMargin不生效。默认值：0，非法值：按默认值处理。单位：vp |
  ```
- **修改后**:
  ```
  | Row | 布局组件 | 水平方向线性布局，将子组件沿水平方向排列。 | children | List[String] 或者 object { componentId: string, path: string } | 子组件ID列表 或者 模板组件ID和循环数据路径 |
  | | | | itemMargin | number | 横向布局元素水平方向间距。itemMargin为负数或者justifyContent设置为"spaceBetween"、"spaceAround"、"spaceEvenly"时，itemMargin不生效。默认值：0，非法值：按默认值处理。单位：vp |
  | | | | wrap | 字符串枚举值 | 子元素换行控制。<br>"noWrap"：以单行布局，子元素尽可能约束在容器内。默认值。<br>"wrap"：以多行布局，子项允许超出容器并换行。 |
  ```
- **理由**: Row 组件缺少换行控制属性，wrap 是常见的布局属性（类似 CSS flex-wrap），补充后可支持子元素自动换行的多行布局场景。
