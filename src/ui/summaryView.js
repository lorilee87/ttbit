import { h } from './dom.js'
import { t } from '../i18n.js'
import { formatMonth, formatShortDate, monthOf, addMonthsClamped } from '../lib/dates.js'
import { monthSummary } from '../lib/summary.js'
import { shareSummary } from '../lib/shareText.js'
import { itemCard } from './home.js'

export function render(params, ctx) {
  const { snap, lang } = ctx
  const current = monthOf(ctx.today)
  const month = params.month && params.month <= current ? params.month : current
  const s = monthSummary(snap, month)
  const label = formatMonth(month, lang)
  const prev = monthOf(addMonthsClamped(`${month}-01`, -1))
  const next = monthOf(addMonthsClamped(`${month}-01`, 1))

  const stat = (n, key) => h('div', { class: 'stat' }, h('b', {}, String(n)), h('span', {}, t(key)))

  return h('div', {},
    h('h1', { class: 'screen-title' }, t('summary.title')),
    h('div', { class: 'daybar' },
      h('a', { class: 'icon-btn', href: `#/summary/${prev}`, 'aria-label': t('summary.prevMonth') }, '‹'),
      h('span', { class: 'day' }, label),
      month < current
        ? h('a', { class: 'icon-btn', href: `#/summary/${next}`, 'aria-label': t('summary.nextMonth') }, '›')
        : h('span', { class: 'icon-btn', 'aria-hidden': 'true' })),
    h('div', { class: 'stats' },
      stat(s.gratitude, 'summary.gratitude'),
      stat(s.answered.length, 'summary.answered'),
      stat(s.starred.length, 'summary.starred'),
      stat(s.devotionalDays, 'summary.devotionalDays')),
    s.answered.length ? [
      h('div', { class: 'sec' }, t('summary.answeredIn', { month: label })),
      s.answered.map((p) => h('div', { class: 'card' },
        h('div', { class: 'txt' }, p.text),
        h('div', { class: 'answered' }, formatShortDate(p.answeredDate, lang), p.answerNote ? ` · "${p.answerNote}"` : ''))),
    ] : null,
    s.starred.length ? [
      h('div', { class: 'sec' }, t('summary.starredIn', { month: label })),
      s.starred.map((x) => itemCard(x, snap, lang)),
    ] : null,
    h('div', { class: 'btns' }, h('button', { class: 'btn alt', onclick: () => ctx.actions.share(shareSummary(month, s, lang)) }, t('summary.share'))),
  )
}
