export const DATE_FILTERS = ['All', 'Today', 'This week', 'This month']

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/* Week runs Monday to Sunday. */
export function isSameWeek(date, now) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)

  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  return date >= start && date < end
}

export function matchesDateFilter(value, filter) {
  if (filter === 'All') return true

  const date = new Date(value)
  const now = new Date()

  if (filter === 'Today') return isSameDay(date, now)
  if (filter === 'This week') return isSameWeek(date, now)
  if (filter === 'This month') {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    )
  }

  return true
}