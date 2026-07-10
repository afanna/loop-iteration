# 4.4.4 变量体系 — 模型亲和性评估

## 1. 设计背景

### 1.1 为什么评估变量体系

变量引用是动态 UI 的基础能力。在鸿蒙 A2UI 协议中，一个组件可能需要同时引用：

- **全局系统变量**（窗口尺寸、断点、颜色模式）做响应式布局
- **DataModel 数据**（用户信息、商品列表、表单数据）填充 UI 内容
- **事件上下文参数**（点击坐标、输入文本、组件 ID）响应用户交互
- **as 绑定的局部变量**（验证结果、查询结果）在行为链中传递
- **循环内置变量**（当前项、当前索引）在列表模板中迭代

这些变量来源于不同的作用域，使用不同的引用语法，存在同名冲突的可能。变量体系的设计直接影响 LLM 能否"一次性写对"——这决定了代码生成场景的生产可用性。

### 1.2 整合评估的动机

在此之前，#1（变量引用方式）、#8（列表循环变量）、#15（三层变量模型）、#19（DataModel 表达式访问）从不同角度评估了变量体系的子集，存在大量重叠：

| 旧设计点 | 覆盖维度 | 痛点 |
|----------|---------|------|
| #1 变量引用 | shadowing vs explicit 策略、数据访问方式 | 仅评估了两两对比，未覆盖完整体系 |
| #8 列表循环 | 相对路径变量、componentId 模板引用 | 0-shot 0%，需要 few-shot 但协议本身 OK |
| #15 三层变量 | three-layer vs two-layer vs flat 前缀 | 三种方案接近，但 flat 在同名冲突下有隐患 |
| #19 DM 表达式访问 | `$xxx` vs `$__DataModel.xxx` vs `$data.xxx` | 零失败，但同名冲突在 direct 方案下有语义歧义 |

本评估以协议 4.4.4 为基准，将这些维度整合为一个完整的单方案验证，用 56 个用例一次覆盖全部场景。

### 1.3 与原始协议的关系：两项设计修改

本评估验证的变量体系对原始鸿蒙 A2UI 协议做了**两项修改**。

#### 修改 1（核心）：行为结果变量 — `as` 命名绑定替换 `$handlerResult["id"]`

原始协议 4.3.2 节定义 Handler 接口，通过 `id` 字段标识行为，后续行为用 `$handlerResult["handlerId"]` 引用前置行为的返回值：

```json
// 原始协议：通过 handlerId 索引引用
[
  {"id": "validate",     "call": "validateForm"},
  {"id": "submit",       "call": "submitData",   "condition": "{{ $handlerResult[\"validate\"] == 0 }}"},
  {"id": "notify_error", "call": "sendToLLM",    "condition": "{{ $handlerResult[\"validate\"] != 0 }}"}
]
```

本评估提出 **`as` 命名绑定方案**：Handler 新增 `as` 字段，将行为返回值绑定为具名局部变量，后续行为通过 `$varName` 引用：

```json
// as 绑定方案：通过变量名引用
[
  {"call": "validate", "as": "validResult"},
  {"call": "submitData",   "condition": "{{ $validResult == 0 }}"},
  {"call": "sendToLLM",    "condition": "{{ $validResult != 0 }}"}
]
```

**修改动机**：
- `$handlerResult["validate"]` 使用字符串键索引，是两层语法嵌套（`$handlerResult` + `["id"]`），对 LLM 认知负担高
- `$validResult` 是扁平变量引用，与 `$name`、`$index`、`$context` 等局部变量语法一致，降低 LLM 在不同变量类型间切换语法的认知成本
- `as` 语义明确（"将结果绑定为 X"），是编程语言中常见的模式

本评估验证了 `as` 方案的模型亲和性：**T4 行为链变量 10/10 双模型 100% 通过**，包括多步链式调用、条件分支、对象属性嵌套访问、多事件独立作用域等场景。详见第 3.5 节的设计决策分析。

#### 修改 2（配套）：Handler 接口简化

`as` 方案引入后，Handler 的 `id` 字段降级为可选（仅 break 等无需引用结果的行为需要 id，其他行为的引用通过 `as` 变量名完成）。Handler 接口从：

```
interface Handler {
  id: string;              // 原始：必须，用于 handlerResult 引用
  call: string;
  args: any;
  condition?: string;
}
```

变为：

```
interface Handler {
  id?: string;             // 可选：仅在需要 handlerResult 引用时使用
  call: string;
  as?: string;             // 新增：将返回值绑定为局部变量名
  args?: any;
  condition?: string;
}
```

#### 同时发现的协议文档问题（详见 `GAP-024` `GAP-025` `GAP-026`）

评估过程中还确认了 EBNF 文法（4.4.8 节）与正文（4.4.4 节）的变量命名不一致：

| 变量含义 | 正文用法（4.4.4） | EBNF 文法（4.4.8） |
|----------|------------------|-------------------|
| 数据模型 | `$__DataModel` | `$dataModel` |
| 窗口断点 | `$__WidthBreakpoint` | `$windowBreakpoint` |
| 行为结果 | `$handlerResult["id"]` | `$ActionResult["id"]` |

本评估验证了正文的 `$__` 方案对 LLM 亲和性达到 A+（95.1%），建议修正 EBNF 文法以与正文一致。

---

## 2. 完整变量体系设计

协议 4.4.4 定义的变量体系使用 **前缀分层** 策略，通过不同的前缀约定天然区分变量来源，LLM 无需理解运行时作用域链查找规则：

```
全局变量：     $__Xxx（双下划线前缀）
DataModel：    $__DataModel.xxx.yyy（双下划线前缀）
局部变量：     $xxx（无前缀，默认解析）
  ├── 相对路径： $fieldName（列表模板当前项字段）
  ├── 循环内置： $index、$item
  ├── 自定义循环：$customName（通过 indexVar/itemVar）
  ├── as 绑定：  $varName（通过 as 字段）
  └── 事件参数： $context
```

下面逐类详述，每个变量类别都配有完整的使用场景和代码示例。

### 2.1 全局系统变量（`$__Xxx`）

协议提供 4 个全局响应式变量，使用 `$__` 双下划线前缀。当变量值发生变化时，依赖它的表达式自动重新计算。

| 变量名 | 类型 | 说明 | 典型值 |
|--------|------|------|--------|
| `$__WidthBreakpoint` | string | 窗口断点枚举 | `"sm"`, `"md"`, `"lg"`, `"xl"` |
| `$__WindowSize` | object | 窗口尺寸 | `{width: 390, height: 844}` |
| `$__ColorMode` | string | 深浅色模式 | `"light"`, `"dark"` |
| `$__DataModel` | object | 数据模型根对象 | 取决于应用数据 |

**场景 1：响应式字体大小**

根据窗口断点动态设置字体，小屏 18vp、中屏 24vp、大屏 32vp：

```json
{
  "id": "title",
  "component": "Extended.Text",
  "content": "{{ $__DataModel.articleTitle }}",
  "styles": {
    "fontSize": "{{ $__WidthBreakpoint == 'sm' ? 18 : $__WidthBreakpoint == 'md' ? 24 : 32 }}"
  }
}
```

**场景 2：暗色模式适配**

根据系统颜色模式切换文字颜色：

```json
{
  "id": "body_text",
  "component": "Extended.Text",
  "content": "{{ $__DataModel.content }}",
  "styles": {
    "fontColor": "{{ $__ColorMode == 'dark' ? '#FFFFFF' : '#000000' }}"
  }
}
```

**场景 3：多全局变量组合判断**

同时使用断点和窗口宽度决定布局间距：

```json
{
  "id": "root",
  "component": "Extended.Column",
  "styles": {
    "padding": "{{ $__WidthBreakpoint == 'sm' || $__WindowSize.width < 400 ? 8 : 16 }}"
  }
}
```

### 2.2 DataModel 数据访问

#### 2.2.1 绝对路径（`$__DataModel.xxx.yyy`）

从数据模型根节点开始的全局引用，始终获取同一份数据，不受当前组件作用域影响。使用 `.` 或 `['key']` 访问属性。

**场景 4：组件属性中显示 DataModel 数据**

```json
{
  "id": "greeting",
  "component": "Extended.Text",
  "content": "{{ 'Hello, ' + $__DataModel.user.name + '!' }}"
}
```

**场景 5：方括号访问含特殊字符的属性名**

```json
{
  "id": "config_display",
  "component": "Extended.Text",
  "content": "{{ $__DataModel.config['api.endpoint'] }}"
}
```

**场景 6：数组索引 + 表达式组合**

```json
{
  "id": "user_age",
  "component": "Extended.Text",
  "content": "{{ $__DataModel.users[$index].age }}"
}
```

**场景 7：模板字符串中嵌入 DataModel**

```json
{
  "id": "info",
  "component": "Extended.Text",
  "content": "{{ '用户 ' + $__DataModel.user.name + '，年龄 ' + $__DataModel.user.age }}"
}
```

#### 2.2.2 相对路径（`$fieldName`）

在列表模板中，使用 `$fieldName` 直接引用当前迭代项的字段，无需 `$item.` 前缀。

**为什么是 `$name` 而不是 `$item.name`？**

这是 A2UI 协议的独特设计。`$item` 是一个可选的显式用法（`$item.name` 等价于 `$name`），而 `$name` 直接展开为当前项的 `name` 字段。这种设计减少了模板内的冗余前缀，但对 LLM 来说不是训练数据中的常见模式，**0-shot 准确率仅为 0-10%**，需要 1-3 个 few-shot 示例引导（详见第 5.2 节）。

**场景 8：最简列表 — 相对路径显示字段**

用户列表，每项显示 name：

```json
[
  {
    "component": "Extended.List",
    "id": "user_list",
    "children": {
      "path": "/users",
      "componentId": "user_template"
    }
  },
  {
    "id": "user_template",
    "component": "Extended.Text",
    "content": "{{ $name }}"
  }
]
```

**场景 9：多字段 + 内置变量 + 绝对路径混合**

评论列表，同时使用相对路径（`$text`、`$author`）、绝对路径（`$__DataModel.currentUser.name`）：

```json
[
  {
    "component": "Extended.List",
    "id": "comment_list",
    "children": {
      "path": "/comments",
      "componentId": "comment_template"
    }
  },
  {
    "id": "comment_template",
    "component": "Extended.Column",
    "children": ["author_line", "comment_body"]
  },
  {
    "id": "author_line",
    "component": "Extended.Text",
    "content": "{{ $__DataModel.currentUser.name + ' replied to ' + $author }}"
  },
  {
    "id": "comment_body",
    "component": "Extended.Text",
    "content": "{{ $text }}"
  }
]
```

**场景 10：自定义循环变量名（itemVar / indexVar）**

使用 `itemVar` 和 `indexVar` 自定义变量名，适用于嵌套列表或语义化命名：

```json
[
  {
    "component": "Extended.List",
    "id": "product_list",
    "children": {
      "path": "/products",
      "componentId": "product_template",
      "indexVar": "idx",
      "itemVar": "product"
    }
  },
  {
    "id": "product_template",
    "component": "Extended.Text",
    "content": "{{ ($idx + 1) + '. ' + $product.name + ' ¥' + $product.price }}"
  }
]
```

**场景 11：嵌套列表 — 外层自定义变量 + 内层默认变量**

班级列表嵌套学生列表，外层用 `classInfo`，内层用默认 `$name`：

```json
[
  {
    "component": "Extended.List",
    "id": "class_list",
    "children": {
      "path": "/classes",
      "componentId": "class_template",
      "indexVar": "classIdx",
      "itemVar": "classInfo"
    }
  },
  {
    "id": "class_template",
    "component": "Extended.Column",
    "children": ["class_title", "student_list"]
  },
  {
    "id": "class_title",
    "component": "Extended.Text",
    "content": "班级 {{ ($classIdx + 1) + ': ' + $classInfo.name }}"
  },
  {
    "id": "student_list",
    "component": "Extended.List",
    "children": {
      "path": "/students",
      "componentId": "student_template"
    }
  },
  {
    "id": "student_template",
    "component": "Extended.Text",
    "content": "{{ $classIdx + 1 }}班 - 学生{{ ($index + 1) + ': ' + $name }}"
  }
]
```

### 2.3 行为链变量

在交互行为的 action 链中，有三种变量来源。

#### 2.3.1 as 绑定（局部变量）

行为执行后，通过 `as` 字段将返回值绑定为局部变量，后续行为通过 `$varName` 引用。as 变量作用域覆盖整个事件的行为链（该事件的所有行为完成后释放）。

**场景 12：简单 as 绑定 — 验证 + 条件执行**

点击按钮，先验证表单，根据结果决定是否提交：

```json
{
  "id": "submit_btn",
  "component": "Extended.Button",
  "label": "提交",
  "listeners": {
    "onClick": [
      {
        "id": "validate_form",
        "call": "validate",
        "as": "validResult",
        "args": {"data": "{{ $__DataModel.formData }}"}
      },
      {
        "id": "do_submit",
        "call": "submitData",
        "condition": "{{ $validResult == 0 }}",
        "args": {"data": "{{ $__DataModel.formData }}"}
      },
      {
        "id": "show_error",
        "call": "sendToLLM",
        "condition": "{{ $validResult != 0 }}",
        "args": {"value": "验证失败"}
      }
    ]
  }
}
```

**场景 13：as 绑定对象属性的嵌套访问**

行为返回对象时，通过 `.` 访问嵌套属性：

```json
{
  "id": "check_btn",
  "component": "Extended.Button",
  "label": "检查用户",
  "listeners": {
    "onClick": [
      {
        "id": "check_user",
        "call": "checkUser",
        "as": "userResult"
      },
      {
        "id": "next",
        "call": "nextStep",
        "condition": "{{ $userResult.data.valid == true }}"
      }
    ]
  }
}
```

**场景 14：多步链式调用**

三步串联：验证→处理→通知，每步可带条件：

```json
{
  "id": "three_step_btn",
  "component": "Extended.Button",
  "label": "三步操作",
  "listeners": {
    "onClick": [
      {
        "id": "step1",
        "call": "validate",
        "as": "vResult"
      },
      {
        "id": "step2",
        "call": "process",
        "condition": "{{ $vResult == 0 }}",
        "as": "pResult"
      },
      {
        "id": "step3",
        "call": "sendToLLM",
        "condition": "{{ $vResult == 0 && $pResult == 0 }}",
        "args": {"value": "操作成功"}
      }
    ]
  }
}
```

**场景 15：as 变量在 args 中传递**

as 绑定的值不仅可以用于 condition，也可以在后续行为的 args 中传递：

```json
{
  "id": "lookup_btn",
  "component": "Extended.Button",
  "label": "查询",
  "listeners": {
    "onClick": [
      {
        "id": "do_lookup",
        "call": "lookup",
        "as": "lookupResult"
      },
      {
        "id": "send_result",
        "call": "sendToLLM",
        "args": {"value": "{{ $lookupResult }}"}
      }
    ]
  }
}
```

#### 2.3.2 $context 事件参数

每个交互事件触发时，框架注入当前事件上下文的元信息。`$context` 提供：

| 属性 | 说明 |
|------|------|
| `$context.eventData` | 事件携带的数据（如 onClick 的点击坐标、onChange 的输入文本） |
| `$context.componentId` | 触发事件的组件 ID |

**场景 16：TextInput onChange 获取输入文本**

```json
{
  "id": "name_input",
  "component": "Extended.TextInput",
  "listeners": {
    "onChange": [
      {
        "id": "handle_input",
        "call": "validateInput",
        "as": "inputResult",
        "args": {
          "text": "{{ $context.eventData.text }}",
          "componentId": "{{ $context.componentId }}"
        }
      },
      {
        "id": "update_form",
        "call": "updateForm",
        "condition": "{{ $inputResult == 0 && $__DataModel.formEnabled }}"
      }
    ]
  }
}
```

#### 2.3.3 as + $context + DataModel 三者混合

**场景 17：同一行为链中三类变量共存**

这是一个完整的行为链示例，同时使用 as 局部变量、`$context` 事件参数、`$__DataModel` 数据模型变量：

```json
{
  "id": "action_btn",
  "component": "Extended.Button",
  "label": "操作",
  "listeners": {
    "onClick": [
      {
        "id": "step_validate",
        "call": "validate",
        "as": "vR",
        "args": {
          "componentId": "{{ $context.componentId }}"
        }
      },
      {
        "id": "step_submit",
        "call": "submitData",
        "condition": "{{ $vR == 0 && $__DataModel.user.canEdit }}",
        "args": {
          "data": "{{ $__DataModel.formData }}"
        }
      },
      {
        "id": "step_error",
        "call": "sendToLLM",
        "condition": "{{ $vR != 0 }}",
        "args": {
          "value": "{{ '组件 ' + $context.componentId + ' 验证失败' }}"
        }
      }
    ]
  }
}
```

**场景 18：多事件独立作用域**

不同事件（onClick、onAppear）的 as 变量互不影响，各自有独立的作用域：

```json
{
  "id": "multi_event_btn",
  "component": "Extended.Button",
  "label": "按钮",
  "listeners": {
    "onClick": [
      {
        "id": "click_handler",
        "call": "validate",
        "as": "clickResult"
      },
      {
        "id": "click_next",
        "call": "sendToLLM",
        "condition": "{{ $clickResult == 0 }}"
      }
    ],
    "onAppear": [
      {
        "id": "init_check",
        "call": "checkInit",
        "as": "initResult"
      },
      {
        "id": "set_initial",
        "call": "setDataModel",
        "condition": "{{ $initResult == 0 }}"
      }
    ]
  }
}
```

注意：`clickResult` 只在 onClick 行为链内有效，`initResult` 只在 onAppear 行为链内有效。两者互不干扰。

---

## 3. 从旧设计点继承的核心设计决策

以下四个决策在 #1/#8/#15/#19 中分别评估，在整合评估中收敛为最终设计。下面逐一追溯每个决策的背景、候选方案、评估发现和最终选择。

### 3.1 决策 1：变量层级前缀策略（来自 #15 three-layer-variable）

**背景**：局部变量（as 绑定）、DataModel 数据、内置全局变量三种来源并存。用什么前缀体系让 LLM 能正确区分？

**三种候选方案**：

| 方案 | 局部变量 | DataModel | 全局变量 | 层级数 |
|------|---------|-----------|---------|--------|
| three-layer | `$xxx` | `$__DataModel.xxx` | `$__WindowSize` | 3 |
| two-layer | `$xxx` | `$data.xxx` | `$data.windowSize` | 2 |
| flat | `$xxx` | `$xxx` | `$xxx` | 1 |

**#15 评估结论**（DeepSeek / GLM）：

| 方案 | MA (DS/GLM) | 结论 |
|------|-------------|------|
| three-layer | 94.2% / 90.6% (A+) | **推荐**：前缀天然区分，GLM 上 MA 最高 |
| two-layer | 94.2% / 83.8% (A) | GLM 上显著落后，`$data` 前缀造成混淆 |
| flat | 93.6% / 87.0% (A) | 简洁但无冲突防护，依赖命名约定 |

**最终选择：three-layer**。统一使用 `$__` 双下划线前缀区分全局变量和 DataModel（`$__DataModel`、`$__WidthBreakpoint`、`$__WindowSize`、`$__ColorMode`），局部变量使用无前缀的 `$xxx`。

**关键洞察**：DeepSeek 三种方案几乎无差异（MA 94.2% vs 94.2% vs 93.6%），但 GLM 对前缀区分敏感 — two-layer 的 `$data` 前缀反而不如 `$__DataModel` 直观。`$__` 前缀更能"提醒"LLM 这是一个特殊的全局变量。

### 3.2 决策 2：行为链中 DataModel 的引用方式（来自 #19 datamodel-expr-access）

**背景**：在行为链的 `condition` 和 `args` 表达式中，如何引用 DataModel 数据？直接 `$xxx` 还是显式 `$__DataModel.xxx`？

**候选方案**：

| 方案 | DataModel 引用 | 局部变量 | 同名冲突 |
|------|---------------|---------|---------|
| A: direct | `$user.name` | `$validResult` | `$count` 无法区分局部/全局 |
| B: explicit-datamodel | `$__DataModel.user.name` | `$validResult` | 前缀天然区分 |
| C: data-prefix | `$data.user.name` | `$validResult` | 前缀区分但 GLM 稳定性不足 |

**#19 评估结论**：三种方案 MA 几乎无差异（双模型平均 97.4%-98.3%），零失败。但关键差异在**同名冲突场景的语义正确性**：

```json
// DataModel 中有 count 字段，as 绑定变量名也是 count
// 方案 A：两个 $count 指向同一变量，运行时语义歧义
"condition": "{{ $count == 0 && $count > 3 }}"

// 方案 B：$count 是局部变量，$__DataModel.count 是全局数据，明确区分
"condition": "{{ $count == 0 && $__DataModel.count > 3 }}"
```

**最终选择：explicit-datamodel（方案 B）**。虽然方案 A 也达到了 A+，但在同名冲突场景下存在运行时语义歧义 — LLM 生成的表达式虽然语法正确，但两个 `$count` 指向同一变量。方案 B 通过前缀天然消除歧义。

### 3.3 决策 3：$fieldName vs $item.fieldName 模板变量引用（来自 #8 list-loop-variable，结论已修正）

**背景**：A2UI 协议使用 `$name` 而非 `$item.name` 作为列表模板中的变量引用。这种"隐式字段展开"对 LLM 是否亲和？

**#8 评估旧结论**：0-shot 0-10%，3-shot 80-90%，判定为"可学习，非设计缺陷，few-shot 即可解决"。

**整合评估修正后的发现**：**#8 结论被推翻。** 完整对比验证（61 例，双模型，3-shot）表明：

| 指标 | $fieldName | $item.fieldName | 差距 |
|------|-----------|----------------|------|
| DS MA | 92.5% | **98.0%** | +5.5% |
| GLM MA | 90.4% | **97.0%** | +6.6% |
| DS T3 通过率 | 81.0% (17/21) | **100% (21/21)** | +19% |
| GLM T3 通过率 | 71.4% (15/21) | **100% (21/21)** | +28.6% |
| DS 总通过 | 88.5% (54/61) | **100% (61/61)** | +11.5% |
| GLM 总通过 | 83.6% (51/61) | **100% (61/61)** | +16.4% |

**失败根因 100% 相同**：LLM 生成了 `$item.name` 等通用语法，验证规则要求 `$name`（协议特有语法），LLM 输出语义正确但被判定失败。

```
LLM 输出:  {"content": "{{ $item.name }}"}     ← 语义完全正确
验证要求:  输出包含 "$name"                       ← FAIL
```

**为什么 3-shot 也无法根除**：`$item.name` 是 JavaScript/Vue/Handlebars/Jinja2/Django/Blade/EJS 等所有主流模板语言的通用模式。$name 隐式展开是 A2UI 独有设计。3-shot 示例可以在多数情况下覆盖训练惯性，但模型在生成时仍会在"示例中的特有语法"和"训练数据中的通用模式"之间振荡——任何数量的 few-shot 都无法根除这种认知冲突。

**最终选择：$item.fieldName 替换 $fieldName**。让协议语法与 LLM 训练数据中的通用模式同向叠加，而非对抗。改动仅影响默认相对路径，自定义 itemVar（`$product.name` 等）不受影响。所有支持模板渲染的容器（List/Grid/Column/Row/GridRow/Tabs）使用统一的 `$item.fieldName` 语法。双模型 122/122 零失败。

### 3.4 决策 4：表达式字段中 DataModel 的访问（来自 #1 variable-reference）

**背景**：#1 发现表达式字段（content、styles 等）和行为链（condition、args）是两个不同的场景。在表达式字段中不存在 as 绑定，加前缀是冗余。那 `$__DataModel.xxx` 在表达式字段中是否必要？

**#1 评估结论**：表达式字段中 `$xxx` 直接引用与 `$data.xxx` 显式前缀在 DeepSeek 上 D1-D5 完全一致（100%），差异仅在 D6 一致性上（`$xxx`: 92% vs `$data.xxx`: 78%）。

| 决策点 | 推荐方案 | MA 范围 | 理由 |
|--------|---------|---------|------|
| Action 链中 DataModel 引用 | `$__DataModel.xxx` | DS 95.4% / GLM 90.9% | 与 as 变量 `$xxx` 区分，避免同名冲突 |
| 表达式字段中 DataModel 引用 | 无强制偏好 | DS 99.2% / GLM 96.4% | 无冲突场景，前缀冗余，两种写法均可 |

**整合后的策略**：协议 4.4.4 统一使用 `$__DataModel.xxx` 作为全场景推荐。在表达式字段中虽然 `$xxx` 也可行（无 as 绑定冲突），但统一使用 `$__DataModel.xxx` 有助于减少 LLM 在不同上下文中切换语法的认知负担。

### 3.5 决策 5：as 命名绑定 vs handlerResult 索引引用（本评估新增）

**背景**：原始协议 4.3.2 节使用 `$handlerResult["handlerId"]` 引用前置行为结果。本评估提出用 `as` 命名绑定替代，需要验证 LLM 对新方案的亲和性。

**两种方案对比**：

```json
// 方案 H: handlerResult 索引引用（原始协议）
[
  {"id": "validate",  "call": "validateForm", "args": {"data": "{{ $__DataModel.formData }}"}},
  {"id": "submit",    "call": "submitData",   "condition": "{{ $handlerResult[\"validate\"] == 0 }}"},
  {"id": "error",     "call": "sendToLLM",    "condition": "{{ $handlerResult[\"validate\"] != 0 }}"}
]

// 方案 A: as 命名绑定（本评估验证）
[
  {"call": "validate", "as": "validResult", "args": {"data": "{{ $__DataModel.formData }}"}},
  {"call": "submitData",   "condition": "{{ $validResult == 0 }}"},
  {"call": "sendToLLM",    "condition": "{{ $validResult != 0 }}"}
]
```

**设计分析**：

| 维度 | handlerResult（原始） | as 绑定（新方案） |
|------|----------------------|-------------------|
| 引用语法 | `$handlerResult["id"]` | `$varName` |
| 语法复杂度 | 两层：变量 + 字符串键索引 | 一层：变量名直接引用 |
| 与其他变量一致性 | 独特语法，区别于 `$name`/`$index`/`$context` | 与 `$name`/`$index`/`$context` 语法统一 |
| LLM 认知负担 | 高：需理解 `$handlerResult` 是什么、`["id"]` 键索引机制 | 低：赋值→引用的通用编程模式 |
| 命名自由度 | 无：必须用 handler ID 字符串索引 | 有：as 可自由命名，`$validResult` 语义更清晰 |
| Handler.id 角色 | 必须：用于 handlerResult 索引 | 可选：仅需被其他 handlerResult 引用时保留 |

**为何更好的亲和性预期**：

1. **语法一致性**：LLM 在列表中使用 `$name`、在行为链中使用 `$validResult`——语法模式完全相同（`$` + 标识符），无需在不同上下文切换引用语法
2. **减少嵌套**：`$handlerResult["validate"]` 是 `$` + 对象名 + `["key"]` 三层嵌套；`$validResult` 只有 `$` + 变量名两层
3. **语义明确**：`as: "validResult"` 直接声明"将此行为结果绑定为名为 validResult 的变量"，是主流编程语言（JS 解构、Python as、Swift 模式匹配）中的常见模式

**验证结果**：

本评估在 T4 行为链变量（10 用例）+ T5 同名冲突（10 用例）+ T6 混合场景（6 用例）中全面验证了 `as` 方案的 LLM 亲和性：

| 验证场景 | DeepSeek | GLM | 结论 |
|----------|----------|-----|------|
| 简单 as 绑定 + 条件引用 | 通过 | 通过 | LLM 能正确使用 `as` + `$varName` |
| as 对象属性嵌套访问 (`$var.prop.nested`) | 通过 | 通过 | 点号链式访问正确 |
| as 在 args 中传递 | 通过 | 通过 | LLM 理解 as 变量作用域覆盖整个行为链 |
| 多步链式调用（3+ 步 as 串联） | 通过 | 通过 | 顺序依赖正确，后步引用前步 as |
| 条件分支（成功/失败双路径） | 通过 | 通过 | 互斥 condition 正确使用 as 变量 |
| 多事件独立 as 作用域 | 通过 | 通过 | 不同事件的 as 变量不交叉污染 |
| as 与 DataModel 同名冲突 | 通过 | 通过 | `$count` vs `$__DataModel.count` 前缀区分 |
| as 与 $context 混合引用 | 通过 | 通过 | 三种变量在同一个 condition 中共存 |

**所有 26 个涉及行为链的用例双模型 100% 通过，零失败。**

**结论**：`as` 命名绑定方案在命名自由度、语法一致性、LLM 认知负担三个维度均优于原始 `$handlerResult["id"]` 方案。建议协议采用 `as` 绑定替换 `$handlerResult` 索引引用。

### 4.1 什么是同名冲突

当 as 绑定的变量名与 DataModel 中的字段同名时，LLM 需要同时引用"新值"（as 结果）和"旧值"（DataModel 字段）。如果语法无法区分两者，就会产生语义歧义。

### 4.2 冲突场景分类

#### 场景 A：as 绑定与 DataModel 字段同名

DataModel 中有 `count` 字段（值为 5）。点击按钮时先调用 `increment`（as 绑定为 `count`），后续行为需要同时判断 as 结果（是否为 0）和原始 DataModel 值（是否 > 3）。

```json
{
  "listeners": {
    "onClick": [
      {
        "id": "do_increment",
        "call": "increment",
        "as": "count"     // ← as 变量名 count 与 DataModel.count 同名
      },
      {
        "id": "check_and_submit",
        "call": "submit",
        "condition": "{{ $count == 0 && $__DataModel.count > 3 }}"
        //              ^^^^^^              ^^^^^^^^^^^^^^^^^^^
        //              局部 as 变量          DataModel 全局变量
        //              通过前缀天然区分！
      }
    ]
  }
}
```

**为何 LLM 能正确生成**：`$count` 和 `$__DataModel.count` 使用不同的前缀，LLM 不需要理解"as 变量遮蔽 DataModel 字段"的运行时规则。前缀体系让变量来源一目了然。

#### 场景 B：as 绑定覆盖前一个 as 绑定

三步行为链中，第二步的 as 绑定与第一步同名，LLM 需要理解"后面的覆盖前面的"：

```json
{
  "listeners": {
    "onClick": [
      {"id": "s1", "call": "validate", "as": "result"},
      {"id": "s2", "call": "process",  "as": "result"},    // ← 覆盖 s1 的 result
      {"id": "s3", "call": "finish",   "condition": "{{ $result == 0 }}"}
      //                                               ^^^^^^^ 引用最近一次 as 绑定的值
    ]
  }
}
```

#### 场景 C：自定义循环变量与 DataModel 字段同名

列表使用 `itemVar="name"`，但 DataModel 也有全局 `name` 字段（如应用名）：

```json
[
  {
    "component": "Extended.List",
    "children": {
      "path": "/users",
      "componentId": "user_template",
      "itemVar": "name"           // ← 自定义变量名是 name
    }
  },
  {
    "id": "user_template",
    "component": "Extended.Text",
    "content": "{{ $name }} — {{ $__DataModel.name }}"
    //           ^^^^^^              ^^^^^^^^^^^^^^^^^^
    //           当前用户名（相对）     应用全局名（绝对）
    //           前缀体系区分两者
  }
]
```

#### 场景 D：嵌套列表多层同名字段

外层班级有 `name`，内层学生也有 `name`：

```json
[
  {
    "component": "Extended.List",
    "children": {
      "path": "/classes",
      "componentId": "class_template",
      "itemVar": "classInfo"       // ← 外层自定义变量名，避免与内层 name 冲突
    }
  },
  {
    "id": "class_template",
    "component": "Extended.Text",
    "content": "{{ $classInfo.name }} 班学生 {{ $name }}"
    //           ^^^^^^^^^^^^^^^^^^^    ^^^^^^
    //           外层班级名（通过自定义变量）  内层学生名（默认相对路径）
  }
]
```

外层使用 `itemVar="classInfo"` 自定义变量名，避免了嵌套列表中的字段名歧义。这是通过变量命名约定而非运行时规则来解决冲突。

#### 场景 E：三类变量同时出现在一个表达式中

```json
{
  "condition": "{{ $status.success && $__DataModel.status == 'active' && $__WidthBreakpoint != 'sm' }}"
  //             ^^^^^^^^^^^^^^^^    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^    ^^^^^^^^^^^^^^^^^^^^^^^^
  //             as 局部变量          DataModel 全局变量                   全局系统变量
  //             无前缀               $__ 前缀                              $__ 前缀
}
```

### 4.3 冲突解决机制总结

```
同名时如何区分？

$xxx              → as 局部变量 / 列表相对路径（无前缀）
$__DataModel.xxx  → DataModel 全局数据（$__ 前缀）
$__WidthBreakpoint → 全局系统变量（$__ 前缀）
$__WindowSize     → 全局系统变量（$__ 前缀）
$__ColorMode      → 全局系统变量（$__ 前缀）
```

**设计原则**：通过前缀在**语法层面**区分变量来源，而非运行时作用域链查找。LLM 不需要理解"先查局部再查全局"的查找顺序，只需要按前缀选择正确的引用语法。

---

## 5. 对协议文档的修正建议

综合本次评估的发现，建议对鸿蒙 A2UI 协议做以下三项修正（按优先级排序）：

### 5.1 模板变量引用：`$item.fieldName` 替换 `$fieldName`（见 1.3 节、3.3 节）**【P0，强烈建议】** → `GAP-042`

- **模板渲染中默认字段访问统一使用 `$item.fieldName` 语法**（如 `$item.name`、`$item.price`、`$item.product.title`）
- **去掉 `$fieldName` 隐式字段引用**：`$name`、`$price` 等写法废弃
- **自定义 itemVar 不受影响**：`$product.name`、`$classInfo.name` 等已使用显式对象前缀，语法模式完全一致
- **适用所有支持模板渲染的容器**：List、Grid、Column、Row、GridRow、Tabs
- **评估验证**：双模型 122/122 零失败，MA 从 91.5% 提升至 97.5%（+6%）。$fieldName 是设计反模式，即使 3-shot 也无法根除 LLM 回落到 $item.name 通用模式的问题

### 5.2 行为结果变量：引入 `as` 命名绑定（见 1.3 节、3.5 节）**【P0，建议采纳】** → `GAP-043`

- **Handler 接口新增 `as?: string` 字段**：将行为返回值绑定为局部变量名
- **新增 `as` 变量引用语法**：后续行为通过 `$varName` 引用（如 `$validResult`、`$userResult.data.valid`）
- **Handler.id 降级为可选**：仅在需要通过 `$handlerResult["id"]` 引用时保留
- **新增局部变量表**：在 4.4.4 节局部变量表中增加 as 绑定变量

### 5.3 EBNF 文法命名统一 → `GAP-024` `GAP-025` `GAP-026`

协议文档 4.4.8 节（EBNF 文法）与 4.4.4 节（正文）存在变量命名不一致：

| 变量含义 | 正文用法（4.4.4） | EBNF 文法（4.4.8） |
|----------|------------------|-------------------|
| 数据模型 | `$__DataModel` | `$dataModel` |
| 窗口断点 | `$__WidthBreakpoint` | `$windowBreakpoint` |
| 行为结果 | `$handlerResult["id"]` | `$ActionResult["id"]` |

**建议**：以正文命名（`$__DataModel`、`$__WidthBreakpoint`、`$handlerResult`）为准，修正 EBNF 文法。本评估验证了 `$__` 方案对 LLM 的亲和性达到 A+（97.5%）。

---

## 6. 测试用例

**总计：61 个测试用例**，按 6 个分类组织。

| 分类 | 文件 | 数量 | ID 范围 | 核心考察点 |
|------|------|------|---------|-----------|
| T1 全局变量 | `t1-global-vars.json` | 6 | VS001-VS006 | `$__WindowSize`/`$__WidthBreakpoint`/`$__ColorMode` 的单用和组合 |
| T2 DataModel 绝对路径 | `t2-datamodel-absolute.json` | 8 | VS007-VS014 | `$__DataModel.xxx.yyy` + 方括号 + 模板字符串 + 算术 |
| T3 模板渲染 | `t3-list-relative.json` | 21 | VS015-VS030, VS057-VS061 | List/Grid/Column/Row 模板、`$item.fieldName`、`$index`、componentId、自定义 itemVar/indexVar、嵌套列表、绝对/相对混合、非列表容器模板 |
| T4 行为链变量 | `t4-action-chain.json` | 10 | VS031-VS040 | as 绑定、`$context`、condition/args、多步链、条件分支、多事件 |
| T5 同名冲突 | `t5-conflict.json` | 10 | VS041-VS050 | as vs DataModel 同名、嵌套列表同名、多层 as 覆盖、三变量同表达式 |
| T6 混合复杂场景 | `t6-mixed-complex.json` | 6 | VS051-VS056 | 全部变量类型同组件、表单+列表+全局自适应、响应式布局+列表+as |

复杂度分布：simple 19, medium 19, complex 23（其中 11 个边界用例标记 `is_edge: true`）。

T3 新增了 5 个**非列表容器模板渲染**用例（VS057-VS061），验证 Column/Row 等容器通过 `{componentId, path}` 做模板渲染时 `$item.fieldName` 的亲和性。

### 各分类代表性用例

<details>
<summary><b>T1 示例：全局变量组合使用（VS004）</b></summary>

任务：生成一个 Extended.Column 组件，padding 根据 `$__WidthBreakpoint` 和 `$__WindowSize.width` 组合设置：sm 断点或宽度 <400 时 padding=8，否则 16。

验证点：同时引用 `$__WidthBreakpoint` 和 `$__WindowSize` 的表达式。
</details>

<details>
<summary><b>T3 示例：嵌套列表+自定义变量（VS022）</b></summary>

任务：生成嵌套 List：外层 `/classes`（itemVar='classInfo'），内层 `/students`。内层模板显示外层 `$classInfo.name` 和内层 `$item.name`。

验证点：外层自定义变量名 `$classInfo` 与内层 `$item.name` 的嵌套作用域区分。
</details>

<details>
<summary><b>T3 非列表模板示例：Column 模板渲染（VS057）</b></summary>

任务：生成 Column 组件，children 使用模板渲染 `{componentId:'user_tpl', path:'/users'}`，模板显示每个用户的 `$item.name`。

验证点：Column 也支持模板渲染 `{componentId, path}` 格式，`$item.fieldName` 语法与 List 一致。
</details>

<details>
<summary><b>T5 示例：as 绑定与 DataModel 同名（VS041）</b></summary>

任务：DataModel 中有 count 字段。点击时先调用 increment(as='count')，然后 condition 判断 `$count==0` 且 `$__DataModel.count>3` 时调用 submit。

验证点：同名场景下 `$count` 和 `$__DataModel.count` 的前缀区分。
</details>

<details>
<summary><b>T6 示例：全场景混合（VS056）</b></summary>

任务：生成完整页面 — Column 布局根据 `$__WindowSize.width` 自适应、Text 显示 `$__DataModel.pageTitle`、List 用 itemVar='product' 显示 `$product.name`/`$product.price`、Button 有 as 绑定、底部 Text 根据 `$__ColorMode` 设置颜色。

验证点：所有七种变量类型在同一个组件树中共存。
</details>

---

## 7. 评估结果

### 7.1 设计对比：$fieldName vs $item.fieldName

本评估包含了原始协议设计（`$fieldName` 隐式相对路径）与改进设计（`$item.fieldName` 显式字段访问）的完整对比验证（61 例，3-shot）。

#### 7.1.1 综合评分对比

| 模型 | 指标 | $fieldName 设计 | $item.fieldName 设计 | 提升 |
|------|------|---------------|---------------------|------|
| **DeepSeek** | MA | 92.5% (A+) | **98.0% (A+)** | **+5.5%** |
| | Phase A | 88.5% (54/61) | **100% (61/61)** | +11.5% |
| **GLM** | MA | 90.4% (A+) | **97.0% (A+)** | **+6.6%** |
| | Phase A | 83.6% (51/61) | **100% (61/61)** | +16.4% |
| **平均** | MA | 91.5% | **97.5%** | **+6.0%** |

#### 7.1.2 分类通过率对比

| 分类 | $fieldName (DS/GLM) | $item.fieldName (DS/GLM) |
|------|--------------------|--------------------------|
| T1 全局变量（6） | 100% / 100% | 100% / 100% |
| T2 DataModel（8） | 100% / 100% | 100% / 100% |
| **T3 模板渲染（21）** | **81.0% / 71.4%** | **100% / 100%** |
| T4 行为链（10） | 100% / 100% | 100% / 100% |
| T5 同名冲突（10） | 100% / 100% | 100% / 100% |
| **T6 混合场景（6）** | **66.7% / 50.0%** | **100% / 100%** |

T1/T2/T4/T5 两种设计无差异（都不涉及模板渲染中的相对路径）。T3 和 T6 的差距完全来自 `$fieldName` 隐式语法导致的 LLM 回落。

#### 7.1.3 非列表模板通过率（VS057-VS061，3-shot）

| ID | 组件 | 场景 | DS $fn | GLM $fn | $item.fn |
|----|------|------|--------|---------|----------|
| VS057 | Column | 简单字段 | XX | XX | OK |
| VS058 | Row | 多字段+$index | OK | OK | OK |
| VS059 | Column | 嵌套对象 | OK | OK | OK |
| VS060 | Column | 条件渲染 | OK | XX | OK |
| VS061 | Column | 混合绝对路径 | OK | OK | OK |

非列表模板 5 例 $fieldName 通过率：DS 80%, GLM 60%。$item.fieldName 100%。

#### 7.1.4 $item.fieldName 六维评分

| 模型 | D1 | D2 | D3 | D4 | D5 | D6 | **MA** |
|------|----|----|----|----|----|----|--------|
| **DeepSeek** | 100% | 100% | 100% | 92.0% | 100% | 92.0% | **98.0% (A+)** |
| **GLM** | 100% | 100% | 100% | 93.3% | 100% | 80.0% | **97.0% (A+)** |

#### 7.1.5 D4 学习曲线（$item.fieldName 设计）

| shot 数 | DeepSeek | GLM |
|---------|----------|-----|
| 0-shot | 86.7% | 86.7% |
| 1-shot | 93.3% | 100.0% |
| 3-shot | 100.0% | 100.0% |

> D4 测试不含 few-shot 示例但含 System Prompt 中的语法规则（Rule 8 告知用 `$item.fieldName`）。0-shot 86.7% 反映的是"仅凭文字指令，模型将通用 `item.property` 模式映射到协议语法"的能力。

#### 7.1.6 失败根因分析

$fieldName 设计的 17 例失败（双模型合计）的根因**100% 相同**：LLM 生成了 `$item.name` 等通用语法，验证规则要求 `$name`，LLM 输出语义正确但被判定失败。

```
LLM 输出:  {"content": "{{ $item.name }}"}     ← 语义完全正确
验证要求:  输出包含 "$name"                       ← FAIL
```

这不是 LLM 的错——`$item.name` 是所有主流编程语言模板语法的标准模式。`$name` 隐式展开是 A2UI 协议独有的设计，与 LLM 训练数据中的通用知识冲突。即使 3-shot 提供的示例也无法完全抑制模型的自然倾向。

### 7.2 D6 一致性

| 指标 | DeepSeek | GLM |
|------|----------|-----|
| 结构一致率 | 92.0% | 80.0% |
| 语义等价率 | 100% | 100% |

D6 语义等价率双模型 100%，结构波动不影响功能正确性。

---

## 8. 与旧设计点对比

| 旧设计点 | 旧 MA | 旧结论 | 整合后结论 |
|----------|-------|--------|-----------|
| #1 变量引用 | A 81-87% | 推荐 explicit (`$data.xxx`) 用于行为链 | $data 前缀被 #15/#19 否决，保留 `$__DataModel`；as 绑定替换 handlerResult |
| #8 列表循环 | A 85% / C 60% | ~~"协议可学习，非设计缺陷"~~ | **结论推翻：$fieldName 是设计反模式**。$item.fieldName 双模型 MA +6%，61/61 零失败 |
| #15 三层变量 | A+ 87-94% | three-layer 最优，保留 `$__` 前缀 | 验证通过，$__ 前缀体系是正确选择 |
| #19 DM 表达式访问 | A+ 97-98% | `$__DataModel.xxx` 在同名冲突下最佳 | 验证通过，$__DataModel 与 as 变量前缀天然区分 |
| **as binding** | — | 新增设计 | T4 行为链 100%, 26/26 通过，替换 $handlerResult |
| **$item.fieldName** | — | 新增设计 | T3 21/21 10, D6 6/6 100%, 双模型 122/122 零失败 |
| **整合后** | — | 61 用例，双模型 100% 零失败 | **MA 97.5% (A+)** |

### #8 结论修正说明

#8 原结论为"相对路径 0-shot 0-10%，需 few-shot 引导，协议设计本身无误"。**此结论已被推翻。** 完整对比验证（61 例，双模型）表明：

- $fieldName 在 3-shot 下仍有 10-17% 失败率，失败模式 100% 相同——LLM 回落至 $item.name 通用模式
- $item.fieldName 双模型 122/122 零失败，MA 从 91.5% 提升至 97.5%（+6%）
- 根因不是"学习门槛"，而是"设计反模式"——$fieldName 与 LLM 训练数据中所有主流模板语言的 item.property 模式冲突
- **任何数量的 few-shot 都无法根除这种冲突**，因为模型在生成时会在训练数据模式和协议特有语法之间振荡
- **正确做法：去掉协议特有语法，使用通用模式 $item.fieldName**，让协议设计与模型训练数据同向而非对抗

---

## 9. 结论

**4.4.4 变量体系（含 as 绑定 + $item.fieldName 方案）达到 A+ 级亲和性（MA 97.5%），双模型 122/122 零失败，建议协议采纳。**

具体结论：

1. **`$item.fieldName` 替换 `$fieldName`**（强烈建议）：`$fieldName` 隐式字段访问是与 LLM 训练数据冲突的设计反模式。即使 3-shot 仍导致 10-17% 失败率，失败模式 100% 相同——模型回落到 `$item.name` 通用模式。改为 `$item.fieldName` 后双模型 122/122 零失败，MA +6%。此模式适用于所有支持模板渲染的容器（List/Grid/Column/Row/GridRow/Tabs），非列表模板（VS057-VS061）同样 100% 通过。

2. **as 命名绑定替换 `$handlerResult["id"]`**（建议采纳）：`$validResult` 与 `$item.name`、`$index`、`$context` 语法完全统一，LLM 无需在 `$handlerResult["id"]` 这种独特语法和普通变量引用之间切换。26 个涉及行为链的用例 100% 通过。

3. **`$__` 前缀体系是正确选择**：`$__DataModel.xxx` 与 `$xxx` 的前缀区分让 LLM 在语法层面就能分辨变量来源，无需理解运行时遮蔽规则。所有 10 个同名冲突用例全部通过。

4. **全局变量无歧义**：`$__WidthBreakpoint`、`$__WindowSize`、`$__ColorMode` 的使用模式被 LLM 完全掌握，0-shot 即可正确使用。

5. **协议文档需同步修正**（详见第 5 节，按优先级）：
   - P0 `GAP-042` $item.fieldName 替换 $fieldName：模板渲染统一使用显式字段访问语法
   - P0 `GAP-043` as 绑定替换 handlerResult：Handler 接口新增 `as` 字段，id 降级为可选
   - 4.4.4 节局部变量表新增 as 绑定变量
   - `GAP-024` `GAP-025` `GAP-026` EBNF 文法统一为正文命名

---

## 10. 如何运行

```bash
cd eval
npm install

# 完整评估（双模型）
npm run eval:variable-system

# 仅运行特定模型
ONLY_MODEL=deepseek npm run eval:variable-system
ONLY_MODEL=glm npm run eval:variable-system

# 自定义报告目录
REPORTS_DIR=/path/to/reports npm run eval:variable-system
```

报告输出至 `reports/` 目录（JSON + Markdown）。

### 运行过的报告

| 报告 | 模型 | 设计 | 用例数 | 日期 |
|------|------|------|--------|------|
| `variable-system-deepseek-2026-05-01T06-52-16.json` | DeepSeek | $item.fieldName | 61 | 2026-05-01 |
| `variable-system-glm-2026-05-01T08-39-59.json` | GLM-5.1 | $item.fieldName | 61 | 2026-05-01 |
| `variable-system-deepseek-2026-05-01T07-01-06.json` | DeepSeek | $fieldName (对比) | 61 | 2026-05-01 |
| `variable-system-glm-2026-05-01T07-06-21.json` | GLM-5.1 | $fieldName (对比) | 61 | 2026-05-01 |
| `variable-system-deepseek-2026-04-30T10-10-04.json` | DeepSeek | $fieldName (初版) | 56 | 2026-04-30 |
| `variable-system-glm-2026-04-30T07-34-52.json` | GLM-5.1 | $fieldName (初版) | 56 | 2026-04-30 |
