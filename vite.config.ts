import { fileURLToPath, URL } from "url";
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
// @ts-ignore
import manifestConfig from './src/manifest';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
      vue(),
      VitePWA({
        registerType: 'prompt',
        workbox: {
          maximumFileSizeToCacheInBytes: 20000000,
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: manifestConfig,
      }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
