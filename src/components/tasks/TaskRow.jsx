
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'

import {
  normalizeTaskPriority,
  normalizeTaskStatus,
  parseTaskDate,
} from '../../data/tasks'

import { D, linkSx } from '../dashboard/dashTheme'
import { formatDate, getDueLabel } from './taskHelpers'

const PRIORITY_COLOR = {
  High: '#B3261E',
  Medium: '#8A5200',
  Low: D.muted,
}

export const ROW = {
  display: 'block',
}

const shortDate = (value) => {
  const date = parseTaskDate(value)

  return date
    ? date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      })
    : '—'
}

const doneButtonSx = {
  minHeight: 30,
  px: 1.1,
  borderRadius: '6px',
  fontSize: '.72rem',
  fontWeight: 600,
  lineHeight: 1.2,
  textTransform: 'none',
  whiteSpace: 'nowrap',

  '&:focus-visible': {
    outline: `2px solid ${D.navy}`,
    outlineOffset: 2,
  },
}

export default function TaskRow({
  task,
  expanded,
  onToggle,
  onMarkDone,
  onOpen,
  first,
  showMarkDoneTour,
}) {
  const status = normalizeTaskStatus(task.status)
  const priority = normalizeTaskPriority(task.priority)
  const done = status === 'Done'
  const dueLabel = getDueLabel(task.due)

  return (
    <Box component="li" sx={{ ...ROW, mt: '-1px' }}>
      {/* Task card */}
      <Box
        data-tour={first ? 'task-card' : undefined}
        sx={{
          minWidth: 0,
          bgcolor: done ? '#fff' : '#F7F9FE',
          border: `1px solid ${D.line}`,
          borderLeft: `3px solid ${expanded ? D.navy : D.line}`,
          '&:hover': {
            bgcolor: '#fff',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 1,
            p: { xs: 1.25, sm: 1.5 },
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          {/* Task heading / expand */}
          <ButtonBase
            onClick={() => onToggle(task.id)}
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Hide' : 'Show'} details for ${task.title}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              flex: '1 1 auto',
              minWidth: 0,
              textAlign: 'left',
              borderRadius: '4px',
              '&:focus-visible': {
                outline: `2px solid ${D.navy}`,
                outlineOffset: 2,
              },
            }}
          >
            <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
              {/* Task title */}
              <Typography
                sx={{
                  fontSize: '.9375rem',
                  fontWeight: 500,
                  color: done ? D.muted : D.navy,
                  textDecoration: done ? 'line-through' : 'none',
                  overflowWrap: 'anywhere',
                }}
              >
                {task.title}
              </Typography>

              {/* Meeting title + date */}
              <Box
                sx={{
                  mt: 0.25,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: 'wrap',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '.6875rem',
                    color: D.muted,
                  }}
                >
                  {task.meetingTitle || 'Meeting action item'} ·
                </Typography>
                
                <Typography
                  sx={{
                    fontSize: '.6875rem',
                    fontWeight: 600,
                    color: D.muted,
                  }}
                >
                  {shortDate(task.due)}
                </Typography>
              </Box>
            </Box>

            {/* Priority and status */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexShrink: 0,
              }}
            >
              <Box
                data-tour={first ? 'task-details' : undefined}
                sx={{ textAlign: 'right' }}
              >
                <Typography
                  sx={{
                    fontSize: '.6875rem',
                    fontWeight: 700,
                    color: PRIORITY_COLOR[priority] ?? D.muted,
                  }}
                >
                  {priority} priority
                </Typography>

                <Typography
                  data-tour={first ? 'task-status' : undefined}
                  sx={{
                    fontSize: '.6875rem',
                    color:
                      status === 'Blocked'
                        ? '#B3261E'
                        : done
                          ? D.greenText
                          : D.text,
                  }}
                >
                  {status} · {dueLabel}
                </Typography>
              </Box>

              {expanded ? (
                <ExpandLessRoundedIcon
                  sx={{ fontSize: 18, color: D.muted }}
                />
              ) : (
                <ExpandMoreRoundedIcon
                  sx={{ fontSize: 18, color: D.muted }}
                />
              )}
            </Box>
          </ButtonBase>

          {/* Mark as done / Completed */}
          <Button
            data-tour={showMarkDoneTour ? 'mark-task-done' : undefined}
            variant={done ? 'contained' : 'outlined'}
            onClick={() => {
              if (!done) onMarkDone(task.id)
            }}
            sx={{
              ...doneButtonSx,
              alignSelf: { xs: 'flex-end', sm: 'center' },
              flexShrink: 0,

              ...(done
                ? {
                    bgcolor: D.green,
                    color: '#FFFFFF',
                    borderColor: D.green,
                    cursor: 'default',
                    '&:hover': {
                      bgcolor: D.green,
                      color: '#FFFFFF',
                      borderColor: D.green,
                    },
                  }
                : {
                    color: D.greenText,
                    borderColor: D.greenText,
                    '&:hover': {
                      bgcolor: '#F0F7EC',
                      borderColor: D.greenText,
                    },
                  }),
            }}
          >
            {done ? 'Completed' : 'Mark as done'}
          </Button>
        </Box>

        {/* Expanded details */}
        {expanded && (
          <Box
            sx={{
              px: 2,
              pb: 1.5,
              pt: 0.5,
              borderTop: `1px solid ${D.line}`,
              bgcolor: '#fff',
            }}
          >
            {/* Owner / Due / Open meeting */}
            <Box
              sx={{
                mt: 1,
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 2 },
                flexWrap: 'wrap',
                fontSize: '.75rem',
                color: D.text,
              }}
            >
              <Typography sx={{ fontSize: 'inherit', color: 'inherit' }}>
                <Box component="strong" sx={{ fontWeight: 600 }}>
                  Owner:
                </Box>{' '}
                {task.owner || 'Unassigned'}
              </Typography>

              <Typography sx={{ fontSize: 'inherit', color: 'inherit' }}>
                <Box component="strong" sx={{ fontWeight: 600 }}>
                  Due:
                </Box>{' '}
                {formatDate(task.due)}
              </Typography>

              {/* Open meeting aligned to the right */}
              {task.meetingId && (
                <Button
                  sx={{
                    ...linkSx,
                    ml: 'auto',
                    flexShrink: 0,
                    color: D.green,
                    fontSize: '.75rem',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#F0F7EC',
                      color: D.green,
                    },
                  }}
                  endIcon={
                    <ArrowOutwardRoundedIcon
                      sx={{ fontSize: '12px !important' }}
                    />
                  }
                  onClick={() => onOpen(task)}
                >
                  Open meeting
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
