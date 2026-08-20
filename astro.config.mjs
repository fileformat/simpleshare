import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  build: {
    format: 'directory',
  },
  server: {
    port: 4000,
  },
});
