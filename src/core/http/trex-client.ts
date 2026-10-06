import type {
  HttpMethod,
  InferSchemaType,
  ITrexClient,
  RequestInterceptor,
  ResponseInterceptor,
  TrexClientConfig,
  TrexRequestConfig,
  TrexResponse,
} from './interfaces';
import { InterceptorManager } from './interceptor-manager';
import { RequestBuilder } from './request-builder';
import { ResponseParser } from './response-parser';
import { RetryHandler } from './retry-handler';
import { TrexError, TrexHttpError } from './trex-errors';

class TrexClient implements ITrexClient {
  public readonly interceptors: {
    request: InterceptorManager<RequestInterceptor>;
    response: InterceptorManager<ResponseInterceptor>;
  };

  private readonly requestBuilder: RequestBuilder;
  private readonly responseParser: ResponseParser;
  private readonly retryHandler: RetryHandler;
  private readonly baseConfig: TrexClientConfig;

  constructor(config?: TrexClientConfig) {
    this.baseConfig = { ...config };
    this.interceptors = {
      request: new InterceptorManager<RequestInterceptor>(),
      response: new InterceptorManager<ResponseInterceptor>(),
    };
    this.requestBuilder = new RequestBuilder();
    this.responseParser = new ResponseParser();
    this.retryHandler = new RetryHandler();
  }

  public get<T = unknown, S = unknown>(
    url: string,
    config?: TrexRequestConfig<S>,
  ): Promise<InferSchemaType<S, T>> {
    return this.request<T, S>('GET', url, config);
  }

  public post<T = unknown, S = unknown>(
    url: string,
    data?: unknown,
    config?: TrexRequestConfig<S>,
  ): Promise<InferSchemaType<S, T>> {
    return this.request<T, S>('POST', url, { ...config, data });
  }

  public put<T = unknown, S = unknown>(
    url: string,
    data?: unknown,
    config?: TrexRequestConfig<S>,
  ): Promise<InferSchemaType<S, T>> {
    return this.request<T, S>('PUT', url, { ...config, data });
  }

  public patch<T = unknown, S = unknown>(
    url: string,
    data?: unknown,
    config?: TrexRequestConfig<S>,
  ): Promise<InferSchemaType<S, T>> {
    return this.request<T, S>('PATCH', url, { ...config, data });
  }

  public delete<T = unknown, S = unknown>(
    url: string,
    config?: TrexRequestConfig<S>,
  ): Promise<InferSchemaType<S, T>> {
    return this.request<T, S>('DELETE', url, config);
  }

  public async request<T = unknown, S = unknown>(
    method: HttpMethod,
    url: string,
    config?: TrexRequestConfig<S>,
  ): Promise<InferSchemaType<S, T>> {
    let mergedConfig: TrexRequestConfig = {
      ...this.baseConfig,
      ...config,
      headers: {
        ...this.baseConfig.headers,
        ...config?.headers,
      },
    };

    for (const interceptor of this.interceptors.request.getItems()) {
      try {
        mergedConfig = await interceptor.fulfilled(mergedConfig);
      } catch (err: unknown) {
        if (interceptor.rejected !== undefined) {
          await interceptor.rejected(err);
        }
        throw err;
      }
    }

    const retryConfig = this.retryHandler.resolveConfig(mergedConfig.retry);
    const maxAttempts = retryConfig?.attempts ?? 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const abortState = { isTimeout: false };

      if (mergedConfig.timeout !== undefined && mergedConfig.timeout > 0) {
        timeoutId = setTimeout(() => {
          abortState.isTimeout = true;
          controller.abort();
        }, mergedConfig.timeout);
      }

      const onConsumerAbort = (): void => {
        controller.abort();
      };

      const cleanup = (): void => {
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId);
        }
        if (mergedConfig.signal !== undefined) {
          mergedConfig.signal.removeEventListener('abort', onConsumerAbort);
        }
      };

      if (mergedConfig.signal !== undefined) {
        if (mergedConfig.signal.aborted) {
          controller.abort();
        } else {
          mergedConfig.signal.addEventListener('abort', onConsumerAbort);
        }
      }

      try {
        const { url: finalUrl, init } = this.requestBuilder.buildRequestInit(
          method,
          url,
          {
            ...mergedConfig,
            signal: controller.signal,
          },
        );

        const fetchFn = mergedConfig.fetch ?? fetch;
        let rawResponse: Response;

        try {
          rawResponse = await fetchFn(finalUrl, init);
        } catch (fetchErr: unknown) {
          if (abortState.isTimeout) {
            throw new TrexError('Request timed out', {
              code: 'TIMEOUT',
              cause: fetchErr,
            });
          }
          if (
            mergedConfig.signal?.aborted === true ||
            (fetchErr instanceof Error && fetchErr.name === 'AbortError')
          ) {
            throw new TrexError('Request aborted', {
              code: 'ABORTED',
              cause: fetchErr,
            });
          }
          throw new TrexError(
            fetchErr instanceof Error ? fetchErr.message : 'Network error',
            {
              code: 'NETWORK_ERROR',
              cause: fetchErr,
            },
          );
        }

        const parsedData = await this.responseParser.parseBody(
          rawResponse,
          mergedConfig.responseType,
        );

        if (!rawResponse.ok) {
          throw new TrexHttpError(
            `Request failed with status ${String(rawResponse.status)}`,
            {
              status: rawResponse.status,
              statusText: rawResponse.statusText,
              url: finalUrl,
              method,
              data: parsedData,
              headers: rawResponse.headers,
            },
          );
        }

        let trexResponse: TrexResponse = {
          data: parsedData,
          status: rawResponse.status,
          statusText: rawResponse.statusText,
          headers: rawResponse.headers,
          config: mergedConfig,
          rawResponse,
        };

        for (const interceptor of this.interceptors.response.getItems()) {
          trexResponse = await interceptor.fulfilled(trexResponse);
        }

        const validated = this.responseParser.validate(
          trexResponse.data,
          mergedConfig.schema,
        );

        cleanup();
        return validated as InferSchemaType<S, T>;
      } catch (err: unknown) {
        if (
          this.retryHandler.shouldRetry(err, method, attempt, retryConfig) &&
          retryConfig !== null
        ) {
          cleanup();
          await this.retryHandler.wait(
            attempt,
            retryConfig.delay,
            retryConfig.backoffFactor,
          );
          continue;
        }

        let finalError: unknown = err;
        for (const interceptor of this.interceptors.response.getItems()) {
          if (interceptor.rejected !== undefined) {
            try {
              finalError = await interceptor.rejected(finalError);
            } catch (rejectedErr: unknown) {
              finalError = rejectedErr;
            }
          }
        }

        cleanup();
        if (finalError instanceof Error) {
          throw finalError;
        }

        return finalError as InferSchemaType<S, T>;
      }
    }

    throw new TrexError('Maximum retry attempts reached', {
      code: 'NETWORK_ERROR',
    });
  }
}

const createTrexClient = (config?: TrexClientConfig): TrexClient => {
  return new TrexClient(config);
};

export { TrexClient, createTrexClient };
