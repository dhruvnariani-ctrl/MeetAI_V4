
import { useMemo } from 'react'

import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'

import { EmptyPanel } from '../PageShell'
import PaginationBar from '../PaginationBar'
import MeetingToggles from '../MeetingToggles'
import { getMeetingToggleSettings } from '../meetings/meetingHelpers'

import usePagination from '../../hooks/usePagination'
import { parseDate } from '../../utils/calenderDates'
import { D, serif, time24 } from '../dashboard/dashTheme'

const PAGE_SIZE = 5

const ROW = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '48px minmax(0, 1fr)',
    sm: '64px minmax(0, 1fr)',
  },
  columnGap: { xs: 1, sm: 1.5 },
  alignItems: 'start',
}

const STATUS = {
  Live: {
    label: 'Live',
    color: D.greenText,
    background: '#EAF7EF',
  },
  Upcoming: {
    label: 'Upcoming',
    color: D.navy,
    background: '#EAF0FC',
  },
  Done: {
    label: 'Done',
    color: D.muted,
    background: '#F0F2F5',
  },
}

const dayHeading = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

function shortDate(value) {
  if (!value) return 'Date unavailable'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function durationOf(meeting) {
  if (meeting.duration) {
    return typeof meeting.duration === 'number'
      ? `${meeting.duration} min`
      : meeting.duration
  }

  if (!meeting.start || !meeting.end) return null

  const start = new Date(meeting.start).getTime()
  const end = new Date(meeting.end).getTime()

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return null
  }

  return `${Math.max(0, Math.round((end - start) / 60000))} min`
}

function participantsOf(meeting) {
  return Array.isArray(meeting.participants)
    ? meeting.participants
    : []
}

function participantCountOf(meeting) {
  if (Array.isArray(meeting.participants)) {
    return meeting.participants.length
  }

  return Number(meeting.participants) || 0
}

function participantName(participant) {
  if (typeof participant === 'string') {
    return participant
  }

  return (
    participant?.name ||
    participant?.fullName ||
    participant?.email ||
    participant?.title ||
    ''
  )
}

function statusFor(meeting) {
  const status = String(meeting.status || '').toLowerCase()

  if (status === 'live') return STATUS.Live

  if (status === 'done' || status === 'completed') {
    return STATUS.Done
  }

  return STATUS.Upcoming
}

function MeetingRow({
  meeting,
  selected = false,
  onSelectMeeting,
  settings = {},
  onSettingsChange,
}) {
  const status = statusFor(meeting)
  const participants = participantsOf(meeting)
  const participantCount = participantCountOf(meeting)
  const participantNames = participants.map(participantName).filter(Boolean)
  const duration = durationOf(meeting)

  const meetingSettings = getMeetingToggleSettings(
    meeting,
    settings?.[meeting.id],
  )

  return (
    <Box
      sx={{
        ...ROW,
        mt: 0,
        mb: 1,
        '&:last-child': { mb: 0 },
      }}
    >
      {/* Meeting time */}
      <Box sx={{ pt: 1.5, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: '.75rem',
            fontWeight: 600,
            color: D.navy,
            whiteSpace: 'nowrap',
          }}
        >
          {time24(meeting.start)}
        </Typography>

        <Typography
          sx={{
            mt: 0.25,
            fontSize: '.6875rem',
            color: D.muted,
            whiteSpace: 'nowrap',
          }}
        >
          {time24(meeting.end)}
        </Typography>
      </Box>

      {/* Meeting card */}
      <Box
        sx={{
          minWidth: 0,
          border: `1px solid ${selected ? D.navy : D.line}`,
          borderRadius: 1.5,
          bgcolor: selected ? '#EEF2FA' : '#F7F9FE',
          overflow: 'hidden',
          transition:
            'background-color 120ms ease, border-color 120ms ease',
          '&:hover': {
            bgcolor: selected ? '#EEF2FA' : '#fff',
          },
        }}
      >
        {/* Selecting the meeting does not navigate away */}
        <ButtonBase
          onClick={() => onSelectMeeting?.(meeting)}
          aria-label={`Select ${meeting.title || 'meeting'}`}
          aria-pressed={selected}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1,
            width: '100%',
            minWidth: 0,
            px: { xs: 1.25, sm: 2 },
            pt: 1.5,
            pb: 1,
            textAlign: 'left',
            '&:focus-visible': {
              outline: `2px solid ${D.navy}`,
              outlineOffset: -2,
            },
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontSize: '.9375rem',
                fontWeight: 600,
                lineHeight: 1.4,
                color: D.navy,
                overflowWrap: 'anywhere',
              }}
            >
              {meeting.title || 'Untitled meeting'}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: '.6875rem',
                color: D.muted,
                lineHeight: 1.5,
              }}
            >
              {shortDate(meeting.start || meeting.date)}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              flexShrink: 0,
              pt: 0.25,
            }}
          >
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.4,
                borderRadius: '12px',
                bgcolor: status.background,
                color: status.color,
                fontSize: '.6875rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              {status.label}
            </Box>

            <ArrowOutwardRoundedIcon
              aria-hidden="true"
              sx={{
                fontSize: 16,
                color: selected ? D.navy : D.muted,
              }}
            />
          </Box>
        </ButtonBase>

        {/* Platform, participants and MeetAI controls share a row */}
        <Box
          sx={{
            px: { xs: 1.25, sm: 2 },
            pb: 1.25,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              columnGap: 1.5,
              rowGap: 0.75,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 0.75,
                flex: '1 1 180px',
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: '.75rem',
                  color: D.text,
                  fontWeight: 600,
                  overflowWrap: 'anywhere',
                }}
              >
                {meeting.platform || 'Platform not specified'}
              </Typography>

              <Typography
                aria-hidden="true"
                sx={{ fontSize: '.75rem', color: D.muted }}
              >
                ·
              </Typography>

              <Typography
                sx={{ fontSize: '.75rem', color: D.text }}
              >
                {participantCount} participant
                {participantCount === 1 ? '' : 's'}
              </Typography>

              {duration && (
                <>
                  <Typography
                    aria-hidden="true"
                    sx={{ fontSize: '.75rem', color: D.muted }}
                  >
                    ·
                  </Typography>

                  <Typography
                    sx={{ fontSize: '.75rem', color: D.text }}
                  >
                    {duration}
                  </Typography>
                </>
              )}
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flex: '0 1 auto',
                minWidth: 0,
                '& > *': { my: 0 },
              }}
            >
              <MeetingToggles
                meeting={meeting}
                settings={meetingSettings}
                onChange={(changes) =>
                  onSettingsChange?.(meeting.id, changes)
                }
              />
            </Box>
          </Box>

          {participantNames.length > 0 && (
            <Typography
              sx={{
                mt: 0.75,
                fontSize: '.75rem',
                color: D.muted,
                lineHeight: 1.5,
                overflowWrap: 'anywhere',
              }}
            >
              {participantNames.join(', ')}
            </Typography>
          )}

          {meeting.description && (
            <Typography
              sx={{
                mt: 0.75,
                fontSize: '.75rem',
                color: D.text,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
              }}
            >
              {meeting.description}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default function CalendarMeetingList({
  meetings = [],
  view = 'day',
  selectedMeetingId,
  onSelectMeeting,
  settings = {},
  onSettingsChange,
}) {
  const pager = usePagination(
    meetings,
    PAGE_SIZE,
    `${view}|${meetings.map((meeting) => meeting.id).join(',')}`,
  )

  const groups = useMemo(
    () =>
      pager.pageItems.reduce((result, meeting) => {
        const groupDate =
          meeting.date ||
          meeting.start?.slice(0, 10) ||
          'unknown'

        const last = result[result.length - 1]

        if (last?.date === groupDate) {
          last.items.push(meeting)
        } else {
          result.push({
            date: groupDate,
            items: [meeting],
          })
        }

        return result
      }, []),
    [pager.pageItems],
  )

  if (meetings.length === 0) {
    return (
      <EmptyPanel title="No meetings here" minHeight={160}>
        Try another date, or clear your filters.
      </EmptyPanel>
    )
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <Box
        component="ul"
        aria-label="Calendar meetings"
        sx={{
          m: 0,
          p: 0,
          listStyle: 'none',
          minWidth: 0,
        }}
      >
        {groups.map((group) => (
          <Box
            component="li"
            key={group.date}
            sx={{
              listStyle: 'none',
              mb: 2,
              '&:last-child': { mb: 0 },
            }}
          >
            {view !== 'day' && group.date !== 'unknown' && (
              <Typography
                component="h3"
                sx={{
                  mb: 1,
                  fontFamily: serif,
                  fontWeight: 400,
                  fontSize: '1.2rem',
                  color: D.navy,
                }}
              >
                {dayHeading.format(parseDate(group.date))}
              </Typography>
            )}

            <Box
              component="ul"
              sx={{
                m: 0,
                p: 0,
                listStyle: 'none',
              }}
            >
              {group.items.map((meeting) => (
                <Box
                  component="li"
                  key={meeting.id}
                  sx={{
                    listStyle: 'none',
                    minWidth: 0,
                  }}
                >
                  <MeetingRow
                    meeting={meeting}
                    selected={meeting.id === selectedMeetingId}
                    onSelectMeeting={onSelectMeeting}
                    settings={settings}
                    onSettingsChange={onSettingsChange}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      <PaginationBar
        pager={pager}
        label="meetings"
        sx={{
          px: 0,
          mt: 1.5,
          borderColor: D.line,
          '& .MuiPaginationItem-root.Mui-selected, & .MuiPaginationItem-root.Mui-selected:hover':
            {
              bgcolor: D.navy,
              color: '#fff',
            },
        }}
      />
    </Box>
  )
}
