import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'

import { normalizeTaskPriority, normalizeTaskStatus, parseTaskDate } from '../../data/tasks'
import { D, linkSx } from '../dashboard/dashTheme'
import { formatDate, getDueLabel } from './taskHelpers'

const PRIORITY_COLOR = { High: '#B3261E', Medium: '#8A5200', Low: D.muted }

export const ROW = {
  display: 'grid',
  gridTemplateColumns: { xs: '48px minmax(0, 1fr)', sm: '56px minmax(0, 1fr)' },
  columnGap: { xs: 1, sm: 2 },
}

const shortDate = (value) => {
  const date = parseTaskDate(value)
  return date ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'
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
  color: D.greenText,
  borderColor: D.greenText,
  '&:hover': { bgcolor: '#F0F7EC', borderColor: D.greenText },
  '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: 2 },
}

export default function TaskRow({ task, expanded, onToggle, onMarkDone, onOpen, first, showMarkDoneTour }) {
  const status = normalizeTaskStatus(task.status)
  const priority = normalizeTaskPriority(task.priority)
  const done = status === 'Done'
  const dueLabel = getDueLabel(task.due)

  return (
    <Box component="li" sx={{ ...ROW, mt: '-1px' }}>
      <Box sx={{ pt: 1.5 }}>
        <Typography sx={{ fontSize: '.75rem', fontWeight: 600, color: done ? D.muted : D.navy }}>
          {shortDate(task.due)}
        </Typography>
      </Box>

      <Box
        data-tour={first ? 'task-card' : undefined}
        sx={{
          minWidth: 0,
          bgcolor: done ? '#fff' : '#F7F9FE',
          border: `1px solid ${D.line}`,
          borderLeft: `3px solid ${expanded ? D.navy : D.line}`,
          '&:hover': { bgcolor: '#fff' },
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
              '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: 2 },
            }}
          >
            <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
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
              <Typography noWrap sx={{ mt: 0.25, fontSize: '.6875rem', color: D.muted }}>
                {task.meetingTitle || 'Meeting action item'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <Box data-tour={first ? 'task-details' : undefined} sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '.6875rem', fontWeight: 700, color: PRIORITY_COLOR[priority] ?? D.muted }}>
                  {priority} priority
                </Typography>
                <Typography
                  data-tour={first ? 'task-status' : undefined}
                  sx={{ fontSize: '.6875rem', color: status === 'Blocked' ? '#B3261E' : done ? D.greenText : D.text }}
                >
                  {status} · {dueLabel}
                </Typography>
              </Box>
              {expanded ? (
                <ExpandLessRoundedIcon sx={{ fontSize: 18, color: D.muted }} />
              ) : (
                <ExpandMoreRoundedIcon sx={{ fontSize: 18, color: D.muted }} />
              )}
            </Box>
          </ButtonBase>

          {!done && (
            <Button
              data-tour={showMarkDoneTour ? 'mark-task-done' : undefined}
              variant="outlined"
              onClick={() => onMarkDone(task.id)}
              sx={{
                ...doneButtonSx,
                alignSelf: { xs: 'flex-start', sm: 'center' },
                flexShrink: 0,
              }}
            >
              Mark as done
            </Button>
          )}
        </Box>

        {expanded && (
          <Box sx={{ px: 2, pb: 1.5, pt: 0.5, borderTop: `1px solid ${D.line}`, bgcolor: '#fff' }}>
            <Typography sx={{ mt: 1, fontSize: '.75rem', color: D.text }}>
              <Box component="strong" sx={{ fontWeight: 600 }}>Owner:</Box> {task.owner || 'Unassigned'}
              {' · '}
              <Box component="strong" sx={{ fontWeight: 600 }}>Due:</Box> {formatDate(task.due)}
            </Typography>
            <Typography sx={{ mt: 0.25, fontSize: '.75rem', color: D.muted }}>
              From: {task.meetingTitle || 'Meeting action item'}
            </Typography>

            <Box sx={{ mt: 1.25, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {task.meetingId && (
                <Button
                  sx={linkSx}
                  endIcon={<ArrowOutwardRoundedIcon sx={{ fontSize: '12px !important' }} />}
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
