import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlined'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

import { getParticipantCount, hasParticipants } from './meetingHelpers'

/*
 * Left column of a meeting row: time, title, platform and participant count.
 * `trailing` is shown at the right end of the time row (the status chip in
 * the compact Calendar side panel).
 */
export default function MeetingInfo({
  meeting,
  timeLabel,
  trailing = null,
  compact = false,
}) {
  const participantCount = getParticipantCount(meeting.participants)
  const showParticipants = hasParticipants(meeting.participants)

  return (
    <Box sx={{ minWidth: 0, gridColumn: '1 / 2' }}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          minHeight: trailing ? 24 : 'auto',
          mb: 0.6,
        }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: 'center', gap: 0.55, minWidth: 0 }}
        >
          <AccessTimeIcon sx={{ fontSize: 15, color: '#7188A0' }} />
          <Typography
            sx={{
              fontSize: '0.75rem',
              lineHeight: 1.25,
              color: '#48658d',
              fontWeight: 500,
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {timeLabel}
          </Typography>
        </Stack>

        {trailing}
      </Stack>

      <Typography
        sx={{
          fontSize: compact ? '0.9375rem' : { xs: '0.9375rem', md: '1rem' },
          lineHeight: 1.3,
          fontWeight: 700,
          color: '#0f172a',
          mb: 0.65,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {meeting.title}
      </Typography>

      <Stack
        direction="row"
        sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, rowGap: 0.5 }}
      >
        {meeting.platform && (
          <Typography
            sx={{ fontSize: '0.75rem', color: '#48658d', fontWeight: 500 }}
          >
            {meeting.platform}
          </Typography>
        )}

        {meeting.platform && showParticipants && (
          <Box
            sx={{
              width: 3,
              height: 3,
              borderRadius: '50%',
              bgcolor: '#a8b3c2',
            }}
          />
        )}

        {showParticipants && (
          <Stack
            direction="row"
            sx={{ alignItems: 'center', gap: 0.4 }}
          >
            <PeopleOutlineIcon sx={{ fontSize: 16, color: '#64748b' }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
              {participantCount}{' '}
              {participantCount === 1 ? 'participant' : 'participants'}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  )
}