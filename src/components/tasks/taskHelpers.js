import { parseTaskDate } from '../../data/tasks'

const DAY_MS = 86400000

export function startOfDay(value = new Date()) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

export function formatDate(value) {
  const date = parseTaskDate(value)
  if (!date) return 'No due date'

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getDueLabel(value) {
  const date = parseTaskDate(value)
  if (!date) return 'No due date'

  const difference = Math.round(
    (startOfDay(date).getTime() - startOfDay().getTime()) / DAY_MS,
  )

  if (difference === 0) return 'Due today'
  if (difference === 1) return 'Due tomorrow'
  if (difference < 0) return `${Math.abs(difference)} days overdue`

  return formatDate(value)
}
