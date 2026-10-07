import { describe, it, expect } from 'vitest';
import { PostmanParserService } from '../postman-parser.service';

describe('PostmanParserService', () => {
  it('should parse a simple flat Postman collection', () => {
    const postmanJson = {
      info: {
        name: 'Simple Collection',
      },
      item: [
        {
          name: 'My Request',
          request: {
            method: 'GET',
            url: { raw: 'https://api.example.com/data' },
          },
        },
      ],
    };

    const parser = new PostmanParserService();
    const result = parser.parse(JSON.stringify(postmanJson));

    expect(result.name).toBe('Simple Collection');
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual({
      name: 'My Request',
      type: 'request',
      method: 'GET',
      url: 'https://api.example.com/data',
      headers: {},
      params: {},
      body: '',
    });
  });

  it('should flatten nested folders into request names', () => {
    const postmanJson = {
      info: { name: 'Nested Collection' },
      item: [
        {
          name: 'Folder 1',
          item: [
            {
              name: 'Subfolder A',
              item: [
                {
                  name: 'Nested Request',
                  request: {
                    method: 'POST',
                    url: { raw: 'https://api.example.com/nested' },
                  },
                },
              ],
            },
            {
              name: 'Another Request',
              request: {
                method: 'DELETE',
                url: { raw: 'https://api.example.com/delete' },
              },
            },
          ],
        },
      ],
    };

    const parser = new PostmanParserService();
    const result = parser.parse(JSON.stringify(postmanJson));

    expect(result.name).toBe('Nested Collection');
    expect(result.items).toHaveLength(2);
    expect(result.items[0].name).toBe('Folder 1 / Subfolder A / Nested Request');
    expect(result.items[1].name).toBe('Folder 1 / Another Request');
  });

  it('should extract headers and body', () => {
    const postmanJson = {
      info: { name: 'Headers Collection' },
      item: [
        {
          name: 'Complex Request',
          request: {
            method: 'PUT',
            url: { raw: 'https://api.example.com/complex?foo=bar' },
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer token', disabled: true }, // disabled should be ignored if we want, or just mapped? Postman schema has disabled.
            ],
            body: {
              mode: 'raw',
              raw: '{"key":"value"}',
            },
          },
        },
      ],
    };

    const parser = new PostmanParserService();
    const result = parser.parse(JSON.stringify(postmanJson));

    expect(result.items[0].headers).toEqual({ 'Content-Type': 'application/json' });
    expect(result.items[0].body).toBe('{"key":"value"}');
  });
  
  it('should throw an error for invalid JSON', () => {
    const parser = new PostmanParserService();
    expect(() => parser.parse('invalid json')).toThrow('Invalid Postman JSON');
  });
  
  it('should throw an error for invalid Postman format', () => {
    const parser = new PostmanParserService();
    expect(() => parser.parse('{"foo": "bar"}')).toThrow('Invalid Postman structure');
  });
});
