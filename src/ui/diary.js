import { h, formDialog, confirmDelete } from './dom.js'
import { t } from '../i18n.js'
import { formatLongDate, addDays } from '../lib/dates.js'
import { shareDay } from '../lib/shareText.js'

let focusNewTTB = false
let pending = null // gravação do devocional que ainda não foi feita

// Grava o devocional pendente antes de sair da tela.
export async function flush() {
  const p = pending
  pending = null
  if (p) await p()
}

export function render(params, ctx) {
  const { snap, store, lang } = ctx
  const date = params.date || ctx.today
  const tab = params.tab || 'ttb'
  const ttb = snap.ttb.filter((x) => x.date === date).sort((a, b) => a.order - b.order)
  const devotional = snap.devotionals.find((x) => x.date === date) || null

  const dateInput = h('input', {
    type: 'date', value: date, 'aria-label': formatLongDate(date, lang),
    onchange: (e) => { if (e.target.value) ctx.navigate(`#/diary/${e.target.value}/${tab}`) },
  })

  return h('div', {},
    h('div', { class: 'daybar' },
      h('a', { class: 'icon-btn', href: `#/diary/${addDays(date, -1)}/${tab}`, 'aria-label': t('diary.prevDay') }, '‹'),
      h('label', { class: 'day' }, date === ctx.today ? `${t('home.today')} · ${formatLongDate(date, lang)}` : formatLongDate(date, lang), dateInput),
      h('a', { class: 'icon-btn', href: `#/diary/${addDays(date, 1)}/${tab}`, 'aria-label': t('diary.nextDay') }, '›')),
    h('div', { class: 'tabs', role: 'tablist' },
      h('a', { href: `#/diary/${date}/ttb`, class: tab === 'ttb' ? 'on' : null, role: 'tab' }, t('diary.tab.ttb')),
      h('a', { href: `#/diary/${date}/devotional`, class: tab === 'devotional' ? 'on' : null, role: 'tab' }, t('diary.tab.devotional'))),
    tab === 'ttb' ? ttbView(date, ttb, ctx) : devotionalView(date, devotional, ctx),
    (ttb.length || devotional?.text.trim())
      ? h('div', { class: 'btns' }, h('button', { class: 'btn alt', onclick: () => ctx.actions.share(shareDay(date, ttb, devotional, lang)) }, t('diary.shareDay')))
      : null,
  )
}

function ttbView(date, items, ctx) {
  const { store } = ctx
  const input = h('input', { class: 'field', id: 'ttb-new', placeholder: t('diary.ttbPlaceholder'), enterkeyhint: 'done', autocomplete: 'off' })

  async function add(e) {
    e.preventDefault()
    const text = input.value.trim()
    if (!text) return
    await store.addTTB(date, text)
    focusNewTTB = true
    ctx.refresh()
  }

  async function edit(item) {
    const r = await formDialog({
      title: t('common.edit'),
      fields: [{ name: 'text', multiline: true, value: item.text }],
      extra: [{ label: t('common.delete'), value: 'delete', kind: 'danger' }],
    })
    if (!r) return
    if (r.action === 'delete') {
      if (await confirmDelete(t('diary.deleteConfirm'))) await store.deleteTTB(item.id)
    } else if (r.text.trim()) {
      await store.updateTTB(item.id, { text: r.text.trim() })
    }
    ctx.refresh()
  }

  if (focusNewTTB) {
    focusNewTTB = false
    setTimeout(() => input.focus(), 0)
  }

  return h('div', {},
    items.length ? items.map((x, i) =>
      h('div', { class: 'ttb-row' },
        h('span', { class: 'num' }, `${i + 1}.`),
        h('button', { class: 'txt', onclick: () => edit(x) }, x.text),
        starButton(x.starred, async () => { await store.updateTTB(x.id, { starred: !x.starred }); ctx.refresh() })))
      : h('p', { class: 'empty' }, t('diary.ttbEmpty')),
    h('form', { class: 'add-row', onsubmit: add },
      input,
      h('button', { class: 'btn small', type: 'submit' }, t('diary.add'))),
  )
}

function devotionalView(date, devotional, ctx) {
  const { store } = ctx
  const saved = h('div', { class: 'saved', 'aria-live': 'polite' })
  const area = h('textarea', { class: 'field devotional', placeholder: t('diary.devotionalPlaceholder') })
  area.value = devotional?.text || ''
  let timer = null

  const save = async () => {
    clearTimeout(timer)
    pending = null
    await store.saveDevotional(date, { text: area.value })
    saved.textContent = t('diary.autosaved')
  }
  area.addEventListener('input', () => {
    saved.textContent = ''
    clearTimeout(timer)
    pending = save
    timer = setTimeout(save, 800)
  })
  area.addEventListener('blur', () => { if (pending) save() })

  async function toggleStar() {
    await flush()
    await store.saveDevotional(date, { text: area.value, starred: !devotional?.starred })
    ctx.refresh()
  }

  async function remove() {
    if (!(await confirmDelete(t('diary.deleteDevotionalConfirm')))) return
    pending = null
    clearTimeout(timer)
    await store.saveDevotional(date, { text: '', starred: false })
    ctx.refresh()
  }

  return h('div', {},
    area,
    saved,
    h('div', { class: 'btns' },
      starButton(!!devotional?.starred, toggleStar, true),
      devotional ? h('button', { class: 'btn small danger', onclick: remove }, t('common.delete')) : null),
  )
}

function starButton(on, onclick, withLabel = false) {
  const label = on ? t('common.unstar') : t('common.star')
  return h('button', { class: `star-btn${on ? ' on' : ''}`, onclick, 'aria-label': label, 'aria-pressed': on ? 'true' : 'false' },
    on ? '★' : '☆', withLabel ? h('span', { style: 'font-size:14px;margin-left:6px' }, label) : null)
}
