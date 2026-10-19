import { getAllMeetings } from './meetings'
import { filterUserMeetings } from '../utils/meetingAccess'
import { filterUserTasks } from '../utils/taskAccess'

export const TASK_FILTERS = [
  'All',
  'Pending',
  'In Process',
  'Blocked',
  'Done',
]

export const TASK_SORT_OPTIONS = [
  'My Order',
  'Due date',
  'Priority',
]

const PRIORITY_ORDER = {
  High: 1,
  Medium: 2,
  Low: 3,
}

const norm = (value) =>
  String(value ?? '').trim().toLowerCase()

/* -------------------------------------------------------------------------- */
/* Normalizers                                                                */
/* -------------------------------------------------------------------------- */

export function normalizeTaskStatus(status) {
  const value = norm(status)

  if (['done', 'completed', 'complete'].includes(value)) {
    return 'Done'
  }

  if (value.includes('block')) return 'Blocked'

  if (value.includes('process') || value.includes('progress')) {
    return 'In Process'
  }

  return 'Pending'
}

export function normalizeTaskPriority(priority) {
  const value = norm(priority)

  if (value.includes('high')) return 'High'
  if (value.includes('low')) return 'Low'

  return 'Medium'
}

/** Parse date-only values as local dates to avoid timezone shifts. */
export function parseTaskDate(value) {
  if (!value) return null

  const date =
    value instanceof Date
      ? new Date(value)
      : /^\d{4}-\d{2}-\d{2}$/.test(String(value))
        ? new Date(`${value}T00:00:00`)
        : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

/* -------------------------------------------------------------------------- */
/* Meeting action items → tasks                                               */
/* -------------------------------------------------------------------------- */

export function getTasksFromMeetings(meetings = []) {
  return meetings.flatMap((meeting) => {
    const actionItems = Array.isArray(meeting.actionItems)
      ? meeting.actionItems
      : []

    return actionItems.map((item, index) => ({
      id: item.id ?? `${meeting.id}-task-${index}`,
      title:
        item.title ??
        item.task ??
        item.description ??
        'Untitled task',
      meeting:
        item.meeting ??
        item.meetingTitle ??
        meeting.title ??
        '',
      meetingTitle:
        item.meeting ??
        item.meetingTitle ??
        meeting.title ??
        '',
      due: item.due ?? item.dueDate ?? null,
      owner:
        item.owner ??
        item.assignee ??
        item.assignedTo ??
        'Unassigned',
      priority: normalizeTaskPriority(item.priority),
      status: normalizeTaskStatus(
        item.completed === true ? 'Done' : item.status,
      ),
      completed:
        item.completed === true ||
        normalizeTaskStatus(item.status) === 'Done',
      meetingId: item.meetingId ?? meeting.id,
    }))
  })
}

/** Get only tasks belonging to the current user. */
export function getTasksFromDashboard(currentUser) {
  const meetings = filterUserMeetings(getAllMeetings(), currentUser)
  const tasks = getTasksFromMeetings(meetings)

  return filterUserTasks(tasks, currentUser)
}

/* -------------------------------------------------------------------------- */
/* Filtering                                                                  */
/* -------------------------------------------------------------------------- */

function matchesStatus(task, filter) {
  if (!filter || filter === 'All') return true

  const status = normalizeTaskStatus(task.status)

  if (norm(filter) === 'open') {
    return status !== 'Done'
  }

  return status === normalizeTaskStatus(filter)
}

function matchesPriority(task, priority) {
  if (!priority || priority === 'All') return true

  return (
    normalizeTaskPriority(task.priority) ===
    normalizeTaskPriority(priority)
  )
}

function matchesDue(task, dueDate, today) {
  if (!dueDate || dueDate === 'default' || dueDate === 'all') {
    return true
  }

  const due = parseTaskDate(task.due)
  const done = normalizeTaskStatus(task.status) === 'Done'

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const weekEnd = new Date(today)
  weekEnd.setDate(weekEnd.getDate() + 8)

  switch (dueDate) {
    case 'today':
      return Boolean(due && due >= today && due < tomorrow)

    case 'week':
      return Boolean(due && due >= today && due < weekEnd)

    case 'overdue':
      return Boolean(due && due < today && !done)

    case 'none':
      return !due

    default:
      return true
  }
}

function matchesSearch(task, search) {
  const query = norm(search)
  if (!query) return true

  const searchableText = norm(
    [
      task.title,
      task.description,
      task.owner,
      task.priority,
      task.status,
      task.meetingTitle,
      task.meeting,
    ].join(' '),
  )

  return searchableText.includes(query)
}

/**
 * Supports both:
 * filterAndSortTasks(tasks, 'Pending', 'Priority')
 * and:
 * filterAndSortTasks(tasks, {
 *   filter: 'Open',
 *   priority: 'High',
 *   dueDate: 'week',
 *   search: 'design',
 * }, 'Due date')
 */
export function filterAndSortTasks(tasks = [], filters = {}, sortBy) {
  const options =
    typeof filters === 'string'
      ? { filter: filters }
      : filters ?? {}

  const selectedSort = sortBy ?? options.sortBy ?? 'My Order'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const result = tasks.filter(
    (task) =>
      matchesStatus(task, options.filter) &&
      matchesPriority(task, options.priority) &&
      matchesDue(task, options.dueDate, today) &&
      matchesSearch(task, options.search),
  )

  if (selectedSort === 'Priority') {
    result.sort(
      (a, b) =>
        (PRIORITY_ORDER[normalizeTaskPriority(a.priority)] ?? 99) -
        (PRIORITY_ORDER[normalizeTaskPriority(b.priority)] ?? 99),
    )
  } else if (selectedSort === 'Due date') {
    result.sort((a, b) => {
      const dateA = parseTaskDate(a.due)
      const dateB = parseTaskDate(b.due)

      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1

      return dateA - dateB
    })
  }

  return result
}