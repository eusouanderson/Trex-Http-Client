import type { HttpMethod, TrexErrorCode } from './interfaces';

interface TrexErrorOptions {
  code: TrexErrorCode;
  cause?: unknown;
}

interface TrexHttpErrorOptions {
  status: number;
  statusText: string;
  url: string;
  method: HttpMethod;
  data: unknown;
  headers: Headers;
  cause?: unknown;
}

class TrexError extends Error {
  public readonly code: TrexErrorCode;
  public override readonly cause?: unknown;

  constructor(message: string, options: TrexErrorOptions) {
    super(message);
    this.name = 'TrexError';
    this.code = options.code;
    this.cause = options.cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class TrexHttpError extends TrexError {
  public readonly status: number;
  public readonly statusText: string;
  public readonly url: string;
  public readonly method: HttpMethod;
  public readonly data: unknown;
  public readonly headers: Headers;

  constructor(message: string, options: TrexHttpErrorOptions) {
    super(message, {
      code: 'HTTP_ERROR',
      cause: options.cause,
    });
    this.name = 'TrexHttpError';
    this.status = options.status;
    this.statusText = options.statusText;
    this.url = options.url;
    this.method = options.method;
    this.data = options.data;
    this.headers = options.headers;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export { TrexError, TrexHttpError };
