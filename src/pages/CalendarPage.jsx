import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import AddRoundedIcon from '@mui/icons-material/AddRounded'

import CalendarToolbar from '../components/calendar/CalendarToolbar'
import { DayStrip, DayTimeline, MeetingPanel, MonthGrid, WeekColumns } from '../components/calendar/CalendarViews'
import { getStatusKey } from '../components/meetings/meetingHelpers'
import { D, serif, sectionHeadSx, titleSx } from '../components/dashboard/dashTheme'

import { dateKey, parseDate } from '../utils/calenderDates'
import useCalendarState from '../hooks/useCalenderState'
import useCurrentUser from '../hooks/useCurrentUser'
import useNow from '../hooks/Usenow'

const AGENDA_LABELS = {
  day: 'Daily schedule',
  week: 'Weekly schedule',
  month: 'Monthly schedule',
}

const STATUS_TABS = ['All', 'Live', 'Upcoming', 'Done']

// One short line under "Schedule" so people know what selecting something does.
const VIEW_HINTS = {
  day: 'Select a meeting to see its details and MeetAI settings.',
  week: 'Select a meeting to open its day and change its MeetAI settings, or select a day name to see the whole day.',
  month: 'Select a day to open it and see its meetings.',
}

export default function CalendarPage() {
  const { openCreate } = useOutletContext() || {}
  const navigate = useNavigate()
  const now = useNow()
  const calendar = useCalendarState(useCurrentUser())

  const {
    selectedDate,
    view,
    visibleMeetings,
    filteredMeetings,
    filters,
    setFilters,
    clearFilters,
    platforms,
    activeFilterCount,
    counts,
    filter,
    setFilter,
    setView,
    title,
    selectedDateLabel,
    settings,
    onSettingsChange,
  } = calendar

  const [selectedId, setSelectedId] = useState(null)

  // Day view: keep the chosen meeting if it is still shown, otherwise pick the live one, the next one, or the first.
  const selected =
    visibleMeetings.find((meeting) => meeting.id === selectedId) ??
    visibleMeetings.find((meeting) => getStatusKey(meeting) === 'Live') ??
    visibleMeetings.find((meeting) => getStatusKey(meeting) === 'Upcoming') ??
    visibleMeetings[0]

  const total = visibleMeetings.length
  const filtersNote =
    activeFilterCount > 0 ? ` · ${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'} on` : ''

  const openMeeting = (meeting) => navigate(`/meetings/${meeting.id}`)

  // Week view: selecting a meeting opens its day with that meeting chosen,
  // so its MeetAI switches are right there and "Open meeting details" goes to the full page.
  const openInDay = (meeting) => {
    setSelectedId(meeting.id)
    calendar.selectDay(parseDate(meeting.date))
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0, color: D.text }}>
      {/* Title band, same treatment as the other pages */}
      <Box
        component="section"
        aria-label="Calendar overview"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          mx: { xs: -1.5, md: -2 },
          mt: { xs: -1.5, md: -2 },
          px: { xs: 1.5, md: 2 },
          py: 2.5,
          bgcolor: D.band,
        }}
      >
        <Box sx={{ minWidth: 0, flex: '1 1 320px' }}>
          <Typography sx={{ fontSize: '.6875rem', fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase', color: D.muted }}>
            Calendar · {AGENDA_LABELS[view]}
          </Typography>

          <Typography
            component="h1"
            sx={{ mt: 0.5, fontFamily: serif, fontWeight: 400, fontSize: { xs: '1.9rem', md: '2.6rem' }, lineHeight: 1.1, color: D.navy }}
          >
            {title}
          </Typography>

          <Typography aria-live="polite" sx={{ mt: 0.75, fontSize: '.8125rem', color: D.text }}>
            <Box component="strong" sx={{ fontWeight: 600, color: D.navy }}>
              {total} meeting{total === 1 ? '' : 's'}
            </Box>
            {filtersNote}
          </Typography>
        </Box>

        <Button
          data-tour="new-meeting"
          variant="contained"
          disableElevation
          startIcon={<AddRoundedIcon />}
          onClick={() => openCreate?.()}
          sx={{
            minHeight: 40,
            px: 2,
            borderRadius: '6px',
            fontSize: '.8125rem',
            fontWeight: 500,
            textTransform: 'none',
            bgcolor: D.navy,
            color: '#fff',
            '&:hover': { bgcolor: '#0D1C47' },
            '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: 2 },
          }}
        >
          Schedule a Meeting
        </Button>
      </Box>

      <Box data-tour="calendar-date-navigation" sx={{ pt: 2.5 }}>
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

      {/* Day and Week views start with a strip of the week's seven days */}
      {view !== 'month' && (
        <Box sx={{ pt: 2.5 }}>
          <DayStrip selectedDate={selectedDate} meetings={filteredMeetings} onOpenDay={calendar.selectDay} />
        </Box>
      )}

      <Box component="section" aria-label="Schedule" data-tour="calendar-schedule" sx={{ pt: 3, minWidth: 0 }}>
        <Box sx={{ ...sectionHeadSx, mb: 0.75 }}>
          <Typography component="h2" sx={titleSx}>
            Schedule
          </Typography>

          <Box role="group" aria-label="Filter by status" sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {STATUS_TABS.map((tab) => (
              <Button
                key={tab}
                aria-pressed={filter === tab}
                onClick={() => setFilter(tab)}
                sx={{
                  minWidth: 0,
                  minHeight: 30,
                  px: 1.25,
                  borderRadius: '15px',
                  fontSize: '.75rem',
                  fontWeight: filter === tab ? 600 : 500,
                  textTransform: 'none',
                  color: filter === tab ? '#fff' : D.navy,
                  bgcolor: filter === tab ? D.navy : 'transparent',
                  border: `1px solid ${filter === tab ? D.navy : D.line}`,
                  '&:hover': { bgcolor: filter === tab ? D.navy : '#E4EBF8' },
                  '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: 2 },
                }}
              >
                {tab} {counts[tab]}
              </Button>
            ))}
          </Box>
        </Box>

        <Typography sx={{ mb: 2, fontSize: '.75rem', color: D.muted }}>{VIEW_HINTS[view]}</Typography>

        {view === 'day' && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.9fr) minmax(300px, 1fr)' },
              columnGap: 3.5,
              rowGap: 3,
              alignItems: 'start',
            }}
          >
            <DayTimeline
              meetings={visibleMeetings}
              selectedId={selected?.id}
              onSelect={setSelectedId}
              now={now}
              isToday={dateKey(selectedDate) === dateKey(now)}
            />

            <MeetingPanel
              meeting={selected}
              settings={settings}
              onSettingsChange={onSettingsChange}
              onOpen={openMeeting}
            />
          </Box>
        )}

        {view === 'week' && (
          <WeekColumns
            selectedDate={selectedDate}
            meetings={visibleMeetings}
            onOpenDay={calendar.selectDay}
            onOpenMeeting={openInDay}
          />
        )}

        {view === 'month' && (
          <MonthGrid selectedDate={selectedDate} meetings={visibleMeetings} onOpenDay={calendar.selectDay} />
        )}
      </Box>
    </Box>
  )
}