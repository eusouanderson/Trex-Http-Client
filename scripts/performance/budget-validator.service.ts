import type {
  IBudgetViolation,
  IBundleComparisonItem,
  IBundleReport,
  IPerformanceBudgetConfig,
  IValidationResult,
} from './interfaces';

class BudgetValidatorService {
  public validate = (
    current: IBundleReport,
    baseline: IBundleReport | null,
    config: IPerformanceBudgetConfig,
  ): IValidationResult => {
    const violations: IBudgetViolation[] = [];
    const { mode, limits } = config;

    this.checkBudget(
      'JavaScript Inicial (Bruto)',
      current.initialJsRawSizeBytes,
      limits.maxInitialJsRawBytes,
      'bytes',
      mode,
      violations,
    );

    this.checkBudget(
      'JavaScript Inicial (Gzip)',
      current.initialJsGzipSizeBytes,
      limits.maxInitialJsGzipBytes,
      'bytes',
      mode,
      violations,
    );

    this.checkBudget(
      'JavaScript Total (Bruto)',
      current.totalJsRawSizeBytes,
      limits.maxTotalJsRawBytes,
      'bytes',
      mode,
      violations,
    );

    this.checkBudget(
      'JavaScript Total (Gzip)',
      current.totalJsGzipSizeBytes,
      limits.maxTotalJsGzipBytes,
      'bytes',
      mode,
      violations,
    );

    this.checkBudget(
      'CSS Total (Bruto)',
      current.totalCssRawSizeBytes,
      limits.maxTotalCssRawBytes,
      'bytes',
      mode,
      violations,
    );

    this.checkBudget(
      'CSS Total (Gzip)',
      current.totalCssGzipSizeBytes,
      limits.maxTotalCssGzipBytes,
      'bytes',
      mode,
      violations,
    );

    const comparisons = this.buildComparisons(current, baseline);

    if (baseline !== null && baseline.totalJsRawSizeBytes > 0) {
      const growthPercent = Number(
        (((current.totalJsRawSizeBytes - baseline.totalJsRawSizeBytes) / baseline.totalJsRawSizeBytes) * 100).toFixed(1),
      );

      if (growthPercent > limits.maxAllowedGrowthPercent) {
        violations.push({
          metric: 'Crescimento de JavaScript Total',
          actual: growthPercent,
          budget: limits.maxAllowedGrowthPercent,
          unit: 'percent',
          severity: mode,
          message: `Crescimento de ${String(growthPercent)}% excede o limite máximo permitido de ${String(limits.maxAllowedGrowthPercent)}%.`,
        });
      }
    }

    const passed = mode === 'warn' ? true : violations.length === 0;
    const summaryMarkdown = this.formatMarkdown(current, baseline, config, violations, comparisons, passed);

    return {
      passed,
      mode,
      violations,
      comparisons,
      summaryMarkdown,
    };
  };

  private checkBudget = (
    metric: string,
    actual: number,
    budget: number,
    unit: 'bytes' | 'percent',
    severity: 'warn' | 'error',
    violations: IBudgetViolation[],
  ): void => {
    if (actual > budget) {
      const actualFormatted = unit === 'bytes' ? this.formatBytes(actual) : `${String(actual)}%`;
      const budgetFormatted = unit === 'bytes' ? this.formatBytes(budget) : `${String(budget)}%`;

      violations.push({
        metric,
        actual,
        budget,
        unit,
        severity,
        message: `${metric}: ${actualFormatted} excede o orçamento de ${budgetFormatted}.`,
      });
    }
  };

  private buildComparisons = (
    current: IBundleReport,
    baseline: IBundleReport | null,
  ): IBundleComparisonItem[] => {
    const baselineMap = new Map<string, { raw: number; gzip: number }>();
    if (baseline !== null) {
      for (const asset of baseline.assets) {
        baselineMap.set(asset.canonicalName, {
          raw: asset.rawSizeBytes,
          gzip: asset.gzipSizeBytes,
        });
      }
    }

    return current.assets.map((asset) => {
      const base = baselineMap.get(asset.canonicalName);
      const baselineRawBytes = base?.raw ?? 0;
      const baselineGzipBytes = base?.gzip ?? 0;
      const diffRawBytes = asset.rawSizeBytes - baselineRawBytes;
      const diffGzipBytes = asset.gzipSizeBytes - baselineGzipBytes;

      const growthPercent =
        baselineRawBytes > 0
          ? Number(((diffRawBytes / baselineRawBytes) * 100).toFixed(1))
          : 0;

      return {
        name: asset.name,
        canonicalName: asset.canonicalName,
        category: asset.category,
        currentRawBytes: asset.rawSizeBytes,
        baselineRawBytes,
        currentGzipBytes: asset.gzipSizeBytes,
        baselineGzipBytes,
        diffRawBytes,
        diffGzipBytes,
        growthPercent,
      };
    });
  };

  private formatBytes = (bytes: number): string => {
    if (bytes === 0) {
      return '0 B';
    }
    const k = 1024;
    const sizes = ['B', 'kB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    const value = bytes / Math.pow(k, i);
    const unitName = sizes[i] ?? 'B';
    return `${value.toFixed(2)} ${unitName}`;
  };

  private formatMarkdown = (
    current: IBundleReport,
    baseline: IBundleReport | null,
    config: IPerformanceBudgetConfig,
    violations: IBudgetViolation[],
    comparisons: IBundleComparisonItem[],
    passed: boolean,
  ): string => {
    const baselineInfo = baseline !== null ? ` | **Baseline**: ${baseline.timestamp}` : '';
    const title =
      violations.length === 0
        ? '✅ Orçamento de Performance Respeitado'
        : passed
          ? '⚠️ Alertas de Orçamento de Performance (Modo Observação)'
          : '❌ Violação do Orçamento de Performance (Modo Proteção)';

    const lines: string[] = [
      `### ${title}`,
      '',
      `**Modo**: \`${config.mode}\` | **Data**: ${new Date().toISOString()}${baselineInfo}`,
      '',
      '#### Resumo de Métricas',
      '',
      '| Métrica | Atual (Bruto) | Atual (Gzip) | Orçamento Máximo | Status |',
      '| :--- | :--- | :--- | :--- | :---: |',
      `| JS Inicial | ${this.formatBytes(current.initialJsRawSizeBytes)} | ${this.formatBytes(current.initialJsGzipSizeBytes)} | ${this.formatBytes(config.limits.maxInitialJsGzipBytes)} gzip | ${this.getStatusIcon(current.initialJsGzipSizeBytes, config.limits.maxInitialJsGzipBytes, config.mode)} |`,
      `| JS Total | ${this.formatBytes(current.totalJsRawSizeBytes)} | ${this.formatBytes(current.totalJsGzipSizeBytes)} | ${this.formatBytes(config.limits.maxTotalJsGzipBytes)} gzip | ${this.getStatusIcon(current.totalJsGzipSizeBytes, config.limits.maxTotalJsGzipBytes, config.mode)} |`,
      `| CSS Total | ${this.formatBytes(current.totalCssRawSizeBytes)} | ${this.formatBytes(current.totalCssGzipSizeBytes)} | ${this.formatBytes(config.limits.maxTotalCssGzipBytes)} gzip | ${this.getStatusIcon(current.totalCssGzipSizeBytes, config.limits.maxTotalCssGzipBytes, config.mode)} |`,
      '',
    ];

    if (violations.length > 0) {
      lines.push('#### Violações / Avisos Identificados', '');
      for (const v of violations) {
        const itemIcon = v.severity === 'error' ? '❌' : '⚠️';
        lines.push(`- ${itemIcon} **${v.metric}**: ${v.message}`);
      }
      lines.push('');
    }

    lines.push('#### Comparação de Assets Principais', '');
    lines.push('| Asset | Categoria | Tamanho Atual | Baseline | Diferença | Variação |');
    lines.push('| :--- | :--- | :--- | :--- | :--- | :--- |');

    const topAssets = comparisons.slice(0, 10);
    for (const item of topAssets) {
      const diffFormatted =
        item.diffGzipBytes === 0
          ? '0 B'
          : `${item.diffGzipBytes > 0 ? '+' : ''}${this.formatBytes(item.diffGzipBytes)}`;
      const growthFormatted = item.growthPercent === 0 ? '0%' : `${item.growthPercent > 0 ? '+' : ''}${String(item.growthPercent)}%`;
      const baselineFormatted = item.baselineGzipBytes > 0 ? this.formatBytes(item.baselineGzipBytes) : '—';

      lines.push(
        `| \`${item.canonicalName}\` | ${item.category} | ${this.formatBytes(item.currentGzipBytes)} | ${baselineFormatted} | ${diffFormatted} | ${growthFormatted} |`,
      );
    }

    lines.push('');
    return lines.join('\n');
  };

  private getStatusIcon = (actual: number, budget: number, mode: 'warn' | 'error'): string => {
    if (actual <= budget) {
      return '✅';
    }
    return mode === 'error' ? '❌' : '⚠️';
  };
}

export { BudgetValidatorService };
