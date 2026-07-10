# 文档维护规范

修改或新增文档时，请遵循以下规则。

---

## 一、新建文件时必须同步更新

| 必须更新的地方 | 说明 |
|---------------|------|
| SUMMARY.md | 全仓文档目录中增加新文件条目 |
| 所在分目录 README.md（如有） | introduction、concepts、guides、reference 及其子目录的目录页需同步 |
| 根 README.md | 仅当新文件应出现在首页精选导航时更新 |
| 父级 overview.md（如有） | 新增标准组件时更新 reference/standard-components/overview.md；新增扩展组件时更新 reference/extended-components/overview.md |

---

## 二、删除/重命名文件时必须检查

| 检查项 | 做法 |
|--------|------|
| 全库搜索旧文件名 | grep -r "old-file.md" . 找出所有引用并更新 |
| 目录入口是否同步 | 更新 SUMMARY.md、所在分目录 README.md；如首页精选导航涉及该文件，同步根 README.md |
| 导航链接前后连贯 | 删除中间一个 concepts 文档时，更新前后文档的 ← 上一节 / → 下一节 |
| 总计数是否变化 | 如扩展组件 21→22，需更新 README、concepts、glossary 等约 16 处 |

---

## 三、命名规范

| 规则 | 示例 |
|------|------|
| 文件名：kebab-case | creating-custom-components.md |
| 组件 reference：通过目录区分标准/扩展 | reference/standard-components/text.md / reference/extended-components/text.md |
| 版本标注：全角冒号 | **起始版本：**  API Version 20 |

---

## 四、内容规范

| 规则 | 说明 |
|------|------|
| A2UI 协议概念归属 | 消息、组件模型、Catalog、DataModel 等属于"**A2UI 协议**"，不是"GenUI" |
| GenUI 概念归属 | SurfaceController、UIRendererComponent、PromptBuilder 等属于 **GenUI 实现** |
| 禁止与传统框架对比 | 不说"不同于传统的..." |
| 禁止口语化 | 不说"搞定"、"跑通"、"一句话...让你..." |
| 目录路径不出现 | 不列文件系统目录树（如 entry/src/main/ets/...），只描述模块功能 |
| 导入路径统一 | from '@arkui-genius/genui' |

---

## 五、导航 footer 规则

| 层级 | 格式 |
|------|------|
| concepts | 中间页使用 ← 上一节：[xxx](xxx.md) \| → 下一节：[xxx](xxx.md) \| ↑ [概念层总览](overview.md)；首篇可只有下一篇，末篇可不提供下一节 |
| guides | 相关指南：→ [xxx](xxx.md) \| → [xxx](xxx.md) |
| reference | 返回当前参考层级总览；reference 根层用 ../README.md，standard-components / extended-components 用 ../../README.md，函数页可按页面关系返回函数总览或文档导航 |
| introduction | 无固定格式，建议末尾放"下一步"链接 |

---

## 六、新增文件前的自检清单

```
□ 文件名符合 kebab-case？
□ SUMMARY.md 已更新？
□ 所在分目录 README.md 已更新？
□ 根 README.md 是否需要更新已判断？
□ 所有引用旧名称的链接已更新？
□ 导航 footer 格式符合所属层级规范？
□ 没有对比传统框架/口语化表述？
□ 代码示例中的导入路径为 @arkui-genius/genui？
□ 版本标注为全角冒号：**起始版本：**  API Version 20？
□ A2UI 概念正确归属于"协议"而非"GenUI"？
□ 涉及数字（组件数、函数数）的地方已全局同步？
```

---

## 七、目录结构

全仓文档目录以 [SUMMARY.md](SUMMARY.md) 为准。新增、删除或调整文档时，同步更新该目录。

---

## 八、concepts 层线性阅读顺序

新增或调整 concepts 文档时，注意以下顺序：

```
overview
→ surfaces-and-messages
→ components-and-layout
→ data-model-and-binding
→ data-flow
→ actions-and-functions
→ catalogs
→ agent-deployment-models
→ expression-language
→ variable-system
→ theme-and-color-mode
→ extension-color-mode
→ extension-multi-deployment
→ multi-device-adaptation
```

概念页 footer 按此顺序维护相邻关系：首篇可只提供下一篇，末篇可不提供下一节，中间页需同时提供上一节和下一节。
