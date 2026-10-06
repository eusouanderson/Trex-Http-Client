import type { z } from 'zod';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

type TrexErrorCode =
  | 'HTTP_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'ABORTED'
  | 'PARSE_ERROR'
  | 'VALIDATION_ERROR';

type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | (string | number | boolean)[];

type QueryParams = Record<string, QueryParamValue>;

type ResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer';

interface TrexRetryConfig {
  attempts: number;
  delay?: number;
  backoffFactor?: number;
  methods?: HttpMethod[];
  statusCodes?: number[];
}

interface ResolvedTrexRetryConfig {
  attempts: number;
  delay: number;
  backoffFactor: number;
  methods: HttpMethod[];
  statusCodes: number[];
}

interface TrexRequestConfig<TSchema = unknown> {
  baseURL?: string;
  headers?: Record<string, string>;
  params?: QueryParams;
  data?: unknown;
  body?: BodyInit | null;
  timeout?: number;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
  responseType?: ResponseType;
  schema?: TSchema;
  retry?: TrexRetryConfig | boolean;
  fetch?: typeof fetch;
}

type TrexClientConfig = Omit<
  TrexRequestConfig,
  'data' | 'body' | 'params' | 'schema'
>;

interface TrexResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: TrexRequestConfig;
  rawResponse: Response;
}

type RequestInterceptor = (
  config: TrexRequestConfig,
) => TrexRequestConfig | Promise<TrexRequestConfig>;

type ResponseInterceptor = (
  response: TrexResponse,
) => TrexResponse | Promise<TrexResponse>;

type ErrorInterceptor = (error: unknown) => unknown;

interface IInterceptorManager<T> {
  use(fulfilled: T, rejected?: ErrorInterceptor): number;
  eject(id: number): void;
  clear(): void;
  forEach(fn: (interceptor: { fulfilled: T; rejected?: ErrorInterceptor }) => void): void;
}

type InferSchemaType<TSchema, TFallback> =
  TSchema extends z.ZodTypeAny ? z.infer<TSchema> : TFallback;

interface ITrexClient {
  get<T = unknown, S = unknown>(
    url: string,
    config?: TrexRequestConfig<S>,
  ): Promise<InferSchemaType<S, T>>;

  post<T = unknown, S = unknown>(
    url: string,
    data?: unknown,
    config?: TrexRequestConfig<S>,
  ): Promise<InferSchemaType<S, T>>;

  put<T = unknown, S = unknown>(
    url: string,
    data?: unknown,
    config?: TrexRequestConfig<S>,
  ): Promise<InferSchemaType<S, T>>;

  patch<T = unknown, S = unknown>(
    url: string,
    data?: unknown,
    config?: TrexRequestConfig<S>,
  ): Promise<InferSchemaType<S, T>>;

  delete<T = unknown, S = unknown>(
    url: string,
    config?: TrexRequestConfig<S>,
  ): Promise<InferSchemaType<S, T>>;

  request<T = unknown, S = unknown>(
    method: HttpMethod,
    url: string,
    config?: TrexRequestConfig<S>,
  ): Promise<InferSchemaType<S, T>>;

  readonly interceptors: {
    request: IInterceptorManager<RequestInterceptor>;
    response: IInterceptorManager<ResponseInterceptor>;
  };
}

export type {
  HttpMethod,
  TrexErrorCode,
  QueryParamValue,
  QueryParams,
  ResponseType,
  TrexRetryConfig,
  ResolvedTrexRetryConfig,
  TrexRequestConfig,
  TrexClientConfig,
  TrexResponse,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  IInterceptorManager,
  InferSchemaType,
  ITrexClient,
};
