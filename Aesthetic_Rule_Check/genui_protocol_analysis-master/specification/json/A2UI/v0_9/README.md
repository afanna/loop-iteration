请参考官方仓库： https://github.com/google/A2UI/tree/v0.9/specification/v0_9

关键文件说明（基于 v0.9 tag）：
├── docs/                            // 规范文档
│    ├── a2ui_custom_functions.md    // 自定义函数说明
│    ├── a2ui_extension_specification.md // 扩展规范说明
│    ├── a2ui_protocol.md            // A2UI 通信协议文档
│    ├── basic_catalog_implementation_guide.md // 基础目录实现指南
│    ├── evolution_guide.md          // 版本演进指南
│    └── renderer_guide.md           // 渲染器实现指南
├── eval/                            // 评估工具
│    └── ...                         // 模型亲和性评估框架
├── json/                            // JSON Schema 定义
│    ├── basic_catalog.json          // 基础组件目录（catalogId: https://a2ui.org/specification/v0_9/basic_catalog.json）
│    ├── basic_catalog_rules.txt     // 基础目录规则说明
│    ├── catalogs/                   // 组件目录定义（含子目录版本）
│    │    ├── basic/                 // 基础目录（含 examples/）
│    │    └── minimal/              // 最小化目录
│    ├── client_capabilities.json    // 客户端能力声明 schema
│    ├── client_data_model.json      // 客户端数据模型 schema
│    ├── client_to_server_list_wrapper.json // 客户端到服务器列表包装 schema
│    ├── client_to_server_list.json  // 客户端到服务器列表 schema
│    ├── client_to_server.json       // 客户端到服务器单条消息 schema
│    ├── common_types.json           // 公共类型定义 schema
│    ├── sample.json                 // 示例数据文件
│    ├── server_capabilities.json    // 服务端能力声明 schema
│    ├── server_to_client_list_wrapper.json // 服务器到客户端列表包装 schema
│    ├── server_to_client_list.json  // 服务器到客户端列表 schema
│    └── server_to_client.json       // 服务器到客户端单条消息 schema
└── test/                            // 测试用例
     └── cases/                      // 测试用例文件

