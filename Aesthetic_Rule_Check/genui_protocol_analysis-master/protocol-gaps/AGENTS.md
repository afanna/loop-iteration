# protocol-gaps — 协议缺口追踪与闭环管理

## 目的

管理从"发现协议缺口"到"修改发布"的完整生命周期。确保每一步修改都经过亲和性验证，全链路可追溯。

## 核心原则

1. **所有修改都要过亲和性验证** — 协议规范修复、Prompt 优化、测试补充，无一例外
2. **每个缺口有唯一 ID** — 贯穿 GAPS.md → eval/design-points → specification/prompts → test-cases
3. **修改可追溯** — 从任何变更点都能反向定位到缺口源头和验证报告

## 目录结构

```
protocol-gaps/
├── AGENTS.md                         # 本文件：工作规范
├── GAPS.md                           # 总账本：所有缺口的状态一览表
├── pending/                          # 待处理缺口
│   └── GAP-XXX-<slug>/
│       └── README.md                 # 缺口描述 + 候选修复方案
└── resolved/                         # 已解决缺口（归档）
    └── GAP-XXX-<slug>/
        ├── README.md                 # 缺口描述 + 修复方案 + 最终结论
        ├── affinity-report.md        # 指向 eval/design-points/ 或 eval/reports/ 的评估报告
        ├── protocol-diff.md          # 对 specification/harmonyos-a2ui-protocol.md 的修改（diff 形式）
        ├── prompt-diff.md            # 对 eval/prompts/ + few-shot 的修改
        └── new-test-cases.json       # 本次新增的测试用例
```

## 缺口类型与验证方式

所有修改都会改变 LLM 看到的 System Prompt，因此都需要验证。按修改深度分为两类：

### 轻量修复 — 全量回归验证

适用场景：改名、统一术语、消除歧义、修正明显的文档错误。LLM 的语义理解不变。

验证方式：
```
1. 修改 specification/harmonyos-a2ui-protocol.md
2. 同步修改 eval/prompts/protocol-v2-summary.md（LLM 实际看到的）
3. 运行 npm run eval（全量测试用例）
4. 确认通过率 ≥ 修改前，各分类无退化
```

### 实质性修复 — eval/design-points A/B 对比验证

适用场景：新增能力、改变语法规则、补充缺失机制。LLM 需要学习新行为。

验证方式：
```
1. 在 eval/design-points/ 下新建设计点子目录
2. 定义策略感知测试用例（含 shared_rules + strategy_rules）
3. 运行 A/B 对比评估：
   - 策略A（旧协议）：当前协议的行为
   - 策略B（新协议）：修改后的行为
4. 策略B 达到 A 级（MA ≥ 80%）→ 方案可行
5. 若 0-shot 通过率低 → 补充 few-shot → 重新评估
6. 确认后：修改 spec + prompt-summary + few-shot
7. 在 eval/test-cases/ 新增对应用例
8. 全量回归确认无退化
```

### 测试覆盖补充 — 基线验证

适用场景：协议没问题，但缺少某些场景的测试用例。

验证方式：
```
1. 编写测试用例，放入 eval/test-cases/ 对应分类
2. 运行 npm run eval
3. 确认新用例的通过率基线
4. 全量回归确认无退化
```

## 五阶段闭环流程

```
阶段1  阶段2          阶段3       阶段4      阶段5
发现 ──→ 亲和性验证 ──→ 导出修改 ──→ 全量回归 ──→ 归档
 │         │              │           │          │
 │    ┌────┴────┐    ┌────┴────┐      │     pending/
 │    │轻量:全量 │    │protocol │      │       ↓
 │    │回归     │    │-diff.md │      │    resolved/
 │    │实质:A/B │    │prompt-  │      │
 │    │对比     │    │diff.md  │      │
 │    └─────────┘    │new-test │      │
 │                   │-cases   │      │
 │                   └─────────┘      │
GAPS.md                           GAPS.md
(登记)                            (更新状态)
```

### 阶段 1：发现与登记

1. 在 `GAPS.md` 中新增一行，分配唯一 ID（GAP-XXX），状态标 `pending`
2. 在 `pending/GAP-XXX-<slug>/README.md` 中写清楚：
   - 问题描述（具体哪里有问题）
   - 影响范围（哪些协议章节、哪些测试分类）
   - 候选修复方案（如果已有想法）
   - 验证计划（轻量回归 or A/B 对比）

### 阶段 2：亲和性验证

按缺口类型选择对应的验证方式（见上）。

**评估报告引用规范**：在 README.md 中写明报告路径，如：
```markdown
## 评估报告
- eval/design-points/event-chain/reports/chain-comparison-2026-04-15T11-15-04.md
```

### 阶段 3：导出修改

> ⚠ **回写位置变更声明（2026-06-17 起）**
> 修改记录表已从 spec 主文档头部迁移到独立文件：
> - 全量协议 → `specification/modification-history.md`
> - Form 协议 → `specification/modification-history-form.md`
> `resolved/` 目录下历史 GAP 的 protocol-diff.md 中描述的位置（"spec 头部 ## 修改记录"）已**废弃**，仅作时间快照保留，**不作为当前回写位置的参考**。

创建三个文件记录实际修改：

**protocol-diff.md** — 记录对 `specification/harmonyos-a2ui-protocol.md` 的修改：
```markdown
# GAP-XXX 协议修改

## 修改 1: 章节 X.Y 某段
- 位置: specification/harmonyos-a2ui-protocol.md 第 N 行
- 修改前: ...
- 修改后: ...
- 理由: ...

## 修改 N（必填）: 修改记录表 — 新增 GAP-XXX 条目
- 位置: specification/modification-history.md 头部 `## 修改记录`（倒序最前）
       （Form 协议修改时改用 modification-history-form.md）
- 新增条目: | YYYY-MM-DD | GAP-XXX：修改简述。commit `abc1234` | §X.Y |
- 注意: 不要编辑 spec 主文档头部的修改记录存根
```

**prompt-diff.md** — 记录对 System Prompt 和 few-shot 的修改：
```markdown
# GAP-XXX Prompt 修改

## 修改: protocol-v2-summary.md
- 新增规则: "N. ..."
- 修改规则: "N. ..." → "N. ..."

## Few-shot 修改
- 新增示例: ...
- 修改示例: ...
```

**new-test-cases.json** — 记录本次新增的测试用例（JSON 数组，可直接放入 eval/test-cases/）。

**同步检查** — 如 spec 修改涉及语法、组件、表达式、事件、样式等评估相关内容，必须同步更新 `eval/prompts/protocol-summary.md` 并更新其头部的版本标记。

### 阶段 4：全量回归

```
1. 运行 npm run eval（全量测试）
2. 对比上一次全量报告的通过率
3. 确认无退化（各分类通过率 ≥ 修改前）
4. 如果有退化 → 分析原因 → 回到阶段 2
```

### 阶段 5：归档

```
1. mv pending/GAP-XXX → resolved/GAP-XXX
2. 在 README.md 补充最终结论
3. 在 GAPS.md 中将状态改为 resolved，填写解决日期
```

## 命名规范

| 元素 | 规范 | 示例 |
|------|------|------|
| 缺口 ID | `GAP-` + 三位数字 | GAP-001, GAP-023 |
| 目录名 | `GAP-XXX-` + 短横线 slug | GAP-003-event-chain |
| slug | 英文，描述核心问题 | ebnf-datamodel, expr-escape |
| ID 编号 | 按登记时间递增，不回收 | 历史缺口 001-022，新缺口从 023 开始 |

## 与其他目录的关系

```
protocol-gaps/GAP-003/README.md
  │
  ├── 引用 → eval/design-points/event-chain/README.md    （设计点评估）
  ├── 引用 → eval/design-points/event-chain/reports/     （评估报告）
  │
  ├── 修改 → specification/harmonyos-a2ui-protocol.md                  （协议文档）
  ├── 修改 → specification/modification-history.md             （修改记录）
  ├── 修改 → eval/prompts/protocol-v2-summary.md （System Prompt）
  ├── 修改 → eval/src/prompt/few-shot-examples.ts （Few-shot）
  │
  └── 新增 → eval/test-cases/          （全量测试用例）
```

- `protocol-gaps/` 是**管理层**：追踪缺口的状态和修改记录
- `eval/design-points/` 是**验证层**：提供 A/B 对比评估能力
- `eval/test-cases/` 和 `eval/reports/` 是**回归层**：全量测试用例和报告
- `specification/` 和 `eval/prompts/` 是**修改目标**

protocol-gaps 不替代任何现有目录，是新增的追踪层。

## 缺口登记模板

```markdown
# GAP-XXX: <缺口标题>

## 问题描述
<具体描述问题：哪里有问题，为什么是问题>

## 影响范围
- 协议章节: X.X
- 测试分类: FP-XX

## 候选修复方案
- 方案A: ...
- 方案B: ...
- 推荐: ...

## 验证计划
<轻量回归 或 eval/design-points A/B 对比>
<评估维度、测试用例数量、预期指标>

## 评估报告
<验证完成后填写，指向评估报告路径>

## 最终结论
<归档时填写>
```

## 历史缺口

现有 22 个 eval/design-points 设计点视为历史缺口（GAP-001 ~ GAP-022），已在 resolved/ 归档。它们完成了评估但未走 protocol-gaps 流程。后续新缺口严格按本规范执行。
