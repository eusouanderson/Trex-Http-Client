import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { GroqDocService } from './groq-doc.service';
import { PortalBuilderService } from './portal-builder.service';
import type {
  DocContextInput,
  GuideItem,
  ICommandRunner,
  IDocOrchestratorService,
  IFileSystem,
  IGroqDocService,
  IPortalBuilderService,
  PortalBuilderOptions,
} from './interfaces';

const defaultFileSystem: IFileSystem = {
  existsSync: (path: string): boolean => existsSync(path),
  mkdirSync: (path: string, options?: { recursive?: boolean }): void => {
    mkdirSync(path, options);
  },
  readFileSync: (path: string, encoding: 'utf-8'): string => readFileSync(path, encoding),
  writeFileSync: (path: string, data: string, encoding: 'utf-8'): void => {
    writeFileSync(path, data, encoding);
  },
};

const defaultCommandRunner: ICommandRunner = {
  exec: (command: string, cwd: string): string => execSync(command, { cwd }).toString().trim(),
};

class DocOrchestratorService implements IDocOrchestratorService {
  private readonly projectRoot: string;
  private readonly groqDocService: IGroqDocService;
  private readonly portalBuilderService: IPortalBuilderService;
  private readonly fileSystem: IFileSystem;
  private readonly commandRunner: ICommandRunner;

  constructor(
    projectRoot = process.cwd(),
    groqDocService?: IGroqDocService,
    portalBuilderService?: IPortalBuilderService,
    fileSystem: IFileSystem = defaultFileSystem,
    commandRunner: ICommandRunner = defaultCommandRunner,
  ) {
    this.projectRoot = resolve(projectRoot);
    this.groqDocService = groqDocService ?? new GroqDocService();
    this.portalBuilderService = portalBuilderService ?? new PortalBuilderService();
    this.fileSystem = fileSystem;
    this.commandRunner = commandRunner;
  }

  public run = async (): Promise<boolean> => {
    const docsOutputDir = join(this.projectRoot, 'dist', 'docs');
    const apiOutputDir = join(docsOutputDir, 'api');
    const guidesOutputDir = join(docsOutputDir, 'guides');

    this.ensureDirectory(docsOutputDir);
    this.ensureDirectory(apiOutputDir);
    this.ensureDirectory(guidesOutputDir);

    this.generateTypeDoc();

    const commitHash = this.getCommitHash();
    const commitMessage = this.getCommitMessage();
    const gitDiff = this.getGitDiff();
    const appVersion = this.getPackageVersion();

    const existingArchitecture = this.readFileIfExists(join(this.projectRoot, 'docs', 'ARCHITECTURE.md'));
    const existingChangelog = this.readFileIfExists(join(this.projectRoot, 'docs', 'CHANGELOG.md'));

    const contextInput: DocContextInput = {
      commitHash,
      commitMessage,
      gitDiff,
      existingArchitecture,
      existingChangelog,
    };

    const contextOutput = await this.groqDocService.analyzeChanges(contextInput);
    const guides = this.loadGuides();

    const portalOptions: PortalBuilderOptions = {
      title: 'Trex HTTP Client — Documentação Técnica & API',
      version: appVersion,
      commitHash,
      baseUrl: '/Trex-Http-Client/docs/',
      contextOutput,
      apiDocsPath: './api/index.html',
      guides,
    };

    const portalHtml = this.portalBuilderService.buildPortalHtml(portalOptions);
    this.fileSystem.writeFileSync(join(docsOutputDir, 'index.html'), portalHtml, 'utf-8');

    for (const guide of guides) {
      const guideHtml = this.portalBuilderService.buildGuideHtml(guide, portalOptions);
      this.fileSystem.writeFileSync(join(guidesOutputDir, `${guide.fileName}.html`), guideHtml, 'utf-8');
    }

    const indexHtmlExists = this.fileSystem.existsSync(join(docsOutputDir, 'index.html'));
    const apiIndexHtmlExists = this.fileSystem.existsSync(join(apiOutputDir, 'index.html'));

    if (!indexHtmlExists || !apiIndexHtmlExists) {
      throw new Error('Falha na validação dos artefatos de documentação: index.html ou api/index.html não foram gerados.');
    }

    return true;
  };

  private ensureDirectory = (path: string): void => {
    if (!this.fileSystem.existsSync(path)) {
      this.fileSystem.mkdirSync(path, { recursive: true });
    }
  };

  private generateTypeDoc = (): void => {
    try {
      this.commandRunner.exec('npx typedoc', this.projectRoot);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Falha na execução do TypeDoc: ${message}`);
    }
  };

  private getCommitHash = (): string => {
    try {
      return this.commandRunner.exec('git rev-parse --short HEAD', this.projectRoot);
    } catch {
      return 'unknown';
    }
  };

  private getCommitMessage = (): string => {
    try {
      return this.commandRunner.exec('git log -1 --pretty=%B', this.projectRoot);
    } catch {
      return '';
    }
  };

  private getGitDiff = (): string => {
    try {
      return this.commandRunner.exec('git diff HEAD~1 HEAD -- src/', this.projectRoot);
    } catch {
      return '';
    }
  };

  private getPackageVersion = (): string => {
    try {
      const pkgRaw = this.fileSystem.readFileSync(join(this.projectRoot, 'package.json'), 'utf-8');
      const parsed = JSON.parse(pkgRaw) as { version?: string };
      if (typeof parsed.version === 'string' && parsed.version.length > 0) {
        return parsed.version;
      }
      return '1.0.0';
    } catch {
      return '1.0.0';
    }
  };


  private readFileIfExists = (path: string): string => {
    if (this.fileSystem.existsSync(path)) {
      return this.fileSystem.readFileSync(path, 'utf-8');
    }
    return '';
  };

  private loadGuides = (): GuideItem[] => {
    const guides: GuideItem[] = [];
    const testScriptsGuidePath = join(this.projectRoot, 'docs', 'test-scripts-guide.md');

    if (this.fileSystem.existsSync(testScriptsGuidePath)) {
      const content = this.fileSystem.readFileSync(testScriptsGuidePath, 'utf-8');
      guides.push({
        id: 'test-scripts-guide',
        title: 'Guia de Scripts de Testes (tx.* / pm.*)',
        description: 'Aprenda a criar validações pós-resposta, asserções de status, headers e extração automática de variáveis de ambiente.',
        fileName: 'test-scripts-guide',
        content,
      });
    }

    const archPath = join(this.projectRoot, 'docs', 'ARCHITECTURE.md');
    if (this.fileSystem.existsSync(archPath)) {
      const content = this.fileSystem.readFileSync(archPath, 'utf-8');
      guides.push({
        id: 'architecture-guide',
        title: 'Manual de Arquitetura do Sistema',
        description: 'Separação em Feature-Sliced Design, Domain-Driven Design, 100% OOP e padrão de adaptadores reativos no Vue 3.',
        fileName: 'architecture-guide',
        content,
      });
    }

    const perfGuidePath = join(this.projectRoot, 'docs', 'performance-strategy.md');
    if (this.fileSystem.existsSync(perfGuidePath)) {
      const content = this.fileSystem.readFileSync(perfGuidePath, 'utf-8');
      guides.push({
        id: 'performance-strategy-guide',
        title: 'Guia de Performance Engineering & Lighthouse CI',
        description: 'Auditoria contínua de performance, acessibilidade 100%, Core Web Vitals, orçamentos de bundle e relatórios no CI/CD.',
        fileName: 'performance-strategy-guide',
        content,
      });
    }

    return guides;
  };
}

export { DocOrchestratorService };
