/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export default component;
}

declare module 'splitpanes' {
  import type { DefineComponent } from 'vue';
  const Splitpanes: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  const Pane: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export { Splitpanes, Pane };
}
declare const __APP_VERSION__: string;
declare const __COMMIT_HASH__: string;
