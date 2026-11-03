import { test, expect, beforeEach } from 'vitest'
import * as store from '../src/store.js'

beforeEach(async () => {
  await store.closeStore()
  await new Promise((res) => {
    const r = indexedDB.deleteDatabase('ttbit')
    r.onsuccess = r.onerror = r.onblocked = () => res()
  })
  await store.openStore()
})

test('banco novo tem ajustes padrão', async () => {
  const snap = await store.getSnapshot()
  expect(snap.settings.verse).toBe(null)
  expect(snap.settings.reminderTime).toBe('21:00')
  expect(snap.settings.lastBackupAt).toBe(null)
  expect(['pt', 'en']).toContain(snap.settings.lang)
})

test('addTTB numera os agradecimentos do dia', async () => {
  const a = await store.addTTB('2026-11-03', 'café')
  const b = await store.addTTB('2026-11-03', 'chuva')
  const c = await store.addTTB('2026-11-04', 'outro dia')
  expect([a.order, b.order, c.order]).toEqual([1, 2, 1])
  expect((await store.getSnapshot()).ttb.length).toBe(3)
})

test('updateTTB e deleteTTB', async () => {
  const a = await store.addTTB('2026-11-03', 'café')
  await store.updateTTB(a.id, { text: 'café com pão', starred: true })
  let snap = await store.getSnapshot()
  expect(snap.ttb[0].text).toBe('café com pão')
  expect(snap.ttb[0].starred).toBe(true)
  await store.deleteTTB(a.id)
  snap = await store.getSnapshot()
  expect(snap.ttb.length).toBe(0)
})

test('saveDevotional guarda um só por dia', async () => {
  await store.saveDevotional('2026-11-03', { text: 'a' })
  await store.saveDevotional('2026-11-03', { text: 'b' })
  const snap = await store.getSnapshot()
  expect(snap.devotionals.length).toBe(1)
  expect(snap.devotionals[0].text).toBe('b')
})

test('saveDevotional vazio e sem estrela apaga o registro', async () => {
  await store.saveDevotional('2026-11-03', { text: 'a' })
  await store.saveDevotional('2026-11-03', { text: '  ' })
  expect((await store.getSnapshot()).devotionals.length).toBe(0)
})

test('deleteList apaga junto os pedidos da lista e mantém os outros', async () => {
  const fam = await store.addList('others', 'Família')
  const igreja = await store.addList('others', 'Igreja')
  await store.addPrayer(fam.id, 'pai', '2026-11-01')
  await store.addPrayer(fam.id, 'mãe', '2026-11-01')
  await store.addPrayer(igreja.id, 'Ana', '2026-11-01')
  await store.deleteList(fam.id)
  const snap = await store.getSnapshot()
  expect(snap.lists.map((l) => l.name)).toEqual(['Igreja'])
  expect(snap.prayers.map((p) => p.text)).toEqual(['Ana'])
})

test('renameList e updatePrayer respondido', async () => {
  const l = await store.addList('personal', 'X')
  await store.renameList(l.id, 'Trabalho')
  const p = await store.addPrayer(l.id, 'sabedoria', '2026-11-01')
  await store.updatePrayer(p.id, { answeredDate: '2026-11-03', answerNote: 'veio' })
  const snap = await store.getSnapshot()
  expect(snap.lists[0].name).toBe('Trabalho')
  expect(snap.prayers[0].answeredDate).toBe('2026-11-03')
  expect(snap.prayers[0].answerNote).toBe('veio')
  expect(snap.prayers[0].starred).toBe(false)
})

test('saveSettings mescla e persiste', async () => {
  await store.saveSettings({ verse: { text: 'v', ref: 'r' } })
  await store.saveSettings({ lang: 'en' })
  const s = (await store.getSnapshot()).settings
  expect(s.verse).toEqual({ text: 'v', ref: 'r' })
  expect(s.lang).toBe('en')
})

test('replaceAll troca tudo pelo conteúdo dado', async () => {
  await store.addTTB('2026-01-01', 'velho')
  const data = {
    ttb: [{ id: 't1', date: '2026-11-03', text: 'novo', order: 1, starred: false, createdAt: 'x', updatedAt: 'x' }],
    devotionals: [{ id: '2026-11-03', date: '2026-11-03', text: 'd', starred: true, updatedAt: 'x' }],
    lists: [{ id: 'l1', group: 'world', name: 'Paz', createdAt: 'x' }],
    prayers: [{ id: 'p1', listId: 'l1', text: 'paz', date: '2026-11-03', starred: false, answeredDate: null, answerNote: '', updatedAt: 'x' }],
    settings: { id: 'main', lang: 'pt', verse: null, lastBackupAt: null, iosHintDismissed: false, reminderTime: '07:00' },
  }
  await store.replaceAll(data)
  expect(await store.getSnapshot()).toEqual(data)
})

test('addPrayer grava a hora de criação, para manter a ordem', async () => {
  const l = await store.addList('personal', 'X')
  const p = await store.addPrayer(l.id, 'a', '2026-11-03')
  expect(typeof p.createdAt).toBe('string')
  expect(p.createdAt.length).toBeGreaterThan(10)
})
