import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'

import { getStatusStyle } from './meetingHelpers'

const stop = (event) => event.stopPropagation()

/*
 * Status pill. Clicking it must never open the meeting.
 * `compact` renders a small pill with a status dot, used in the
 * Calendar side panel next to the meeting time.
 */
export default function MeetingStatusChip({ status, compact = false }) {
  const statusStyle = getStatusStyle(status)

  return (
    <Box
      onClick={stop}
      onMouseDown={stop}
      onPointerDown={stop}
      sx={
        compact
          ? { flexShrink: 0, display: 'flex', alignItems: 'center' }
          : {
              gridColumn: '2 / 3',
              alignSelf: { xs: 'start', md: 'center' },
              justifySelf: 'end',
            }
      }
    >
      <Chip
        label={status}
        size="small"
        icon={
          compact ? (
            <FiberManualRecordIcon
              sx={{
                fontSize: '9px !important',
                color: `${statusStyle.color} !important`,
                ml: '8px !important',
                mr: '-2px !important',
              }}
            />
          ) : undefined
        }
        sx={{
          height: compact ? 24 : 32,
          minWidth: compact ? 0 : { xs: 88, md: 104 },
          borderRadius: '999px',
          backgroundColor: statusStyle.backgroundColor,
          color: statusStyle.color,
          fontSize: compact ? '0.75rem' : '0.75rem',
          fontWeight: 700,
          userSelect: 'none',
          '& .MuiChip-label': { px: compact ? 1 : 1.5 },
          '&:focus': { outline: 'none' },
        }}
      />
    </Box>
  )
}