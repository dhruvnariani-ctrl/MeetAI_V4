import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'

import { SectionCard, NotReadyCard } from './ui'

/* -------------------------------------------------------------------------- */
/* Transcript                                                                 */
/* -------------------------------------------------------------------------- */

export default function TranscriptTab({
  meeting,
  meetingState,
}) {
  const available =
    meeting.transcript?.available === true

  if (!available) {
    return (
      <NotReadyCard
        icon={
          <DescriptionOutlinedIcon />
        }
        title={
          meetingState?.type === 'upcoming'
            ? 'Transcript is not available yet'
            : 'Transcript is not available'
        }
      >
        {meetingState?.type === 'upcoming'
          ? 'The transcript will be created after the meeting has taken place.'
          : 'There is no transcript available for this meeting.'}
      </NotReadyCard>
    )
  }

  const transcript =
    meeting.transcript?.text ||
    'The transcript will appear here once transcript content has been added to the meeting data.'

  return (
    <SectionCard
      icon={
        <DescriptionOutlinedIcon />
      }
      title="Transcript"
    >
      <Box
        sx={{
          bgcolor: '#f8fafc',
          border: '1px solid #e5eaf0',
          borderRadius: '12px',
          p: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.8125rem',
            lineHeight: 1.8,
            color: '#42546b',
            whiteSpace: 'pre-line',
          }}
        >
          {transcript}
        </Typography>
      </Box>
    </SectionCard>
  )
}
