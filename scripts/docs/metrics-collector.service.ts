import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type {
  IBundleMetricsSummary,
  IFileSystem,
  ILighthouseReportSummary,
  IMetricsCollectorService,
  IVersionDiffComparison,
  IVersionMetricsHistoryItem,
} from './interfaces';

const defaultFileSystem: IFileSystem = {
  existsSync: (path: string): boolean => existsSync(path),
  mkdirSync: (path: string, options?: { recursive?: boolean }): void => {
    mkdirSync(path, options);
  },
  readFileSync: (path: string, encoding: 'utf-8'): string => readFileSync(path, encoding),
  writeFileSync: (path: string, data: string, encoding: 'utf-8'): void => {
    writeFileSync(path, data, encoding);
  },
};

class MetricsCollectorService implements IMetricsCollectorService {
  private readonly projectRoot: string;
  private readonly fileSystem: IFileSystem;

  constructor(projectRoot = process.cwd(), fileSystem: IFileSystem = defaultFileSystem) {
    this.projectRoot = resolve(projectRoot);
    this.fileSystem = fileSystem;
  }

  public collectBundleMetrics = (): IBundleMetricsSummary => {
    const reportPath = join(this.projectRoot, 'dist', 'performance-report.json');
    const budgetPath = join(this.projectRoot, 'performance-budget.json');

    if (!this.fileSystem.existsSync(reportPath)) {
      return {
        status: 'unavailable',
        measuredAt: new Date().toISOString(),
        initialJsRawBytes: 0,
        initialJsGzipBytes: 0,
        totalJsGzipBytes: 0,
        totalCssGzipBytes: 0,
        maxInitialJsGzipLimit: 0,
        maxTotalJsGzipLimit: 0,
        maxTotalCssGzipLimit: 0,
        isBudgetRespected: false,
      };
    }

    try {
      const rawReport = this.fileSystem.readFileSync(reportPath, 'utf-8');
      const parsedReport = JSON.parse(rawReport) as {
        timestamp?: string;
        initialJsRawSizeBytes?: number;
        initialJsGzipSizeBytes?: number;
        totalJsGzipSizeBytes?: number;
        totalCssGzipSizeBytes?: number;
      };

      let maxInitialJsGzipLimit = 330000;
      let maxTotalJsGzipLimit = 350000;
      let maxTotalCssGzipLimit = 15000;

      if (this.fileSystem.existsSync(budgetPath)) {
        const rawBudget = this.fileSystem.readFileSync(budgetPath, 'utf-8');
        const parsedBudget = JSON.parse(rawBudget) as {
          limits?: {
            maxInitialJsGzipBytes?: number;
            maxTotalJsGzipBytes?: number;
            maxTotalCssGzipBytes?: number;
          };
        };
        if (parsedBudget.limits) {
          maxInitialJsGzipLimit = parsedBudget.limits.maxInitialJsGzipBytes ?? maxInitialJsGzipLimit;
          maxTotalJsGzipLimit = parsedBudget.limits.maxTotalJsGzipBytes ?? maxTotalJsGzipLimit;
          maxTotalCssGzipLimit = parsedBudget.limits.maxTotalCssGzipBytes ?? maxTotalCssGzipLimit;
        }
      }

      const initialJsGzipBytes = parsedReport.initialJsGzipSizeBytes ?? 0;
      const initialJsRawBytes = parsedReport.initialJsRawSizeBytes ?? 0;
      const totalJsGzipBytes = parsedReport.totalJsGzipSizeBytes ?? 0;
      const totalCssGzipBytes = parsedReport.totalCssGzipSizeBytes ?? 0;

      const isBudgetRespected =
        initialJsGzipBytes <= maxInitialJsGzipLimit &&
        totalJsGzipBytes <= maxTotalJsGzipLimit &&
        totalCssGzipBytes <= maxTotalCssGzipLimit;

      return {
        status: isBudgetRespected ? 'passed' : 'failed',
        measuredAt: parsedReport.timestamp ?? new Date().toISOString(),
        initialJsRawBytes,
        initialJsGzipBytes,
        totalJsGzipBytes,
        totalCssGzipBytes,
        maxInitialJsGzipLimit,
        maxTotalJsGzipLimit,
        maxTotalCssGzipLimit,
        isBudgetRespected,
      };
    } catch {
      return {
        status: 'failed',
        measuredAt: new Date().toISOString(),
        initialJsRawBytes: 0,
        initialJsGzipBytes: 0,
        totalJsGzipBytes: 0,
        totalCssGzipBytes: 0,
        maxInitialJsGzipLimit: 0,
        maxTotalJsGzipLimit: 0,
        maxTotalCssGzipLimit: 0,
        isBudgetRespected: false,
      };
    }
  };

  public collectLighthouseMetrics = (): ILighthouseReportSummary => {
    const lhciDir = join(this.projectRoot, '.lighthouseci');
    const manifestPath = join(lhciDir, 'manifest.json');

    if (this.fileSystem.existsSync(manifestPath)) {
      try {
        const rawManifest = this.fileSystem.readFileSync(manifestPath, 'utf-8');
        const parsedManifest = JSON.parse(rawManifest) as {
          url?: string;
          isRepresentativeRun?: boolean;
          jsonPath?: string;
          htmlPath?: string;
        }[];

        const targetRun = parsedManifest.find((item) => item.isRepresentativeRun === true) ?? parsedManifest[0];
        if (typeof targetRun?.jsonPath === 'string' && targetRun.jsonPath.length > 0 && this.fileSystem.existsSync(targetRun.jsonPath)) {
          const rawReport = this.fileSystem.readFileSync(targetRun.jsonPath, 'utf-8');
          const parsedLhr = JSON.parse(rawReport) as {
            fetchTime?: string;
            finalUrl?: string;
            categories?: {
              performance?: { score?: number | null };
              accessibility?: { score?: number | null };
              'best-practices'?: { score?: number | null };
              seo?: { score?: number | null };
            };
            audits?: {
              'first-contentful-paint'?: { numericValue?: number; displayValue?: string };
              'largest-contentful-paint'?: { numericValue?: number; displayValue?: string };
              'cumulative-layout-shift'?: { numericValue?: number; displayValue?: string };
            };
          };

          const pScore = parsedLhr.categories?.performance?.score;
          const aScore = parsedLhr.categories?.accessibility?.score;
          const bpScore = parsedLhr.categories?.['best-practices']?.score;
          const seoScore = parsedLhr.categories?.seo?.score;

          const fcpMs = parsedLhr.audits?.['first-contentful-paint']?.numericValue ?? null;
          const lcpMs = parsedLhr.audits?.['largest-contentful-paint']?.numericValue ?? null;
          const clsScore = parsedLhr.audits?.['cumulative-layout-shift']?.numericValue ?? null;

          return {
            status: 'success',
            auditedAt: parsedLhr.fetchTime ?? new Date().toISOString(),
            url: parsedLhr.finalUrl ?? targetRun.url ?? 'http://localhost:4173/Trex-Http-Client/',
            reportHtmlPath: targetRun.htmlPath,
            reportJsonPath: targetRun.jsonPath,
            scores: {
              performance: typeof pScore === 'number' ? Math.round(pScore * 100) : null,
              accessibility: typeof aScore === 'number' ? Math.round(aScore * 100) : null,
              bestPractices: typeof bpScore === 'number' ? Math.round(bpScore * 100) : null,
              seo: typeof seoScore === 'number' ? Math.round(seoScore * 100) : null,
            },
            metrics: {
              fcpMs,
              fcpFormatted: parsedLhr.audits?.['first-contentful-paint']?.displayValue ?? (fcpMs !== null ? `${(fcpMs / 1000).toFixed(1)} s` : null),
              lcpMs,
              lcpFormatted: parsedLhr.audits?.['largest-contentful-paint']?.displayValue ?? (lcpMs !== null ? `${(lcpMs / 1000).toFixed(1)} s` : null),
              clsScore,
              clsFormatted: parsedLhr.audits?.['cumulative-layout-shift']?.displayValue ?? (clsScore !== null ? clsScore.toFixed(2) : null),
            },
          };
        }
      } catch {
        return this.resolveFallbackLighthouseReport();
      }
    }

    return this.resolveFallbackLighthouseReport();
  };

  private resolveFallbackLighthouseReport = (): ILighthouseReportSummary => {
    const history = this.getHistory();
    const lastValidEntry = [...history].reverse().find((item) => item.lighthouse.status === 'success');

    if (lastValidEntry) {
      return {
        ...lastValidEntry.lighthouse,
        status: 'pending',
        errorMessage: `Auditoria da versão atual pendente. Exibindo última auditoria válida da versão ${lastValidEntry.version} (${lastValidEntry.lighthouse.auditedAt}).`,
      };
    }

    return {
      status: 'unavailable',
      auditedAt: new Date().toISOString(),
      url: 'http://localhost:4173/Trex-Http-Client/',
      scores: {
        performance: null,
        accessibility: null,
        bestPractices: null,
        seo: null,
      },
      metrics: {
        fcpMs: null,
        fcpFormatted: null,
        lcpMs: null,
        lcpFormatted: null,
        clsScore: null,
        clsFormatted: null,
      },
      errorMessage: 'Nenhum relatório de auditoria Lighthouse disponível para este ambiente.',
    };
  };

  public getHistory = (): IVersionMetricsHistoryItem[] => {
    const historyPath = join(this.projectRoot, 'docs', 'metrics-history.json');
    if (!this.fileSystem.existsSync(historyPath)) {
      return [];
    }

    try {
      const raw = this.fileSystem.readFileSync(historyPath, 'utf-8');
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed as IVersionMetricsHistoryItem[];
      }
      return [];
    } catch {
      return [];
    }
  };

  public recordVersion = (
    version: string,
    commitHash: string,
    releaseDate = new Date().toISOString(),
  ): IVersionMetricsHistoryItem => {
    const history = this.getHistory();
    const lighthouse = this.collectLighthouseMetrics();
    const bundle = this.collectBundleMetrics();

    const existingIndex = history.findIndex((item) => item.version === version);
    const newItem: IVersionMetricsHistoryItem = {
      version,
      releaseDate,
      commitHash,
      lighthouse,
      bundle,
      pullRequestsCount: 0,
      pullRequests: [],
    };

    if (existingIndex >= 0) {
      const current = history[existingIndex];
      newItem.pullRequestsCount = current?.pullRequestsCount ?? 0;
      newItem.pullRequests = current?.pullRequests ?? [];
      history[existingIndex] = newItem;
    } else {
      history.push(newItem);
    }

    const docsDir = join(this.projectRoot, 'docs');
    if (!this.fileSystem.existsSync(docsDir)) {
      this.fileSystem.mkdirSync(docsDir, { recursive: true });
    }

    const historyPath = join(docsDir, 'metrics-history.json');
    this.fileSystem.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf-8');

    return newItem;
  };

  public getComparison = (version: string): IVersionDiffComparison => {
    const history = this.getHistory();
    const currentIndex = history.findIndex((item) => item.version === version);

    if (currentIndex <= 0) {
      return {
        version,
        previousVersion: null,
        performanceDiff: null,
        accessibilityDiff: null,
        bestPracticesDiff: null,
        seoDiff: null,
        initialJsGzipDiffBytes: null,
      };
    }

    const current = history[currentIndex];
    const previous = history[currentIndex - 1];

    if (!current || !previous) {
      return {
        version,
        previousVersion: null,
        performanceDiff: null,
        accessibilityDiff: null,
        bestPracticesDiff: null,
        seoDiff: null,
        initialJsGzipDiffBytes: null,
      };
    }

    const calcDiff = (curr: number | null, prev: number | null): number | null => {
      if (curr === null || prev === null) {
        return null;
      }
      return curr - prev;
    };

    return {
      version,
      previousVersion: previous.version,
      performanceDiff: calcDiff(current.lighthouse.scores.performance, previous.lighthouse.scores.performance),
      accessibilityDiff: calcDiff(current.lighthouse.scores.accessibility, previous.lighthouse.scores.accessibility),
      bestPracticesDiff: calcDiff(current.lighthouse.scores.bestPractices, previous.lighthouse.scores.bestPractices),
      seoDiff: calcDiff(current.lighthouse.scores.seo, previous.lighthouse.scores.seo),
      initialJsGzipDiffBytes: current.bundle.initialJsGzipBytes - previous.bundle.initialJsGzipBytes,
    };
  };
}

export { MetricsCollectorService };
