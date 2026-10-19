import { useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import Box from '@mui/material/Box'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import SearchIcon from '@mui/icons-material/Search'

import SearchResults, { MAX_RESULTS } from './SearchResults'
import { getAllMeetings, getTodaysMeetings } from '../data/meetings'
import { getTasksFromDashboard } from '../data/tasks'
import useCurrentUser from '../hooks/useCurrentUser'

const PAGE_SEARCH = {
  dashboard: {
    placeholder: "Search today's meetings...",
    label: "Today's meetings",
    emptyTitle: 'No meetings found today',
    emptyDescription: 'Try another meeting title, platform, or participant.',
  },
  calendar: {
    placeholder: 'Search all meetings...',
    label: 'All meetings',
    emptyTitle: 'No meetings found',
    emptyDescription: 'Try another meeting title, platform, or participant.',
  },
  recorded: {
    placeholder: 'Search recorded meetings...',
    label: 'Recorded meetings',
    emptyTitle: 'No recorded meetings found',
    emptyDescription: 'Try another meeting title or participant.',
  },
  tasks: {
    placeholder: 'Search tasks and their meetings...',
    label: 'Tasks',
    emptyTitle: 'No matching tasks found',
    emptyDescription: 'Try a task title, meeting title, or task owner.',
  },
  details: {
    placeholder: 'Search participants in this meeting...',
    label: 'Meeting participants',
    emptyTitle: 'No matching participants found',
    emptyDescription: 'Try a participant name or email address.',
  },
  default: {
    placeholder: 'Search all meetings...',
    label: 'All meetings',
    emptyTitle: 'No meetings found',
    emptyDescription: 'Try another meeting title, platform, or participant.',
  },
}

function getPageType(pathname) {
  if (pathname === '/') return 'dashboard'
  if (pathname.startsWith('/calendar')) return 'calendar'
  if (pathname.startsWith('/recorded')) return 'recorded'
  if (pathname.startsWith('/tasks')) return 'tasks'
  if (pathname.startsWith('/meetings/')) return 'details'
  return 'default'
}

function normalise(value) {
  return String(value ?? '').trim().toLowerCase()
}

function matchesMeeting(meeting, query) {
  const participants = Array.isArray(meeting.participants)
    ? meeting.participants
        .map((person) => `${person.name ?? ''} ${person.email ?? ''}`)
        .join(' ')
    : ''

  return [
    meeting.title,
    meeting.platform,
    participants,
  ].some((value) => normalise(value).includes(query))
}

function matchesTask(task, query) {
  return [
    task.title,
    task.meetingTitle,
    task.owner,
    task.priority,
    task.status,
  ].some((value) => normalise(value).includes(query))
}

export default function HeaderSearch({ query = '', onQueryChange }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { meetingId } = useParams()
  const currentUser = useCurrentUser()

  const pageType = getPageType(location.pathname)
  const pageConfig = PAGE_SEARCH[pageType] ?? PAGE_SEARCH.default

  const meetings = useMemo(() => {
    if (pageType === 'dashboard') {
      return getTodaysMeetings()
    }

    return getAllMeetings()
  }, [pageType, location.pathname])

  const currentMeeting = useMemo(
    () =>
      meetings.find(
        (meeting) => String(meeting.id) === String(meetingId),
      ) ?? null,
    [meetings, meetingId],
  )

  const results = useMemo(() => {
    const searchValue = normalise(query)
    if (!searchValue) return []

    if (pageType === 'tasks') {
      return getTasksFromDashboard(currentUser)
        .filter((task) => matchesTask(task, searchValue))
        .slice(0, MAX_RESULTS)
        .map((task) => ({
          id: `task-${task.id}`,
          type: 'task',
          title: task.title || 'Untitled task',
          subtitle: [
            task.meetingTitle || 'Meeting',
            task.owner ? `Owner: ${task.owner}` : '',
            task.status || '',
          ].filter(Boolean).join(' · '),
          meetingId: task.meetingId,
        }))
    }

    if (pageType === 'details') {
      const participants = Array.isArray(currentMeeting?.participants)
        ? currentMeeting.participants
        : []

      return participants
        .filter((person) =>
          normalise(`${person.name ?? ''} ${person.email ?? ''}`)
            .includes(searchValue),
        )
        .slice(0, MAX_RESULTS)
        .map((person, index) => ({
          id: `participant-${person.email || person.name || index}`,
          type: 'participant',
          title: person.name || 'Unnamed participant',
          subtitle: person.email || 'Meeting participant',
          meetingId: currentMeeting.id,
        }))
    }

    let searchableMeetings = meetings

    if (pageType === 'recorded') {
      searchableMeetings = meetings.filter(
        (meeting) => meeting.recording?.available === true,
      )
    }

    return searchableMeetings
      .filter((meeting) => matchesMeeting(meeting, searchValue))
      .slice(0, MAX_RESULTS)
      .map((meeting) => ({
        ...meeting,
        type: 'meeting',
        subtitle: [
          meeting.platform || 'Meeting',
          meeting.start ? new Date(meeting.start).toLocaleString() : '',
        ].filter(Boolean).join(' · '),
      }))
  }, [query, pageType, meetings, currentUser, currentMeeting])

  const showDropdown = query.trim().length > 0

  const handleSelect = (result) => {
    onQueryChange('')

    if (result.type === 'participant') {
      // Participant search stays within the current meeting.
      return
    }

    if (result.type === 'task') {
      if (result.meetingId) {
        navigate(`/meetings/${result.meetingId}`)
      }
      return
    }

    navigate(`/meetings/${result.id}`)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      onQueryChange('')
      return
    }

    if (event.key === 'Enter' && results.length > 0) {
      event.preventDefault()
      handleSelect(results[0])
    }
  }

  return (
    <Box
      data-tour="header-search"
      sx={{ position: 'relative', flex: 1, maxWidth: 720, minWidth: 0 }}
    >
      <Paper
        component="form"
        role="search"
        elevation={0}
        onSubmit={(event) => event.preventDefault()}
        sx={{
          width: '100%',
          height: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          boxSizing: 'border-box',
          borderRadius: '12px',
          border: '1px solid',
          borderColor: showDropdown ? '#0967B2' : 'divider',
          color: 'text.secondary',
          transition: 'border-color 160ms ease, box-shadow 160ms ease',
          '&:focus-within': {
            outline: '3px solid rgba(13, 98, 201, 0.12)',
            outlineOffset: 1,
            borderColor: '#0967B2',
          },
        }}
      >
        <SearchIcon
          sx={{ fontSize: 22, flexShrink: 0, color: '#718198' }}
        />

        <InputBase
          type="search"
          placeholder={pageConfig.placeholder}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={handleKeyDown}
          inputProps={{
            'aria-label': pageConfig.placeholder,
            autoComplete: 'off',
          }}
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize: '0.875rem',
            '& input::placeholder': {
              opacity: 1,
              color: 'text.secondary',
            },
          }}
        />
      </Paper>

      {showDropdown && (
        <SearchResults
          results={results}
          heading={pageConfig.label}
          emptyTitle={pageConfig.emptyTitle}
          emptyDescription={pageConfig.emptyDescription}
          onSelect={handleSelect}
        />
      )}
    </Box>
  )
}