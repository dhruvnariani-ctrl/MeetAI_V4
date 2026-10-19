import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'

import { SectionCard, NotReadyCard } from './ui'

/* -------------------------------------------------------------------------- */
/* Recording                                                                  */
/* -------------------------------------------------------------------------- */

export default function RecordingTab({
  meeting,
  meetingState,
}) {
  const available =
    meeting.recording?.available === true

  if (!available) {
    return (
      <NotReadyCard
        icon={
          <PlayArrowOutlinedIcon />
        }
        title={
          meetingState?.type === 'upcoming'
            ? 'Recording is not available yet'
            : 'No recording available'
        }
      >
        {meetingState?.type === 'upcoming'
          ? 'The meeting has not happened yet, so there is no recording to watch.'
          : 'A recording was not saved for this meeting.'}
      </NotReadyCard>
    )
  }

  return (
    <SectionCard
      icon={<PlayArrowOutlinedIcon />}
      title="Recording"
    >
      <Box
        sx={{
          minHeight: {
            xs: 220,
            sm: 360,
          },
          borderRadius: '12px',
          bgcolor: '#172b46',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Button
          variant="contained"
          startIcon={
            <PlayArrowOutlinedIcon />
          }
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
          }}
        >
          Play recording
        </Button>
      </Box>

      <Typography
        sx={{
          mt: 1.5,
          fontSize: '0.75rem',
          color: '#66778d',
        }}
      >
        {meeting.recording.duration
          ? `Recording duration: ${meeting.recording.duration}`
          : 'Recording available'}
      </Typography>
    </SectionCard>
  )
}
