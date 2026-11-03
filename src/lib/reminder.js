import { t } from '../i18n.js'

// Lembrete diário no calendário do celular. Começa amanhã, dura 5 minutos.

const pad = (n) => String(n).padStart(2, '0')
const stamp = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`

function window5min(time, now) {
  const [h, m] = time.split(':').map(Number)
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, h, m)
  const end = new Date(start.getTime() + 5 * 60000)
  return [stamp(start), stamp(end)]
}

const icsEscape = (s) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

export function reminderICS(time, lang, appUrl, now) {
  const [start, end] = window5min(time, now)
  const title = icsEscape(t('reminder.title', {}, lang))
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TTBIT//PT',
    'BEGIN:VEVENT',
    'UID:ttbit-reminder@ttbit',
    `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    'RRULE:FREQ=DAILY',
    `SUMMARY:${title}`,
    `DESCRIPTION:${icsEscape(t('reminder.details', { url: appUrl }, lang))}`,
    `URL:${appUrl}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${title}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n')
}

export function reminderGoogleUrl(time, lang, appUrl, now, tz = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  const [start, end] = window5min(time, now)
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: t('reminder.title', {}, lang),
    dates: `${start}/${end}`,
    ctz: tz,
    recur: 'RRULE:FREQ=DAILY',
    details: t('reminder.details', { url: appUrl }, lang),
  })
  return `https://calendar.google.com/calendar/render?${p}`
}
