# 快速上手

两段式教程：先用静态 DSL 感受渲染流程（~5 分钟），再通过 ChatDemo 体验 LLM 动态生成 UI。

---

## 第一段：静态 DSL 快速体验

### 你将构建什么

一张包含标题、文本和按钮的卡片。

### 静态 DSL 前置条件

- DevEco Studio 6.0.0(20)

### Step 1：创建工程

1. 打开 DevEco Studio → File → New → Create Project
2. 选择 **Empty Ability** 模板
3. Module 类型选择 **ArkTS**
4. 填入 Project Name（如 GenUISample），完成创建

### Step 2：安装 GenUI

在根目录 oh-package.json5 的 dependencies 中添加 GenUI：

```json5
{
  "dependencies": {
    "@arkui-genius/genui": "latest"
  }
}
```

然后在终端执行：

```bash
ohpm install
```

### Step 3：编写页面代码

打开 entry/src/main/ets/pages/Index.ets，替换为以下代码：

```ts
import {
  CatalogFactory,
  SurfaceController,
  SurfaceControllerFactory,
  SurfaceEventType,
  UIRendererComponent
} from '@arkui-genius/genui'

@Entry
@Component
struct Index {
  @State controller: SurfaceController | null = null

  aboutToAppear(): void {
    this.controller = SurfaceControllerFactory.createSurfaceController({
      uiContext: this.getUIContext(),
      catalog: CatalogFactory.basic(),
      eventCallback: (eventType: SurfaceEventType, ctrl: SurfaceController) => {
        console.log(`Event: ${eventType}`)
      }
    })

    this.controller.registerActionReceiver((action: string) => {
      console.log(`Action received: ${action}`)
    })
  }

  aboutToDisappear(): void {
    this.controller?.destroy()
  }

  build() {
    Column() {
      UIRendererComponent({ surfaceController: this.controller })
    }
    .width('100%')
    .height('100%')
  }
}
```

此时运行项目，你会看到一个空白页面——Controller 已创建就绪，等待接收 DSL 数据。

### Step 4：创建示例数据并投喂

**4.1 创建数据文件**

在 entry/src/main/resources/rawfile/ 目录下创建 sample.jsonl，内容如下：

```json
[
  {
    "version": "v0.9",
    "createSurface": {
      "surfaceId": "hello",
      "catalogId": "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"
    }
  },
  {
    "version": "v0.9",
    "updateComponents": {
      "surfaceId": "hello",
      "components": [
        { "id": "root", "component": "Card", "child": "content_col" },
        { "id": "content_col", "component": "Column", "children": ["title", "desc", "btn"] },
        { "id": "title", "component": "Text", "text": "Hello GenUI" },
        { "id": "desc", "component": "Text", "text": "你的第一个 AI 驱动的界面" },
        { "id": "btn", "component": "Button", "child": "btn_text", "action": { "event": { "name": "sayHello" } } },
        { "id": "btn_text", "component": "Text", "text": "点击试试" }
      ]
    }
  }
]
```

> 如果 rawfile 目录不存在，手动创建即可。

**4.2 补充读取和投喂代码**

在 Index.ets 中添加 import 并在 aboutToAppear 中补充 DSL 读取逻辑。完整代码如下：

```ts
import {
  CatalogFactory,
  SurfaceController,
  SurfaceControllerFactory,
  SurfaceEventType,
  UIRendererComponent
} from '@arkui-genius/genui'
import { resourceManager } from '@kit.LocalizationKit'
import { util } from '@kit.ArkTS'

@Entry
@Component
struct Index {
  @State controller: SurfaceController | null = null

  aboutToAppear(): void {
    // ① 创建 SurfaceController（basic = A2UI 标准协议，18 个标准组件）
    this.controller = SurfaceControllerFactory.createSurfaceController({
      uiContext: this.getUIContext(),
      catalog: CatalogFactory.basic(),
      eventCallback: (eventType: SurfaceEventType, ctrl: SurfaceController) => {
        console.log(`Event: ${eventType}`)
      }
    })

    // ② 注册 Action 接收器
    this.controller.registerActionReceiver((action: string) => {
      console.log(`Action received: ${action}`)
    })

    // ③ 读取 rawfile 中的 DSL，逐条投喂给 Controller
    const ctx = getContext(this)
    const resMgr = ctx.resourceManager
    try {
      const fileData = resMgr.getRawFileContentSync('sample.jsonl')
      const textDecoder = util.TextDecoder.create('utf-8')
      const jsonStr = textDecoder.decodeToString(new Uint8Array(fileData.buffer))
      const messages: object[] = JSON.parse(jsonStr)
      for (const msg of messages) {
        this.controller!.handleMessage(JSON.stringify(msg))
      }
    } catch (e) {
      console.error(`Failed to read sample.jsonl: ${e}`)
    }
  }

  aboutToDisappear(): void {
    this.controller?.destroy()
  }

  build() {
    Column() {
      UIRendererComponent({ surfaceController: this.controller })
    }
    .width('100%')
    .height('100%')
  }
}
```

### Step 5：运行

在 DevEco Studio 中运行项目。你将看到一张带标题、文本和按钮的卡片。点击按钮可在 DevEco Studio 日志中看到 Action received 输出。

### 流程解析

```
JSON DSL 字符串
    → controller.handleMessage()
    → GenUI 解析 JSON、构建组件树
    → UIRendererComponent 渲染为原生 ArkUI 组件
    → 屏幕上看到卡片
```

---

以上是静态 JSON 的示例，展示了 GenUI 的核心渲染流程。下一段将接入 LLM，实现 UI 的动态生成。

---

## 第二段：接入 LLM，一句话生成 UI

### 你将体验什么

输入一段自然语言描述（如"帮我查询一下未来一周北京的天气"），LLM 动态生成 A2UI JSON，GenUI 实时渲染为原生天气卡片。所有 UI 都由 AI 动态生成，无需手写一行 JSON。

### LLM 接入前置条件

- 已完成第一段（GenUI 已安装）
- LLM API Key（DeepSeek 或 GLM 二选一）

### Step 1：克隆 ChatDemo

ChatDemo 是一个完整的端到端示例，展示了端侧 Agent 编排 + 云 LLM 推理的部署模式：

```bash
git clone <ChatDemo 仓库地址>
```

### Step 2：配置 API Key

复制 entry/src/main/ets/llm/myAPIKeys.example.ts 为 myAPIKeys.ts，填入你的 API Key：

```ts
export const API_KEYS = {
  deepseek: 'sk-your-deepseek-key',
  glm: 'your-glm-key'
}
```

### Step 3：运行

在 DevEco Studio 中打开 ChatDemo 项目并运行。

### Step 4：选择 Provider

在设置页选择 LLM Provider（DeepSeek 或 GLM），选择 Extended Catalog 模式。

### Step 5：输入一句话

在聊天框中输入：

> 帮我查询一下未来一周北京的天气，晴天和雨天分别用不同的图标表示

### Step 6：观察发生了什么

1. 你的输入发送给端侧 Agent
2. Agent 将历史对话、能力信息、用户输入组装为 Prompt
3. 调用云 LLM API（HTTP SSE 流式传输）
4. LLM 逐 token 返回 A2UI JSON
5. GenUI 边接收边解析，BFS 逐组件渲染
6. 屏幕上逐渐出现天气卡片——温度、天气图标、日期列表

### 后台完整数据流

```
用户输入
  → ChatAgent（管理对话历史）
    → LLM API（SSE 流式）
      → A2UI JSONL 流
        → A2UIParser（解析流式响应）
          → controller.handleMessage()
            → GenUI 构建组件树
              → 原生 ArkUI 渲染
                → 用户看到天气卡片
                  → 用户点击按钮
                    → Action 回调
                      → 组装新 Prompt
                        → 回到 LLM ...
```

---

## 下一步

| 目标 | 路径 |
|------|------|
| 理解背后的协议 | [架构概览](architecture.md) → [Surface 与消息](../concepts/surfaces-and-messages.md) |
| 正式集成到项目 | [快速集成指南](../guides/quick-integration.md) |
| 用组件构建 UI | [构建 UI（标准组件）](../guides/building-ui-standard.md) |
| 接入 LLM | [LLM 集成指南](../guides/integrating-llm.md) |
| 了解两种 Agent 部署模式 | [Agent 部署模式](../concepts/agent-deployment-models.md) |
