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

// The app's weeks start on Monday (see startOfWeek), so the grid does too.
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const longDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })

/*
 * Month grid. Clicking a day opens that day (Day view).
 * The parent remounts this with key={selected date}, so the shown month
 * always starts at the selected date and can then be browsed freely.
 */
export default function CalendarSidebar({ selectedDate, view, meetings = [], onOpenDay, onToday }) {
  const [shown, setShown] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))

  const perDay = useMemo(
    () => meetings.reduce((map, meeting) => ({ ...map, [meeting.date]: (map[meeting.date] ?? 0) + 1 }), {}),
    [meetings],
  )

  const gridStart = startOfWeek(shown)
  const days = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + index)
    return day
  })

  const todayKey = dateKey(new Date())
  const selectedKey = dateKey(selectedDate)
  const selectedWeekKey = dateKey(startOfWeek(selectedDate))
  const moveMonth = (step) => setShown(new Date(shown.getFullYear(), shown.getMonth() + step, 1))

  return (
    <Box component="section" aria-label="Month calendar" sx={{ minWidth: 0 }}>
      <Box sx={{ ...sectionHeadSx, alignItems: 'center' }}>
        <Typography component="h2" sx={titleSx}>
          {monthName.format(shown)}
        </Typography>
        <Box>
          <IconButton size="small" aria-label="Previous month" onClick={() => moveMonth(-1)} sx={{ color: D.navy }}>
            <ChevronLeftRoundedIcon />
          </IconButton>
          <IconButton size="small" aria-label="Next month" onClick={() => moveMonth(1)} sx={{ color: D.navy }}>
            <ChevronRightRoundedIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ mt: 1.5 }} role="grid" aria-label={monthName.format(shown)}>
        <Box role="row" sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
          {WEEKDAYS.map((letter, index) => (
            <Typography
              key={index}
              role="columnheader"
              aria-label={WEEKDAY_NAMES[index]}
              sx={{ textAlign: 'center', fontSize: '.625rem', fontWeight: 600, letterSpacing: '.07em', color: D.muted }}
            >
              {letter}
            </Typography>
          ))}
        </Box>

        {Array.from({ length: 6 }, (_, row) => {
          const week = days.slice(row * 7, row * 7 + 7)
          const inSelectedWeek = view === 'week' && dateKey(week[0]) === selectedWeekKey

          return (
            <Box
              key={row}
              role="row"
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                borderRadius: '6px',
                bgcolor: inSelectedWeek ? '#DCE5F7' : 'transparent',
              }}
            >
              {week.map((day) => {
                const key = dateKey(day)
                const count = perDay[key] ?? 0
                const selected = key === selectedKey
                const inMonth = day.getMonth() === shown.getMonth()

                return (
                  <ButtonBase
                    key={key}
                    role="gridcell"
                    onClick={() => onOpenDay(day)}
                    aria-selected={selected}
                    aria-current={key === todayKey ? 'date' : undefined}
                    aria-label={`${longDate.format(day)}${count ? `, ${count} meeting${count === 1 ? '' : 's'}` : ''}`}
                    sx={{
                      flexDirection: 'column',
                      height: 38,
                      m: '1px',
                      borderRadius: '6px',
                      fontSize: '.8125rem',
                      fontWeight: selected || key === todayKey ? 700 : 400,
                      color: selected ? '#fff' : inMonth ? D.navy : D.muted,
                      bgcolor: selected ? D.navy : 'transparent',
                      border: key === todayKey && !selected ? `1px solid ${D.navy}` : '1px solid transparent',
                      '&:hover': { bgcolor: selected ? D.navy : '#E4EBF8' },
                      '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: 1 },
                    }}
                  >
                    {day.getDate()}
                    <Box
                      aria-hidden="true"
                      sx={{ width: 4, height: 4, mt: '2px', borderRadius: '50%', bgcolor: count ? (selected ? '#fff' : D.greenText) : 'transparent' }}
                    />
                  </ButtonBase>
                )
              })}
            </Box>
          )
        })}
      </Box>

      <Button sx={{ ...linkSx, mt: 1.5, fontSize: '.75rem' }} onClick={onToday}>
        Go to today
      </Button>
    </Box>
  )
}