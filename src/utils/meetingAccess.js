function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function getUserNameCandidates(user) {
  const names = [
    user?.name,
    user?.displayName,
    user?.fullName,
  ]
    .filter(Boolean)
    .map(normalize)

  return [...new Set(names)]
}

function getUserEmailCandidates(user) {
  const emails = [
    user?.email,
    user?.mail,
    user?.userEmail,
  ]
    .filter(Boolean)
    .map(normalize)

  return [...new Set(emails)]
}

function nameMatches(candidate, userNames) {
  const normalizedCandidate = normalize(candidate)

  if (!normalizedCandidate) {
    return false
  }

  return userNames.some(
    (userName) =>
      normalizedCandidate === userName ||
      normalizedCandidate.startsWith(`${userName} `) ||
      userName.startsWith(`${normalizedCandidate} `),
  )
}

function emailMatches(candidate, userEmails) {
  const normalizedCandidate = normalize(candidate)

  return (
    Boolean(normalizedCandidate) &&
    userEmails.includes(normalizedCandidate)
  )
}

/**
 * Returns true when the current user owns the meeting
 * or is one of its participants.
 *
 * The helper supports the existing data shape as well as
 * common owner/organizer fields for future meeting data.
 */
export function isUserMeeting(
  meeting,
  currentUser,
) {
  if (!meeting || !currentUser) {
    return false
  }

  const userNames =
    getUserNameCandidates(currentUser)

  const userEmails =
    getUserEmailCandidates(currentUser)

  /*
   * ------------------------------------------------------------
   * Owner / organizer
   * ------------------------------------------------------------
   */
  const ownerCandidates = [
    meeting.owner,
    meeting.ownerName,
    meeting.organizer,
    meeting.organizerName,
    meeting.host,
    meeting.hostName,
  ]

  for (const owner of ownerCandidates) {
    if (
      typeof owner === 'object' &&
      owner !== null
    ) {
      if (
        emailMatches(
          owner.email,
          userEmails,
        ) ||
        nameMatches(
          owner.name,
          userNames,
        )
      ) {
        return true
      }
    } else if (
      emailMatches(owner, userEmails) ||
      nameMatches(owner, userNames)
    ) {
      return true
    }
  }

  const ownerEmailCandidates = [
    meeting.ownerEmail,
    meeting.organizerEmail,
    meeting.hostEmail,
  ]

  if (
    ownerEmailCandidates.some(
      (email) =>
        emailMatches(
          email,
          userEmails,
        ),
    )
  ) {
    return true
  }

  /*
   * ------------------------------------------------------------
   * Participants
   * ------------------------------------------------------------
   */
  const participants =
    Array.isArray(meeting.participants)
      ? meeting.participants
      : []

  return participants.some(
    (participant) => {
      if (!participant) {
        return false
      }

      if (
        typeof participant === 'string'
      ) {
        return (
          emailMatches(
            participant,
            userEmails,
          ) ||
          nameMatches(
            participant,
            userNames,
          )
        )
      }

      return (
        emailMatches(
          participant.email,
          userEmails,
        ) ||
        nameMatches(
          participant.name,
          userNames,
        )
      )
    },
  )
}

/**
 * Filters a meeting collection to meetings
 * belonging to the current user.
 */
export function filterUserMeetings(
  meetings = [],
  currentUser,
) {
  return meetings.filter(
    (meeting) =>
      isUserMeeting(
        meeting,
        currentUser,
      ),
  )
}