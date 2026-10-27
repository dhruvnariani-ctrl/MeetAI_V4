import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import PaginationBar from '../PaginationBar'
import { EmptyPanel } from '../PageShell'
import usePagination from '../../hooks/usePagination'

import { normalizeTaskStatus } from '../../data/tasks'
import { D, sectionHeadSx, titleSx } from '../dashboard/dashTheme'
import TaskRow from './TaskRow'
import TaskToolbar from './TaskToolbar'

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
  filter,
  onFilterChange,
  filterCounts,
  dueDate,
  onDueDateChange,
  sortBy,
  onSortByChange,
}) {
  const pager = usePagination(tasks, TASKS_PER_PAGE, pageResetKey)

  // Keep the tour anchors on one actionable, open task when possible.
  const tourTaskId =
    pager.pageItems.find((task) => normalizeTaskStatus(task.status) !== 'Done')?.id ??
    pager.pageItems[0]?.id

  return (
    <Box
      component="section"
      ref={containerRef}
      aria-label="My action items"
      sx={{
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(160px, .7fr) minmax(0, 1.8fr)' },
          alignItems: 'start',
          gap: { xs: 1.5, lg: 2.5 },
          p: { xs: 1.5, sm: 2, lg: 0 },
        }}
      >
        <Box sx={{ minWidth: 0,p:0 }}>
          <Box sx={{ ...sectionHeadSx, mb: 0.5, alignItems: 'center',borderTop:'none', mt:0, pt:0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
              <Typography component="h2" sx={titleSx}>
                My action items
              </Typography>
            </Box>
          </Box>
          <Typography sx={{ fontSize: '.6875rem', lineHeight: 1.45, color: D.muted }}>
            Select a task to see its details.
          </Typography>
        </Box>

        <TaskToolbar
          filter={filter}
          onFilterChange={onFilterChange}
          filterCounts={filterCounts}
          dueDate={dueDate}
          onDueDateChange={onDueDateChange}
          sortBy={sortBy}
          onSortByChange={onSortByChange}
        />
      </Box>

      {tasks.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <EmptyPanel
            title="No tasks found"
            minHeight={140}
            action={<Button onClick={onClearFilters}>Clear filters</Button>}
          >
            Try another status or date range.
          </EmptyPanel>
        </Box>
      ) : (
        <Box sx={{ px: { xs: 1.25, sm: 2 }, pt: 1.5, pb: 0.5 }}>
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
        </Box>
      )}
    </Box>
  )
}
