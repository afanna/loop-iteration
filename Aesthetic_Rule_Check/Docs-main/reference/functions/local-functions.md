# 本地函数

GenUI 支持通过 ClientFunction 注册和调用本地函数（Local Function），实现自定义业务逻辑。本地函数在 ArkTS 层加入 Catalog，DSL 中通过 [FunctionCall](functioncall.md) 的 call 名称调用。

> 以下示例中，ArkTS 代码为**开发者编写的客户端代码**，JSON 示例为 **DSL 消息片段**（LLM 生成的模型产物，而非开发者手写的代码）。

## API 与注册

本页不重复列出 ClientFunction 的完整字段。请以 [ClientFunction API](../API/client-function.md#clientfunction) 为准：

- [ClientFunction](../API/client-function.md#clientfunction)：声明函数名称、Schema 和实现。
- [FunctionCall](../API/client-function.md#functioncall)：函数执行签名，接收 params 与 context。
- [FunctionContext](../API/client-function.md#functioncontext)：通过 context.onError() 主动上报业务错误。
- [addClientFunction](../API/catalog.md#addclientfunction)：把函数加入已有 Catalog，重名时替换。

完整创建与注册示例见 [自定义函数指南](../../guides/creating-custom-functions.md)。创建独立 Catalog 时，也可以把 ClientFunction[] 作为 CatalogFactory.createCatalog() 的函数列表传入。

## 在 DSL 中调用

DSL 侧统一使用 [FunctionCall](functioncall.md) 调用本地函数：call 写 ClientFunction.name，args 写本次调用参数，returnType 声明期望返回类型。常见位置包括组件 action.functionCall、动态值和校验条件，示例见 [自定义函数指南：在 DSL 中调用](../../guides/creating-custom-functions.md#step-2在-dsl-中调用)。

## 注意事项

- 函数名称必须在当前 Catalog 内唯一，避免覆盖内置函数或其他自定义函数。
- FunctionCall 是同步接口；异步业务应先返回可同步表达的状态，再通过业务消息更新 UI。
- 函数内部应校验参数类型和有效性；业务错误通过 context.onError() 上报。
- 本地函数的返回值类型应与 DSL 中声明的 returnType 一致，否则会触发类型校验失败。

## 参考链接

- [函数概览](overview.md)
- [FunctionCall 类型说明](functioncall.md)
- [进阶使用：自定义函数](../../guides/creating-custom-functions.md)

---

↑ [返回文档导航](../../README.md)
