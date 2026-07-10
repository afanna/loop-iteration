# 架构概览

## 双层协议架构

GenUI 采用双层协议架构：A2UI 标准协议层提供基础通信能力，鸿蒙扩展协议层在此基础上通过 Catalog 机制增加高级 UI 能力。

```mermaid
flowchart TB
  subgraph Host["宿主应用（Host App）"]
    direction TB
    subgraph ArkUI["ArkUI 页面"]
      direction TB
      subgraph GenUI["GenUI HAR 包"]
        direction TB
        PB["PromptBuilder<br/>· 生成提示词<br/>· Schema 注入"]
        SC["SurfaceController<br/>· handleMessage(DSL)<br/>· 管理 Surface 生命周期"]
        UI["UIRenderer<br/>· 渲染 ArkUI 组件"]
        FB["FunctionBridge<br/>· 自定义函数注册"]
        FC["Capabilities<br/>· 暴露 GenUI 支持的能力信息<br/>· 协议版本、Catalog"]

        PB ~~~ SC
        SC ~~~ UI
        UI ~~~ FB
        FB ~~~ FC
      end
    end
  end

  classDef host fill:#F8FAFC,stroke:#64748B,stroke-width:1.5px,color:#0F172A;
  classDef builder fill:#E8F3FF,stroke:#2F6FEB,stroke-width:1.5px,color:#0F172A;
  classDef runtime fill:#ECFDF5,stroke:#10B981,stroke-width:1.5px,color:#0F172A;
  classDef bridge fill:#FFF7ED,stroke:#F97316,stroke-width:1.5px,color:#0F172A;
  class PB,FC builder;
  class SC,UI runtime;
  class FB bridge;
```

## 端到端数据流

```mermaid
flowchart TB
  Q["用户输入 Query（自然语言）"]
  Host["宿主应用<br/>获取能力信息<br/>（Capabilities）<br/>构建 Prompt<br/>（PromptBuilder）<br/>发送给 Agent/LLM"]

  A["模式 A<br/>云侧 Agent<br/><br/>端侧上报能力<br/>云侧组装提示词<br/>云侧调用LLM<br/>云侧生成DSL"]
  B["模式 B<br/>端侧编排<br/><br/>端侧构建Prompt<br/>直接调用云LLM<br/>流式解析响应<br/>端侧喂入GenUI"]

  DSL["A2UI DSL（JSON/JSONL）<br/>{<br/>  &quot;createSurface&quot;: {...},<br/>  &quot;updateComponents&quot;: {...},<br/>  &quot;updateDataModel&quot;: {...}<br/>}"]

  SC["SurfaceController.handleMessage<br/>· 解析消息<br/>· 构建组件树<br/>· 绑定 DataModel"]
  UI["UIRendererComponent<br/>· 渲染为原生 ArkUI 组件<br/>· 鸿蒙扩展协议：解析表达式<br/>· 鸿蒙扩展协议：注入变量作用域"]
  User["用户看到 UI"]
  Action["registerActionReceiver<br/>· 捕获 Action 事件<br/>· 解析 context 数据"]
  Interact["用户交互<br/>点击按钮 / 填写表单 / 选择选项"]
  Loop["回到 Agent/LLM（携带 Action 上下文）<br/>→ 生成新的 DSL → 更新 UI"]

  Q --> Host
  Host --> A
  Host --> B
  A --> DSL
  B --> DSL
  DSL --> SC --> UI --> User
  User --> Interact --> Action
  Action -->|"回环"| Loop
  Loop -.-> DSL

  classDef input fill:#F8FAFC,stroke:#64748B,stroke-width:1.5px,color:#0F172A;
  classDef modeA fill:#E8F3FF,stroke:#2F6FEB,stroke-width:1.5px,color:#0F172A;
  classDef modeB fill:#FFF7ED,stroke:#F97316,stroke-width:1.5px,color:#0F172A;
  classDef data fill:#ECFDF5,stroke:#10B981,stroke-width:1.5px,color:#0F172A;
  classDef render fill:#F3E8FF,stroke:#8B5CF6,stroke-width:1.5px,color:#0F172A;
  class Q,Host input;
  class A modeA;
  class B modeB;
  class DSL data;
  class SC,UI,User,Interact,Action,Loop render;
```

## 核心模块

| 模块 | 职责 |
|------|------|
| **Catalog** | 声明 GenUI 支持哪些组件和函数。每个 Surface 通过 catalogId 绑定一个 Catalog，决定可用哪套组件体系 |
| **SurfaceController** | 管理单个 Surface 的生命周期。接收 DSL、触发渲染、分发事件、查询状态 |
| **MultiSurfaceController** | 管理多个 Surface 的栈结构。支持推入、弹出、返回手势 |
| **UIRendererComponent** | ArkUI [@Component](../glossary.md#uirenderercomponent)，将 Surface 的组件树渲染为原生 ArkUI 控件 |
| **PromptBuilder** | 基于 Catalog 中的 Schema 信息生成 LLM 系统提示词，告诉 LLM 可用的组件和函数 |
| **Capabilities** | 暴露 GenUI 支持的能力信息（协议版本、Catalog 标识） |
| **FunctionBridge** | 允许应用注册自定义函数，函数可在 DSL 中被引用（action、动态值、校验规则） |

## 下一步

- [快速上手](quickstart.md) — 5 分钟体验 GenUI
- [A2UI 与鸿蒙扩展](a2ui-and-harmonyos.md) — 理解两套协议的差异
- [Surface 与消息](../concepts/surfaces-and-messages.md) — 深入理解协议消息
