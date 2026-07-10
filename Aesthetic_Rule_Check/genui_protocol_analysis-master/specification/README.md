# specification/ — 协议规范文档目录

本目录存放鸿蒙 A2UI 协议的完整规范文档，包括协议设计、JSON Schema、文法定义和版本映射。

## 文件说明

| 文件/目录 | 说明 |
|:-|:-|
| [`harmonyos-a2ui-protocol.md`](harmonyos-a2ui-protocol.md) | 鸿蒙 A2UI 扩展协议主文档（全量）。涵盖协议概述、架构设计（原生层 + 扩展层）、消息机制、组件体系、表达式系统、变量系统、交互协议的完整定义 |
| [`harmonyos-a2ui-form-protocol.md`](harmonyos-a2ui-form-protocol.md) | 鸿蒙 A2UI Form（服务卡片）裁剪协议。在全量扩展协议基础上裁剪，仅保留 Form 环境可用的组件和能力。 |
| [`modification-history.md`](modification-history.md) | 鸿蒙扩展协议（全量）的修改记录。每个 GAP/commit 一行，倒序排列 |
| [`modification-history-form.md`](modification-history-form.md) | Form 卡片协议的修改记录 |
| [`protocol-mapping.md`](protocol-mapping.md) | A2UI 原生协议版本与鸿蒙扩展协议/Form 协议版本的映射关系表 |
| [`json/extended_catalog.json`](json/extended_catalog.json) | 鸿蒙扩展协议（全量）的组件目录 JSON Schema |
| [`json/form_catalog.json`](json/form_catalog.json) | 鸿蒙 Form 协议的组件目录 JSON Schema。自包含，不含外部引用。 |
| [`json/expression_grammar.ebnf`](json/expression_grammar.ebnf) | 扩展协议表达式模块的 EBNF 文法定义。定义字面量、变量引用、运算符、函数调用等语法规则 |
| [`json/A2UI/v0_9/`](json/A2UI/v0_9/) | A2UI 原生协议 v0.9 参考文件索引。链接到 [A2UI 官方仓库 v0.9 tag](https://github.com/google/A2UI/tree/v0.9/specification/v0_9) 的规范文档和 JSON Schema |
| [`CHANGELOG.md`](CHANGELOG.md) | 协议版本变更日志。记录每个 tag 版本的协议变更，面向协议使用者。仅在 `1.0.0` 分支上维护，由 `scripts/changelog.sh` 生成 |
| [`images/`](images/) | 协议文档引用的图片资源（架构图等） |

## 协议层次

```
A2UI 原生协议 v0.9
  └── 鸿蒙 A2UI 扩展协议（全量）
        └── Form 卡片协议（裁剪）
```

| 协议 | 版本 | 文档 | catalogId | 组件数 | 说明 |
|:-|:-|:-|:-|:-:|:-|
| 鸿蒙 A2UI 扩展协议（全量） | `1.0.0` | `harmonyos-a2ui-protocol.md` | `ohos.a2ui.extended.catalog` | 21 | 面向普通应用开发，包含全套扩展能力 |
| Form 卡片协议（裁剪） | `1.0.0` | `harmonyos-a2ui-form-protocol.md` | `ohos.a2ui.extended.catalog.form` | 10 | 全量协议的严格子集；面向服务卡片场景，仅支持扩展组件 |

Form 协议是全量扩展协议的严格子集，基于 Form 协议生成的 DSL 可在支持全量协议的 Render 中正确渲染。

## 两层架构

本协议采用 **A2UI 原生层** + **鸿蒙扩展层** 的两层架构：

- **原生层**：消息格式、核心组件（18 种）、DataModel 读写机制
- **扩展层**：通过 catalog 机制增量叠加扩展组件、样式系统、表达式绑定、事件监听、多端自适应

扩展层完整继承原生层的消息机制，不引入新的消息类型。
