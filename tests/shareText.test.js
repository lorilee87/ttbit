import { test, expect } from 'vitest'
import { shareDay, shareList, shareAnswered, shareSummary } from '../src/lib/shareText.js'

const ttb = [{ text: 'Café da manhã com meu marido', order: 1 }, { text: 'Uma cliente que voltou', order: 2 }]

test('shareDay em português', () => {
  expect(shareDay('2026-11-03', ttb, null, 'pt')).toBe(
    '🙏 TTBIT · terça-feira, 3 de novembro\n\nAgradeço por:\n1. Café da manhã com meu marido\n2. Uma cliente que voltou'
  )
})

test('shareDay com devocional e sem TTB', () => {
  const s = shareDay('2026-11-03', [], { text: 'Senhor, obrigado' }, 'pt')
  expect(s).not.toContain('Agradeço por')
  expect(s).toContain('Devocional:\nSenhor, obrigado')
})

test('shareDay em inglês', () => {
  expect(shareDay('2026-11-03', ttb, null, 'en')).toContain("I'm grateful for:")
})

test('shareList marca respondidos', () => {
  const s = shareList({ name: 'Família' }, [
    { text: 'Saúde do pai', answeredDate: null },
    { text: 'Viagem', answeredDate: '2026-10-20', answerNote: 'Foi bem' },
  ], 'pt')
  expect(s).toContain('Família')
  expect(s).toContain('• Saúde do pai')
  expect(s).toContain('✓ Viagem')
})

test('shareAnswered traz data e nota', () => {
  const s = shareAnswered({ text: 'Viagem', answeredDate: '2026-10-20', answerNote: 'Foi bem' }, 'pt')
  expect(s).toContain('Viagem')
  expect(s).toContain('20')
  expect(s).toContain('Foi bem')
})

test('shareSummary contém os quatro números', () => {
  const s = shareSummary('2026-10', { gratitude: 47, answered: [{}, {}, {}], starred: [1, 2, 3, 4, 5, 6], devotionalDays: 18 }, 'pt')
  for (const n of ['47', '3', '6', '18']) expect(s).toContain(n)
  expect(s).toMatch(/outubro/)
})
