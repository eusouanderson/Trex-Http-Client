import { describe, expect, it, vi } from 'vitest';
import { BundleAnalyzerService } from '../bundle-analyzer.service';
import { BudgetValidatorService } from '../budget-validator.service';
import type { IBundleReport, IFileSystem, IPerformanceOrchestratorOptions } from '../interfaces';
import { PerformanceOrchestratorService } from '../performance-orchestrator.service';

describe('PerformanceOrchestratorService', () => {
  const mockReport: IBundleReport = {
    timestamp: '2026-10-19T00:00:00.000Z',
    totalRawSizeBytes: 800000,
    totalGzipSizeBytes: 250000,
    totalJsRawSizeBytes: 700000,
    totalJsGzipSizeBytes: 220000,
    initialJsRawSizeBytes: 700000,
    initialJsGzipSizeBytes: 220000,
    totalCssRawSizeBytes: 40000,
    totalCssGzipSizeBytes: 8000,
    assets: [
      {
        name: 'index-abc.js',
        path: 'assets/index-abc.js',
        canonicalName: 'index.js',
        category: 'js-entry',
        rawSizeBytes: 700000,
        gzipSizeBytes: 220000,
      },
    ],
  };

  let writeFileSyncMock = vi.fn();
  let mkdirSyncMock = vi.fn();

  const createMockFileSystem = (existingFiles: Record<string, string>): IFileSystem => {
    writeFileSyncMock = vi.fn();
    mkdirSyncMock = vi.fn();

    return {
      existsSync: vi.fn((path: string): boolean => path in existingFiles),
      readFileSync: vi.fn((path: string): string => {
        const content = existingFiles[path];
        if (content === undefined) {
          throw new Error(`File not found: ${path}`);
        }
        return content;
      }),
      writeFileSync: writeFileSyncMock,
      readdirSync: vi.fn(() => []),
      statSync: vi.fn(() => ({
        size: 100,
        isFile: (): boolean => true,
        isDirectory: (): boolean => false,
      })),
      mkdirSync: mkdirSyncMock,
    };
  };

  it('deve orquestrar a analise, validar orcamento e salvar relatorios', () => {
    const fs = createMockFileSystem({
      '/app/baseline.json': JSON.stringify(mockReport),
      '/app/budget.json': JSON.stringify({
        mode: 'warn',
        limits: {
          maxInitialJsRawBytes: 1000000,
          maxInitialJsGzipBytes: 300000,
          maxTotalJsRawBytes: 1000000,
          maxTotalJsGzipBytes: 300000,
          maxTotalCssRawBytes: 100000,
          maxTotalCssGzipBytes: 20000,
          maxAllowedGrowthPercent: 15,
        },
      }),
    });

    const analyzer = new BundleAnalyzerService(fs);
    vi.spyOn(analyzer, 'analyze').mockReturnValue(mockReport);

    const validator = new BudgetValidatorService();
    const orchestrator = new PerformanceOrchestratorService(analyzer, validator, fs);

    const options: IPerformanceOrchestratorOptions = {
      distDir: '/app/dist',
      baselinePath: '/app/baseline.json',
      budgetPath: '/app/budget.json',
      reportJsonPath: '/app/dist/report.json',
      reportMarkdownPath: '/app/dist/report.md',
      stepSummaryPath: '/app/summary.md',
    };

    const result = orchestrator.run(options);

    expect(result.passed).toBe(true);
    expect(writeFileSyncMock).toHaveBeenCalledWith('/app/dist/report.json', expect.any(String));
    expect(writeFileSyncMock).toHaveBeenCalledWith('/app/dist/report.md', expect.any(String));
    expect(writeFileSyncMock).toHaveBeenCalledWith('/app/summary.md', expect.any(String));
  });

  it('deve usar defaults quando arquivos de baseline e budget nao existirem ou forem invalidos', () => {
    const fs = createMockFileSystem({
      '/app/budget.json': '{ invalid-json',
    });

    const analyzer = new BundleAnalyzerService(fs);
    vi.spyOn(analyzer, 'analyze').mockReturnValue(mockReport);

    const validator = new BudgetValidatorService();
    const orchestrator = new PerformanceOrchestratorService(analyzer, validator, fs);

    const options: IPerformanceOrchestratorOptions = {
      distDir: '/app/dist',
      baselinePath: '/missing/baseline.json',
      budgetPath: '/app/budget.json',
      reportJsonPath: '/app/dist/report.json',
      reportMarkdownPath: '/app/dist/report.md',
      forceMode: 'error',
    };

    const result = orchestrator.run(options);

    expect(result.mode).toBe('error');
    expect(result.passed).toBe(true);
  });

  it('deve criar pasta pai de relatorios se nao existir', () => {
    const fs = createMockFileSystem({});
    const analyzer = new BundleAnalyzerService(fs);
    vi.spyOn(analyzer, 'analyze').mockReturnValue(mockReport);

    const validator = new BudgetValidatorService();
    const orchestrator = new PerformanceOrchestratorService(analyzer, validator, fs);

    const options: IPerformanceOrchestratorOptions = {
      distDir: '/app/dist',
      baselinePath: '/missing/baseline.json',
      budgetPath: '/missing/budget.json',
      reportJsonPath: '/app/deep/folder/report.json',
      reportMarkdownPath: '/app/deep/folder/report.md',
    };

    orchestrator.run(options);

    expect(mkdirSyncMock).toHaveBeenCalledWith('/app/deep/folder', { recursive: true });
  });

  it('deve instanciar com dependencias padrao quando nao fornecidas', () => {
    const orchestrator = new PerformanceOrchestratorService();
    expect(orchestrator).toBeDefined();
  });
});
