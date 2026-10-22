import type { Ref } from 'vue';

interface PwaUpdateNotificationProps {
  testId?: string;
}

interface UsePwaUpdateNotificationReturn {
  shouldShow: Ref<boolean>;
  isUpdating: Ref<boolean>;
  applyUpdate: () => Promise<void>;
  dismissUpdate: () => void;
}

export type { PwaUpdateNotificationProps, UsePwaUpdateNotificationReturn };
