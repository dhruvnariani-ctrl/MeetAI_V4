import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { D } from '../dashboard/dashTheme'
import { SectionCard, NotReadyCard } from './ui'

export default function TranscriptTab({ meeting, meetingState }) {
  const upcoming =
    meetingState?.type === 'upcoming' ||
    meetingState?.type === 'starting-soon'

  if (meeting.transcript?.available !== true) {
    return (
      <NotReadyCard
        title={
          upcoming
            ? 'Transcript is not available yet'
            : 'Transcript is not available'
        }
      >
        {upcoming
          ? 'The transcript will be created after the meeting has taken place.'
          : 'There is no transcript available for this meeting.'}
      </NotReadyCard>
    )
  }

  const transcript =
    meeting.transcript?.text ||
    'The transcript will appear here once transcript content has been added to the meeting data.'

  return (
    <SectionCard title="Transcript">
      <Box
        sx={{
          p: 2,
          bgcolor: '#F7F9FE',
          border: `1px solid ${D.line}`,
          borderRadius: '6px',
          minWidth: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: '.875rem',
            lineHeight: 1.8,
            color: D.text,
            whiteSpace: 'pre-line',
            overflowWrap: 'anywhere',
          }}
        >
          {transcript}
        </Typography>
      </Box>
    </SectionCard>
  )
}