import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import Box from '@mui/material/Box'

import DashboardOverviewHeader from '../components/dashboard/DashboardOverviewHeader'
import DashboardSidePanels from '../components/dashboard/DashboardSidePanels'
import DashboardActionItemsCard from '../components/dashboard/DashboardActionItemsCard'
import MeetingTimeline from '../components/dashboard/MeetingTimeline'
import ConfirmMarkDoneDialog from '../components/tasks/ConfirmMarkDoneDialog'
import { D } from '../components/dashboard/dashTheme'

import {
  getAllMeetings,
  getTodaysMeetings,
  updateMeetingActionItemStatus,
} from '../data/meetings'

import {
  getMeetingSettings,
  saveMeetingSettings,
  saveMeetingSettingsBulk,
} from '../data/meetingSettings'

import useNow from '../hooks/Usenow'
import useCurrentUser from '../hooks/useCurrentUser'
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

  const [meetingSettings, setMeetingSettings] = useState(() => getMeetingSettings())
  const [doneIds, setDoneIds] = useState(() => new Set())

  // Task selected for confirmation.
  const [taskToConfirm, setTaskToConfirm] = useState(null)

  // Re-read meetings after a successful task-status update.
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
        .filter((meeting) => !Number.isNaN(meeting._start.getTime()) && !Number.isNaN(meeting._end.getTime()))
        .sort((a, b) => a._start.getTime() - b._start.getTime()),
    [userMeetings],
  )

  const allTodaysUserTasks = useMemo(
    () => tasksDueTodayForUser(getActionItemsFromMeetings(sortedMeetings), currentUser, now),
    [sortedMeetings, currentUser, now],
  )

  // Open items only (blocked stays visible so it is not forgotten).
  const actionableTasks = useMemo(
    () => allTodaysUserTasks.filter((item) => isActionableTask(item) && !doneIds.has(item.id)),
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

  const liveCount = sortedMeetings.filter((meeting) => statusOf(meeting, now) === 'live').length
  const upcomingMeetings = sortedMeetings.filter((meeting) => statusOf(meeting, now) === 'upcoming')
  const doneCount = sortedMeetings.filter((meeting) => statusOf(meeting, now) === 'past').length

  const firstName =
    currentUser?.firstName ??
    currentUser?.name?.split(' ')[0] ??
    currentUser?.fullName?.split(' ')[0] ??
    'there'

  // Both helpers persist to localStorage and return the full settings map,
  // so Dashboard and Calendar always agree.
  const handleSettingsChange = (meetingId, changes) =>
    setMeetingSettings(saveMeetingSettings(meetingId, changes))

  // "Auto-join upcoming meetings": on = invite MeetAI to every upcoming meeting.
  const autoJoinOf = (meeting) =>
    meetingSettings?.[meeting.id]?.autoJoin ?? meeting?.meetAI?.invited === true

  const handleAutoJoinAll = (next) =>
    setMeetingSettings(saveMeetingSettingsBulk(upcomingMeetings, next))

  // Step 1: open confirmation; do not mark done yet.
  const handleTaskDone = (taskId) => {
    const task = allTodaysUserTasks.find((item) => item.id === taskId)
    if (!task?.meetingId || doneIds.has(taskId)) return
    setTaskToConfirm(task)
  }

  // Step 2: persist only when the user confirms.
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
          live={liveCount}
          upcoming={upcomingMeetings.length}
          onJoinLink={outletContext.openInstant}
          onSchedule={outletContext.openCreate}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.9fr) minmax(300px, 1fr)' },
            columnGap: 3.5,
            rowGap: 3,
            alignItems: 'start',
            pt: 3,
          }}
        >
          <MeetingTimeline
            meetings={sortedMeetings}
            now={now}
            meetingSettings={meetingSettings}
            onSettingsChange={handleSettingsChange}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
            <DashboardActionItemsCard
              items={actionableTasks}
              count={actionCount}
              onToggleDone={handleTaskDone}
            />

            <DashboardSidePanels
              autoJoin={upcomingMeetings.length > 0 && upcomingMeetings.every(autoJoinOf)}
              canAutoJoin={upcomingMeetings.length > 0}
              onAutoJoinChange={handleAutoJoinAll}
              onInvite={outletContext.openInstant}
              recordings={recordings}
            />
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