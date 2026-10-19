import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'

import { D } from '../dashboard/dashTheme'
import { SectionCard, NotReadyCard } from './ui'

export default function RecordingTab({ meeting, meetingState }) {
  const upcoming = meetingState?.type === 'upcoming'

  if (meeting.recording?.available !== true) {
    return (
      <NotReadyCard title={upcoming ? 'Recording is not available yet' : 'No recording available'}>
        {upcoming
          ? 'The meeting has not happened yet, so there is no recording to watch.'
          : 'A recording was not saved for this meeting.'}
      </NotReadyCard>
    )
  }

  return (
    <SectionCard title="Recording">
      <Box sx={{ minHeight: { xs: 220, sm: 360 }, display: 'grid', placeItems: 'center', borderRadius: '6px', bgcolor: D.card }}>
        <Button
          variant="contained"
          disableElevation
          startIcon={<PlayArrowOutlinedIcon />}
          sx={{
            minHeight: 44,
            px: 3,
            borderRadius: '6px',
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: D.green,
            '&:hover': { bgcolor: '#2C6C16' },
            '&:focus-visible': { outline: '2px solid #fff', outlineOffset: 2 },
          }}
        >
          Play recording
        </Button>
      </Box>

      <Typography sx={{ mt: 1.5, fontSize: '.75rem', color: D.muted }}>
        {meeting.recording.duration ? `Recording duration: ${meeting.recording.duration}` : 'Recording available'}
      </Typography>
    </SectionCard>
  )
}