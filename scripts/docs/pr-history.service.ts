import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { GroqDocService } from './groq-doc.service';
import type {
  ICommandRunner,
  IFileSystem,
  IGroqDocService,
  IPullRequestDocItem,
  IPrHistoryService,
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

class PrHistoryService implements IPrHistoryService {
  private readonly projectRoot: string;
  private readonly fileSystem: IFileSystem;
  private readonly commandRunner: ICommandRunner;
  private readonly groqDocService: IGroqDocService;

  constructor(
    projectRoot = process.cwd(),
    fileSystem: IFileSystem = defaultFileSystem,
    commandRunner: ICommandRunner = defaultCommandRunner,
    groqDocService: IGroqDocService = new GroqDocService(),
  ) {
    this.projectRoot = resolve(projectRoot);
    this.fileSystem = fileSystem;
    this.commandRunner = commandRunner;
    this.groqDocService = groqDocService;
  }

  public getHistory = (): IPullRequestDocItem[] => {
    const historyPath = join(this.projectRoot, 'docs', 'pr-history.json');
    if (!this.fileSystem.existsSync(historyPath)) {
      return [];
    }

    try {
      const raw = this.fileSystem.readFileSync(historyPath, 'utf-8');
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed as IPullRequestDocItem[];
      }
      return [];
    } catch {
      return [];
    }
  };

  public syncFromGit = async (currentVersion: string): Promise<IPullRequestDocItem[]> => {
    const existingHistory = this.getHistory();
    const existingMap = new Map<number, IPullRequestDocItem>();
    for (const item of existingHistory) {
      existingMap.set(item.number, item);
    }

    let gitMergesOutput = '';
    try {
      gitMergesOutput = this.commandRunner.exec(
        'git log --merges --grep="Merge pull request" --pretty=format:"%H|%s|%an|%cI"',
        this.projectRoot,
      );
    } catch {
      return existingHistory;
    }

    if (gitMergesOutput.length === 0) {
      return existingHistory;
    }

    const lines = gitMergesOutput.split('\n').filter((l) => l.trim().length > 0);

    for (const line of lines) {
      const parts = line.split('|');
      const commitHash = parts[0] ?? '';
      const subject = parts[1] ?? '';
      const author = parts[2] ?? '';
      const dateStr = parts[3] ?? '';
      if (commitHash.length === 0 || subject.length === 0) {
        continue;
      }

      const prMatch = /Merge pull request #(\d+)/i.exec(subject);
      if (!prMatch) {
        continue;
      }

      const prNumber = parseInt(prMatch[1] ?? '0', 10);
      if (prNumber <= 0 || existingMap.has(prNumber)) {
        continue;
      }

      let fullCommitBody = '';
      try {
        fullCommitBody = this.commandRunner.exec(
          `git log -1 --pretty=%B ${commitHash}`,
          this.projectRoot,
        );
      } catch {
        fullCommitBody = subject;
      }

      const title = this.extractPrTitle(fullCommitBody, subject);
      const url = `https://github.com/eusouanderson/Trex-Http-Client/pull/${prNumber.toString()}`;
      const summary = await this.generatePrSummary(commitHash, title, fullCommitBody);

      const finalAuthor = author.length > 0 ? author : 'Autor Desconhecido';
      const finalDateStr = dateStr.length > 0 ? dateStr : new Date().toISOString();

      const newItem: IPullRequestDocItem = {
        number: prNumber,
        title,
        url,
        author: finalAuthor,
        mergedAt: finalDateStr,
        targetBranch: 'main',
        mergeCommit: commitHash.slice(0, 7),
        summary,
        targetVersion: currentVersion,
      };

      existingMap.set(prNumber, newItem);
    }

    const updatedHistory = Array.from(existingMap.values()).sort((a, b) => a.number - b.number);

    const docsDir = join(this.projectRoot, 'docs');
    if (!this.fileSystem.existsSync(docsDir)) {
      this.fileSystem.mkdirSync(docsDir, { recursive: true });
    }

    const historyPath = join(docsDir, 'pr-history.json');
    this.fileSystem.writeFileSync(historyPath, JSON.stringify(updatedHistory, null, 2), 'utf-8');

    return updatedHistory;
  };

  private extractPrTitle = (fullBody: string, fallbackSubject: string): string => {
    const lines = fullBody.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const nonMergeLines = lines.filter((l) => !l.startsWith('Merge pull request'));
    const firstLine = nonMergeLines[0];
    if (typeof firstLine === 'string' && firstLine.length > 0) {
      return firstLine;
    }
    return fallbackSubject;
  };

  private generatePrSummary = async (
    commitHash: string,
    title: string,
    commitBody: string,
  ): Promise<string> => {
    try {
      const response = await this.groqDocService.analyzeChanges({
        commitHash,
        commitMessage: `${title}\n${commitBody}`,
        gitDiff: '',
        existingArchitecture: '',
        existingChangelog: '',
      });

      if (typeof response.summary === 'string' && response.summary.length > 0) {
        return response.summary;
      }
      return title;
    } catch {
      return title;
    }
  };
}

export { PrHistoryService };
