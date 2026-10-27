
import { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'

import MeetingToggles from '../MeetingToggles'
import { D, serif } from '../dashboard/dashTheme'
import { formatElapsedTime, formatRemainingTime } from './utils'

const outlinedSx = {
  minHeight: 38,
  px: 1.5,
  borderRadius: '6px',
  bgcolor: '#fff',
  color: D.navy,
  borderColor: D.line,
  fontSize: '.8rem',
  fontWeight: 500,
  textTransform: 'none',
  whiteSpace: 'nowrap',
  '&:hover': {
    bgcolor: '#F5F8FD',
    borderColor: D.navy,
  },
  '&:focus-visible': {
    outline: `2px solid ${D.navy}`,
    outlineOffset: 2,
  },
}

function openInCalendar(meeting) {
  const start = new Date(meeting?.start)
  const end = new Date(meeting?.end)

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return
  }

  const formatCalendarDate = (date) =>
    date.toISOString().replace(/[-:]|\.\d{3}/g, '')

  const url =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(meeting?.title || 'Meeting')}` +
    `&dates=${formatCalendarDate(start)}/${formatCalendarDate(end)}`

  window.open(url, '_blank', 'noopener,noreferrer')
}

function getMeetingStatus(meetingState) {
  switch (meetingState?.type) {
    case 'completed':
      return {
        text: `Completed · Finished ${formatElapsedTime(
          meetingState.afterMs || 0,
        )} ago`,
        color: D.muted,
        background: '#EEF1F5',
      }

    case 'live':
    case 'just-started':
      return {
        text: `Live now · ${formatElapsedTime(
          meetingState.elapsedMs || 0,
        )} elapsed`,
        color: D.greenText,
        background: '#E7F5EC',
      }

    case 'starting-soon':
      return {
        text: `Starting soon · ${formatRemainingTime(
          meetingState.remainingMs || 0,
        )}`,
        color: '#8A5200',
        background: '#FFF2D9',
      }

    case 'upcoming':
      return {
        text: `Upcoming · Starts in ${formatRemainingTime(
          meetingState.remainingMs || 0,
        )}`,
        color: D.navy,
        background: '#E8EEF9',
      }

    default:
      return null
  }
}

function StatusPill({ text, color, background }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        width: 'fit-content',
        maxWidth: '100%',
        px: 1.2,
        py: 0.55,
        borderRadius: '20px',
        color,
        bgcolor: background,
        fontSize: '.7rem',
        fontWeight: 600,
        lineHeight: 1.4,
        overflowWrap: 'anywhere',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </Box>
  )
}

export default function MeetingHeader({
  meeting,
  meetingState,
  dateText,
  timeText,
  durationMinutes,
  settings,
  onSettingsChange,
  onBack,
  onViewRecording,
}) {
  const [copied, setCopied] = useState(false)

  const count = meeting?.participants?.length || 0
  const recordingAvailable = meeting?.recording?.available === true
  const completed = meetingState?.type === 'completed'
  const status = getMeetingStatus(meetingState)

  const meetAI = meeting?.meetAI?.attended
    ? {
        text: 'MeetAI attended',
        color: D.greenText,
        background: '#E7F5EC',
      }
    : settings?.autoJoin
      ? {
          text: 'MeetAI invited',
          color: D.navy,
          background: '#E8EEF9',
        }
      : {
          text: 'MeetAI not invited',
          color: D.muted,
          background: '#EEF1F5',
        }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access may be unavailable in this browser.
    }
  }

  return (
    <Box
      component="section"
      aria-label="Meeting header"
      sx={{
        mx: { xs: -1.5, md: -2 },
        mt: { xs: -1.5, md: -2 },
        px: { xs: 1.5, md: 2 },
        py: { xs: 2, md: 2.5 },
        bgcolor: D.band,
      }}
    >
      {/* ROW 1: Heading on the left; settings and meeting status on the right */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flex: '1 1 420px',
            minWidth: 0,
          }}
        >
          <Button
            aria-label="Back to meetings"
            onClick={onBack}
            sx={{
              p: 0.5,
              minWidth: 32,
              flexShrink: 0,
              color: D.navy,
              '&:hover': { bgcolor: 'rgba(20, 40, 80, 0.06)' },
              '&:focus-visible': {
                outline: `2px solid ${D.navy}`,
                outlineOffset: 2,
              },
            }}
          >
            <ArrowBackRoundedIcon fontSize="small" />
          </Button>

          <Typography
            component="h1"
            sx={{
              m: 0,
              fontFamily: serif,
              fontWeight: 400,
              fontSize: { xs: '1.6rem', md: '2.25rem' },
              lineHeight: 1.15,
              color: D.navy,
              overflowWrap: 'anywhere',
              minWidth: 0,
            }}
          >
            {meeting?.title || 'Untitled meeting'}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1.25,
            flexWrap: 'wrap',
            flex: '0 1 auto',
            minWidth: 0,
          }}
        >
          <MeetingToggles
            meeting={meeting}
            settings={settings}
            disabled={completed}
            onChange={onSettingsChange}
          />

          {status && (
            <StatusPill
              text={status.text}
              color={status.color}
              background={status.background}
            />
          )}

          <StatusPill
            text={meetAI.text}
            color={meetAI.color}
            background={meetAI.background}
          />
        </Box>
      </Box>

      {/* ROW 2: Meeting details on the left; action buttons on the right */}
      <Box
        sx={{
          mt: 1.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flex: '1 1 300px',
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: '.8125rem',
              lineHeight: 1.7,
              color: D.text,
              overflowWrap: 'anywhere',
            }}
          >
            {dateText} · {timeText} ({durationMinutes} min)
            {meeting?.platform ? ` · ${meeting.platform}` : ''}
            {' · '}
            {count} participant{count === 1 ? '' : 's'}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1,
            flexWrap: 'wrap',
            flex: '0 1 auto',
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ShareOutlinedIcon />}
            onClick={handleShare}
            sx={outlinedSx}
          >
            {copied ? 'Link copied' : 'Share'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<CalendarMonthOutlinedIcon />}
            onClick={() => openInCalendar(meeting)}
            sx={outlinedSx}
          >
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
              '&:hover': {
                bgcolor: '#0D1C47',
              },
              '&.Mui-disabled': {
                bgcolor: D.line,
                color: D.muted,
                borderColor: D.line,
              },
            }}
          >
            View Recording
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
