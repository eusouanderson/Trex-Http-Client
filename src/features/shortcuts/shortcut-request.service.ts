import type { Collection, CreateItemInput } from '../collections/interfaces';
import type { RequestTab } from '../request/interfaces';
import type {
  IShortcutRequestService,
  ShortcutRequestGenerationResult,
} from './interfaces';

class ShortcutRequestService implements IShortcutRequestService {
  private readonly generateId = (prefix: string): string => {
    return `${prefix}-${Date.now().toString()}-${Math.random().toString(36).slice(2, 7)}`;
  };

  public readonly resolveTargetCollection = (
    collections: Collection[],
    activeTab?: RequestTab | null,
    selectedItemId?: string | null,
  ): Collection | null => {
    const firstCollection = collections[0];
    if (!firstCollection) {
      return null;
    }

    if (
      activeTab?.collectionId !== undefined &&
      activeTab.collectionId.length > 0
    ) {
      const byColId = collections.find((c) => c.id === activeTab.collectionId);
      if (byColId) {
        return byColId;
      }
    }

    if (activeTab?.id !== undefined && activeTab.id.length > 0) {
      const byTabId = collections.find((c) =>
        c.items.some((i) => i.id === activeTab.id),
      );
      if (byTabId) {
        return byTabId;
      }
    }

    if (
      selectedItemId !== undefined &&
      selectedItemId !== null &&
      selectedItemId.length > 0
    ) {
      const bySelected = collections.find((c) =>
        c.items.some((i) => i.id === selectedItemId),
      );
      if (bySelected) {
        return bySelected;
      }
    }

    return firstCollection;
  };

  public readonly createNewRequest = (
    targetCollectionId: string,
    initial?: Partial<CreateItemInput>,
  ): ShortcutRequestGenerationResult => {
    const method = initial?.method ?? 'GET';
    const url = initial?.url ?? 'https://jsonplaceholder.typicode.com/todos/1';
    const body = initial?.body ?? '';
    const auth = initial?.auth ?? { type: 'none' };
    const testScript = initial?.testScript ?? '';

    const itemInput: CreateItemInput = {
      name: initial?.name ?? 'Nova Requisição',
      type: 'request',
      method,
      url,
      params: initial?.params ?? {},
      headers: initial?.headers ?? {},
      body,
      auth,
      testScript,
    };

    const tabInput: Omit<RequestTab, 'id'> = {
      collectionId: targetCollectionId,
      name: itemInput.name,
      method,
      url,
      params: [],
      headers: [],
      bodyType: 'none',
      body,
      auth,
      testScript,
      isDirty: false,
    };

    return { itemInput, tabInput };
  };

  public readonly duplicateRequest = (
    sourceTab: RequestTab,
    targetCollectionId: string,
  ): ShortcutRequestGenerationResult => {
    const headersRecord: Record<string, string> = {};
    sourceTab.headers.forEach((h) => {
      if (h.key.trim().length > 0) {
        headersRecord[h.key] = h.value;
      }
    });

    const paramsRecord: Record<string, string> = {};
    sourceTab.params.forEach((p) => {
      if (p.key.trim().length > 0) {
        paramsRecord[p.key] = p.value;
      }
    });

    const itemInput: CreateItemInput = {
      name: `${sourceTab.name} (Cópia)`,
      type: 'request',
      method: sourceTab.method,
      url: sourceTab.url,
      headers: headersRecord,
      params: paramsRecord,
      body: sourceTab.body,
      auth: sourceTab.auth ? { ...sourceTab.auth } : { type: 'none' },
      testScript: sourceTab.testScript ?? '',
    };

    const tabInput: Omit<RequestTab, 'id'> = {
      collectionId: targetCollectionId,
      name: itemInput.name,
      method: sourceTab.method,
      url: sourceTab.url,
      params: sourceTab.params.map((p) => ({
        ...p,
        id: this.generateId('p'),
      })),
      headers: sourceTab.headers.map((h) => ({
        ...h,
        id: this.generateId('h'),
      })),
      bodyType: sourceTab.bodyType,
      body: sourceTab.body,
      auth: itemInput.auth,
      testScript: itemInput.testScript,
      isDirty: false,
    };

    return { itemInput, tabInput };
  };
}

const shortcutRequestService = new ShortcutRequestService();

export { ShortcutRequestService, shortcutRequestService };

