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
            {
              request: {
                method: 'GET',
                url: { raw: 'https://api.example.com/unnamed' },
              },
            },
          ],
        },
      ],
    };

    const parser = new PostmanParserService();
    const result = parser.parse(JSON.stringify(postmanJson));

    expect(result.name).toBe('Nested Collection');
    expect(result.items).toHaveLength(3);
    expect(result.items[0].name).toBe('Folder 1 / Subfolder A / Nested Request');
    expect(result.items[1].name).toBe('Folder 1 / Another Request');
    expect(result.items[2].name).toBe('Folder 1 / Unnamed');
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
              { key: 'Authorization', value: 'Bearer token', disabled: true },
              { key: 'No-Value-Header' },
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

    expect(result.items[0].headers).toEqual({ 'Content-Type': 'application/json', 'No-Value-Header': '' });
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

  it('should extract query parameters and replace path variables', () => {
    const postmanJson = {
      info: { name: 'Params Collection' },
      item: [
        {
          name: 'Params Request',
          request: {
            method: 'GET',
            url: {
              raw: 'https://api.example.com/users/:id',
              query: [
                { key: 'page', value: '1' },
                { key: 'sort', value: 'desc', disabled: true },
                { key: '', value: 'empty' },
                { key: 'novalue' },
              ],
              variable: [
                { key: 'id', value: '123' },
                { key: '', value: 'empty' },
                { key: 'missingval' }
              ]
            },
          },
        },
        {
          name: 'String URL Request',
          request: {
            url: 'https://api.example.com/simple',
          },
        }
      ],
      variable: [
        { key: 'baseUrl', value: 'http://api' },
        { key: 'missing' }
      ]
    };

    const parser = new PostmanParserService();
    const result = parser.parse(JSON.stringify(postmanJson));

    expect(result.items[0].url).toBe('https://api.example.com/users/123');
    expect(result.items[0].params).toEqual({ page: '1', novalue: '' });
    expect(result.items[1].url).toBe('https://api.example.com/simple');
    expect(result.items[1].method).toBe('GET');
    expect(result.variables[1].value).toBe('');
  });

  it('should handle urlencoded body and missing raw body', () => {
    const postmanJson = {
      info: { name: 'Body Collection' },
      item: [
        {
          name: 'UrlEncoded Request',
          request: {
            method: 'POST',
            url: { raw: 'https://api.example.com/form' },
            body: {
              mode: 'urlencoded',
              urlencoded: [
                { key: 'field1', value: 'value1' },
                { key: 'field2', value: 'value2', disabled: true },
                { key: 'novalue' },
              ]
            },
          },
        },
        {
          name: 'Raw Missing Request',
          request: {
            method: 'POST',
            url: { raw: 'https://api.example.com/raw' },
            body: {
              mode: 'raw',
            },
          },
        },
      ],
    };

    const parser = new PostmanParserService();
    const result = parser.parse(JSON.stringify(postmanJson));

    expect(result.items[0].body).toBe(JSON.stringify({ field1: 'value1', novalue: '' }, null, 2));
    expect(result.items[1].body).toBe('');
  });
});
