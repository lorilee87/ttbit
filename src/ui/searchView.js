import { h, highlighted } from './dom.js'
import { t } from '../i18n.js'
import { formatShortDate } from '../lib/dates.js'
import { search } from '../lib/search.js'
import { itemHref } from './shell.js'

// A busca guarda o que foi digitado enquanto o app estiver aberto.
const state = { query: '', filter: 'all' }
const FILTERS = [['all', 'search.all'], ['ttb', 'type.ttb'], ['devotional', 'type.devotional'], ['prayer', 'type.prayer']]

export function render(params, ctx) {
  const { snap, lang } = ctx
  const results = h('div', {})
  const chips = h('div', { class: 'chips' })
  let timer = null

  function draw() {
    chips.replaceChildren(...FILTERS.map(([f, label]) =>
      h('button', { class: `chip${state.filter === f ? ' on' : ''}`, 'aria-pressed': state.filter === f ? 'true' : 'false', onclick: () => { state.filter = f; draw() } }, t(label))))
    if (!state.query.trim()) return results.replaceChildren()
    const found = search(snap, state.query, state.filter)
    results.replaceChildren(
      h('p', { class: 'meta' }, found.length ? t('search.results', { n: found.length }) : t('search.none')),
      ...found.map((r) => h('a', { class: 'item', href: itemHref(r, snap) },
        h('div', { class: 'txt' }, highlighted(r.text, r.matchStart, r.matchEnd)),
        h('div', { class: 'meta' }, `${t(`type.${r.type}`)} · ${formatShortDate(r.date, lang)}`))),
    )
  }

  const input = h('input', {
    class: 'search-box', type: 'search', placeholder: t('search.placeholder'), value: state.query, enterkeyhint: 'search', autocomplete: 'off',
    oninput: (e) => { state.query = e.target.value; clearTimeout(timer); timer = setTimeout(draw, 200) },
  })
  draw()
  setTimeout(() => { if (!state.query) input.focus() }, 0)

  return h('div', {}, h('h1', { class: 'screen-title' }, t('nav.search')), input, chips, results)
}
