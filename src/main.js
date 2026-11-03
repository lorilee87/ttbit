import './styles.css'
import * as store from './store.js'
import { parseRoute, navigate } from './router.js'
import { detectLang, setLang } from './i18n.js'
import { localISODate } from './lib/dates.js'
import { renderApp } from './ui/shell.js'
import * as home from './ui/home.js'
import * as starred from './ui/starred.js'
import * as settings from './ui/settings.js'
import * as diary from './ui/diary.js'
import * as prayer from './ui/prayer.js'
import * as answered from './ui/answered.js'
import * as searchView from './ui/searchView.js'
import * as summaryView from './ui/summaryView.js'
import { openShare } from './ui/share.js'
import { makeBackup, restoreBackup } from './ui/backupUI.js'
import { openReminder } from './ui/reminderUI.js'
import { shareAnswered } from './lib/shareText.js'

const screens = {
  home: home.render,
  starred: starred.render,
  settings: settings.render,
  diary: diary.render,
  prayer: prayer.render,
  answered: answered.render,
  search: searchView.render,
  summary: summaryView.render,
}

const root = document.getElementById('app')

let ctx = null

// Ações que mais de uma tela usa.
const actions = {
  backup: () => makeBackup(ctx),
  restore: () => restoreBackup(ctx),
  reminder: () => openReminder(ctx),
  share: (text) => openShare(text),
  shareAnswered: (prayer) => openShare(shareAnswered(prayer, ctx.lang)),
}

async function refresh() {
  const snap = await store.getSnapshot()
  setLang(snap.settings.lang)
  document.documentElement.lang = snap.settings.lang === 'en' ? 'en' : 'pt-BR'
  ctx = { snap, store, refresh, navigate, actions, lang: snap.settings.lang, today: localISODate(new Date()) }
  renderApp(root, parseRoute(location.hash), ctx, screens)
}

async function start() {
  store.setDefaultLang(detectLang(navigator.language))
  await store.openStore()
  window.addEventListener('hashchange', async () => { await diary.flush(); await refresh(); window.scrollTo(0, 0) })
  window.addEventListener('pagehide', () => { diary.flush() })
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) diary.flush()
    // O app pode ficar dias aberto no fundo: ao voltar, "hoje" precisa ser o dia de agora.
    else if (ctx && localISODate(new Date()) !== ctx.today) diary.flush().then(refresh)
  })
  await refresh()
  // Pede ao navegador para não apagar os dados sozinho.
  navigator.storage?.persist?.().catch(() => {})
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  }
}

start()
