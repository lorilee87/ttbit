import { t } from '../i18n.js'
import { formatLongDate, formatShortDate, formatMonth } from './dates.js'

// Texto organizado para enviar por WhatsApp, e-mail etc.

export function shareDay(date, ttb, devotional, lang) {
  const parts = [`🙏 TTBIT · ${formatLongDate(date, lang)}`]
  const items = [...ttb].sort((a, b) => a.order - b.order)
  if (items.length) parts.push([t('share.gratefulFor', {}, lang), ...items.map((x, i) => `${i + 1}. ${x.text}`)].join('\n'))
  if (devotional && devotional.text.trim()) parts.push(`${t('share.devotional', {}, lang)}\n${devotional.text.trim()}`)
  return parts.join('\n\n')
}

export function shareList(list, prayers, lang) {
  const lines = prayers.map((p) => {
    if (!p.answeredDate) return `• ${p.text}`
    const note = p.answerNote ? ` — ${p.answerNote}` : ''
    return `✓ ${p.text} (${formatShortDate(p.answeredDate, lang)})${note}`
  })
  return [`🙏 TTBIT · ${list.name}`, lines.join('\n')].filter(Boolean).join('\n\n')
}

export function shareAnswered(prayer, lang) {
  const parts = [`🙏 TTBIT · ${t('share.answered', {}, lang)}`, prayer.text, `✓ ${formatShortDate(prayer.answeredDate, lang)}`]
  if (prayer.answerNote) parts.push(prayer.answerNote)
  return parts.join('\n\n')
}

export function shareSummary(month, summary, lang) {
  const label = formatMonth(month, lang)
  return [
    `🙏 ${t('share.summaryTitle', { month: label }, lang)}`,
    [
      `${summary.gratitude} ${t('summary.gratitude', {}, lang)}`,
      `${summary.answered.length} ${t('summary.answered', {}, lang)}`,
      `${summary.starred.length} ${t('summary.starred', {}, lang)}`,
      `${summary.devotionalDays} ${t('summary.devotionalDays', {}, lang)}`,
    ].join('\n'),
  ].join('\n\n')
}
