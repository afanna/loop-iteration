# Agent 部署模式

应用根据自身的业务和实际端云架构，可能会使用两种不同的 A2UI 生成部署方式。选择哪种取决于 Agent 的部署位置和系统架构。

## 模式 A：云侧 Agent

Agent 部署在云端，拥有完整的业务逻辑、tool chain、LLM 调用能力。端侧只需要上报 GenUI 能力信息。

```mermaid
flowchart TB
  subgraph E1["端侧（HarmonyOS App）"]
    direction TB
    A1["① 获取能力信息<br/>Capabilities.getCapabilities()<br/>协议版本 · Catalog 标识"]
    A2["② 构建能力描述文本<br/>PromptBuilder.buildInstruction()<br/>可选"]
    A3["③ 发送给云侧 Agent"]
    A1 --> A2 --> A3
  end

  subgraph C["云侧 Agent"]
    direction TB
    B1["④ 组装系统提示词<br/>端侧能力 + 业务 tool 定义 + Query"]
    B2["⑤ 结合业务 tool call<br/>返回的真实数据"]
    B3["⑥ 返回 A2UI JSON"]
    B1 --> B2 --> B3
  end

  subgraph E2["端侧"]
    direction TB
    D1["⑦ handleMessage(a2uiJson) → 渲染 UI"]
    D2["⑧ 用户交互<br/>Action 回调 → 云侧<br/>新 JSON → 渲染"]
    D1 --> D2
  end

  A3 --> B1
  B3 --> D1
  D2 -.-> B1

  classDef device fill:#E8F3FF,stroke:#2F6FEB,stroke-width:1.5px,color:#0F172A;
  classDef cloud fill:#FFF3E0,stroke:#F59E0B,stroke-width:1.5px,color:#0F172A;
  class A1,A2,A3,D1,D2 device;
  class B1,B2,B3 cloud;
```

### 云侧 Agent 特点

- **Agent 在云端**：业务逻辑、tool chain、LLM 调用全部在云端
- **端侧轻量**：只需上报能力信息，接收并渲染 DSL
- **架构解耦**：前端和 Agent 独立开发和部署
- **适合已有云 Agent 的系统**：与现有对话系统、RPA 工作流集成

### 端侧关键 API

```ts
import { Capabilities, PromptBuilder, CatalogFactory } from '@arkui-genius/genui'

// 获取 GenUI 能力清单
const manifest = Capabilities.getCapabilities()
// manifest 包含：支持的协议版本、支持的 Catalog 标识

// 构建能力描述文本（可选的，用于给 Agent 看）
const instruction = PromptBuilder.buildInstruction(CatalogFactory.extended())

// 将 manifest + instruction 发送给云侧 Agent
sendToCloudAgent({ manifest, instruction })
```

> **完整示例**：端侧 Agent 的完整实现（对话管理、LLM 调用、流式解析、交互回环）见 [LLM 集成指南 - 模式 B：端侧 Agent 编排](../guides/integrating-llm.md#模式-b端侧-agent-编排)

---

## 模式 B：端侧 Agent 编排

Agent 逻辑部署在端侧（HarmonyOS App 内），云侧只提供 LLM 推理。端侧管理整个对话生命周期。

[ChatDemo](#chatdemo-端侧模块说明) 就是这种模式的完整示例。

```mermaid
flowchart TB
  subgraph E["端侧（HarmonyOS App + GenUI HAR）"]
    direction TB
    A1["① 管理对话历史<br/>(ChatAgent)"]
    A2["② 组装 Prompt<br/>· 用户输入<br/>· 对话历史<br/>· GenUI 能力 Schema<br/>（PromptBuilder）"]
    A3["③ 调用云 LLM API<br/>（HTTP SSE 流式）"]
    A4["④ 解析流式响应<br/>（A2UIParser）<br/>· 提取 JSONL<br/>· BFS 分解组件"]
    A5["⑤ controller.handleMessage() → 渲染"]
    A6["⑥ 用户交互<br/>· Action 回调<br/>· 转为自然语言<br/>· 作为下一轮 Prompt<br/>· 回到步骤 ②"]

    A1 --> A2 --> A3 --> A4 --> A5 --> A6
    A6 -.-> A2
  end

  subgraph C["云 LLM（DeepSeek / GLM / ...）"]
    B1["接收 Prompt<br/>推理<br/>流式返回 A2UI JSON"]
  end

  A3 -->|"仅：③ 调用云 LLM API"| B1
  B1 --> A4

  classDef device fill:#E8F3FF,stroke:#2F6FEB,stroke-width:1.5px,color:#0F172A;
  classDef cloud fill:#F3E8FF,stroke:#8B5CF6,stroke-width:1.5px,color:#0F172A;
  class A1,A2,A3,A4,A5,A6 device;
  class B1 cloud;
```

### 端侧 Agent 编排特点

- **Agent 在端侧**：对话管理、Prompt 组装、响应流式解析全部在端侧
- **云侧只做推理**：LLM 纯粹是 API 调用
- **端侧自主控制**：不依赖云侧 Agent 服务，灵活性高
- **适合快速原型和轻量化场景**：不需要搭建云侧 Agent 服务

### ChatDemo 端侧模块说明

ChatDemo 示例展示了一个完整的端侧 Agent，其核心模块各司其职：

- **对话管理**：维护多轮对话历史，将用户输入与上下文组装为完整 Prompt
- **LLM 客户端**：通过 HTTP SSE 流式调用远端大模型 API，接收逐 token 返回的 A2UI JSONL
- **Prompt 组装**：根据所选 [Catalog](catalogs.md)（Basic 或 Extended），将组件 Schema 注入系统提示词，引导 LLM 生成符合规范的 DSL
- **流式解析**：从 LLM 响应流中提取 JSONL 行，解析并通过 [controller.handleMessage()](../reference/API/surface-controller.md#handlemessage) 逐条喂入 GenUI
- **会话编排**：协调对话管理、LLM 调用、解析渲染、用户交互的完整生命周期

---

## 如何选择

| 考量 | 模式 A (云侧 Agent) | 模式 B (端侧 Agent) |
|------|---------------------|---------------------|
| Agent 部署位置 | 云端 | 端侧（HarmonyOS App 内） |
| LLM 调用位置 | 云端（由 Agent 调用） | 云端（端侧直连 LLM API） |
| 适用场景 | 已有云 Agent 服务 | 独立功能 / 快速原型 |
| 业务数据位置 | 云端 Agent 管理 | 端侧管理 |
| 端侧复杂度 | 低（只上报 + 渲染） | 中（编排 + 解析 + 渲染） |
| 延迟 | 端 → 云 Agent → LLM → 云 Agent → 端 | 端 → LLM → 端 |
| ChatDemo 示例 | — | ✅ |

---

← 上一节：[Catalog](catalogs.md) | → 下一节：[表达式语言](expression-language.md) | ↑ [概念层总览](overview.md)
