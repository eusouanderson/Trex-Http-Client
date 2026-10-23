import { describe, expect, it } from 'vitest';
import type { Collection } from '../../collections/interfaces';
import type { RequestTab } from '../../request/interfaces';
import { ShortcutRequestService } from '../shortcut-request.service';

describe('ShortcutRequestService', () => {
  const service = new ShortcutRequestService();

  const mockCollections: Collection[] = [
    {
      id: 'col-1',
      name: 'Coleção 1',
      items: [
        {
          id: 'item-1',
          name: 'Item 1',
          type: 'request',
        },
      ],
    },
    {
      id: 'col-2',
      name: 'Coleção 2',
      items: [
        {
          id: 'item-2',
          name: 'Item 2',
          type: 'request',
        },
      ],
    },
  ];

  it('should return null when collections array is empty', () => {
    const result = service.resolveTargetCollection([]);
    expect(result).toBeNull();
  });

  it('should resolve collection by activeTab collectionId', () => {
    const activeTab: RequestTab = {
      id: 'custom-tab',
      collectionId: 'col-2',
      name: 'Req',
      method: 'GET',
      url: 'https://api.com',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      isDirty: false,
    };

    const result = service.resolveTargetCollection(mockCollections, activeTab);
    expect(result?.id).toBe('col-2');
  });

  it('should fallback to itemId lookup when activeTab collectionId does not exist in collections', () => {
    const activeTab: RequestTab = {
      id: 'item-1',
      collectionId: 'non-existing',
      name: 'Req',
      method: 'GET',
      url: 'https://api.com',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      isDirty: false,
    };

    const result = service.resolveTargetCollection(mockCollections, activeTab);
    expect(result?.id).toBe('col-1');
  });

  it('should resolve collection by activeTab id matching an item in a collection', () => {
    const activeTab: RequestTab = {
      id: 'item-2',
      name: 'Req',
      method: 'GET',
      url: 'https://api.com',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      isDirty: false,
    };

    const result = service.resolveTargetCollection(mockCollections, activeTab);
    expect(result?.id).toBe('col-2');
  });

  it('should resolve collection by selectedItemId when activeTab does not match', () => {
    const activeTab: RequestTab = {
      id: 'unknown-tab',
      name: 'Req',
      method: 'GET',
      url: 'https://api.com',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      isDirty: false,
    };

    const result = service.resolveTargetCollection(
      mockCollections,
      activeTab,
      'item-1',
    );
    expect(result?.id).toBe('col-1');
  });

  it('should fallback to first collection when no match is found', () => {
    const activeTab: RequestTab = {
      id: 'unknown-tab',
      name: 'Req',
      method: 'GET',
      url: 'https://api.com',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      isDirty: false,
    };

    const result = service.resolveTargetCollection(
      mockCollections,
      activeTab,
      'unknown-selected',
    );
    expect(result?.id).toBe('col-1');
  });

  it('should create new request with default parameters', () => {
    const result = service.createNewRequest('col-1');

    expect(result.itemInput).toEqual({
      name: 'Nova Requisição',
      type: 'request',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/todos/1',
      params: {},
      headers: {},
      body: '',
      auth: { type: 'none' },
      testScript: '',
    });

    expect(result.tabInput).toEqual({
      collectionId: 'col-1',
      name: 'Nova Requisição',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/todos/1',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      auth: { type: 'none' },
      testScript: '',
      isDirty: false,
    });
  });

  it('should create new request with custom initial parameters', () => {
    const result = service.createNewRequest('col-1', {
      name: 'Custom Req',
      method: 'POST',
      url: 'https://api.com/custom',
      body: '{"foo":"bar"}',
      auth: { type: 'bearer', token: 'xyz', enabled: true },
      testScript: 'expect(status).toBe(200)',
      headers: { 'X-Custom': 'Value' },
      params: { page: '1' },
    });

    expect(result.itemInput.name).toBe('Custom Req');
    expect(result.itemInput.method).toBe('POST');
    expect(result.itemInput.url).toBe('https://api.com/custom');
    expect(result.itemInput.body).toBe('{"foo":"bar"}');
    expect(result.itemInput.auth).toEqual({ type: 'bearer', token: 'xyz', enabled: true });
    expect(result.itemInput.testScript).toBe('expect(status).toBe(200)');
    expect(result.tabInput.name).toBe('Custom Req');
    expect(result.tabInput.method).toBe('POST');
  });

  it('should duplicate a request with headers, params and auth', () => {
    const sourceTab: RequestTab = {
      id: 'source-tab-1',
      collectionId: 'col-1',
      name: 'Get Users',
      method: 'POST',
      url: 'https://api.com/users',
      params: [
        { id: 'p1', key: 'page', value: '2', enabled: true },
        { id: 'p2', key: '   ', value: 'ignore', enabled: true },
      ],
      headers: [
        { id: 'h1', key: 'Content-Type', value: 'application/json', enabled: true },
        { id: 'h2', key: '', value: 'empty', enabled: true },
      ],
      bodyType: 'json',
      body: '{"name":"trex"}',
      auth: { type: 'basic', username: 'admin', password: 'secretpassword', enabled: true },
      testScript: 'console.log("ok")',
      isDirty: true,
    };

    const result = service.duplicateRequest(sourceTab, 'col-2');

    expect(result.itemInput).toEqual({
      name: 'Get Users (Cópia)',
      type: 'request',
      method: 'POST',
      url: 'https://api.com/users',
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        page: '2',
      },
      body: '{"name":"trex"}',
      auth: { type: 'basic', username: 'admin', password: 'secretpassword', enabled: true },
      testScript: 'console.log("ok")',
    });

    expect(result.tabInput.collectionId).toBe('col-2');
    expect(result.tabInput.name).toBe('Get Users (Cópia)');
    expect(result.tabInput.method).toBe('POST');
    expect(result.tabInput.bodyType).toBe('json');
    expect(result.tabInput.body).toBe('{"name":"trex"}');
    expect(result.tabInput.auth).toEqual({
      type: 'basic',
      username: 'admin',
      password: 'secretpassword',
      enabled: true,
    });
    expect(result.tabInput.testScript).toBe('console.log("ok")');
    expect(result.tabInput.isDirty).toBe(false);
    expect(result.tabInput.params).toHaveLength(2);
    expect(result.tabInput.headers).toHaveLength(2);
    expect(result.tabInput.params[0]?.id).not.toBe('p1');
    expect(result.tabInput.headers[0]?.id).not.toBe('h1');
  });

  it('should duplicate a request when auth and testScript are undefined', () => {
    const sourceTab: RequestTab = {
      id: 'source-tab-2',
      name: 'Simple Tab',
      method: 'DELETE',
      url: 'https://api.com/item',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      isDirty: false,
    };

    const result = service.duplicateRequest(sourceTab, 'col-1');

    expect(result.itemInput.name).toBe('Simple Tab (Cópia)');
    expect(result.itemInput.auth).toEqual({ type: 'none' });
    expect(result.itemInput.testScript).toBe('');
    expect(result.tabInput.auth).toEqual({ type: 'none' });
    expect(result.tabInput.testScript).toBe('');
  });
});

