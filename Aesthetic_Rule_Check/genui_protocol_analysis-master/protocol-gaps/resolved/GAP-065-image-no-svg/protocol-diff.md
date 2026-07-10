# GAP-065 协议修改

## 修改 1: Image 扩展组件属性表 — src 属性描述

- 位置: specification/harmonyos-a2ui-protocol.md 第 1766 行（§4.2.1.4 Image 属性表）
- 修改前:
  ```
  | Image | 展示组件 | 用于展示图片，支持本地、网络或资源图片。 | src | String | 是 | 是 | 图片数据源（本地或网络） |
  ```
- 修改后:
  ```
  | Image | 展示组件 | 用于展示图片，支持本地、网络或资源图片。不支持 SVG 格式。 | src | String | 是 | 是 | 图片数据源（本地或网络）。不支持 SVG 格式，包括 base64 编码的 SVG（如 data:image/svg+xml;base64,...）。 |
  ```
- 理由: Image 组件的渲染层不支持 SVG 解析。此前 `src` 描述未显式排除 SVG，LLM 可能生成 base64 SVG data URI 导致渲染失败。与 `objectFit` matrix 模式已有的"不支持svg图源"声明保持一致。

## 修改 2: JSON Schema — Image.src description

- 位置: specification/json/extended_catalog.json 第 3966 行（Image component src 属性）
- 修改前:
  ```json
  "description": "Image source URL or local resource path."
  ```
- 修改后:
  ```json
  "description": "Image source URL or local resource path. SVG format is not supported, including base64-encoded SVG (e.g., data:image/svg+xml;base64,...)."
  ```
- 理由: Schema 描述与协议文档同步，确保工具链校验和文档一致。
