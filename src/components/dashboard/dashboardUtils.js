export const COLORS = {
  navy: '#123A59',
  blue: '#0967B2',
  green: '#16815B',
  text: '#304858',
  muted: '#5A7189',
  border: '#DFE7EC',
  paleBlue: '#EFF6FB',
  paleGreen: '#F0F7F1',
}

export const PRIORITY = {
  high: { label: 'High', color: '#C0392B' },
  medium: { label: 'Medium', color: '#B7791F' },
  low: { label: 'Low', color: '#2E7D5B' },
}

export const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

export const STATUS = {
  live: { label: 'Live', accent: COLORS.green, bg: '#E4F5EC', text: '#0E5C40' },
  upcoming: { label: 'Upcoming', accent: COLORS.blue, bg: '#E8F2FB', text: '#0A4F8A' },
  past: { label: 'Completed', accent: '#9AA9B5', bg: '#F1F4F6', text: '#5B6B77' },
}

export const toDate = (value) => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatTime = (value) => {
  const date = toDate(value)
  return date
    ? date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : ''
}

export const formatDue = (value) => {
  const date = toDate(value)
  return date
    ? date.toLocaleDateString([], { day: 'numeric', month: 'short' })
    : ''
}

export const greetingFor = (now) =>
  now.getHours() < 12
    ? 'Good morning'
    : now.getHours() < 17
      ? 'Good afternoon'
      : 'Good evening'

export const priorityKey = (value) => {
  const key = String(value ?? 'medium').toLowerCase()
  return PRIORITY[key] ? key : 'medium'
}

export const normalizeStatus = (value) => {
  const status = String(value ?? 'pending')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')

  if (['done', 'completed', 'complete', 'closed'].includes(status)) {
    return 'done'
  }

  if (
    ['in progress', 'inprogress', 'ongoing', 'started','in process'].includes(
      status.replace(/\s/g, ''),
    ) ||
    status === 'in progress'
  ) {
    return 'in progress'
  }

  if (['blocked', 'on hold', 'onhold'].includes(status)) {
    return 'blocked'
  }

  if (['pending', 'todo', 'to do', 'not started', 'open'].includes(status)) {
    return 'pending'
  }

  return status
}

export const isSameDay = (first, second) => {
  const a = toDate(first)
  const b = toDate(second)
  return Boolean(
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export const statusOf = (meeting, now) => {
  const start = toDate(meeting?._start ?? meeting?.start)
  const end = toDate(meeting?._end ?? meeting?.end)

  if (!start || !end) return 'upcoming'
  if (end <= now) return 'past'
  if (start <= now && now < end) return 'live'
  return 'upcoming'
}

export const platformOf = (meeting) =>
  meeting?.platform ?? meeting?.provider ?? meeting?.platformName ?? ''

export const participantCount = (meeting) =>
  Array.isArray(meeting?.participants)
    ? meeting.participants.length
    : Array.isArray(meeting?.attendees)
      ? meeting.attendees.length
      : Number(meeting?.participants) || 0

export const joinUrlOf = (meeting) =>
  meeting?.joinUrl ?? meeting?.joinLink ?? meeting?.link ?? meeting?.url ?? null

export const getActionItemsFromMeetings = (meetings = []) =>
  meetings.flatMap((meeting) => {
    const tasks = Array.isArray(meeting?.actionItems) ? meeting.actionItems : []

    return tasks.map((item, index) => ({
      id: item.id ?? `${meeting.id ?? meeting.title}-task-${index}`,
      title: item.title ?? item.task ?? item.description ?? 'Untitled task',
      meeting: item.meeting ?? item.meetingTitle ?? meeting.title ?? 'Meeting',
      meetingId: meeting.id,
      due: item.due ?? item.dueDate ?? item.deadline ?? null,
      owner: item.owner ?? item.assignee ?? item.assignedTo ?? '',
      priority: priorityKey(item.priority),
      status: normalizeStatus(item.status),
    }))
  })

// Compare email/name/ID when available; don't assume every task uses the same owner field.
export const isCurrentUserTask = (item, user) => {
  const owner = item?.owner ?? item?.assignee ?? item?.assignedTo ?? item?.assignedToEmail
  if (!owner || !user) return false

  const userValues = [
    user.id,
    user.email,
    user.name,
    user.fullName,
    [user.firstName, user.lastName].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())

  const ownerValue =
    typeof owner === 'object'
      ? owner.email ?? owner.id ?? owner.name ?? owner.fullName
      : owner

  return userValues.includes(String(ownerValue ?? '').trim().toLowerCase())
}

export const tasksDueTodayForUser = (items = [], user, now = new Date()) =>
  items.filter((item) => isCurrentUserTask(item, user) && isSameDay(item.due, now))


export const isActionableTask = (item) => {
  const status = String(item?.status ?? 'pending')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')

  return [
    'pending',
    'in progress',
    'inprogress',
    'in process',
    'inprocess',
    'ongoing',
    'started',
    'blocked',
    'on hold',
    'onhold',
  ].includes(status)
}
