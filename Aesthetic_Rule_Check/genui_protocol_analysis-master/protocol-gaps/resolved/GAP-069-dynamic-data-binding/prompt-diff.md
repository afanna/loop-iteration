# GAP-069 Prompt 修改（eval/prompts/）

## 修改: protocol-summary.md（config.ts 加载的主 prompt）
- 版本标记: 最后同步 2026-06-13 → 2026-07-08，追加 GAP-069
- 新增 "## 动态数据绑定" 段（位于"表达式系统"与"扩展函数"之间）：
  - 三种绑定机制表（表达式 / 路径绑定 / 函数绑定）
  - 适用规则（含基础数据类型→支持；纯对象/数组不支持）
  - 三种机制的 JSON 示例
  - 响应式 vs 一次性求值说明

## 修改: protocol-form-summary.md
- 新增 "## 动态数据绑定" 段（位于组件系统与事件之间），简述三种机制 + 响应式/一次性区分，指向 spec §3.8

## 修改: protocol-harmonyos-extended.md
- 新增 "## 动态数据绑定" 段（"表达式系统"之后），单行综述三种机制 + 响应式/一次性区分

## 修改: protocol-inline-summary.md
- 新增 "## 动态数据绑定" 段（"表达式系统"之后），单行综述

## 修改: protocol-harmonyos-inline.md
- 新增 "## 动态数据绑定" 段（"表达式"之后），单行综述

## Few-shot
- 本次未修改 eval/src/prompt/few-shot-examples.ts。主 prompt 已充分描述三种绑定机制；data-model-access 设计点（GAP-007）已验证 LLM 能正确处理路径绑定（A+ 91-92%），无需额外 few-shot 强化。如阶段4回归显示绑定类用例通过率偏低，再补充。
