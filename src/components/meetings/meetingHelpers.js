/*
 * One status palette used everywhere (chips, section headers,
 * calendar dots, legend): Live = red, Upcoming = blue, Done = grey.
 */
export const STATUS_STYLES = {
  Live: {
    backgroundColor: '#fff0f0',
    color: '#c62828',
  },

  Upcoming: {
    backgroundColor: '#eaf3ff',
    color: '#1769aa',
  },

  'Up next': {
    backgroundColor: '#eaf3ff',
    color: '#1769aa',
  },

  Done: {
    backgroundColor: '#eef2f6',
    color: '#52657a',
  },
}

/**
 * Normalise a meeting (or a status string) to one of
 * 'Live' | 'Upcoming' | 'Done'. "Up next" counts as Upcoming.
 */
export function getStatusKey(value) {
  const raw =
    typeof value === 'string' ? value : (value?.type ?? value?.status)

  const status = String(raw ?? '').toLowerCase()

  if (status === 'live' || status === 'in progress') return 'Live'
  if (status === 'done' || status === 'completed') return 'Done'

  return 'Upcoming'
}

/**
 * Resolve the MeetAI toggle state.
 *
 * Priority:
 * 1. Local user changes
 * 2. Meeting data
 * 3. false
 */
export function getMeetingToggleSettings(
  meeting,
  localSettings,
) {
  return {
    autoJoin:
      localSettings?.autoJoin ??
      meeting?.meetAI?.invited ??
      false,

    recordVideo:
      localSettings?.recordVideo ??
      meeting?.meetAI?.recordVideo ??
      false,
  }
}

export function getMeetingStatus(
  meeting,
  now,
  nextId,
) {
  if (!meeting) {
    return 'Done'
  }

  const meetingStart =
    meeting.start instanceof Date
      ? meeting.start
      : new Date(meeting.start)

  const meetingEnd =
    meeting.end instanceof Date
      ? meeting.end
      : new Date(meeting.end)

  const currentTime =
    now instanceof Date
      ? now
      : new Date(now)

  /*
   * A meeting is Live when the current time
   * is between its start and end times.
   */
  if (
    currentTime >= meetingStart &&
    currentTime < meetingEnd
  ) {
    return 'Live'
  }

  /*
   * A future meeting is Up next when it is
   * the meeting identified by nextId.
   */
  if (meetingStart > currentTime) {
    if (meeting.id === nextId) {
      return 'Up next'
    }

    return 'Upcoming'
  }

  /*
   * The meeting has already ended.
   */
  return 'Done'
}

/**
 * Resolve the visual status style.
 */
export function getStatusStyle(status) {
  return (
    STATUS_STYLES[status] ??
    STATUS_STYLES.Upcoming
  )
}

/**
 * Supports both:
 * - participants as an array
 * - participants as a number
 */
export function getParticipantCount(
  participants,
) {
  if (Array.isArray(participants)) {
    return participants.length
  }

  if (
    participants !== null &&
    participants !== undefined &&
    typeof participants === 'number'
  ) {
    return participants
  }

  return 0
}

/**
 * Whether the meeting has participants.
 */
export function hasParticipants(
  participants,
) {
  if (Array.isArray(participants)) {
    return participants.length > 0
  }

  return (
    participants !== null &&
    participants !== undefined &&
    typeof participants === 'number' &&
    participants > 0
  )
}

/**
 * Whether MeetAI controls should be displayed.
 */
export function shouldShowMeetingToggles(
  status,
) {
  return (
    status === 'Live' ||
    status === 'Upcoming' ||
    status === 'Up next' ||
    status === 'Done'
  )
}

/**
 * Done meetings keep the controls visible,
 * but the controls cannot be changed.
 */
export function areMeetingTogglesDisabled(
  status,
) {
  return status === 'Done'
}