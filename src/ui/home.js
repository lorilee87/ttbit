import { h } from './dom.js'
import { t } from '../i18n.js'
import { formatLongDate, formatShortDate, formatMonth, monthOf } from '../lib/dates.js'
import { starredItems, onThisDay } from '../lib/highlights.js'
import { needsBackupReminder } from '../lib/backup.js'
import { itemHref } from './shell.js'

const typeLabel = (type) => t(`type.${type}`)

export function itemCard(item, snap, lang) {
  return h('a', { class: 'item', href: itemHref(item, snap) },
    h('div', { class: 'txt' }, item.text),
    h('div', { class: 'meta' }, `${typeLabel(item.type)} · ${formatShortDate(item.date, lang)}`))
}

export function render(params, ctx) {
  const { snap, today, lang } = ctx
  const verse = snap.settings.verse || { text: t('verse.default.text'), ref: t('verse.default.ref') }
  const stars = starredItems(snap, 3)
  const memories = onThisDay(snap, today)
  const showBackup = needsBackupReminder(snap, new Date())

  return h('div', {},
    h('div', { class: 'verse' },
      verse.text,
      verse.ref ? h('span', { class: 'ref' }, verse.ref) : null,
      h('a', { class: 'edit', href: '#/settings' }, t('verse.change'))),

    h('div', { class: 'sec' }, `${t('home.today')} · ${formatLongDate(today, lang)}`),
    h('div', { class: 'btns', style: 'margin-top:0' },
      h('a', { class: 'btn', href: `#/diary/${today}/ttb` }, t('home.addTTB')),
      h('a', { class: 'btn alt', href: `#/diary/${today}/devotional` }, t('home.addDevotional'))),

    stars.length ? [
      h('div', { class: 'sec' }, h('span', {}, '★ ', t('home.starred')), h('a', { href: '#/starred' }, t('common.seeAll'))),
      stars.map((x) => itemCard(x, snap, lang)),
    ] : null,

    memories.map((m) => [
      h('div', { class: 'sec' }, t(`home.onThisDay.${m.period}`)),
      m.ttb.map((x) => h('a', { class: 'item', href: `#/diary/${m.date}/ttb` },
        h('div', { class: 'txt' }, x.text), h('div', { class: 'meta' }, `TTB · ${formatShortDate(m.date, lang)}`))),
      m.devotional ? h('a', { class: 'item', href: `#/diary/${m.date}/devotional` },
        h('div', { class: 'txt' }, m.devotional.text.length > 160 ? `${m.devotional.text.slice(0, 160)}…` : m.devotional.text),
        h('div', { class: 'meta' }, `${t('type.devotional')} · ${formatShortDate(m.date, lang)}`)) : null,
    ]),

    h('div', { class: 'btns' },
      h('a', { class: 'btn alt', href: `#/summary/${monthOf(today)}` }, '📊 ', t('home.summary', { month: formatMonth(monthOf(today), lang) }))),

    showBackup ? h('div', { class: 'warn' },
      '🔒 ', snap.settings.lastBackupAt ? t('home.backupReminder') : t('home.backupReminderNever'),
      h('div', {}, h('button', { class: 'btn small gold', onclick: () => ctx.actions.backup() }, t('home.backupNow')))) : null,
  )
}
