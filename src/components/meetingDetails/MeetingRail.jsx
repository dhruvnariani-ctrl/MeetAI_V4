import { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'

import MeetingToggles from '../MeetingToggles'
import { joinUrlOf } from '../dashboard/dashboardUtils'
import { D, linkSx, sectionHeadSx, serif, titleSx } from '../dashboard/dashTheme'
import ParticipantRow from './ParticipantRow'
import { formatElapsedTime, formatRemainingTime, getInitials } from './utils'

const PREVIEW = 5

const caps = { fontSize: '.625rem', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: D.muted }
const arrow = <ArrowOutwardRoundedIcon sx={{ fontSize: '12px !important' }} />

function statusLine(state) {
  switch (state?.type) {
    case 'completed':
      return { text: `Finished ${formatElapsedTime(state.afterMs || 0)} ago`, color: D.muted }
    case 'live':
    case 'just-started':
      return { text: `Live now · ${formatElapsedTime(state.elapsedMs || 0)} elapsed`, color: D.greenText }
    case 'starting-soon':
      return { text: `Starts in ${formatRemainingTime(state.remainingMs || 0)}`, color: '#8A5200' }
    case 'upcoming':
      return { text: `Starts in ${formatRemainingTime(state.remainingMs || 0)}`, color: D.navy }
    default:
      return null
  }
}

function Fact({ label, children }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.85, borderBottom: `1px solid ${D.line}` }}>
      <Typography sx={{ fontSize: '.75rem', color: D.muted, flexShrink: 0 }}>{label}</Typography>
      <Typography sx={{ fontSize: '.8125rem', fontWeight: 500, color: D.navy, textAlign: 'right', overflowWrap: 'anywhere' }}>{children}</Typography>
    </Box>
  )
}

function ContentRow({ label, available, detail, upcoming, action, onClick }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.85, borderBottom: `1px solid ${D.line}` }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '.8125rem', fontWeight: 500, color: D.navy }}>{label}</Typography>
        <Typography sx={{ fontSize: '.6875rem', color: available ? D.greenText : D.muted }}>
          {available ? detail || 'Available' : upcoming ? 'Not available yet' : 'Not available'}
        </Typography>
      </Box>

      <Button
        disabled={!available}
        onClick={onClick}
        aria-label={`${action} ${label.toLowerCase()}`}
        sx={{ ...linkSx, '&.Mui-disabled': { color: D.muted } }}
        endIcon={available ? arrow : undefined}
      >
        {action}
      </Button>
    </Box>
  )
}

/*
 * Left rail: status and MeetAI, details, participants and content shortcuts.
 * It stays beside every tab.
 */
export default function MeetingRail({ meeting, meetingState, attendance, durationMinutes, dateText, timeText, settings, onSettingsChange, onNavigate }) {
  const [open, setOpen] = useState(false)

  const status = statusLine(meetingState)
  const upcoming = meetingState?.type === 'upcoming' || meetingState?.type === 'starting-soon'
  const completed = meetingState?.type === 'completed'
  const organizer = meeting.organizer?.name || meeting.organizer
  const joinUrl = joinUrlOf(meeting)
  const people = attendance.all
  const attendedKeys = new Set(attendance.attended.map((p) => p.email || p.name))
  const notAttendedKeys = new Set(attendance.notAttended.map((p) => p.email || p.name))

  const meetAI =
    meeting?.meetAI?.attended === true
      ? { text: 'MeetAI attended', color: D.greenText }
      : settings.autoJoin
        ? { text: 'MeetAI invited', color: D.navy }
        : { text: 'MeetAI not invited', color: D.muted }

  return (
    <Box component="aside" aria-label="Meeting facts" sx={{ minWidth: 0, display: 'grid', gap: 3, alignContent: 'start', position: { lg: 'sticky' }, top: { lg: 12 } }}>
      {/* Status and MeetAI */}
      <Box component="section" aria-label="Status">
        <Box sx={sectionHeadSx}>
          <Typography component="h2" sx={titleSx}>
            Status
          </Typography>
        </Box>

        {status && (
          <Typography sx={{ mt: 1.25, fontSize: '.875rem', fontWeight: 600, color: status.color }}>{status.text}</Typography>
        )}
        <Typography sx={{ mt: 0.25, fontSize: '.8125rem', fontWeight: 500, color: meetAI.color }}>{meetAI.text}</Typography>

        <Box sx={{ mt: 1.25 }}>
          <MeetingToggles meeting={meeting} settings={settings} disabled={completed} onChange={onSettingsChange} />
        </Box>
      </Box>

      {/* Details */}
      <Box component="section" aria-label="Details">
        <Box sx={sectionHeadSx}>
          <Typography component="h2" sx={titleSx}>
            Details
          </Typography>
        </Box>

        <Box sx={{ mt: 0.5 }}>
          <Fact label="Date">{dateText}</Fact>
          <Fact label="Time">{timeText}</Fact>
          <Fact label="Duration">{durationMinutes} min</Fact>
          {meeting.platform && <Fact label="Platform">{meeting.platform}</Fact>}
          {organizer && <Fact label="Organizer">{organizer}</Fact>}
          {meeting.id && <Fact label="Meeting ID">#{meeting.id}</Fact>}
        </Box>

        {joinUrl && !completed && (
          <Button sx={{ ...linkSx, mt: 1 }} endIcon={arrow} component="a" href={joinUrl} target="_blank" rel="noopener noreferrer">
            Open meeting link
          </Button>
        )}
      </Box>

      {/* Participants */}
      <Box component="section" aria-label="Participants" data-tour="meeting-participants">
        <Box sx={{ ...sectionHeadSx, alignItems: 'center' }}>
          <Typography component="h2" sx={titleSx}>
            Participants
          </Typography>
          <Typography sx={{ fontSize: '.6875rem', color: D.muted }}>{people.length}</Typography>
        </Box>

        <Box component="ul" sx={{ m: 0, mt: 1, p: 0, listStyle: 'none' }}>
          {people.slice(0, PREVIEW).map((person, index) => (
            <Box component="li" key={person.email || person.name || index} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 0.75 }}>
              <Box
                aria-hidden="true"
                sx={{ width: 30, height: 30, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: '50%', bgcolor: '#DCE5F7', color: D.navy, fontSize: '.6875rem', fontWeight: 700 }}
              >
                {getInitials(person.name)}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ fontSize: '.8125rem', fontWeight: 500, color: D.navy }}>{person.name}</Typography>
                {(person.role || person.title || person.department) && (
                  <Typography noWrap sx={{ fontSize: '.6875rem', color: D.muted }}>
                    {person.role || person.title || person.department}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>

        {people.length > PREVIEW && (
          <Button sx={{ ...linkSx, mt: 0.5 }} endIcon={arrow} onClick={() => setOpen(true)}>
            View all {people.length} participants
          </Button>
        )}
        {people.length <= PREVIEW && people.length > 0 && (
          <Button sx={{ ...linkSx, mt: 0.5 }} endIcon={arrow} onClick={() => setOpen(true)}>
            See attendance
          </Button>
        )}
      </Box>

      {/* Content shortcuts */}
      <Box component="section" aria-label="Recording and transcript">
        <Box sx={sectionHeadSx}>
          <Typography component="h2" sx={titleSx}>
            Content
          </Typography>
        </Box>

        <Box sx={{ mt: 0.5 }}>
          <ContentRow
            label="Recording"
            available={meeting.recording?.available === true}
            detail={meeting.recording?.duration}
            upcoming={upcoming}
            action="Watch"
            onClick={() => onNavigate('recording')}
          />
          <ContentRow
            label="Transcript"
            available={meeting.transcript?.available === true}
            upcoming={upcoming}
            action="Read"
            onClick={() => onNavigate('transcript')}
          />
        </Box>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="all-participants-title"
        slotProps={{ paper: { sx: { borderRadius: '6px' } } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, bgcolor: D.band }}>
          <Typography id="all-participants-title" component="h2" sx={{ fontFamily: serif, fontWeight: 400, fontSize: '1.6rem', color: D.navy }}>
            All participants ({people.length})
          </Typography>
          <IconButton aria-label="Close" onClick={() => setOpen(false)} sx={{ color: D.navy, '&:focus-visible': { outline: `2px solid ${D.navy}` } }}>
            <CloseOutlinedIcon />
          </IconButton>
        </Box>

        <Box sx={{ p: 2.5, display: 'grid', gap: 1 }}>
          {people.map((person, index) => {
            const key = person.email || person.name || index
            return (
              <ParticipantRow
                key={key}
                person={person}
                attended={attendedKeys.has(key) ? true : notAttendedKeys.has(key) ? false : null}
                meeting={meeting}
              />
            )
          })}
        </Box>
      </Dialog>
    </Box>
  )
}