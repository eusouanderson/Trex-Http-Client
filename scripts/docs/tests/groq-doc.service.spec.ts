import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroqDocService } from '../groq-doc.service';
import type { DocContextInput } from '../interfaces';

describe('GroqDocService', () => {
  const sampleInput: DocContextInput = {
    commitHash: 'a1b2c3d',
    commitMessage: 'feat(docs): adiciona gerador automatico',
    gitDiff: 'diff --git a/file.ts b/file.ts',
    existingArchitecture: '# Architecture',
    existingChangelog: '# Changelog',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return fallback output when apiKey is not provided', async () => {
    const service = new GroqDocService('');
    const result = await service.analyzeChanges(sampleInput);

    expect(result.modelUsed).toBe('fallback-local');
    expect(result.summary).toContain('feat(docs)');
    expect(result.architectureHighlights.length).toBeGreaterThan(0);
    expect(result.changelogHighlights).toContain('feat(docs): adiciona gerador automatico');
  });

  it('should call Groq API and parse valid JSON response', async () => {
    const mockResponse = {
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: JSON.stringify({
              summary: 'Resumo analisado pela IA.',
              architectureHighlights: ['Nova feature de documentação.'],
              changelogHighlights: ['feat(docs): adiciona gerador.'],
            }),
          },
          finish_reason: 'stop',
        },
      ],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => Promise.resolve(mockResponse),
    });

    const service = new GroqDocService('mock-api-key');
    const result = await service.analyzeChanges(sampleInput);

    expect(result.summary).toBe('Resumo analisado pela IA.');
    expect(result.architectureHighlights).toEqual(['Nova feature de documentação.']);
    expect(result.changelogHighlights).toEqual(['feat(docs): adiciona gerador.']);
    expect(result.modelUsed).toBe('llama-3.3-70b-versatile');
  });

  it('should sanitize markdown json codeblocks from Groq response', async () => {
    const mockResponse = {
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: '```json\n{"summary": "Sanitizado com sucesso", "architectureHighlights": [], "changelogHighlights": []}\n```',
          },
          finish_reason: 'stop',
        },
      ],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => Promise.resolve(mockResponse),
    });

    const service = new GroqDocService('mock-api-key');
    const result = await service.analyzeChanges(sampleInput);

    expect(result.summary).toBe('Sanitizado com sucesso');
  });

  it('should fallback to secondary model when primary fails and then succeed', async () => {
    const mockSecondaryResponse = {
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: JSON.stringify({
              summary: 'Resposta do modelo secundario.',
              architectureHighlights: ['Destaque secundario'],
              changelogHighlights: ['Changelog secundario'],
            }),
          },
          finish_reason: 'stop',
        },
      ],
    };

    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => Promise.resolve(mockSecondaryResponse),
      });

    const service = new GroqDocService('mock-api-key');
    const result = await service.analyzeChanges(sampleInput);

    expect(result.summary).toBe('Resposta do modelo secundario.');
    expect(result.modelUsed).toBe('llama-3.1-8b-instant');
  });

  it('should return fallback-error when both primary and secondary models fail', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

    const service = new GroqDocService('mock-api-key');
    const result = await service.analyzeChanges(sampleInput);

    expect(result.modelUsed).toBe('fallback-error');
    expect(result.summary).toContain('feat(docs)');
  });

  it('should cleanly parse and sanitize semantic-release commit messages in fallback mode', async () => {
    const releaseInput: DocContextInput = {
      commitHash: '32d1e40',
      commitMessage:
        'chore(release): 1.11.0 [skip ci]\n\n# [1.11.0](https://github.com/eusouanderson/Trex-Http-Client/compare/v1.10.0...v1.11.0) (2026-10-20)\n\n### Features\n\n* **perf:** implementar auditoria de bundle, orcamento e lighthouse ci ([32d1e40](https://github.com/eusouanderson/Trex-Http-Client/commit/32d1e4026de3c55f37120aceacd84d74ff6ccc53))',
      gitDiff: 'diff --git a/file.ts b/file.ts',
      existingArchitecture: '# Architecture',
      existingChangelog: '# Changelog',
    };

    const service = new GroqDocService('');
    const result = await service.analyzeChanges(releaseInput);

    expect(result.summary).not.toContain('[skip ci]');
    expect(result.summary).not.toContain('# [1.11.0]');
    expect(result.summary).toContain('perf: implementar auditoria de bundle, orcamento e lighthouse ci');
    expect(result.changelogHighlights).toEqual([
      'perf: implementar auditoria de bundle, orcamento e lighthouse ci',
    ]);
  });
});

