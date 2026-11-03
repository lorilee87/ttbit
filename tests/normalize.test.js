import { test, expect } from 'vitest'
import { normalize } from '../src/lib/normalize.js'

test('normalize tira acentos e maiúsculas', () => {
  expect(normalize('Oração PACIÊNCIA')).toBe('oracao paciencia')
  expect(normalize('Ação de graças, São João')).toBe('acao de gracas, sao joao')
})

test('normalize mantém o mesmo tamanho do texto em português', () => {
  const s = 'Paciência com a equipe, coração'
  expect(normalize(s).length).toBe(s.length)
})
