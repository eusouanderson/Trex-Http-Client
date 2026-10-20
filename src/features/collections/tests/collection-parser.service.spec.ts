import { describe, it, expect } from 'vitest';
import { CollectionParserService } from '../collection-parser.service';

describe('CollectionParserService', () => {
  it('should detect and parse a Postman collection', () => {
    const postman = {
      info: {
        name: 'Postman Sample',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: [
        {
          name: 'Request 1',
          request: {
            method: 'GET',
            url: { raw: 'https://api.example.com/items' },
          },
        },
      ],
      variable: [
        { key: 'baseUrl', value: 'https://api.example.com' },
      ],
    };

    const service = new CollectionParserService();
    const result = service.parse(JSON.stringify(postman));

    expect(result.format).toBe('postman');
    expect(result.name).toBe('Postman Sample');
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe('Request 1');
    expect(result.variables).toEqual([
      { key: 'baseUrl', value: 'https://api.example.com', enabled: true },
    ]);
  });

  it('should detect and parse a Trex collection with schema in info', () => {
    const trex = {
      info: {
        name: 'Trex Export',
        schema: 'https://trex-http-client.dev/schemas/collection/v1.0.0/collection.json',
      },
      name: 'Trex Export',
      items: [
        {
          id: 'item-1',
          name: 'Request 1',
          type: 'request',
          method: 'POST',
          url: 'https://api.example.com',
        },
      ],
    };

    const service = new CollectionParserService();
    const result = service.parse(JSON.stringify(trex));

    expect(result.format).toBe('trex');
    expect(result.name).toBe('Trex Export');
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.method).toBe('POST');
  });

  it('should detect a Trex collection when schema is absent but items is an array', () => {
    const rawTrex = {
      name: 'Direct Trex Collection',
      items: [
        {
          name: 'Folder 1',
          type: 'folder',
        },
      ],
    };

    const service = new CollectionParserService();
    const result = service.parse(JSON.stringify(rawTrex));

    expect(result.format).toBe('trex');
    expect(result.name).toBe('Direct Trex Collection');
    expect(result.items).toHaveLength(1);

    const topSchema = service.parse(JSON.stringify({
      schema: 'https://trex-http-client.dev/schemas/collection/v1.0.0/collection.json',
      name: 'Top Schema Col',
      items: [],
    }));
    expect(topSchema.format).toBe('trex');

    const infoNameTrex = service.parse(JSON.stringify({
      info: { name: 'Trex In Info' },
      items: [],
    }));
    expect(infoNameTrex.format).toBe('trex');
  });

  it('should throw error when JSON is invalid', () => {
    const service = new CollectionParserService();
    expect(() => service.parse('not-json')).toThrow('Invalid JSON format');
  });

  it('should throw error when JSON is not a recognized collection', () => {
    const service = new CollectionParserService();
    expect(() => service.parse(JSON.stringify({ other: 'data' }))).toThrow('Unsupported collection format');
    expect(() => service.parse(JSON.stringify(123))).toThrow('Unsupported collection format');
    expect(() => service.parse(JSON.stringify(null))).toThrow('Unsupported collection format');
  });
});

