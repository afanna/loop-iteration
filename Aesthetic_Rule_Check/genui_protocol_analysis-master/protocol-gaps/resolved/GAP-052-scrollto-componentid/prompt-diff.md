# GAP-052 Prompt 修改记录

## 修改 1: `protocol-harmonyos-extended.md` — scrollTo 参数

**位置**: 支持的动作 → scrollTo 行

**修改前**:
```
| scrollTo | {xOffset, yOffset} | 滚动到指定位置 |
```

**修改后**:
```
| scrollTo | {componentId, xOffset, yOffset} | 滚动指定 List 到指定位置 |
```

---

## 修改 2: `protocol-summary.md` — 新增 scrollTo

**位置**: 标准 Actions 表（navigate 和 showToast 之间）

**修改前**:
```
| navigate | {url} | 页面导航 |
| showToast | {message, duration?} | 显示提示 |
```

**修改后**:
```
| navigate | {url} | 页面导航 |
| scrollTo | {componentId, xOffset, yOffset} | 滚动 List 到指定位置 |
| showToast | {message, duration?} | 显示提示 |
```
