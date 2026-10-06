import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { ResponseParser } from '../response-parser';
import { TrexError } from '../trex-errors';

describe('ResponseParser', () => {
  const parser = new ResponseParser();

  it('should return null for 204 No Content', async () => {
    const res = new Response(null, { status: 204 });
    const parsed = await parser.parseBody(res);
    expect(parsed).toBeNull();
  });

  it('should parse blob when responseType is blob', async () => {
    const res = new Response('dino-image-content');
    const parsed = (await parser.parseBody(res, 'blob')) as Blob;
    expect(parsed.size).toBe(18);
  });

  it('should parse arrayBuffer when responseType is arrayBuffer', async () => {
    const res = new Response('buffer-data');
    const parsed = await parser.parseBody(res, 'arrayBuffer');
    expect(parsed).toBeInstanceOf(ArrayBuffer);
  });

  it('should parse text when responseType is text', async () => {
    const res = new Response('raw-string-content');
    const parsed = await parser.parseBody(res, 'text');
    expect(parsed).toBe('raw-string-content');
  });

  it('should return null if json response body is empty or whitespace', async () => {
    const res = new Response('', {
      headers: { 'Content-Type': 'application/json' },
    });
    const parsed = await parser.parseBody(res);
    expect(parsed).toBeNull();
  });

  it('should parse valid JSON when contentType is application/json', async () => {
    const res = new Response(JSON.stringify({ name: 'Spinosaurus' }), {
      headers: { 'Content-Type': 'application/json' },
    });
    const parsed = await parser.parseBody(res);
    expect(parsed).toEqual({ name: 'Spinosaurus' });
  });

  it('should throw TrexError when JSON parsing fails', async () => {
    const res = new Response('invalid-json-{', {
      headers: { 'Content-Type': 'application/json' },
    });
    await expect(parser.parseBody(res)).rejects.toThrow(TrexError);
  });

  it('should return text when content type is not json', async () => {
    const res = new Response('<h1>HTML</h1>', {
      headers: { 'Content-Type': 'text/html' },
    });
    const parsed = await parser.parseBody(res);
    expect(parsed).toBe('<h1>HTML</h1>');
  });

  it('should return data when schema is null or undefined', () => {
    const data = { count: 42 };
    expect(parser.validate(data, undefined)).toBe(data);
    expect(parser.validate(data, null)).toBe(data);
  });

  it('should validate and parse data with valid Zod schema', () => {
    const schema = z.object({ id: z.number(), name: z.string() });
    const validData = { id: 1, name: 'Ankylosaurus' };
    const validated = parser.validate(validData, schema);
    expect(validated).toEqual(validData);
  });

  it('should throw TrexError on invalid data with Zod schema', () => {
    const schema = z.object({ id: z.number(), name: z.string() });
    const invalidData = { id: 'not-a-number', name: 123 };
    expect(() => parser.validate(invalidData, schema)).toThrow(TrexError);
  });
});
