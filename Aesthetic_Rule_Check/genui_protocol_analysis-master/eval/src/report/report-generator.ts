import { writeFile, mkdir } from "fs/promises";
import { resolve } from "path";
import type { ModelReport, EvaluationReport } from "../core/types.js";

/** 生成并保存报告 */
export async function generateReport(
  reports: ModelReport[],
  reportsDir: string
): Promise<string> {
  await mkdir(reportsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const baseName = `report-${timestamp}`;

  // JSON报告
  const evalReport: EvaluationReport = {
    timestamp: new Date().toISOString(),
    protocol_version: "v2.0",
    total_cases: reports[0]?.total || 0,
    models: reports,
  };
  const jsonPath = resolve(reportsDir, `${baseName}.json`);
  await writeFile(jsonPath, JSON.stringify(evalReport, null, 2), "utf-8");

  // Markdown报告
  const md = buildMarkdownReport(reports);
  const mdPath = resolve(reportsDir, `${baseName}.md`);
  await writeFile(mdPath, md, "utf-8");

  return baseName;
}

function buildMarkdownReport(reports: ModelReport[]): string {
  const lines: string[] = [];
  lines.push("# 鸿蒙智能体UI协议v2.0 - 模型亲和性评估报告");
  lines.push(`\n日期: ${new Date().toISOString().split("T")[0]}`);
  lines.push(`协议版本: v2.0\n`);

  // 模型对比摘要
  lines.push("## 模型对比\n");
  lines.push("| 模型 | 准确率 | 通过/总数 | 平均Token | 平均耗时 | 首次成功率 |");
  lines.push("|------|--------|-----------|-----------|----------|------------|");
  for (const r of reports) {
    lines.push(
      `| ${r.model_name} | ${(r.accuracy * 100).toFixed(1)}% | ${r.passed}/${r.total} | ${r.generation_stats.avg_tokens} | ${(r.generation_stats.avg_time_ms / 1000).toFixed(1)}s | ${(r.generation_stats.first_try_rate * 100).toFixed(0)}% |`
    );
  }

  // 每个模型详细报告
  for (const r of reports) {
    lines.push(`\n## ${r.model_name}\n`);
    lines.push(`**准确率**: ${(r.accuracy * 100).toFixed(1)}% (${r.passed}/${r.total})\n`);

    // 分类准确率
    lines.push("### 分类别准确率\n");
    lines.push("| 分类 | 通过/总数 | 准确率 |");
    lines.push("|------|-----------|--------|");
    for (const [cat, { passed, total }] of Object.entries(r.category_accuracy)) {
      lines.push(`| ${cat} | ${passed}/${total} | ${total > 0 ? ((passed / total) * 100).toFixed(0) : 0}% |`);
    }

    // 复杂度准确率
    lines.push("\n### 按复杂度\n");
    lines.push("| 复杂度 | 通过/总数 | 准确率 |");
    lines.push("|--------|-----------|--------|");
    for (const [comp, { passed, total }] of Object.entries(r.complexity_accuracy)) {
      lines.push(`| ${comp} | ${passed}/${total} | ${total > 0 ? ((passed / total) * 100).toFixed(0) : 0}% |`);
    }

    // 错误分析
    if (Object.keys(r.error_analysis).length > 0) {
      lines.push("\n### 错误分析\n");
      const sorted = Object.entries(r.error_analysis).sort((a, b) => b[1] - a[1]);
      for (const [errType, count] of sorted) {
        lines.push(`- ${errType}: ${count}次`);
      }
    }

    // 失败用例详情
    const failed = r.per_case.filter((c) => !c.passed);
    if (failed.length > 0) {
      lines.push("\n### 失败用例\n");
      for (const c of failed) {
        lines.push(`**${c.id} ${c.name}** (${c.category}/${c.complexity})`);
        for (const err of c.errors) {
          lines.push(`  - ${err}`);
        }
        lines.push("");
      }
    }
  }

  return lines.join("\n");
}
