const STORAGE_KEY = 'meetai-meeting-settings'

function readStoredSettings() {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY,
      )

    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw)

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed)
    ) {
      return {}
    }

    return parsed
  } catch {
    return {}
  }
}

function writeStoredSettings(settings) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(settings),
    )
  } catch {
    // Ignore localStorage failures.
  }
}

/*
 * ============================================================================
 * CREATE INITIAL SETTINGS
 * ============================================================================
 *
 * Priority:
 *
 * 1. Previously saved localStorage setting
 * 2. meeting.meetAI.invited
 * 3. false
 *
 * Recording:
 *
 * 1. Previously saved recording setting
 * 2. meeting.meetAI.recordVideo
 * 3. false
 *
 * If MeetAI is OFF, recording is ALWAYS OFF.
 */
export function createMeetingSettings(
  meetings = [],
) {
  const stored =
    readStoredSettings()

  return meetings.reduce(
    (result, meeting) => {
      if (!meeting?.id) {
        return result
      }

      const saved =
        stored[meeting.id]

      const autoJoin =
        saved?.autoJoin ??
        meeting?.meetAI?.invited ??
        false

      const recordVideo =
        autoJoin === true
          ? (
              saved?.recordVideo ??
              meeting?.meetAI?.recordVideo ??
              false
            )
          : false

      result[meeting.id] = {
        autoJoin:
          autoJoin === true,

        recordVideo:
          recordVideo === true,
      }

      return result
    },
    {},
  )
}

/*
 * ============================================================================
 * GET ALL SAVED SETTINGS
 * ============================================================================
 */
export function getMeetingSettings() {
  return readStoredSettings()
}

/*
 * ============================================================================
 * SAVE ONE MEETING
 * ============================================================================
 *
 * IMPORTANT:
 *
 * This function MERGES changes into the existing meeting settings.
 *
 * Example:
 *
 * saveMeetingSettings('m3', {
 *   autoJoin: true,
 * })
 *
 * will NOT accidentally remove recordVideo.
 *
 * If autoJoin becomes false:
 *
 * recordVideo is automatically forced to false.
 */
export function saveMeetingSettings(
  meetingId,
  changes = {},
) {
  if (!meetingId) {
    return readStoredSettings()
  }

  const current =
    readStoredSettings()

  const existing =
    current[meetingId] ?? {}

  const nextAutoJoin =
    changes?.autoJoin ??
    existing?.autoJoin ??
    false

  const nextRecordVideo =
    nextAutoJoin === true
      ? (
          changes?.recordVideo ??
          existing?.recordVideo ??
          false
        )
      : false

  const nextSettings = {
    ...current,

    [meetingId]: {
      ...existing,

      ...changes,

      autoJoin:
        nextAutoJoin === true,

      recordVideo:
        nextRecordVideo === true,
    },
  }

  writeStoredSettings(
    nextSettings,
  )

  return nextSettings
}

/*
 * ============================================================================
 * SAVE MULTIPLE MEETINGS
 * ============================================================================
 *
 * Used by the overall Calendar / Dashboard MeetAI switch.
 *
 * checked === true:
 *
 *   MeetAI ON
 *   Recording is NOT automatically enabled.
 *
 * checked === false:
 *
 *   MeetAI OFF
 *   Recording OFF
 *
 * IMPORTANT:
 *
 * The caller should pass only meetings that are allowed to change.
 *
 * Done meetings should NOT be passed to this function when the overall
 * switch is being used.
 */
export function saveMeetingSettingsBulk(
  meetings = [],
  checked,
) {
  const current =
    readStoredSettings()

  const next = {
    ...current,
  }

  meetings.forEach(
    (meeting) => {
      if (!meeting?.id) {
        return
      }

      const existing =
        next[meeting.id] ?? {}

      next[meeting.id] = {
        ...existing,

        autoJoin:
          checked === true,

        ...(checked === true
          ? {}
          : {
              recordVideo: false,
            }),
      }
    },
  )

  writeStoredSettings(next)

  return next
}

/*
 * ============================================================================
 * REMOVE ONE MEETING'S SAVED SETTINGS
 * ============================================================================
 *
 * Useful if test data changes and an old localStorage value is causing
 * confusing results during development.
 */
export function clearMeetingSettings(
  meetingId,
) {
  if (!meetingId) {
    return readStoredSettings()
  }

  const current =
    readStoredSettings()

  const next = {
    ...current,
  }

  delete next[meetingId]

  writeStoredSettings(next)

  return next
}

/*
 * ============================================================================
 * CLEAR ALL MEETING SETTINGS
 * ============================================================================
 *
 * Useful during development/testing.
 *
 * This removes only MeetAI meeting settings.
 * It does NOT remove unrelated localStorage data.
 */
export function clearAllMeetingSettings() {
  if (
    typeof window === 'undefined'
  ) {
    return
  }

  try {
    window.localStorage.removeItem(
      STORAGE_KEY,
    )
  } catch {
    // Ignore localStorage failures.
  }
}