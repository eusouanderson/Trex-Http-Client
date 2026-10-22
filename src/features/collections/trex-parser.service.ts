import type { HttpMethod } from '../../core/http/interfaces';
import type { AuthConfig } from '../../core/security/interfaces';
import type {
  CollectionItemType,
  ParsedCollectionItem,
  ParsedCollectionResult,
  RawTrexCollection
} from './interfaces';


class TrexParserService {
  public readonly parse = (jsonString: string): ParsedCollectionResult => {
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error('Invalid Trex JSON');
    }

    if (parsed === null || typeof parsed !== 'object') {
      throw new Error('Invalid Trex structure');
    }

    const rawCollection = parsed as RawTrexCollection;
    if (!Array.isArray(rawCollection.items)) {
      throw new Error('Invalid Trex structure');
    }

    const name = rawCollection.name ?? rawCollection.info?.name;
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('Invalid Trex structure');
    }

    const description = rawCollection.description ?? rawCollection.info?.description;

    const items: ParsedCollectionItem[] = rawCollection.items.map((raw) => {
      const itemType: CollectionItemType = raw.type === 'folder' ? 'folder' : 'request';
      return {
        id: raw.id,
        name: raw.name ?? 'Sem título',
        type: itemType,
        parentId: raw.parentId ?? null,
        method: raw.method as HttpMethod | undefined,
        url: raw.url,
        headers: raw.headers ? { ...raw.headers } : undefined,
        params: raw.params ? { ...raw.params } : undefined,
        body: raw.body,
        auth: raw.auth ? (JSON.parse(JSON.stringify(raw.auth)) as AuthConfig) : undefined,
        testScript: raw.testScript,
        status: raw.status,
      };
    });

    return {
      name,
      description,
      auth: rawCollection.auth ? (JSON.parse(JSON.stringify(rawCollection.auth)) as AuthConfig) : undefined,
      items,
      variables: [],
      format: 'trex',
    };
  };
}

export { TrexParserService };

