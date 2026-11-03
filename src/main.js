import './styles.css'
import * as store from './store.js'
import { parseRoute, navigate } from './router.js'
import { detectLang, setLang } from './i18n.js'
import { localISODate } from './lib/dates.js'
import { renderApp } from './ui/shell.js'
import * as home from './ui/home.js'
import * as starred from './ui/starred.js'
import * as settings from './ui/settings.js'

const screens = {
  home: home.render,
  starred: starred.render,
  settings: settings.render,
}

const root = document.getElementById('app')

// Ações que mais de uma tela usa. As etapas seguintes ligam cada uma.
const actions = {
  backup: () => {},
  restore: () => {},
  reminder: () => {},
}

async function refresh() {
  const snap = await store.getSnapshot()
  setLang(snap.settings.lang)
  document.documentElement.lang = snap.settings.lang === 'en' ? 'en' : 'pt-BR'
  const ctx = { snap, store, refresh, navigate, actions, lang: snap.settings.lang, today: localISODate(new Date()) }
  renderApp(root, parseRoute(location.hash), ctx, screens)
}

async function start() {
  store.setDefaultLang(detectLang(navigator.language))
  await store.openStore()
  window.addEventListener('hashchange', () => { refresh(); window.scrollTo(0, 0) })
  await refresh()
}

start()
