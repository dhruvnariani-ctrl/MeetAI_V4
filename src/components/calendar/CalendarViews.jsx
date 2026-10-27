
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
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
import { dateKey } from '../../utils/calenderDates'
import {
  D,
  serif,
  sectionHeadSx,
  time24,
  titleSx,
} from '../dashboard/dashTheme'

/* ---------- Status colours ---------- */
const STATUS = {
  Live: { color: D.greenText, bg: '#EAF5E4', label: 'Live' },
  Upcoming: { color: D.navy, bg: '#F0F4FC', label: 'Upcoming' },
  Done: { color: D.muted, bg: '#F5F7FB', label: 'Done' },
}

const longDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const shortWeekday = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
})

const focusRing = {
  outline: `2px solid ${D.navy}`,
  outlineOffset: 2,
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const countText = (count) =>
  count ? `${count} meeting${count === 1 ? '' : 's'}` : 'Free'

/* ---------- Date helpers: Sunday-first calendar ---------- */
const startOfSundayWeek = (date) => {
  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  )
  start.setDate(start.getDate() - start.getDay())
  return start
}

const daysOfWeek = (date) => {
  const start = startOfSundayWeek(date)

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}

const sameDay = (first, second) =>
  dateKey(first) === dateKey(second)

/* ---------- Shared screenshot-style calendar grid ---------- */
function CalendarDateGrid({
  days,
  selectedDate,
  meetings,
  onOpenDay,
  showMonth = false,
}) {
  const selectedKey = dateKey(selectedDate)
  const todayKey = dateKey(new Date())

  const meetingsByDate = meetings.reduce((map, meeting) => {
    const key = meeting.date
    map[key] = (map[key] ?? 0) + 1
    return map
  }, {})

  return (
    <Box
      data-tour="calendar-days"
      role="grid"
      aria-label={showMonth ? 'Month calendar' : 'Week calendar'}
      sx={{
        width: '100%',
        overflowX: 'auto',
        bgcolor: '#FFFFFF',
      }}
    >
      <Box sx={{ minWidth: 420 }}>
        <Box
          role="row"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          }}
        >
          {WEEKDAYS.map((name) => (
            <Typography
              key={name}
              role="columnheader"
              sx={{
                textAlign: 'center',
                py: showMonth ? { xs: 0.4, sm: 0.55 } : { xs: 1.25, sm: 1.75 },
                fontSize: { xs: '.625rem', sm: '.6875rem' },
                lineHeight: 1.4,
                fontWeight: 500,
                color: '#111111',
              }}
            >
              {name}
            </Typography>
          ))}
        </Box>

        <Box
          role="rowgroup"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gridAutoRows: showMonth
              ? { xs: 42, sm: 52, md: 58 }
              : { xs: 78, sm: 104 },
          }}
        >
          {days.map((day) => {
            const key = dateKey(day)
            const inMonth =
              day.getMonth() === selectedDate.getMonth() &&
              day.getFullYear() === selectedDate.getFullYear()

            const selected = key === selectedKey
            const today = key === todayKey
            const count = meetingsByDate[key] ?? 0
            const weekend = day.getDay() === 0 || day.getDay() === 6

            return (
              <Box
                key={key}
                role="presentation"
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  pt: showMonth ? { xs: 0.2, sm: 0.35 } : { xs: 0.75, sm: 1.25 },
                  borderBottom: showMonth
                    ? '1px solid #F0F0F0'
                    : 'none',
                  bgcolor: '#FFFFFF',
                  minWidth: 0,
                }}
              >
                <ButtonBase
                  role="gridcell"
                  onClick={() => onOpenDay(day)}
                  aria-pressed={selected}
                  aria-current={today ? 'date' : undefined}
                  aria-label={`${longDate.format(day)}, ${countText(count)}`}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: showMonth ? { xs: 28, sm: 36, md: 40 } : { xs: 42, sm: 60 },
                    height: showMonth ? { xs: 30, sm: 38, md: 42 } : { xs: 44, sm: 64 },
                    border: selected
                      ? '1px solid #0064B5'
                      : '1px solid transparent',
                    borderRadius: showMonth ? '8px' : '10px',
                    bgcolor: '#FFFFFF',
                    color: !inMonth
                      ? '#C7C7C7'
                      : weekend
                        ? '#707070'
                        : '#080808',
                    '&:hover': {
                      bgcolor: '#F5F8FC',
                    },
                    '&:focus-visible': focusRing,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: showMonth ? { xs: '.6875rem', sm: '.75rem', md: '.8125rem' } : { xs: '.8125rem', sm: '.875rem' },
                      lineHeight: 1.2,
                      fontWeight: 500,
                      color: 'inherit',
                    }}
                  >
                    {day.getDate()}
                  </Typography>

                  {count > 0 && (
                    <Box
                      aria-hidden="true"
                      sx={{
                        position: 'absolute',
                        top: showMonth ? { xs: 2, sm: 3 } : { xs: 1, sm: 3 },
                        right: showMonth ? { xs: 2, sm: 3 } : { xs: 1, sm: 3 },
                        width: showMonth ? 5 : 8,
                        height: showMonth ? 5 : 8,
                        borderRadius: '50%',
                        bgcolor: '#CE7000',
                      }}
                    />
                  )}
                </ButtonBase>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}

/* ---------- Seven-day strip ---------- */
export function DayStrip({ selectedDate, meetings, onOpenDay }) {
  return (
    <CalendarDateGrid
      days={daysOfWeek(selectedDate)}
      selectedDate={selectedDate}
      meetings={meetings}
      onOpenDay={onOpenDay}
    />
  )
}

/* ---------- Day view: hour-by-hour timeline ---------- */
const PX = 1.5
const MIN_BLOCK = 46

const minutesOf = (value) => {
  const date = new Date(value)
  return date.getHours() * 60 + date.getMinutes()
}

function placeBlocks(meetings) {
  const items = meetings.map((meeting) => ({
    meeting,
    s: minutesOf(meeting.start),
    e: minutesOf(meeting.end),
  }))

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
    if (group.length && item.s >= groupEnd) {
      flush()
    }

    let lane = laneEnds.findIndex((end) => end <= item.s)

    if (lane === -1) {
      lane = laneEnds.length
    }

    laneEnds[lane] = item.e
    group.push({ ...item, lane })
    groupEnd = Math.max(groupEnd, item.e)
  })

  flush()

  return placed
}

export function DayTimeline({
  meetings,
  selectedId,
  onSelect,
  now = new Date(),
  isToday = true,
}) {
  if (meetings.length === 0) {
    return (
      <EmptyPanel title="Nothing scheduled" minHeight={160}>
        This day is free. Try another day or clear your filters.
      </EmptyPanel>
    )
  }

  const blocks = placeBlocks(meetings)
  const firstHour = Math.min(
    8,
    Math.floor(Math.min(...blocks.map((block) => block.s)) / 60),
  )
  const lastHour = Math.min(
    24,
    Math.max(18, Math.ceil(Math.max(...blocks.map((block) => block.e)) / 60)),
  )

  const hours = Array.from(
    { length: lastHour - firstHour + 1 },
    (_, index) => firstHour + index,
  )

  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const showNow =
    isToday &&
    nowMinutes >= firstHour * 60 &&
    nowMinutes <= lastHour * 60

  return (
    <Box
      sx={{
        position: 'relative',
        height: (lastHour - firstHour) * 60 * PX + 1,
      }}
    >
      {hours.map((hour) => (
        <Box
          key={hour}
          aria-hidden="true"
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: (hour - firstHour) * 60 * PX,
            borderTop: `1px solid ${D.line}`,
          }}
        >
          <Typography
            sx={{
              position: 'absolute',
              top: -9,
              left: 0,
              width: 44,
              pr: 1,
              bgcolor: D.page,
              fontSize: '.6875rem',
              color: D.muted,
            }}
          >
            {String(hour).padStart(2, '0')}:00
          </Typography>
        </Box>
      ))}

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 56,
          right: 0,
        }}
      >
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
                '&:hover': { bgcolor: '#FFFFFF' },
                '&:focus-visible': {
                  outline: `2px solid ${D.navy}`,
                  outlineOffset: 1,
                },
              }}
            >
              <Typography
                noWrap
                sx={{
                  width: '100%',
                  fontSize: '.875rem',
                  fontWeight: 600,
                  color: status === 'Done' ? D.text : D.navy,
                }}
              >
                {meeting.title}
              </Typography>

              <Typography
                noWrap
                sx={{
                  width: '100%',
                  fontSize: '.6875rem',
                  color: D.muted,
                }}
              >
                {time24(meeting.start)}–{time24(meeting.end)} ·{' '}
                {meeting.platform}
              </Typography>

              {height >= 80 && (
                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: '.6875rem',
                    fontWeight: 600,
                    color: look.color,
                  }}
                >
                  {status === 'Live' ? '● Live' : look.label}
                </Typography>
              )}
            </ButtonBase>
          )
        })}

        {showNow && (
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              left: -6,
              right: 0,
              top: (nowMinutes - firstHour * 60) * PX,
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: D.greenText,
              }}
            />
            <Box
              sx={{
                flex: 1,
                height: '1px',
                bgcolor: D.greenText,
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

/* ---------- Selected meeting panel ---------- */
export function MeetingPanel({
  meeting,
  settings,
  onSettingsChange,
  onOpen,
}) {
  if (!meeting) return null

  const status = getStatusKey(meeting)
  const look = STATUS[status]
  const participants = Number(meeting.participants) || 0

  return (
    <Box
      component="section"
      aria-label="Selected meeting"
      sx={{
        minWidth: 0,
        position: { lg: 'sticky' },
        top: { lg: 12 },
      }}
    >
      <Box sx={sectionHeadSx}>
        <Typography
          sx={{
            fontSize: '.625rem',
            fontWeight: 600,
            letterSpacing: '.07em',
            textTransform: 'uppercase',
            color: D.muted,
          }}
        >
          Selected meeting
        </Typography>

        <Typography
          sx={{
            fontSize: '.6875rem',
            fontWeight: 700,
            color: look.color,
          }}
        >
          {status === 'Live' ? '● Live' : look.label}
        </Typography>
      </Box>

      <Typography
        component="h2"
        sx={{
          ...titleSx,
          mt: 1.5,
          fontSize: '1.8rem',
          overflowWrap: 'anywhere',
        }}
      >
        {meeting.title}
      </Typography>

      <Typography sx={{ mt: 0.75, fontSize: '.75rem', color: D.text }}>
        {time24(meeting.start)}–{time24(meeting.end)}
      </Typography>

      <Typography sx={{ mt: 0.25, fontSize: '.75rem', color: D.muted }}>
        {meeting.platform} · {participants} participant
        {participants === 1 ? '' : 's'}
      </Typography>

      <Typography
        sx={{
          mt: 2.5,
          mb: 1,
          fontSize: '.625rem',
          fontWeight: 600,
          letterSpacing: '.07em',
          textTransform: 'uppercase',
          color: D.muted,
        }}
      >
        MeetAI
      </Typography>

      <MeetingToggles
        meeting={meeting}
        settings={getMeetingToggleSettings(
          meeting,
          settings?.[meeting.id],
        )}
        disabled={areMeetingTogglesDisabled(status)}
        onChange={(changes) =>
          onSettingsChange?.(meeting.id, changes)
        }
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

/* ---------- Week view: compact seven-date calendar grid ---------- */
export function WeekColumns({
  selectedDate,
  meetings,
  onOpenDay,
}) {
  const days = daysOfWeek(selectedDate)

  return (
    <CalendarDateGrid
      days={days}
      selectedDate={selectedDate}
      meetings={meetings}
      onOpenDay={onOpenDay}
    />
  )
}

/* ---------- Month view: screenshot-style calendar ---------- */
export function MonthGrid({
  selectedDate,
  meetings,
  onOpenDay,
}) {
  const first = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1,
  )

  const gridStart = startOfSundayWeek(first)

  const last = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0,
  )

  const cellCount = Math.ceil((first.getDay() + last.getDate()) / 7) * 7

  const days = Array.from({ length: cellCount }, (_, index) => {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + index)
    return day
  })

  return (
    <Box
      sx={{
        overflow: 'hidden',
        border: '1px solid #EEEEEE',
        borderRadius: '0 0 24px 24px',
        bgcolor: '#FFFFFF',
      }}
    >
      <CalendarDateGrid
        days={days}
        selectedDate={selectedDate}
        meetings={meetings}
        onOpenDay={onOpenDay}
        showMonth
      />
    </Box>
  )
}
