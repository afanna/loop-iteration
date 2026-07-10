import type { TestCase, VariableScopeTestCase, ChainTestCase, PatternCheck, ValidationRule, ScopeStrategy, LevelBreakdown } from "./types.js";
import { extractJSON } from "./json-extractor.js";

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  generated: Record<string, unknown> | null;
  /** L1-L4 分层结果（用于 D1 计算） */
  levels?: LevelBreakdown;
}

/** 验证LLM输出（支持策略感知） */
export function validate(
  rawOutput: string,
  testCase: TestCase,
  strategy?: string
): ValidationResult {
  const errors: string[] = [];

  // Level 1: JSON解析
  const jsonStr = extractJSON(rawOutput);
  if (!jsonStr) {
    return {
      passed: false,
      errors: ["JSON解析失败：无法从输出中提取有效JSON"],
      generated: null,
      levels: { l1_json_parsed: false, l2_structure_ok: false, l3_patterns_ok: false, l4_rules_ok: false },
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    return {
      passed: false,
      errors: [`JSON解析失败：${(e as Error).message}`],
      generated: null,
      levels: { l1_json_parsed: false, l2_structure_ok: false, l3_patterns_ok: false, l4_rules_ok: false },
    };
  }

  // 区分数组输出和对象输出
  const isArray = Array.isArray(parsed);
  const generated: Record<string, unknown> = isArray
    ? { _items: parsed } as unknown as Record<string, unknown>
    : parsed as Record<string, unknown>;

  const levels: LevelBreakdown = {
    l1_json_parsed: true,
    l2_structure_ok: true,
    l3_patterns_ok: true,
    l4_rules_ok: true,
  };

  // Level 2: 结构验证（数组输出跳过 L2）
  if (!isArray) {
    for (const field of testCase.expected.required_fields) {
      const value = getFieldValue(generated, field);
      if (value === undefined) {
        errors.push(`缺少必选字段: ${field}`);
        levels.l2_structure_ok = false;
      }
    }

    // 验证component类型（仅在expected.component有定义时检查）
    if (testCase.expected.component !== undefined && generated.component !== testCase.expected.component) {
      errors.push(`component字段不匹配: 期望"${testCase.expected.component}"，实际"${generated.component}"`);
      levels.l2_structure_ok = false;
    }
  }

  // Level 3: 模式匹配（数组输出跳过 L3）
  if (!isArray) {
    for (const pattern of testCase.expected.patterns) {
      const err = checkPattern(generated, pattern);
      if (err) {
        errors.push(err);
        levels.l3_patterns_ok = false;
      }
    }
  }

  // Level 4: 规则验证（策略感知）
  const rules = resolveRules(testCase, strategy);
  for (const rule of rules) {
    const err = checkRule(generated, rule, isArray ? parsed as unknown[] : undefined);
    if (err) {
      errors.push(err);
      levels.l4_rules_ok = false;
    }
  }

  // 对外暴露的 generated：数组时保留原始数组
  const exposedGenerated = isArray ? { _items: parsed } as unknown as Record<string, unknown> : generated;
  return { passed: errors.length === 0, errors, generated: exposedGenerated, levels };
}

/** 根据策略解析出要应用的验证规则 */
function resolveRules(testCase: TestCase, strategy?: string): ValidationRule[] {
  // 如果是 VariableScopeTestCase 且提供了策略
  const vsCase = testCase as VariableScopeTestCase;
  if (vsCase.shared_rules && strategy && vsCase.strategy_rules) {
    const strategyRules = (vsCase.strategy_rules as Record<string, ValidationRule[]>)[strategy] || [];
    return [...vsCase.shared_rules, ...strategyRules];
  }

  // 如果是 ChainTestCase 且提供了策略
  const chainCase = testCase as unknown as ChainTestCase;
  if (chainCase.shared_rules && strategy && chainCase.strategy_rules) {
    const strategyRules = chainCase.strategy_rules[strategy] || [];
    return [...chainCase.shared_rules, ...strategyRules];
  }

  // 回退：使用原有的 validation_rules
  return testCase.validation_rules;
}

/** 通过路径获取字段值，支持点号和数组下标 */
function getFieldValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) {
      const idx = parseInt(part, 10);
      current = current[idx];
    } else if (typeof current === "object") {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/** 检查模式 */
function checkPattern(obj: Record<string, unknown>, pattern: PatternCheck): string | null {
  const value = getFieldValue(obj, pattern.field);
  if (value === undefined) {
    return `模式检查失败: 字段${pattern.field}不存在`;
  }

  if (pattern.must_contain !== undefined) {
    const str = valueToString(value);
    if (!str.includes(pattern.must_contain)) {
      return `模式检查失败: ${pattern.field}的值"${truncate(str, 80)}"不包含"${pattern.must_contain}"`;
    }
  }

  if (pattern.must_match !== undefined) {
    const str = valueToString(value);
    if (!new RegExp(pattern.must_match).test(str)) {
      return `模式检查失败: ${pattern.field}的值"${truncate(str, 80)}"不匹配正则/${pattern.must_match}/`;
    }
  }

  if (pattern.must_be_type !== undefined) {
    const actualType = Array.isArray(value) ? "array" : typeof value;
    if (actualType !== pattern.must_be_type) {
      return `模式检查失败: ${pattern.field}的类型期望${pattern.must_be_type}，实际${actualType}`;
    }
  }

  return null;
}

/** 检查规则 */
function checkRule(obj: Record<string, unknown>, rule: ValidationRule, arrayItems?: unknown[]): string | null {
  switch (rule.type) {
    case "has_field": {
      if (!rule.field) return null;
      // 数组输出：检查任意元素是否有该字段
      if (arrayItems && rule.field !== "$output") {
        const found = arrayItems.some((item) => {
          if (typeof item === "object" && item !== null) {
            return getFieldValue(item as Record<string, unknown>, rule.field!) !== undefined;
          }
          return false;
        });
        if (!found) {
          return `规则检查失败: ${rule.description}`;
        }
        return null;
      }
      const value = getFieldValue(obj, rule.field);
      if (value === undefined) {
        return `规则检查失败: ${rule.description}`;
      }
      return null;
    }

    case "contains": {
      if (!rule.field || !rule.value) return null;
      // $output 特殊字段：检查整个输出
      if (rule.field === "$output") {
        const fullStr = arrayItems ? JSON.stringify(arrayItems) : JSON.stringify(obj);
        if (!fullStr.includes(rule.value)) {
          return `规则检查失败: 输出不包含"${rule.value}" - ${rule.description}`;
        }
        return null;
      }
      // 数组输出：检查任意元素的指定字段
      if (arrayItems) {
        const found = arrayItems.some((item) => {
          if (typeof item === "object" && item !== null) {
            const value = getFieldValue(item as Record<string, unknown>, rule.field!);
            if (value === undefined) return false;
            const str = valueToString(value);
            return str.includes(rule.value!);
          }
          return false;
        });
        if (!found) {
          return `规则检查失败: 无组件的${rule.field}包含"${rule.value}" - ${rule.description}`;
        }
        return null;
      }
      const value = getFieldValue(obj, rule.field);
      if (value === undefined) {
        return `规则检查失败: 字段${rule.field}不存在 - ${rule.description}`;
      }
      const str = valueToString(value);
      if (!str.includes(rule.value)) {
        return `规则检查失败: ${rule.field}的值"${truncate(str, 80)}"不包含"${rule.value}" - ${rule.description}`;
      }
      return null;
    }

    case "field_is_expr": {
      if (!rule.field) return null;
      const value = getFieldValue(obj, rule.field);
      if (value === undefined) {
        return `规则检查失败: 字段${rule.field}不存在 - ${rule.description}`;
      }
      if (typeof value === "object" && value !== null && "expr" in (value as Record<string, unknown>)) {
        return null;
      }
      return `规则检查失败: ${rule.field}未使用expr格式 - ${rule.description}`;
    }

    case "events_format": {
      const EVENT_NAMES = ["onClick", "onChange", "onSubmit", "onAppear", "onSelect", "onReachStart", "onReachEnd"];

      const hasClick = "onClick" in obj;
      const hasChange = "onChange" in obj;
      const hasSubmit = "onSubmit" in obj;

      if (rule.description.includes("onClick") && !hasClick) {
        return `规则检查失败: 缺少onClick事件 - ${rule.description}`;
      }
      if (rule.description.includes("onChange") && !hasChange) {
        return `规则检查失败: 缺少onChange事件 - ${rule.description}`;
      }
      if (rule.description.includes("onSubmit") && !hasSubmit) {
        return `规则检查失败: 缺少onSubmit事件 - ${rule.description}`;
      }

      for (const key of EVENT_NAMES) {
        if (key in obj) {
          const val = obj[key];
          if (!Array.isArray(val)) {
            return `规则检查失败: ${key}的值必须是数组 - ${rule.description}`;
          }
        }
      }

      if (rule.description.includes("onChange") && rule.description.includes("onSubmit")) {
        if (!hasChange || !hasSubmit) {
          return `规则检查失败: 必须同时包含onChange和onSubmit - ${rule.description}`;
        }
      }

      return null;
    }

    case "children_format": {
      const children = obj.children;
      if (children === undefined) {
        return `规则检查失败: 缺少children字段 - ${rule.description}`;
      }
      if (rule.description.includes("字符串数组")) {
        if (!Array.isArray(children) || children.some((c) => typeof c !== "string")) {
          return `规则检查失败: children必须是字符串数组 - ${rule.description}`;
        }
      }
      return null;
    }

    case "not_contains": {
      if (!rule.field || !rule.value) return null;
      // $output 特殊字段：检查整个输出不包含
      if (rule.field === "$output") {
        const fullStr = arrayItems ? JSON.stringify(arrayItems) : JSON.stringify(obj);
        if (fullStr.includes(rule.value)) {
          return `规则检查失败: 输出不应包含"${rule.value}" - ${rule.description}`;
        }
        return null;
      }
      const value = getFieldValue(obj, rule.field);
      if (value === undefined) {
        return null; // 字段不存在时 not_contains 自动通过
      }
      const str = valueToString(value);
      if (str.includes(rule.value)) {
        return `规则检查失败: ${rule.field}不应包含"${rule.value}" - ${rule.description}`;
      }
      return null;
    }

    case "matches_regex": {
      if (!rule.field || !rule.value) return null;
      // $output 特殊字段：检查整个输出
      if (rule.field === "$output") {
        const fullStr = arrayItems ? JSON.stringify(arrayItems) : JSON.stringify(obj);
        if (!new RegExp(rule.value).test(fullStr)) {
          return `规则检查失败: 输出不匹配正则 - ${rule.description}`;
        }
        return null;
      }
      const value = getFieldValue(obj, rule.field);
      if (value === undefined) {
        return `规则检查失败: 字段${rule.field}不存在 - ${rule.description}`;
      }
      if (!new RegExp(rule.value).test(String(value))) {
        return `规则检查失败: ${rule.field}不匹配正则 - ${rule.description}`;
      }
      return null;
    }

    case "chain_format": {
      const EVENT_NAMES = ["onClick", "onChange", "onSubmit", "onAppear", "onSelect", "onReachStart", "onReachEnd"];

      const findObj = (target: Record<string, unknown>): Record<string, unknown> | null => {
        const entries = Object.entries(target).filter(([k]) => EVENT_NAMES.includes(k));
        if (entries.length > 0) return target;
        if (arrayItems && arrayItems.length === 1 && typeof arrayItems[0] === "object") {
          return arrayItems[0] as Record<string, unknown>;
        }
        return null;
      };

      const eventObj = findObj(obj);
      if (!eventObj) {
        return `规则检查失败: 缺少事件属性 - ${rule.description}`;
      }

      const eventEntries = Object.entries(eventObj).filter(([k]) => EVENT_NAMES.includes(k));

      const eventName = eventEntries[0][0];
      const eventValue = eventEntries[0][1];

      if (rule.description.includes("handlerGroups")) {
        if (typeof eventValue !== "object" || Array.isArray(eventValue)) {
          return `规则检查失败: ${eventName}必须是对象（handlerGroups格式） - ${rule.description}`;
        }
        const eventObj = eventValue as Record<string, unknown>;
        if (!("handlerGroups" in eventObj)) {
          return `规则检查失败: ${eventName}缺少handlerGroups字段 - ${rule.description}`;
        }
        if (!Array.isArray(eventObj.handlerGroups)) {
          return `规则检查失败: handlerGroups必须是数组 - ${rule.description}`;
        }
        return null;
      }

      if (rule.description.includes("数组")) {
        if (!Array.isArray(eventValue)) {
          return `规则检查失败: ${eventName}必须是数组（flat-array格式） - ${rule.description}`;
        }
        return null;
      }

      return null;
    }

    default:
      return null;
  }
}

/** 将任意值转为可搜索的字符串（对象用 JSON 序列化） */
function valueToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  // 对象和数组用 JSON 序列化，这样 "$varName" 等字符串内容可以被搜索到
  return JSON.stringify(value);
}

/** 截断字符串用于错误信息 */
function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen) + "...";
}
