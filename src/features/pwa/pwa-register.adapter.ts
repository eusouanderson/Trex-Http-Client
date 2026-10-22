import type { RegisterSwOptions, SwRegisterFn, SwUpdateFn } from './interfaces';

const createDefaultSwRegister = (): SwRegisterFn => {
  return (options?: RegisterSwOptions): SwUpdateFn => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return async (): Promise<void> => Promise.resolve();
    }

    let registration: ServiceWorkerRegistration | undefined;

    const onLoad = async (): Promise<void> => {
      try {
        const base = import.meta.env.BASE_URL;
        const swUrl = `${base.replace(/\/$/, '')}/sw.js`;
        registration = await navigator.serviceWorker.register(swUrl, {
          scope: base,
        });

        options?.onRegistered?.(registration);

        if (registration.waiting) {
          options?.onNeedRefresh?.();
          return;
        }

        registration.addEventListener('updatefound', () => {
          const installing = registration?.installing;
          if (!installing) {
            return;
          }

          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                options?.onNeedRefresh?.();
              } else {
                options?.onOfflineReady?.();
              }
            }
          });
        });
      } catch (error) {
        options?.onRegisterError?.(error);
      }
    };

    if (document.readyState === 'complete') {
      void onLoad();
    } else {
      window.addEventListener('load', () => {
        void onLoad();
      });
    }

    return (reloadPage = true): Promise<void> => {
      if (registration?.waiting) {
        let isReloading = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!isReloading && reloadPage) {
            isReloading = true;
            window.location.reload();
          }
        });
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      } else if (reloadPage) {
        window.location.reload();
      }
      return Promise.resolve();
    };
  };
};

export { createDefaultSwRegister };
