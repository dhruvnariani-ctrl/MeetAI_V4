import { useMemo, useState } from 'react'

import {
  createMeetingSettings,
  saveMeetingSettings,
  saveMeetingSettingsBulk,
} from '../data/meetingSettings'

import {
  dateKey,
  endOfWeek,
  formatDayTitle,
  formatMonthTitle,
  formatWeekTitle,
  getCalendarMeetings,
  getDayDateLabel,
  getMonthDateLabel,
  getTimeSortValue,
  getWeekDateLabel,
  parseDate,
  startOfWeek,
} from '../utils/calenderDates'

import {
  getMeetingToggleSettings,
  getStatusKey,
} from '../components/meetings/meetingHelpers'

import useCurrentUser from './useCurrentUser'

export const DEFAULT_FILTERS = {
  platforms: [],
  meetAIOnly: false,
  hostedByMe: false,
}

const startOfToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

const normalize = (value) =>
  value === null || value === undefined
    ? ''
    : String(value).trim().toLowerCase()

const valuesOf = (value) =>
  value && typeof value === 'object'
    ? [value.id, value.email, value.name]
    : [value]

/*
 * "Hosted by me": compares the current user with the meeting's
 * owner / organizer / host. Adjust the field names below if your
 * meeting objects store the owner differently.
 */
function isHostedByUser(meeting, user) {
  if (!user) return false

  const me = valuesOf(user).map(normalize).filter(Boolean)

  const owner =
    meeting.owner ??
    meeting.organizer ??
    meeting.host ??
    meeting.ownerId ??
    meeting.ownerEmail ??
    meeting.createdBy

  const them = valuesOf(owner).map(normalize).filter(Boolean)

  return them.some((value) => me.includes(value))
}

/*
 * All Calendar page state: selected date, view, filters,
 * per-meeting MeetAI settings, navigation and the visible list.
 */
export default function useCalendarState(user) {
  /*
   * Hooks must always run in the same order, so the fallback
   * user is read unconditionally.
   */
  const fallbackUser = useCurrentUser()
  const currentUser = user ?? fallbackUser

  /*
   * Dashboard and Calendar use the same meeting source.
   *
   * getCalendarMeetings filters the meetings so only meetings
   * where the current user is the owner or a participant are used.
   */
  const meetings = useMemo(
    () => getCalendarMeetings(currentUser),
    [currentUser],
  )

  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [view, setView] = useState('day')
  const [filter, setFilter] = useState('All')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  /*
   * Saved MeetAI settings first, then meeting.meetAI defaults.
   */
  const [settings, setSettings] = useState(() =>
    createMeetingSettings(meetings),
  )

  const selectedKey = dateKey(selectedDate)

  /* ---------------------------------------------------------------- */
  /* Filters (platform / MeetAI invited / hosted by me)                */
  /* ---------------------------------------------------------------- */

  /* Platform options come from the data, so nothing is hard-coded. */
  const platforms = useMemo(
    () =>
      [...new Set(meetings.map((meeting) => meeting.platform).filter(Boolean))].sort(),
    [meetings],
  )

  const activeFilterCount =
    filters.platforms.length +
    (filters.meetAIOnly ? 1 : 0) +
    (filters.hostedByMe ? 1 : 0)

  const clearFilters = () => setFilters(DEFAULT_FILTERS)

  /* Every meeting that passes the filters, across all dates. */
  const filteredMeetings = useMemo(() => {
    if (activeFilterCount === 0) return meetings

    return meetings.filter((meeting) => {
      if (
        filters.platforms.length > 0 &&
        !filters.platforms.includes(meeting.platform)
      ) {
        return false
      }

      if (
        filters.meetAIOnly &&
        !getMeetingToggleSettings(meeting, settings?.[meeting.id]).autoJoin
      ) {
        return false
      }

      if (filters.hostedByMe && !isHostedByUser(meeting, currentUser)) {
        return false
      }

      return true
    })
  }, [meetings, filters, activeFilterCount, settings, currentUser])

  /* ---------------------------------------------------------------- */
  /* Meetings in the selected Day / Week / Month                       */
  /* ---------------------------------------------------------------- */

  const rangeMeetings = useMemo(() => {
    let result = [...filteredMeetings]

    if (view === 'day') {
      result = result.filter((meeting) => meeting.date === selectedKey)
    }

    if (view === 'week') {
      const start = startOfWeek(selectedDate)
      const end = endOfWeek(selectedDate)

      result = result.filter((meeting) => {
        const meetingDate = parseDate(meeting.date)
        return meetingDate >= start && meetingDate <= end
      })
    }

    if (view === 'month') {
      result = result.filter((meeting) => {
        const meetingDate = parseDate(meeting.date)

        return (
          meetingDate.getFullYear() === selectedDate.getFullYear() &&
          meetingDate.getMonth() === selectedDate.getMonth()
        )
      })
    }

    /*
     * Sort by calendar date, then by numeric time
     * instead of sorting formatted time strings.
     */
    return result.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date)
      }

      return getTimeSortValue(a.time) - getTimeSortValue(b.time)
    })
  }, [filteredMeetings, selectedDate, selectedKey, view])

  /* Counts per status for the selected range. */
  const counts = useMemo(() => {
    const result = { All: rangeMeetings.length, Live: 0, Upcoming: 0, Done: 0 }

    rangeMeetings.forEach((meeting) => {
      result[getStatusKey(meeting)] += 1
    })

    return result
  }, [rangeMeetings])

  /* Optional single-status filter (kept for compatibility). */
  const visibleMeetings = useMemo(() => {
    if (filter === 'All') return rangeMeetings

    return rangeMeetings.filter((meeting) => getStatusKey(meeting) === filter)
  }, [rangeMeetings, filter])

  /* ---------------------------------------------------------------- */
  /* MeetAI settings                                                   */
  /* ---------------------------------------------------------------- */

  /*
   * Done meetings never affect the overall switch.
   */
  const activeVisibleMeetings = visibleMeetings.filter(
    (meeting) => getStatusKey(meeting) !== 'Done',
  )

  const allVisibleAutoJoin =
    activeVisibleMeetings.length > 0 &&
    activeVisibleMeetings.every(
      (meeting) => settings?.[meeting.id]?.autoJoin === true,
    )

  const onSettingsChange = (meetingId, changes) => {
    setSettings(saveMeetingSettings(meetingId, changes))
  }

  const handleToolbarAutoJoin = (checked) => {
    setSettings(saveMeetingSettingsBulk(activeVisibleMeetings, checked))
  }

  /* ---------------------------------------------------------------- */
  /* Navigation                                                        */
  /* ---------------------------------------------------------------- */

  /* Pick a date and jump to its Day view. */
  const selectDay = (date) => {
    setSelectedDate(date)
    setView('day')
  }

  /* Pick a date and stay in the current view (Day / Week / Month). */
  const selectDate = (date) => {
    setSelectedDate(date)
  }

  const selectQuickDate = (offset) => {
    const next = startOfToday()
    next.setDate(next.getDate() + offset)
    selectDay(next)
  }

  const handleToday = () => selectQuickDate(0)
  const handleYesterday = () => selectQuickDate(-1)
  const handleTomorrow = () => selectQuickDate(1)

  /*
   * Back to the current period without changing the view.
   */
  const handleCurrentPeriod = () => setSelectedDate(startOfToday())

  const navigateCalendar = (direction) => {
    const next = new Date(selectedDate)

    if (view === 'day') {
      next.setDate(next.getDate() + direction)
    }

    if (view === 'week') {
      next.setDate(next.getDate() + direction * 7)
    }

    if (view === 'month') {
      /*
       * Anchor to the 1st so Jan 31 can't skip a month.
       */
      next.setDate(1)
      next.setMonth(next.getMonth() + direction)
    }

    setSelectedDate(next)
  }

  const handlePrevious = () => navigateCalendar(-1)
  const handleNext = () => navigateCalendar(1)

  /* ---------------------------------------------------------------- */
  /* Labels                                                            */
  /* ---------------------------------------------------------------- */

  const title =
    view === 'day'
      ? formatDayTitle(selectedDate)
      : view === 'week'
        ? formatWeekTitle(selectedDate)
        : formatMonthTitle(selectedDate)

  const selectedDateLabel =
    view === 'day'
      ? getDayDateLabel(selectedDate)
      : view === 'week'
        ? getWeekDateLabel(selectedDate)
        : getMonthDateLabel(selectedDate)

  return {
    meetings,
    filteredMeetings,
    rangeMeetings,
    visibleMeetings,
    counts,
    selectedDate,
    view,
    setView,
    filter,
    setFilter,
    filters,
    setFilters,
    clearFilters,
    platforms,
    activeFilterCount,
    settings,
    title,
    selectedDateLabel,
    allVisibleAutoJoin,
    onSettingsChange,
    handleToolbarAutoJoin,
    selectDay,
    selectDate,
    handleToday,
    handleYesterday,
    handleTomorrow,
    handleCurrentPeriod,
    handlePrevious,
    handleNext,
  }
}