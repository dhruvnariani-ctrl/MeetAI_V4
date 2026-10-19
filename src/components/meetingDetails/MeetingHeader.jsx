import { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'

const NAVY = '#123A59'
const BLUE = '#0967B2'
const BORDER = '#DFE7EC'
const MUTED = '#5A7189'

const PILLS = {
  completed: ['Completed', '#eaf7ef', '#287a4d'],
  live: ['Live now', '#eaf7ef', '#287a4d'],
  'just-started': ['Live now', '#eaf7ef', '#287a4d'],
  'starting-soon': ['Starting soon', '#fff4dc', '#946200'],
  upcoming: ['Upcoming', '#eef4ff', '#245ea8'],
}

const buttonSx = {
  textTransform: 'none',
  fontSize: '0.75rem',
  fontWeight: 650,
  color: NAVY,
  bgcolor: '#fff',
  borderColor: BORDER,
  borderRadius: '8px',
  px: 1.5,
  height: 36,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  '& .MuiButton-startIcon': { mr: 0.75, '& svg': { fontSize: 17 } },
  '&:hover': { borderColor: BLUE, bgcolor: '#fff' },
}

function openInCalendar(meeting) {
  if (Number.isNaN(new Date(meeting.start).getTime())) return

  const fmt = (value) =>
    new Date(value).toISOString().replace(/[-:]|\.\d{3}/g, '')

  const url =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(meeting.title || 'Meeting')}` +
    `&dates=${fmt(meeting.start)}/${fmt(meeting.end)}`

  window.open(url, '_blank', 'noopener')
}

export default function MeetingHeader({
  meeting,
  meetingState,
  dateText,
  timeText,
  durationMinutes,
  onViewRecording,
}) {
  const [copied, setCopied] = useState(false)

  const participantCount = meeting?.participants?.length || 0
  const pill = PILLS[meetingState?.type]
  const recordingAvailable = meeting?.recording?.available === true

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', lg: 'center' } }}>
      {/* Left: icon, title, meta */}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '8px',
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            bgcolor: '#E6F1FA',
            color: BLUE,
            '& svg': { fontSize: 24 },
          }}
        >
          <VideocamOutlinedIcon />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              fontWeight: 750,
              lineHeight: 1.25,
              letterSpacing: '-.015em',
              color: NAVY,
              overflowWrap: 'anywhere',
            }}
          >
            {meeting.title || 'Untitled meeting'}
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', mt: 0.5, flexWrap: 'wrap', rowGap: 0.5 }}
          >
            <Meta icon={<CalendarMonthOutlinedIcon />}>{dateText}</Meta>
            <Meta icon={<AccessTimeOutlinedIcon />}>
              {timeText} ({durationMinutes} min)
            </Meta>
            <Meta icon={<GroupsOutlinedIcon />}>
              {participantCount}{' '}
              {participantCount === 1 ? 'participant' : 'participants'}
            </Meta>

            {pill && (
              <Box
                sx={{
                  px: 1,
                  py: 0.2,
                  borderRadius: '8px',
                  bgcolor: pill[1],
                  color: pill[2],
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  lineHeight: 1.6,
                }}
              >
                {pill[0]}
              </Box>
            )}
          </Stack>
        </Box>
      </Stack>

      {/* Right: actions, always one row on desktop */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          flexShrink: 0,
          flexWrap: { xs: 'wrap', lg: 'nowrap' },
          rowGap: 1,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ShareOutlinedIcon />}
          onClick={handleShare}
          sx={buttonSx}
        >
          {copied ? 'Link copied' : 'Share'}
        </Button>

        <Button
          variant="outlined"
          startIcon={<CalendarMonthOutlinedIcon />}
          onClick={() => openInCalendar(meeting)}
          sx={buttonSx}
        >
          Open in Calendar
        </Button>

        <Button
          variant="contained"
          startIcon={<PlayArrowOutlinedIcon />}
          disabled={!recordingAvailable}
          onClick={onViewRecording}
          sx={{
            ...buttonSx,
            color: '#fff',
            bgcolor: BLUE,
            borderColor: BLUE,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#075A9D', boxShadow: 'none' },
          }}
        >
          View Recording
        </Button>
      </Stack>
    </Stack>
  )
}

function Meta({ icon, children }) {
  return (
    <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center' }}>
      <Box sx={{ display: 'flex', color: MUTED, '& svg': { fontSize: 16 } }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: '0.75rem', color: NAVY, whiteSpace: 'nowrap' }}>
        {children}
      </Typography>
    </Stack>
  )
}