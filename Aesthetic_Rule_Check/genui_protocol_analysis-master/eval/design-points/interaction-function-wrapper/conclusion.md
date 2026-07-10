# 交互函数统一建模评估

## 设计点

评估将 `getXxx` 表单取值函数与 `break`、`sendToAssistant`、`setDataModel`、`setAttributes`、`scrollTo`、`navigate` 等预定义交互行为统一纳入“扩展函数”章节后，模型是否更容易稳定生成正确 DSL。

## 策略

| 策略 | 描述 |
|------|------|
| A: split-function-action | getXxx 作为扩展内置函数，预定义行为作为交互行为，概念分散 |
| B: unified-interaction-function | 所有交互可调用能力统一作为扩展函数描述，调用处使用 `{call,args}` 形态，返回类型由函数定义声明 |

## 测试重点

- `action.event.context` 中调用 `getRadioValue` / `getCheckboxGroupValues` / `getToggleValue` / `getSelectValue`
- `onClick` 行为链中调用 `break` / `sendToAssistant` / `setDataModel` / `setAttributes` / `scrollTo` / `navigate`
- 区分 `action.event.context` 求值函数和事件监听行为链函数的使用位置

## 运行方式

当前仓库尚未新增专用 CLI，可通过 `TEST_CASES_FILE` 指定本目录测试用例后接入现有策略感知评估器，或在后续补充 `eval:interaction-function-wrapper` 脚本。

## 评估报告

- reports/interaction-function-wrapper-ab-2026-05-14T12-11-58.md

## 评估结论

策略B `unified-interaction-function` 达到 A+：GLM-5.1 MA 100.0%，DeepSeek-Chat MA 100.0%。策略A `split-function-action` 也达到 A+，但 GLM-5.1 为 98.7%，低于策略B；推荐采用统一扩展函数建模。
