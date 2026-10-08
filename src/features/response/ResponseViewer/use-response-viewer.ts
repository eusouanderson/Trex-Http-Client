import { ref } from 'vue';
import type { ResponseViewTab } from '../interfaces';

const activeTabState = ref<ResponseViewTab>('body');

interface UseResponseViewerReturn {
  logoSrc: string;
  activeTab: typeof activeTabState;
  setTab: (tab: ResponseViewTab) => void;
  formatBytes: (bytes: number) => string;
  formatDuration: (ms: number) => string;
  getStatusColor: (status: number) => string;
  formatResponseData: (data: unknown) => string;
}

const useResponseViewer = (): UseResponseViewerReturn => {
  const logoSrc = `${import.meta.env.BASE_URL}logos/Trex.png`;
  const setTab = (tab: ResponseViewTab): void => {
    activeTabState.value = tab;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes.toString()} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) {
      return `${ms.toString()} ms`;
    }
    return `${(ms / 1000).toFixed(2)} s`;
  };

  const getStatusColor = (status: number): string => {
    if (status >= 200 && status < 300) {
      return 'text-dino-400 bg-dino-500/10 border-dino-500/30';
    }
    if (status >= 300 && status < 400) {
      return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    }
    if (status >= 400) {
      return 'text-magma-400 bg-magma-500/10 border-magma-500/30';
    }
    return 'text-fossil-400 bg-surface-border border-surface-border';
  };

  const formatResponseData = (data: unknown): string => {
    if (data === null || data === undefined) {
      return '';
    }
    if (typeof data === 'string') {
      try {
        const parsed: unknown = JSON.parse(data);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return data;
      }
    }
    return JSON.stringify(data, null, 2);
  };

  return {
    logoSrc,
    activeTab: activeTabState,
    setTab,
    formatBytes,
    formatDuration,
    getStatusColor,
    formatResponseData,
  };
};

export { useResponseViewer };
