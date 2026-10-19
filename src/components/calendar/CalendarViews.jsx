import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'

import { EmptyPanel } from '../PageShell'
import MeetingToggles from '../MeetingToggles'
import { areMeetingTogglesDisabled, getMeetingToggleSettings, getStatusKey } from '../meetings/meetingHelpers'
import { dateKey, startOfWeek } from '../../utils/calenderDates'
import { D, serif, sectionHeadSx, time24, titleSx } from '../dashboard/dashTheme'

/* Status colours: Live green, Upcoming navy, Done grey. */
const STATUS = {
  Live: { color: D.greenText, bg: '#EAF5E4', label: 'Live' },
  Upcoming: { color: D.navy, bg: '#F0F4FC', label: 'Upcoming' },
  Done: { color: D.muted, bg: '#F5F7FB', label: 'Done' },
}

const longDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
const shortWeekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' })

const focusRing = { outline: `2px solid ${D.navy}`, outlineOffset: 2 }

const daysOfWeek = (date) => {
  const start = startOfWeek(date)
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}

const countText = (count) => (count ? `${count} meeting${count === 1 ? '' : 's'}` : 'Free')

/* ---------- Seven-day strip (Day and Week views) ---------- */
export function DayStrip({ selectedDate, meetings, onOpenDay }) {
  const perDay = meetings.reduce((map, meeting) => ({ ...map, [meeting.date]: (map[meeting.date] ?? 0) + 1 }), {})
  const selectedKey = dateKey(selectedDate)
  const todayKey = dateKey(new Date())

  return (
    <Box
      data-tour="calendar-days"
      role="group"
      aria-label="Days of this week"
      sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: { xs: 0.5, sm: 1 } }}
    >
      {daysOfWeek(selectedDate).map((day) => {
        const key = dateKey(day)
        const count = perDay[key] ?? 0
        const selected = key === selectedKey

        return (
          <ButtonBase
            key={key}
            onClick={() => onOpenDay(day)}
            aria-pressed={selected}
            aria-current={key === todayKey ? 'date' : undefined}
            aria-label={`${longDate.format(day)}, ${countText(count)}`}
            sx={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 0.25,
              px: { xs: 0.75, sm: 1.5 },
              py: 1.25,
              borderRadius: '6px',
              textAlign: 'left',
              color: selected ? '#fff' : D.navy,
              bgcolor: selected ? D.navy : '#fff',
              border: `1px solid ${selected ? D.navy : key === todayKey ? D.navy : D.line}`,
              '&:hover': { bgcolor: selected ? D.navy : '#E4EBF8' },
              '&:focus-visible': focusRing,
            }}
          >
            <Typography sx={{ fontSize: '.625rem', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: selected ? '#C3CEEE' : D.muted }}>
              {shortWeekday.format(day)}
            </Typography>
            <Typography sx={{ fontFamily: serif, fontSize: { xs: '1.4rem', sm: '1.9rem' }, lineHeight: 1, color: 'inherit' }}>
              {day.getDate()}
            </Typography>
            <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '.6875rem', color: selected ? '#C3CEEE' : count ? D.greenText : D.muted }}>
              {countText(count)}
            </Typography>
          </ButtonBase>
        )
      })}
    </Box>
  )
}

/* ---------- Day view: hour-by-hour timeline ---------- */
const PX = 1.5 // pixels per minute
const MIN_BLOCK = 46

const minutesOf = (value) => {
  const date = new Date(value)
  return date.getHours() * 60 + date.getMinutes()
}

// Overlapping meetings share the width: each overlapping group gets its own set of lanes.
function placeBlocks(meetings) {
  const items = meetings.map((meeting) => ({ meeting, s: minutesOf(meeting.start), e: minutesOf(meeting.end) }))
  items.sort((a, b) => a.s - b.s || b.e - a.e)

  const placed = []
  let group = []
  let laneEnds = []
  let groupEnd = -1

  const flush = () => {
    const lanes = Math.max(1, laneEnds.length)
    group.forEach((item) => placed.push({ ...item, lanes }))
    group = []
    laneEnds = []
    groupEnd = -1
  }

  items.forEach((item) => {
    if (group.length && item.s >= groupEnd) flush()

    let lane = laneEnds.findIndex((end) => end <= item.s)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = item.e

    group.push({ ...item, lane })
    groupEnd = Math.max(groupEnd, item.e)
  })
  flush()

  return placed
}

export function DayTimeline({ meetings, selectedId, onSelect, now, isToday }) {
  if (meetings.length === 0) {
    return (
      <EmptyPanel title="Nothing scheduled" minHeight={160}>
        This day is free. Try another day or clear your filters.
      </EmptyPanel>
    )
  }

  const blocks = placeBlocks(meetings)
  const firstHour = Math.min(8, Math.floor(Math.min(...blocks.map((b) => b.s)) / 60))
  const lastHour = Math.min(24, Math.max(18, Math.ceil(Math.max(...blocks.map((b) => b.e)) / 60)))
  const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, index) => firstHour + index)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const showNow = isToday && nowMinutes >= firstHour * 60 && nowMinutes <= lastHour * 60

  return (
    <Box sx={{ position: 'relative', height: (lastHour - firstHour) * 60 * PX + 1 }}>
      {hours.map((hour) => (
        <Box key={hour} aria-hidden="true" sx={{ position: 'absolute', left: 0, right: 0, top: (hour - firstHour) * 60 * PX, borderTop: `1px solid ${D.line}` }}>
          <Typography sx={{ position: 'absolute', top: -9, left: 0, width: 44, pr: 1, bgcolor: D.page, fontSize: '.6875rem', color: D.muted }}>
            {String(hour).padStart(2, '0')}:00
          </Typography>
        </Box>
      ))}

      <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: 56, right: 0 }}>
        {blocks.map(({ meeting, s, e, lane, lanes }) => {
          const status = getStatusKey(meeting)
          const look = STATUS[status]
          const selected = meeting.id === selectedId
          const height = Math.max((e - s) * PX, MIN_BLOCK)

          return (
            <ButtonBase
              key={meeting.id}
              onClick={() => onSelect(meeting.id)}
              aria-pressed={selected}
              aria-label={`${meeting.title}, ${time24(meeting.start)} to ${time24(meeting.end)}, ${look.label}`}
              sx={{
                position: 'absolute',
                top: (s - firstHour * 60) * PX,
                height: height - 2,
                left: `${(lane / lanes) * 100}%`,
                width: `calc(${100 / lanes}% - 4px)`,
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                px: 1.25,
                py: 0.75,
                overflow: 'hidden',
                textAlign: 'left',
                bgcolor: look.bg,
                borderLeft: `4px solid ${look.color}`,
                borderTop: `1px solid ${selected ? D.navy : D.line}`,
                borderRight: `1px solid ${selected ? D.navy : D.line}`,
                borderBottom: `1px solid ${selected ? D.navy : D.line}`,
                borderRadius: '4px',
                boxShadow: selected ? `0 0 0 1px ${D.navy}` : 'none',
                '&:hover': { bgcolor: '#fff' },
                '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: 1 },
              }}
            >
              <Typography noWrap sx={{ width: '100%', fontSize: '.875rem', fontWeight: 600, color: status === 'Done' ? D.text : D.navy }}>
                {meeting.title}
              </Typography>
              <Typography noWrap sx={{ width: '100%', fontSize: '.6875rem', color: D.muted }}>
                {time24(meeting.start)}–{time24(meeting.end)} · {meeting.platform}
              </Typography>
              {height >= 80 && (
                <Typography sx={{ mt: 0.5, fontSize: '.6875rem', fontWeight: 600, color: look.color }}>
                  {status === 'Live' ? '● Live' : look.label}
                </Typography>
              )}
            </ButtonBase>
          )
        })}

        {showNow && (
          <Box aria-hidden="true" sx={{ position: 'absolute', left: -6, right: 0, top: (nowMinutes - firstHour * 60) * PX, display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: D.greenText }} />
            <Box sx={{ flex: 1, height: '1px', bgcolor: D.greenText }} />
          </Box>
        )}
      </Box>
    </Box>
  )
}

/* ---------- Selected meeting (Day view) ---------- */
export function MeetingPanel({ meeting, settings, onSettingsChange, onOpen }) {
  if (!meeting) return null

  const status = getStatusKey(meeting)
  const look = STATUS[status]
  const participants = Number(meeting.participants) || 0

  return (
    <Box component="section" aria-label="Selected meeting" sx={{ minWidth: 0, position: { lg: 'sticky' }, top: { lg: 12 } }}>
      <Box sx={sectionHeadSx}>
        <Typography sx={{ fontSize: '.625rem', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: D.muted }}>
          Selected meeting
        </Typography>
        <Typography sx={{ fontSize: '.6875rem', fontWeight: 700, color: look.color }}>{status === 'Live' ? '● Live' : look.label}</Typography>
      </Box>

      <Typography component="h2" sx={{ ...titleSx, mt: 1.5, fontSize: '1.8rem', overflowWrap: 'anywhere' }}>
        {meeting.title}
      </Typography>
      <Typography sx={{ mt: 0.75, fontSize: '.75rem', color: D.text }}>
        {time24(meeting.start)}–{time24(meeting.end)}
      </Typography>
      <Typography sx={{ mt: 0.25, fontSize: '.75rem', color: D.muted }}>
        {meeting.platform} · {participants} participant{participants === 1 ? '' : 's'}
      </Typography>

      <Typography sx={{ mt: 2.5, mb: 1, fontSize: '.625rem', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: D.muted }}>
        MeetAI
      </Typography>
      <MeetingToggles
        meeting={meeting}
        settings={getMeetingToggleSettings(meeting, settings?.[meeting.id])}
        disabled={areMeetingTogglesDisabled(status)}
        onChange={(changes) => onSettingsChange?.(meeting.id, changes)}
      />

      <Button
        fullWidth
        variant="contained"
        disableElevation
        endIcon={<ArrowOutwardRoundedIcon />}
        onClick={() => onOpen(meeting)}
        sx={{
          mt: 2.5,
          minHeight: 40,
          borderRadius: '6px',
          fontSize: '.8125rem',
          fontWeight: 500,
          textTransform: 'none',
          bgcolor: D.navy,
          '&:hover': { bgcolor: '#0D1C47' },
          '&:focus-visible': focusRing,
        }}
      >
        Open meeting details
      </Button>
    </Box>
  )
}

/* ---------- Week view: one column per day ---------- */
export function WeekColumns({ selectedDate, meetings, onOpenDay, onOpenMeeting }) {
  const todayKey = dateKey(new Date())

  return (
    <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(7, minmax(0, 1fr))' }, alignItems: 'start' }}>
      {daysOfWeek(selectedDate).map((day) => {
        const key = dateKey(day)
        const items = meetings.filter((meeting) => meeting.date === key)

        return (
          <Box key={key} sx={{ minWidth: 0, borderTop: `2px solid ${key === todayKey ? D.greenText : D.navy}`, pt: 1 }}>
            <ButtonBase
              onClick={() => onOpenDay(day)}
              aria-label={`Open ${longDate.format(day)}`}
              sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%', textAlign: 'left', mb: 1, '&:hover .open-hint': { color: D.navy }, '&:focus-visible': focusRing }}
            >
              <Box>
                <Typography sx={{ fontSize: '.625rem', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: D.muted }}>
                  {shortWeekday.format(day)}
                </Typography>
                <Typography sx={{ fontFamily: serif, fontSize: '1.6rem', lineHeight: 1.1, color: D.navy }}>{day.getDate()}</Typography>
              </Box>
              <ChevronRightRoundedIcon className="open-hint" aria-hidden="true" sx={{ fontSize: 18, color: D.muted }} />
            </ButtonBase>

            {items.length === 0 ? (
              <Typography sx={{ fontSize: '.75rem', color: D.muted }}>No meetings</Typography>
            ) : (
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 0.75 }}>
                {items.map((meeting) => {
                  const look = STATUS[getStatusKey(meeting)]

                  return (
                    <Box component="li" key={meeting.id}>
                      <ButtonBase
                        onClick={() => onOpenMeeting(meeting)}
                        aria-label={`Show ${meeting.title} at ${time24(meeting.start)} in day view`}
                        sx={{
                          display: 'block',
                          width: '100%',
                          px: 1,
                          py: 0.75,
                          textAlign: 'left',
                          bgcolor: look.bg,
                          borderLeft: `3px solid ${look.color}`,
                          borderRadius: '4px',
                          '&:hover': { bgcolor: '#fff' },
                          '&:focus-visible': focusRing,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography sx={{ fontSize: '.6875rem', fontWeight: 600, color: look.color }}>{time24(meeting.start)}</Typography>
                          <ArrowOutwardRoundedIcon aria-hidden="true" sx={{ fontSize: 13, color: D.muted }} />
                        </Box>
                        <Typography sx={{ fontSize: '.8125rem', fontWeight: 500, lineHeight: 1.3, color: D.navy, overflowWrap: 'anywhere' }}>
                          {meeting.title}
                        </Typography>
                        <Typography noWrap sx={{ fontSize: '.6875rem', color: D.muted }}>{meeting.platform}</Typography>
                      </ButtonBase>
                    </Box>
                  )
                })}
              </Box>
            )}
          </Box>
        )
      })}
    </Box>
  )
}

/* ---------- Month view: full-width grid ---------- */
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MAX_CHIPS = 2

export function MonthGrid({ selectedDate, meetings, onOpenDay }) {
  const first = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  const gridStart = startOfWeek(first)
  const todayKey = dateKey(new Date())

  const days = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + index)
    return day
  })

  return (
    <Box role="grid" aria-label={`${selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} calendar`} sx={{ overflowX: 'auto' }}>
      <Box sx={{ minWidth: 640 }}>
        <Box role="row" sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', borderBottom: `1px solid ${D.navy}` }}>
          {WEEKDAYS.map((name) => (
            <Typography key={name} role="columnheader" sx={{ py: 0.75, px: 1, fontSize: '.625rem', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: D.muted }}>
              {name}
            </Typography>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
          {days.map((day) => {
            const key = dateKey(day)
            const inMonth = day.getMonth() === first.getMonth()
            const items = inMonth ? meetings.filter((meeting) => meeting.date === key) : []
            const today = key === todayKey

            return (
              <ButtonBase
                key={key}
                role="gridcell"
                onClick={() => onOpenDay(day)}
                aria-label={`${longDate.format(day)}, ${countText(items.length)}`}
                aria-current={today ? 'date' : undefined}
                sx={{
                  display: 'block',
                  minHeight: 104,
                  p: 1,
                  textAlign: 'left',
                  verticalAlign: 'top',
                  bgcolor: inMonth ? '#fff' : 'transparent',
                  borderBottom: `1px solid ${D.line}`,
                  borderRight: `1px solid ${D.line}`,
                  '&:nth-of-type(7n + 1)': { borderLeft: `1px solid ${D.line}` },
                  '&:hover': { bgcolor: '#E4EBF8' },
                  '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: -2 },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    display: 'inline-grid',
                    placeItems: 'center',
                    minWidth: 24,
                    height: 24,
                    borderRadius: '12px',
                    fontSize: '.8125rem',
                    fontWeight: today ? 700 : 500,
                    color: today ? '#fff' : inMonth ? D.navy : D.muted,
                    bgcolor: today ? D.navy : 'transparent',
                  }}
                >
                  {day.getDate()}
                </Box>

                {items.slice(0, MAX_CHIPS).map((meeting) => {
                  const look = STATUS[getStatusKey(meeting)]

                  return (
                    <Typography
                      key={meeting.id}
                      noWrap
                      sx={{ mt: 0.5, px: 0.75, py: 0.25, fontSize: '.6875rem', color: D.navy, bgcolor: look.bg, borderLeft: `3px solid ${look.color}`, borderRadius: '3px' }}
                    >
                      {time24(meeting.start)} {meeting.title}
                    </Typography>
                  )
                })}

                {items.length > MAX_CHIPS && (
                  <Typography sx={{ mt: 0.5, fontSize: '.6875rem', fontWeight: 600, color: D.navy }}>
                    +{items.length - MAX_CHIPS} more
                  </Typography>
                )}
              </ButtonBase>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}