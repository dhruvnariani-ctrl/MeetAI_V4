import { useMemo } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'

import { EmptyPanel } from '../PageShell'
import PaginationBar from '../PaginationBar'
import MeetingToggles from '../MeetingToggles'
import { getMeetingToggleSettings } from '../meetings/meetingHelpers'

import usePagination from '../../hooks/usePagination'
import { parseDate } from '../../utils/calenderDates'
import { D, time24 } from '../dashboard/dashTheme'

const PAGE_SIZE = 5

// Same radius as the dashboard
const R = '12px'

function durationOf(meeting) {
  if (meeting.duration) {
    return typeof meeting.duration === 'number'
      ? `${meeting.duration} min`
      : meeting.duration
  }

  if (!meeting.start || !meeting.end) return null

  const start = new Date(meeting.start).getTime()
  const end = new Date(meeting.end).getTime()

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null

  return `${Math.max(0, Math.round((end - start) / 60000))} min`
}

function participantCountOf(meeting) {
  if (Array.isArray(meeting.participants)) {
    return meeting.participants.length
  }

  return Number(meeting.participants) || 0
}

function isDone(meeting) {
  const rawStatus = String(
    meeting?.type ?? meeting?.status ?? '',
  ).trim().toLowerCase()

  if (rawStatus === 'done' || rawStatus === 'completed') return true
  if (rawStatus === 'live' || rawStatus === 'in progress') return false

  if (meeting?.start && meeting?.end) {
    const start = new Date(meeting.start).getTime()
    const end = new Date(meeting.end).getTime()

    if (
      Number.isFinite(start) &&
      Number.isFinite(end) &&
      end >= start
    ) {
      return Date.now() >= end
    }
  }

  return false
}

function dayHeading(value) {
  const date = parseDate(value)

  const weekday = date
    .toLocaleDateString('en-IN', { weekday: 'short' })
    .toUpperCase()

  const day = date
    .toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    .toUpperCase()

  return `${weekday} · ${day}`
}

/* Date separator (same look as the dashboard) */
function DayHeader({ children }) {
  return (
    <Box
      sx={{
        px: { xs: 1.25, sm: 1.75 },
        py: 0.55,
        bgcolor: '#F5F7FB',
        borderBottom: `1px solid ${D.line}`,
      }}
    >
      <Typography
        sx={{
          fontSize: '.625rem',
          fontWeight: 700,
          letterSpacing: '.04em',
          color: D.muted,
        }}
      >
        {children}
      </Typography>
    </Box>
  )
}

/* Compact meeting row (same layout as the dashboard row) */
function MeetingRow({
  meeting,
  onOpenMeeting,
  settings = {},
  onSettingsChange,
}) {
  const completed = isDone(meeting)
  const count = participantCountOf(meeting)
  const duration = durationOf(meeting)

  const meetingSettings = getMeetingToggleSettings(
    meeting,
    settings?.[meeting.id],
  )

  const open = () => onOpenMeeting?.(meeting)

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '56px minmax(0, 1fr)',
          sm: '64px minmax(0, 1fr)',
        },
        columnGap: 1,
        alignItems: 'start',
        px: { xs: 1, sm: 1.5 },
        py: 0.75,
        bgcolor: '#FFFFFF',
        borderBottom: `1px solid ${D.line}`,
        '&:last-child': { borderBottom: 0 },
      }}
    >
      {/* Time */}
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: '.8125rem',
            fontWeight: 700,
            color: D.navy,
            lineHeight: '20px',
            whiteSpace: 'nowrap',
          }}
        >
          {time24(meeting.start)}
        </Typography>

        {duration && (
          <Typography
            sx={{
              fontSize: '.6875rem',
              color: D.muted,
              lineHeight: '17px',
              whiteSpace: 'nowrap',
            }}
          >
            {duration}
          </Typography>
        )}
      </Box>

      {/* Meeting information */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto 22px',
          columnGap: { xs: 0.75, sm: 1 },
          alignItems: 'start',
          minWidth: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <ButtonBase
            onClick={open}
            aria-label={`Open ${meeting.title || 'meeting'} details`}
            sx={{
              display: 'block',
              minWidth: 0,
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              borderRadius: R,
            }}
          >
            <Typography
              sx={{
                fontSize: '.8125rem',
                fontWeight: 600,
                color: D.navy,
                lineHeight: '20px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {completed && (
                <CheckCircleOutlineRoundedIcon
                  sx={{
                    fontSize: 14,
                    color: '#2875C7',
                    verticalAlign: 'middle',
                    mr: 0.5,
                  }}
                />
              )}
              {meeting.title || 'Untitled meeting'}
            </Typography>
          </ButtonBase>

          <Typography
            sx={{
              fontSize: '.6875rem',
              color: D.muted,
              lineHeight: '17px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {meeting.platform || 'Platform not specified'} · {count} participant
            {count === 1 ? '' : 's'}
          </Typography>
        </Box>

        {/* Toggles: always shown, disabled once the meeting is done */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            minWidth: 0,
          }}
        >
          <MeetingToggles
            compact
            disabled={completed}
            meeting={meeting}
            settings={meetingSettings}
            onChange={(changes) =>
              onSettingsChange?.(meeting.id, changes)
            }
          />
        </Box>

        <Button
          size="small"
          onClick={open}
          aria-label={`Open ${meeting.title || 'meeting'} meeting details`}
          sx={{
            minWidth: 22,
            width: 22,
            height: 22,
            p: 0,
            color: D.navy,
            borderRadius: R,
            '&:hover': { bgcolor: '#EAF0FC' },
          }}
        >
          <ArrowOutwardRoundedIcon sx={{ fontSize: 15 }} />
        </Button>
      </Box>
    </Box>
  )
}

export default function CalendarMeetingList({
  meetings = [],
  view = 'day',
  settings = {},
  onSettingsChange,
  onOpenMeeting,
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
          result.push({ date: groupDate, items: [meeting] })
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
        sx={{ m: 0, p: 0, listStyle: 'none', minWidth: 0 }}
      >
        {groups.map((group) => (
          <Box
            component="li"
            key={group.date}
            sx={{
              listStyle: 'none',
              mb: 1.5,
              '&:last-child': { mb: 0 },
              border: `1px solid ${D.line}`,
              borderRadius: R,
              overflow: 'hidden',
              bgcolor: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(20,40,80,.04)',
            }}
          >
            {group.date !== 'unknown' && (
              <DayHeader>{dayHeading(group.date)}</DayHeader>
            )}

            <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
              {group.items.map((meeting) => (
                <Box component="li" key={meeting.id} sx={{ listStyle: 'none' }}>
                  <MeetingRow
                    meeting={meeting}
                    onOpenMeeting={onOpenMeeting}
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
          '& .MuiPaginationItem-root.Mui-selected, & .MuiPaginationItem-root.Mui-selected:hover': {
            bgcolor: '#EAF0FC',
            color: D.navy,
          },
        }}
      />
    </Box>
  )
}