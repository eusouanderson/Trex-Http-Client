import { ref } from 'vue';
import type { HttpMethod } from '../../../core/http/interfaces';
import type { BodyType } from '../interfaces';
import { useRequest } from '../use-request';
import type { RequestTabCategory } from './interfaces';

const activeCategoryState = ref<RequestTabCategory>('params');

interface UseRequestBuilderReturn {
  logoSrc: string;
  activeCategory: typeof activeCategoryState;
  activeTab: ReturnType<typeof useRequest>['activeTab'];
  isLoading: ReturnType<typeof useRequest>['isLoading'];
  setCategory: (cat: RequestTabCategory) => void;
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setBody: (body: string) => void;
  setBodyType: (type: BodyType) => void;
  formatJsonBody: () => void;
  addParam: () => void;
  removeParam: (id: string) => void;
  addHeader: () => void;
  removeHeader: (id: string) => void;
  send: (timeoutMs?: number) => Promise<void>;
  createNewTab: () => void;
}

const useRequestBuilder = (onSent?: () => void): UseRequestBuilderReturn => {
  const logoSrc = `${import.meta.env.BASE_URL}logos/Trex.png`;

  const {
    activeTab,
    isLoading,
    createTab,
    updateActiveTab,
    addParam,
    removeParam,
    addHeader,
    removeHeader,
    sendRequest,
  } = useRequest();

  const setCategory = (cat: RequestTabCategory): void => {
    activeCategoryState.value = cat;
  };

  const setMethod = (method: HttpMethod): void => {
    updateActiveTab({ method });
  };

  const setUrl = (url: string): void => {
    updateActiveTab({ url });
  };

  const setBody = (body: string): void => {
    updateActiveTab({ body });
  };

  const setBodyType = (bodyType: BodyType): void => {
    updateActiveTab({ bodyType });
  };

  const formatJsonBody = (): void => {
    if (!activeTab.value) {
      return;
    }
    try {
      const parsed: unknown = JSON.parse(activeTab.value.body);
      const formatted = JSON.stringify(parsed, null, 2);
      updateActiveTab({ body: formatted });
    } catch {
      return;
    }
  };

  const send = async (timeoutMs?: number): Promise<void> => {
    await sendRequest(timeoutMs);
    if (onSent !== undefined) {
      onSent();
    }
  };

  const createNewTab = (): void => {
    createTab();
  };

  return {
    logoSrc,
    activeCategory: activeCategoryState,
    activeTab,
    isLoading,
    setCategory,
    setMethod,
    setUrl,
    setBody,
    setBodyType,
    formatJsonBody,
    addParam,
    removeParam,
    addHeader,
    removeHeader,
    send,
    createNewTab,
  };
};

export { useRequestBuilder };
