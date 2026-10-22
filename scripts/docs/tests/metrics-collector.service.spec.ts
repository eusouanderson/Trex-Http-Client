import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IFileSystem } from '../interfaces';
import { MetricsCollectorService } from '../metrics-collector.service';

describe('MetricsCollectorService', () => {
  let fileMap: Map<string, string>;
  let mockFileSystem: IFileSystem;
  const projectRoot = '/test/project';

  beforeEach(() => {
    fileMap = new Map();
    mockFileSystem = {
      existsSync: (path: string): boolean => fileMap.has(path),
      readFileSync: (path: string): string => {
        const content = fileMap.get(path);
        if (content === undefined) {
          throw new Error(`File not found: ${path}`);
        }
        return content;
      },
      writeFileSync: (path: string, data: string): void => {
        fileMap.set(path, data);
      },
      mkdirSync: vi.fn(),
      readdirSync: (): string[] => [],
    };
  });

  it('should return unavailable bundle metrics when performance report does not exist', () => {
    const service = new MetricsCollectorService(projectRoot, mockFileSystem);
    const result = service.collectBundleMetrics();

    expect(result.status).toBe('unavailable');
    expect(result.isBudgetRespected).toBe(false);
    expect(result.initialJsGzipBytes).toBe(0);
  });

  it('should parse bundle metrics correctly when performance report and budget exist', () => {
    const reportData = {
      timestamp: '2026-10-21T20:00:00.000Z',
      initialJsRawSizeBytes: 895000,
      initialJsGzipSizeBytes: 284000,
      totalJsGzipSizeBytes: 284000,
      totalCssGzipSizeBytes: 8400,
    };
    const budgetData = {
      limits: {
        maxInitialJsGzipBytes: 330000,
        maxTotalJsGzipBytes: 350000,
        maxTotalCssGzipBytes: 15000,
      },
    };

    fileMap.set('/test/project/dist/performance-report.json', JSON.stringify(reportData));
    fileMap.set('/test/project/performance-budget.json', JSON.stringify(budgetData));

    const service = new MetricsCollectorService(projectRoot, mockFileSystem);
    const result = service.collectBundleMetrics();

    expect(result.status).toBe('passed');
    expect(result.isBudgetRespected).toBe(true);
    expect(result.initialJsGzipBytes).toBe(284000);
    expect(result.maxInitialJsGzipLimit).toBe(330000);
  });

  it('should mark budget as failed when limits are exceeded', () => {
    const reportData = {
      timestamp: '2026-10-21T20:00:00.000Z',
      initialJsRawSizeBytes: 1200000,
      initialJsGzipSizeBytes: 400000,
      totalJsGzipSizeBytes: 400000,
      totalCssGzipSizeBytes: 20000,
    };
    const budgetData = {
      limits: {
        maxInitialJsGzipBytes: 330000,
        maxTotalJsGzipBytes: 350000,
        maxTotalCssGzipBytes: 15000,
      },
    };

    fileMap.set('/test/project/dist/performance-report.json', JSON.stringify(reportData));
    fileMap.set('/test/project/performance-budget.json', JSON.stringify(budgetData));

    const service = new MetricsCollectorService(projectRoot, mockFileSystem);
    const result = service.collectBundleMetrics();

    expect(result.status).toBe('failed');
    expect(result.isBudgetRespected).toBe(false);
  });

  it('should return unavailable lighthouse metrics when directory is empty and no history exists', () => {
    const service = new MetricsCollectorService(projectRoot, mockFileSystem);
    const result = service.collectLighthouseMetrics();

    expect(result.status).toBe('unavailable');
    expect(result.scores.performance).toBeNull();
  });

  it('should extract lighthouse metrics from manifest and report json', () => {
    const reportJson = {
      categories: {
        performance: { score: 0.98 },
        accessibility: { score: 1.0 },
        'best-practices': { score: 0.95 },
        seo: { score: 0.9 },
      },
      audits: {
        'first-contentful-paint': { numericValue: 520, displayValue: '0.5 s' },
        'largest-contentful-paint': { numericValue: 710, displayValue: '0.7 s' },
        'cumulative-layout-shift': { numericValue: 0, displayValue: '0' },
      },
    };

    const manifestData = [
      {
        url: 'http://localhost:4173/Trex-Http-Client/',
        isRepresentativeRun: true,
        jsonPath: '/test/project/.lighthouseci/rep.json',
        htmlPath: '/test/project/.lighthouseci/rep.html',
      },
    ];

    fileMap.set('/test/project/.lighthouseci/manifest.json', JSON.stringify(manifestData));
    fileMap.set('/test/project/.lighthouseci/rep.json', JSON.stringify(reportJson));

    const service = new MetricsCollectorService(projectRoot, mockFileSystem);
    const result = service.collectLighthouseMetrics();

    expect(result.status).toBe('success');
    expect(result.scores.performance).toBe(98);
    expect(result.scores.accessibility).toBe(100);
    expect(result.scores.bestPractices).toBe(95);
    expect(result.scores.seo).toBe(90);
    expect(result.metrics.fcpMs).toBe(520);
    expect(result.metrics.lcpMs).toBe(710);
    expect(result.metrics.clsScore).toBe(0);
    expect(result.reportHtmlPath).toBe('/test/project/.lighthouseci/rep.html');
  });

  it('should fallback to last known valid lighthouse result with pending status when current run is missing', () => {
    const historicalData = [
      {
        version: '1.13.0',
        releaseDate: '2026-10-21T00:00:00.000Z',
        commitHash: 'abc1234',
        lighthouse: {
          status: 'success' as const,
          auditedAt: '2026-10-21T00:00:00.000Z',
          url: 'http://localhost:4173/Trex-Http-Client/',
          scores: { performance: 100, accessibility: 100, bestPractices: 100, seo: 100 },
          metrics: {
            fcpMs: 500,
            fcpFormatted: '0.5 s',
            lcpMs: 700,
            lcpFormatted: '0.7 s',
            clsScore: 0,
            clsFormatted: '0',
          },
        },
        bundle: {
          status: 'passed' as const,
          measuredAt: '2026-10-21T00:00:00.000Z',
          initialJsRawBytes: 880000,
          initialJsGzipBytes: 280000,
          totalJsGzipBytes: 280000,
          totalCssGzipBytes: 8000,
          maxInitialJsGzipLimit: 330000,
          maxTotalJsGzipLimit: 350000,
          maxTotalCssGzipLimit: 15000,
          isBudgetRespected: true,
        },
        pullRequestsCount: 1,
        pullRequests: [28],
      },
    ];

    fileMap.set('/test/project/docs/metrics-history.json', JSON.stringify(historicalData));

    const service = new MetricsCollectorService(projectRoot, mockFileSystem);
    const result = service.collectLighthouseMetrics();

    expect(result.status).toBe('pending');
    expect(result.scores.performance).toBe(100);
    expect(result.errorMessage).toContain('1.13.0');
  });

  it('should record version metrics and calculate comparison with previous version', () => {
    const service = new MetricsCollectorService(projectRoot, mockFileSystem);

    fileMap.set('/test/project/dist/performance-report.json', JSON.stringify({
      timestamp: '2026-10-20T00:00:00.000Z',
      initialJsRawSizeBytes: 800000,
      initialJsGzipSizeBytes: 270000,
      totalJsGzipSizeBytes: 270000,
      totalCssGzipSizeBytes: 8000,
    }));
    fileMap.set('/test/project/performance-budget.json', JSON.stringify({
      limits: { maxInitialJsGzipBytes: 330000, maxTotalJsGzipBytes: 350000, maxTotalCssGzipBytes: 15000 },
    }));
    fileMap.set('/test/project/.lighthouseci/manifest.json', JSON.stringify([{
      isRepresentativeRun: true,
      jsonPath: '/test/project/.lighthouseci/rep1.json',
      url: 'http://localhost:4173/Trex-Http-Client/',
    }]));
    fileMap.set('/test/project/.lighthouseci/rep1.json', JSON.stringify({
      categories: { performance: { score: 0.9 }, accessibility: { score: 0.9 }, 'best-practices': { score: 0.9 }, seo: { score: 0.9 } },
      audits: { 'first-contentful-paint': { numericValue: 600 }, 'largest-contentful-paint': { numericValue: 800 }, 'cumulative-layout-shift': { numericValue: 0 } },
    }));

    service.recordVersion('1.13.0', 'hash1', '2026-10-20T00:00:00.000Z');

    fileMap.set('/test/project/dist/performance-report.json', JSON.stringify({
      timestamp: '2026-10-21T00:00:00.000Z',
      initialJsRawSizeBytes: 820000,
      initialJsGzipSizeBytes: 275000,
      totalJsGzipSizeBytes: 275000,
      totalCssGzipSizeBytes: 8200,
    }));
    fileMap.set('/test/project/.lighthouseci/manifest.json', JSON.stringify([{
      isRepresentativeRun: true,
      jsonPath: '/test/project/.lighthouseci/rep2.json',
      url: 'http://localhost:4173/Trex-Http-Client/',
    }]));
    fileMap.set('/test/project/.lighthouseci/rep2.json', JSON.stringify({
      categories: { performance: { score: 1.0 }, accessibility: { score: 1.0 }, 'best-practices': { score: 0.95 }, seo: { score: 0.9 } },
      audits: { 'first-contentful-paint': { numericValue: 500 }, 'largest-contentful-paint': { numericValue: 700 }, 'cumulative-layout-shift': { numericValue: 0 } },
    }));

    service.recordVersion('1.14.0', 'hash2', '2026-10-21T00:00:00.000Z');

    const history = service.getHistory();
    expect(history.length).toBe(2);
    expect(history[0]?.version).toBe('1.13.0');
    expect(history[1]?.version).toBe('1.14.0');

    const comparison = service.getComparison('1.14.0');
    expect(comparison.previousVersion).toBe('1.13.0');
    expect(comparison.performanceDiff).toBe(10);
    expect(comparison.accessibilityDiff).toBe(10);
    expect(comparison.bestPracticesDiff).toBe(5);
    expect(comparison.seoDiff).toBe(0);
    expect(comparison.initialJsGzipDiffBytes).toBe(5000);
  });
});
