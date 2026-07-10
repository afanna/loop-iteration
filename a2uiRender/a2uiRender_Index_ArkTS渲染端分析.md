# a2uiRender / Index.ets ArkTS 渲染端分析

本文档用于记录对 GitHub 项目 `IamJohnRain/a2uiRender` 中 `Index.ets` 的分析，并说明它对 HarmonyOS 卡片审美规则评分系统、离线截图生成和 V3 规则标定系统的价值。

参考文件：

```text
https://github.com/IamJohnRain/a2uiRender/blob/master/entry/src/main/ets/pages/Index.ets
```

---

# 1. 项目定位

`a2uiRender` 本质上是一个 HarmonyOS 端的 A2UI 批量渲染与截图工具。

它的核心能力是：

```text
A2UI message / DSL
    ↓
HarmonyOS ArkTS App
    ↓
SurfaceController 渲染
    ↓
window.snapshot() 截图
    ↓
输出 PNG
```

这和我们后续数据闭环高度契合：

```text
Query / DSL
    ↓
ArkTS 渲染截图
    ↓
Aesthetic_Rule_Check 规则评分
    ↓
视觉 Teacher 评分
    ↓
V3 Rule Calibration
```

---

# 2. Index.ets 核心流程

`Index.ets` 的主要流程可以概括为：

```text
aboutToAppear()
    ↓
获取应用 context
    ↓
准备输出目录
    ↓
扫描 rawfile/a2ui_cases/
    ↓
读取 .json / .jsonl case
    ↓
创建 SurfaceController
    ↓
发送 A2UI message
    ↓
等待渲染稳定
    ↓
window.snapshot()
    ↓
裁剪截图
    ↓
保存 PNG
```

支持的输入格式：

```text
.json   JSON 数组或单个 A2UI message
.jsonl  一行一个 A2UI message
```

典型 A2UI message 包括：

```text
createSurface
updateComponents
updateDataModel
```

---

# 3. 对当前项目的价值

该项目可以作为我们 ArkTS 渲染端的重要参考实现。

它适合解决的问题：

```text
1. 不依赖小艺 UI，直接渲染 DSL / A2UI message
2. 批量生成截图数据
3. 为规则评分系统提供稳定输入
4. 为视觉 Teacher 评分提供同源截图
5. 为 V3 标定系统构造大规模样本集
```

如果我们从小艺或其他生成链路中拿到的是 A2UI v0.9 风格消息，那么该项目的渲染逻辑非常值得复用。

---

# 4. 不建议原样直接使用的原因

## 4.1 输入依赖 rawfile

当前 case 文件位于：

```text
entry/src/main/resources/rawfile/a2ui_cases/
```

这意味着新增或修改 case 后通常需要重新构建并安装 HAP。

对我们后续批量生成 1000、5000、10000 张截图来说，这个方式成本太高。

建议改成：

```text
应用私有目录 filesDir/a2ui_cases/
```

这样 Python 自动化脚本可以通过 HDC 动态 push case 文件，不需要每次重新构建 ArkTS 项目。

---

## 4.2 渲染稳定性依赖固定延迟

当前逻辑大致是：

```text
发送 message
等待 1000ms
截图
```

这个策略简单可用，但大规模数据集里可能出现：

```text
截图过早
动画未完成
图片资源未加载完成
不同设备性能导致渲染时间不同
```

建议后续改造为：

```text
渲染完成事件优先
连续两帧截图稳定作为辅助判断
固定超时作为兜底
```

---

## 4.3 裁剪位置存在设备差异风险

项目中存在类似固定顶部偏移的裁剪逻辑，例如：

```text
SURFACE_TOP_VP
```

不同设备、状态栏、窗口模式、分辨率下可能导致截图区域偏移。

对审美评分系统来说，截图边界必须稳定，否则会影响：

```text
留白比例
布局边距
视觉重心
信息区域计算
```

建议后续将裁剪参数配置化，并在每台设备首次运行时校准。

---

## 4.4 缺少机器可读的结果清单

当前项目主要输出 PNG 和 UI 状态。

为了接入规则评分和 V3 标定系统，建议增加：

```text
render_results.json
```

字段建议：

```json
{
  "case_id": "weather_001",
  "input_path": "filesDir/a2ui_cases/weather_001.jsonl",
  "output_path": "filesDir/a2ui-render-shots/weather_001.png",
  "success": true,
  "error": "",
  "surface_width": 720,
  "surface_height": 360,
  "screenshot_width": 720,
  "screenshot_height": 360,
  "started_at": "2026-07-10T10:00:00+08:00",
  "finished_at": "2026-07-10T10:00:02+08:00"
}
```

---

# 5. 推荐改造方向

建议不要直接替换当前项目，而是将 `a2uiRender` 作为 ArkTS 渲染端参考实现，做一个面向数据闭环的改造版。

目标链路：

```text
Python 生成 / 收集 DSL
    ↓
HDC push 到设备 filesDir/a2ui_cases/
    ↓
启动 ArkTS Render App
    ↓
App 批量读取 case
    ↓
SurfaceController 渲染
    ↓
window.snapshot() 截图
    ↓
生成 render_results.json
    ↓
HDC pull 截图和结果清单
    ↓
Aesthetic_Rule_Check 规则评分
    ↓
aesthetic-v4-vlm-judge-package-20260624 教师评分
    ↓
V3 Rule Calibration 分析
```

---

# 6. 建议目录设计

如果在当前 `ArkTs` 目录下新建渲染端项目，可采用：

```text
ArkTs/
  entry/
    src/
      main/
        ets/
          pages/
            Index.ets
          render/
            CaseLoader.ets
            RenderRunner.ets
            ScreenshotWriter.ets
            ResultWriter.ets
        resources/
          rawfile/
            README.md
  docs/
    a2uiRender_Index_ArkTS渲染端分析.md
```

逻辑拆分建议：

```text
Index.ets             页面入口和运行状态展示
CaseLoader.ets        读取 filesDir / rawfile 中的 case
RenderRunner.ets      管理 SurfaceController 和 message 投递
ScreenshotWriter.ets  执行截图、裁剪和 PNG 保存
ResultWriter.ets      写入 render_results.json
```

---

# 7. 第一阶段 MVP

第一阶段先实现最小可用能力：

```text
1. 从 filesDir/a2ui_cases/ 读取 .json / .jsonl
2. 批量渲染每个 case
3. 每个 case 输出一张 PNG
4. 生成 render_results.json
5. 支持失败 case 继续执行
6. 页面显示总数、成功数、失败数、当前 case
```

第一阶段不急于实现：

```text
复杂动画稳定检测
多设备并发
自动参数校准
视觉评分接入
规则标定接入
```

---

# 8. 和 V3 规则标定系统的关系

ArkTS 渲染端负责提供稳定截图。

V3 标定系统负责分析规则评分和教师评分之间的偏差。

两者关系：

```text
ArkTS Render App
    生成截图和 render_results.json

Aesthetic_Rule_Check
    对截图和 DSL 进行规则评分

Vision Teacher
    对截图进行视觉评分

Rule Calibration System
    比较 Rule Score 与 Teacher Score
    输出参数建议和标定报告
```

因此，ArkTS 渲染端不是评分系统，但它是数据闭环的基础设施。

---

# 9. 后续建议

下一步建议：

```text
1. 拉取或参考 a2uiRender 的 Index.ets
2. 确认 @arkui-genius/genui 依赖版本
3. 将 case 输入从 rawfile 改为 filesDir
4. 增加 render_results.json 输出
5. 设计 Python/HDC push-pull 协议
6. 用 10 个 case 先验证渲染和截图闭环
7. 再接入 Aesthetic_Rule_Check 批量评分
```

最终目标：

```text
构建一个可批量、可追踪、可复现的 ArkTS 卡片渲染截图系统，
为规则评分迭代和 V3 标定系统提供稳定数据基础。
```
