import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'

import CalendarToolbar from '../components/calendar/CalendarToolbar'
import CalendarMeetingList from '../components/calendar/CalendarMeetingList'
import {
  DayStrip,
  WeekColumns,
  MonthGrid,
} from '../components/calendar/CalendarViews'

import { D, titleSx } from '../components/dashboard/dashTheme'
import useCalendarState from '../hooks/useCalenderState'
import useCurrentUser from '../hooks/useCurrentUser'
import { dateKey } from '../utils/calenderDates'

const STATUS_TABS = ['All', 'Live', 'Upcoming', 'Done']

function getMeetingDateKey(meeting) {
  if (typeof meeting?.date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(meeting.date)) {
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

function SelectedMeetingCard({ meeting, onOpen }) {
  if (!meeting) return null

  const startDate = meeting.start ? new Date(meeting.start) : null

  const dateLabel =
    startDate && !Number.isNaN(startDate.getTime())
      ? startDate.toLocaleString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : meeting.date || ''

  const participants = Array.isArray(meeting.participants)
    ? meeting.participants
        .map((person) =>
          typeof person === 'string'
            ? person
            : person?.name || person?.fullName || person?.email || '',
        )
        .filter(Boolean)
    : []

  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        border: `1px solid ${D.line}`,
        borderRadius: '8px',
        bgcolor: '#fff',
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          mb: 0.75,
          fontSize: '.6875rem',
          fontWeight: 600,
          color: D.muted,
          textTransform: 'uppercase',
          letterSpacing: '.06em',
        }}
      >
        Selected meeting
      </Typography>

      <Typography
        sx={{
          fontSize: '1.05rem',
          fontWeight: 600,
          color: D.navy,
          lineHeight: 1.4,
          overflowWrap: 'anywhere',
        }}
      >
        {meeting.title || 'Untitled meeting'}
      </Typography>

      <Typography
        sx={{
          mt: 0.75,
          fontSize: '.8125rem',
          color: D.text,
          lineHeight: 1.6,
          overflowWrap: 'anywhere',
        }}
      >
        {meeting.platform || 'Platform not specified'}
        {dateLabel ? ` · ${dateLabel}` : ''}
      </Typography>

      {participants.length > 0 && (
        <Typography
          sx={{
            mt: 0.5,
            fontSize: '.8125rem',
            color: D.muted,
            lineHeight: 1.6,
            overflowWrap: 'anywhere',
          }}
        >
          {participants.join(', ')}
        </Typography>
      )}

      {meeting.description && (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: '.8125rem',
            color: D.text,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
          }}
        >
          {meeting.description}
        </Typography>
      )}

      <Button
        variant="contained"
        disableElevation
        endIcon={<ArrowOutwardRoundedIcon />}
        onClick={() => onOpen(meeting)}
        sx={{
          mt: 1.5,
          minHeight: 36,
          px: 1.5,
          borderRadius: '6px',
          fontSize: '.8rem',
          fontWeight: 500,
          textTransform: 'none',
          bgcolor: D.navy,
          color: '#fff',
          '&:hover': { bgcolor: '#0D1C47' },
          '&:focus-visible': {
            outline: `2px solid ${D.navy}`,
            outlineOffset: 2,
          },
        }}
      >
        Open meeting details
      </Button>
    </Box>
  )
}

export default function CalendarPage() {
  const { openCreate } = useOutletContext() || {}
  const navigate = useNavigate()
  const calendar = useCalendarState(useCurrentUser())

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

  const [selectedMeetingId, setSelectedMeetingId] = useState(null)

  const selectedMeeting = useMemo(
    () =>
      visibleMeetings.find((meeting) => meeting.id === selectedMeetingId) ||
      null,
    [visibleMeetings, selectedMeetingId],
  )

  // Keep the selected meeting only while it remains visible after filters change.
  useEffect(() => {
    if (
      selectedMeetingId !== null &&
      !visibleMeetings.some((meeting) => meeting.id === selectedMeetingId)
    ) {
      setSelectedMeetingId(null)
    }
  }, [visibleMeetings, selectedMeetingId])

  // The calendar grid controls the date period shown in the meeting list.
  const periodMeetings = useMemo(() => {
    const selectedDate = calendar.selectedDate
    if (!(selectedDate instanceof Date) || Number.isNaN(selectedDate.getTime())) {
      return visibleMeetings
    }

    const selectedKey = dateKey(selectedDate)

    if (view === 'day') {
      return visibleMeetings.filter(
        (meeting) => getMeetingDateKey(meeting) === selectedKey,
      )
    }

    if (view === 'week') {
      const weekStart = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      )
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 7)

      return visibleMeetings.filter((meeting) => {
        const key = getMeetingDateKey(meeting)
        if (!key) return false
        const meetingDate = new Date(`${key}T12:00:00`)
        return (
          !Number.isNaN(meetingDate.getTime()) &&
          meetingDate >= weekStart &&
          meetingDate < weekEnd
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
    if (meeting?.id) navigate(`/meetings/${meeting.id}`)
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
        gap: 1.5,
      }}
    >
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
                  '&:hover': { bgcolor: active ? D.navy : '#F5F8FD' },
                  '&:focus-visible': {
                    outline: `2px solid ${D.navy}`,
                    outlineOffset: -4,
                  },
                }}
              >
                {tab} {counts[tab]}
              </Button>
            )
          })}
        </Box>

        <Box
          data-tour="calendar-date-navigation"
          sx={{ width: '100%', minWidth: 0, '& > *': { minWidth: 0 } }}
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
            '&:focus-visible': {
              outline: `2px solid ${D.navy}`,
              outlineOffset: 2,
            },
          }}
        >
          Schedule meeting
        </Button>
      </Box>

      <Box
        component="section"
        aria-label="Schedule"
        data-tour="calendar-schedule"
        sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography component="h2" sx={titleSx}>
            Schedule
          </Typography>
          <Typography
            aria-live="polite"
            sx={{ fontSize: '.75rem', color: D.muted, flexShrink: 0 }}
          >
            {periodMeetings.length} meeting{periodMeetings.length === 1 ? '' : 's'}
            {activeFilterCount > 0 &&
              ` · ${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'}`}
          </Typography>
        </Box>

        <Typography sx={{ fontSize: '.75rem', color: D.muted, mb: 1.5 }}>
          Select a date on the calendar to filter meetings for that day, week, or month.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)',
            },
            alignItems: 'start',
            gap: { xs: 3, md: 4 },
            width: '100%',
            minWidth: 0,
          }}
        >
          <Box sx={{ minWidth: 0, order: { xs: 2, md: 1 } }}>
            {periodMeetings.length === 0 ? (
              <Typography
                role="status"
                sx={{ fontSize: '.8125rem', color: D.muted, py: 2 }}
              >
                No meetings match the selected date range and current filters.
              </Typography>
            ) : (
              <CalendarMeetingList
                meetings={periodMeetings}
                view={view}
                selectedMeetingId={selectedMeetingId}
                onSelectMeeting={(meeting) => setSelectedMeetingId(meeting.id)}
                settings={settings}
                onSettingsChange={onSettingsChange}
              />
            )}
          </Box>

          <Box
            sx={{
              minWidth: 0,
              order: { xs: 1, md: 2 },
              border: `1px solid ${D.line}`,
              borderRadius: '8px',
              p: { xs: 1.5, md: 2 },
              bgcolor: '#fff',
              position: { md: 'sticky' },
              top: { md: 16 },
            }}
          >
            {selectedMeeting && (
              <SelectedMeetingCard meeting={selectedMeeting} onOpen={openMeeting} />
            )}

            <Box sx={{ minWidth: 0 }}>
              {view === 'day' && (
                <DayStrip
                  selectedDate={calendar.selectedDate}
                  meetings={visibleMeetings}
                  onOpenDay={(date) => calendar.selectDay(date)}
                />
              )}

              {view === 'week' && (
                <WeekColumns
                  selectedDate={calendar.selectedDate}
                  meetings={visibleMeetings}
                  onOpenDay={(date) => calendar.selectDay(date)}
                />
              )}

              {view === 'month' && (
                <MonthGrid
                  selectedDate={calendar.selectedDate}
                  meetings={visibleMeetings}
                  onOpenDay={(date) => calendar.selectDay(date)}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
