const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'short' })
const clock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })
const dayMonth = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

/**
 * Deadline label (D8): a countdown only when less than 24 hours are left,
 * otherwise the weekday. "closes in 3h" creates urgency only when it's real.
 */
export function deadline(closesAt: number, now = Date.now()) {
  const left = closesAt - now
  if (left <= 0) return 'Closed'
  if (left < HOUR) return `Closes in ${Math.max(1, Math.round(left / MIN))} min`
  if (left < DAY) return `Closes in ${Math.round(left / HOUR)}h`
  return `Closes ${weekday.format(closesAt)}`
}

export function isUrgent(closesAt: number, now = Date.now()) {
  const left = closesAt - now
  return left > 0 && left < DAY
}

/** Relative time for notifications and lists. */
export function ago(t: number, now = Date.now()) {
  const d = now - t
  if (d < MIN) return 'Just now'
  if (d < HOUR) return `${Math.round(d / MIN)} min ago`
  if (d < DAY) return `${Math.round(d / HOUR)}h ago`
  if (d < 7 * DAY) return `${Math.round(d / DAY)}d ago`
  return dayMonth.format(t)
}

export function timeOfDay(t: number) {
  return clock.format(t)
}

export function dayLabel(t: number, now = Date.now()) {
  const a = new Date(t)
  const b = new Date(now)
  const sameDay = (x: Date, y: Date) =>
    x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate()
  if (sameDay(a, b)) return 'Today'
  const y = new Date(now - DAY)
  if (sameDay(a, y)) return 'Yesterday'
  return dayMonth.format(t)
}

export function shortDate(t: number) {
  return dayMonth.format(t)
}
