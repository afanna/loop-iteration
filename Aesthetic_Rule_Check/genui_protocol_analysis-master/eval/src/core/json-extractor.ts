/**
 * 从LLM原始输出中提取JSON对象或数组
 * 处理：markdown代码块包裹、额外文字、多个JSON对象等
 */
export function extractJSON(raw: string): string | null {
  if (!raw || !raw.trim()) return null;

  let text = raw.trim();

  // 1. 尝试提取markdown代码块中的内容
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    text = codeBlockMatch[1].trim();
  }

  // 2. 根据首字符判断提取对象还是数组
  const trimmed = text.trimStart();
  if (trimmed.startsWith("[")) {
    const arrayStr = findFirstJSONArray(text);
    if (arrayStr) return arrayStr;
  }
  if (trimmed.startsWith("{")) {
    const objStr = findFirstJSONObject(text);
    if (objStr) return objStr;
  }

  // 3. 回退：尝试另一种格式
  const arrayStr = findFirstJSONArray(text);
  if (arrayStr) return arrayStr;
  const objStr = findFirstJSONObject(text);
  if (objStr) return objStr;

  // 4. 尝试直接解析
  try {
    JSON.parse(text);
    return text;
  } catch {
    // continue
  }

  return null;
}

function findFirstJSONObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (ch === "\\") {
      if (inString) escapeNext = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return text.substring(start, i + 1);
      }
    }
  }

  return null;
}

function findFirstJSONArray(text: string): string | null {
  const start = text.indexOf("[");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (ch === "\\") {
      if (inString) escapeNext = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === "[" ) depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        return text.substring(start, i + 1);
      }
    }
  }

  return null;
}
