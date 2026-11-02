
import { useMemo } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import AddRoundedIcon from '@mui/icons-material/AddRounded'

import CalendarToolbar from '../components/calendar/CalendarToolbar'
import CalendarMeetingList from '../components/calendar/CalendarMeetingList'
import { MonthGrid } from '../components/calendar/CalendarViews'

import { D } from '../components/dashboard/dashTheme'
import useCalendarState from '../hooks/useCalenderState'
import useCurrentUser from '../hooks/useCurrentUser'
import {
  dateKey,
  endOfWeek,
  startOfWeek,
} from '../utils/calenderDates'

const STATUS_TABS = ['All', 'Live', 'Upcoming', 'Done']

function getMeetingDateKey(meeting) {
  if (
    typeof meeting?.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}/.test(meeting.date)
  ) {
    return meeting.date.slice(0, 10)
  }

  if (meeting?.start) {
    const start = new Date(meeting.start)
    if (!Number.isNaN(start.getTime())) return dateKey(start)
  }

  if (meeting?.date) {
    const parsed = new Date(meeting.date)
    if (!Number.isNaN(parsed.getTime())) return dateKey(parsed)
  }

  return null
}

function getCalendarHeading(view, selectedDate) {
  if (
    !(selectedDate instanceof Date) ||
    Number.isNaN(selectedDate.getTime())
  ) {
    return ''
  }

  if (view === 'day') {
    return selectedDate.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (view === 'week') {
    const start = startOfWeek(selectedDate)
    const end = endOfWeek(selectedDate)

    const sameMonth =
      start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear()

    const startLabel = start.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: sameMonth ? undefined : 'long',
    })

    const endLabel = end.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    return `${startLabel} – ${endLabel}`
  }

  return selectedDate.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

export default function CalendarPage() {
  const { openCreate } = useOutletContext() || {}
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const calendar = useCalendarState(currentUser)

  const {
    view,
    visibleMeetings = [],
    filters,
    setFilters,
    clearFilters,
    platforms,
    activeFilterCount,
    counts = {},
    filter,
    setFilter,
    setView,
    selectedDateLabel,
    settings,
    onSettingsChange,
  } = calendar

  const calendarHeading = getCalendarHeading(
    view,
    calendar.selectedDate,
  )

  const periodMeetings = useMemo(() => {
    const selectedDate = calendar.selectedDate

    if (
      !(selectedDate instanceof Date) ||
      Number.isNaN(selectedDate.getTime())
    ) {
      return visibleMeetings
    }

    if (view === 'day') {
      const selectedKey = dateKey(selectedDate)

      return visibleMeetings.filter(
        (meeting) => getMeetingDateKey(meeting) === selectedKey,
      )
    }

    if (view === 'week') {
      const weekStart = startOfWeek(selectedDate)
      const weekEnd = endOfWeek(selectedDate)

      return visibleMeetings.filter((meeting) => {
        const key = getMeetingDateKey(meeting)
        if (!key) return false

        const meetingDate = new Date(`${key}T12:00:00`)

        return (
          !Number.isNaN(meetingDate.getTime()) &&
          meetingDate >= weekStart &&
          meetingDate <= weekEnd
        )
      })
    }

    if (view === 'month') {
      return visibleMeetings.filter((meeting) => {
        const key = getMeetingDateKey(meeting)
        if (!key) return false

        const [year, month] = key.split('-').map(Number)

        return (
          year === selectedDate.getFullYear() &&
          month === selectedDate.getMonth() + 1
        )
      })
    }

    return visibleMeetings
  }, [visibleMeetings, calendar.selectedDate, view])

  const openMeeting = (meeting) => {
    if (meeting?.id) {
      navigate(`/meetings/${meeting.id}`)
    }
  }

  return (
    <Box
      component="main"
      sx={{
        width: '100%',
        minWidth: 0,
        color: D.text,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* Filters, date navigation and create action */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            md: 'auto minmax(0, 1fr) auto',
          },
          alignItems: 'center',
          gap: { xs: 1.5, md: 1 },
          width: '100%',
          minWidth: 0,
        }}
      >
        <Box
          role="group"
          aria-label="Filter meetings by status"
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: { xs: '100%', md: 'fit-content' },
            minWidth: 0,
            border: `1px solid ${D.line}`,
            borderRadius: '6px',
            overflow: 'hidden',
            bgcolor: '#fff',
          }}
        >
          {STATUS_TABS.map((tab) => {
            const active = filter === tab

            return (
              <Button
                key={tab}
                aria-pressed={active}
                onClick={() => setFilter(tab)}
                sx={{
                  flex: { xs: '1 1 0', md: '0 0 auto' },
                  minWidth: 0,
                  minHeight: 36,
                  px: { xs: 0.75, md: 1.25 },
                  borderRadius: 0,
                  borderRight: `1px solid ${D.line}`,
                  '&:last-of-type': { borderRight: 0 },
                  fontSize: '.8125rem',
                  fontWeight: active ? 600 : 500,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  bgcolor: active ? D.navy : '#fff',
                  color: active ? '#fff' : D.navy,
                  '&:hover': {
                    bgcolor: active ? D.navy : '#F5F8FD',
                  },
                }}
              >
                {tab} {counts[tab] ?? 0}
              </Button>
            )
          })}
        </Box>

        <Box
          data-tour="calendar-date-navigation"
          sx={{
            width: '100%',
            minWidth: 0,
            '& > *': { minWidth: 0 },
          }}
        >
          <CalendarToolbar
            view={view}
            label={selectedDateLabel}
            onViewChange={setView}
            onPrevious={calendar.handlePrevious}
            onNext={calendar.handleNext}
            onToday={calendar.handleToday}
            onYesterday={calendar.handleYesterday}
            onTomorrow={calendar.handleTomorrow}
            onCurrentPeriod={calendar.handleCurrentPeriod}
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
            platforms={platforms}
            activeFilterCount={activeFilterCount}
          />
        </Box>

        <Button
          data-tour="new-meeting"
          variant="contained"
          disableElevation
          startIcon={<AddRoundedIcon />}
          onClick={() => openCreate?.()}
          sx={{
            minHeight: 36,
            width: { xs: '100%', md: 'auto' },
            px: 1.5,
            borderRadius: '6px',
            fontSize: '.8rem',
            fontWeight: 500,
            textTransform: 'none',
            bgcolor: D.navy,
            color: '#fff',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            '&:hover': { bgcolor: '#0D1C47' },
          }}
        >
          Schedule meeting
        </Button>
      </Box>

      {/* Meeting list + always-visible calendar */}
      <Box
        component="section"
        aria-label="Calendar schedule"
        data-tour="calendar-schedule"
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            lg: 'minmax(0, 1.15fr) minmax(300px, 0.85fr)',
          },
          alignItems: 'start',
          gap: { xs: 3, lg: 3 },
          width: '100%',
          minWidth: 0,
        }}
      >
        <Box sx={{ minWidth: 0, order: { xs: 2, lg: 1 } }}>
          <CalendarMeetingList
            meetings={periodMeetings}
            view={view}
            settings={settings}
            onSettingsChange={onSettingsChange}
            onOpenMeeting={openMeeting}
          />
        </Box>

        <Box
          sx={{
            minWidth: 0,
            order: { xs: 1, lg: 2 },
            border: `1px solid ${D.line}`,
            borderRadius: '8px',
            p: { xs: 1, sm: 1.5 },
            bgcolor: '#fff',
            position: { lg: 'sticky' },
            top: { lg: 12 },
            alignSelf: 'start',
          }}
        >
          <Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    mb: 2,
  }}
>
  <Typography  sx={{
              mb: 1.25,
              fontSize: '.9375rem',
              fontWeight: 700,
              color: D.navy,
            }}>
    {calendarHeading}
  </Typography>

  <Button
    size="small"
    variant="outlined"
    onClick={calendar.handleToday}
    sx={{ flexShrink: 0 }}
  >
    Go to today
  </Button>
</Box>

          <MonthGrid
            selectedDate={calendar.selectedDate}
            view={view}
            meetings={visibleMeetings}
            onOpenDay={(date) => calendar.selectDay(date)}
          />
        </Box>
      </Box>
    </Box>
  )
}
