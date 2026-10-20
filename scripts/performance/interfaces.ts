type AssetCategory =
  | 'js-entry'
  | 'js-chunk'
  | 'css-entry'
  | 'css-chunk'
  | 'font'
  | 'image'
  | 'manifest'
  | 'service-worker'
  | 'other';

interface IAssetMetric {
  name: string;
  path: string;
  canonicalName: string;
  category: AssetCategory;
  rawSizeBytes: number;
  gzipSizeBytes: number;
}

interface IBundleReport {
  timestamp: string;
  totalRawSizeBytes: number;
  totalGzipSizeBytes: number;
  totalJsRawSizeBytes: number;
  totalJsGzipSizeBytes: number;
  initialJsRawSizeBytes: number;
  initialJsGzipSizeBytes: number;
  totalCssRawSizeBytes: number;
  totalCssGzipSizeBytes: number;
  assets: IAssetMetric[];
}

interface IPerformanceBudgetLimits {
  maxInitialJsRawBytes: number;
  maxInitialJsGzipBytes: number;
  maxTotalJsRawBytes: number;
  maxTotalJsGzipBytes: number;
  maxTotalCssRawBytes: number;
  maxTotalCssGzipBytes: number;
  maxAllowedGrowthPercent: number;
}

interface IPerformanceBudgetConfig {
  mode: 'warn' | 'error';
  limits: IPerformanceBudgetLimits;
}

interface IBudgetViolation {
  metric: string;
  actual: number;
  budget: number;
  unit: 'bytes' | 'percent';
  severity: 'warn' | 'error';
  message: string;
}

interface IBundleComparisonItem {
  name: string;
  canonicalName: string;
  category: AssetCategory;
  currentRawBytes: number;
  baselineRawBytes: number;
  currentGzipBytes: number;
  baselineGzipBytes: number;
  diffRawBytes: number;
  diffGzipBytes: number;
  growthPercent: number;
}

interface IValidationResult {
  passed: boolean;
  mode: 'warn' | 'error';
  violations: IBudgetViolation[];
  comparisons: IBundleComparisonItem[];
  summaryMarkdown: string;
}

interface IFileSystem {
  existsSync(path: string): boolean;
  readFileSync(path: string, options?: { encoding?: BufferEncoding | null; flag?: string } | BufferEncoding): string | Buffer;
  writeFileSync(path: string, content: string | Uint8Array, options?: { encoding?: BufferEncoding | null; flag?: string; mode?: number } | BufferEncoding): void;
  readdirSync(path: string): string[];
  statSync(path: string): { size: number; isFile(): boolean; isDirectory(): boolean };
  mkdirSync(path: string, options?: { recursive?: boolean }): string | undefined;
}

interface ICompressionService {
  gzipSync(buf: string | ArrayBufferView | ArrayBuffer): Buffer;
}

interface IPerformanceOrchestratorOptions {
  distDir: string;
  baselinePath: string;
  budgetPath: string;
  reportJsonPath: string;
  reportMarkdownPath: string;
  stepSummaryPath?: string;
  forceMode?: 'warn' | 'error';
}

export type {
  AssetCategory,
  IAssetMetric,
  IBundleReport,
  IPerformanceBudgetLimits,
  IPerformanceBudgetConfig,
  IBudgetViolation,
  IBundleComparisonItem,
  IValidationResult,
  IFileSystem,
  ICompressionService,
  IPerformanceOrchestratorOptions,
};
