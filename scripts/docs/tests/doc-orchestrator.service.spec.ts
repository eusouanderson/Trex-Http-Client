import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocOrchestratorService } from '../doc-orchestrator.service';
import type {
  ICommandRunner,
  IFileSystem,
  IGroqDocService,
  IMetricsCollectorService,
  IPortalBuilderService,
  IPrHistoryService,
  PortalBuilderOptions,
} from '../interfaces';

describe('DocOrchestratorService', () => {
  let mockGroqService: IGroqDocService;
  let mockPortalBuilder: IPortalBuilderService;
  let mockFileSystem: IFileSystem;
  let mockCommandRunner: ICommandRunner;
  let mockMetricsCollector: IMetricsCollectorService;
  let mockPrHistoryService: IPrHistoryService;

  let execSpy: ReturnType<typeof vi.fn>;
  let analyzeSpy: ReturnType<typeof vi.fn>;
  let buildPortalSpy: ReturnType<typeof vi.fn>;
  let buildGuideSpy: ReturnType<typeof vi.fn>;
  let existsSpy: ReturnType<typeof vi.fn>;
  let mkdirSpy: ReturnType<typeof vi.fn>;
  let readSpy: ReturnType<typeof vi.fn>;
  let writeSpy: ReturnType<typeof vi.fn>;
  let recordVersionMock: ReturnType<typeof vi.fn>;
  let syncFromGitMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.restoreAllMocks();

    analyzeSpy = vi.fn().mockResolvedValue({
      summary: 'Mocked summary',
      architectureHighlights: ['Highlight 1'],
      changelogHighlights: ['Changelog 1'],
      generatedAt: '2026-10-19T20:00:00.000Z',
      modelUsed: 'mock-model',
    });

    buildPortalSpy = vi.fn().mockReturnValue('<html>portal</html>');
    buildGuideSpy = vi.fn().mockReturnValue('<html>guide</html>');

    existsSpy = vi.fn().mockReturnValue(true);
    mkdirSpy = vi.fn();
    readSpy = vi.fn().mockImplementation((path: string) => {
      if (path.endsWith('package.json')) {
        return JSON.stringify({ version: '1.9.0' });
      }
      return '# Mock guide content';
    });
    writeSpy = vi.fn();

    execSpy = vi.fn().mockReturnValue('mock-exec-result');
    recordVersionMock = vi.fn();
    syncFromGitMock = vi.fn().mockResolvedValue([]);

    mockGroqService = {
      analyzeChanges: analyzeSpy,
    };

    mockPortalBuilder = {
      buildPortalHtml: buildPortalSpy,
      buildGuideHtml: buildGuideSpy,
    };

    mockFileSystem = {
      existsSync: existsSpy,
      mkdirSync: mkdirSpy,
      readFileSync: readSpy,
      writeFileSync: writeSpy,
    };

    mockCommandRunner = {
      exec: execSpy,
    };

    mockMetricsCollector = {
      collectBundleMetrics: vi.fn().mockReturnValue({
        status: 'passed',
        measuredAt: '2026-10-21T00:00:00.000Z',
        initialJsRawBytes: 800000,
        initialJsGzipBytes: 280000,
        totalJsGzipBytes: 280000,
        totalCssGzipBytes: 8000,
        maxInitialJsGzipLimit: 330000,
        maxTotalJsGzipLimit: 350000,
        maxTotalCssGzipLimit: 15000,
        isBudgetRespected: true,
      }),
      collectLighthouseMetrics: vi.fn().mockReturnValue({
        status: 'success',
        auditedAt: '2026-10-21T00:00:00.000Z',
        url: 'http://localhost:4173/Trex-Http-Client/',
        scores: { performance: 100, accessibility: 100, bestPractices: 100, seo: 100 },
        metrics: { fcpMs: 500, fcpFormatted: '0.5 s', lcpMs: 700, lcpFormatted: '0.7 s', clsScore: 0, clsFormatted: '0' },
      }),
      getHistory: vi.fn().mockReturnValue([]),
      recordVersion: recordVersionMock,
      getComparison: vi.fn().mockReturnValue({
        version: '1.9.0',
        previousVersion: null,
        performanceDiff: null,
        accessibilityDiff: null,
        bestPracticesDiff: null,
        seoDiff: null,
        initialJsGzipDiffBytes: null,
      }),
    };

    mockPrHistoryService = {
      getHistory: vi.fn().mockReturnValue([
        {
          number: 28,
          title: 'PR #28',
          url: 'https://github.com/test/pull/28',
          author: 'Test',
          mergedAt: '2026-10-21T00:00:00.000Z',
          targetBranch: 'main',
          mergeCommit: 'abc1234',
          summary: 'Summary 28',
          targetVersion: '1.9.0',
        },
      ]),
      syncFromGit: syncFromGitMock,
    };
  });

  it('should orchestrate document generation with metrics and PR history', async () => {
    const orchestrator = new DocOrchestratorService(
      '/mock-root',
      mockGroqService,
      mockPortalBuilder,
      mockFileSystem,
      mockCommandRunner,
      mockMetricsCollector,
      mockPrHistoryService,
    );

    const result = await orchestrator.run();

    expect(result).toBe(true);
    expect(execSpy).toHaveBeenCalledWith('npx typedoc', '/mock-root');
    expect(syncFromGitMock).toHaveBeenCalledWith('1.9.0');
    expect(recordVersionMock).toHaveBeenCalled();
    expect(buildPortalSpy).toHaveBeenCalled();

    const lastCall = (buildPortalSpy.mock.calls[0] as unknown as [PortalBuilderOptions])[0];
    expect(lastCall.version).toBe('1.9.0');
    expect(lastCall.lighthouseMetrics?.status).toBe('success');
    expect(lastCall.bundleMetrics?.isBudgetRespected).toBe(true);
    expect(lastCall.pullRequests?.[0]?.number).toBe(28);
    expect(writeSpy).toHaveBeenCalled();
  });

  it('should throw error when TypeDoc execution fails', async () => {
    execSpy.mockImplementation((cmd: string) => {
      if (cmd.includes('typedoc')) {
        throw new Error('TypeDoc failure');
      }
      return 'ok';
    });

    const orchestrator = new DocOrchestratorService(
      '/mock-root',
      mockGroqService,
      mockPortalBuilder,
      mockFileSystem,
      mockCommandRunner,
      mockMetricsCollector,
      mockPrHistoryService,
    );

    await expect(orchestrator.run()).rejects.toThrow('Falha na execução do TypeDoc: TypeDoc failure');
  });

  it('should throw error when artifacts validation fails', async () => {
    existsSpy.mockImplementation((p: string) => {
      if (p.includes('api/index.html')) {
        return false;
      }
      return true;
    });

    const orchestrator = new DocOrchestratorService(
      '/mock-root',
      mockGroqService,
      mockPortalBuilder,
      mockFileSystem,
      mockCommandRunner,
      mockMetricsCollector,
      mockPrHistoryService,
    );

    await expect(orchestrator.run()).rejects.toThrow('Falha na validação dos artefatos de documentação');
  });

  it('should fallback to default version if package.json read throws', async () => {
    readSpy.mockImplementation((p: string) => {
      if (p.endsWith('package.json')) {
        throw new Error('Read error');
      }
      return '';
    });

    const orchestrator = new DocOrchestratorService(
      '/mock-root',
      mockGroqService,
      mockPortalBuilder,
      mockFileSystem,
      mockCommandRunner,
      mockMetricsCollector,
      mockPrHistoryService,
    );

    const result = await orchestrator.run();
    expect(result).toBe(true);
    const lastCall = (buildPortalSpy.mock.calls[0] as unknown as [PortalBuilderOptions])[0];
    expect(lastCall.version).toBe('1.0.0');
  });
});
