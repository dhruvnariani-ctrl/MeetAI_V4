import { Chip } from '@mui/material'

import { normalizeTaskPriority, normalizeTaskStatus } from '../../data/tasks'
import { PRIORITY_COLORS, STATUS_COLORS } from './taskConstants'

export function StatusBadge({ status }) {
  const normalized = normalizeTaskStatus(status)
  const style = STATUS_COLORS[normalized] ?? STATUS_COLORS.Pending

  return (
    <Chip
      size="small"
      label={normalized}
      sx={{
        height: 25,
        borderRadius: '8px',
        color: style.color,
        backgroundColor: style.background,
        fontSize: '0.75rem',
        fontWeight: 750,
      }}
    />
  )
}

export function PriorityBadge({ priority }) {
  const normalized = normalizeTaskPriority(priority)
  const style = PRIORITY_COLORS[normalized] ?? PRIORITY_COLORS.Medium

  return (
    <Chip
      size="small"
      label={normalized}
      sx={{
        height: 23,
        borderRadius: '8px',
        color: style.color,
        backgroundColor: style.background,
        fontSize: '0.75rem',
        fontWeight: 750,
      }}
    />
  )
}
