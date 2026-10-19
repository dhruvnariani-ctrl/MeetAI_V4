import { useNavigate } from 'react-router-dom'

import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'

import { EmptyPanel } from '../PageShell'
import MeetingToggles from '../MeetingToggles'
import {
  areMeetingTogglesDisabled,
  getMeetingToggleSettings,
  getStatusKey,
} from '../meetings/meetingHelpers'
import { parseDate } from '../../utils/calenderDates'
import { D, serif, time24 } from '../dashboard/dashTheme'

const ROW = {
  display: 'grid',
  gridTemplateColumns: '56px minmax(0, 1fr)',
  columnGap: { xs: 1.5, sm: 3 },
}

const STATUS = {
  Live: { label: '● Live', color: D.greenText },
  Upcoming: { label: 'Upcoming', color: D.navy },
  Done: { label: 'Done', color: D.muted },
}

const dayHeading = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

function MeetingRow({ meeting, settings, onSettingsChange }) {
  const navigate = useNavigate()
  const status = getStatusKey(meeting)
  const participants = Number(meeting.participants) || 0

  return (
    <Box sx={{ ...ROW, mt: '-1px' }}>
      <Box sx={{ pt: 1.5 }}>
        <Typography sx={{ fontSize: '.75rem', fontWeight: 600, color: D.navy }}>{time24(meeting.start)}</Typography>
        <Typography sx={{ fontSize: '.6875rem', color: D.muted }}>{time24(meeting.end)}</Typography>
      </Box>

      <Box
        sx={{
          bgcolor: status === 'Done' ? 'transparent' : '#F7F9FE',
          border: `1px solid ${D.line}`,
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
              {meeting.platform} · {participants} participant{participants === 1 ? '' : 's'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
            <Typography sx={{ fontSize: '.6875rem', fontWeight: 600, color: STATUS[status].color }}>
              {STATUS[status].label}
            </Typography>
            <ArrowOutwardRoundedIcon sx={{ fontSize: 16, color: D.muted }} />
          </Box>
        </ButtonBase>

        {/* Toggles stay outside the row button; Done meetings show them but cannot change them. */}
        <Box sx={{ px: 2, pb: 1.25 }}>
          <MeetingToggles
            meeting={meeting}
            settings={getMeetingToggleSettings(meeting, settings?.[meeting.id])}
            disabled={areMeetingTogglesDisabled(status)}
            onChange={(changes) => onSettingsChange?.(meeting.id, changes)}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default function CalendarMeetingList({ meetings = [], view, settings, onSettingsChange }) {
  if (meetings.length === 0) {
    return (
      <EmptyPanel title="No meetings here" minHeight={160}>
        Try another date, or clear your filters.
      </EmptyPanel>
    )
  }

  // Meetings arrive sorted by date then time, so grouping keeps that order.
  const groups = meetings.reduce((result, meeting) => {
    const last = result[result.length - 1]
    if (last?.date === meeting.date) last.items.push(meeting)
    else result.push({ date: meeting.date, items: [meeting] })
    return result
  }, [])

  return (
    <Box>
      {groups.map((group) => (
        <Box key={group.date} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
          {view !== 'day' && (
            <Typography component="h3" sx={{ mb: 1, fontFamily: serif, fontWeight: 400, fontSize: '1.3rem', color: D.navy }}>
              {dayHeading.format(parseDate(group.date))}
            </Typography>
          )}

          {group.items.map((meeting) => (
            <MeetingRow key={meeting.id} meeting={meeting} settings={settings} onSettingsChange={onSettingsChange} />
          ))}
        </Box>
      ))}
    </Box>
  )
}