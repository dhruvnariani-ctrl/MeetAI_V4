import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { D } from '../dashboard/dashTheme'
import { getInitials, getParticipantAttendance } from './utils'

const ERROR = '#B3261E'

export default function ParticipantRow({ person, attended, meeting }) {
  const info = getParticipantAttendance(meeting, person, attended)
  const color = attended === true ? D.greenText : attended === false ? ERROR : D.muted

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, px: 1.5, py: 1, bgcolor: '#F7F9FE', border: `1px solid ${D.line}`, borderRadius: '6px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
        <Box
          aria-hidden="true"
          sx={{ width: 32, height: 32, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: '50%', bgcolor: '#DCE5F7', color: D.navy, fontSize: '.6875rem', fontWeight: 700 }}
        >
          {getInitials(person.name)}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: '.8125rem', fontWeight: 600, color: D.navy }}>{person.name}</Typography>
          {person.email && (
            <Typography noWrap sx={{ fontSize: '.6875rem', color: D.muted }}>
              {person.email}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography sx={{ fontSize: '.75rem', fontWeight: 600, color }}>
          {attended === true ? 'Attended' : attended === false ? 'Did not attend' : 'Not yet started'}
        </Typography>
        {info && <Typography sx={{ fontSize: '.6875rem', color: D.muted }}>{info}</Typography>}
      </Box>
    </Box>
  )
}