import { normalize } from './normalize.js'

function find(text, q) {
  const i = normalize(text || '').indexOf(q)
  return i < 0 ? null : { matchStart: i, matchEnd: i + q.length }
}

// Busca no aparelho, nos textos da própria pessoa. Resultados do mais recente ao mais antigo.
export function search(snap, query, filter = 'all') {
  const q = normalize(query.trim())
  if (!q) return []
  const results = []
  const want = (type) => filter === 'all' || filter === type

  if (want('ttb')) {
    for (const x of snap.ttb) {
      const m = find(x.text, q)
      if (m) results.push({ type: 'ttb', id: x.id, date: x.date, text: x.text, ...m })
    }
  }
  if (want('devotional')) {
    for (const x of snap.devotionals) {
      const m = find(x.text, q)
      if (m) results.push({ type: 'devotional', id: x.id, date: x.date, text: x.text, ...m })
    }
  }
  if (want('prayer')) {
    const listIds = new Set(snap.lists.map((l) => l.id))
    for (const x of snap.prayers) {
      if (!listIds.has(x.listId)) continue
      for (const field of ['text', 'answerNote']) {
        const m = find(x[field], q)
        if (m) {
          results.push({ type: 'prayer', id: x.id, date: x.date, text: x[field], listId: x.listId, ...m })
          break
        }
      }
    }
  }
  return results.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}
