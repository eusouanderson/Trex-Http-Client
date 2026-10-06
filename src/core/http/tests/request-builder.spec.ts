import { describe, it, expect } from 'vitest';
import { RequestBuilder } from '../request-builder';

describe('RequestBuilder', () => {
  const builder = new RequestBuilder();

  it('should build relative url with baseURL and trailing/leading slash normalizations', () => {
    const url1 = builder.buildUrl('users', 'https://api.dinossauro.dev');
    expect(url1).toBe('https://api.dinossauro.dev/users');

    const url2 = builder.buildUrl('/users', 'https://api.dinossauro.dev/');
    expect(url2).toBe('https://api.dinossauro.dev/users');

    const absolute = builder.buildUrl('https://other.api/items', 'https://api.dinossauro.dev');
    expect(absolute).toBe('https://other.api/items');
  });

  it('should build query parameters including arrays and omit null or undefined', () => {
    const url = builder.buildUrl('https://api.dinossauro.dev/search', undefined, {
      q: 'trex',
      tags: ['fossil', 'carnivore'],
      ignored: undefined,
      empty: null,
    });
    expect(url).toBe('https://api.dinossauro.dev/search?q=trex&tags=fossil&tags=carnivore');
  });

  it('should append to existing query string using ampersand', () => {
    const url = builder.buildUrl('https://api.dinossauro.dev/search?category=bones', undefined, {
      limit: 10,
    });
    expect(url).toBe('https://api.dinossauro.dev/search?category=bones&limit=10');
  });

  it('should return plain url if params are undefined or empty', () => {
    const url1 = builder.buildUrl('https://api.dinossauro.dev/ping');
    expect(url1).toBe('https://api.dinossauro.dev/ping');

    const url2 = builder.buildUrl('https://api.dinossauro.dev/ping', undefined, {});
    expect(url2).toBe('https://api.dinossauro.dev/ping');
  });

  it('should handle FormData body and delete Content-Type header', () => {
    const formData = new FormData();
    formData.append('name', 'Velociraptor');

    const result = builder.buildRequestInit('POST', 'https://api.dinossauro.dev/fossils', {
      headers: { 'Content-Type': 'application/json' },
      data: formData,
    });

    expect(result.init.headers).not.toHaveProperty('Content-Type');
    expect(result.init.body).toBe(formData);
  });

  it('should handle string, Blob, URLSearchParams, and object data in request init', () => {
    const stringResult = builder.buildRequestInit('POST', 'https://api.dinossauro.dev/text', {
      data: 'plain text body',
    });
    expect(stringResult.init.body).toBe('plain text body');

    const searchParams = new URLSearchParams({ id: '1' });
    const searchParamsResult = builder.buildRequestInit('POST', 'https://api.dinossauro.dev/form', {
      data: searchParams,
    });
    expect(searchParamsResult.init.body).toBe(searchParams);

    const jsonResult = builder.buildRequestInit('POST', 'https://api.dinossauro.dev/json', {
      data: { era: 'Cretaceous' },
    });
    expect(jsonResult.init.body).toBe(JSON.stringify({ era: 'Cretaceous' }));
    const headers = jsonResult.init.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
  });
});

