# src — 评估工具源码

## 模块结构

- `config.ts` — 模型配置加载 + 可配置路径（TOOLKIT_ROOT/PROJECT_ROOT）
- `cli/` — 评估入口脚本（被 package.json scripts 引用）
- `core/` — 核心逻辑（校验、评分、一致性、类型）
- `llm/` — OpenAI兼容LLM客户端
- `prompt/` — Prompt构建 + Few-shot示例
- `report/` — 报告生成

## 修改须知

- 新增评估类型时：在 `cli/` 添加入口脚本，在 `config.ts` 添加加载函数
- 新增验证规则时：修改 `core/validator.ts` 的 `resolveRules()` 和校验逻辑
- 新增评分维度时：修改 `core/scorer.ts` 和 `core/types.ts` 的 `DimensionScores`
- 修改 Prompt 时：编辑 `prompt/prompt-builder.ts` 和 `../prompts/protocol-summary.md`

## 运行

从 `eval/` 目录执行：

- **活跃命令**：`npm run eval`（全量回归）/ `npm run eval:comparison`（对比实验）/ `npm run eval:full-protocol`（完整协议）
- **历史脚本**：`eval-chain.ts`、`eval-variable-system.ts` 等 26 个设计点评估脚本，作为新评估的参考模板
