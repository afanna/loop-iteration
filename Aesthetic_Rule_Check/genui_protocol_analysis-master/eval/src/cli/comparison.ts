import "dotenv/config";
import { loadModelConfigs, loadConflictTestCases, loadProtocolSummary, resolveReportsDir } from "../config.js";
import { setProtocolSummary, buildSystemPrompt, type ScopeStrategy } from "../prompt/prompt-builder.js";
import { runTests } from "../core/test-runner.js";
import { writeFile, mkdir } from "fs/promises";
import { resolve } from "path";

interface StrategyReport {
  strategy: ScopeStrategy;
  accuracy: number;
  passed: number;
  total: number;
  per_case: {
    id: string;
    name: string;
    passed: boolean;
    errors: string[];
    tokens: number;
    time_ms: number;
    raw_output: string;
    generated_dsl: Record<string, unknown> | null;
  }[];
}

async function main() {
  console.log("=".repeat(70));
  console.log("变量作用域策略对比实验");
  console.log("shadowing (隐式覆盖) vs explicit ($data显式前缀)");
  console.log("=".repeat(70));

  // 1. 加载模型配置
  const models = loadModelConfigs();
  if (models.length === 0) {
    console.error("\n错误: 未配置任何模型。请在.env文件中设置API Key。");
    process.exit(1);
  }
  console.log(`\n使用模型: ${models.map((m) => m.displayName).join(", ")}`);

  // 2. 加载冲突测试用例
  const testCases = await loadConflictTestCases();
  if (testCases.length === 0) {
    console.error("\n错误: 未找到冲突解决测试用例。");
    process.exit(1);
  }
  console.log(`已加载 ${testCases.length} 个冲突解决测试用例:`);
  for (const tc of testCases) {
    console.log(`  ${tc.id}: ${tc.name}`);
  }

  // 3. 加载协议摘要
  const protocolSummary = await loadProtocolSummary();
  setProtocolSummary(protocolSummary);

  // 4. 对每个模型运行两种策略
  const allResults: Record<string, StrategyReport[]> = {};

  for (const modelConfig of models) {
    allResults[modelConfig.displayName] = [];

    for (const strategy of ["shadowing", "explicit"] as ScopeStrategy[]) {
      console.log(`\n${"=".repeat(70)}`);
      console.log(`模型: ${modelConfig.displayName} | 策略: ${strategy}`);
      console.log(`${"=".repeat(70)}\n`);

      const systemPrompt = buildSystemPrompt(strategy);
      const report = await runTests(modelConfig, testCases, systemPrompt, 0, strategy);

      allResults[modelConfig.displayName].push({
        strategy,
        accuracy: report.accuracy,
        passed: report.passed,
        total: report.total,
        per_case: report.per_case.map((c) => ({
          id: c.id,
          name: c.name,
          passed: c.passed,
          errors: c.errors,
          tokens: c.tokens,
          time_ms: c.time_ms,
          raw_output: c.raw_output,
          generated_dsl: c.generated_dsl,
        })),
      });
    }
  }

  // 5. 输出对比报告
  console.log(`\n${"=".repeat(70)}`);
  console.log("对比结果");
  console.log(`${"=".repeat(70)}\n`);

  for (const [modelName, strategies] of Object.entries(allResults)) {
    console.log(`\n### ${modelName}\n`);

    const shadowing = strategies.find((s) => s.strategy === "shadowing")!;
    const explicit = strategies.find((s) => s.strategy === "explicit")!;

    console.log("| 策略 | 准确率 | 通过/总数 |");
    console.log("|------|--------|-----------|");
    console.log(
      `| shadowing (隐式覆盖) | ${(shadowing.accuracy * 100).toFixed(0)}% | ${shadowing.passed}/${shadowing.total} |`
    );
    console.log(
      `| explicit ($data前缀) | ${(explicit.accuracy * 100).toFixed(0)}% | ${explicit.passed}/${explicit.total} |`
    );

    console.log("\n逐用例对比:");
    console.log("| 用例 | shadowing | explicit |");
    console.log("|------|-----------|----------|");
    for (let i = 0; i < shadowing.per_case.length; i++) {
      const sc = shadowing.per_case[i];
      const ec = explicit.per_case[i];
      const sMark = sc.passed ? "PASS" : "FAIL";
      const eMark = ec.passed ? "PASS" : "FAIL";
      const diff = sc.passed !== ec.passed
        ? (ec.passed ? " <-- explicit更优" : " <-- shadowing更优")
        : "";
      console.log(`| ${sc.id} ${sc.name} | ${sMark} | ${eMark} |${diff}`);
    }

    const failedShadowing = shadowing.per_case.filter((c) => !c.passed);
    const failedExplicit = explicit.per_case.filter((c) => !c.passed);

    if (failedShadowing.length > 0 || failedExplicit.length > 0) {
      console.log("\n失败详情:");
      for (const tc of shadowing.per_case) {
        const sErrors = failedShadowing.find((f) => f.id === tc.id)?.errors || [];
        const eErrors = failedExplicit.find((f) => f.id === tc.id)?.errors || [];
        if (sErrors.length > 0 || eErrors.length > 0) {
          console.log(`\n  ${tc.id} ${tc.name}:`);
          if (sErrors.length > 0) {
            console.log("    shadowing错误:");
            for (const e of sErrors) console.log(`      - ${e}`);
          }
          if (eErrors.length > 0) {
            console.log("    explicit错误:");
            for (const e of eErrors) console.log(`      - ${e}`);
          }
        }
      }
    }
  }

  // 6. 保存JSON报告
  const reportsDir = resolveReportsDir("eval/reports");
  await mkdir(reportsDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const reportPath = resolve(reportsDir, `comparison-${timestamp}.json`);
  await writeFile(reportPath, JSON.stringify(allResults, null, 2), "utf-8");
  console.log(`\n对比报告已保存: ${reportPath}`);

  console.log("\n实验完成！");
}

main().catch((e) => {
  console.error("运行错误:", e);
  process.exit(1);
});
