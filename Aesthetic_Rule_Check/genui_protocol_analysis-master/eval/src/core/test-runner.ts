import type { TestCase, LLMModelConfig, ModelReport, PerCaseResult } from "./types.js";
import { validate } from "./validator.js";
import { callLLM } from "../llm/client.js";
import { buildUserPrompt, type ScopeStrategy } from "../prompt/prompt-builder.js";
import { writeFile, mkdir } from "fs/promises";
import { resolve } from "path";

function createSemaphore(limit: number) {
  let running = 0;
  const queue: (() => void)[] = [];
  return {
    acquire: (): Promise<void> =>
      new Promise<void>((resolve) => {
        if (running < limit) {
          running++;
          resolve();
        } else {
          queue.push(() => {
            running++;
            resolve();
          });
        }
      }),
    release: () => {
      running--;
      if (queue.length > 0) queue.shift()!();
    },
  };
}

function getConcurrency(): number {
  const val = parseInt(process.env.CONCURRENCY || "", 10);
  return val > 0 ? val : 4;
}

interface CaseResultWithIndex {
  index: number;
  result: PerCaseResult;
  userPrompt: string;
}

async function runSingleCase(
  tc: TestCase,
  index: number,
  total: number,
  modelConfig: LLMModelConfig,
  systemPrompt: string,
  maxRetries: number,
  strategy: ScopeStrategy | undefined,
): Promise<CaseResultWithIndex> {
  const userPrompt = buildUserPrompt(tc, strategy);

  let passed = false;
  let errors: string[] = [];
  let retryCount = 0;
  let tokens = 0;
  let timeMs = 0;
  let rawOutput = "";
  let generatedDsl: Record<string, unknown> | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await callLLM(modelConfig, systemPrompt, userPrompt);
      rawOutput = response.content;
      tokens = response.tokens;
      timeMs = response.elapsedMs;
      retryCount = attempt;

      const result = validate(rawOutput, tc);
      passed = result.passed;
      errors = result.errors;
      generatedDsl = result.generated;

      if (passed || attempt === maxRetries) break;
    } catch (e) {
      errors = [`LLM调用错误: ${(e as Error).message}`];
      retryCount = attempt;
    }
  }

  const caseResult: PerCaseResult = {
    id: tc.id,
    name: tc.name,
    category: tc.category,
    complexity: tc.complexity,
    passed,
    tokens,
    time_ms: timeMs,
    retries: retryCount,
    errors,
    raw_output: rawOutput,
    generated_dsl: generatedDsl,
  };

  const icon = passed ? "OK" : "XX";
  const timeStr = (timeMs / 1000).toFixed(1);
  console.log(
    `[${index + 1}/${total}] ${tc.id} ${tc.name} (${tc.complexity}) ${icon} [${tokens} tokens, ${timeStr}s]`
  );
  if (!passed) {
    for (const err of errors) {
      console.log(`  -> ${err}`);
    }
  }

  return { index, result: caseResult, userPrompt };
}

/** 运行单个模型的所有测试 */
export async function runTests(
  modelConfig: LLMModelConfig,
  testCases: TestCase[],
  systemPrompt: string,
  maxRetries = 1,
  strategy?: ScopeStrategy,
  ioDir?: string
): Promise<ModelReport> {
  const concurrency = getConcurrency();
  const sem = createSemaphore(concurrency);
  const total = testCases.length;

  console.log(`\n${"=".repeat(70)}`);
  console.log(`模型: ${modelConfig.displayName} (并发: ${concurrency})`);
  console.log(`${"=".repeat(70)}\n`);

  const promises = testCases.map((tc, i) =>
    sem.acquire().then(() =>
      runSingleCase(tc, i, total, modelConfig, systemPrompt, maxRetries, strategy)
        .finally(() => sem.release())
    )
  );

  const results = await Promise.all(promises);

  results.sort((a, b) => a.index - b.index);

  const perCase: PerCaseResult[] = [];
  const errorAnalysis: Record<string, number> = {};
  let totalTokens = 0;
  let totalTime = 0;
  let firstTryCount = 0;

  for (const { result, userPrompt } of results) {
    const tc = testCases.find((t) => t.id === result.id)!;

    totalTokens += result.tokens;
    totalTime += result.time_ms;
    if (result.retries === 0) firstTryCount++;

    for (const err of result.errors) {
      const errType = err.split(":")[0] || err.substring(0, 20);
      errorAnalysis[errType] = (errorAnalysis[errType] || 0) + 1;
    }

    perCase.push(result);

    if (ioDir) {
      await saveCaseIO(ioDir, tc, result, systemPrompt, userPrompt);
    }
  }

  // 计算报告
  const passedCount = perCase.filter((r) => r.passed).length;
  const totalCount = perCase.length;
  const accuracy = totalCount > 0 ? passedCount / totalCount : 0;

  // 按分类统计
  const categoryAccuracy: Record<string, { passed: number; total: number }> = {};
  for (const r of perCase) {
    if (!categoryAccuracy[r.category]) {
      categoryAccuracy[r.category] = { passed: 0, total: 0 };
    }
    categoryAccuracy[r.category].total++;
    if (r.passed) categoryAccuracy[r.category].passed++;
  }

  // 按复杂度统计
  const complexityAccuracy: Record<string, { passed: number; total: number }> = {};
  for (const r of perCase) {
    if (!complexityAccuracy[r.complexity]) {
      complexityAccuracy[r.complexity] = { passed: 0, total: 0 };
    }
    complexityAccuracy[r.complexity].total++;
    if (r.passed) complexityAccuracy[r.complexity].passed++;
  }

  const report: ModelReport = {
    model_name: modelConfig.displayName,
    total: totalCount,
    passed: passedCount,
    accuracy,
    category_accuracy: categoryAccuracy,
    complexity_accuracy: complexityAccuracy,
    generation_stats: {
      total_tokens: totalTokens,
      avg_tokens: totalCount > 0 ? Math.round(totalTokens / totalCount) : 0,
      avg_time_ms: totalCount > 0 ? Math.round(totalTime / totalCount) : 0,
      first_try_rate: totalCount > 0 ? firstTryCount / totalCount : 0,
    },
    error_analysis: errorAnalysis,
    per_case: perCase,
  };

  return report;
}

/** 保存单个用例的完整 I/O 到 JSON 文件 */
async function saveCaseIO(
  ioDir: string,
  testCase: TestCase,
  result: PerCaseResult,
  systemPrompt: string,
  userPrompt: string
): Promise<void> {
  await mkdir(ioDir, { recursive: true });

  const fileName = `${testCase.id}-${result.passed ? "PASS" : "FAIL"}.json`;
  const filePath = resolve(ioDir, fileName);

  const ioDetail = {
    case_id: testCase.id,
    case_name: testCase.name,
    category: testCase.category,
    complexity: testCase.complexity,
    task: testCase.task,
    validation_rules: testCase.validation_rules,
    hints: testCase.hints || [],
    input: {
      system_prompt_length: systemPrompt.length,
      user_prompt: userPrompt,
    },
    output: {
      raw: result.raw_output,
      parsed: result.generated_dsl,
    },
    validation: {
      passed: result.passed,
      errors: result.errors,
      tokens: result.tokens,
      time_ms: result.time_ms,
      retries: result.retries,
    },
  };

  await writeFile(filePath, JSON.stringify(ioDetail, null, 2), "utf-8");
}
