import { t } from '../i18n.js'

// Monta elementos. Texto da pessoa sempre entra como texto, nunca como HTML.
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v)
    else if (k === 'class') el.className = v
    else if (k === 'value') el.value = v
    else el.setAttribute(k, v === true ? '' : v)
  }
  append(el, children)
  return el
}

function append(el, children) {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue
    if (Array.isArray(c)) append(el, c)
    else el.append(c instanceof Node ? c : document.createTextNode(String(c)))
  }
}

// Janela que sobe de baixo. Devolve a função que fecha.
export function sheet(...content) {
  const box = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' }, ...content)
  const overlay = h('div', { class: 'overlay' }, box)
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })
  const onKey = (e) => { if (e.key === 'Escape') close() }
  function close() {
    overlay.remove()
    document.removeEventListener('keydown', onKey)
    overlay.dispatchEvent(new Event('closed'))
  }
  document.addEventListener('keydown', onKey)
  document.body.append(overlay)
  return { close, overlay, box }
}

// Pergunta com botões. Fechar sem escolher devolve null.
export function confirmDialog(message, buttons, title) {
  return new Promise((resolve) => {
    let done = false
    const finish = (v) => { if (!done) { done = true; resolve(v); s.close() } }
    const s = sheet(
      title ? h('h2', {}, title) : null,
      h('p', {}, message),
      h('div', { class: 'btns' }, buttons.map((b) =>
        h('button', { class: `btn ${b.kind || (b.primary ? '' : 'alt')}`, onclick: () => finish(b.value) }, b.label))),
    )
    s.overlay.addEventListener('closed', () => { if (!done) { done = true; resolve(null) } })
  })
}

export function confirmDelete(message) {
  return confirmDialog(message, [
    { label: t('common.delete'), value: true, kind: 'danger' },
    { label: t('common.cancel'), value: false },
  ]).then(Boolean)
}

// Formulário curto numa janela. Devolve os valores ou null se cancelar.
export function formDialog({ title, fields, okLabel = t('common.save'), extra = [] }) {
  return new Promise((resolve) => {
    let done = false
    const inputs = {}
    const form = h('form', { class: 'stack' },
      fields.map((f) => {
        const input = f.multiline
          ? h('textarea', { class: 'field', name: f.name, placeholder: f.placeholder || '', rows: 4 })
          : h('input', { class: 'field', name: f.name, type: f.type || 'text', placeholder: f.placeholder || '' })
        input.value = f.value ?? ''
        inputs[f.name] = input
        return [f.label ? h('label', { class: 'lbl' }, f.label) : null, input]
      }),
      h('div', { class: 'btns' },
        h('button', { class: 'btn', type: 'submit' }, okLabel),
        extra.map((b) => h('button', { class: `btn ${b.kind || 'alt'}`, type: 'button', onclick: () => finish({ action: b.value }) }, b.label)),
        h('button', { class: 'btn alt', type: 'button', onclick: () => finish(null) }, t('common.cancel'))),
    )
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const values = {}
      for (const [k, el] of Object.entries(inputs)) values[k] = el.value
      finish(values)
    })
    const finish = (v) => { if (!done) { done = true; resolve(v); s.close() } }
    const s = sheet(h('h2', {}, title), form)
    s.overlay.addEventListener('closed', () => { if (!done) { done = true; resolve(null) } })
    const first = Object.values(inputs)[0]
    if (first) setTimeout(() => first.focus(), 50)
  })
}

export function toast(message, ms = 2600) {
  const el = h('div', { class: 'toast', role: 'status' }, message)
  document.body.append(el)
  setTimeout(() => el.remove(), ms)
}

// Texto com a palavra encontrada pintada, montado só com nós de texto.
export function highlighted(text, start, end, around = 40) {
  const from = Math.max(0, start - around)
  const to = Math.min(text.length, end + around)
  return h('span', {},
    from > 0 ? '…' : '', text.slice(from, start),
    h('mark', {}, text.slice(start, end)),
    text.slice(end, to), to < text.length ? '…' : '')
}
