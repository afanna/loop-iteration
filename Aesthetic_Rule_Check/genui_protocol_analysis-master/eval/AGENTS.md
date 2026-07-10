# eval

共享评估工具框架，包含设计点评估和整体协议评估。

## 目录结构

- `src/cli/` — 评估入口脚本（index.ts 全量评估, comparison.ts 对比实验, eval-chain.ts 等）
- `src/core/` — 核心模块（validator 校验器, scorer 6维评分, consistency-checker 一致性检查, types 类型定义）
- `src/llm/` — OpenAI 兼容 LLM 客户端
- `src/prompt/` — Prompt 构建（prompt-builder 策略感知, few-shot-examples 可变shot数）
- `src/report/` — 报告生成器
- `src/config.ts` — 模型配置 + 可配置路径加载
- `prompts/` — 协议摘要模板（protocol-summary.md）
- `design-points/` — 单点亲和性设计评估（每个设计点一个子目录，[总览表](design-points/README.md)）
- `test-cases/` — 完整协议的测试用例（按分类）
- `reports/` — 整体评估报告（运行时生成，不纳入版本控制）

## 运行命令

### 活跃命令（持续使用）

```bash
npm install
npm run eval             # 全量回归评估 → eval/reports/
npm run eval:comparison  # 冲突对比实验 → eval/reports/
npm run eval:full-protocol  # 完整协议评估 → eval/reports/
```

### 历史设计点脚本（参考模板）

以下命令对应已完成的设计点评估，test-cases 和脚本均保留作为参考：

```bash
npm run eval:chain       # 事件链评估
npm run eval:variable-system  # 变量体系评估
# ...其他 eval:* 命令见 package.json
```

注意：部分脚本引用 `eval/prompts/protocol-summary.md` 作为外部 prompt，该文件可能已随 spec 更新，重跑结果可能与历史报告不同。15 个脚本使用内联 prompt，重跑可复现原始结果。

## 环境变量

- API 配置: `GLM_API_KEY`, `GLM_MODEL`, `GLM_BASE_URL`, `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`, `DEEPSEEK_BASE_URL`
- 路径覆盖: `TEST_CASES_FILE`, `TEST_CASES_DIR`, `REPORTS_DIR`
- 模型控制: `ONLY_MODEL`, `SKIP_MODELS`

## 关键设计

- 路径通过 `TOOLKIT_ROOT`（eval/）和 `PROJECT_ROOT`（项目根）计算，不硬编码
- 测试用例和报告的默认路径指向 `eval/design-points/` 和 `eval/test-cases/` 下的对应目录
- ES2022 模块，`tsx` 直接执行，无需编译
