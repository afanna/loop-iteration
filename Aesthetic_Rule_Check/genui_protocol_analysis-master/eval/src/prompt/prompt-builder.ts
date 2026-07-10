import type { TestCase, ScopeStrategy, VariableScopeTestCase } from "../core/types.js";
import { getFewShotExamples } from "./few-shot-examples.js";

let _protocolSummary = "";

export function setProtocolSummary(summary: string): void {
  _protocolSummary = summary;
}

/** 重新导出 ScopeStrategy 以保持兼容性 */
export type { ScopeStrategy };


/** 基础规则（两种策略共用） */
function getBaseRules(): string[] {
  return [
    "1. 只输出一个JSON对象，不要包含任何其他文字、说明或markdown代码块标记。",
    '2. 每个组件必须有"component"字段（如"Text"、"Button"、"Column"）。',
    '3. 不要把组件名当作key（错误：{"Text": {...}}），正确：{"component": "Text", ...}。',
    '4. 不要使用"type"代替"component"。',
    '5. Text组件必须包含"content"。Button必须包含"label"。TextInput必须包含"placeholder"。Toggle和Checkbox建议包含"label"作为展示文本。',
    '6. 动态值使用{{ }}双花括号包裹表达式。变量用$前缀。',
    "7. 表达式中使用单引号包裹字符串（如 {{ $x ? 'yes' : 'no' }}）。",
    '8. 字符串拼接使用+运算符（如 {{ \'Hello, \' + $name }}）。',
    "9. 事件名直接作为组件属性（如onClick、onChange），值是EventHandler数组。不要使用listeners包装层。",
    '10. theme字段使用固定字符串值（如"heading1"），不使用expr。',
  ];
}

/** shadowing策略的额外规则 */
function getShadowingRules(): string[] {
  return [
    "11. $context.eventData是当前事件的数据对象，$context.componentId是事件来源组件ID（如onChange的新值、onClick的事件对象）。",
    "12. action中as绑定创建局部变量（如 as:\"result\" → 用$result引用），在当前action链内有效。",
    "13. $xxx变量查找顺序：先查找当前action链的as绑定（局部），再查找数据模型（全局）。局部优先。",
    "14. 如果as绑定名与数据模型变量同名，as绑定的局部变量优先。建议as绑定名避免与数据模型变量同名。",
  ];
}

/** 显式$data策略的额外规则 */
function getExplicitRules(): string[] {
  return [
    "11. $context.eventData是当前事件的数据对象，$context.componentId是事件来源组件ID（如onChange的新值、onClick的事件对象）。",
    "12. action中as绑定创建局部变量（如 as:\"result\" → 用$result引用），在当前action链内有效。",
    "13. 数据模型变量使用$data前缀引用（如$data.status、$data.user.name）。",
    "14. as绑定变量直接用$前缀引用（如$result、$confirmed），不与$data前缀冲突。",
    "15. $context.eventData引用事件数据，$xxx引用as绑定变量，$data.xxx引用数据模型——三者互不冲突。",
  ];
}

export function buildSystemPrompt(strategy: ScopeStrategy = "shadowing"): string {
  const rules = [...getBaseRules()];

  if (strategy === "shadowing") {
    rules.push(...getShadowingRules());
  } else if (strategy === "explicit") {
    rules.push(...getExplicitRules());
  } else if (strategy === "three-layer") {
    rules.push(...getThreeLayerRules());
  } else if (strategy === "two-layer") {
    rules.push(...getTwoLayerRules());
  } else if (strategy === "flat") {
    rules.push(...getFlatRules());
  } else {
    rules.push(...getExplicitRules());
  }

  return [
    "你是鸿蒙智能体UI协议v2.0的DSL生成器。严格按照下面的协议规范生成JSON。",
    "",
    "# 协议规范",
    "",
    _protocolSummary,
    "",
    "# 重要规则",
    "",
    rules.join("\n"),
  ].join("\n");
}

function getThreeLayerRules(): string[] {
  return [
    "11. 变量分三层，每层有独立的前缀：局部变量（as绑定）、数据模型（$__dataModel前缀）、内置全局（$__前缀）。",
    "12. 局部变量：action中as绑定创建局部变量，用$前缀引用（如as:\"result\" → $result引用），在当前action链内有效。",
    "13. 数据模型变量：使用$__dataModel.前缀引用（如$__dataModel.user.name、$__dataModel.count）。所有数据模型变量必须带$__dataModel前缀。",
    "14. 内置全局变量：使用$__前缀引用（如$__widthBreakpoint、$__colorMode）。注意$__前缀专门用于内置全局。",
    "15. $context.eventData是当前事件的数据对象，$context.componentId是事件来源组件ID。",
    "16. 三层变量互不冲突：$xxx是局部（as绑定），$__dataModel.xxx是数据模型，$__Xxx是内置全局。",
  ];
}

function getTwoLayerRules(): string[] {
  return [
    "11. 变量分两层：局部变量（as绑定）和其他变量（数据模型+内置全局合并）。",
    "12. 局部变量：action中as绑定创建局部变量，用$前缀引用（如as:\"result\" → $result引用），在当前action链内有效。",
    "13. 数据模型和内置全局变量统一使用$data.前缀引用（如$data.user.name、$data.windowSize、$data.widthBreakpoint）。",
    "14. $context.eventData是当前事件的数据对象，$context.componentId是事件来源组件ID。",
    "15. 两层互不冲突：$xxx是局部（as绑定），$data.xxx是数据模型和全局。",
  ];
}

function getFlatRules(): string[] {
  return [
    "11. 所有变量统一使用$前缀引用，不区分层级。如$result（as绑定）、$user.name（数据模型）、$WindowSize（全局）。",
    "12. action中as绑定创建局部变量，直接用$前缀引用（如as:\"result\" → $result引用）。",
    "13. 数据模型变量直接用$前缀引用（如$user.name、$count、$config.theme）。",
    "14. 内置全局变量直接用$前缀引用（如$WindowSize、$WidthBreakpoint）。注意没有双下划线前缀。",
    "15. $context.eventData是当前事件的数据对象，$context.componentId是事件来源组件ID。",
  ];
}

export function buildUserPrompt(
  testCase: TestCase,
  strategy: ScopeStrategy = "shadowing",
  shotCount: number = 3
): string {
  const examples = getFewShotExamples(testCase.category, shotCount);

  // 收集验证规则（策略感知）
  const vsCase = testCase as VariableScopeTestCase;
  let rules: typeof testCase.validation_rules;
  if (vsCase.shared_rules && strategy && vsCase.strategy_rules) {
    rules = [...vsCase.shared_rules, ...(vsCase.strategy_rules[strategy] || [])];
  } else {
    rules = testCase.validation_rules;
  }

  const reqs = rules
    .map((r, i) => `${i + 1}. ${r.description}`)
    .join("\n");

  const hints = testCase.hints?.length
    ? "\n提示：\n" + testCase.hints.map((h) => `- ${h}`).join("\n")
    : "";

  let adjustedHints = hints;
  if (strategy === "explicit" && hints) {
    adjustedHints = hints
      .replace(/数据模型变量（/g, "数据模型变量（用$data.前缀，如")
      .replace(/数据模型中的\$/g, "数据模型中的$data.$")
      .replace(/数据模型中有\$/g, "数据模型中有$data.$")
      .replace(/数据模型中原始的\$/g, "数据模型中原始的$data.$")
      .replace(/数据模型中已有\$/g, "数据模型中已有$data.$")
      .replace(/数据模型的\$/g, "数据模型的$data.$")
      .replace(/数据模型的\$([^a])/g, "数据模型的$data.$$$1");
  }
  if (strategy === "three-layer" && hints) {
    adjustedHints = hints
      .replace(/数据模型中的/g, "数据模型中的（用$__dataModel.前缀）")
      .replace(/数据模型变量/g, "数据模型变量（用$__dataModel.前缀）")
      .replace(/内置全局/g, "内置全局（用$__前缀）");
  }
  if (strategy === "two-layer" && hints) {
    adjustedHints = hints
      .replace(/数据模型中的/g, "数据模型中的（用$data.前缀）")
      .replace(/数据模型变量/g, "数据模型变量（用$data.前缀）")
      .replace(/内置全局/g, "内置全局（用$data.前缀）");
  }
  if (strategy === "flat" && hints) {
    adjustedHints = hints
      .replace(/\$__widthBreakpoint/g, "$WidthBreakpoint")
      .replace(/数据模型变量/g, "变量（直接用$前缀）")
      .replace(/内置全局/g, "全局变量（直接用$前缀）");
  }

  const parts: string[] = [];
  if (examples) {
    parts.push(examples, "");
  }
  parts.push("---");
  parts.push("任务：" + testCase.task);
  parts.push("", "要求：", reqs);
  if (adjustedHints) {
    parts.push(adjustedHints);
  }
  parts.push("", "请只输出一个JSON对象，不要包含任何其他内容。");

  return parts.join("\n");
}
