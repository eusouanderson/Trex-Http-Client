import type {
  HttpMethod,
  TrexRetryConfig,
  ResolvedTrexRetryConfig,
} from './interfaces';
import { TrexError, TrexHttpError } from './trex-errors';

const DEFAULT_RETRY_METHODS: HttpMethod[] = [
  'GET',
  'HEAD',
  'OPTIONS',
  'PUT',
  'DELETE',
];

const DEFAULT_RETRY_STATUS_CODES: number[] = [408, 429, 500, 502, 503, 504];

class RetryHandler {
  public resolveConfig(
    retry?: TrexRetryConfig | boolean,
  ): ResolvedTrexRetryConfig | null {
    if (retry === undefined || retry === false) {
      return null;
    }

    if (retry === true) {
      return {
        attempts: 3,
        delay: 1000,
        backoffFactor: 2,
        methods: DEFAULT_RETRY_METHODS,
        statusCodes: DEFAULT_RETRY_STATUS_CODES,
      };
    }

    return {
      attempts: retry.attempts,
      delay: retry.delay ?? 1000,
      backoffFactor: retry.backoffFactor ?? 2,
      methods: retry.methods ?? DEFAULT_RETRY_METHODS,
      statusCodes: retry.statusCodes ?? DEFAULT_RETRY_STATUS_CODES,
    };
  }

  public shouldRetry(
    error: unknown,
    method: HttpMethod,
    attempt: number,
    config: TrexRetryConfig | null,
  ): boolean {
    if (!config || attempt >= config.attempts) {
      return false;
    }

    const allowedMethods = config.methods ?? DEFAULT_RETRY_METHODS;
    if (!allowedMethods.includes(method)) {
      return false;
    }

    if (error instanceof TrexHttpError) {
      const retryableStatuses =
        config.statusCodes ?? DEFAULT_RETRY_STATUS_CODES;
      return retryableStatuses.includes(error.status);
    }

    if (
      error instanceof TypeError ||
      (error instanceof TrexError &&
        (error.code === 'NETWORK_ERROR' || error.cause instanceof TypeError))
    ) {
      return true;
    }

    return false;
  }

  public async wait(
    attempt: number,
    delay: number,
    backoffFactor: number,
  ): Promise<void> {
    const calculatedDelay = delay * Math.pow(backoffFactor, attempt - 1);
    await new Promise((resolve) => setTimeout(resolve, calculatedDelay));
  }
}

export { RetryHandler };
