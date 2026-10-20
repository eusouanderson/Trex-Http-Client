import * as fs from 'node:fs';
import * as path from 'node:path';
import * as zlib from 'node:zlib';
import type {
  AssetCategory,
  IAssetMetric,
  IBundleReport,
  ICompressionService,
  IFileSystem,
} from './interfaces';

class BundleAnalyzerService {
  private readonly fileSystem: IFileSystem;
  private readonly compressionService: ICompressionService;

  constructor(
    fileSystem: IFileSystem = fs,
    compressionService: ICompressionService = zlib,
  ) {
    this.fileSystem = fileSystem;
    this.compressionService = compressionService;
  }

  public analyze = (distDir: string): IBundleReport => {
    if (!this.fileSystem.existsSync(distDir)) {
      return {
        timestamp: new Date().toISOString(),
        totalRawSizeBytes: 0,
        totalGzipSizeBytes: 0,
        totalJsRawSizeBytes: 0,
        totalJsGzipSizeBytes: 0,
        initialJsRawSizeBytes: 0,
        initialJsGzipSizeBytes: 0,
        totalCssRawSizeBytes: 0,
        totalCssGzipSizeBytes: 0,
        assets: [],
      };
    }

    const files = this.collectFiles(distDir);
    const assets: IAssetMetric[] = files.map((filePath) => this.analyzeFile(distDir, filePath));

    assets.sort((a, b) => b.rawSizeBytes - a.rawSizeBytes);

    const totalRawSizeBytes = assets.reduce((acc, curr) => acc + curr.rawSizeBytes, 0);
    const totalGzipSizeBytes = assets.reduce((acc, curr) => acc + curr.gzipSizeBytes, 0);

    const jsAssets = assets.filter((asset) => asset.category === 'js-entry' || asset.category === 'js-chunk');
    const totalJsRawSizeBytes = jsAssets.reduce((acc, curr) => acc + curr.rawSizeBytes, 0);
    const totalJsGzipSizeBytes = jsAssets.reduce((acc, curr) => acc + curr.gzipSizeBytes, 0);

    const initialJsAssets = assets.filter((asset) => asset.category === 'js-entry');
    const initialJsRawSizeBytes = initialJsAssets.reduce((acc, curr) => acc + curr.rawSizeBytes, 0);
    const initialJsGzipSizeBytes = initialJsAssets.reduce((acc, curr) => acc + curr.gzipSizeBytes, 0);

    const cssAssets = assets.filter((asset) => asset.category === 'css-entry' || asset.category === 'css-chunk');
    const totalCssRawSizeBytes = cssAssets.reduce((acc, curr) => acc + curr.rawSizeBytes, 0);
    const totalCssGzipSizeBytes = cssAssets.reduce((acc, curr) => acc + curr.gzipSizeBytes, 0);

    return {
      timestamp: new Date().toISOString(),
      totalRawSizeBytes,
      totalGzipSizeBytes,
      totalJsRawSizeBytes,
      totalJsGzipSizeBytes,
      initialJsRawSizeBytes,
      initialJsGzipSizeBytes,
      totalCssRawSizeBytes,
      totalCssGzipSizeBytes,
      assets,
    };
  };

  private collectFiles = (dir: string): string[] => {
    const entries = this.fileSystem.readdirSync(dir);
    const results: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = this.fileSystem.statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...this.collectFiles(fullPath));
      } else if (stat.isFile()) {
        results.push(fullPath);
      }
    }

    return results;
  };

  private analyzeFile = (distDir: string, filePath: string): IAssetMetric => {
    const relativePath = path.relative(distDir, filePath).replace(/\\/g, '/');
    const fileName = path.basename(filePath);
    const content = this.fileSystem.readFileSync(filePath);
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);

    const rawSizeBytes = buffer.length;
    let gzipSizeBytes = rawSizeBytes;
    try {
      gzipSizeBytes = this.compressionService.gzipSync(buffer).length;
    } catch {
      gzipSizeBytes = rawSizeBytes;
    }

    const canonicalName = this.normalizeCanonicalName(fileName);
    const category = this.categorizeAsset(fileName, canonicalName);

    return {
      name: fileName,
      path: relativePath,
      canonicalName,
      category,
      rawSizeBytes,
      gzipSizeBytes,
    };
  };

  private normalizeCanonicalName = (fileName: string): string => {
    if (fileName.startsWith('index-') && fileName.endsWith('.js')) {
      return 'index.js';
    }
    if (fileName.startsWith('index-') && fileName.endsWith('.css')) {
      return 'index.css';
    }
    return fileName.replace(/-[^-]{6,}(\.[a-z0-9]+)$/i, '$1');
  };

  private categorizeAsset = (fileName: string, canonicalName: string): AssetCategory => {
    const ext = path.extname(fileName).toLowerCase();

    if (fileName === 'sw.js' || fileName.startsWith('workbox-')) {
      return 'service-worker';
    }

    if (canonicalName === 'index.js') {
      return 'js-entry';
    }

    if (ext === '.js' || ext === '.mjs') {
      return 'js-chunk';
    }

    if (canonicalName === 'index.css') {
      return 'css-entry';
    }

    if (ext === '.css') {
      return 'css-chunk';
    }

    if (['.woff2', '.woff', '.ttf', '.ttc', '.otf', '.eot'].includes(ext)) {
      return 'font';
    }

    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'].includes(ext)) {
      return 'image';
    }

    if (fileName.includes('manifest') || ext === '.webmanifest') {
      return 'manifest';
    }

    return 'other';
  };
}

export { BundleAnalyzerService };
