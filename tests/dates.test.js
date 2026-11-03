import { test, expect } from 'vitest'
import { localISODate, addMonthsClamped, monthOf, formatLongDate } from '../src/lib/dates.js'

test('localISODate usa o dia local, mesmo às 23h30', () => {
  expect(localISODate(new Date(2026, 10, 3, 23, 30))).toBe('2026-11-03')
  expect(localISODate(new Date(2026, 0, 5, 0, 5))).toBe('2026-01-05')
})

test('addMonthsClamped corta no último dia do mês de destino', () => {
  expect(addMonthsClamped('2026-03-31', -1)).toBe('2026-02-28')
  expect(addMonthsClamped('2028-03-31', -1)).toBe('2028-02-29')
  expect(addMonthsClamped('2027-02-28', -12)).toBe('2026-02-28')
  expect(addMonthsClamped('2028-02-29', -12)).toBe('2027-02-28')
  expect(addMonthsClamped('2026-01-15', -6)).toBe('2025-07-15')
  expect(addMonthsClamped('2026-12-31', 2)).toBe('2027-02-28')
})

test('monthOf devolve YYYY-MM', () => {
  expect(monthOf('2026-11-03')).toBe('2026-11')
})

test('formatLongDate escreve dia da semana, dia e mês no idioma', () => {
  const pt = formatLongDate('2026-11-03', 'pt')
  expect(pt).toMatch(/terça/)
  expect(pt).toMatch(/3 de novembro/)
  const en = formatLongDate('2026-11-03', 'en')
  expect(en).toMatch(/Tuesday/)
  expect(en).toMatch(/November 3/)
})

import { addDays, formatMonth, parseISODate } from '../src/lib/dates.js'

test('addDays atravessa mês e ano', () => {
  expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
})

test('formatMonth escreve mês e ano', () => {
  expect(formatMonth('2026-10', 'pt')).toMatch(/outubro.*2026/)
  expect(formatMonth('2026-10', 'en')).toMatch(/October 2026/)
})

test('parseISODate fica no mesmo dia local', () => {
  expect(parseISODate('2026-11-03').getDate()).toBe(3)
})
