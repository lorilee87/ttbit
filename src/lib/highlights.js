import { addMonthsClamped } from './dates.js'

const PERIODS = [['1m', -1], ['6m', -6], ['1y', -12]]
const byDateDesc = (key) => (a, b) => (a[key] < b[key] ? 1 : a[key] > b[key] ? -1 : 0)

export function livePrayers(snap) {
  const ids = new Set(snap.lists.map((l) => l.id))
  return snap.prayers.filter((p) => ids.has(p.listId))
}

export function onThisDay(snap, todayISO) {
  const out = []
  for (const [period, n] of PERIODS) {
    const date = addMonthsClamped(todayISO, n)
    const ttb = snap.ttb.filter((x) => x.date === date).sort((a, b) => a.order - b.order)
    const devotional = snap.devotionals.find((x) => x.date === date && x.text.trim()) || null
    if (ttb.length || devotional) out.push({ period, date, ttb, devotional })
  }
  return out
}

export function starredItems(snap, limit) {
  const items = [
    ...snap.ttb.filter((x) => x.starred).map((x) => ({ type: 'ttb', id: x.id, date: x.date, text: x.text })),
    ...snap.devotionals.filter((x) => x.starred).map((x) => ({ type: 'devotional', id: x.id, date: x.date, text: x.text })),
    ...livePrayers(snap).filter((x) => x.starred).map((x) => ({ type: 'prayer', id: x.id, date: x.date, text: x.text, listId: x.listId })),
  ].sort(byDateDesc('date'))
  return limit ? items.slice(0, limit) : items
}

export function answeredPrayers(snap) {
  return livePrayers(snap).filter((p) => p.answeredDate).sort(byDateDesc('answeredDate'))
}
