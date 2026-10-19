import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { getInitials, getParticipantAttendance } from './utils'

export default function ParticipantRow({
  person,
  attended,
  meeting,
}) {
  const initials = getInitials(
    person.name,
  )

  const attendanceInfo =
    getParticipantAttendance(
      meeting,
      person,
      attended,
    )

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        p: 1,
        borderRadius: '12px',
        bgcolor: attended
          ? '#f8fbf9'
          : '#fafafa',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            bgcolor: attended === true
              ? '#e7f4ec'
              : attended === false
                ? '#fbeaea'
                : '#eef1f4',
            color: attended === true
              ? '#287a4d'
              : attended === false
                ? '#b42318'
                : '#68778a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#24364d',
            }}
          >
            {person.name}
          </Typography>

          {person.email && (
            <Typography
              sx={{
                mt: 0.15,
                fontSize: '0.75rem',
                color: '#7b8ba1',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {person.email}
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: attended === true
              ? '#287a4d'
              : attended === false
                ? '#b42318'
                : '#68778a',
          }}
        >
          {attended === true
            ? 'Attended'
            : attended === false
              ? 'Did not attend'
              : 'Not yet started'}
        </Typography>

        {attendanceInfo && (
          <Typography
            sx={{
              mt: 0.2,
              fontSize: '0.75rem',
              color: '#7b8ba1',
            }}
          >
            {attendanceInfo}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
