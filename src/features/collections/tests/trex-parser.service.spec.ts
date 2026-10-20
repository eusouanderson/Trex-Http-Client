import { describe, it, expect } from 'vitest';
import { TrexParserService } from '../trex-parser.service';

describe('TrexParserService', () => {
  it('should parse a standard Trex collection with info metadata', () => {
    const raw = {
      info: {
        name: 'T-Rex API',
        description: 'Endpoints para dinossauros',
        schema: 'https://trex-http-client.dev/schemas/collection/v1.0.0/collection.json',
      },
      id: 'col-1',
      name: 'T-Rex API',
      description: 'Endpoints para dinossauros',
      auth: {
        type: 'bearer',
        token: 'dino-secret',
      },
      items: [
        {
          id: 'item-1',
          name: 'Listar Dinossauros',
          type: 'request',
          method: 'GET',
          url: 'https://api.example.com/dinosaurs',
          headers: { 'X-Dino': 'true' },
          params: { limit: '10' },
          body: '',
          testScript: 'tx.test("ok", () => {});',
        },
        {
          id: 'folder-1',
          name: 'Carnívoros',
          type: 'folder',
        },
        {
          id: 'item-2',
          name: 'Criar Espécime',
          type: 'request',
          parentId: 'folder-1',
          method: 'POST',
          url: 'https://api.example.com/dinosaurs',
          body: '{"name":"Velociraptor"}',
        },
      ],
    };

    const parser = new TrexParserService();
    const result = parser.parse(JSON.stringify(raw));

    expect(result.format).toBe('trex');
    expect(result.name).toBe('T-Rex API');
    expect(result.description).toBe('Endpoints para dinossauros');
    expect(result.auth?.type).toBe('bearer');
    expect(result.variables).toEqual([]);
    expect(result.items).toHaveLength(3);
    expect(result.items[0]?.name).toBe('Listar Dinossauros');
    expect(result.items[0]?.headers).toEqual({ 'X-Dino': 'true' });
    expect(result.items[0]?.params).toEqual({ limit: '10' });
    expect(result.items[0]?.testScript).toBe('tx.test("ok", () => {});');
    expect(result.items[1]?.type).toBe('folder');
    expect(result.items[2]?.parentId).toBe('folder-1');
  });

  it('should parse legacy Trex collection without info field', () => {
    const legacy = {
      id: 'col-legacy',
      name: 'Legacy Col',
      items: [
        {
          id: 'item-x',
          name: 'Legacy Req',
          type: 'request',
          method: 'PUT',
          url: 'https://api.example.com/legacy',
        },
      ],
    };

    const parser = new TrexParserService();
    const result = parser.parse(JSON.stringify(legacy));

    expect(result.format).toBe('trex');
    expect(result.name).toBe('Legacy Col');
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.method).toBe('PUT');
  });

  it('should throw error when JSON is invalid', () => {
    const parser = new TrexParserService();
    expect(() => parser.parse('not-a-json')).toThrow('Invalid Trex JSON');
  });

  it('should throw error when structure is missing name or items is not an array', () => {
    const parser = new TrexParserService();
    expect(() => parser.parse(JSON.stringify({}))).toThrow('Invalid Trex structure');
    expect(() => parser.parse(JSON.stringify(null))).toThrow('Invalid Trex structure');
    expect(() => parser.parse(JSON.stringify({ name: '' }))).toThrow('Invalid Trex structure');
    expect(() => parser.parse(JSON.stringify({ name: '', items: [] }))).toThrow('Invalid Trex structure');
    expect(() => parser.parse(JSON.stringify({ items: [] }))).toThrow('Invalid Trex structure');
    expect(() => parser.parse(JSON.stringify({ name: 'Valid', items: 'not-array' }))).toThrow('Invalid Trex structure');
  });

  it('should fallback to default title when item has no name', () => {
    const parser = new TrexParserService();
    const result = parser.parse(JSON.stringify({
      name: 'No Item Name Col',
      items: [{ type: 'request' }],
    }));
    expect(result.items[0]?.name).toBe('Sem título');
  });

  it('should parse collection name from info when top-level name is absent and parse item auth', () => {
    const parser = new TrexParserService();
    const fromInfo = parser.parse(JSON.stringify({
      info: { name: 'Only Info Name' },
      items: [
        {
          name: 'Item With Auth',
          type: 'request',
          auth: { type: 'bearer', token: 'item-secret' },
        },
      ],
    }));
    expect(fromInfo.name).toBe('Only Info Name');
    expect(fromInfo.items[0]?.auth?.type).toBe('bearer');
  });
});

