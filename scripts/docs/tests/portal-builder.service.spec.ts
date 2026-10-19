import { describe, it, expect } from 'vitest';
import { PortalBuilderService } from '../portal-builder.service';
import type { GuideItem, PortalBuilderOptions } from '../interfaces';

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
});

