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

interface PortalBuilderOptions {
  title: string;
  version: string;
  commitHash: string;
  baseUrl: string;
  contextOutput: DocContextOutput;
  apiDocsPath: string;
  guides: GuideItem[];
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
}

interface ICommandRunner {
  exec(command: string, cwd: string): string;
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
  ICommandRunner,
  IDocOrchestratorService,
  IFileSystem,
  IGroqDocService,
  IPortalBuilderService,
  PortalBuilderOptions,
};


