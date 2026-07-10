# API 速查

GenUI 公开 API 按源文件组织，本目录每个文件对应 SDK 的一个接口定义文件。

## 类型

- [Types](./types.md) — A2UIValueType、SchemaProvider、SurfaceEventType、SurfaceErrorCode、ThemeMode、Breakpoint

## 控制器与渲染

- [SurfaceController](./surface-controller.md) — 单 Surface 控制器及附属回调类型
- [MultiSurfaceController](./multi-surface-controller.md) — 多 Surface 栈控制器
- [Factories](./factories.md) — CatalogFactory、SurfaceControllerFactory
- [UIRendererComponent](./ui-renderer-component.md) — 渲染承载组件

## Catalog

- [Catalog](./catalog.md) — 能力集管理（组件项与本地函数项的增删查）
- [CatalogItem](./catalog-item.md) — 组件注册项、CustomComponentAttribute、ComponentTheme、ChangeReason
- [ClientFunction](./client-function.md) — 本地函数注册项、FunctionContext、FunctionCall

## 数据绑定

- [DynamicValueResolver](./dynamic-value-resolver.md) — 动态值解析（evaluateValue / resolvePropertyValue）

## Prompt 与版本能力

- [PromptBuilder](./prompt-builder.md) — LLM 提示词与 Schema 生成
- [Capabilities](./capabilities.md) — 能力清单查询
- [Version](./version.md) — 协议版本常量
