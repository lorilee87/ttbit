// Datas de anotação são sempre a data local do aparelho, no formato YYYY-MM-DD.

const pad = (n) => String(n).padStart(2, '0')

export function localISODate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Converte 'YYYY-MM-DD' num Date ao meio-dia local, para nunca mudar de dia.
export function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}

export function addMonthsClamped(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  const total = y * 12 + (m - 1) + n
  const ty = Math.floor(total / 12)
  const tm = total - ty * 12
  const lastDay = new Date(ty, tm + 1, 0).getDate()
  return `${ty}-${pad(tm + 1)}-${pad(Math.min(d, lastDay))}`
}

export function addDays(iso, n) {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + n)
  return localISODate(d)
}

export function monthOf(iso) {
  return iso.slice(0, 7)
}

const locales = { pt: 'pt-BR', en: 'en-US' }

export function formatLongDate(iso, lang) {
  return new Intl.DateTimeFormat(locales[lang] || locales.pt, {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(parseISODate(iso))
}

export function formatShortDate(iso, lang) {
  return new Intl.DateTimeFormat(locales[lang] || locales.pt, {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(parseISODate(iso))
}

export function formatMonth(month, lang) {
  return new Intl.DateTimeFormat(locales[lang] || locales.pt, {
    month: 'long', year: 'numeric',
  }).format(parseISODate(`${month}-01`))
}
