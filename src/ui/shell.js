import { h } from './dom.js'
import { t } from '../i18n.js'

const NAV = [
  ['home', '#/', '⌂', 'nav.home'],
  ['diary', '#/diary', '✎', 'nav.diary'],
  ['prayer', '#/prayer', '🙏', 'nav.prayer'],
  ['search', '#/search', '⌕', 'nav.search'],
]

// Qual aba da barra de baixo fica marcada em cada tela.
const NAV_OF = { home: 'home', starred: 'home', summary: 'home', diary: 'diary', prayer: 'prayer', answered: 'prayer', search: 'search', settings: null }

export function renderApp(root, route, ctx, screens) {
  const render = screens[route.name] || screens.home
  const active = NAV_OF[route.name]
  root.replaceChildren(
    h('div', { class: 'app' },
      h('header', { class: 'topbar' },
        h('a', { class: 'brand', href: '#/' }, 'TTBIT'),
        h('a', { class: 'icon-btn', href: '#/settings', 'aria-label': t('nav.settings') }, '⚙')),
      h('main', { class: 'screen' }, render(route.params, ctx))),
    h('nav', { class: 'nav' },
      h('div', { class: 'nav-inner' }, NAV.map(([name, href, ico, label]) =>
        h('a', { href, class: name === active ? 'on' : null, 'aria-current': name === active ? 'page' : null },
          h('span', { class: 'ico', 'aria-hidden': 'true' }, ico), t(label))))),
  )
}

// Endereço da tela onde um item (de destaque, busca etc.) mora.
export function itemHref(item, snap) {
  if (item.type === 'ttb') return `#/diary/${item.date}/ttb`
  if (item.type === 'devotional') return `#/diary/${item.date}/devotional`
  const list = snap.lists.find((l) => l.id === item.listId)
  return `#/prayer/${list ? list.group : 'personal'}`
}
