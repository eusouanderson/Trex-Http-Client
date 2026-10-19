import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocOrchestratorService } from '../doc-orchestrator.service';
import type {
  ICommandRunner,
  IFileSystem,
  IGroqDocService,
  IPortalBuilderService,
} from '../interfaces';

describe('DocOrchestratorService', () => {
  let mockGroqService: IGroqDocService;
  let mockPortalBuilder: IPortalBuilderService;
  let mockFileSystem: IFileSystem;
  let mockCommandRunner: ICommandRunner;

  let execSpy: ReturnType<typeof vi.fn>;
  let analyzeSpy: ReturnType<typeof vi.fn>;
  let buildPortalSpy: ReturnType<typeof vi.fn>;
  let buildGuideSpy: ReturnType<typeof vi.fn>;
  let existsSpy: ReturnType<typeof vi.fn>;
  let mkdirSpy: ReturnType<typeof vi.fn>;
  let readSpy: ReturnType<typeof vi.fn>;
  let writeSpy: ReturnType<typeof vi.fn>;

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
  });

  it('should orchestrate document generation and return true', async () => {
    const orchestrator = new DocOrchestratorService(
      '/mock-root',
      mockGroqService,
      mockPortalBuilder,
      mockFileSystem,
      mockCommandRunner,
    );

    const result = await orchestrator.run();

    expect(result).toBe(true);
    expect(execSpy).toHaveBeenCalledWith('npx typedoc', '/mock-root');
    expect(analyzeSpy).toHaveBeenCalled();
    expect(buildPortalSpy).toHaveBeenCalled();
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
    );

    const result = await orchestrator.run();
    expect(result).toBe(true);
    expect(buildPortalSpy).toHaveBeenCalledWith(
      expect.objectContaining({ version: '1.0.0' }),
    );
  });
});
