import type { TestCase } from "../core/types.js";

const FEW_SHOT_EXAMPLES: Record<string, string> = {
  expression: [
    "## 参考示例",
    "",
    "示例1 - 简单变量引用：",
    '输入："生成一个Text组件，显示用户名$user.name"',
    "输出：",
    '{"component": "Text", "content": "{{ $user.name }}"}',
    "",
    "示例2 - 字符串拼接：",
    '输入："生成一个Text组件，显示\'你好，用户名\'"',
    "输出：",
    '{"component": "Text", "content": "{{ \'你好，\' + $user.name }}"}',
    "",
    "示例3 - 样式动态值：",
    '输入："生成一个Text组件内容为\'价格\'，字号动态设置为$config.fontSize"',
    "输出：",
    '{"component": "Text", "content": "价格", "styles": {"fontSize": "{{ $config.fontSize }}"}}',
  ].join("\n"),

  event: [
    "## 参考示例",
    "",
    "示例1 - 简单点击事件：",
    '输入："生成一个Button组件，标签为\'提交\'，点击执行submit"',
    "输出：",
    '{"component": "Button", "label": "提交", "onClick": [{"call": "submit"}]}',
    "",
    "示例2 - 条件执行：",
    '输入："生成一个Button，标签\'提交\'，先validate绑定到isValid，isValid为true时submit"',
    "输出：",
    '{"component": "Button", "label": "提交", "onClick": [{"call": "validate", "as": "isValid", "args": {"data": "$form"}}, {"call": "submit", "condition": "{{ $isValid }}"}]}',
    "",
    "示例3 - 分支逻辑：",
    '输入："生成一个Button，标签\'查看\'，loggedIn为true时showProfile否则navigate到/login"',
    "输出：",
    '{"component": "Button", "label": "查看", "onClick": [{"call": "showProfile", "condition": "{{ $loggedIn }}"}, {"call": "navigate", "condition": "{{ !$loggedIn }}", "args": {"componentId": "main_nav", "targetComponentId": "login_page"}}]}',
  ].join("\n"),

  layout: [
    "## 参考示例",
    "",
    "示例1 - Column垂直布局：",
    '输入："生成一个Column组件，包含header和body两个子组件"',
    "输出：",
    '{"component": "Column", "children": ["header", "body"]}',
    "",
    "示例2 - If条件布局：",
    '输入："生成一个If组件，条件$hasData，有数据显示dataList否则显示emptyTip"',
    "输出：",
    '{"component": "If", "condition": "{{ $hasData }}", "childrenIf": ["dataList"], "childrenElse": ["emptyTip"]}',
    "",
    "示例3 - List模板渲染：",
    '输入："生成一个List组件，用模板productItem渲染$products数组，间距12"',
    "输出：",
    '{"component": "List", "children": {"componentId": "productItem", "path": "$products"}, "space": 12}',
    "",
    "示例4 - Grid网格布局：",
    '输入："生成一个Grid组件，包含card1和card2，两列等宽，列间距12"',
    "输出：",
    '{"component": "Grid", "children": ["card1", "card2"], "styles": {"columnsTemplate": "1fr 1fr", "columnsGap": 12}}',
  ].join("\n"),

  component: [
    "## 参考示例",
    "",
    "示例1 - Text使用主题：",
    '输入："生成一个Text组件，内容\'页面标题\'，使用heading1主题"',
    "输出：",
    '{"component": "Text", "content": "页面标题", "theme": "heading1"}',
    "",
    "示例2 - 主题+样式覆盖：",
    '输入："生成一个Text组件，内容\'品牌标题\'，heading1主题，字体颜色改为#007AFF"',
    "输出：",
    '{"component": "Text", "content": "品牌标题", "theme": "heading1", "styles": {"fontColor": "#007AFF"}}',
    "",
    "示例3 - Button+主题+事件：",
    '输入："生成一个Button组件，标签\'确定\'，buttonPrimary主题，点击执行confirm"',
    "输出：",
    '{"component": "Button", "label": "确定", "theme": "buttonPrimary", "onClick": [{"call": "confirm"}]}',
  ].join("\n"),

  mixed: [
    "## 参考示例",
    "",
    "示例1 - TextInput+表达式+事件：",
    '输入："生成一个TextInput组件，text绑定$username，placeholder\'输入用户名\'，onChange时调用updateField"',
    "输出：",
    '{"component": "TextInput", "text": "{{ $username }}", "placeholder": "输入用户名", "onChange": [{"call": "updateField"}]}',
    "",
    "示例2 - 动态文本+动态样式：",
    '输入："生成一个Text组件显示$score，$score>60时字体绿色#00AA00否则红色#FF0000"',
    "输出：",
    '{"component": "Text", "content": "{{ $score }}", "styles": {"fontColor": "{{ $score > 60 ? \'#00AA00\' : \'#FF0000\' }}"}}',
    "",
    "示例3 - Button条件action链：",
    '输入："生成一个Button，标签\'删除\'，先showConfirm绑定confirmed，confirmed为true时deleteItem"',
    "输出：",
    '{"component": "Button", "label": "删除", "onClick": [{"call": "showConfirm", "as": "confirmed", "args": {"message": "确认删除？"}}, {"call": "deleteItem", "condition": "{{ $confirmed }}"}]}',
    "",
    "示例4 - Toggle+条件可见性：",
    '输入："生成一个Toggle组件，isOn绑定$notificationsEnabled，onChange调用toggleNotifications，$hasPermission为true时可见"',
    "输出：",
    '{"component": "Toggle", "isOn": "{{ $notificationsEnabled }}", "onChange": [{"call": "toggleNotifications"}], "styles": {"visibility": "{{ $hasPermission ? \'visible\' : \'none\' }}"}}',
  ].join("\n"),
  "variable-scope": [
    "## 参考示例",
    "",
    "示例1 - 简单数据绑定：",
    '输入："生成一个Text组件，显示用户名$username"',
    "输出：",
    '{"component": "Text", "content": "{{ $username }}"}',
    "",
    "示例2 - as绑定+条件action：",
    '输入："生成一个Button，标签\'提交\'，点击调用validate绑定isValid，isValid为true时submit"',
    "输出：",
    '{"component": "Button", "label": "提交", "onClick": [{"call": "validate", "as": "isValid", "args": {"data": "$form"}}, {"call": "submit", "condition": "{{ $isValid }}"}]}',
    "",
    "示例3 - $context.eventData事件参数：",
    '输入："生成一个TextInput，placeholder\'输入\'，onChange时调用update传入value为$context.eventData"',
    "输出：",
    '{"component": "TextInput", "placeholder": "输入", "onChange": [{"call": "update", "args": {"value": "$context.eventData"}}]}',
  ].join("\n"),
  "event-chain-flat": [
    "## 参考示例",
    "",
    "示例1 - 单个行为：",
    '输入："生成一个Button组件，标签为\'确认\'，点击时发送消息给LLM内容为\'确认操作\'"',
    "输出：",
    '{"component": "Button", "label": "确认", "onClick": [{"call": "sendToLLM", "args": {"value": "确认操作"}}]}',
    "",
    "示例2 - 条件链（两步）：",
    '输入："生成一个Button组件，标签为\'提交\'，点击时调用validate绑定到result，result等于0时调用submit"',
    "输出：",
    '{"component": "Button", "label": "提交", "onClick": [{"call": "validate", "as": "result", "args": {}}, {"call": "submit", "condition": "{{ $result == 0 }}", "args": {}}]}',
    "",
    "示例3 - 条件链带分支（两步）：",
    '输入："生成一个Button组件，标签为\'查看\'，点击时调用checkLogin绑定到loggedIn，loggedIn为true时调用showProfile否则调用navigateLogin"',
    "输出：",
    '{"component": "Button", "label": "查看", "onClick": [{"call": "checkLogin", "as": "loggedIn", "args": {}}, {"call": "showProfile", "condition": "{{ $loggedIn == true }}", "args": {}}, {"call": "navigateLogin", "condition": "{{ $loggedIn != true }}", "args": {}}]}',
  ].join("\n"),
  "event-chain-handlerGroups": [
    "## 参考示例",
    "",
    "示例1 - 单个行为：",
    '输入："生成一个Button组件，标签为\'确认\'，点击时发送消息给LLM内容为\'确认操作\'"',
    "输出：",
    '{"component": "Button", "label": "确认", "onClick": {"handlerGroups": [{"handlers": [{"id": "confirm", "call": "sendToLLM", "args": {"value": "确认操作"}}]}]}}',
    "",
    "示例2 - 条件链（两步）：",
    '输入："生成一个Button组件，标签为\'提交\'，点击时调用validate绑定到validResult，validResult等于0时调用submit"',
    "输出：",
    '{"component": "Button", "label": "提交", "onClick": {"handlerGroups": [{"handlers": [{"id": "do_validate", "call": "validate", "args": {}}]}, {"condition": "{{$handlerResult[\'do_validate\'] == 0}}", "handlers": [{"id": "do_submit", "call": "submit", "args": {}}]}]}}',
    "",
    "示例3 - 条件链（三步）：",
    '输入："生成一个Button组件，标签为\'保存\'，点击时调用validate绑定到valid，valid等于0时调用save，save返回0时调用notify"',
    "输出：",
    '{"component": "Button", "label": "保存", "onClick": {"handlerGroups": [{"handlers": [{"id": "do_validate", "call": "validate", "args": {}}]}, {"condition": "{{$handlerResult[\'do_validate\'] == 0}}", "handlers": [{"id": "do_save", "call": "saveData", "args": {}}]}, {"condition": "{{$handlerResult[\'do_save\'] == 0}}", "handlers": [{"id": "do_notify", "call": "sendToLLM", "args": {"value": "保存成功"}}]}]}}}',
  ].join("\n"),
  "three-layer": [
    "## 参考示例",
    "",
    "示例1 - 数据模型变量引用：",
    '输入："生成一个Text组件，显示用户名user.name（数据模型变量）"',
    "输出：",
    '{"component": "Text", "content": "{{ $__dataModel.user.name }}"}',
    "",
    "示例2 - 内置全局变量引用：",
    '输入："生成一个Text组件，显示当前窗口断点$__widthBreakpoint"',
    "输出：",
    '{"component": "Text", "content": "{{ $__widthBreakpoint }}"}',
    "",
    "示例3 - as绑定+数据模型在action中：",
    '输入："生成一个Button，标签\'查询\'，点击时调用check绑定返回值为result，然后条件判断result.ok为true时调用show，传入userId为数据模型中的user.id"',
    "输出：",
    '{"component": "Button", "label": "查询", "onClick": [{"call": "check", "as": "result", "args": {}}, {"call": "show", "condition": "{{ $result.ok }}", "args": {"userId": "$__dataModel.user.id"}}]}',
  ].join("\n"),
  "two-layer": [
    "## 参考示例",
    "",
    "示例1 - 数据模型变量引用：",
    '输入："生成一个Text组件，显示用户名user.name（数据模型变量）"',
    "输出：",
    '{"component": "Text", "content": "{{ $data.user.name }}"}',
    "",
    "示例2 - 内置全局变量引用：",
    '输入："生成一个Text组件，显示当前窗口断点$__widthBreakpoint"',
    "输出：",
    '{"component": "Text", "content": "{{ $data.widthBreakpoint }}"}',
    "",
    "示例3 - as绑定+数据模型在action中：",
    '输入："生成一个Button，标签\'查询\'，点击时调用check绑定返回值为result，然后条件判断result.ok为true时调用show，传入userId为数据模型中的user.id"',
    "输出：",
    '{"component": "Button", "label": "查询", "onClick": [{"call": "check", "as": "result", "args": {}}, {"call": "show", "condition": "{{ $result.ok }}", "args": {"userId": "$data.user.id"}}]}',
  ].join("\n"),
  "select-component": [
    "## 参考示例",
    "",
    "示例1 - 基本Select组件（index-based）：",
    '输入："生成一个Select下拉选择组件，选项为\'北京\'和\'上海\'，默认选中第一个"',
    "输出：",
    '{"component": "Select", "id": "citySelect", "options": [{"value": "北京"}, {"value": "上海"}], "selected": 0, "value": "请选择城市"}',
    "",
    "示例2 - Select+onChange事件+DataModel（index-based）：",
    '输入："生成一个Select组件（选项为\'男\'和\'女\'），选中值绑定$formData.gender，onChange时用setDataModel更新"',
    "输出：",
    '{"component": "Select", "id": "genderSelect", "options": [{"value": "男"}, {"value": "女"}], "selected": 0, "value": "{{ $formData.gender }}", "onChange": [{"call": "setDataModel", "args": {"path": "/formData/gender", "value": "{{ $context.eventData.value }}"}}]}',
    "",
    "示例3 - Select条件action（index-based，$context.eventData.value为选项值）：",
    '输入："生成一个Select（选项为\'查询\'和\'删除\'），onChange时根据$context.eventData.value判断：值为\'查询\'时search，值为\'删除\'时delete"',
    "输出：",
    '{"component": "Select", "id": "actionSelect", "options": [{"value": "查询"}, {"value": "删除"}], "selected": 0, "value": "请选择操作", "onChange": [{"call": "search", "condition": "{{ $context.eventData.value == \'查询\' }}", "args": {}}, {"call": "delete", "condition": "{{ $context.eventData.value == \'删除\' }}", "args": {}}]}',
  ].join("\n"),
  "flat": [
    "## 参考示例",
    "",
    "示例1 - 数据模型变量引用：",
    '输入："生成一个Text组件，显示用户名user.name（数据模型变量）"',
    "输出：",
    '{"component": "Text", "content": "{{ $user.name }}"}',
    "",
    "示例2 - 内置全局变量引用：",
    '输入："生成一个Text组件，显示当前窗口断点$__widthBreakpoint"',
    "输出：",
    '{"component": "Text", "content": "{{ $WidthBreakpoint }}"}',
    "",
    "示例3 - as绑定+数据模型在action中：",
    '输入："生成一个Button，标签\'查询\'，点击时调用check绑定返回值为result，然后条件判断result.ok为true时调用show，传入userId为数据模型中的user.id"',
    "输出：",
    '{"component": "Button", "label": "查询", "onClick": [{"call": "check", "as": "result", "args": {}}, {"call": "show", "condition": "{{ $result.ok }}", "args": {"userId": "$user.id"}}]}',
  ].join("\n"),
};

/** 获取 few-shot 示例，支持截取前 N 个示例 */
export function getFewShotExamples(category: string, shotCount: number = 3): string {
  const full = FEW_SHOT_EXAMPLES[category] || FEW_SHOT_EXAMPLES["expression"];

  if (shotCount >= 3) return full;

  // 按 "示例X" 分割，截取前 shotCount 个
  const lines = full.split("\n");
  const sections: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (line.startsWith("示例") && current.length > 0) {
      sections.push(current);
      current = [];
    }
    current.push(line);
  }
  if (current.length > 0) sections.push(current);

  if (shotCount === 0) return "";
  if (shotCount >= sections.length) return full;

  // 包含 "## 参考示例" 头 + 前 shotCount 个示例
  const header = sections[0].filter((l) => !l.startsWith("示例")).join("\n");
  const selected = sections.slice(0, shotCount).map((s) => s.join("\n")).join("\n");

  // 如果第一个 section 包含 "## 参考示例"，直接用截取的部分
  if (sections[0].some((l) => l.includes("参考示例"))) {
    const examples = sections.slice(1, 1 + shotCount).map((s) => s.join("\n")).join("\n");
    return header + "\n" + examples;
  }

  return header + "\n" + selected;
}
