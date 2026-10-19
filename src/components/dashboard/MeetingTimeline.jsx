import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import StopRoundedIcon from '@mui/icons-material/StopRounded'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'

import { EmptyPanel } from '../PageShell'
import MeetingToggles from '../MeetingToggles'
import { getMeetingToggleSettings } from '../meetings/meetingHelpers'
import { formatTime, joinUrlOf, participantCount, platformOf, statusOf } from './dashboardUtils'
import { D, linkSx, sectionHeadSx, time24, titleSx } from './dashTheme'

const ROW = {
  display: 'grid',
  gridTemplateColumns: '56px minmax(0, 1fr)',
  columnGap: { xs: 1.5, sm: 3 },
}

const capsSx = {
  fontSize: '.625rem',
  fontWeight: 600,
  letterSpacing: '.07em',
  textTransform: 'uppercase',
  color: D.muted,
}

const WAVE = [6, 10, 16, 8, 14, 18, 9, 12, 17, 7, 13, 10, 15, 8]

const minutesOf = (meeting) => Math.max(1, Math.round((meeting._end - meeting._start) / 60000))

const periodOf = (date) => (date.getHours() < 12 ? 'Morning' : date.getHours() < 17 ? 'Afternoon' : 'Evening')

const peopleText = (meeting) => {
  const count = participantCount(meeting)
  return `${count} participant${count === 1 ? '' : 's'}`
}

const openItemCount = (meeting) =>
  (meeting.actionItems ?? []).filter(
    (item) => !['done', 'completed'].includes(String(item.status ?? '').toLowerCase()),
  ).length

// Saved value first, then the meeting's own MeetAI default. Video recording needs MeetAI on.
const settingsFor = (meeting, all) => {
  const saved = getMeetingToggleSettings(meeting, all?.[meeting.id])
  return { autoJoin: saved.autoJoin === true, recordVideo: saved.autoJoin === true && saved.recordVideo === true }
}

function TimeCell({ start, end }) {
  return (
    <Box sx={{ pt: 0.25 }}>
      <Typography sx={{ fontSize: '.75rem', fontWeight: 600, color: D.navy }}>{time24(start)}</Typography>
      {end && <Typography sx={{ fontSize: '.6875rem', color: D.muted }}>{time24(end)}</Typography>}
    </Box>
  )
}

function PastRow({ meeting }) {
  const navigate = useNavigate()

  return (
    <Box sx={ROW}>
      <Typography sx={{ fontSize: '.75rem', color: D.muted, py: 0.75 }}>{time24(meeting._start)}</Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minHeight: 34,
          pl: 2,
          borderLeft: `1px solid ${D.line}`,
        }}
      >
        <CheckRoundedIcon sx={{ fontSize: 14, color: D.muted }} />
        <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: '.8125rem', color: D.text }}>
          {meeting.title}
        </Typography>
        <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '.6875rem', color: D.muted, whiteSpace: 'nowrap' }}>
          {minutesOf(meeting)} min · {platformOf(meeting)}
        </Typography>
        <Button
          sx={linkSx}
          endIcon={<ArrowOutwardRoundedIcon sx={{ fontSize: '12px !important' }} />}
          aria-label={`Notes for ${meeting.title}`}
          onClick={() => navigate(`/meetings/${meeting.id}`)}
        >
          Notes
        </Button>
      </Box>
    </Box>
  )
}

function NowLine({ now }) {
  return (
    <Box sx={{ ...ROW, alignItems: 'center', my: 1.25 }} aria-hidden="true">
      <Typography sx={{ fontSize: '.6875rem', fontWeight: 700, color: D.greenText, whiteSpace: 'nowrap' }}>
        {formatTime(now)}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: D.greenText }} />
        <Box sx={{ flex: 1, height: '1px', bgcolor: D.greenText, opacity: 0.5 }} />
      </Box>
    </Box>
  )
}

function LiveCard({ meeting, now, settings, onSettingsChange }) {
  const navigate = useNavigate()
  const elapsed = Math.max(0, Math.floor((now - meeting._start) / 60000))
  const joinUrl = joinUrlOf(meeting)
  const recording = settings.autoJoin === true

  const join = () =>
    joinUrl ? window.open(joinUrl, '_blank', 'noopener,noreferrer') : navigate(`/meetings/${meeting.id}`)

  return (
    <Box sx={{ ...ROW, my: 1 }}>
      <TimeCell start={meeting._start} end={meeting._end} />

      <Box sx={{ bgcolor: D.card, color: '#fff', borderRadius: '6px', p: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '.625rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: D.live }}>
              ● Happening now · {elapsed} min elapsed
            </Typography>
            <Typography component="h3" sx={{ ...titleSx, mt: 0.5, color: '#fff', fontSize: '1.75rem' }}>
              {meeting.title}
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: '.75rem', color: '#C3CEEE' }}>
              {platformOf(meeting)} · {peopleText(meeting)}
            </Typography>
          </Box>

          <Button
            variant="contained"
            disableElevation
            startIcon={<VideocamOutlinedIcon />}
            onClick={join}
            aria-label={`Join ${meeting.title} now`}
            sx={{
              minHeight: 40,
              px: 2.5,
              borderRadius: '6px',
              fontSize: '.8125rem',
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: D.green,
              color: '#fff',
              '&:hover': { bgcolor: '#2C6C16' },
              '&:focus-visible': { outline: '2px solid #fff', outlineOffset: 2 },
            }}
          >
            Join Now
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            my: 2,
            py: 1.25,
            borderTop: '1px solid rgba(255,255,255,.16)',
            borderBottom: '1px solid rgba(255,255,255,.16)',
          }}
        >
          {recording && (
            <Box aria-hidden="true" sx={{ display: 'flex', alignItems: 'center', gap: '2px', height: 20 }}>
              {WAVE.map((height, index) => (
                <Box key={index} sx={{ width: 2, height, borderRadius: 1, bgcolor: D.live }} />
              ))}
            </Box>
          )}
          <Typography sx={{ flex: 1, fontSize: '.75rem', color: '#E3E9FA' }}>
            {recording ? 'MeetAI is recording and taking notes' : 'MeetAI is not in this meeting'}
          </Typography>
          {recording && (
            <IconButton
              size="small"
              aria-label={`Remove MeetAI from ${meeting.title}`}
              onClick={() => onSettingsChange?.(meeting.id, { autoJoin: false, recordVideo: false })}
              sx={{ color: '#fff', border: '1px solid rgba(255,255,255,.4)', borderRadius: '4px', '&:focus-visible': { outline: '2px solid #fff' } }}
            >
              <StopRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <MeetingToggles
            dark
            meeting={meeting}
            settings={settings}
            onChange={(changes) => onSettingsChange?.(meeting.id, changes)}
          />
          <Button
            sx={{ ...linkSx, color: '#fff', '&:focus-visible': { outline: '2px solid #fff', outlineOffset: 2 } }}
            endIcon={<ArrowOutwardRoundedIcon sx={{ fontSize: '12px !important' }} />}
            onClick={() => navigate(`/meetings/${meeting.id}`)}
          >
            Meeting details
          </Button>
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
          '&:hover': { bgcolor: '#fff' },
        }}
      >
        <ButtonBase
          onClick={() => navigate(`/meetings/${meeting.id}`)}
          aria-label={`Open details for ${meeting.title}`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            width: '100%',
            px: 2,
            pt: 1.5,
            pb: 0.75,
            textAlign: 'left',
            '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: -2 },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: '.9375rem', fontWeight: 500, color: D.navy }}>
              {meeting.title}
            </Typography>
            <Typography sx={{ mt: 0.25, fontSize: '.6875rem', color: D.muted }}>
              {platformOf(meeting)} · {peopleText(meeting)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
            <Typography sx={{ fontSize: '.6875rem', color: D.text }}>
              {items > 0 ? `${items} item${items === 1 ? '' : 's'} to prepare` : 'Nothing to prepare'}
            </Typography>
            <ArrowOutwardRoundedIcon sx={{ fontSize: 16, color: D.muted }} />
          </Box>
        </ButtonBase>

        {/* Toggles sit outside the row button so no control is nested inside another. */}
        <Box sx={{ px: 2, pb: 1.25 }}>
          <MeetingToggles
            meeting={meeting}
            settings={settings}
            onChange={(changes) => onSettingsChange?.(meeting.id, changes)}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default function MeetingTimeline({ meetings = [], now, meetingSettings = {}, onSettingsChange }) {
  const navigate = useNavigate()
  const [showDone, setShowDone] = useState(false)

  const past = meetings.filter((meeting) => statusOf(meeting, now) === 'past')
  const live = meetings.filter((meeting) => statusOf(meeting, now) === 'live')
  const upcoming = meetings.filter((meeting) => statusOf(meeting, now) === 'upcoming')
  const lastEnd = meetings.reduce((latest, meeting) => (meeting._end > latest ? meeting._end : latest), null)

  return (
    <Box component="section" aria-label="Today's meetings" data-tour="dashboard-todays-meetings" sx={{ minWidth: 0 }}>
      <Box sx={{ ...sectionHeadSx, mb: 2 }}>
        <Typography component="h2" sx={titleSx}>
          Your Meetings Today
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            sx={linkSx}
            endIcon={<ArrowOutwardRoundedIcon sx={{ fontSize: '12px !important' }} />}
            onClick={() => navigate('/calendar')}
          >
            Open Calendar
          </Button>

          {/* ponytail: the dashboard only shows today; arrows jump to the Calendar page for other days */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size="small" aria-label="Previous day, open Calendar" onClick={() => navigate('/calendar')} sx={{ color: D.navy }}>
              <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography sx={{ fontSize: '.6875rem', fontWeight: 500, color: D.navy }}>Today</Typography>
            <IconButton size="small" aria-label="Next day, open Calendar" onClick={() => navigate('/calendar')} sx={{ color: D.navy }}>
              <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {meetings.length === 0 ? (
        <EmptyPanel title="No meetings scheduled today" minHeight={140}>
          Your meetings will appear here when they are available.
        </EmptyPanel>
      ) : (
        <>
          <Box sx={{ ...ROW, alignItems: 'center', mb: 0.5 }}>
            <Typography sx={capsSx}>{periodOf(meetings[0]._start)}</Typography>
            {past.length > 0 && (
              <ButtonBase
                onClick={() => setShowDone((value) => !value)}
                aria-expanded={showDone}
                aria-label={`${showDone ? 'Hide' : 'Show'} ${past.length} done meetings`}
                sx={{ ...capsSx, justifySelf: 'start', gap: 0.5, '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: 2 } }}
              >
                Done · {past.length} meeting{past.length === 1 ? '' : 's'}
                {showDone ? <ExpandLessRoundedIcon sx={{ fontSize: 16 }} /> : <ExpandMoreRoundedIcon sx={{ fontSize: 16 }} />}
              </ButtonBase>
            )}
          </Box>

          {showDone && past.map((meeting) => <PastRow key={meeting.id} meeting={meeting} />)}

          <NowLine now={now} />

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
              <Box sx={{ ...ROW, mt: 2.5, mb: 1 }}>
                <span />
                <Typography sx={capsSx}>
                  Coming up · {upcoming.length} meeting{upcoming.length === 1 ? '' : 's'}
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
            <Box sx={{ ...ROW, mt: 2 }}>
              <span />
              <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '.6875rem', color: D.muted }}>
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