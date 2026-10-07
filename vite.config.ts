import vue from '@vitejs/plugin-vue';
import { execSync } from 'node:child_process';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import packageJson from './package.json';

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  base: process.env.VITE_BASE_URL || '/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logos/Trex.png'],
      manifest: {
        name: 'Trex HTTP Client',
        short_name: 'Trex',
        description: 'Cliente HTTP com temática Jurassic, offline-first com suporte a variáveis de ambiente e coleções',
        theme_color: '#141311',
        background_color: '#141311',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'logos/Trex.png',
            sizes: '256x256',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,png}'],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
  },
});

