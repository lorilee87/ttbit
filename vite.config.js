import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  test: {
    environment: 'jsdom',
    setupFiles: ['fake-indexeddb/auto'],
  },
})
