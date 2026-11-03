import { monthOf } from './dates.js'
import { starredItems, answeredPrayers } from './highlights.js'

export function monthSummary(snap, month) {
  const inMonth = (iso) => iso && monthOf(iso) === month
  return {
    gratitude: snap.ttb.filter((x) => inMonth(x.date)).length,
    answered: answeredPrayers(snap).filter((p) => inMonth(p.answeredDate)),
    starred: starredItems(snap).filter((x) => inMonth(x.date)),
    devotionalDays: snap.devotionals.filter((x) => inMonth(x.date) && x.text.trim()).length,
  }
}
