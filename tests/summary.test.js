import { test, expect } from 'vitest'
import { monthSummary } from '../src/lib/summary.js'

test('resumo de outubro conta só o que é de outubro', () => {
  const snap = {
    ttb: [
      { id: 'a', date: '2026-10-01', starred: true, text: 'a' },
      { id: 'b', date: '2026-10-15', starred: false, text: 'b' },
      { id: 'c', date: '2026-10-31', starred: false, text: 'c' },
      { id: 'd', date: '2026-11-01', starred: true, text: 'd' },
    ],
    devotionals: [
      { id: '2026-10-02', date: '2026-10-02', text: 'x', starred: false },
      { id: '2026-10-09', date: '2026-10-09', text: 'y', starred: true },
      { id: '2026-09-30', date: '2026-09-30', text: 'z', starred: false },
    ],
    lists: [{ id: 'l1', group: 'others', name: 'Família' }],
    prayers: [
      { id: 'p1', listId: 'l1', date: '2026-09-10', text: 'viagem', starred: false, answeredDate: '2026-10-20' },
      { id: 'p2', listId: 'l1', date: '2026-10-10', text: 'saúde', starred: false, answeredDate: null },
    ],
    settings: {},
  }
  const s = monthSummary(snap, '2026-10')
  expect(s.gratitude).toBe(3)
  expect(s.answered.map((p) => p.id)).toEqual(['p1'])
  expect(s.starred.map((x) => x.id)).toEqual(['2026-10-09', 'a'])
  expect(s.devotionalDays).toBe(2)
})
