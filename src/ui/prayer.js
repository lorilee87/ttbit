import { h, formDialog, confirmDelete, confirmDialog } from './dom.js'
import { t } from '../i18n.js'
import { formatShortDate } from '../lib/dates.js'
import { shareList } from '../lib/shareText.js'
import { GROUPS } from '../router.js'

export function render(params, ctx) {
  const { snap } = ctx
  const group = params.group || 'personal'
  const lists = snap.lists.filter((l) => l.group === group).sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))

  return h('div', {},
    h('h1', { class: 'screen-title' }, t('prayer.title')),
    h('div', { class: 'tabs', role: 'tablist' }, GROUPS.map((g) =>
      h('a', { href: `#/prayer/${g}`, class: g === group ? 'on' : null, role: 'tab' }, t(`group.${g}`)))),
    lists.length ? lists.map((l) => listView(l, ctx)) : h('p', { class: 'empty' }, t('prayer.emptyGroup')),
    h('div', { class: 'btns' },
      h('button', { class: 'btn alt', onclick: () => newList(group, ctx) }, t('prayer.newList')),
      h('a', { class: 'btn alt', href: '#/answered' }, t('prayer.answeredLink'))),
  )
}

async function newList(group, ctx) {
  const r = await formDialog({ title: t('prayer.newListName'), fields: [{ name: 'name' }] })
  if (r?.name?.trim()) {
    await ctx.store.addList(group, r.name.trim())
    ctx.refresh()
  }
}

function listView(list, ctx) {
  const { snap, store, lang } = ctx
  const key = (p) => `${p.date}|${p.createdAt || ''}`
  const prayers = snap.prayers.filter((p) => p.listId === list.id).sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0))

  async function menu() {
    const choice = await confirmDialog(list.name, [
      { label: t('prayer.newPrayer'), value: 'add', primary: true },
      { label: t('prayer.renameList'), value: 'rename' },
      prayers.length ? { label: t('common.share'), value: 'share' } : null,
      { label: t('prayer.deleteList'), value: 'delete', kind: 'danger' },
      { label: t('common.cancel'), value: null },
    ].filter(Boolean), t('prayer.listMenu'))
    if (choice === 'add') return addPrayer()
    if (choice === 'share') return ctx.actions.share(shareList(list, prayers, lang))
    if (choice === 'rename') {
      const r = await formDialog({ title: t('prayer.renameList'), fields: [{ name: 'name', value: list.name }] })
      if (r?.name?.trim()) await store.renameList(list.id, r.name.trim())
    }
    if (choice === 'delete') {
      if (await confirmDelete(t('prayer.deleteListConfirm', { n: prayers.length }))) await store.deleteList(list.id)
    }
    ctx.refresh()
  }

  async function addPrayer() {
    const r = await formDialog({ title: list.name, fields: [{ name: 'text', multiline: true, placeholder: t('prayer.newPrayerPlaceholder') }] })
    if (r?.text?.trim()) {
      await store.addPrayer(list.id, r.text.trim(), ctx.today)
      ctx.refresh()
    }
  }

  return h('section', {},
    h('div', { class: 'list-head' },
      h('h2', { class: 'list-name' }, list.name),
      h('button', { class: 'icon-btn', onclick: menu, 'aria-label': t('prayer.listMenu') }, '⋯')),
    prayers.length ? prayers.map((p) => prayerRow(p, ctx)) : h('p', { class: 'meta' }, t('prayer.emptyList')),
    h('button', { class: 'link-btn', onclick: addPrayer }, t('prayer.newPrayer')),
  )
}

function prayerRow(p, ctx) {
  const { store, lang } = ctx

  async function toggleAnswered() {
    if (p.answeredDate) {
      await store.updatePrayer(p.id, { answeredDate: null, answerNote: '' })
      return ctx.refresh()
    }
    const r = await formDialog({
      title: t('prayer.markAnswered'),
      fields: [
        { name: 'date', type: 'date', label: t('prayer.answeredDate'), value: ctx.today },
        { name: 'note', multiline: true, label: t('prayer.answerNote') },
      ],
    })
    if (!r) return
    await store.updatePrayer(p.id, { answeredDate: r.date || ctx.today, answerNote: r.note.trim() })
    ctx.refresh()
  }

  async function edit() {
    const r = await formDialog({
      title: t('common.edit'),
      fields: [{ name: 'text', multiline: true, value: p.text }],
      extra: [
        { label: p.starred ? t('common.unstar') : `☆ ${t('common.star')}`, value: 'star' },
        p.answeredDate ? { label: t('common.share'), value: 'share' } : null,
        p.answeredDate ? { label: t('prayer.unmark'), value: 'unmark' } : null,
        { label: t('common.delete'), value: 'delete', kind: 'danger' },
      ].filter(Boolean),
    })
    if (!r) return
    if (r.action === 'star') await store.updatePrayer(p.id, { starred: !p.starred })
    else if (r.action === 'unmark') await store.updatePrayer(p.id, { answeredDate: null, answerNote: '' })
    else if (r.action === 'share') return ctx.actions.shareAnswered(p)
    else if (r.action === 'delete') { if (await confirmDelete(t('prayer.deleteConfirm'))) await store.deletePrayer(p.id) }
    else if (r.text.trim()) await store.updatePrayer(p.id, { text: r.text.trim() })
    ctx.refresh()
  }

  const done = !!p.answeredDate
  return h('div', { class: 'prayer' },
    h('button', { class: `check${done ? ' done' : ''}`, onclick: toggleAnswered, 'aria-label': done ? t('prayer.unmark') : t('prayer.markAnswered'), 'aria-pressed': done ? 'true' : 'false' },
      h('span', {}, done ? '✓' : '')),
    h('div', { class: 'body' },
      h('button', { class: 'txt', onclick: edit }, p.starred ? '★ ' : '', p.text),
      done
        ? h('div', { class: 'answered' }, t('prayer.answeredOn', { date: formatShortDate(p.answeredDate, lang) }), p.answerNote ? `\n"${p.answerNote}"` : '')
        : h('div', { class: 'meta' }, t('prayer.since', { date: formatShortDate(p.date, lang) }))),
  )
}
