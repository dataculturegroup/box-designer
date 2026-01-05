import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkgInfo = JSON.parse(json);
const URL_PREFIX = "/box-designer/";

export default defineConfig({
  base: URL_PREFIX,
  plugins: [svelte()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
  },
  build: {
    outDir: 'docs',
  },
  define: {
    APP_NAME: `"Box Designer"`,
    APP_VERSION: `"${pkgInfo.version}"`,
    HOMEPAGE: `"https://dataculture.northeastern.edu/${URL_PREFIX}/"`
  }
})
