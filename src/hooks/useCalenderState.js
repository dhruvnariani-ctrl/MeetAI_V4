import { useEffect, useMemo, useState } from 'react'

import {
  saveMeetingSettings,
  saveMeetingSettingsBulk,
} from '../data/meetingSettings'

import useMeetingSettings from './useMeetingSettings'

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

const STATUS_REFRESH_INTERVAL = 30_000

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
 * Recalculate status from the meeting's real start/end timestamps.
 * This avoids relying on a status captured when meetings were loaded.
 */
function getDynamicMeetingStatus(meeting, now) {
  const startMs = new Date(meeting.start).getTime()
  const endMs = new Date(meeting.end).getTime()
  const nowMs = now.getTime()

  // Invalid or missing timestamps fall back to the existing status helper.
  if (
    !Number.isFinite(startMs) ||
    !Number.isFinite(endMs) ||
    endMs < startMs
  ) {
    return getStatusKey(meeting)
  }

  if (nowMs >= endMs) return 'Done'
  if (nowMs >= startMs) return 'Live'

  return 'Upcoming'
}

export default function useCalendarState(user) {
  const fallbackUser = useCurrentUser()
  const currentUser = user ?? fallbackUser

  /*
   * Refresh the clock periodically so statuses update while
   * the Calendar page stays open.
   */
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const refreshStatus = () => setNow(new Date())

    const intervalId = setInterval(
      refreshStatus,
      STATUS_REFRESH_INTERVAL,
    )

    // Recalculate immediately when the user returns to the tab.
    window.addEventListener('focus', refreshStatus)
    document.addEventListener('visibilitychange', refreshStatus)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('focus', refreshStatus)
      document.removeEventListener('visibilitychange', refreshStatus)
    }
  }, [])

  const meetings = useMemo(() => {
    const currentMeetings = getCalendarMeetings(currentUser)

    return currentMeetings.map((meeting) => ({
      ...meeting,
      type: getDynamicMeetingStatus(meeting, now),
    }))
  }, [currentUser, now])

  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [view, setView] = useState('day')
  const [filter, setFilter] = useState('All')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const settings = useMeetingSettings()
  const selectedKey = dateKey(selectedDate)

  const platforms = useMemo(
    () =>
      [...new Set(
        meetings.map((meeting) => meeting.platform).filter(Boolean),
      )].sort(),
    [meetings],
  )

  const activeFilterCount =
    filters.platforms.length +
    (filters.meetAIOnly ? 1 : 0) +
    (filters.hostedByMe ? 1 : 0)

  const clearFilters = () => setFilters(DEFAULT_FILTERS)

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
        !getMeetingToggleSettings(
          meeting,
          settings?.[meeting.id],
        ).autoJoin
      ) {
        return false
      }

      if (
        filters.hostedByMe &&
        !isHostedByUser(meeting, currentUser)
      ) {
        return false
      }

      return true
    })
  }, [
    meetings,
    filters,
    activeFilterCount,
    settings,
    currentUser,
  ])

  const rangeMeetings = useMemo(() => {
    let result = [...filteredMeetings]

    if (view === 'day') {
      result = result.filter(
        (meeting) => meeting.date === selectedKey,
      )
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

    return result.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date)
      }

      return getTimeSortValue(a.time) - getTimeSortValue(b.time)
    })
  }, [filteredMeetings, selectedDate, selectedKey, view])

  const counts = useMemo(() => {
    const result = {
      All: rangeMeetings.length,
      Live: 0,
      Upcoming: 0,
      Done: 0,
    }

    rangeMeetings.forEach((meeting) => {
      result[getStatusKey(meeting)] += 1
    })

    return result
  }, [rangeMeetings])

  const visibleMeetings = useMemo(() => {
    if (filter === 'All') return rangeMeetings

    return rangeMeetings.filter(
      (meeting) => getStatusKey(meeting) === filter,
    )
  }, [rangeMeetings, filter])

  const activeVisibleMeetings = visibleMeetings.filter(
    (meeting) => getStatusKey(meeting) !== 'Done',
  )

  const allVisibleAutoJoin =
    activeVisibleMeetings.length > 0 &&
    activeVisibleMeetings.every(
      (meeting) =>
        getMeetingToggleSettings(
          meeting,
          settings?.[meeting.id],
        ).autoJoin,
    )

  const onSettingsChange = (meetingId, changes) => {
    saveMeetingSettings(meetingId, changes)
  }

  const handleToolbarAutoJoin = (checked) => {
    saveMeetingSettingsBulk(activeVisibleMeetings, checked)
  }

  const selectDay = (date) => {
    setSelectedDate(date)
    setView('day')
  }

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

  const handleCurrentPeriod = () => {
    setSelectedDate(startOfToday())
  }

  const navigateCalendar = (direction) => {
    const next = new Date(selectedDate)

    if (view === 'day') {
      next.setDate(next.getDate() + direction)
    }

    if (view === 'week') {
      next.setDate(next.getDate() + direction * 7)
    }

    if (view === 'month') {
      next.setDate(1)
      next.setMonth(next.getMonth() + direction)
    }

    setSelectedDate(next)
  }

  const handlePrevious = () => navigateCalendar(-1)
  const handleNext = () => navigateCalendar(1)

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