import { h, sheet, toast } from './dom.js'
import { t } from '../i18n.js'

// Mostra o texto antes de enviar. Enviar abre o compartilhar do celular; no computador, copia.
export function openShare(text) {
  const s = sheet(
    h('h2', {}, t('common.share')),
    h('p', { class: 'meta' }, t('share.preview')),
    h('div', { class: 'preview' }, text),
    h('div', { class: 'btns' },
      h('button', { class: 'btn', onclick: send }, t('share.send')),
      h('button', { class: 'btn alt', onclick: () => s.close() }, t('common.cancel'))),
  )

  async function send() {
    if (navigator.share) {
      try {
        await navigator.share({ text })
        s.close()
      } catch (e) {
        if (e.name !== 'AbortError') await copy()
      }
      return
    }
    await copy()
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      toast(t('share.copied'))
      s.close()
    } catch {
      // Sem acesso à área de transferência: deixa o texto selecionado para copiar à mão.
      const range = document.createRange()
      range.selectNodeContents(s.box.querySelector('.preview'))
      getSelection().removeAllRanges()
      getSelection().addRange(range)
    }
  }
}

// Entrega um arquivo: pelo compartilhar do celular quando der, senão baixando.
export async function deliverFile(name, content, type) {
  const file = new File([content], name, { type })
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return true
    } catch (e) {
      if (e.name === 'AbortError') return false
    }
  }
  const url = URL.createObjectURL(file)
  const a = h('a', { href: url, download: name, style: 'display:none' })
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
  return true
}
