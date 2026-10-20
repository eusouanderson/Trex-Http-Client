import * as fs from 'node:fs';
import * as path from 'node:path';
import { BudgetValidatorService } from './budget-validator.service';
import { BundleAnalyzerService } from './bundle-analyzer.service';
import type {
  IBundleReport,
  IFileSystem,
  IPerformanceBudgetConfig,
  IPerformanceOrchestratorOptions,
  IValidationResult,
} from './interfaces';

class PerformanceOrchestratorService {
  private readonly analyzer: BundleAnalyzerService;
  private readonly validator: BudgetValidatorService;
  private readonly fileSystem: IFileSystem;

  constructor(
    analyzer: BundleAnalyzerService = new BundleAnalyzerService(),
    validator: BudgetValidatorService = new BudgetValidatorService(),
    fileSystem: IFileSystem = fs,
  ) {
    this.analyzer = analyzer;
    this.validator = validator;
    this.fileSystem = fileSystem;
  }

  public run = (options: IPerformanceOrchestratorOptions): IValidationResult => {
    const currentReport = this.analyzer.analyze(options.distDir);
    const baselineReport = this.loadBaseline(options.baselinePath);
    const budgetConfig = this.loadBudget(options.budgetPath, options.forceMode);

    const result = this.validator.validate(currentReport, baselineReport, budgetConfig);

    this.ensureDirectory(path.dirname(options.reportJsonPath));
    this.fileSystem.writeFileSync(options.reportJsonPath, JSON.stringify(currentReport, null, 2));

    this.ensureDirectory(path.dirname(options.reportMarkdownPath));
    this.fileSystem.writeFileSync(options.reportMarkdownPath, result.summaryMarkdown);

    const stepSummaryPath = options.stepSummaryPath ?? process.env.GITHUB_STEP_SUMMARY;
    if (stepSummaryPath !== undefined && stepSummaryPath.length > 0) {
      this.ensureDirectory(path.dirname(stepSummaryPath));
      this.fileSystem.writeFileSync(stepSummaryPath, result.summaryMarkdown);
    }

    return result;
  };

  private loadBaseline = (baselinePath: string): IBundleReport | null => {
    if (!this.fileSystem.existsSync(baselinePath)) {
      return null;
    }
    try {
      const content = this.fileSystem.readFileSync(baselinePath, 'utf-8');
      const text = typeof content === 'string' ? content : content.toString('utf-8');
      return JSON.parse(text) as IBundleReport;
    } catch {
      return null;
    }
  };

  private loadBudget = (budgetPath: string, forceMode?: 'warn' | 'error'): IPerformanceBudgetConfig => {
    const defaultConfig: IPerformanceBudgetConfig = {
      mode: forceMode ?? 'warn',
      limits: {
        maxInitialJsRawBytes: 1200 * 1024,
        maxInitialJsGzipBytes: 400 * 1024,
        maxTotalJsRawBytes: 1500 * 1024,
        maxTotalJsGzipBytes: 500 * 1024,
        maxTotalCssRawBytes: 100 * 1024,
        maxTotalCssGzipBytes: 30 * 1024,
        maxAllowedGrowthPercent: 15,
      },
    };

    if (!this.fileSystem.existsSync(budgetPath)) {
      return defaultConfig;
    }

    try {
      const raw = this.fileSystem.readFileSync(budgetPath, 'utf-8');
      const text = typeof raw === 'string' ? raw : raw.toString('utf-8');
      const parsed = JSON.parse(text) as Partial<IPerformanceBudgetConfig>;
      return {
        mode: forceMode ?? parsed.mode ?? defaultConfig.mode,
        limits: {
          ...defaultConfig.limits,
          ...(parsed.limits ?? {}),
        },
      };
    } catch {
      return defaultConfig;
    }
  };

  private ensureDirectory = (dirPath: string): void => {
    if (!this.fileSystem.existsSync(dirPath)) {
      this.fileSystem.mkdirSync(dirPath, { recursive: true });
    }
  };
}

export { PerformanceOrchestratorService };
