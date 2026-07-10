# GAP-050 Prompt 修改记录

## 修改 1: `protocol-summary.md` 表达式系统 — 新增安全约束

**位置**: `eval/prompts/protocol-summary.md` → 表达式系统 → 语法格式

**修改前**:
```
### 语法格式
动态值使用{{ }}双花括号包裹表达式：
```json
{"content": "{{ $user.name }}"}
{"styles": {"fontSize": "{{ $config.fontSize }}"}}
```
```

**修改后**:
```
### 语法格式
动态值使用{{ }}双花括号包裹表达式：
```json
{"content": "{{ $user.name }}"}
{"styles": {"fontSize": "{{ $config.fontSize }}"}}
```

**安全约束：**
- 表达式字符串总长度 ≤ 2048 字符
- 表达式内括号嵌套深度 ≤ 20 层（包括 `()`、`[]`、模板字符串 `${}`）
- 超限表达式为非法，求值失败返回空字符串 `""`
```
