import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'

// Gera o sw.js no build com a lista de arquivos do app, para ele abrir sem internet.
function serviceWorker() {
  return {
    name: 'ttbit-service-worker',
    apply: 'build',
    generateBundle(_, bundle) {
      const files = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
        ...Object.keys(bundle)]
      const version = Date.now().toString(36)
      const source = readFileSync('src/sw-template.js', 'utf8')
        .replace('__FILES__', JSON.stringify(files))
        .replace('__VERSION__', version)
      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [serviceWorker()],
  test: {
    environment: 'jsdom',
    setupFiles: ['fake-indexeddb/auto'],
  },
})
