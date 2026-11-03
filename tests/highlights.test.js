import { test, expect } from 'vitest'
import { onThisDay, starredItems, answeredPrayers } from '../src/lib/highlights.js'

const base = { ttb: [], devotionals: [], lists: [{ id: 'l1', group: 'others', name: 'Família' }], prayers: [], settings: {} }
const ttb = (id, date, extra = {}) => ({ id, date, text: id, order: 1, starred: false, ...extra })

test('neste dia mostra só os períodos que têm algo', () => {
  const snap = { ...base, ttb: [ttb('a', '2026-10-03'), ttb('b', '2025-11-03'), ttb('c', '2026-10-04')] }
  const r = onThisDay(snap, '2026-11-03')
  expect(r.map((x) => x.period)).toEqual(['1m', '6m', '1y'].filter((p) => p !== '6m'))
  expect(r[0].date).toBe('2026-10-03')
  expect(r[0].ttb.map((x) => x.id)).toEqual(['a'])
})

test('neste dia em 31 de março olha 28 de fevereiro', () => {
  const snap = { ...base, ttb: [ttb('a', '2026-02-28')] }
  expect(onThisDay(snap, '2026-03-31').map((x) => x.period)).toEqual(['1m'])
})

test('neste dia inclui o devocional', () => {
  const snap = { ...base, devotionals: [{ id: '2026-05-03', date: '2026-05-03', text: 'd', starred: false }] }
  const r = onThisDay(snap, '2026-11-03')
  expect(r).toEqual([{ period: '6m', date: '2026-05-03', ttb: [], devotional: snap.devotionals[0] }])
})

test('destaques juntam TTB, devocional e pedido, do mais recente ao mais antigo', () => {
  const snap = {
    ...base,
    ttb: [ttb('a', '2026-10-01', { starred: true }), ttb('b', '2026-10-02')],
    devotionals: [{ id: '2026-10-05', date: '2026-10-05', text: 'dev', starred: true }],
    prayers: [{ id: 'p', listId: 'l1', date: '2026-10-03', text: 'ped', starred: true, answeredDate: null }],
  }
  expect(starredItems(snap).map((x) => [x.type, x.id])).toEqual([
    ['devotional', '2026-10-05'], ['prayer', 'p'], ['ttb', 'a'],
  ])
  expect(starredItems(snap, 2).length).toBe(2)
})

test('orações respondidas por data de resposta, mais recente primeiro', () => {
  const snap = {
    ...base,
    prayers: [
      { id: 'x', listId: 'l1', date: '2026-01-01', answeredDate: '2026-10-02' },
      { id: 'y', listId: 'l1', date: '2026-01-01', answeredDate: null },
      { id: 'z', listId: 'l1', date: '2026-01-01', answeredDate: '2026-10-20' },
    ],
  }
  expect(answeredPrayers(snap).map((p) => p.id)).toEqual(['z', 'x'])
})
