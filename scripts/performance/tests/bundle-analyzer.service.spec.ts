import { describe, expect, it, vi } from 'vitest';
import { BundleAnalyzerService } from '../bundle-analyzer.service';
import type { ICompressionService, IFileSystem } from '../interfaces';

describe('BundleAnalyzerService', () => {
  const createMockFileSystem = (files: Record<string, string | Buffer>): IFileSystem => {
    return {
      existsSync: vi.fn((path: string): boolean => {
        return Object.keys(files).some(
          (fileKey) => fileKey === path || fileKey.startsWith(`${path}/`),
        );
      }),
      readFileSync: vi.fn((path: string): string => {
        const content = files[path];
        if (content === undefined) {
          throw new Error(`File not found: ${path}`);
        }
        return typeof content === 'string' ? content : content.toString();
      }),
      writeFileSync: vi.fn(),
      readdirSync: vi.fn((dirPath: string): string[] => {
        const matching = Object.keys(files)
          .filter((fileKey) => fileKey.startsWith(`${dirPath}/`))
          .map((fileKey) => fileKey.slice(dirPath.length + 1).split('/')[0] ?? '');
        return Array.from(new Set(matching.filter((item) => item.length > 0)));
      }),
      statSync: vi.fn((path: string) => {
        const isDir = Object.keys(files).some((fileKey) => fileKey.startsWith(`${path}/`));
        const fileContent = files[path];
        const size =
          fileContent !== undefined
            ? typeof fileContent === 'string'
              ? Buffer.byteLength(fileContent)
              : fileContent.length
            : 0;

        return {
          size,
          isFile: (): boolean => !isDir && fileContent !== undefined,
          isDirectory: (): boolean => isDir,
        };
      }),
      mkdirSync: vi.fn(),
    };
  };

  const createMockCompression = (): ICompressionService => {
    return {
      gzipSync: vi.fn((buffer: Buffer | string): Buffer => {
        const length = typeof buffer === 'string' ? Buffer.byteLength(buffer) : buffer.length;
        return Buffer.alloc(Math.max(1, Math.floor(length * 0.4)));
      }),
    };
  };

  it('deve retornar relatorio vazio quando o diretorio nao existe', () => {
    const fs = createMockFileSystem({});
    const compression = createMockCompression();
    const service = new BundleAnalyzerService(fs, compression);

    const report = service.analyze('/non-existent-dist');

    expect(report.totalRawSizeBytes).toBe(0);
    expect(report.totalGzipSizeBytes).toBe(0);
    expect(report.assets).toHaveLength(0);
  });

  it('deve categorizar e computar metricas de arquivos js, css, fontes e imagens', () => {
    const files: Record<string, string> = {
      '/dist/index.html': '<html><body>App</body></html>',
      '/dist/sw.js': 'self.addEventListener("fetch", () => {})',
      '/dist/manifest.webmanifest': '{"name": "Trex"}',
      '/dist/assets/index-C8_Txo5H.js': 'console.log("main bundle content");',
      '/dist/assets/vendor-chunk-a1b2c3d4.js': 'console.log("vendor chunk");',
      '/dist/assets/index-2_NY-M90.css': 'body { background: #000; }',
      '/dist/assets/chunk-style-abc.css': '.button { color: red; }',
      '/dist/assets/FiraCode-Regular-jAL9VymT.woff2': 'binary-font-content',
      '/dist/assets/logo.png': 'binary-image-content',
      '/dist/assets/misc.unknown': 'some data',
    };

    const fs = createMockFileSystem(files);
    const compression = createMockCompression();
    const service = new BundleAnalyzerService(fs, compression);

    const report = service.analyze('/dist');

    expect(report.assets.length).toBeGreaterThan(0);
    expect(report.totalRawSizeBytes).toBeGreaterThan(0);
    expect(report.totalGzipSizeBytes).toBeGreaterThan(0);
    expect(report.totalJsRawSizeBytes).toBeGreaterThan(0);
    const expectedInitialSize = Buffer.byteLength(files['/dist/assets/index-C8_Txo5H.js'] ?? '');
    const expectedCssSize =
      Buffer.byteLength(files['/dist/assets/index-2_NY-M90.css'] ?? '') +
      Buffer.byteLength(files['/dist/assets/chunk-style-abc.css'] ?? '');

    expect(report.initialJsRawSizeBytes).toBe(expectedInitialSize);
    expect(report.totalCssRawSizeBytes).toBe(expectedCssSize);

    const entryJs = report.assets.find((asset) => asset.canonicalName === 'index.js');
    expect(entryJs?.category).toBe('js-entry');

    const vendorJs = report.assets.find((asset) => asset.canonicalName === 'vendor-chunk.js');
    expect(vendorJs?.category).toBe('js-chunk');

    const entryCss = report.assets.find((asset) => asset.canonicalName === 'index.css');
    expect(entryCss?.category).toBe('css-entry');

    const fontAsset = report.assets.find((asset) => asset.name.includes('FiraCode'));
    expect(fontAsset?.category).toBe('font');

    const swAsset = report.assets.find((asset) => asset.name === 'sw.js');
    expect(swAsset?.category).toBe('service-worker');

    const imageAsset = report.assets.find((asset) => asset.name === 'logo.png');
    expect(imageAsset?.category).toBe('image');
  });

  it('deve usar servico padrao com fs e zlib nativos quando nao injetados', () => {
    const service = new BundleAnalyzerService();
    expect(service).toBeDefined();
  });

  it('deve tratar excecao de compressao mantendo tamanho bruto', () => {
    const files: Record<string, string> = {
      '/dist/broken.js': 'content',
    };
    const fs = createMockFileSystem(files);
    const brokenCompression: ICompressionService = {
      gzipSync: vi.fn(() => {
        throw new Error('Compression failed');
      }),
    };
    const service = new BundleAnalyzerService(fs, brokenCompression);
    const report = service.analyze('/dist');

    const targetAsset = report.assets[0];
    expect(targetAsset).toBeDefined();
    expect(targetAsset?.gzipSizeBytes).toBe(targetAsset?.rawSizeBytes);
  });
});
