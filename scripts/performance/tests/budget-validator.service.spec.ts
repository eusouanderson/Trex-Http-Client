import { describe, expect, it } from 'vitest';
import { BudgetValidatorService } from '../budget-validator.service';
import type { IBundleReport, IPerformanceBudgetConfig } from '../interfaces';

describe('BudgetValidatorService', () => {
  const defaultLimits: IPerformanceBudgetConfig = {
    mode: 'warn',
    limits: {
      maxInitialJsRawBytes: 1000 * 1024,
      maxInitialJsGzipBytes: 350 * 1024,
      maxTotalJsRawBytes: 1200 * 1024,
      maxTotalJsGzipBytes: 400 * 1024,
      maxTotalCssRawBytes: 100 * 1024,
      maxTotalCssGzipBytes: 30 * 1024,
      maxAllowedGrowthPercent: 10,
    },
  };

  const createMockReport = (overrides?: Partial<IBundleReport>): IBundleReport => {
    return {
      timestamp: new Date().toISOString(),
      totalRawSizeBytes: 900 * 1024,
      totalGzipSizeBytes: 300 * 1024,
      totalJsRawSizeBytes: 850 * 1024,
      totalJsGzipSizeBytes: 270 * 1024,
      initialJsRawSizeBytes: 850 * 1024,
      initialJsGzipSizeBytes: 270 * 1024,
      totalCssRawSizeBytes: 45 * 1024,
      totalCssGzipSizeBytes: 10 * 1024,
      assets: [
        {
          name: 'index-hash1.js',
          path: 'assets/index-hash1.js',
          canonicalName: 'index.js',
          category: 'js-entry',
          rawSizeBytes: 850 * 1024,
          gzipSizeBytes: 270 * 1024,
        },
        {
          name: 'index-hash1.css',
          path: 'assets/index-hash1.css',
          canonicalName: 'index.css',
          category: 'css-entry',
          rawSizeBytes: 45 * 1024,
          gzipSizeBytes: 10 * 1024,
        },
      ],
      ...overrides,
    };
  };

  it('deve aprovar sem violacoes quando todas as metricas estao dentro do orcamento', () => {
    const service = new BudgetValidatorService();
    const current = createMockReport();
    const baseline = createMockReport();

    const result = service.validate(current, baseline, defaultLimits);

    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.summaryMarkdown).toContain('✅ Orçamento de Performance Respeitado');
  });

  it('deve gerar avisos sem reprovar no modo warn (Fase A)', () => {
    const service = new BudgetValidatorService();
    const current = createMockReport({
      initialJsRawSizeBytes: 1500 * 1024,
      totalJsRawSizeBytes: 1500 * 1024,
    });
    const baseline = createMockReport();

    const result = service.validate(current, baseline, {
      ...defaultLimits,
      mode: 'warn',
    });

    expect(result.passed).toBe(true);
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.summaryMarkdown).toContain('⚠️');
  });

  it('deve reprovar quando houver violacoes no modo error (Fase B)', () => {
    const service = new BudgetValidatorService();
    const current = createMockReport({
      totalCssRawSizeBytes: 150 * 1024,
    });
    const baseline = createMockReport();

    const result = service.validate(current, baseline, {
      ...defaultLimits,
      mode: 'error',
    });

    expect(result.passed).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.summaryMarkdown).toContain('❌');
  });

  it('deve detectar regressao percentual de crescimento em relacao a baseline', () => {
    const service = new BudgetValidatorService();
    const baseline = createMockReport({
      totalJsRawSizeBytes: 500 * 1024,
      assets: [
        {
          name: 'index-old.js',
          path: 'assets/index-old.js',
          canonicalName: 'index.js',
          category: 'js-entry',
          rawSizeBytes: 500 * 1024,
          gzipSizeBytes: 150 * 1024,
        },
      ],
    });

    const current = createMockReport({
      totalJsRawSizeBytes: 850 * 1024,
      assets: [
        {
          name: 'index-new.js',
          path: 'assets/index-new.js',
          canonicalName: 'index.js',
          category: 'js-entry',
          rawSizeBytes: 850 * 1024,
          gzipSizeBytes: 270 * 1024,
        },
      ],
    });

    const result = service.validate(current, baseline, {
      ...defaultLimits,
      mode: 'error',
      limits: {
        ...defaultLimits.limits,
        maxAllowedGrowthPercent: 20,
      },
    });

    expect(result.passed).toBe(false);
    const growthViolation = result.violations.find((v) => v.unit === 'percent');
    expect(growthViolation).toBeDefined();
    expect(growthViolation?.actual).toBe(70);
  });

  it('deve validar corretamente quando nao houver baseline disponivel', () => {
    const service = new BudgetValidatorService();
    const current = createMockReport();

    const result = service.validate(current, null, defaultLimits);

    expect(result.passed).toBe(true);
    expect(result.comparisons).toHaveLength(2);
    expect(result.summaryMarkdown).toContain('index.js');
  });
});

