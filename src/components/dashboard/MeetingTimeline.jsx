
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import StopRoundedIcon from '@mui/icons-material/StopRounded'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'

import { EmptyPanel } from '../PageShell'
import MeetingToggles from '../MeetingToggles'
import { getMeetingToggleSettings } from '../meetings/meetingHelpers'
import {
  formatTime,
  joinUrlOf,
  participantCount,
  platformOf,
  statusOf,
} from './dashboardUtils'
import { D, linkSx, sectionHeadSx, time24, titleSx } from './dashTheme'

const ROW = {
  display: 'grid',
  gridTemplateColumns: '56px minmax(0, 1fr)',
  columnGap: { xs: 1.5, sm: 2 },
}

const capsSx = {
  fontSize: '.625rem',
  fontWeight: 600,
  letterSpacing: '.07em',
  textTransform: 'uppercase',
  color: D.muted,
}

const minutesOf = (meeting) =>
  Math.max(1, Math.round((meeting._end - meeting._start) / 60000))

const peopleText = (meeting) => {
  const count = participantCount(meeting)
  return `${count} participant${count === 1 ? '' : 's'}`
}

const openItemCount = (meeting) =>
  (meeting.actionItems ?? []).filter(
    (item) =>
      !['done', 'completed'].includes(
        String(item.status ?? '').toLowerCase(),
      ),
  ).length

const settingsFor = (meeting, all) => {
  const saved = getMeetingToggleSettings(meeting, all?.[meeting.id])

  return {
    autoJoin: saved.autoJoin === true,
    recordVideo:
      saved.autoJoin === true && saved.recordVideo === true,
  }
}

function TimeCell({ start, end }) {
  return (
    <Box sx={{ pt: 0.25 }}>
      <Typography
        sx={{
          fontSize: '.75rem',
          fontWeight: 600,
          color: D.navy,
        }}
      >
        {time24(start)}
      </Typography>

      {end && (
        <Typography sx={{ fontSize: '.6875rem', color: D.muted }}>
          {time24(end)}
        </Typography>
      )}
    </Box>
  )
}

function PastRow({ meeting }) {
  const navigate = useNavigate()

  return (
    <Box sx={ROW}>
      <Typography
        sx={{ fontSize: '.75rem', color: D.muted, py: 0.75 }}
      >
        {time24(meeting._start)}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minHeight: 32,
          pl: 1.5,
          borderLeft: `1px solid ${D.line}`,
        }}
      >
        <CheckRoundedIcon sx={{ fontSize: 14, color: D.muted }} />

        <Typography
          noWrap
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize: '.8125rem',
            color: D.text,
          }}
        >
          {meeting.title}
        </Typography>

        <Typography
          sx={{
            display: { xs: 'none', sm: 'block' },
            fontSize: '.6875rem',
            color: D.muted,
            whiteSpace: 'nowrap',
          }}
        >
          {minutesOf(meeting)} min · {platformOf(meeting)}
        </Typography>

        <Button
          sx={linkSx}
          onClick={() => navigate(`/meetings/${meeting.id}`)}
          aria-label={`View meeting summary for ${meeting.title}`}
        >
          View summary
        </Button>
      </Box>
    </Box>
  )
}

function LiveCard({ meeting, now, settings, onSettingsChange }) {
  const navigate = useNavigate()

  const elapsed = Math.max(
    0,
    Math.floor((now.getTime() - meeting._start.getTime()) / 60000),
  )

  const joinUrl = joinUrlOf(meeting)
  const recording = settings.autoJoin === true

  const join = () => {
    if (joinUrl) {
      window.open(joinUrl, '_blank', 'noopener,noreferrer')
    } else {
      navigate(`/meetings/${meeting.id}`)
    }
  }

  return (
    <Box sx={{ ...ROW, my: 1 }}>
      <TimeCell start={meeting._start} end={meeting._end} />

      <Box
        sx={{
          bgcolor: D.card,
          color: '#fff',
          borderRadius: '6px',
          px: { xs: 1.5, sm: 2 },
          py: 1.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: '.625rem',
                fontWeight: 700,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: D.live,
              }}
            >
              ● Live · {elapsed} min
            </Typography>

            <Typography
              component="h3"
              noWrap
              sx={{
                mt: 0.25,
                fontSize: '1.125rem',
                fontWeight: 600,
                lineHeight: 1.35,
                color: '#fff',
              }}
            >
              {meeting.title}
            </Typography>

            <Typography
              sx={{ mt: 0.25, fontSize: '.75rem', color: '#C3CEEE' }}
            >
              {platformOf(meeting)} · {peopleText(meeting)}
            </Typography>
          </Box>

          <Button
            variant="contained"
            disableElevation
            size="small"
            startIcon={<VideocamOutlinedIcon />}
            onClick={join}
            aria-label={`Join ${meeting.title} now`}
            sx={{
              flexShrink: 0,
              minHeight: 34,
              px: 1.5,
              borderRadius: '6px',
              fontSize: '.75rem',
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: D.green,
              color: '#fff',
              '&:hover': { bgcolor: '#2C6C16' },
            }}
          >
            Join
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            mt: 1,
            pt: 1,
            borderTop: '1px solid rgba(255,255,255,.16)',
          }}
        >
          <Typography sx={{ fontSize: '.75rem', color: '#E3E9FA' }}>
            {recording
              ? '● MeetAI is recording and taking notes'
              : 'MeetAI is not in this meeting'}
          </Typography>

          {recording && (
            <IconButton
              size="small"
              aria-label={`Remove MeetAI from ${meeting.title}`}
              onClick={() =>
                onSettingsChange?.(meeting.id, {
                  autoJoin: false,
                  recordVideo: false,
                })
              }
              sx={{
                color: '#fff',
                border: '1px solid rgba(255,255,255,.35)',
                borderRadius: '4px',
                p: 0.5,
              }}
            >
              <StopRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Box>

        <Box sx={{ mt: 1 }}>
          <MeetingToggles
            dark
            meeting={meeting}
            settings={settings}
            onChange={(changes) =>
              onSettingsChange?.(meeting.id, changes)
            }
          />
        </Box>
      </Box>
    </Box>
  )
}

function UpcomingRow({ meeting, settings, onSettingsChange, first }) {
  const navigate = useNavigate()
  const items = openItemCount(meeting)

  return (
    <Box sx={{ ...ROW, mt: first ? 0 : '-1px' }}>
      <TimeCell start={meeting._start} end={meeting._end} />

      <Box
        sx={{
          bgcolor: '#F7F9FE',
          borderTop: `1px solid ${D.line}`,
          borderBottom: `1px solid ${D.line}`,
          borderLeft: `1px solid ${D.line}`,
          px: 1.5,
          py: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              noWrap
              sx={{
                fontSize: '.8125rem',
                fontWeight: 500,
                color: D.navy,
              }}
            >
              {meeting.title}
            </Typography>

            <Typography
              sx={{ mt: 0.25, fontSize: '.6875rem', color: D.muted }}
            >
              {platformOf(meeting)} · {peopleText(meeting)}
            </Typography>
          </Box>

          <Typography
            sx={{
              flexShrink: 0,
              fontSize: '.6875rem',
              color: D.muted,
              textAlign: 'right',
            }}
          >
            {items > 0
              ? `${items} action item${items === 1 ? '' : 's'}`
              : 'No action items'}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            mt: 0.75,
          }}
        >
          <MeetingToggles
            meeting={meeting}
            settings={settings}
            onChange={(changes) =>
              onSettingsChange?.(meeting.id, changes)
            }
          />

          <Button
            size="small"
            endIcon={
              <ArrowOutwardRoundedIcon
                sx={{ fontSize: '12px !important' }}
              />
            }
            onClick={() => navigate(`/meetings/${meeting.id}`)}
            sx={{
              p: 0,
              fontSize: '.6875rem',
              color: D.navy,
              textTransform: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            View meeting details
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default function MeetingTimeline({
  meetings = [],
  now = new Date(),
  meetingSettings = {},
  onSettingsChange,
  onSchedule,
}) {
  const navigate = useNavigate()
  const [showDone, setShowDone] = useState(false)

  const past = meetings.filter(
    (meeting) => statusOf(meeting, now) === 'past',
  )

  const live = meetings.filter(
    (meeting) => statusOf(meeting, now) === 'live',
  )

  const upcoming = meetings.filter(
    (meeting) => statusOf(meeting, now) === 'upcoming',
  )

  const lastEnd = meetings.reduce(
    (latest, meeting) =>
      !latest || meeting._end > latest ? meeting._end : latest,
    null,
  )

  return (
    <Box
      component="section"
      aria-label="Today's meetings"
      data-tour="dashboard-todays-meetings"
      sx={{ minWidth: 0 }}
    >
      <Box
        sx={{
          ...sectionHeadSx,
          mb: 1.5,
          borderTop: 'none',
          pt: 0,
          mt: 0,
          gap: 1,
        }}
      >
        <Typography component="h2" sx={titleSx}>
          Today’s Schedule
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Button
            variant="text"
            size="small"
            startIcon={<CalendarMonthOutlinedIcon />}
            onClick={() => navigate('/calendar')}
            sx={{
              minHeight: 32,
              px: 1,
              color: D.navy,
              fontSize: '.75rem',
              fontWeight: 500,
              textTransform: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Open Calendar
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={onSchedule}
            sx={{
              minHeight: 32,
              px: 1.25,
              borderColor: D.line,
              color: D.navy,
              fontSize: '.75rem',
              fontWeight: 600,
              textTransform: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Schedule a Meeting
          </Button>
        </Box>
      </Box>

      {meetings.length === 0 ? (
        <EmptyPanel title="No meetings scheduled today" minHeight={120}>
          Your meetings will appear here when they are available.
        </EmptyPanel>
      ) : (
        <>
          {past.length > 0 && (
            <Box sx={{ ...ROW, alignItems: 'center', mb: 0.5 }}>
              <span />

              <ButtonBase
                onClick={() => setShowDone((value) => !value)}
                aria-expanded={showDone}
                sx={{
                  ...capsSx,
                  justifySelf: 'start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                Completed · {past.length}
                {showDone ? (
                  <ExpandLessRoundedIcon sx={{ fontSize: 16 }} />
                ) : (
                  <ExpandMoreRoundedIcon sx={{ fontSize: 16 }} />
                )}
              </ButtonBase>
            </Box>
          )}

          {showDone &&
            past.map((meeting) => (
              <PastRow key={meeting.id} meeting={meeting} />
            ))}

          {live.map((meeting) => (
            <LiveCard
              key={meeting.id}
              meeting={meeting}
              now={now}
              settings={settingsFor(meeting, meetingSettings)}
              onSettingsChange={onSettingsChange}
            />
          ))}

          {upcoming.length > 0 && (
            <>
              <Box sx={{ ...ROW, mt: 1.5, mb: 0.75 }}>
                <span />
                <Typography sx={capsSx}>
                  Coming up · {upcoming.length} meeting
                  {upcoming.length === 1 ? '' : 's'}
                </Typography>
              </Box>

              {upcoming.map((meeting, index) => (
                <UpcomingRow
                  key={meeting.id}
                  meeting={meeting}
                  first={index === 0}
                  settings={settingsFor(meeting, meetingSettings)}
                  onSettingsChange={onSettingsChange}
                />
              ))}
            </>
          )}

          {lastEnd && (
            <Box sx={{ ...ROW, mt: 1.5 }}>
              <span />
              <Typography
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  fontSize: '.6875rem',
                  color: D.muted,
                }}
              >
                <WbSunnyOutlinedIcon sx={{ fontSize: 14 }} />
                No more meetings after {formatTime(lastEnd)}.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
