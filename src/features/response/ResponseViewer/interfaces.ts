import type { ExecutionResult } from '../../request/interfaces';
import type { ResponseViewTab } from '../interfaces';

interface ResponseViewerProps {
  result?: ExecutionResult | null;
  loading?: boolean;
}

interface UseResponseViewerReturn {
  activeTab: ResponseViewTab;
  setTab: (tab: ResponseViewTab) => void;
  formatBytes: (bytes: number) => string;
  formatDuration: (ms: number) => string;
  getStatusColor: (status: number) => string;
  formatResponseData: (data: unknown) => string;
}

export type { ResponseViewerProps, UseResponseViewerReturn };
