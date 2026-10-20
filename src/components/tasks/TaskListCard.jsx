import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import PaginationBar from '../PaginationBar'
import { EmptyPanel } from '../PageShell'
import usePagination from '../../hooks/usePagination'

import { normalizeTaskStatus } from '../../data/tasks'
import { D, sectionHeadSx, titleSx } from '../dashboard/dashTheme'
import TaskRow from './TaskRow'

const TASKS_PER_PAGE = 5

export default function TaskListCard({
  containerRef,
  tasks,
  expandedTaskId,
  onToggle,
  onMarkDone,
  onOpen,
  onClearFilters,
  pageResetKey,
}) {
  const pager = usePagination(tasks, TASKS_PER_PAGE, pageResetKey)

  // One row carries every tour anchor (task card, details, status and "mark as done"), so the
  // tour expands the same row it then points at: the first task that is not done yet.
  const tourTaskId =
    pager.pageItems.find((task) => normalizeTaskStatus(task.status) !== 'Done')?.id ?? pager.pageItems[0]?.id

  return (
    <Box component="section" ref={containerRef} aria-label="My action items" sx={{ minWidth: 0, scrollMarginTop: 18 }}>
      <Box sx={{ ...sectionHeadSx, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography component="h2" sx={titleSx}>
            My action items
          </Typography>
          <Box
            component="span"
            sx={{
              minWidth: 20,
              height: 20,
              px: 0.75,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              bgcolor: '#D9E3F7',
              color: D.navy,
              fontSize: '.6875rem',
              fontWeight: 600,
            }}
          >
            {tasks.length}
          </Box>
        </Box>
        <Typography sx={{ fontSize: '.6875rem', color: D.muted }}>Select a task to see details and update its status.</Typography>
      </Box>

      {tasks.length === 0 ? (
        <EmptyPanel title="No tasks found" minHeight={140} action={<Button onClick={onClearFilters}>Clear filters</Button>}>
          Try another status or date range.
        </EmptyPanel>
      ) : (
        <>
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {pager.pageItems.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                first={task.id === tourTaskId}
                expanded={expandedTaskId === task.id}
                onToggle={onToggle}
                onMarkDone={onMarkDone}
                onOpen={onOpen}
                showMarkDoneTour={task.id === tourTaskId}
              />
            ))}
          </Box>

          <PaginationBar
            pager={pager}
            label="tasks"
            sx={{
              px: 0,
              borderColor: D.line,
              '& .MuiPaginationItem-root.Mui-selected, & .MuiPaginationItem-root.Mui-selected:hover': {
                bgcolor: D.navy,
                color: '#fff',
              },
            }}
          />
        </>
      )}
    </Box>
  )
}