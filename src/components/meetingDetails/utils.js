import { formatTime } from "../../utils/time"
/* -------------------------------------------------------------------------- */
/* Meeting state calculations                                                 */
/* -------------------------------------------------------------------------- */

export function getMeetingState(
  meeting,
  now,
) {
  const start = new Date(
    meeting?.start,
  ).getTime()

  const end = new Date(
    meeting?.end,
  ).getTime()

  const current = now instanceof Date
    ? now.getTime()
    : new Date(now).getTime()

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return {
      type: 'unknown',
      remainingMs: 0,
      elapsedMs: 0,
      afterMs: 0,
    }
  }

  /*
   * Upcoming
   */
  if (current < start) {
    const remainingMs =
      start - current

    /*
     * Flash when there are 10 minutes
     * or less before the meeting.
     */
    if (remainingMs <= 10 * 60 * 1000) {
      return {
        type: 'starting-soon',
        remainingMs,
      }
    }

    return {
      type: 'upcoming',
      remainingMs,
    }
  }

  /*
   * Completed
   */
  if (current >= end) {
    return {
      type: 'completed',
      afterMs: current - end,
    }
  }

  /*
   * Meeting has started.
   */
  const elapsedMs =
    current - start

  /*
   * Flash for first 10 minutes.
   */
  if (elapsedMs <= 10 * 60 * 1000) {
    return {
      type: 'just-started',
      elapsedMs,
      remainingMs: end - current,
    }
  }

  return {
    type: 'live',
    elapsedMs,
    remainingMs: end - current,
  }
}

/* -------------------------------------------------------------------------- */
/* Attendance                                                                 */
/* -------------------------------------------------------------------------- */

export function getAttendance(
  meeting,
  participants,
) {
  /*
   * Preferred structure:
   *
   * meeting.attendance = {
   *   attended: ['email1', 'email2'],
   *   notAttended: ['email3']
   * }
   *
   * If this hasn't been added yet, we use the
   * participant-level `attended` property.
   */

  if (meeting.attendance) {
    const attendedIds = new Set(
      meeting.attendance.attended ||
        [],
    )

    const notAttendedIds = new Set(
      meeting.attendance.notAttended ||
        [],
    )

    const getPersonId = (person) =>
      person.email || person.name

    return {
      all: participants,
      attended: participants.filter(
        (person) =>
          attendedIds.has(
            getPersonId(person),
          ) ||
          attendedIds.has(person.name),
      ),
      notAttended: participants.filter(
        (person) =>
          notAttendedIds.has(
            getPersonId(person),
          ) ||
          notAttendedIds.has(person.name),
      ),
    }
  }

  const attended =
    participants.filter(
      (person) =>
        person.attended === true,
    )

  const notAttended =
    participants.filter(
      (person) =>
        person.attended === false,
    )

  /*
   * If attendance information hasn't been
   * supplied yet, don't incorrectly say that
   * everybody attended.
   */
  if (
    attended.length === 0 &&
    notAttended.length === 0
  ) {
    return {
      all: participants,
      attended: [],
      notAttended: [],
    }
  }

  return {
    all: participants,
    attended,
    notAttended,
  }
}

export function getParticipantAttendance(
  meeting,
  person,
  attended,
) {
  if (!attended) {
    return null
  }

  const participantAttendance =
    meeting.attendanceDetails?.[
      person.email
    ]

  if (
    participantAttendance?.joinedAt &&
    participantAttendance?.leftAt
  ) {
    return `${formatTime(
      participantAttendance.joinedAt,
    )} – ${formatTime(
      participantAttendance.leftAt,
    )}`
  }

  if (participantAttendance?.joinedAt) {
    return `Joined ${formatTime(
      participantAttendance.joinedAt,
    )}`
  }

  return null
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */
export function formatTimeRange(
  start,
  end,
) {
  return `${formatTime(start)} – ${formatTime(
    end,
  )}`
}

export function getDurationMinutes(
  meeting,
) {
  const start = new Date(
    meeting.start,
  ).getTime()

  const end = new Date(
    meeting.end,
  ).getTime()

  return Math.round(
    (end - start) / 60000,
  )
}

export function formatRemainingTime(ms) {
  const totalMinutes = Math.max(
    0,
    Math.ceil(ms / 60000),
  )

  const hours = Math.floor(
    totalMinutes / 60,
  )

  const minutes =
    totalMinutes % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${minutes}m`
}

export function formatElapsedTime(ms) {
  const totalMinutes = Math.max(
    0,
    Math.floor(ms / 60000),
  )

  const hours = Math.floor(
    totalMinutes / 60,
  )

  const minutes =
    totalMinutes % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${minutes}m`
}

export function getInitials(name = '') {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) {
    return '?'
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase()
  }

  return `${parts[0][0]}${parts[
    parts.length - 1
  ][0]}`.toUpperCase()
}

export function getMeetingIdFromPath(
  pathname,
) {
  const parts = pathname
    .split('/')
    .filter(Boolean)

  return parts.length > 1
    ? parts[parts.length - 1]
    : null
}