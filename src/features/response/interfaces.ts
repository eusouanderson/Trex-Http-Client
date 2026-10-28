type ResponseViewTab = 'body' | 'headers' | 'tests' | 'diff';

interface ResponseMeta {
  status: number;
  statusText: string;
  durationMs: number;
  sizeBytes: number;
}

export type { ResponseViewTab, ResponseMeta };
