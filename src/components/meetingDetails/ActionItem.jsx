import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'

import { formatDate } from '../../utils/time'
import { D } from '../dashboard/dashTheme'
import { getInitials } from './utils'

const PRIORITY_COLOR = { High: '#B3261E', Medium: '#8A5200', Low: D.muted }

/* One action item row: status icon, title, priority and due date, owner initials. */
export default function ActionItem({ item }) {
  const done = item.status === 'Done' || item.completed === true

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, px: 1.5, py: 1.25, bgcolor: done ? 'transparent' : '#F7F9FE', border: `1px solid ${D.line}`, borderRadius: '6px' }}>
      {done ? (
        <CheckCircleOutlineIcon aria-label="Done" sx={{ fontSize: 20, color: D.greenText, mt: '1px' }} />
      ) : (
        <RadioButtonUncheckedIcon aria-label="Open" sx={{ fontSize: 20, color: D.navy, mt: '1px' }} />
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '.875rem', fontWeight: 500, lineHeight: 1.4, color: done ? D.muted : D.navy, textDecoration: done ? 'line-through' : 'none', overflowWrap: 'anywhere' }}>
          {item.title}
        </Typography>

        <Typography sx={{ mt: 0.25, fontSize: '.6875rem', color: D.muted }}>
          {item.priority && (
            <Box component="span" sx={{ fontWeight: 700, color: PRIORITY_COLOR[item.priority] ?? D.muted }}>
              {item.priority} priority
            </Box>
          )}
          {item.priority && item.due && ' · '}
          {item.due && `Due ${formatDate(item.due)}`}
          {item.owner && ` · ${item.owner}`}
        </Typography>
      </Box>

      {item.owner && (
        <Box
          aria-hidden="true"
          sx={{ width: 26, height: 26, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: '50%', bgcolor: '#DCE5F7', color: D.navy, fontSize: '.625rem', fontWeight: 700 }}
        >
          {getInitials(item.owner)}
        </Box>
      )}
    </Box>
  )
}