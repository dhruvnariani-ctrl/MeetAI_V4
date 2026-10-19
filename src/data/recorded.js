import { matchesDateFilter } from '../utils/dateFilters'

export const RECORDED_SORT_OPTIONS = ['Newest', 'Oldest', 'Meeting title']

/*
 * Only meetings with an available recording are shown.
 * Then: search (title / platform / participant), date filter, sort.
 */
export function getRecordedMeetings(meetings, search, dateFilter, sortBy) {
  let result = meetings.filter(
    (meeting) => meeting.recording?.available === true,
  )

  const searchValue = search.trim().toLowerCase()

  if (searchValue) {
    result = result.filter((meeting) => {
      const title = meeting.title?.toLowerCase() || ''
      const platform = meeting.platform?.toLowerCase() || ''
      const participants =
        meeting.participants
          ?.map((person) => `${person.name || ''} ${person.email || ''}`)
          .join(' ')
          .toLowerCase() || ''

      return (
        title.includes(searchValue) ||
        platform.includes(searchValue) ||
        participants.includes(searchValue)
      )
    })
  }

  result = result.filter((meeting) =>
    matchesDateFilter(meeting.start, dateFilter),
  )

  if (sortBy === 'Newest') {
    result.sort((a, b) => new Date(b.start) - new Date(a.start))
  }

  if (sortBy === 'Oldest') {
    result.sort((a, b) => new Date(a.start) - new Date(b.start))
  }

  if (sortBy === 'Meeting title') {
    result.sort((a, b) => a.title.localeCompare(b.title))
  }

  return result
}