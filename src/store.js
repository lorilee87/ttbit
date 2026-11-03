// Guarda tudo no IndexedDB do aparelho. Nada sai daqui.

const DB_NAME = 'ttbit'
const DB_VERSION = 1
const STORES = ['ttb', 'devotionals', 'lists', 'prayers', 'settings']

let db = null
let defaultLang = 'pt'

export function setDefaultLang(lang) {
  defaultLang = lang
}

export function defaultSettings() {
  return { id: 'main', lang: defaultLang, verse: null, lastBackupAt: null, iosHintDismissed: false, reminderTime: '21:00' }
}

const now = () => new Date().toISOString()
const newId = () => crypto.randomUUID()

const req = (r) => new Promise((res, rej) => {
  r.onsuccess = () => res(r.result)
  r.onerror = () => rej(r.error)
})

export async function openStore() {
  if (db) return
  const r = indexedDB.open(DB_NAME, DB_VERSION)
  r.onupgradeneeded = () => {
    for (const name of STORES) {
      if (!r.result.objectStoreNames.contains(name)) r.result.createObjectStore(name, { keyPath: 'id' })
    }
  }
  db = await req(r)
}

export async function closeStore() {
  if (db) db.close()
  db = null
}

// Roda fn dentro de uma transação e só resolve quando ela termina de gravar.
function tx(stores, mode, fn) {
  return new Promise((res, rej) => {
    const t = db.transaction(stores, mode)
    let result
    t.oncomplete = () => res(result)
    t.onerror = () => rej(t.error)
    t.onabort = () => rej(t.error)
    Promise.resolve(fn(t)).then((v) => { result = v }, (e) => { t.abort(); rej(e) })
  })
}

const getAll = (t, name) => req(t.objectStore(name).getAll())
const get = (t, name, id) => req(t.objectStore(name).get(id))
const put = (t, name, value) => req(t.objectStore(name).put(value))
const del = (t, name, id) => req(t.objectStore(name).delete(id))

export async function getSnapshot() {
  return tx(STORES, 'readonly', async (t) => {
    const [ttb, devotionals, lists, prayers, settings] = await Promise.all([
      getAll(t, 'ttb'), getAll(t, 'devotionals'), getAll(t, 'lists'), getAll(t, 'prayers'), get(t, 'settings', 'main'),
    ])
    return { ttb, devotionals, lists, prayers, settings: { ...defaultSettings(), ...settings } }
  })
}

export async function saveSettings(partial) {
  return tx(['settings'], 'readwrite', async (t) => {
    const current = (await get(t, 'settings', 'main')) || defaultSettings()
    const next = { ...current, ...partial, id: 'main' }
    await put(t, 'settings', next)
    return next
  })
}

export async function addTTB(date, text) {
  return tx(['ttb'], 'readwrite', async (t) => {
    const sameDay = (await getAll(t, 'ttb')).filter((x) => x.date === date)
    const order = sameDay.reduce((m, x) => Math.max(m, x.order), 0) + 1
    const item = { id: newId(), date, text, order, starred: false, createdAt: now(), updatedAt: now() }
    await put(t, 'ttb', item)
    return item
  })
}

async function patch(name, id, changes) {
  return tx([name], 'readwrite', async (t) => {
    const current = await get(t, name, id)
    if (!current) return null
    const next = { ...current, ...changes, id, updatedAt: now() }
    await put(t, name, next)
    return next
  })
}

export const updateTTB = (id, changes) => patch('ttb', id, changes)
export const deleteTTB = (id) => tx(['ttb'], 'readwrite', (t) => del(t, 'ttb', id))

export async function saveDevotional(date, changes) {
  return tx(['devotionals'], 'readwrite', async (t) => {
    const current = (await get(t, 'devotionals', date)) || { id: date, date, text: '', starred: false }
    const next = { ...current, ...changes, id: date, date, updatedAt: now() }
    if (!next.text.trim() && !next.starred) {
      await del(t, 'devotionals', date)
      return null
    }
    await put(t, 'devotionals', next)
    return next
  })
}

export async function addList(group, name) {
  const list = { id: newId(), group, name, createdAt: now() }
  await tx(['lists'], 'readwrite', (t) => put(t, 'lists', list))
  return list
}

export async function renameList(id, name) {
  return tx(['lists'], 'readwrite', async (t) => {
    const current = await get(t, 'lists', id)
    if (current) await put(t, 'lists', { ...current, name })
  })
}

export async function deleteList(id) {
  return tx(['lists', 'prayers'], 'readwrite', async (t) => {
    const prayers = (await getAll(t, 'prayers')).filter((p) => p.listId === id)
    await Promise.all(prayers.map((p) => del(t, 'prayers', p.id)))
    await del(t, 'lists', id)
  })
}

export async function addPrayer(listId, text, date) {
  const prayer = { id: newId(), listId, text, date, starred: false, answeredDate: null, answerNote: '', updatedAt: now() }
  await tx(['prayers'], 'readwrite', (t) => put(t, 'prayers', prayer))
  return prayer
}

export const updatePrayer = (id, changes) => patch('prayers', id, changes)
export const deletePrayer = (id) => tx(['prayers'], 'readwrite', (t) => del(t, 'prayers', id))

export async function replaceAll(data) {
  return tx(STORES, 'readwrite', async (t) => {
    await Promise.all(STORES.map((name) => req(t.objectStore(name).clear())))
    const writes = []
    for (const name of ['ttb', 'devotionals', 'lists', 'prayers']) {
      for (const item of data[name]) writes.push(put(t, name, item))
    }
    writes.push(put(t, 'settings', { ...data.settings, id: 'main' }))
    await Promise.all(writes)
  })
}
