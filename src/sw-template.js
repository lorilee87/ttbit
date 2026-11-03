// Service worker do TTBIT: guarda os arquivos do app para abrir sem internet.
// Os dados da pessoa não passam por aqui; eles ficam no IndexedDB.
const CACHE = 'ttbit-__VERSION__'
const FILES = __FILES__

self.addEventListener('install', (event) => {
  // cache: 'reload' pula o cache do navegador, para nunca guardar um index.html de uma versão antiga.
  event.waitUntil(caches.open(CACHE)
    .then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' }))))
    .then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ttbit-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

// Responde com os arquivos desta versão. Uma versão nova chega só por um sw.js novo,
// que guarda todos os arquivos dela de uma vez (nunca mistura versões).
self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      // ignoreVary: o navegador pede scripts com o cabeçalho Origin, que não existia quando o arquivo foi guardado.
      const opts = { ignoreSearch: true, ignoreVary: true }
      const cached = await cache.match(req, opts) || (req.mode === 'navigate' ? await cache.match('index.html', opts) : undefined)
      return cached || fetch(req).catch(() => Response.error())
    }),
  )
})
