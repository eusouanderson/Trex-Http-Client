import * as path from 'node:path';
import type { IPerformanceOrchestratorOptions } from './interfaces';
import { PerformanceOrchestratorService } from './performance-orchestrator.service';

const run = (): void => {
  const rootDir = process.cwd();
  const forceMode = process.env.PERF_MODE === 'error' ? 'error' : process.env.PERF_MODE === 'warn' ? 'warn' : undefined;

  const options: IPerformanceOrchestratorOptions = {
    distDir: path.resolve(rootDir, 'dist'),
    baselinePath: path.resolve(rootDir, 'performance-baseline.json'),
    budgetPath: path.resolve(rootDir, 'performance-budget.json'),
    reportJsonPath: path.resolve(rootDir, 'dist/performance-report.json'),
    reportMarkdownPath: path.resolve(rootDir, 'dist/performance-report.md'),
    stepSummaryPath: process.env.GITHUB_STEP_SUMMARY,
    forceMode,
  };

  const orchestrator = new PerformanceOrchestratorService();
  const result = orchestrator.run(options);

  if (!result.passed) {
    console.error(result.summaryMarkdown);
    process.exit(1);
  }

  console.warn(result.summaryMarkdown);
};

run();

export { run };
