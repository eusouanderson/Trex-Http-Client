interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqChatCompletionRequest {
  model: string;
  messages: GroqMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface GroqChatCompletionChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

interface GroqChatCompletionResponse {
  id: string;
  choices: GroqChatCompletionChoice[];
}

interface DocContextInput {
  commitHash: string;
  commitMessage: string;
  gitDiff: string;
  existingArchitecture: string;
  existingChangelog: string;
}

interface DocContextOutput {
  summary: string;
  architectureHighlights: string[];
  changelogHighlights: string[];
  generatedAt: string;
  modelUsed: string;
}

interface GuideItem {
  id: string;
  title: string;
  description: string;
  fileName: string;
  content: string;
}

interface ILighthouseScores {
  performance: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  seo: number | null;
}

interface ILighthouseLabMetrics {
  fcpMs: number | null;
  fcpFormatted: string | null;
  lcpMs: number | null;
  lcpFormatted: string | null;
  clsScore: number | null;
  clsFormatted: string | null;
}

interface ILighthouseReportSummary {
  status: 'success' | 'partial' | 'pending' | 'unavailable';
  auditedAt: string;
  url: string;
  reportHtmlPath?: string;
  reportJsonPath?: string;
  scores: ILighthouseScores;
  metrics: ILighthouseLabMetrics;
  errorMessage?: string;
}

interface IBundleMetricsSummary {
  status: 'passed' | 'warn' | 'failed' | 'unavailable';
  measuredAt: string;
  initialJsRawBytes: number;
  initialJsGzipBytes: number;
  totalJsGzipBytes: number;
  totalCssGzipBytes: number;
  maxInitialJsGzipLimit: number;
  maxTotalJsGzipLimit: number;
  maxTotalCssGzipLimit: number;
  isBudgetRespected: boolean;
}

interface IPullRequestDocItem {
  number: number;
  title: string;
  url: string;
  author: string;
  mergedAt: string;
  targetBranch: string;
  mergeCommit: string;
  summary: string;
  targetVersion: string;
}

interface IVersionMetricsHistoryItem {
  version: string;
  releaseDate: string;
  commitHash: string;
  lighthouse: ILighthouseReportSummary;
  bundle: IBundleMetricsSummary;
  pullRequestsCount: number;
  pullRequests: number[];
}

interface IVersionDiffComparison {
  version: string;
  previousVersion: string | null;
  performanceDiff: number | null;
  accessibilityDiff: number | null;
  bestPracticesDiff: number | null;
  seoDiff: number | null;
  initialJsGzipDiffBytes: number | null;
}

interface PortalBuilderOptions {
  title: string;
  version: string;
  commitHash: string;
  baseUrl: string;
  contextOutput: DocContextOutput;
  apiDocsPath: string;
  guides: GuideItem[];
  lighthouseMetrics?: ILighthouseReportSummary;
  bundleMetrics?: IBundleMetricsSummary;
  versionHistory?: IVersionMetricsHistoryItem[];
  previousComparison?: IVersionDiffComparison;
  pullRequests?: IPullRequestDocItem[];
}

interface IGroqDocService {
  analyzeChanges(input: DocContextInput): Promise<DocContextOutput>;
}

interface IPortalBuilderService {
  buildPortalHtml(options: PortalBuilderOptions): string;
  buildGuideHtml(guide: GuideItem, options: PortalBuilderOptions): string;
}

interface IFileSystem {
  existsSync(path: string): boolean;
  mkdirSync(path: string, options?: { recursive?: boolean }): void;
  readFileSync(path: string, encoding: 'utf-8'): string;
  writeFileSync(path: string, data: string, encoding: 'utf-8'): void;
  readdirSync?(path: string): string[];
}

interface ICommandRunner {
  exec(command: string, cwd: string): string;
}

interface IMetricsCollectorService {
  collectBundleMetrics(): IBundleMetricsSummary;
  collectLighthouseMetrics(): ILighthouseReportSummary;
  getHistory(): IVersionMetricsHistoryItem[];
  recordVersion(version: string, commitHash: string, releaseDate?: string): IVersionMetricsHistoryItem;
  getComparison(version: string): IVersionDiffComparison;
}

interface IPrHistoryService {
  getHistory(): IPullRequestDocItem[];
  syncFromGit(currentVersion: string): Promise<IPullRequestDocItem[]>;
}

interface IDocOrchestratorService {
  run(): Promise<boolean>;
}

export type {
  DocContextInput,
  DocContextOutput,
  GroqChatCompletionChoice,
  GroqChatCompletionRequest,
  GroqChatCompletionResponse,
  GroqMessage,
  GuideItem,
  IBundleMetricsSummary,
  ICommandRunner,
  IDocOrchestratorService,
  IFileSystem,
  IGroqDocService,
  ILighthouseLabMetrics,
  ILighthouseReportSummary,
  ILighthouseScores,
  IMetricsCollectorService,
  IPortalBuilderService,
  IPrHistoryService,
  IPullRequestDocItem,
  IVersionDiffComparison,
  IVersionMetricsHistoryItem,
  PortalBuilderOptions,
};
