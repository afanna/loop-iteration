# 故障排查

## 调试工作流

当遇到问题时，按以下步骤定位：

```
① 确认 DSL 是否被正确喂入
   → 在 handleMessage 前打印 JSON 字符串

② 确认 Surface 事件回调是否触发
   → SurfaceEventCallback 记录所有事件类型

③ 确认是否有错误回调
   → registerErrorCallback 捕获解析/渲染错误

④ 用最小 DSL 隔离问题
   → 只用 createSurface + 一个 Text 组件验证
```

对应接口参考：[handleMessage](../reference/API/surface-controller.md#handlemessage)、[SurfaceEventCallback](../reference/API/surface-controller.md#surfaceeventcallback)、[registerErrorCallback](../reference/API/surface-controller.md#registererrorcallback)、[createSurface](../reference/messages.md#createsurface)、[Text](../reference/standard-components/text.md)。

---

## 常见集成问题

### Q: 喂入 DSL 后没有任何渲染？

1. 确认先发送了 [createSurface](../reference/messages.md#createsurface)，再发送 [updateComponents](../reference/messages.md#updatecomponents)
2. 确认 surfaceId 在两条消息中一致
3. 确认组件列表中包含 "id": "root" 的根组件
4. 确认 version 字段为 "v0.9"；扩展能力通过 catalogId: "ohos.a2ui.extended.catalog" 启用
5. 确认 [UIRendererComponent](../reference/API/ui-renderer-component.md#uirenderercomponent) 的 surfaceController 已正确绑定
6. 确认没有在同一轮同步流程中连续发送 [createSurface](../reference/messages.md#createsurface)、[updateComponents](../reference/messages.md#updatecomponents) 和 [deleteSurface](../reference/messages.md#deletesurface)，否则下一帧可能只看到已删除后的空状态。

### Q: 数据绑定不生效？

1. 确认 [path](../concepts/data-model-and-binding.md#json-pointer-路径) 格式正确——以 / 开头代表绝对路径
2. 确认 [updateDataModel](../reference/messages.md#updatedatamodel) 已经发送了对应路径的数据
3. 确认 [updateDataModel](../reference/messages.md#updatedatamodel) 的 surfaceId 与组件所在 [Surface](../concepts/surfaces-and-messages.md#surface-是什么) 一致
4. 确认数据先于组件到达或组件能等数据（GenUI 会缓存）

### Q: 表达式 {{ }} 不生效？

1. 确认使用了 [CatalogFactory.extended()](../reference/API/factories.md#catalogfactoryextended)（扩展 Catalog）
2. 确认[表达式语法](../concepts/expression-language.md#基础语法)正确——字符串用单引号，变量用正确路径
3. 确认引用的变量在对应作用域中存在
4. 检查 $__dataModel.xxx 路径大小写与 [DataModel](../concepts/data-model-and-binding.md#datamodel-是什么) 中一致

### Q: 扩展组件事件（[EventHandler](../reference/extended-components/overview.md#通用事件属性)）无响应？

1. 确认事件名拼写正确（onClick/onAppear/onChange/onReachStart/onReachEnd）
2. 确认 handler 的 call 字段是字符串，且函数名已注册
3. 检查是否有 condition 为 false 导致 handler 被跳过
4. 检查链中是否有 [break](../reference/functions/extension-functions.md#控制流) 提前中断了后续 handler

### Q: 标准组件和扩展组件能混用吗？

不能。每个 [Surface](../concepts/surfaces-and-messages.md#surface-是什么) 在 [createSurface](../reference/messages.md#createsurface) 时通过 [catalogId](../reference/messages.md#catalogid-值) 绑定一个 [Catalog](../concepts/catalogs.md)。需要切换时先 [deleteSurface](../reference/messages.md#deletesurface) 再用新 catalogId 重建。

### Q: 切换 Catalog 后之前注册的自定义组件/函数还能用吗？

[Catalog](../concepts/catalogs.md) 是独立的。切换到新 Catalog 后，之前注册到旧 Catalog 的[自定义组件](creating-custom-components.md)/[自定义函数](creating-custom-functions.md)不再可用。需要注册到新 Catalog。

---

## LLM 输出问题

### Q: LLM 生成的 JSON 格式不对？

1. LLM 可能用  ```json  包裹，需要提取中间的 JSON 块
2. LLM 可能用 component: "text"（小写），正确应为 ["Text"](../reference/standard-components/text.md)
3. LLM 可能用 type: "Column"，正确应为 [component: "Column"](../reference/standard-components/column.md)
4. LLM 可能引用不存在的组件 ID（如先引用后定义的子组件）

### Q: 如何让 LLM 生成更准确的 DSL？

1. 确保 [PromptBuilder](../reference/API/prompt-builder.md#promptbuilder) 生成的 [Schema](../reference/schema-validation.md) 已正确注入 system prompt
2. 在 prompt 中提供 [A2UI DSL 消息](../reference/messages.md#协议消息信封)完整示例
3. 校验失败后将[错误信息](../reference/errors.md#错误码说明)作为反馈注入下一轮对话

---

## 性能问题

### Q: 大量组件一次性 [handleMessage](../reference/API/surface-controller.md#handlemessage) 导致界面卡顿？

将组件分批投喂：

```ts
// 不好的做法：一次性 50 个组件
controller.handleMessage(bigDSL)

// 更好的做法：分批
for (const batch of splitIntoBatches(components, 10)) {
  controller.handleMessage(
    '{"version":"v0.9",' +
    '"updateComponents":{"surfaceId":"main","components":[]}' +
    '}'
  )
}
```

### Q: 频繁 [updateDataModel](../reference/messages.md#updatedatamodel) 导致性能下降？

[updateDataModel](../reference/messages.md#updatedatamodel) 每次修改都会触发依赖该路径的所有[表达式](../concepts/expression-language.md)重新求值和组件刷新。如果有高频数据更新场景，考虑合并多次更新为一次。

### Q: 表达式过多导致响应变慢？

每个[表达式](../concepts/expression-language.md)在依赖数据变化时都会重新求值。如果页面有大量表达式且数据更新频繁，考虑：
1. 将复杂计算移到[自定义函数](creating-custom-functions.md)中
2. 减少不必要的表达式依赖

---

## 错误码速查

| 错误码 | 错误类型 | 常见原因 |
|--------|----------|----------|
| 1001 | [ERROR_NO_SURFACE_MATCHED](../reference/errors.md#中断渲染) | surfaceId 不存在、已销毁或请求顺序异常 |
| 1002 | [ERROR_NATIVE_PROCESS_FAILED](../reference/errors.md#中断渲染) | 底层执行异常，结合日志定位 |
| 1003 | [ERROR_UNSUPPORTED_PROTOCOL_VERSION](../reference/errors.md#中断渲染) | DSL version 与当前 SDK 不兼容 |
| 1101 | [ERROR_FALLBACK_WARNING](../reference/errors.md#不中断渲染) | 属性值不合法，组件回退默认值继续渲染 |
| 2001 | [ERROR_SCHEMA_WARNING](../reference/errors.md#不中断渲染) | DSL 字段类型或结构不符合 Schema |
| 3001 | [ERROR_ACTION_NOT_REGISTER](../reference/errors.md#其他) | DSL 触发了 action.event，但未调用 [registerActionReceiver](../reference/API/surface-controller.md#registeractionreceiver) |
| 3101 | [ERROR_LOCAL_FUNCTION](../reference/errors.md#不中断渲染) | [自定义函数](creating-custom-functions.md)执行异常 |

### 注册错误回调

```ts
controller.registerErrorCallback((code: SurfaceErrorCode, errorMsg: string) => {
  switch (code) {
    case SurfaceErrorCode.UNSUPPORTED_PROTOCOL_VERSION:
      console.error('不支持的协议版本')
      break
    case SurfaceErrorCode.ACTION_NOT_REGISTER:
      console.error('Action 未接管，请调用 registerActionReceiver')
      break
    case SurfaceErrorCode.LOCAL_FUNCTION:
      console.error('自定义函数异常')
      break
  }
})
```

---

相关指南：
→ [快速集成](quick-integration.md) | → [创建 Surface](creating-surfaces.md) | → [版本兼容性](version-compatibility.md) | → [错误码参考](../reference/errors.md)
