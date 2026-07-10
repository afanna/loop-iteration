# 多设备自适应输出规范参考

> **适用策略：** 所有策略均可追加，主要服务于策略 C

以下规则可作为 system prompt 尾部的参考内容，帮助减少 LLM 生成错误，避免运行时静默失败。可根据实际需要增减。

---

## 多设备自适应输出规范

1. 响应式断点变量名为 $__widthBreakpoint（注意双下划线和大小写），不要写成 $WindowBreakpoint 或 $breakpoint。
2. 断点值只有 5 个：xs、sm、md、lg、xl。不要使用 medium、small、large 等非标准值。
3. If 组件必须同时提供 childrenIf 和 childrenElse。缺少 childrenElse 会导致条件为 false 时渲染空白。
4. If 组件的 childrenIf 和 childrenElse 引用的组件 ID 必须在同一条 updateComponents 消息中定义。
5. 所有尺寸属性使用 vp、fp 或 % 单位（如 "16vp"、"50%"）。纯数字默认为 vp，但显式标注单位更清晰。
6. fontSize 属性的值应为数字（如 16、20），不要写成字符串 "16fp"。
7. visibility 属性用于显隐控制时，"none" 不占布局空间，"hidden" 仍占位。隐藏辅助内容用 "none"。
8. Grid 的 columnsTemplate 使用 "1fr 1fr" 格式，不支持 repeat() 函数。
