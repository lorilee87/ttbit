import { test, expect } from 'vitest'
import { reminderICS, reminderGoogleUrl } from '../src/lib/reminder.js'

const url = 'https://exemplo/ttbit/'
const now = new Date(2026, 10, 3, 10, 0)

test('arquivo de calendário com repetição diária e hora local', () => {
  const ics = reminderICS('21:00', 'pt', url, now)
  expect(ics).toContain('DTSTART:20261104T210000\r\n')
  expect(ics).toContain('DTEND:20261104T210500\r\n')
  expect(ics).toContain('RRULE:FREQ=DAILY\r\n')
  expect(ics).toContain('TRIGGER:PT0M\r\n')
  expect(ics).toContain('SUMMARY:🙏 TTBIT: escreva um agradecimento\r\n')
  expect(ics).toContain(url)
  expect(ics).not.toMatch(/DTSTART:\S*Z/)
  expect(ics).not.toMatch(/DTEND:\S*Z/)
  expect(ics).toMatch(/DTSTAMP:\d{8}T\d{6}Z\r\n/)
  expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
})

test('lembrete perto da meia-noite termina no dia seguinte', () => {
  const ics = reminderICS('23:58', 'en', url, now)
  expect(ics).toContain('DTSTART:20261104T235800')
  expect(ics).toContain('DTEND:20261105T000300')
  expect(ics).toContain("SUMMARY:🙏 TTBIT: write one thing you're grateful for")
})

test('link do Google Agenda', () => {
  const u = new URL(reminderGoogleUrl('21:00', 'pt', url, now, 'America/Sao_Paulo'))
  expect(u.origin + u.pathname).toBe('https://calendar.google.com/calendar/render')
  expect(u.searchParams.get('action')).toBe('TEMPLATE')
  expect(u.searchParams.get('dates')).toBe('20261104T210000/20261104T210500')
  expect(u.searchParams.get('recur')).toBe('RRULE:FREQ=DAILY')
  expect(u.searchParams.get('ctz')).toBe('America/Sao_Paulo')
  expect(u.searchParams.get('details')).toContain(url)
})
