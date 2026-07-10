# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

鸿蒙智能体协议模型亲和性设计与看护 — 构建并维护 LLM 对 UI 协议 DSL 的生成能力量化评估体系。

### 三层核心目标

1. **构建量化评估模型** — 建立可度量的模型亲和性评估框架（6 维评分 + S/A/B/C/D 分级），产出可复用的评估工具链
2. **单点设计对比评估** — 针对协议的某个设计点（可能存在多个候选方案），用量化评估确定模型最亲和的设计，指导协议设计决策
3. **整体协议验收评估** — 协议设计完成后，对完整协议进行端到端的模型亲和性整体量化评估，判断是否达到生产可用标准

简单说：先造尺子，再用尺子量单点设计选方案，最后用尺子量整体协议做验收。

## Repository Structure

```
arkui_genui/
├── eval/                          # 评估工具 + 设计点 + 测试用例 + 报告
│   ├── src/                       # 评估工具源码
│   │   ├── cli/                   # 评估入口脚本
│   │   ├── core/                  # 验证器、评分器、一致性检查、类型定义
│   │   ├── llm/                   # LLM 客户端
│   │   ├── prompt/                # Prompt 构建、Few-shot 示例
│   │   └── report/                # 报告生成器
│   ├── prompts/                   # 协议摘要模板
│   ├── design-points/             # 单点亲和性设计评估（每个设计点一个子目录）
│   │   └── <design-point>/
│   │       ├── conclusion.md      # 评估结论
│   │       ├── test-cases/        # 该设计点的测试用例
│   │       └── reports/           # 该设计点的评估报告
│   ├── test-cases/                # 完整协议的测试用例（按分类）
│   ├── reports/                   # 整体评估报告
│   └── package.json
│
├── specification/                 # 协议文档, A2UI protocol & HarmonyOS A2UI protocol
├── docs/                          # 设计文档、协议规范、亲和性分析
│   └── architecture/              # 架构设计文档
 ├── protocol-gaps/                 # 协议缺口追踪与闭环管理
 ├── scripts/                       # 工具脚本（changelog 生成等）
└── tests/                         # Legacy Python 评估脚本
```

## Tag Release & Changelog Workflow

所有版本 tag 从 `1.0.0` 分支打出，tag 格式遵循 SemVer：`MAJOR.MINOR.PATCH[-prerelease]`（如 `1.0.0`、`1.0.0-alpha.3`、`1.0.0-beta.1`）。

### 发布流程

```
1. master 上完成开发（若干 commit / MR）
2. cherry-pick 选定 commit 到 1.0.0 分支
3. 切到 1.0.0 分支
4. scripts/changelog.sh 1.1.0 --dry-run     # 预览
5. scripts/changelog.sh 1.1.0                # 写入 specification/CHANGELOG.md
6. 人工精简 specification/CHANGELOG.md
7. git add specification/CHANGELOG.md && git commit -m "changelog: 1.1.0"
8. git tag 1.1.0
9. git push origin 1.0.0 --tags
```

CHANGELOG.md 仅在 `1.0.0` 分支上维护，master 不维护。

### Commit Message 规范

格式：`type[(scope)]: description`

| type | 用途 | CHANGELOG 归类 |
|------|------|---------------|
| feat | 新功能/新协议能力 | Added |
| fix | 修复 | Fixed |
| spec | 协议规格完善 | Added/Changed |
| refactor | 重构 | Changed |
| breaking | 不兼容变更 | Breaking Changes |
| chore | 工具/流程 | 不录入 CHANGELOG |
| docs | 文档 | 不录入 CHANGELOG |

GAP 引用：含 `GAP-XXX` 的 commit 会自动提取引用标注在 CHANGELOG 条目后。

## Build & Run Commands

### 评估工具
```bash
cd eval
npm install              # 安装依赖

# 单点设计评估
npm run eval:chain       # 事件链评估
npm run eval:variable-system  # 变量体系评估

# 整体协议评估
npm run eval             # 完整协议评估
npm run eval:comparison  # 冲突解决对比实验
```

### 环境变量控制
```bash
ONLY_MODEL=deepseek npm run eval          # 仅运行特定模型
SKIP_MODELS=glm npm run eval             # 跳过特定模型
REPORTS_DIR=/path/to/reports npm run eval # 自定义报告输出目录
```

### Python Tests (Legacy)
```bash
pip install openai anthropic
python3 tests/model_affinity_tester.py
```

## Environment Configuration

Create `eval/.env` with API keys (see `.env.example`):
```
GLM_API_KEY=xxx
DEEPSEEK_API_KEY=xxx
```

Models are configured via env vars: `GLM_API_KEY`, `GLM_MODEL`, `GLM_BASE_URL`, `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`, `DEEPSEEK_BASE_URL`.

## Architecture

### Evaluation Pipeline

`cli/*.ts` → loads config → loads test cases → builds system prompt → runs tests per model → generates reports

- **`config.ts`** — Loads model configs from env, test cases from configurable paths, protocol summary from prompts/
   - `TOOLKIT_ROOT` — eval/ 目录
  - `PROJECT_ROOT` — 项目根目录
  - Supports `TEST_CASES_FILE`, `TEST_CASES_DIR`, `REPORTS_DIR` env vars
- **`core/types.ts`** — TypeScript interfaces (TestCase, VariableScopeTestCase, DimensionScores, etc.)
- **`core/validator.ts`** — Strategy-aware DSL validation with L1-L4 level breakdown
- **`core/scorer.ts`** — 6-dimension scoring: D1(20%), D2(25%), D3(15%), D4(15%), D5(15%), D6(10%)
- **`core/test-runner.ts`** — Executes test cases against LLMs, handles retries and I/O logging
- **`core/consistency-checker.ts`** — Cross-run consistency validation for D6
- **`core/json-extractor.ts`** — Extracts JSON from LLM responses
- **`prompt/prompt-builder.ts`** — Constructs system/user prompts with protocol context and strategy
- **`prompt/few-shot-examples.ts`** — Few-shot example selection by category with variable shot count
- **`llm/client.ts`** — OpenAI-compatible API client (used for GLM, DeepSeek, etc.)
- **`report/report-generator.ts`** — Outputs JSON + Markdown reports

### Test Case Format

Test cases are JSON files containing arrays of test case objects. Two formats:
1. **Basic** (affinity-evaluation): `id`, `name`, `task_description`, `category`, `complexity`, `expected_output`, `requirements`
2. **Strategy-aware** (affinity-design): adds `shared_rules`, `strategy_rules`, `scope_conflict_type`

### Scoring Grades

S (90-100) → A (80-89) → B (70-79) → C (60-69) → D (<60). Grade A or above means the protocol is model-affinity ready for production.

## Key Conventions

- The evaluation framework uses ES2022 modules (`"type": "module"` in package.json)
- TypeScript is executed directly via `tsx` (no separate compile step)
- All paths in source code use `resolve()` with computed `TOOLKIT_ROOT`/`PROJECT_ROOT` constants
- The LLM client is OpenAI-compatible and works with any provider that follows the OpenAI chat completions API format
- New design points are added as subdirectories under `eval/design-points/`, each with `conclusion.md`, `test-cases/`, and `reports/`

## Protocol Modification Rules

**修改 `specification/harmonyos-a2ui-protocol.md` 之前，必须先读 `protocol-gaps/AGENTS.md`，按五阶段流程执行。**

### Pre-modification Gate（前置检查，逐项确认）

修改 spec 前，必须确认以下全部完成，否则不能开始编辑 spec：

```
□ 阶段1: GAP 已登记在 GAPS.md，状态 pending
□ 阶段2: 亲和性验证通过 (A/B对比 或 轻量回归)，评估报告路径已写入 pending README
□ 检查点: 以上两项未完成 → 禁止修改 spec，回到验证阶段
```

### 修改流程（阶段3-5）

```
阶段3: 导出修改
  □ protocol-diff.md  — 记录 spec 修改（修改前/后 + 理由）
  □ prompt-diff.md   — 记录 prompt/few-shot 修改
  □ new-test-cases.json — 新增测试用例
  □ 更新 specification/modification-history.md（全量）或 modification-history-form.md（form）的修改记录表
  □ 同步更新 eval/prompts/protocol-summary.md（如 spec 改动涉及语法、组件、表达式、事件、样式等评估相关内容）
  □ git commit（禁止 amend），commit message 格式: "feat: GAP-XXX 合入 — 简述"

阶段4: 全量回归
  □ 运行 npm run eval（全量测试）
  □ 确认各分类通过率 ≥ 修改前，无退化

阶段5: 归档
  □ mv pending/GAP-XXX → resolved/GAP-XXX
  □ 更新 GAPS.md: 状态 → resolved+合入，填写解决日期和 commit hash
  □ 更新统计数字
  □ git commit + push
```

### 修改记录表格式

修改记录已从 spec 主文档头部迁移到独立文件：
- 全量协议 → `specification/modification-history.md`
- Form 协议 → `specification/modification-history-form.md`

spec 主文档头部仅保留存根（标题 + 链接），**不要在 spec 主文档编辑修改记录条目**。新记录插在独立文件 `## 修改记录` 表格最前面（倒序）。

**全量协议**（3 列）：

```
| YYYY-MM-DD | GAP-XXX：修改简述。commit `abc1234` | §X.Y, §Z.W |
```

**Form 协议**（2 列，无涉及章节列）：

```
| YYYY-MM-DD | GAP-XXX：修改简述。commit `abc1234` |
```

规则：
- 必须包含 GAP 编号，用于反向定位到 protocol-gaps/
- commit hash 填实际短哈希（禁止填"待提交"）
- 涉及章节用 § 前缀（仅全量协议有此列）
- 禁止 amend 协议修改的 commit（amend 改变 hash，导致记录过期）
