import { useMemo } from 'react'

import { filterAndSortTasks } from '../../data/tasks'
import { STATUS_FILTERS } from './taskConstants'

const countOf = (tasks, options) =>
  filterAndSortTasks(tasks, options).length

export default function useTaskStats(tasks) {
  const filterCounts = useMemo(
    () =>
      Object.fromEntries(
        STATUS_FILTERS.map((filter) => [filter, countOf(tasks, { filter })]),
      ),
    [tasks],
  )

  const highPriority = useMemo(
    () => countOf(tasks, { filter: 'Open', priority: 'High' }),
    [tasks],
  )

  const dueSoon = useMemo(
    () => countOf(tasks, { filter: 'Open', dueDate: 'week' }),
    [tasks],
  )

  /* Open tasks that are overdue or due today: priority first, then due date. */
  const todayFocus = useMemo(() => {
    const candidates = [
      ...filterAndSortTasks(tasks, { filter: 'Open', dueDate: 'overdue' }),
      ...filterAndSortTasks(tasks, { filter: 'Open', dueDate: 'today' }),
    ]

    return filterAndSortTasks(
      filterAndSortTasks(candidates, {}, 'Due date'),
      {},
      'Priority',
    ).slice(0, 3)
  }, [tasks])

  const progress = tasks.length
    ? Math.round((filterCounts.Done / tasks.length) * 100)
    : 0

  return { filterCounts, highPriority, dueSoon, todayFocus, progress }
}
