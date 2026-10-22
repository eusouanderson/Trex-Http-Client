import type { HttpMethod } from '../../core/http/interfaces';
import type { CreateItemInput, PostmanCollection, PostmanItem, PostmanRequest } from './interfaces';

export class PostmanParserService {
  public parse(jsonString: string): { name: string; items: CreateItemInput[]; variables: { key: string; value: string; enabled: boolean }[] } {
    let parsed: PostmanCollection | null = null;
    try {
      parsed = JSON.parse(jsonString) as PostmanCollection;
    } catch {
      throw new Error('Invalid Postman JSON');
    }

    if (
      parsed.info === undefined ||
      typeof parsed.info.name !== 'string' ||
      parsed.info.name.trim() === '' ||
      !Array.isArray(parsed.item)
    ) {
      throw new Error('Invalid Postman structure');
    }

    const items: CreateItemInput[] = [];
    this.flattenItems(parsed.item, items, '');

    const variables = Array.isArray(parsed.variable)
      ? parsed.variable
          .filter((v): v is typeof v & { key: string } => typeof v.key === 'string' && v.key !== '')
          .map((v) => ({
            key: v.key,
            value: v.value ?? '',
            enabled: v.disabled !== true,
          }))
      : [];

    return {
      name: parsed.info.name,
      items,
      variables,
    };
  }

  private flattenItems(
    postmanItems: PostmanItem[],
    result: CreateItemInput[],
    currentPath: string,
  ): void {
    for (const item of postmanItems) {
      const itemName = item.name ?? 'Unnamed';
      const fullPath = currentPath !== '' ? `${currentPath} / ${itemName}` : itemName;

      if (Array.isArray(item.item) && item.item.length > 0) {
        this.flattenItems(item.item, result, fullPath);
      } else if (item.request !== undefined) {
        result.push(this.mapRequest(item.request, fullPath));
      }
    }
  }

  private mapRequest(request: PostmanRequest, name: string): CreateItemInput {
    const headers: Record<string, string> = {};
    if (Array.isArray(request.header)) {
      for (const h of request.header) {
        if (h.disabled !== true && h.key !== undefined && h.key !== '') {
          headers[h.key] = h.value ?? '';
        }
      }
    }

    const params: Record<string, string> = {};
    let url = '';

    if (typeof request.url === 'string') {
      url = request.url;
    } else if (request.url !== undefined && typeof request.url === 'object') {
      if (request.url.raw !== undefined) {
        url = request.url.raw;
      }
      
      // Extrair query parameters
      if (Array.isArray(request.url.query)) {
        for (const q of request.url.query) {
          if (q.disabled !== true && q.key !== undefined && q.key !== '') {
            params[q.key] = q.value ?? '';
          }
        }
      }

      // Substituir path variables (ex: :uuid -> valor)
      if (Array.isArray(request.url.variable)) {
        for (const v of request.url.variable) {
          if (v.key !== undefined && v.value !== undefined && v.key !== '') {
            url = url.replace(`:${v.key}`, v.value);
          }
        }
      }
    }

    let body = '';
    if (request.body?.mode === 'raw') {
      body = request.body.raw ?? '';
    } else if (request.body?.mode === 'urlencoded') {
       if (Array.isArray(request.body.urlencoded)) {
         const obj: Record<string, string> = {};
         for (const x of request.body.urlencoded) {
           if (x.disabled !== true && x.key !== undefined) {
             obj[x.key] = x.value ?? '';
           }
         }
         body = JSON.stringify(obj, null, 2);
       }
    }

    const m = request.method as HttpMethod | undefined;
    return {
      name,
      type: 'request',
      method: m ?? 'GET',
      url,
      headers,
      params,
      body,
    };
  }
}
