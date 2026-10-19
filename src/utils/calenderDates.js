import { getAllMeetings } from '../data/meetings'
import { formatRange } from './time'
import { filterUserMeetings } from './meetingAccess'

const pad = (value) => String(value).padStart(2, '0')

export const dateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const parseDate = (value) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function getMeetingType(start, end, now = new Date()) {
  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()
  const nowMs = new Date(now).getTime()

  if (nowMs >= endMs) return 'Done'
  if (nowMs >= startMs && nowMs < endMs) return 'Live'

  return 'Upcoming'
}

/* Calendar uses the same meetings as Dashboard,
 * filtered to meetings owned by or involving the current user.
 */
export const getCalendarMeetings = (currentUser) =>
  filterUserMeetings(
    getAllMeetings(),
    currentUser,
  ).map((meeting) => ({
    ...meeting,
    date: dateKey(new Date(meeting.start)),
    time: formatRange(
      meeting.start,
      meeting.end,
    ),
    participants: Array.isArray(
      meeting.participants,
    )
      ? meeting.participants.length
      : 0,
    type: getMeetingType(
      meeting.start,
      meeting.end,
    ),
  }))

/*
 * Turns "9:00 AM" / "12:00 PM" into minutes so times sort correctly
 * (string sorting would put 12:00 PM before 9:00 AM).
 */
export function getTimeSortValue(time) {
  if (!time) return Number.MAX_SAFE_INTEGER

  const match = time.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
  )

  if (!match) return Number.MAX_SAFE_INTEGER

  let hour = Number(match[1])
  const minute = Number(match[2])
  const period = match[3].toUpperCase()

  if (period === 'AM' && hour === 12) {
    hour = 0
  }

  if (period === 'PM' && hour !== 12) {
    hour += 12
  }

  return hour * 60 + minute
}

export function startOfWeek(date) {
  const result = new Date(date)

  result.setHours(0, 0, 0, 0)

  const day = result.getDay()

  result.setDate(
    result.getDate() +
      (day === 0 ? -6 : 1 - day),
  )

  return result
}

export function endOfWeek(date) {
  const result = startOfWeek(date)

  result.setDate(
    result.getDate() + 6,
  )

  result.setHours(
    23,
    59,
    59,
    999,
  )

  return result
}

const fmt = (options) => (date) =>
  new Intl.DateTimeFormat(
    'en-US',
    options,
  ).format(date)

export const formatDayTitle = fmt({
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

export const formatMonthTitle = fmt({
  month: 'long',
  year: 'numeric',
})

export function formatWeekTitle(date) {
  const start = fmt({
    month: 'short',
    day: 'numeric',
  })(startOfWeek(date))

  const end = fmt({
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })(endOfWeek(date))

  return `${start} – ${end}`
}

const DAY_MS =
  1000 * 60 * 60 * 24

/* Day view label: Today / Yesterday / Tomorrow / actual date. */
export function getDayDateLabel(date) {
  const today = new Date()

  today.setHours(
    0,
    0,
    0,
    0,
  )

  const target = new Date(date)

  target.setHours(
    0,
    0,
    0,
    0,
  )

  const difference = Math.round(
    (target - today) / DAY_MS,
  )

  if (difference === 0) return 'Today'
  if (difference === -1) return 'Yesterday'
  if (difference === 1) return 'Tomorrow'

  return fmt({
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })(target)
}

/* Week view label: This week / Last week / Next week / actual range. */
export function getWeekDateLabel(date) {
  const today = new Date()

  today.setHours(
    0,
    0,
    0,
    0,
  )

  const difference = Math.round(
    (startOfWeek(date) -
      startOfWeek(today)) /
      DAY_MS,
  )

  if (difference === 0) return 'This week'
  if (difference === -7) return 'Last week'
  if (difference === 7) return 'Next week'

  return formatWeekTitle(date)
}

/* Month view label: This month / Last month / Next month / actual month. */
export function getMonthDateLabel(date) {
  const today = new Date()

  const difference =
    date.getFullYear() * 12 +
    date.getMonth() -
    (today.getFullYear() * 12 +
      today.getMonth())

  if (difference === 0) return 'This month'
  if (difference === -1) return 'Last month'
  if (difference === 1) return 'Next month'

  return formatMonthTitle(date)
}