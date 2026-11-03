import { test, expect } from 'vitest'
import { detectLang, setLang, t, strings } from '../src/i18n.js'

test('detectLang', () => {
  expect(detectLang('pt-BR')).toBe('pt')
  expect(detectLang('pt')).toBe('pt')
  expect(detectLang('en-US')).toBe('en')
  expect(detectLang('es')).toBe('en')
  expect(detectLang(undefined)).toBe('en')
})

test('t troca de idioma e preenche variáveis', () => {
  setLang('pt')
  expect(t('nav.home')).toBe('Início')
  setLang('en')
  expect(t('nav.home')).toBe('Home')
  expect(t('não.existe')).toBe('não.existe')
  setLang('pt')
  expect(t('prayer.deleteListConfirm', { n: 3 })).toContain('3')
})

test('todas as chaves em português existem em inglês', () => {
  const missing = Object.keys(strings.pt).filter((k) => !(k in strings.en))
  expect(missing).toEqual([])
})
