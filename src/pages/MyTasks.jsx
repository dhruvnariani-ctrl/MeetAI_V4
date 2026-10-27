import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Box from '@mui/material/Box'

import usePageTitle from '../hooks/usePageTitle'
import useCurrentUser from '../hooks/useCurrentUser'

import {
  filterAndSortTasks,
  getTasksFromDashboard,
  normalizeTaskStatus,
} from '../data/tasks'
import { updateMeetingActionItemStatus } from '../data/meetings'

import { D } from '../components/dashboard/dashTheme'
import useTaskStats from '../components/tasks/useTaskStats'
import TaskListCard from '../components/tasks/TaskListCard'
import TaskSidePanels from '../components/tasks/TaskSidePanels'
import ConfirmMarkDoneDialog from '../components/tasks/ConfirmMarkDoneDialog'

export default function MyTasks() {
  usePageTitle('My Tasks')

  const currentUser = useCurrentUser()
  const navigate = useNavigate()
  const listRef = useRef(null)

  const [tasks, setTasks] = useState(() => getTasksFromDashboard(currentUser))
  const [filter, setFilter] = useState('Open')
  const [sortBy, setSortBy] = useState('My Order')
  const [dueDate, setDueDate] = useState('default')
  const [expandedTaskId, setExpandedTaskId] = useState(null)
  const [taskToConfirm, setTaskToConfirm] = useState(null)

  const filteredTasks = useMemo(
    () => filterAndSortTasks(tasks, { filter, dueDate }, sortBy),
    [tasks, filter, dueDate, sortBy],
  )

  const { filterCounts, highPriority, dueSoon, todayFocus, progress } = useTaskStats(tasks)

  const handleToggle = (taskId) => {
    setExpandedTaskId((current) => (current === taskId ? null : taskId))
  }

  const handleMarkDone = (taskId) => {
    const task = tasks.find((item) => item.id === taskId)

    if (!task?.meetingId || normalizeTaskStatus(task.status) === 'Done') return
    setTaskToConfirm(task)
  }

  const handleConfirmMarkDone = () => {
    if (!taskToConfirm?.meetingId) return

    updateMeetingActionItemStatus(taskToConfirm.meetingId, taskToConfirm.id, 'Done')

    setTasks((current) =>
      current.map((item) =>
        item.id === taskToConfirm.id ? { ...item, status: 'Done', completed: true } : item,
      ),
    )

    setTaskToConfirm(null)
  }

  const handleOpenMeeting = (task) => {
    if (task.meetingId) navigate(`/meetings/${task.meetingId}`)
  }

  const showOpenTasks = ({ dueDate: nextDueDate, sortBy: nextSortBy }) => {
    setFilter('Open')
    setDueDate(nextDueDate)
    setSortBy(nextSortBy)
    setExpandedTaskId(null)

    requestAnimationFrame(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleClearFilters = () => {
    setFilter('All')
    setDueDate('default')
  }

  return (
    <>
      <Box sx={{ width: '100%', minWidth: 0, color: D.text }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              lg: 'minmax(0, 1.8fr) minmax(280px, 1fr)',
            },
            columnGap: { xs: 0, lg: 2.5 },
            rowGap: { xs: 2, lg: 2.5 },
            alignItems: 'start',
            pt: 0,
          }}
        >
          <Box ref={listRef} sx={{ minWidth: 0, scrollMarginTop: 16 }}>
            <TaskListCard
              tasks={filteredTasks}
              expandedTaskId={expandedTaskId}
              onToggle={handleToggle}
              onMarkDone={handleMarkDone}
              onOpen={handleOpenMeeting}
              onClearFilters={handleClearFilters}
              pageResetKey={[filter, dueDate, sortBy].join('|')}
              filter={filter}
              onFilterChange={setFilter}
              filterCounts={filterCounts}
              dueDate={dueDate}
              onDueDateChange={setDueDate}
              sortBy={sortBy}
              onSortByChange={setSortBy}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <TaskSidePanels
              focusTasks={todayFocus}
              filterCounts={filterCounts}
              progress={progress}
              highPriority={highPriority}
              dueSoon={dueSoon}
              onMarkDone={handleMarkDone}
              onViewToday={() => showOpenTasks({ dueDate: 'today', sortBy: 'Priority' })}
              onViewAll={() => showOpenTasks({ dueDate: 'default', sortBy: 'Due date' })}
            />
          </Box>
        </Box>
      </Box>

      <ConfirmMarkDoneDialog
        open={Boolean(taskToConfirm)}
        taskTitle={taskToConfirm?.title ?? ''}
        onCancel={() => setTaskToConfirm(null)}
        onConfirm={handleConfirmMarkDone}
      />
    </>
  )
}
