import type { z } from 'zod';
import type { ResponseType } from './interfaces';
import { TrexError } from './trex-errors';

class ResponseParser {
  public async parseBody(
    response: Response,
    responseType?: ResponseType,
  ): Promise<unknown> {
    if (response.status === 204) {
      return null;
    }

    if (responseType === 'blob') {
      return response.blob();
    }

    if (responseType === 'arrayBuffer') {
      return response.arrayBuffer();
    }

    if (responseType === 'text') {
      return response.text();
    }

    const contentType = response.headers.get('content-type') ?? '';
    const isJson =
      contentType.includes('application/json') ||
      contentType.includes('+json');

    if (isJson || !contentType) {
      const text = await response.text();
      if (!text || text.trim() === '') {
        return null;
      }
      try {
        return JSON.parse(text);
      } catch (parseError: unknown) {
        throw new TrexError('Failed to parse JSON response', {
          code: 'PARSE_ERROR',
          cause: parseError,
        });
      }
    }

    return response.text();
  }

  public validate(data: unknown, schema?: unknown): unknown {
    if (schema === undefined || schema === null) {
      return data;
    }

    const zodSchema = schema as z.ZodTypeAny;
    const result = zodSchema.safeParse(data);
    if (!result.success) {
      throw new TrexError(`Validation error: ${result.error.message}`, {
        code: 'VALIDATION_ERROR',
        cause: result.error,
      });
    }

    return result.data;
  }
}

export { ResponseParser };
