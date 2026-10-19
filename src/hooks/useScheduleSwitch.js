import { useMemo } from 'react'

import { getMeetingStatus } from '../components/meetings/meetingHelpers'

const toTime = (value) =>
  value instanceof Date ? value.getTime() : new Date(value).getTime()

/*
 * Logic behind the overall "Invite MeetAI" switch on the schedule card.
 *
 * - Meetings are sorted by start time and given a status.
 * - Done meetings are ignored: they never affect the switch, and the
 *   switch never changes them.
 * - The switch is ON only when every non-Done meeting has MeetAI enabled
 *   (OFF when there are no active meetings).
 * - Turning it OFF also turns recording OFF.
 */
export default function useScheduleSwitch({
  meetings = [],
  now,
  nextId,
  settings = {},
  onSettingsChange,
}) {
  const sortedMeetings = useMemo(
    () => [...meetings].sort((a, b) => toTime(a?.start) - toTime(b?.start)),
    [meetings],
  )

  const meetingsWithStatus = useMemo(
    () =>
      sortedMeetings.map((meeting) => ({
        meeting,
        status: getMeetingStatus(meeting, now, nextId),
      })),
    [sortedMeetings, now, nextId],
  )

  const activeMeetings = useMemo(
    () =>
      meetingsWithStatus
        .filter(({ status }) => status !== 'Done')
        .map(({ meeting }) => meeting),
    [meetingsWithStatus],
  )

  const checked =
    activeMeetings.length > 0 &&
    activeMeetings.every(
      (meeting) =>
        settings?.[meeting.id]?.autoJoin ?? meeting?.meetAI?.invited ?? false,
    )

  const toggle = (value) => {
    activeMeetings.forEach((meeting) => {
      onSettingsChange?.(meeting.id, {
        autoJoin: value === true,
        ...(value === true ? {} : { recordVideo: false }),
      })
    })
  }

  return {
    sortedMeetings,
    meetingsWithStatus,
    checked,
    disabled: activeMeetings.length === 0,
    toggle,
  }
}