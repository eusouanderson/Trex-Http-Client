import { describe, it, expect } from 'vitest';
import { TrexError, TrexHttpError } from '../trex-errors';

describe('TrexErrors', () => {
  it('should create TrexError with correct name, code and cause', () => {
    const causeError = new Error('Socket timeout');
    const err = new TrexError('Connection failed', {
      code: 'TIMEOUT',
      cause: causeError,
    });

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('TrexError');
    expect(err.code).toBe('TIMEOUT');
    expect(err.message).toBe('Connection failed');
    expect(err.cause).toBe(causeError);
  });

  it('should create TrexHttpError with HTTP metadata', () => {
    const headers = new Headers({ 'content-type': 'application/json' });
    const httpErr = new TrexHttpError('Resource not found', {
      status: 404,
      statusText: 'Not Found',
      url: 'https://api.dinossauro.dev/fossil/999',
      method: 'GET',
      data: { message: 'Fossil missing' },
      headers,
    });

    expect(httpErr).toBeInstanceOf(TrexError);
    expect(httpErr.name).toBe('TrexHttpError');
    expect(httpErr.status).toBe(404);
    expect(httpErr.statusText).toBe('Not Found');
    expect(httpErr.url).toBe('https://api.dinossauro.dev/fossil/999');
    expect(httpErr.method).toBe('GET');
    expect(httpErr.data).toEqual({ message: 'Fossil missing' });
    expect(httpErr.headers).toBe(headers);
    expect(httpErr.code).toBe('HTTP_ERROR');
  });
});

