# GAP-004 协议修改

## 修改 1: §3.1 扩展原则 — 命名规则变更

- **位置**: `specification/harmonyos-a2ui-protocol.md` 第 458 行
- **修改前**:
  ```
  3. 所有的扩展组件均以Extended.为前缀命名，如Extended.Button。
  ```
- **修改后**:
  ```
  3. 扩展组件与原生组件采用统一命名（如 `Button`、`Text`），通过 `catalogId` 字段区分组件来源。`catalogId: "harmonyos"` 标识鸿蒙扩展组件，无 `catalogId` 或 `catalogId: "a2ui"` 表示 A2UI 原生组件。
  ```
- **理由**: unified-name 模型亲和性最优（A+ 99.6%），消除前缀 token 成本，提升一致性和组件识别准确率

## 修改 2: §3.2 扩展组件 — 描述和示例更新

- **位置**: `specification/harmonyos-a2ui-protocol.md` 第 462-476 行
- **修改前**: 文本描述 "所有扩展组件均以Extended.<Component Name>方式进行命名"，示例 `"component": "Extended.Button"`
- **修改后**: 文本描述 "扩展组件与原生组件采用统一命名"，示例增加 `"catalogId": "harmonyos"`，组件名改为 `"Button"`
- **理由**: 反映新的统一命名规则，展示 catalogId 用法

## 修改 3: 全文组件名 — Extended. 前缀移除

- **范围**: `specification/harmonyos-a2ui-protocol.md` 全文
- **变更**: 所有 `Extended.XXX` 组件名移除 `Extended.` 前缀（~100 处）
- **涉及**: 22 个组件类型（Text, Button, TextInput, Row, Column, List, Stack, Grid, GridRow, Image, Divider, Toggle, Progress, Radio, Checkbox, CheckboxGroup, If, Tabs, TabContent, Select, Web, Navigation）
- **理由**: 统一命名提升 LLM 生成准确率和一致性

## 修改 4: §4.1.2 扩展组件表 — 公共属性说明

- **位置**: `specification/harmonyos-a2ui-protocol.md` 第 842 行
- **修改前**:
  ```
  以下组件如无特殊说明除了协议中定义的id和component字段外，均还包含styles和listeners两个公共属性
  ```
- **修改后**:
  ```
  以下组件如无特殊说明除了协议中定义的id、component和catalogId字段外，均还包含styles和listeners两个公共属性。扩展组件以 `catalogId: "harmonyos"` 标识，原生组件无此字段或为 `"a2ui"`。
  ```
- **理由**: 文档化 catalogId 字段的使用方式

## 修改 5: JSON Schema — ExtendedComponentCommon.catalogId

- **位置**: `specification/harmonyos-a2ui-protocol.md` JSON Schema `$defs.ExtendedComponentCommon`
- **修改前**: component description "must start with ''" (已过期)
- **修改后**: 新增 `catalogId` 属性定义，component description 改为 "Component type name (e.g. Text, Button)"
- **理由**: Schema 反映新的命名和 catalogId 机制

## 修改 6: JSON Schema — 所有组件 const 值

- **范围**: `specification/harmonyos-a2ui-protocol.md` JSON Schema 部分（24 个组件定义）
- **变更**: 所有 `"const": "Extended.XXX"` → `"const": "XXX"`
- **涉及**: Text, Button, TextInput, Row, Column, List, Stack, Grid, GridRow, Image, Divider, Toggle, Progress, Radio, Checkbox, CheckboxGroup, If, Tabs, TabContent, Select, Web, Navigation
- **理由**: 与命名规则变更一致

## 修改 7: JSON Schema — events.supportedComponents

- **范围**: `specification/harmonyos-a2ui-protocol.md` JSON Schema events 部分
- **变更**: 所有 supportedComponents 数组中 `"Extended.XXX"` → `"XXX"`
- **理由**: 事件支持的组件名同步更新
