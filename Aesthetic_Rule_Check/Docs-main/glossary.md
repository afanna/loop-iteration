# 术语表

## A2UI 协议术语

| 术语 | 说明 |
|------|------|
| **A2UI** | Agent-to-UI，一个开放的 UI 描述协议，定义 AI 如何通过 JSON 描述生成 UI |
| **Agent** | 生成 A2UI JSON 的 AI 服务或端侧编排模块 |
| **Renderer** | 解析 A2UI JSON 并将其渲染为平台原生组件的一方。在鸿蒙中即 GenUI HAR |
| **Surface** | 一个独立的 UI 区域，有自己的组件树、DataModel 和生命周期 |
| **Catalog** | 组件和函数的可用集合，定义了 Agent 可用哪些能力。每个 Surface 绑定一个 Catalog |
| **Catalog ID** | Catalog 的唯一标识，在 createSurface 中声明 |
| **Basic Catalog** | A2UI 原生 18 标准组件的 Catalog |
| **鸿蒙扩展 Catalog** | 21 个扩展组件 + 表达式 + 变量的 Catalog（ohos.a2ui.extended.catalog） |
| **Adjacency List（邻接表）** | A2UI 的组件组织方式：组件以扁平列表声明，通过 ID 引用建立父子关系 |
| **JSONL** | JSON Lines，A2UI 的流式传输格式，每行一个完整 JSON 消息 |
| **JSON Pointer** | RFC 6901 定义的路径语法，用于从 DataModel 中定位数据 |
| **DataModel** | Surface 的数据存储，由 updateDataModel 消息填充 |
| **DynamicValue** | 可在运行时解析的值：字面量 / 路径绑定 / 函数调用 |
| **Action** | 用户交互行为。可以是 Server Action（event）或 Local Action（functionCall） |
| **EventHandler** | 事件处理链，鸿蒙扩展的事件系统 |
| **UI 树** | 组件的树形结构。A2UI 使用扁平邻接表声明组件，渲染时自动构建为 UI 树 |
| **Static Binding** | 静态绑定，组件属性通过 JSON Pointer 直接引用 DataModel 中固定路径（如 { "text": { "path": "/user/name" } }） |
| **Template Binding** | 模板绑定，容器通过 children: { "componentId": "xxx", "path": "/items" } 从 DataModel 数组动态生成子组件 |
| **Streaming** | 流式传输和渲染——边生成、边传输、边渲染的渐进式处理方式 |
| **DSL** | Domain-Specific Language，领域专用语言。在 GenUI 中特指 A2UI 协议定义的 JSON/JSONL 格式 UI 描述 |
| **LLM** | Large Language Model，大语言模型。接收含 Schema 和 Catalog 的提示词，生成符合 A2UI 协议的 DSL 输出 |
| **Schema** | JSON Schema 格式的协议结构定义，定义组件属性、类型和约束。Genui 中用于 PromptBuilder 生成提示词和校验 DSL 合法性 |
| **tool chain** | Agent 可以调用的工具或 API 集合，包括业务接口、数据库查询、外部服务等。在云侧 Agent 模式下，tool chain 与 Genui 能力共同构成完整的 Agent 能力集 |
| **对话系统** | 管理多轮对话的系统，维护对话历史、上下文和用户意图。在端侧 Agent 模式下，对话系统由端侧管理；在云侧 Agent 模式下，对话系统由云侧 Agent 服务提供 |
| **RPA 工作流** | Robotic Process Automation（机器人流程自动化）的工作流程，通过预设规则自动化执行重复性业务操作。Genui 可与现有 RPA 工作流集成，通过 A2UI 协议为 RPA 提供动态 UI 能力 |

## GenUI 术语

| 术语 | 说明 |
|------|------|
| **GenUI** | 基于 OpenHarmony ArkUI 的 A2UI 协议实现框架 |
| **GenUI HAR** | GenUI 的 HarmonyOS 包，应用通过引入 HAR 包使用 GenUI 能力 |
| **SurfaceController** | GenUI 的核心 API，管理单个 Surface 的生命周期、接收 DSL、分发事件 |
| **MultiSurfaceController** | 扩展控制器，支持多 Surface 栈管理和返回手势 |
| **UIRendererComponent** | ArkUI @Component，将 Surface 组件树渲染为原生 ArkUI 控件 |
| **PromptBuilder** | 基于 Catalog 生成 LLM 系统提示词的工具 |
| **Capabilities** | 暴露 GenUI 能力信息（支持的协议版本、Catalog 标识）的查询 API |
| **CatalogFactory** / **SurfaceControllerFactory** | 创建 Catalog 与控制器的工厂类，是实例化的唯一入口 |
| **FunctionBridge** | 自定义函数注册机制 |
| **CatalogItem** | Catalog 中的组件注册单元，包含 name、schemaProvider、componentBuilder |
| **ClientFunction** | Catalog 中的本地函数注册单元，包含 name、schemaProvider、functionCall |
| **DynamicValueResolver** | 动态值解析器，在自定义组件与本地函数中解析路径绑定 / 函数调用，支持一次性取值（evaluateValue）与响应式订阅（resolvePropertyValue） |
| **CustomComponentAttribute** | 自定义组件 @Builder 的入参类型，包含 customProps、componentTheme、resolver、changeReason 等 |
| **API 版本** | GenUI 支持的最小鸿蒙 API 级别，当前为 API 20（DevEco Studio 6.0.0） |

## 鸿蒙扩展特有术语

| 术语 | 说明 |
|------|------|
| **表达式** | {{ }} 包裹的动态计算语法，支持运算符和变量引用 |
| **变量系统** | 5 类变量：全局系统变量、DataModel 变量、循环变量、事件链变量、事件上下文变量 |
| **响应式断点** | 5 个窗口宽度断点（xs/sm/md/lg/xl），与鸿蒙官方体系对齐 |
| **If 组件** | 条件渲染组件，根据表达式结果切换 childrenIf 和 childrenElse |
| **styles 对象** | 扩展组件的统一样式传递容器，支持 15 种通用样式 |
| **EventHandler 链** | 扩展的事件处理机制，支持 call/args/as/condition 的链式调用 |
| **模板生成** | 容器组件通过 children.template 动态生成子组件的能力 |
