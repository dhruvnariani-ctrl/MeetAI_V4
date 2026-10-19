import { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'

import { D, serif } from '../dashboard/dashTheme'

const STATUS = {
  completed: { label: 'Completed', color: D.muted },
  live: { label: '● Live now', color: D.greenText },
  'just-started': { label: '● Live now', color: D.greenText },
  'starting-soon': { label: 'Starting soon', color: '#8A5200' },
  upcoming: { label: 'Upcoming', color: D.navy },
}

const outlinedSx = {
  minHeight: 40,
  px: 2,
  borderRadius: '6px',
  bgcolor: '#fff',
  color: D.navy,
  borderColor: D.line,
  fontSize: '.8125rem',
  fontWeight: 500,
  textTransform: 'none',
  whiteSpace: 'nowrap',
  '&:hover': { bgcolor: '#F5F8FD', borderColor: D.navy },
  '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: 2 },
}

function openInCalendar(meeting) {
  if (Number.isNaN(new Date(meeting.start).getTime())) return

  const fmt = (value) => new Date(value).toISOString().replace(/[-:]|\.\d{3}/g, '')

  const url =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(meeting.title || 'Meeting')}` +
    `&dates=${fmt(meeting.start)}/${fmt(meeting.end)}`

  window.open(url, '_blank', 'noopener')
}

/* Title band, same treatment as the other pages. */
export default function MeetingHeader({ meeting, meetingState, dateText, timeText, durationMinutes, onBack, onViewRecording }) {
  const [copied, setCopied] = useState(false)

  const count = meeting?.participants?.length || 0
  const status = STATUS[meetingState?.type]
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
    <Box
      component="section"
      aria-label="Meeting overview"
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
        mx: { xs: -1.5, md: -2 },
        mt: { xs: -1.5, md: -2 },
        px: { xs: 1.5, md: 2 },
        py: 2.5,
        bgcolor: D.band,
      }}
    >
      <Box sx={{ minWidth: 0, flex: '1 1 360px' }}>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={onBack}
          sx={{
            mb: 1,
            p: 0,
            minWidth: 0,
            textTransform: 'none',
            fontSize: '.75rem',
            fontWeight: 500,
            color: D.navy,
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
            '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: 2 },
          }}
        >
          Back to meetings
        </Button>

        {status && (
          <Typography sx={{ fontSize: '.6875rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: status.color }}>
            {status.label}
          </Typography>
        )}

        <Typography
          component="h1"
          sx={{ mt: 0.5, fontFamily: serif, fontWeight: 400, fontSize: { xs: '1.9rem', md: '2.6rem' }, lineHeight: 1.1, color: D.navy, overflowWrap: 'anywhere' }}
        >
          {meeting.title || 'Untitled meeting'}
        </Typography>

        <Typography sx={{ mt: 0.75, fontSize: '.8125rem', color: D.text }}>
          {dateText} · {timeText} ({durationMinutes} min) · {meeting.platform ? `${meeting.platform} · ` : ''}
          {count} participant{count === 1 ? '' : 's'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button variant="outlined" startIcon={<ShareOutlinedIcon />} onClick={handleShare} sx={outlinedSx}>
          {copied ? 'Link copied' : 'Share'}
        </Button>

        <Button variant="outlined" startIcon={<CalendarMonthOutlinedIcon />} onClick={() => openInCalendar(meeting)} sx={outlinedSx}>
          Open in Calendar
        </Button>

        <Button
          variant="contained"
          disableElevation
          startIcon={<PlayArrowOutlinedIcon />}
          disabled={!recordingAvailable}
          onClick={onViewRecording}
          sx={{
            ...outlinedSx,
            bgcolor: D.navy,
            color: '#fff',
            borderColor: D.navy,
            '&:hover': { bgcolor: '#0D1C47' },
            '&.Mui-disabled': { bgcolor: D.line, color: D.muted, borderColor: D.line },
          }}
        >
          View Recording
        </Button>
      </Box>
    </Box>
  )
}