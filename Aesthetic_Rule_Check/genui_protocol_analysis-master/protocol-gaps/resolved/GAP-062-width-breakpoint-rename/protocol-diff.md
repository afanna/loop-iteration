# GAP-062 协议修改

## 修改: 全局重命名 + 语义描述更新

### 重命名范围

- `__WindowWidthBreakpoint` → `__WidthBreakpoint`：~250 处，36 个文件
- `$data.windowBreakpoint` → `$data.widthBreakpoint`（two-layer 策略变体）
- `$WindowWidthBreakpoint` → `$WidthBreakpoint`（flat 策略变体）

### 语义描述更新

- §3.8.2：`窗口状态` → `A2UI Surface 所在外层容器的状态`；`窗口宽度范围` → `容器宽度范围`；`对齐` → `参照`
- §4.2.2.2.2：`当前窗口横向断点` → `当前 A2UI Surface 所在外层容器的横向断点`

### 不变

- 断点阈值表（xs/sm/md/lg/xl + 数值区间）
- 表达式语法和使用模式
- `$__ColorMode` 命名
