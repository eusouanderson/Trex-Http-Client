import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ICommandRunner, IFileSystem, IGroqDocService } from '../interfaces';
import { PrHistoryService } from '../pr-history.service';

describe('PrHistoryService', () => {
  let fileMap: Map<string, string>;
  let mockFileSystem: IFileSystem;
  let mockCommandRunner: ICommandRunner;
  let mockGroqDocService: IGroqDocService;
  let execMock: ReturnType<typeof vi.fn>;
  let analyzeChangesMock: ReturnType<typeof vi.fn>;
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
    };

    execMock = vi.fn();
    mockCommandRunner = {
      exec: execMock,
    };

    analyzeChangesMock = vi.fn().mockResolvedValue({
      summary: 'Resumo da PR via Groq AI',
      architectureHighlights: [],
      changelogHighlights: [],
      generatedAt: '2026-10-21T00:00:00.000Z',
      modelUsed: 'mock-model',
    });

    mockGroqDocService = {
      analyzeChanges: analyzeChangesMock,
    };
  });

  it('should return empty history when pr-history.json does not exist', () => {
    const service = new PrHistoryService(
      projectRoot,
      mockFileSystem,
      mockCommandRunner,
      mockGroqDocService,
    );
    const history = service.getHistory();
    expect(history).toEqual([]);
  });

  it('should return parsed history when pr-history.json exists', () => {
    const existing = [
      {
        number: 27,
        title: 'fix(collections): unificar docs',
        url: 'https://github.com/eusouanderson/Trex-Http-Client/pull/27',
        author: 'Anderson',
        mergedAt: '2026-10-19T23:46:34-03:00',
        targetBranch: 'main',
        mergeCommit: 'ad0e1d3',
        summary: 'Correção de exportação e unificação de docs.',
        targetVersion: '1.12.1',
      },
    ];
    fileMap.set('/test/project/docs/pr-history.json', JSON.stringify(existing));

    const service = new PrHistoryService(
      projectRoot,
      mockFileSystem,
      mockCommandRunner,
      mockGroqDocService,
    );
    const history = service.getHistory();
    expect(history.length).toBe(1);
    expect(history[0]?.number).toBe(27);
  });

  it('should sync new PRs from git merges without duplicating existing PRs', async () => {
    const existing = [
      {
        number: 27,
        title: 'fix(collections): unificar docs',
        url: 'https://github.com/eusouanderson/Trex-Http-Client/pull/27',
        author: 'Anderson',
        mergedAt: '2026-10-19T23:46:34-03:00',
        targetBranch: 'main',
        mergeCommit: 'ad0e1d3',
        summary: 'Resumo existente preservado.',
        targetVersion: '1.12.1',
      },
    ];
    fileMap.set('/test/project/docs/pr-history.json', JSON.stringify(existing));

    const gitLogOutput = [
      '84788b8|Merge pull request #28 from eusouanderson/feature/remove-header-ready-status|Anderson|2026-10-21T18:00:00-03:00',
      'ad0e1d3|Merge pull request #27 from eusouanderson/fix/export-import-collection-16|Anderson|2026-10-19T23:46:34-03:00',
    ].join('\n');

    execMock.mockImplementation((cmd: string) => {
      if (cmd.includes('git log --merges')) {
        return gitLogOutput;
      }
      if (cmd.includes('git log -1 --pretty=%B 84788b8')) {
        return 'Merge pull request #28 from eusouanderson/feature/remove-header-ready-status\n\nfeat(layout): remover status pronto e mover gerenciamento';
      }
      return '';
    });

    const service = new PrHistoryService(
      projectRoot,
      mockFileSystem,
      mockCommandRunner,
      mockGroqDocService,
    );
    const result = await service.syncFromGit('1.13.0');

    expect(result.length).toBe(2);
    const pr28 = result.find((item) => item.number === 28);
    const pr27 = result.find((item) => item.number === 27);

    expect(pr28).toBeDefined();
    expect(pr28?.number).toBe(28);
    expect(pr28?.title).toBe('feat(layout): remover status pronto e mover gerenciamento');
    expect(pr28?.targetVersion).toBe('1.13.0');
    expect(pr28?.url).toBe('https://github.com/eusouanderson/Trex-Http-Client/pull/28');
    expect(pr28?.summary).toBe('Resumo da PR via Groq AI');

    expect(pr27?.summary).toBe('Resumo existente preservado.');

    const savedFile = fileMap.get('/test/project/docs/pr-history.json');
    expect(savedFile).toBeDefined();
    if (typeof savedFile === 'string') {
      const parsedSaved = JSON.parse(savedFile) as unknown[];
      expect(parsedSaved.length).toBe(2);
    }
  });

  it('should fallback to commit message when Groq fails during sync', async () => {
    analyzeChangesMock.mockRejectedValue(new Error('Groq offline'));

    const gitLogOutput = '73000ed|Merge pull request #29 from eusouanderson/feature/separated-panels-layout|Anderson|2026-10-21T19:00:00-03:00';

    execMock.mockImplementation((cmd: string) => {
      if (cmd.includes('git log --merges')) {
        return gitLogOutput;
      }
      if (cmd.includes('git log -1 --pretty=%B 73000ed')) {
        return 'Merge pull request #29 from branch\n\nfeat(layout): implementar opcao de layout com paineis separados';
      }
      return '';
    });

    const service = new PrHistoryService(
      projectRoot,
      mockFileSystem,
      mockCommandRunner,
      mockGroqDocService,
    );
    const result = await service.syncFromGit('1.14.0');

    expect(result.length).toBe(1);
    expect(result[0]?.number).toBe(29);
    expect(result[0]?.summary).toBe('feat(layout): implementar opcao de layout com paineis separados');
  });
});

