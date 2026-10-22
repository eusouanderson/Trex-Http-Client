import { describe, it, expect } from 'vitest';
import { PortalBuilderService } from '../portal-builder.service';
import type {
  GuideItem,
  IBundleMetricsSummary,
  ILighthouseReportSummary,
  IPullRequestDocItem,
  IVersionDiffComparison,
  IVersionMetricsHistoryItem,
  PortalBuilderOptions,
} from '../interfaces';

describe('PortalBuilderService', () => {
  const service = new PortalBuilderService();

  const mockGuide: GuideItem = {
    id: 'test-guide',
    title: 'Guia de Exemplo',
    description: 'Descricao do guia de exemplo',
    fileName: 'test-guide',
    content: '# Titulo Principal\n\nParagrafo descritivo com **negrito** e `codigo`.\n\n- Item 1\n- Item 2\n\n```typescript\nconst x = 10;\n```',
  };

  const mockOptions: PortalBuilderOptions = {
    title: 'Trex HTTP Client — Docs',
    version: '1.9.0',
    commitHash: 'f4e3d2c',
    baseUrl: '/Trex-Http-Client/docs/',
    apiDocsPath: './api/index.html',
    contextOutput: {
      summary: 'Resumo geral dos testes.',
      architectureHighlights: ['Highlight 1', 'Highlight 2'],
      changelogHighlights: ['Changelog 1'],
      generatedAt: '2026-10-19T20:00:00.000Z',
      modelUsed: 'test-model',
    },
    guides: [mockGuide],
  };

  it('should build portal HTML with valid structure, version, and links', () => {
    const html = service.buildPortalHtml(mockOptions);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Trex HTTP Client — Docs');
    expect(html).toContain('v1.9.0');
    expect(html).toContain('f4e3d2c');
    expect(html).toContain('Resumo geral dos testes.');
    expect(html).toContain('Highlight 1');
    expect(html).toContain('Changelog 1');
    expect(html).toContain('test-model');
    expect(html).toContain('./guides/test-guide.html');
    expect(html).toContain('./api/index.html');
  });

  it('should escape HTML characters in title and dynamic text', () => {
    const unsafeOptions: PortalBuilderOptions = {
      ...mockOptions,
      title: 'Trex <script>alert("xss")</script>',
      contextOutput: {
        ...mockOptions.contextOutput,
        summary: 'Safe & sound with <brackets>',
      },
    };

    const html = service.buildPortalHtml(unsafeOptions);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('Safe &amp; sound with &lt;brackets&gt;');
  });

  it('should build guide HTML converting markdown to elements', () => {
    const guideHtml = service.buildGuideHtml(mockGuide, mockOptions);

    expect(guideHtml).toContain('<!DOCTYPE html>');
    expect(guideHtml).toContain('<h1>Titulo Principal</h1>');
    expect(guideHtml).toContain('<strong>negrito</strong>');
    expect(guideHtml).toContain('<code>codigo</code>');
    expect(guideHtml).toContain('<li>Item 1</li>');
    expect(guideHtml).toContain('<pre><code>const x = 10;</code></pre>');
    expect(guideHtml).toContain('← Voltar para Trex Docs');
  });

  it('should render official documentation badge and clean changelog markdown when model is fallback', () => {
    const fallbackOptions: PortalBuilderOptions = {
      ...mockOptions,
      contextOutput: {
        ...mockOptions.contextOutput,
        modelUsed: 'fallback-error',
        changelogHighlights: [
          '* **perf:** implementar auditoria ([32d1e40](https://github.com/test))',
        ],
      },
    };

    const html = service.buildPortalHtml(fallbackOptions);
    expect(html).toContain('Documentação Oficial');
    expect(html).not.toContain('fallback-error');
    expect(html).toContain('perf: implementar auditoria');
    expect(html).not.toContain('32d1e40');
  });

  it('should render real Lighthouse and Bundle metrics when provided', () => {
    const lighthouseMetrics: ILighthouseReportSummary = {
      status: 'success',
      auditedAt: '2026-10-21T18:00:00.000Z',
      url: 'http://localhost:4173/Trex-Http-Client/',
      scores: {
        performance: 98,
        accessibility: 85,
        bestPractices: 100,
        seo: 90,
      },
      metrics: {
        fcpMs: 520,
        fcpFormatted: '0.52 s',
        lcpMs: 740,
        lcpFormatted: '0.74 s',
        clsScore: 0,
        clsFormatted: '0',
      },
    };

    const bundleMetrics: IBundleMetricsSummary = {
      status: 'passed',
      measuredAt: '2026-10-21T18:00:00.000Z',
      initialJsRawBytes: 895000,
      initialJsGzipBytes: 284000,
      totalJsGzipBytes: 284000,
      totalCssGzipBytes: 8400,
      maxInitialJsGzipLimit: 330000,
      maxTotalJsGzipLimit: 350000,
      maxTotalCssGzipLimit: 15000,
      isBudgetRespected: true,
    };

    const previousComparison: IVersionDiffComparison = {
      version: '1.14.0',
      previousVersion: '1.13.0',
      performanceDiff: 2,
      accessibilityDiff: -5,
      bestPracticesDiff: 0,
      seoDiff: 0,
      initialJsGzipDiffBytes: 4000,
    };

    const pullRequests: IPullRequestDocItem[] = [
      {
        number: 29,
        title: 'feat(layout): implementar opcao de layout com paineis separados',
        url: 'https://github.com/eusouanderson/Trex-Http-Client/pull/29',
        author: 'Anderson',
        mergedAt: '2026-10-21T19:00:00-03:00',
        targetBranch: 'main',
        mergeCommit: '73000ed',
        summary: 'Adicionada alternância entre layout padrão e painéis separados.',
        targetVersion: '1.14.0',
      },
    ];

    const versionHistory: IVersionMetricsHistoryItem[] = [
      {
        version: '1.14.0',
        releaseDate: '2026-10-21T19:00:00-03:00',
        commitHash: '73000ed',
        lighthouse: lighthouseMetrics,
        bundle: bundleMetrics,
        pullRequestsCount: 1,
        pullRequests: [29],
      },
    ];

    const html = service.buildPortalHtml({
      ...mockOptions,
      version: '1.14.0',
      lighthouseMetrics,
      bundleMetrics,
      previousComparison,
      pullRequests,
      versionHistory,
    });

    expect(html).toContain('98');
    expect(html).toContain('85');
    expect(html).toContain('100');
    expect(html).toContain('90');
    expect(html).toContain('0.52 s');
    expect(html).toContain('0.74 s');
    expect(html).toContain('Orçamento Respeitado');
    expect(html).toContain('https://github.com/eusouanderson/Trex-Http-Client/pull/29');
    expect(html).toContain('PR #29');
    expect(html).toContain('feat(layout): implementar opcao de layout com paineis separados');
    expect(html).toContain('v1.13.0');
    expect(html).toContain('+2');
  });

  it('should render explicit pending state when lighthouse metrics are pending or unavailable', () => {
    const lighthouseMetrics: ILighthouseReportSummary = {
      status: 'pending',
      auditedAt: '2026-10-20T10:00:00.000Z',
      url: 'http://localhost:4173/Trex-Http-Client/',
      scores: {
        performance: 95,
        accessibility: 90,
        bestPractices: 95,
        seo: 90,
      },
      metrics: {
        fcpMs: 600,
        fcpFormatted: '0.6 s',
        lcpMs: 800,
        lcpFormatted: '0.8 s',
        clsScore: 0,
        clsFormatted: '0',
      },
      errorMessage: 'Auditoria da versão atual pendente. Exibindo última auditoria válida da versão 1.13.0.',
    };

    const html = service.buildPortalHtml({
      ...mockOptions,
      lighthouseMetrics,
    });

    expect(html).toContain('Pendente');
    expect(html).toContain('Auditoria da versão atual pendente');
  });
});
