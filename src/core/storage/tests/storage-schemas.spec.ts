import { describe, it, expect } from 'vitest';
import {
  collectionSchema,
  collectionItemSchema,
  environmentSchema,
  environmentVariableSchema,
  clientSettingsSchema,
  requestHistoryItemSchema,
  validateCollection,
  validateEnvironment,
  validateClientSettings,
  validateRequestHistoryItem,
} from '../schemas';

describe('Storage Schemas (Zod)', () => {
  it('should export all schemas correctly', () => {
    expect(collectionSchema).toBeDefined();
    expect(environmentSchema).toBeDefined();
    expect(clientSettingsSchema).toBeDefined();
    expect(requestHistoryItemSchema).toBeDefined();
  });

  it('should validate a valid collection and its items', () => {
    const raw = {
      id: 'col-1',
      name: 'Minha Coleção',
      description: 'Desc',
      items: [
        {
          id: 'item-1',
          name: 'Item GET',
          type: 'request',
          method: 'GET',
          url: 'https://api.exemplo.com',
          headers: { Authorization: 'Bearer token' },
          params: { page: '1' },
          body: '',
          status: 200,
        },
      ],
    };

    const parsed = validateCollection(raw);
    expect(parsed.id).toBe('col-1');
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0]?.name).toBe('Item GET');
  });

  it('should parse valid collection item directly', () => {
    const item = {
      id: 'item-2',
      name: 'Pasta A',
      type: 'folder',
    };
    const parsed = collectionItemSchema.parse(item);
    expect(parsed.type).toBe('folder');
  });

  it('should throw error when collection has invalid schema', () => {
    const invalid = {
      id: '',
      name: '',
      items: 'not-array',
    };
    expect(() => validateCollection(invalid)).toThrow();
  });

  it('should validate a valid environment with variables', () => {
    const raw = {
      id: 'env-1',
      name: 'Produção',
      variables: [
        {
          id: 'v-1',
          key: 'API_URL',
          value: 'https://api.site.com',
          enabled: true,
        },
      ],
      createdAt: 1000,
      updatedAt: 2000,
    };

    const parsed = validateEnvironment(raw);
    expect(parsed.id).toBe('env-1');
    expect(parsed.variables).toHaveLength(1);
    expect(parsed.variables[0]?.key).toBe('API_URL');
  });

  it('should parse individual environment variable', () => {
    const variable = {
      id: 'v-2',
      key: 'TOKEN',
      value: 'xyz',
      enabled: false,
    };
    const parsed = environmentVariableSchema.parse(variable);
    expect(parsed.enabled).toBe(false);
  });

  it('should throw error when environment has invalid schema', () => {
    const invalid = {
      id: 123,
      name: '',
      variables: null,
    };
    expect(() => validateEnvironment(invalid)).toThrow();
  });

  it('should validate valid client settings', () => {
    const raw = {
      theme: 'dino',
      orientation: 'horizontal',
      density: 'comfortable',
      defaultTimeout: 30000,
      defaultRetryAttempts: 1,
      followRedirects: true,
      globalHeaders: { 'Content-Type': 'application/json' },
      jsonTheme: {
        preset: 'dino',
        backgroundColor: '#141311',
        keyColor: '#86efac',
        stringColor: '#fcd34d',
        numberColor: '#60a5fa',
        booleanColor: '#f87171',
        nullColor: '#938d82',
        bracketColor: '#cdbca4',
      },
    };

    const parsed = validateClientSettings(raw);
    expect(parsed.theme).toBe('dino');
    expect(parsed.orientation).toBe('horizontal');
  });

  it('should throw error when client settings are invalid', () => {
    const invalid = {
      theme: 'unknown-theme',
      defaultTimeout: -1,
    };
    expect(() => validateClientSettings(invalid)).toThrow();
  });

  it('should validate valid request history item', () => {
    const raw = {
      id: 'hist-1',
      url: 'https://api.teste.com/users',
      method: 'POST',
      status: 201,
      durationMs: 142,
      timestamp: Date.now(),
      headers: { 'Content-Type': 'application/json' },
      body: '{"test":true}',
    };

    const parsed = validateRequestHistoryItem(raw);
    expect(parsed.id).toBe('hist-1');
    expect(parsed.method).toBe('POST');
  });

  it('should throw error when request history item is invalid', () => {
    const invalid = {
      id: '',
      method: 'INVALID_METHOD',
    };
    expect(() => validateRequestHistoryItem(invalid)).toThrow();
  });
});

