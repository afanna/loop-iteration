import OpenAI from "openai";
import type { LLMModelConfig } from "../core/types.js";

export interface LLMResponse {
  content: string;
  tokens: number;
  elapsedMs: number;
}

const clientCache = new Map<string, OpenAI>();

function getClient(config: LLMModelConfig): OpenAI {
  const cacheKey = `${config.baseURL}::${config.apiKey}`;
  const cached = clientCache.get(cacheKey);
  if (cached) return cached;

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });
  clientCache.set(cacheKey, client);
  return client;
}

/** 创建OpenAI兼容客户端并调用 */
export async function callLLM(
  config: LLMModelConfig,
  systemPrompt: string,
  userPrompt: string,
  retries = 2
): Promise<LLMResponse> {
  const client = getClient(config);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const start = Date.now();
      const response = await client.chat.completions.create({
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: config.maxTokens ?? 20480,
      });
      const elapsedMs = Date.now() - start;

      return {
        content: response.choices[0]?.message?.content || "",
        tokens: response.usage?.total_tokens || 0,
        elapsedMs,
      };
    } catch (e) {
      lastError = e as Error;
      if (attempt < retries) {
        // 指数退避
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("LLM调用失败");
}
