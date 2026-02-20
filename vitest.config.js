import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    server: {
      deps: {
        inline: [],
      },
    },
  },
  resolve: {
    alias: {
      '@actions/github': new URL('./tests/__mocks__/@actions/github.js', import.meta.url).pathname,
      '@actions/core': new URL('./tests/__mocks__/@actions/core.js', import.meta.url).pathname,
    },
  },
});
