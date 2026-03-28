import { defineConfig } from 'wxt';
import { resolve } from 'path';

export default defineConfig({
  manifest: {
    name: 'PomoZen - 竹林番茄钟',
    version: '1.0.7',
    description: '融合中国传统美学与现代技术的番茄工作法计时器',
    permissions: ['storage', 'alarms', 'notifications'],
    action: {
      default_popup: 'popup/index.html',
    },
    options_page: 'options/index.html',
    icons: {
      '16': 'icons/icon16.png',
      '32': 'icons/icon32.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});
