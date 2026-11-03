// Navegação por #hash. Qualquer endereço desconhecido volta para o Início.

const DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/
const TABS = ['ttb', 'devotional']
export const GROUPS = ['personal', 'others', 'world']

const HOME = { name: 'home', params: {} }

export function parseRoute(hash) {
  const parts = String(hash || '').replace(/^#\/?/, '').split('/').filter(Boolean)
  const [name, a, b] = parts
  switch (name) {
    case undefined:
      return HOME
    case 'diary':
      if (!a) return { name, params: {} }
      if (DATE.test(a) && TABS.includes(b || 'ttb')) return { name, params: { date: a, tab: b || 'ttb' } }
      return HOME
    case 'prayer':
      if (!a) return { name, params: { group: 'personal' } }
      return GROUPS.includes(a) ? { name, params: { group: a } } : HOME
    case 'summary':
      if (!a) return { name, params: {} }
      return MONTH.test(a) ? { name, params: { month: a } } : HOME
    case 'answered':
    case 'search':
    case 'settings':
    case 'starred':
      return { name, params: {} }
    default:
      return HOME
  }
}

export function navigate(hash) {
  if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'))
  else location.hash = hash
}
