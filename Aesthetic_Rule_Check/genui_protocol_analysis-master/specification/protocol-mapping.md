# A2UI 协议版本映射

本文件定义鸿蒙 A2UI 扩展协议与 A2UI 原生协议之间的版本对应关系。

## 版本映射表

| 鸿蒙扩展协议版本 | A2UI 原生协议版本 | catalogIds | 状态 | 备注 |
|:-:|:-:|:-:|:-:|:-:|
| 1.0.0 | v0.9 | `ohos.a2ui.extended.catalog`<br>`https://a2ui.org/specification/v0_9/basic_catalog.json` | under development | 首个正式版本；扩展组件、样式系统、表达式、事件监听、多端自适应 |
| Form 1.0.0 | v0.9 | `ohos.a2ui.extended.catalog.form` | under development | 全量协议的严格子集。Form DSL 可在支持全量协议的 Render 中正向渲染 |

## 版本号规则

- **A2UI 原生协议**：`v{major}.{minor}`（如 v0.9、v1.0）
- **鸿蒙扩展协议**：`{major}.{minor}.{patch}[-PRERELEASE]`，遵循 [语义化版本 2.0.0](https://semver.org/)（如 1.0.0、1.1.0-alpha.1）

## 演进规则

1. 原生协议版本升级时，本协议评估兼容性影响并决定是否同步升级
2. 扩展协议可独立于原生协议发布 MINOR 或 PATCH 版本
3. 每个扩展协议版本声明所依赖的 A2UI 原生协议最低版本

> 详细版本规则见 [`鸿蒙A2UI协议设计.md`](鸿蒙A2UI协议设计.md) §1.4 协议版本。
