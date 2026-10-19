import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import Box from '@mui/material/Box'

import DashboardOverviewHeader from '../components/dashboard/DashboardOverviewHeader'
import DashboardSidePanels from '../components/dashboard/DashboardSidePanels'
import DashboardActionItemsCard from '../components/dashboard/DashboardActionItemsCard'
import MeetingTimeline from '../components/dashboard/MeetingTimeline'
import ConfirmMarkDoneDialog from '../components/tasks/ConfirmMarkDoneDialog'
import { D } from '../components/dashboard/dashTheme'
import { getMeetingToggleSettings } from '../components/meetings/meetingHelpers'

import {
  getAllMeetings,
  getTodaysMeetings,
  updateMeetingActionItemStatus,
} from '../data/meetings'

import { saveMeetingSettings } from '../data/meetingSettings'

import useNow from '../hooks/Usenow'
import useCurrentUser from '../hooks/useCurrentUser'
import useMeetingSettings from '../hooks/useMeetingSettings'
import { filterUserMeetings } from '../utils/meetingAccess'

import {
  formatDue,
  getActionItemsFromMeetings,
  isActionableTask,
  isSameDay,
  statusOf,
  tasksDueTodayForUser,
} from '../components/dashboard/dashboardUtils'

const RECENT_RECORDINGS = 2

export default function Dashboard() {
  const now = useNow()
  const currentUser = useCurrentUser()
  const outletContext = useOutletContext() ?? {}

  // Live copy of the saved MeetAI switches: a change on any page shows up here at once.
  const meetingSettings = useMeetingSettings()

  const [doneIds, setDoneIds] = useState(() => new Set())
  const [taskToConfirm, setTaskToConfirm] = useState(null)
  const [taskStatusVersion, setTaskStatusVersion] = useState(0)

  const userMeetings = useMemo(
    () => filterUserMeetings(getTodaysMeetings(now), currentUser),
    [now, currentUser, taskStatusVersion],
  )

  const sortedMeetings = useMemo(
    () =>
      [...userMeetings]
        .map((meeting) => ({
          ...meeting,
          _start: meeting._start instanceof Date ? meeting._start : new Date(meeting.start),
          _end: meeting._end instanceof Date ? meeting._end : new Date(meeting.end),
        }))
        .filter(
          (meeting) =>
            !Number.isNaN(meeting._start.getTime()) &&
            !Number.isNaN(meeting._end.getTime()),
        )
        .sort((a, b) => a._start.getTime() - b._start.getTime()),
    [userMeetings],
  )

  const allTodaysUserTasks = useMemo(
    () =>
      tasksDueTodayForUser(
        getActionItemsFromMeetings(sortedMeetings),
        currentUser,
        now,
      ),
    [sortedMeetings, currentUser, now],
  )

  const actionableTasks = useMemo(
    () =>
      allTodaysUserTasks.filter(
        (item) => isActionableTask(item) && !doneIds.has(item.id),
      ),
    [allTodaysUserTasks, doneIds],
  )

  const actionCount = actionableTasks.filter((item) => item.status !== 'blocked').length

  const recordings = useMemo(
    () =>
      filterUserMeetings(getAllMeetings(now), currentUser)
        .filter((meeting) => meeting.recording?.available === true)
        .sort((a, b) => new Date(b.start) - new Date(a.start))
        .slice(0, RECENT_RECORDINGS)
        .map((meeting) => ({
          id: meeting.id,
          title: meeting.title,
          when: isSameDay(meeting.start, now) ? 'Today' : formatDue(meeting.start),
          duration: meeting.recording.duration ?? '',
          actions: Array.isArray(meeting.actionItems) ? meeting.actionItems.length : 0,
        })),
    [now, currentUser, taskStatusVersion],
  )

  const liveMeetings = sortedMeetings.filter((meeting) => statusOf(meeting, now) === 'live')
  const upcomingMeetings = sortedMeetings.filter((meeting) => statusOf(meeting, now) === 'upcoming')
  const doneCount = sortedMeetings.filter((meeting) => statusOf(meeting, now) === 'past').length

  /* ---------- MeetAI status for the header card, all from the saved settings ---------- */

  // Saved value first, then the meeting's own default. Video recording needs MeetAI on.
  const settingsOf = (meeting) => {
    const saved = getMeetingToggleSettings(meeting, meetingSettings?.[meeting.id])
    return {
      autoJoin: saved.autoJoin === true,
      recordVideo: saved.autoJoin === true && saved.recordVideo === true,
    }
  }

  const invitedUpcoming = upcomingMeetings.filter((meeting) => settingsOf(meeting).autoJoin)
  const liveMeeting = liveMeetings[0]

  const liveNow = liveMeeting
    ? {
        title: liveMeeting.title,
        inMeeting: settingsOf(liveMeeting).autoJoin,
        recording: settingsOf(liveMeeting).recordVideo,
      }
    : null

  const firstName =
    currentUser?.firstName ??
    currentUser?.name?.split(' ')[0] ??
    currentUser?.fullName?.split(' ')[0] ??
    'there'

  // Saving announces the change; useMeetingSettings updates every page that shows it.
  const handleSettingsChange = (meetingId, changes) => {
    saveMeetingSettings(meetingId, changes)
  }

  // "Auto-join": every upcoming meeting. Turning it off also turns video recording off.
  const handleAutoJoinAll = (next) =>
    upcomingMeetings.forEach((meeting) =>
      saveMeetingSettings(meeting.id, next ? { autoJoin: true } : { autoJoin: false, recordVideo: false }),
    )

  // "Record video": only the meetings MeetAI is joining.
  const handleRecordAll = (next) =>
    invitedUpcoming.forEach((meeting) => saveMeetingSettings(meeting.id, { recordVideo: next }))

  const handleTaskDone = (taskId) => {
    const task = allTodaysUserTasks.find((item) => item.id === taskId)

    if (!task?.meetingId || doneIds.has(taskId)) return

    setTaskToConfirm(task)
  }

  const handleConfirmTaskDone = () => {
    if (!taskToConfirm?.meetingId) return

    updateMeetingActionItemStatus(taskToConfirm.meetingId, taskToConfirm.id, 'Done')

    setDoneIds((previous) => new Set(previous).add(taskToConfirm.id))
    setTaskToConfirm(null)
    setTaskStatusVersion((version) => version + 1)
  }

  return (
    <>
      <Box sx={{ width: '100%', minWidth: 0, color: D.text }}>
        <DashboardOverviewHeader
          now={now}
          firstName={firstName}
          total={sortedMeetings.length}
          done={doneCount}
          live={liveMeetings.length}
          upcoming={upcomingMeetings.length}
          onJoinLink={outletContext.openInstant}
          onSchedule={outletContext.openCreate}
          sidePanel={
            <DashboardSidePanels
              autoJoin={upcomingMeetings.length > 0 && invitedUpcoming.length === upcomingMeetings.length}
              canAutoJoin={upcomingMeetings.length > 0}
              invitedCount={invitedUpcoming.length}
              totalCount={upcomingMeetings.length}
              recordVideo={invitedUpcoming.length > 0 && invitedUpcoming.every((meeting) => settingsOf(meeting).recordVideo)}
              liveNow={liveNow}
              onAutoJoinChange={handleAutoJoinAll}
              onRecordVideoChange={handleRecordAll}
              onInvite={outletContext.openInstant}
              showAssistant
              showRecordings={false}
            />
          }
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              lg: 'minmax(0, 1.9fr) minmax(300px, 1fr)',
            },
            columnGap: 3.5,
            rowGap: 3,
            alignItems: 'start',
            pt: 3,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <MeetingTimeline
              meetings={sortedMeetings}
              now={now}
              meetingSettings={meetingSettings}
              onSettingsChange={handleSettingsChange}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
            <DashboardActionItemsCard
              items={actionableTasks}
              count={actionCount}
              onToggleDone={handleTaskDone}
            />

            <DashboardSidePanels recordings={recordings} showAssistant={false} showRecordings />
          </Box>
        </Box>
      </Box>

      <ConfirmMarkDoneDialog
        open={Boolean(taskToConfirm)}
        taskTitle={taskToConfirm?.title ?? ''}
        onCancel={() => setTaskToConfirm(null)}
        onConfirm={handleConfirmTaskDone}
      />
    </>
  )
}