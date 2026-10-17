import { createDefaultAuthRegistry } from '../../core/security';
import { VariableResolverService } from '../../core/variables';
import { ScriptSandboxService } from '../../core/scripts';
import { RequestPreparationService } from '../request/request-preparation.service';
import { RequestRunnerService } from '../request/request-runner.service';
import { useEnvironments } from '../environments';
import { useCollections } from './use-collections';
import type {
  Collection,
  CollectionItem,
  CollectionRunItemResult,
  CollectionRunItemTestResult,
  CollectionRunReport,
  ICollectionRunnerService,
} from './interfaces';
import type { RequestTab, KeyValuePair } from '../request/interfaces';

class CollectionRunnerService implements ICollectionRunnerService {
  private readonly requestRunner: RequestRunnerService;
  private readonly requestPreparation: RequestPreparationService;
  private readonly scriptSandbox: ScriptSandboxService;

  constructor(
    fetchFn?: typeof fetch,
    requestRunner?: RequestRunnerService,
    requestPreparation?: RequestPreparationService,
    scriptSandbox?: ScriptSandboxService,
  ) {
    this.requestRunner = requestRunner ?? new RequestRunnerService(fetchFn);
    const authRegistry = createDefaultAuthRegistry();
    const variableResolver = new VariableResolverService();
    this.requestPreparation =
      requestPreparation ?? new RequestPreparationService(authRegistry, variableResolver);
    this.scriptSandbox = scriptSandbox ?? new ScriptSandboxService();
  }

  private convertItemToTab(item: CollectionItem, collectionId: string): RequestTab {
    const params: KeyValuePair[] = Object.entries(item.params ?? {}).map(
      ([key, value], idx) => ({
        id: `p-${idx.toString()}`,
        key,
        value,
        enabled: true,
      }),
    );

    const headers: KeyValuePair[] = Object.entries(item.headers ?? {}).map(
      ([key, value], idx) => ({
        id: `h-${idx.toString()}`,
        key,
        value,
        enabled: true,
      }),
    );

    return {
      id: item.id,
      name: item.name,
      method: item.method ?? 'GET',
      url: item.url ?? '',
      params,
      headers,
      bodyType: item.body !== undefined && item.body.length > 0 ? 'json' : 'none',
      body: item.body ?? '',
      auth: item.auth ?? { type: 'none' },
      testScript: item.testScript ?? '',
      collectionId,
      isDirty: false,
    };
  }

  public async run(
    collection: Collection,
    onProgress?: (result: CollectionRunItemResult, index: number, total: number) => void,
    signal?: AbortSignal,
  ): Promise<CollectionRunReport> {
    const requestItems = collection.items.filter((item) => item.type === 'request');
    const total = requestItems.length;
    const itemsResults: CollectionRunItemResult[] = [];
    let passedCount = 0;
    let failedCount = 0;
    const startTime = performance.now();

    const { activeEnvironment, updateEnvironment } = useEnvironments();
    const { updateItemById } = useCollections();

    for (const [i, item] of requestItems.entries()) {
      if (signal?.aborted === true) {
        break;
      }

      const tab = this.convertItemToTab(item, collection.id);
      const activeEnv = activeEnvironment.value;

      const prepared = await this.requestPreparation.prepare(tab, {
        environment: activeEnv,
        collection,
      });

      const execResult = await this.requestRunner.execute(tab, 30000, prepared);

      const tests: CollectionRunItemTestResult[] = [];

      if (item.testScript !== undefined && item.testScript.trim().length > 0) {
        const envVarsRecord: Record<string, string> = {};
        if (activeEnv) {
          activeEnv.variables.forEach((v) => {
            if (v.enabled) {
              envVarsRecord[v.key] = v.value;
            }
          });
        }

        const testReport = await this.scriptSandbox.execute(item.testScript, {
          response: {
            status: execResult.status,
            statusText: execResult.statusText,
            headers: execResult.headers,
            data: execResult.data,
            durationMs: execResult.durationMs,
          },
          environmentVariables: envVarsRecord,
        });

        testReport.results.forEach((r) => {
          tests.push({
            name: r.name,
            passed: r.passed,
            error: r.error,
          });
        });

        if (activeEnv && testReport.environmentMutations.length > 0) {
          testReport.environmentMutations.forEach(({ key, value }) => {
            const existing = activeEnv.variables.find((v) => v.key === key);
            if (existing) {
              existing.value = value;
            } else {
              activeEnv.variables.push({
                id: crypto.randomUUID(),
                key,
                value,
                enabled: true,
              });
            }
          });
          updateEnvironment(activeEnv);
        }
      }

      const testsPassed = tests.every((t) => t.passed);

      const isSuccess =
        execResult.status >= 200 &&
        execResult.status < 400 &&
        testsPassed &&
        execResult.error === undefined;

      if (isSuccess) {
        passedCount += 1;
      } else {
        failedCount += 1;
      }

      updateItemById(item.id, { status: execResult.status });

      const itemRunResult: CollectionRunItemResult = {
        itemId: item.id,
        name: item.name,
        method: item.method ?? 'GET',
        url: item.url ?? '',
        status: execResult.status,
        statusText: execResult.statusText,
        durationMs: execResult.durationMs,
        sizeBytes: execResult.sizeBytes,
        error: execResult.error,
        tests,
      };

      itemsResults.push(itemRunResult);

      if (onProgress) {
        onProgress(itemRunResult, i, total);
      }
    }

    const totalDurationMs = Math.round(performance.now() - startTime);

    return {
      collectionId: collection.id,
      collectionName: collection.name,
      total,
      passed: passedCount,
      failed: failedCount,
      totalDurationMs,
      items: itemsResults,
    };
  }
}

export { CollectionRunnerService };
