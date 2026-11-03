import { h, formDialog, toast } from './dom.js'
import { t } from '../i18n.js'
import { formatShortDate, localISODate } from '../lib/dates.js'

export function render(params, ctx) {
  const { snap, store } = ctx
  const s = snap.settings
  const verse = s.verse || { text: t('verse.default.text'), ref: t('verse.default.ref') }

  const langSelect = h('select', {
    id: 'lang',
    onchange: async (e) => { await store.saveSettings({ lang: e.target.value }); ctx.refresh() },
  }, h('option', { value: 'pt' }, 'Português'), h('option', { value: 'en' }, 'English'))
  langSelect.value = s.lang

  async function editVerse() {
    const r = await formDialog({
      title: t('settings.verse'),
      fields: [
        { name: 'text', label: t('settings.verseText'), multiline: true, value: verse.text },
        { name: 'ref', label: t('settings.verseRef'), value: verse.ref },
      ],
      extra: s.verse ? [{ label: t('settings.verseReset'), value: 'reset' }] : [],
    })
    if (!r) return
    if (r.action === 'reset') await store.saveSettings({ verse: null })
    else if (r.text.trim()) await store.saveSettings({ verse: { text: r.text.trim(), ref: r.ref.trim() } })
    else return
    toast(t('settings.verseSaved'))
    ctx.refresh()
  }

  const timeInput = h('input', {
    type: 'time', id: 'reminder-time', value: s.reminderTime,
    onchange: (e) => { if (e.target.value) store.saveSettings({ reminderTime: e.target.value }) },
  })

  return h('div', {},
    h('h1', { class: 'screen-title' }, t('settings.title')),

    h('div', { class: 'settings-block' },
      h('div', { class: 'row' }, h('label', { for: 'lang' }, t('settings.language')), langSelect),
      h('h2', {}, t('settings.verse')),
      h('div', { class: 'verse' }, verse.text, h('span', { class: 'ref' }, verse.ref)),
      h('div', { class: 'btns' }, h('button', { class: 'btn alt', onclick: editVerse }, t('verse.change')))),

    h('div', { class: 'settings-block' },
      h('h2', {}, t('settings.reminder')),
      h('div', { class: 'row' }, h('label', { for: 'reminder-time' }, t('settings.reminderTime')), timeInput),
      h('p', { class: 'meta' }, t('settings.reminderInfo')),
      h('div', { class: 'btns' }, h('button', { class: 'btn alt', onclick: () => ctx.actions.reminder() }, t('settings.reminderCreate')))),

    h('div', { class: 'settings-block' },
      h('h2', {}, t('settings.backup')),
      h('p', { class: 'meta' }, t('settings.backupInfo')),
      h('div', { class: 'row' }, t('settings.lastBackup'),
        h('span', { class: 'meta' }, s.lastBackupAt ? formatShortDate(localISODate(new Date(s.lastBackupAt)), s.lang) : t('settings.never'))),
      h('div', { class: 'btns' }, h('button', { class: 'btn gold', onclick: () => ctx.actions.backup() }, t('settings.backupNow'))),
      h('div', { class: 'btns' }, h('button', { class: 'btn alt', onclick: () => ctx.actions.restore() }, t('settings.restore'))),
      h('p', { class: 'meta' }, t('settings.backupNoPassword'))),

    h('p', { class: 'meta', style: 'text-align:center;margin:20px 8px' }, t('settings.privacy')),
  )
}
