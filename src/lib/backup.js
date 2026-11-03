import { localISODate, addDays } from './dates.js'

export const BACKUP_VERSION = 1
const ARRAYS = ['ttb', 'devotionals', 'lists', 'prayers']
const REQUIRED = {
  ttb: ['id', 'date', 'text'],
  devotionals: ['id', 'date', 'text'],
  lists: ['id', 'group', 'name'],
  prayers: ['id', 'listId', 'date', 'text'],
}

export function buildBackup(snap, now) {
  return { app: 'TTBIT', version: BACKUP_VERSION, createdAt: now.toISOString(), data: structuredClone(snap) }
}

export function backupFileName(now) {
  return `TTBIT-copia-${localISODate(now)}.json`
}

export function countSnapshot(snap) {
  return { entries: snap.ttb.length + snap.devotionals.length, prayers: snap.prayers.length }
}

const isObj = (x) => x !== null && typeof x === 'object' && !Array.isArray(x)

// Confere o arquivo antes de qualquer mudança. Em caso de dúvida, recusa.
export function parseBackup(text) {
  let b
  try { b = JSON.parse(text) } catch { return { ok: false, error: 'invalid' } }
  if (!isObj(b)) return { ok: false, error: 'invalid' }
  if (b.app !== 'TTBIT') return { ok: false, error: 'notTtbit' }
  if (typeof b.version !== 'number') return { ok: false, error: 'invalid' }
  if (b.version > BACKUP_VERSION) return { ok: false, error: 'newerVersion' }
  const d = b.data
  if (!isObj(d) || !isObj(d.settings)) return { ok: false, error: 'invalid' }
  for (const name of ARRAYS) {
    if (!Array.isArray(d[name])) return { ok: false, error: 'invalid' }
    if (!d[name].every((x) => isObj(x) && REQUIRED[name].every((k) => typeof x[k] === 'string'))) return { ok: false, error: 'invalid' }
  }
  return { ok: true, backup: b, counts: countSnapshot(d) }
}

export function needsBackupReminder(snap, now) {
  const last = snap.settings.lastBackupAt
  if (last) return now.getTime() - new Date(last).getTime() > 30 * 86400000
  const limit = addDays(localISODate(now), -7)
  return [...snap.ttb, ...snap.devotionals, ...snap.prayers].some((x) => x.date && x.date < limit)
}
