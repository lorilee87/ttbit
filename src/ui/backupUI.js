import { h, toast, confirmDialog } from './dom.js'
import { t } from '../i18n.js'
import { formatShortDate, localISODate } from '../lib/dates.js'
import { buildBackup, backupFileName, parseBackup, countSnapshot, newerISO } from '../lib/backup.js'
import { deliverFile } from './share.js'

export async function makeBackup(ctx) {
  const snap = await ctx.store.getSnapshot()
  const now = new Date()
  const json = JSON.stringify(buildBackup(snap, now), null, 1)
  const delivered = await deliverFile(backupFileName(now), json, 'application/json')
  if (!delivered) return false
  await ctx.store.saveSettings({ lastBackupAt: now.toISOString() })
  toast(t('backup.saved'))
  await ctx.refresh()
  return true
}

function pickFile() {
  return new Promise((resolve) => {
    const input = h('input', { type: 'file', accept: '.json,application/json', style: 'display:none' })
    input.addEventListener('change', () => { resolve(input.files[0] || null); input.remove() })
    document.body.append(input)
    input.click()
  })
}

export async function restoreBackup(ctx) {
  const file = await pickFile()
  if (!file) return
  const parsed = parseBackup(await file.text())
  if (!parsed.ok) {
    await confirmDialog(t(`backup.error.${parsed.error}`), [{ label: t('common.ok'), value: true, primary: true }])
    return
  }
  const { backup, counts } = parsed

  // Aviso antes de substituir tudo (pedido da Lori).
  for (;;) {
    const current = countSnapshot(await ctx.store.getSnapshot())
    const date = formatShortDate(localISODate(new Date(backup.createdAt)), ctx.lang)
    const choice = await confirmDialog(
      [
        t('backup.warnText', { date }),
        '',
        t('backup.warnNow', current),
        t('backup.warnCopy', counts),
      ].join('\n'),
      [
        { label: t('backup.copyFirst'), value: 'copy', kind: 'gold' },
        { label: t('backup.restoreAnyway'), value: 'restore', kind: 'danger' },
        { label: t('common.cancel'), value: null },
      ],
      t('backup.warnTitle'),
    )
    if (choice === 'copy') { await makeBackup(ctx); continue }
    if (choice !== 'restore') return
    break
  }

  // A data da última cópia continua sendo a deste aparelho, já que acabamos de mexer nele.
  const keepLast = (await ctx.store.getSnapshot()).settings.lastBackupAt
  await ctx.store.replaceAll({ ...backup.data, settings: { ...backup.data.settings, lastBackupAt: newerISO(keepLast, backup.createdAt) } })
  toast(t('backup.restored'))
  ctx.navigate('#/')
}
