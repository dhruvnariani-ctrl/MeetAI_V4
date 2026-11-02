
import { useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'

import { dateKey, startOfWeek } from '../../utils/calenderDates'
import { D, linkSx, sectionHeadSx, titleSx } from '../dashboard/dashTheme'

// Monday-first calendar, consistent with the rest of the app.
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const WEEKDAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const longDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const monthName = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
})

export default function CalendarSidebar({
  selectedDate,
  view,
  meetings = [],
  onOpenDay,
  onToday,
}) {
  const [shown, setShown] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  )

  const perDay = useMemo(
    () =>
      meetings.reduce((map, meeting) => {
        const key = meeting.date
        if (!key) return map

        map[key] = (map[key] ?? 0) + 1
        return map
      }, {}),
    [meetings],
  )

  // Always render six complete Monday-first weeks.
  const gridStart = startOfWeek(shown)

  const days = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + index)
    return day
  })

  const todayKey = dateKey(new Date())
  const selectedKey = dateKey(selectedDate)
  const selectedWeekStart = startOfWeek(selectedDate)
  const selectedWeekKey = dateKey(selectedWeekStart)

  const moveMonth = (step) => {
    setShown(
      new Date(shown.getFullYear(), shown.getMonth() + step, 1),
    )
  }

  const isSameMonth = (day) =>
    day.getMonth() === selectedDate.getMonth() &&
    day.getFullYear() === selectedDate.getFullYear()

  return (
    <Box
      component="section"
      aria-label="Calendar sidebar"
      sx={{
        minWidth: 0,
        width: '100%',
      }}
    >
      {/* Month heading and navigation */}
      <Box
        sx={{
          ...sectionHeadSx,
          alignItems: 'center',
        }}
      >
        <Typography component="h2" sx={titleSx}>
          {monthName.format(shown)}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            size="small"
            aria-label="Previous month"
            onClick={() => moveMonth(-1)}
            sx={{ color: D.navy }}
          >
            <ChevronLeftRoundedIcon />
          </IconButton>

          <IconButton
            size="small"
            aria-label="Next month"
            onClick={() => moveMonth(1)}
            sx={{ color: D.navy }}
          >
            <ChevronRightRoundedIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Calendar grid */}
      <Box
        sx={{ mt: 1.5, width: '100%' }}
        role="grid"
        aria-label={monthName.format(shown)}
      >
        {/* Weekday labels */}
        <Box
          role="row"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            mb: 0.5,
          }}
        >
          {WEEKDAYS.map((letter, index) => (
            <Typography
              key={index}
              role="columnheader"
              aria-label={WEEKDAY_NAMES[index]}
              sx={{
                textAlign: 'center',
                fontSize: '.625rem',
                fontWeight: 600,
                letterSpacing: '.07em',
                color: D.muted,
              }}
            >
              {letter}
            </Typography>
          ))}
        </Box>

        {/* Six calendar weeks */}
        {Array.from({ length: 6 }, (_, row) => {
          const week = days.slice(row * 7, row * 7 + 7)

          const weekStartKey = dateKey(week[0])
          const weekEnd = new Date(week[0])
          weekEnd.setDate(weekEnd.getDate() + 6)

          const inSelectedWeek =
            view === 'week' &&
            weekStartKey === selectedWeekKey

          return (
            <Box
              key={row}
              role="row"
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                borderRadius: '6px',
                bgcolor: inSelectedWeek ? '#DCE5F7' : 'transparent',
              }}
            >
              {week.map((day) => {
                const key = dateKey(day)
                const count = perDay[key] ?? 0

                const selected = key === selectedKey
                const today = key === todayKey
                const inShownMonth =
                  day.getMonth() === shown.getMonth() &&
                  day.getFullYear() === shown.getFullYear()

                const inSelectedMonth =
                  view === 'month' && isSameMonth(day)

                const inSelectedDay =
                  view === 'day' && selected

                const highlighted =
                  inSelectedDay || inSelectedMonth

                const weekHighlighted =
                  inSelectedWeek

                const active = highlighted || weekHighlighted

                return (
                  <ButtonBase
                    key={key}
                    role="gridcell"
                    onClick={() => onOpenDay(day)}
                    aria-selected={active}
                    aria-current={today ? 'date' : undefined}
                    aria-label={`${longDate.format(day)}${
                      count
                        ? `, ${count} meeting${count === 1 ? '' : 's'}`
                        : ''
                    }`}
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 0,
                      height: 32,
                      m: '1px',
                      borderRadius: '6px',

                      fontSize: '.8125rem',
                      lineHeight: 1,

                      fontWeight:
                        selected || today || active ? 700 : 400,

                      color: selected
                        ? '#FFFFFF'
                        : inShownMonth
                          ? D.navy
                          : D.muted,

                      bgcolor: selected
                        ? D.navy
                        : active
                          ? '#DCE5F7'
                          : 'transparent',

                      border:
                        today && !selected
                          ? `1px solid ${D.navy}`
                          : '1px solid transparent',

                      '&:hover': {
                        bgcolor: selected ? D.navy : '#E4EBF8',
                      },

                      '&:focus-visible': {
                        outline: `2px solid ${D.navy}`,
                        outlineOffset: 1,
                      },
                    }}
                  >
                    {day.getDate()}

                    {/* Meeting indicator */}
                    <Box
                      aria-hidden="true"
                      sx={{
                        width: 4,
                        height: 4,
                        mt: '3px',
                        borderRadius: '50%',
                        bgcolor: count
                          ? selected
                            ? '#FFFFFF'
                            : D.greenText
                          : 'transparent',
                      }}
                    />
                  </ButtonBase>
                )
              })}
            </Box>
          )
        })}
      </Box>

      {/* Today shortcut */}
      <Button
        sx={{
          ...linkSx,
          mt: 1.5,
          fontSize: '.75rem',
        }}
        onClick={onToday}
      >
        Go to today
      </Button>
    </Box>
  )
}
