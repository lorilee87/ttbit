import { test, expect } from 'vitest'
import { parseRoute } from '../src/router.js'

test('rotas conhecidas', () => {
  expect(parseRoute('')).toEqual({ name: 'home', params: {} })
  expect(parseRoute('#/')).toEqual({ name: 'home', params: {} })
  expect(parseRoute('#/diary/2026-11-03/ttb')).toEqual({ name: 'diary', params: { date: '2026-11-03', tab: 'ttb' } })
  expect(parseRoute('#/diary/2026-11-03/devotional')).toEqual({ name: 'diary', params: { date: '2026-11-03', tab: 'devotional' } })
  expect(parseRoute('#/diary')).toEqual({ name: 'diary', params: {} })
  expect(parseRoute('#/prayer/others')).toEqual({ name: 'prayer', params: { group: 'others' } })
  expect(parseRoute('#/prayer')).toEqual({ name: 'prayer', params: { group: 'personal' } })
  expect(parseRoute('#/answered')).toEqual({ name: 'answered', params: {} })
  expect(parseRoute('#/search')).toEqual({ name: 'search', params: {} })
  expect(parseRoute('#/summary/2026-10')).toEqual({ name: 'summary', params: { month: '2026-10' } })
  expect(parseRoute('#/summary')).toEqual({ name: 'summary', params: {} })
  expect(parseRoute('#/settings')).toEqual({ name: 'settings', params: {} })
  expect(parseRoute('#/starred')).toEqual({ name: 'starred', params: {} })
})

test('rotas inválidas vão para o início', () => {
  expect(parseRoute('#/xyz').name).toBe('home')
  expect(parseRoute('#/diary/abc/ttb').name).toBe('home')
  expect(parseRoute('#/diary/2026-11-03/outra').name).toBe('home')
  expect(parseRoute('#/prayer/marte').name).toBe('home')
  expect(parseRoute('#/summary/2026-13').name).toBe('home')
})
