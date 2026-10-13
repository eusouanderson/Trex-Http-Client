type ResponseViewTab = 'body' | 'headers' | 'tests';

interface ResponseMeta {
  status: number;
  statusText: string;
  durationMs: number;
  sizeBytes: number;
}

export type { ResponseViewTab, ResponseMeta };
