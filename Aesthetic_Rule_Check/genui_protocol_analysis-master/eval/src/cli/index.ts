import "dotenv/config";
import { loadModelConfigs, loadAllTestCases, loadProtocolSummary, resolveReportsDir } from "../config.js";
import { setProtocolSummary, buildSystemPrompt } from "../prompt/prompt-builder.js";
import { runTests } from "../core/test-runner.js";
import { generateReport } from "../report/report-generator.js";
import { resolve } from "path";

async function main() {
  console.log("=".repeat(70));
  console.log("鸿蒙智能体UI协议v2.0 - 模型亲和性评估");
  console.log("=".repeat(70));

  // 1. 加载模型配置
  const models = loadModelConfigs();
  if (models.length === 0) {
    console.error("\n错误: 未配置任何模型。请在.env文件中设置API Key。");
    console.error("  GLM_API_KEY=xxx");
    console.error("  DEEPSEEK_API_KEY=xxx\n");
    process.exit(1);
  }
  console.log(`\n已配置 ${models.length} 个模型: ${models.map((m) => m.displayName).join(", ")}`);

  // 2. 加载测试用例
  const testCases = await loadAllTestCases();
  if (testCases.length === 0) {
    console.error("\n错误: 未找到测试用例。请检查 eval/test-cases/ 目录。\n");
    process.exit(1);
  }
  console.log(`已加载 ${testCases.length} 个测试用例`);

  // 按分类统计
  const categories: Record<string, number> = {};
  for (const tc of testCases) {
    categories[tc.category] = (categories[tc.category] || 0) + 1;
  }
  console.log("  " + Object.entries(categories).map(([k, v]) => `${k}: ${v}`).join(", "));

  // 3. 加载协议摘要并构建system prompt
  const protocolSummary = await loadProtocolSummary();
  setProtocolSummary(protocolSummary);
  const systemPrompt = buildSystemPrompt();

  // 4. 运行测试（多模型并行）
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const reportsDir = resolveReportsDir("eval/reports");
  const reportPromises = models.map((modelConfig) => {
    const ioDir = resolve(reportsDir, `io-${timestamp}`, modelConfig.name);
    return runTests(modelConfig, testCases, systemPrompt, 1, undefined, ioDir);
  });
  const reports = await Promise.all(reportPromises);

  // 5. 生成报告
  const baseName = await generateReport(reports, reportsDir);

  // 6. 输出汇总
  console.log(`\n${"=".repeat(70)}`);
  console.log("模型对比汇总");
  console.log(`${"=".repeat(70)}\n`);

  for (const r of reports) {
    const acc = (r.accuracy * 100).toFixed(1);
    console.log(`  ${r.model_name}: ${acc}% (${r.passed}/${r.total})`);
    console.log(`    Token平均: ${r.generation_stats.avg_tokens} | 耗时平均: ${(r.generation_stats.avg_time_ms / 1000).toFixed(1)}s | 首次成功: ${(r.generation_stats.first_try_rate * 100).toFixed(0)}%`);
  }

  console.log(`\n报告已保存到: ${reportsDir}`);
  console.log("\n评估完成！");
}

main().catch((e) => {
  console.error("运行错误:", e);
  process.exit(1);
});
