// Service worker do TTBIT: guarda os arquivos do app para abrir sem internet.
// Os dados da pessoa não passam por aqui; eles ficam no IndexedDB.
const CACHE = 'ttbit-__VERSION__'
const FILES = __FILES__

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ttbit-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

// Responde do cache primeiro; busca na rede em segundo plano para a próxima vez.
self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      // ignoreVary: o navegador pede scripts com o cabeçalho Origin, que não existia quando o arquivo foi guardado.
      const opts = { ignoreSearch: true, ignoreVary: true }
      const cached = await cache.match(req, opts) || (req.mode === 'navigate' ? await cache.match('index.html', opts) : undefined)
      const network = fetch(req).then((res) => {
        if (res.ok) cache.put(req, res.clone())
        return res
      })
      if (cached) {
        network.catch(() => {})
        return cached
      }
      return network.catch(() => Response.error())
    }),
  )
})
