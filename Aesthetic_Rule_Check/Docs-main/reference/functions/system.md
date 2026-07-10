# 系统函数

系统函数用于执行设备级操作，如打开链接等。

> 以下示例均为 **DSL 消息片段**，是 LLM 生成的模型产物，而非开发者手写的代码。

## 函数列表

### openUrl

打开 URL。该函数会将 URL 请求转发到 ArkTS 层，由系统浏览器或应用内 WebView 处理。返回类型：void（无返回值）。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| url | string | 是 | 要打开的 URL。也支持 uri 作为参数名。 |

**FunctionCall 片段：**

```json
{
  "call": "openUrl",
  "args": { "url": "https://example.com" },
  "returnType": "void"
}
```

## DSL 示例

openUrl 通常作为 [ExtendedButton](../extended-components/button.md) 的 action 中的 functionCall 使用，在用户点击按钮时触发：

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "link_surface",
    "components": [
      {
        "id": "openLinkBtn",
        "component": "Button",
        "label": "访问官网",
        "action": {
          "functionCall": {
            "call": "openUrl",
            "args": { "url": "https://example.com" },
            "returnType": "void"
          }
        }
      }
    ]
  }
}
```

## 注意事项

- URL 不能为空。
- 函数通过 [FunctionBridge](functioncall.md) 将请求从 C++ 层转发到 ArkTS 层执行。

## 参考链接

- [函数概览](overview.md)
- [FunctionCall 类型说明](functioncall.md)

---

↑ [返回文档导航](../../README.md)
