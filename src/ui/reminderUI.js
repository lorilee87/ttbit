import { h, sheet } from './dom.js'
import { t } from '../i18n.js'
import { reminderICS, reminderGoogleUrl } from '../lib/reminder.js'
import { deliverFile } from './share.js'

const appUrl = () => location.href.split('#')[0]

export function openReminder(ctx) {
  const time = ctx.snap.settings.reminderTime || '21:00'
  const s = sheet(
    h('h2', {}, t('settings.reminder')),
    h('p', {}, `${t('settings.reminderTime')}: ${time}`),
    h('p', { class: 'meta' }, t('settings.reminderInfo')),
    h('div', { class: 'btns' },
      h('a', {
        class: 'btn', target: '_blank', rel: 'noopener',
        href: reminderGoogleUrl(time, ctx.lang, appUrl(), new Date()),
        onclick: () => setTimeout(() => s.close(), 100),
      }, t('settings.reminderGoogle')),
      h('button', {
        class: 'btn alt',
        onclick: async () => {
          await deliverFile('TTBIT-lembrete.ics', reminderICS(time, ctx.lang, appUrl(), new Date()), 'text/calendar')
          s.close()
        },
      }, t('settings.reminderOther')),
      h('button', { class: 'btn alt', onclick: () => s.close() }, t('common.cancel'))),
  )
}
