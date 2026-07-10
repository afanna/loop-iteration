# HarmonyOS A2UI Form 卡片协议 — 修改记录

> 本文件记录 HarmonyOS A2UI Form 卡片协议规范的每一次修改，按倒序排列。
>
> **与 `CHANGELOG.md` 的区别**：
> - 本文件是**细粒度开发追溯日志**（每个 commit/GAP 一行），在 master 分支维护，由 GAP 工作流手工编辑。
> - `CHANGELOG.md` 是**粗粒度版本发布日志**（每个 tag 一段），仅在 `1.0.0` 分支维护，由 `scripts/changelog.sh` 从 git log 自动生成。
>
> 回写指引：GAP 合入时，在本文件头部 `## 修改记录` 表格首行插入新行（详见根 `AGENTS.md` § Protocol Modification Rules）。

## 修改记录

| 日期 | 描述 |
|------|------|
| 2026-07-08 | GAP-069：动态数据绑定能力规格完善 — 新增 §3.8 动态数据绑定章节（三种绑定机制 + 适用规则 + 响应式 vs 一次性求值）；§4.2.1 列头改为「支持动态数据类型」；shadow 改判支持绑定；form_catalog.json 以 `ExtendedDynamic*` 类型统一声明（含对象子字段递归绑定）。 |
| 2026-06-14 | Form 协议初始版本，基于全量扩展协议裁剪 |
