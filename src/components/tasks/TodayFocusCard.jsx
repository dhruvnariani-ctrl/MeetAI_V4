import {
  Box,
  Button,
  Collapse,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import {
  CheckCircleOutlined,
  ChevronRight,
  WbSunnyOutlined,
} from '@mui/icons-material'

import PaginationBar from '../PaginationBar'
import usePagination from '../../hooks/usePagination'
import {
  normalizeTaskPriority,
  normalizeTaskStatus,
} from '../../data/tasks'

import {
  CARD_SX,
  COLORS,
  PRIORITY_COLORS,
} from './taskConstants'

import { getDueLabel } from './taskHelpers'
import { PriorityBadge } from './TaskBadges'
import SectionHeading from './SectionHeading'

const TASKS_PER_PAGE = 5

// Plain text links instead of bordered boxes.
const linkButtonSx = {
  minWidth: 0,
  minHeight: 0,
  p: 0,
  border: 0,
  borderRadius: 0,
  textTransform: 'none',
  fontSize: '0.75rem',
  fontWeight: 700,
  lineHeight: 1.5,
  color: COLORS.blue,
  '&:hover': {
    backgroundColor: 'transparent',
    textDecoration: 'underline',
  },
}

export default function TodayFocusCard({
  tasks,
  expandedTaskId,
  onToggle,
  onMarkDone,
  onOpen,
  onViewToday,
}) {
  const pager = usePagination(tasks, TASKS_PER_PAGE, tasks.map((task) => task.id).join(','))

  return (
    <Paper
      elevation={0}
      sx={{
        ...CARD_SX,
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ flexShrink: 0 }}>
        <SectionHeading
          icon={<WbSunnyOutlined />}
          title="Today's Focus"
          subtitle={`${tasks.length} priority ${
            tasks.length === 1 ? 'item' : 'items'
          }`}
        />

        <Divider sx={{ my: 1.4, borderColor: COLORS.border }} />
      </Box>

      {/* Task list */}
      {tasks.length === 0 ? (
        <Box
          sx={{
            py: 1.5,
            flex: 1,
          }}
        >
          <CheckCircleOutlined
            sx={{
              color: COLORS.green,
              fontSize: 25,
              mb: 0.5,
            }}
          />

          <Typography
            sx={{
              color: COLORS.text,
              fontSize: '0.75rem',
              fontWeight: 750,
            }}
          >
            You're clear for today
          </Typography>

          <Typography
            sx={{
              color: COLORS.muted,
              fontSize: '0.75rem',
              mt: 0.35,
            }}
          >
            No overdue or due-today open tasks.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack
            divider={
              <Divider
                flexItem
                sx={{ borderColor: '#EDF1F4' }}
              />
            }
            sx={{
              minWidth: 0,
            }}
          >
            {pager.pageItems.map((task) => {
              const priority = normalizeTaskPriority(task.priority)

              const priorityStyle =
                PRIORITY_COLORS[priority] ??
                PRIORITY_COLORS.Medium

              const expanded = expandedTaskId === task.id

              return (
                <Box
                  key={task.id}
                  sx={{
                    py: 1.1,
                    minWidth: 0,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={0.8} sx={{ alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        mt: 0.6,
                        borderRadius: '50%',
                        backgroundColor: priorityStyle.color,
                        flexShrink: 0,
                      }}
                    />

                    <Box
                      sx={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      {/* Task title */}
                      <Typography
                        sx={{
                          color: COLORS.navy,
                          fontSize: '0.75rem',
                          fontWeight: 750,
                          lineHeight: 1.45,
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {task.title}
                      </Typography>

                      {/* Meeting title */}
                      <Typography
                        sx={{
                          mt: 0.35,
                          color: COLORS.muted,
                          fontSize: '0.75rem',
                          lineHeight: 1.45,
                        }}
                      >
                        {task.meetingTitle ||
                          'Meeting action item'}
                      </Typography>

                      {/* Priority and due date */}
                      <Stack
                        direction="row"
                        sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 0.5, mt: 0.7,
                          width: '100%', }}
                      >
                        <PriorityBadge priority={priority} />

                        <Typography
                          sx={{
                            ml: 'auto',
                            color: COLORS.muted,
                            fontSize: '0.75rem',
                            textAlign: 'right',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {getDueLabel(task.due)}
                        </Typography>
                      </Stack>

                      {/* Details and meeting actions */}
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: 'center', justifyContent: 'flex-start', mt: 0.8,
                          width: '100%', }}
                      >
                        <Button
                          size="small"
                          disableRipple
                          onClick={() => onToggle(task.id)}
                          sx={linkButtonSx}
                        >
                          {expanded
                            ? 'Hide details'
                            : 'Details'}
                        </Button>

                        {task.meetingId && (
                          <Button
                            size="small"
                            disableRipple
                            onClick={() => onOpen(task)}
                            sx={linkButtonSx}
                          >
                            Meeting
                          </Button>
                        )}
                      </Stack>

                      {/* Expandable task details */}
                      <Collapse
                        in={expanded}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ mt: 0.75 }}>
                          <Typography
                            sx={{
                              color: COLORS.muted,
                              fontSize: '0.75rem',
                              lineHeight: 1.6,
                            }}
                          >
                            Owner: {task.owner || 'Unassigned'}
                          </Typography>

                          {normalizeTaskStatus(task.status) !==
                            'Done' && (
                            <Button
                              size="small"
                              onClick={() => onMarkDone(task.id)}
                              sx={{
                                mt: 0.5,
                                px: 0,
                                textTransform: 'none',
                                color: COLORS.green,
                                fontSize: '0.75rem',
                                fontWeight: 750,
                              }}
                            >
                              Mark as done
                            </Button>
                          )}
                        </Box>
                      </Collapse>
                    </Box>
                  </Stack>
                </Box>
              )
            })}
          </Stack>
        </Box>
      )}

      <PaginationBar pager={pager} label="tasks" sx={{ px: 0, mt: 1 }} />

      {/* Footer action */}
      <Box sx={{ mt: 'auto', flexShrink: 0 }}>
        <Divider
          sx={{
            my: 1.2,
            borderColor: COLORS.border,
          }}
        />

        <Button
          onClick={onViewToday}
          endIcon={<ChevronRight />}
          sx={{
            px: 0,
            minWidth: 0,
            textTransform: 'none',
            color: COLORS.blue,
            fontSize: '0.75rem',
            fontWeight: 800,
          }}
        >
          View today's tasks
        </Button>
      </Box>
    </Paper>
  )
}