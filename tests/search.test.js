import { test, expect } from 'vitest'
import { search } from '../src/lib/search.js'

const snap = {
  ttb: [
    { id: 't1', date: '2026-09-02', text: 'Agradeço a paciência da minha filha' },
    { id: 't2', date: '2026-11-01', text: 'Café da manhã' },
  ],
  devotionals: [{ id: '2026-10-14', date: '2026-10-14', text: 'Senhor, me dá paciência para ouvir' }],
  lists: [{ id: 'l1', group: 'personal', name: 'Trabalho' }],
  prayers: [
    { id: 'p1', listId: 'l1', date: '2026-08-01', text: 'Paciência com a equipe', answerNote: '' },
    { id: 'p2', listId: 'l1', date: '2026-07-01', text: 'Viagem', answerNote: 'Deus deu paciencia na estrada' },
  ],
  settings: {},
}

test('acha sem acento, em todos os lugares, do mais recente ao mais antigo', () => {
  const r = search(snap, 'paciencia', 'all')
  expect(r.map((x) => x.id)).toEqual(['2026-10-14', 't1', 'p1', 'p2'])
})

test('filtro limita o tipo', () => {
  expect(search(snap, 'paciencia', 'ttb').map((x) => x.id)).toEqual(['t1'])
  expect(search(snap, 'paciencia', 'devotional').map((x) => x.type)).toEqual(['devotional'])
  expect(search(snap, 'paciencia', 'prayer').map((x) => x.id)).toEqual(['p1', 'p2'])
})

test('busca vazia ou só espaços não devolve nada', () => {
  expect(search(snap, '', 'all')).toEqual([])
  expect(search(snap, '   ', 'all')).toEqual([])
})

test('posição da palavra no texto original', () => {
  const r = search(snap, 'pacien', 'prayer').find((x) => x.id === 'p1')
  expect(r.matchStart).toBe(0)
  expect(r.matchEnd).toBe(6)
  expect(r.text).toBe('Paciência com a equipe')
})

test('nos pedidos, a nota de resposta também é procurada e vira o texto do resultado', () => {
  const r = search(snap, 'estrada', 'all')
  expect(r.length).toBe(1)
  expect(r[0].text).toBe('Deus deu paciencia na estrada')
})

test('pedidos de lista que não existe mais são ignorados', () => {
  const s = { ...snap, prayers: [...snap.prayers, { id: 'p9', listId: 'sumiu', date: '2026-01-01', text: 'paciencia', answerNote: '' }] }
  expect(search(s, 'paciencia', 'prayer').map((x) => x.id)).toEqual(['p1', 'p2'])
})
