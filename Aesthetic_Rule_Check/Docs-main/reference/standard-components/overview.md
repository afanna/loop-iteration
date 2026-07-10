# 标准组件参考

> **Catalog**：A2UI Basic Catalog（https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json）
> **使用指南**：[构建 UI（标准组件）](../../guides/building-ui-standard.md)

## 组件列表（18 个）

### 布局容器

| 组件 | 文件 | 说明 |
|------|------|------|
| **Row** | [row.md](row.md) | 水平布局容器 |
| **Column** | [column.md](column.md) | 垂直布局容器 |
| **List** | [list.md](list.md) | 可滚动列表 |

### 展示组件

| 组件 | 文件 | 说明 |
|------|------|------|
| **Text** | [text.md](text.md) | 文本展示 |
| **Image** | [image.md](image.md) | 图片展示 |
| **Icon** | [icon.md](icon.md) | 系统图标 |
| **Divider** | [divider.md](divider.md) | 分割线 |

### 交互组件

| 组件 | 文件 | 说明 |
|------|------|------|
| **Button** | [button.md](button.md) | 按钮 |
| **TextField** | [textfield.md](textfield.md) | 文本输入框 |
| **CheckBox** | [checkbox.md](checkbox.md) | 复选框 |
| **Slider** | [slider.md](slider.md) | 滑块 |
| **DateTimeInput** | [dateTimeInput.md](dateTimeInput.md) | 日期时间输入 |
| **ChoicePicker** | [choicePicker.md](choicePicker.md) | 选项选择器 |

### 容器组件

| 组件 | 文件 | 说明 |
|------|------|------|
| **Card** | [card.md](card.md) | 卡片容器 |
| **Modal** | [modal.md](modal.md) | 模态框 |
| **Tabs** | [tabs.md](tabs.md) | 标签页 |

### 高级组件

| 组件 | 文件 | 说明 |
|------|------|------|
| **Video** | [video.md](video.md) | 视频播放器 |
| **AudioPlayer** | [audioPlayer.md](audioPlayer.md) | 音频播放器 |

## 通用属性

所有标准组件共享以下属性：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 组件唯一标识 |
| component | string | 是 | 组件类型（如 "Text"、"Button"） |
| weight | number | 否 | 布局权重。<br> 默认值：""。 |
| accessibility | object | 否 | 无障碍属性。<br> 默认值：{}。 |

## 组件选择速查

| 你需要... | 用这个组件 |
|-----------|-----------|
| 垂直排列内容 | Column |
| 水平排列内容 | Row |
| 单个子组件的卡片风格 | Card |
| 滚动列表 | List |
| 弹窗确认 | Modal |
| 用户输入文本 | TextField |
| 用户输入数字范围 | Slider |
| 用户多选/单选 | ChoicePicker |
| 用户点击触发操作 | Button |
| 纯文本展示 | Text |
| 纯图片展示 | Image |
| 系统图标 | Icon |
| 分割线 | Divider |
| 日期时间选择 | DateTimeInput |
| 复选框 | CheckBox |
| 视频 | Video |
| 音频 | AudioPlayer |
| 标签页 | Tabs |

## Text variant 字号

| variant | 字号 | 用途 |
|---------|------|------|
| h1 | 56fp | 超大标题 |
| h2 | 48fp | 大标题 |
| h3 | 38fp | 中标题 |
| h4 | 30fp | 小标题 |
| h5 | 24fp | 副标题 |
| body | 14fp | 正文（默认） |
| caption | 10fp | 说明文字 |

## Column / Row 对齐

| 属性 | 可选值 | 作用 |
|------|--------|------|
| justify | start / center / end / spaceAround / spaceBetween / spaceEvenly | 主轴对齐 |
| align | start / center / end | 交叉轴对齐 |

## Button variant

| variant | 风格 |
|---------|------|
| default | 默认 |
| primary | 主按钮（品牌色填充） |
| borderless | 无边框（品牌色文字） |

---

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
