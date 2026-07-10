# GAP-066 协议修改

## 修改 1: Select 扩展组件属性表 — symbolIcon.src 类型约束

- 位置: specification/harmonyos-a2ui-protocol.md 第 2003 行（§4.2.1.5 Select 属性表，options.symbolIcon.src）
- 修改前:
  ```
  - src: string，图标
  ```
- 修改后:
  ```
  - src: 字符串枚举，支持的图标名称与原生 Icon 组件一致："accountCircle", "add", "arrowBack", ...（共 56 个，与原生 Icon 组件 name 字段完全相同）
  ```
- 理由: symbolIcon.src 此前为自由 string，无枚举约束。LLM 可能生成任意图标名称导致渲染失败。复用原生 Icon 组件的 56 个图标名枚举，保证一致性并降低模型认知负担。

## 修改 2: JSON Schema — symbolIcon.src 增加 enum 硬约束

- 位置: specification/json/extended_catalog.json 第 3109 行（Select.options[].symbolIcon.src）
- 修改前:
  ```json
  "src": {
    "type": "string"
  }
  ```
- 修改后:
  ```json
  "src": {
    "type": "string",
    "enum": ["accountCircle", "add", "arrowBack", "arrowForward", "attachFile", "calendarToday", "call", "camera", "check", "close", "delete", "download", "edit", "event", "error", "fastForward", "favorite", "favoriteOff", "folder", "help", "home", "info", "locationOn", "lock", "lockOpen", "mail", "menu", "moreVert", "moreHoriz", "notificationsOff", "notifications", "pause", "payment", "person", "phone", "photo", "play", "print", "refresh", "rewind", "search", "send", "settings", "share", "shoppingCart", "skipNext", "skipPrevious", "star", "starHalf", "starOff", "stop", "upload", "visibility", "visibilityOff", "volumeDown", "volumeMute", "volumeOff", "volumeUp", "warning"]
  }
  ```
- 理由: Schema 层面增加 enum 校验，工具链自动拒绝枚举外的值。
