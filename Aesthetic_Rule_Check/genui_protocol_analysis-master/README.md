# 鸿蒙A2UI协议 — 模型亲和性设计与看护

构建并维护 LLM 对 UI 协议 DSL 的生成能力量化评估体系。

## 做什么

核心问题：**UI 协议怎么设计，LLM 才能正确生成？**

如果协议用数组包事件（handlerGroups），LLM 会不会搞错？用 `{{ }}` 还是 `{"expr":}` 包表达式？变量用 `$var` 还是 `${var}`？每个设计决策都影响 LLM 的生成正确率。

本项目提供一套可量化的评估方法论：

1. **6 维评分框架**（D1 语法/D2 语义/D3 效率/D4 学习曲线/D5 边界/D6 一致性）→ 综合 MA 分 + S/A/B/C/D 等级
2. **单点设计 A/B 对比** — 候选方案对拍，选出模型最亲和的
3. **全量回归验收** — 修改协议后跑全量测试，确认没有退化

简单说：**先造尺子，再用尺子量设计，最后用尺子做验收。**

## 怎么做的

### 评估流水线

```
测试用例(JSON) → CLI脚本 → 加载模型配置 → 构建System Prompt → 调用LLM →
4级校验(L1~L4) → 6维评分(D1~D6) → 报告(JSON+MD)
```

### 6 维评分（MA）

| 维度 | 权重 | 测什么 |
|------|:--:|------|
| D1 语法准确率 | 20% | JSON 能不能解析，结构对不对 |
| D2 语义准确率 | 25% | 表达式、变量、事件逻辑是否正确 |
| D3 生成效率 | 15% | 是否一次生成成功，平均 token 消耗 |
| D4 学习曲线 | 15% | 0-shot / 1-shot / 3-shot 准确率变化 |
| D5 边界鲁棒性 | 15% | 复杂/边缘用例的通过率 |
| D6 一致稳定性 | 10% | 同一用例多次生成结果是否一致 |

### 等级

S(90-100) → A(80-89) → B(70-79) → C(60-69) → D(<60)。**A 级及以上 = 协议设计对模型足够亲和。**

### 协议修改必须走 5 阶段

任何对 `specification/` 的修改都通过 GAP 流程（`protocol-gaps/`）管理：

1. **登记** — GAPS.md 记录 GAP-XXX，状态 pending
2. **验证** — 亲和性评估通过（A/B 对比或轻量回归）
3. **导出** — protocol-diff / prompt-diff / 测试用例
4. **回归** — `npm run eval` 全量测试无退化
5. **归档** — pending → resolved

## 怎么用

本项目通过 **AI 编码助手**（Claude Code、GitHub Copilot、Cursor 等）交互操作。使用者用自然语言描述意图，AI 助手按 AGENTS.md 中的规则执行。无需直接执行命令。

### 创建新的协议设计点

对 AI 助手说：

> "协议中 `<某设计问题>` 有多种候选方案，评估哪种对 LLM 最亲和。"

Agent 会：
1. 在 `eval/design-points/` 下创建子目录（README + 测试用例 + 报告目录）
2. 在 `eval/src/cli/` 创建评估脚本
3. 注册到 `config.ts` 和 `package.json`
4. 运行 A/B 对比评估，输出 6 维评分和结论

### 登记并推进一个 GAP

对 AI 助手说：

> "协议中 `<某问题>` 需要修改，登记一个 GAP。"

Agent 会按 5 阶段流程推进：
1. **登记** — 在 `GAPS.md` 中注册 GAP-XXX，创建 `pending/` 下的描述文件
2. **验证** — 运行亲和性评估（A/B 对比或轻量回归）
3. **导出** — 创建 `protocol-diff.md` + `prompt-diff.md`，修改 spec，提交
4. **回归** — 运行 `npm run eval` 确认无退化
5. **归档** — 移入 `resolved/`，更新 GAPS.md

### 修改协议规范

对 AI 助手说：

> "§X.Y 的 `<某描述>` 需要修改为 `<新描述>`。"

Agent 会先检查前置条件（GAP 是否已登记、验证是否通过），再编辑 spec 并提交。

### 运行评估

对 AI 助手说：

> "运行全量回归" / "评估 template-interpolation 设计点"

Agent 会执行 `npm run eval` 或对应的 npm script，将结果写入报告目录。

### 管理全量测试用例

全量测试用例在 `eval/test-cases/` 下，按分类存放：

| 文件 | 分类 | 用例数 |
|------|------|:--:|
| `expressions.json` | 表达式 | 7 |
| `events.json` | 事件 | 8 |
| `layout.json` | 布局 | 6 |
| `components.json` | 组件 | 5 |
| `mixed.json` | 综合 | 5 |
| `conflict-resolution.json` | 冲突解决 | 5 |
| **合计** | | **36** |

#### 测试用例格式

每个用例是一个 JSON 对象：

```json
{
  "id": "E001",
  "name": "简单变量引用",
  "category": "expression",
  "complexity": "simple",
  "task": "生成一个Text组件，内容引用$user.name变量",
  "expected": {
    "component": "Text",
    "required_fields": ["component", "content"],
    "patterns": [
      {"field": "content", "must_contain": "{{"}
    ]
  },
  "validation_rules": [
    {"type": "contains", "field": "content", "value": "$user.name"}
  ],
  "hints": ["变量用$前缀", "动态值用{{ }}包裹"]
}
```

| 字段 | 说明 |
|------|------|
| `id` | 唯一标识 |
| `task` | 发给 LLM 的自然语言任务描述 |
| `expected` | 期望结构（组件类型、必填字段、模式匹配） |
| `validation_rules` | 校验规则：`contains`, `matches_regex`, `has_field` 等 |
| `hints` | 协议提示，注入到 prompt 中 |
| `complexity` | `simple` / `medium` / `complex`（影响 D5 边界评分） |

#### 增加测试用例

对 AI 助手说：

> "在 `<分类>` 中新增测试用例：`<LLM要生成的UI描述>`"

Agent 会编辑对应的 JSON 文件，添加符合格式的用例。

#### 查看模型返回结果

对 AI 助手说：

> "查看上一次全量评估报告"

报告在 `eval/reports/` 下，JSON 包含每个用例的原始 LLM 输出，Markdown 包含汇总表、分类别通过率和失败用例详情。

### 首次环境准备

```bash
cd eval
npm install
cp .env.example .env   # 填入 GLM_API_KEY / DEEPSEEK_API_KEY
```

## 追溯历史修改

协议规范的每一次修改都留下了完整的追溯链。从一条修改记录出发，可以找到对应的 GAP、设计点评估、以及具体改动内容。

### 追溯链路

```
modification-history.md ──→ GAP 编号 ──→ GAP 总账 ──→ 设计点评估
     │                 │              │
     │                 │              └── eval/design-points/<设计点>/
     │                 │                    ├── README.md     （设计问题、候选方案、结论）
     │                 │                    ├── test-cases/   （评估用例）
     │                 │                    └── reports/      （6维评分报告）
     │                 │
     │                 └── protocol-gaps/resolved/GAP-XXX-<name>/
     │                       ├── README.md       （GAP 描述与解决过程）
     │                       ├── protocol-diff.md（spec 修改前/后对比）
     │                       └── prompt-diff.md  （prompt/few-shot 修改）
     │
     └── git show <commit> ──→ 具体代码改动
```

### 从修改记录出发（正向追溯）

**第1步 — 看修改记录**

打开 `specification/modification-history.md`，`## 修改记录` 表按倒序记录了每一次修改。每条记录包含：

| 字段 | 示例 | 说明 |
|------|------|------|
| 日期 | `2026-05-04` | 修改日期 |
| 描述 | `GAP-047：删除 format() 内置函数` | GAP编号 + 一句话概述 |
| commit | `337a6e2` | git commit 短哈希 |
| 涉及章节 | `§4.4.5, §4.4.8 EBNF` | 受影响的 spec 章节 |

**第2步 — 看具体改了什么**

```bash
git show <commit_hash>        # 查看代码diff
git log <commit_hash> -1      # 查看完整 commit message
```

**第3步 — 看 GAP 详情**

根据记录中的 GAP 编号，打开 `protocol-gaps/GAPS.md` 找到对应行：

| 列 | 说明 |
|----|------|
| ID | GAP 编号 |
| 缺口 | 问题简述 |
| 优先级 | P0（严重）/ P1（重要）/ P2（建议） |
| 状态 | resolved / pending / blocked |
| 关联设计点 | 链向 `eval/design-points/` 下的评估 |
| 关联测试 | 全量测试分类 |
| 解决日期 | 合入日期 |

然后进入 `protocol-gaps/resolved/GAP-XXX-<name>/` 目录：
- `README.md` — 完整的 GAP 描述、验证过程、解决结论
- `protocol-diff.md` — spec 修改前/后逐段对比，附修改理由
- `prompt-diff.md` — prompt 模板和 few-shot 示例的修改

**第4步 — 看设计点评估**

GAP 总账中的"关联设计点"列指向 `eval/design-points/<design-point>/`，例如 GAP-003 关联 `eval/design-points/event-chain/`：

- `README.md` — 设计问题背景，候选方案（A/B），评估结论（哪个方案 MA 得分更高）
- `test-cases/` — 用于 A/B 对比的测试用例
- `reports/` — 双模型 6 维评分报告（JSON + Markdown）

### 从设计点出发（反向追溯）

想知道某个设计决策最终如何落地到 spec？

```
eval/design-points/<设计点>/README.md  →  查看结论（推荐了哪个方案）
     │
     └── protocol-gaps/GAPS.md  →  搜索该设计点名称，找到对应的 GAP
              │
              ├── protocol-gaps/resolved/GAP-XXX-<name>/protocol-diff.md  →  看 spec 怎么改的
              │
              └── specification/modification-history.md  →  修改记录表中的 commit → git show
```

### 示例：追溯"handlerGroups 改为 flat-array"

```
1. modification-history.md: "2026-04-29 | GAP-003：事件行为从三层嵌套改为扁平数组，commit 95dc512"
2. git show 95dc512          → 看实际代码改动
3. GAPS.md 搜索 "GAP-003"    → 关联设计点: eval/design-points/event-chain
4. resolved/GAP-003-*/       → protocol-diff.md 有改前/改后对照
5. eval/design-points/event-chain/README.md → 评估结论: flat-array MA 分更高
```

### 快速入口

| 想看什么 | 去哪里 |
|----------|--------|
| 协议有哪些修改 | `specification/modification-history.md` |
| 某次改动的代码 | `git show <commit>` |
| 某个 GAP 的来龙去脉 | `protocol-gaps/GAPS.md` → `resolved/GAP-XXX/README.md` |
| 设计方案的评估数据 | `eval/design-points/<设计点>/README.md` + `reports/` |
| spec 改前/改后对照 | `protocol-gaps/resolved/GAP-XXX/protocol-diff.md` |
| 全量回归通过率 | `eval/reports/` |

## 目录结构

```
├── specification/                # 协议规范
│   ├── harmonyos-a2ui-protocol.md  # 全量扩展协议文档
│   ├── harmonyos-a2ui-form-protocol.md  # Form 卡片裁剪协议文档
│   ├── protocol-mapping.md       # 与 A2UI 原生协议版本映射
│   └── json/                     # JSON Schema + EBNF
│       ├── extended_catalog.json # 全量组件 catalog
│       └── form_catalog.json     # Form 组件 catalog（自包含）
├── eval/                         # 评估工具 + 测试用例 + 报告
│   ├── src/cli/                  # 评估入口脚本（30+ 个）
│   ├── src/core/                 # 校验器、评分器、类型
│   ├── src/llm/                  # LLM 客户端
│   ├── src/prompt/               # Prompt 构建 + Few-shot
│   ├── src/report/               # 报告生成
│   ├── prompts/                  # 协议摘要模板
│   ├── design-points/            # 单点设计评估（20+ 个设计点）
│   │   └── <design-point>/       # README + test-cases/ + reports/
│   ├── test-cases/               # 全量协议测试用例
│   └── reports/                  # 评估报告（运行时生成）
├── protocol-gaps/                # 缺口追踪（GAPS.md 为权威状态源）
│   ├── GAPS.md                   # 总账本
│   ├── pending/                  # 待处理
│   └── resolved/                 # 归档（含 protocol-diff + prompt-diff）
├── docs/                         # 设计文档
│   └── architecture/             # 架构设计文档
└── scripts/                      # 工具脚本
```

## 关键入口

| 入口 | 路径 | 做啥 |
|------|------|------|
| 全量评估 | `eval/` `npm run eval` | 跑全部测试用例 |
| 全量协议规范 | `specification/harmonyos-a2ui-protocol.md` | 全量扩展协议设计文档 |
| Form 协议规范 | `specification/harmonyos-a2ui-form-protocol.md` | Form 卡片裁剪协议 |
| Form 组件 Catalog | `specification/json/form_catalog.json` | Form 协议组件 JSON Schema（自包含） |
| 设计点评估结果 | `eval/design-points/README.md` | 所有设计点 MA 分、结论、失败模式总览 |
| GAP 总账 | `protocol-gaps/GAPS.md` | 所有缺口状态一览 |
| 评估工具配置 | `eval/src/config.ts` | 模型/路径配置 |
| 6 维评分 | `eval/src/core/scorer.ts` | 评分逻辑 |
| Prompt 模板 | `eval/prompts/protocol-summary.md` | LLM 看到的协议摘要 |
