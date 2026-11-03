import { test, expect } from 'vitest'
import { buildBackup, backupFileName, parseBackup, countSnapshot, needsBackupReminder } from '../src/lib/backup.js'

const snap = {
  ttb: [{ id: 't1', date: '2026-11-03', text: 'café', order: 1, starred: false }],
  devotionals: [{ id: '2026-11-03', date: '2026-11-03', text: 'd', starred: false }],
  lists: [{ id: 'l1', group: 'world', name: 'Paz' }],
  prayers: [{ id: 'p1', listId: 'l1', date: '2026-11-03', text: 'paz', answeredDate: null }],
  settings: { id: 'main', lang: 'pt', verse: null, lastBackupAt: null, iosHintDismissed: false, reminderTime: '21:00' },
}
const now = new Date(2026, 10, 3, 20, 0)

test('cópia vai e volta igual', () => {
  const b = buildBackup(snap, now)
  expect(b.app).toBe('TTBIT')
  expect(b.version).toBe(1)
  const r = parseBackup(JSON.stringify(b))
  expect(r.ok).toBe(true)
  expect(r.backup.data).toEqual(snap)
  expect(r.counts).toEqual({ entries: 2, prayers: 1 })
})

test('nome do arquivo leva a data local', () => {
  expect(backupFileName(new Date(2026, 10, 3, 23, 50))).toBe('TTBIT-copia-2026-11-03.json')
})

test('arquivos errados são recusados', () => {
  expect(parseBackup('não é json')).toEqual({ ok: false, error: 'invalid' })
  expect(parseBackup('{"app":"Outro"}')).toEqual({ ok: false, error: 'notTtbit' })
  expect(parseBackup('null')).toEqual({ ok: false, error: 'invalid' })
  const future = { ...buildBackup(snap, now), version: 2 }
  expect(parseBackup(JSON.stringify(future))).toEqual({ ok: false, error: 'newerVersion' })
  const broken = buildBackup(snap, now)
  delete broken.data.ttb
  expect(parseBackup(JSON.stringify(broken))).toEqual({ ok: false, error: 'invalid' })
  const badItem = buildBackup(snap, now)
  badItem.data.prayers = [{ text: 'sem id' }]
  expect(parseBackup(JSON.stringify(badItem))).toEqual({ ok: false, error: 'invalid' })
})

test('countSnapshot', () => {
  expect(countSnapshot(snap)).toEqual({ entries: 2, prayers: 1 })
})

test('aviso de cópia', () => {
  const days = (n) => new Date(now.getTime() - n * 86400000).toISOString()
  expect(needsBackupReminder({ ...snap, settings: { ...snap.settings, lastBackupAt: days(31) } }, now)).toBe(true)
  expect(needsBackupReminder({ ...snap, settings: { ...snap.settings, lastBackupAt: days(10) } }, now)).toBe(false)
  expect(needsBackupReminder(snap, now)).toBe(false)
  const old = { ...snap, ttb: [{ ...snap.ttb[0], date: '2026-10-20' }] }
  expect(needsBackupReminder(old, now)).toBe(true)
  const empty = { ...snap, ttb: [], devotionals: [], prayers: [] }
  expect(needsBackupReminder(empty, now)).toBe(false)
})

test('item sem texto ou sem data é recusado', () => {
  const b = buildBackup(snap, now)
  b.data.devotionals = [{ id: '2026-11-03', date: '2026-11-03' }]
  expect(parseBackup(JSON.stringify(b)).ok).toBe(false)
  const c = buildBackup(snap, now)
  c.data.lists = [{ id: 'l1', group: 'world' }]
  expect(parseBackup(JSON.stringify(c)).ok).toBe(false)
})

import { newerISO } from '../src/lib/backup.js'

test('cópia com createdAt inválido ou faltando é recusada', () => {
  const a = buildBackup(snap, now); a.createdAt = 'ontem'
  expect(parseBackup(JSON.stringify(a))).toEqual({ ok: false, error: 'invalid' })
  const b = buildBackup(snap, now); delete b.createdAt
  expect(parseBackup(JSON.stringify(b))).toEqual({ ok: false, error: 'invalid' })
})

test('cópia com data de anotação inválida é recusada', () => {
  const a = buildBackup(snap, now); a.data.ttb = [{ ...snap.ttb[0], date: 'x' }]
  expect(parseBackup(JSON.stringify(a)).ok).toBe(false)
  const b = buildBackup(snap, now); b.data.prayers = [{ ...snap.prayers[0], answeredDate: '20/10/2026' }]
  expect(parseBackup(JSON.stringify(b)).ok).toBe(false)
  const c = buildBackup(snap, now); c.data.lists = [{ ...snap.lists[0], group: 'marte' }]
  expect(parseBackup(JSON.stringify(c)).ok).toBe(false)
  const d = buildBackup(snap, now); d.data.devotionals = [{ ...snap.devotionals[0], id: 'outro' }]
  expect(parseBackup(JSON.stringify(d)).ok).toBe(false)
})

test('pedido respondido com data válida continua aceito', () => {
  const a = buildBackup(snap, now); a.data.prayers = [{ ...snap.prayers[0], answeredDate: '2026-10-20', answerNote: 'ok' }]
  expect(parseBackup(JSON.stringify(a)).ok).toBe(true)
})

test('newerISO escolhe a data mais recente', () => {
  expect(newerISO('2026-01-01T00:00:00.000Z', '2026-11-01T00:00:00.000Z')).toBe('2026-11-01T00:00:00.000Z')
  expect(newerISO('2026-11-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z')).toBe('2026-11-01T00:00:00.000Z')
  expect(newerISO(null, '2026-01-01T00:00:00.000Z')).toBe('2026-01-01T00:00:00.000Z')
})
