import { h } from './dom.js'
import { t } from '../i18n.js'
import { formatShortDate } from '../lib/dates.js'
import { answeredPrayers } from '../lib/highlights.js'

export function render(params, ctx) {
  const { snap, lang } = ctx
  const items = answeredPrayers(snap)
  const listOf = (p) => snap.lists.find((l) => l.id === p.listId)

  return h('div', {},
    h('h1', { class: 'screen-title' }, t('answered.title')),
    h('p', { class: 'subtitle' }, t('answered.subtitle')),
    items.length ? items.map((p) => {
      const list = listOf(p)
      return h('div', { class: 'card' },
        h('div', { class: 'txt' }, p.text),
        h('div', { class: 'answered' }, formatShortDate(p.answeredDate, lang), p.answerNote ? ` · "${p.answerNote}"` : ''),
        h('div', { class: 'list-head', style: 'margin:6px 0 0' },
          h('a', { class: 'meta', href: `#/prayer/${list.group}` }, `${t(`group.${list.group}`)} · ${list.name}`),
          h('button', { class: 'link-btn', style: 'min-height:36px;padding:0', onclick: () => ctx.actions.shareAnswered(p) }, '↗ ', t('common.share'))))
    }) : h('p', { class: 'empty' }, t('answered.empty')),
  )
}
