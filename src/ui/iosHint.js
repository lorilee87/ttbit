import { h } from './dom.js'
import { t } from '../i18n.js'

export function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export function isInstalled() {
  return navigator.standalone === true || matchMedia('(display-mode: standalone)').matches
}

// No iPhone, só o app instalado na tela de início guarda os dados com segurança.
export function iosHint(ctx) {
  if (!isIOS() || isInstalled() || ctx.snap.settings.iosHintDismissed) return null
  return h('div', { class: 'warn', style: 'margin:0 0 14px' },
    h('strong', {}, t('ios.title')), h('br'),
    t('ios.text'), h('br'), h('br'),
    t('ios.step1'), h('br'),
    t('ios.step2'),
    h('div', {}, h('button', {
      class: 'btn small alt',
      onclick: async () => { await ctx.store.saveSettings({ iosHintDismissed: true }); ctx.refresh() },
    }, t('ios.later'))))
}
