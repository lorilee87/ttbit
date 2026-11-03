import { h } from './dom.js'
import { t } from '../i18n.js'
import { starredItems } from '../lib/highlights.js'
import { itemCard } from './home.js'

export function render(params, ctx) {
  const items = starredItems(ctx.snap)
  return h('div', {},
    h('h1', { class: 'screen-title' }, '★ ', t('starred.title')),
    items.length ? items.map((x) => itemCard(x, ctx.snap, ctx.lang)) : h('p', { class: 'empty' }, t('starred.empty')))
}
