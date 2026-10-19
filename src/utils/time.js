const timeFmt = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' })

export const formatTime = (d) => timeFmt.format(d)
export const formatRange = (start, end) => `${timeFmt.format(start)} – ${timeFmt.format(end)}`

export function formatCountdown(ms) {
  const mins = Math.max(0, Math.round(ms / 60000))
  if (mins < 1) return 'Under a minute'
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h} h ${m} min` : `${h} h`
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}