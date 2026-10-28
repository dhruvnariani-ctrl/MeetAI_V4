
import { useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'

import DashboardActionItemsCard from '../components/dashboard/DashboardActionItemsCard'
import MeetingTimeline from '../components/dashboard/MeetingTimeline'
import ConfirmMarkDoneDialog from '../components/tasks/ConfirmMarkDoneDialog'
import { D } from '../components/dashboard/dashTheme'

import {
  getTodaysMeetings,
  updateMeetingActionItemStatus,
} from '../data/meetings'

import { saveMeetingSettings } from '../data/meetingSettings'

import useNow from '../hooks/Usenow'
import useCurrentUser from '../hooks/useCurrentUser'
import useMeetingSettings from '../hooks/useMeetingSettings'
import { filterUserMeetings } from '../utils/meetingAccess'

import {
  getActionItemsFromMeetings,
  isActionableTask,
  tasksDueTodayForUser,
} from '../components/dashboard/dashboardUtils'

export default function Dashboard() {
  const now = useNow()
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const outletContext = useOutletContext() ?? {}
  const meetingSettings = useMeetingSettings()

  const [doneIds, setDoneIds] = useState(() => new Set())
  const [taskToConfirm, setTaskToConfirm] = useState(null)
  const [taskStatusVersion, setTaskStatusVersion] = useState(0)

  const sortedMeetings = useMemo(() => {
    return filterUserMeetings(getTodaysMeetings(now), currentUser)
      .map((meeting) => ({
        ...meeting,
        _start:
          meeting._start instanceof Date
            ? meeting._start
            : new Date(meeting.start),
        _end:
          meeting._end instanceof Date
            ? meeting._end
            : new Date(meeting.end),
      }))
      .filter(
        (meeting) =>
          !Number.isNaN(meeting._start.getTime()) &&
          !Number.isNaN(meeting._end.getTime()),
      )
      .sort((a, b) => a._start.getTime() - b._start.getTime())
  }, [now, currentUser, taskStatusVersion])

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

  const actionCount = actionableTasks.filter(
    (item) => item.status !== 'blocked',
  ).length

  const recentRecordings = useMemo(() => {
    return [...sortedMeetings]
      .filter((meeting) => {
        const status = String(
          meeting.status ?? meeting.type ?? '',
        ).toLowerCase()

        const completed =
          status === 'done' ||
          status === 'completed' ||
          meeting._end < now

        const meetAI = meeting.meetAI ?? {}

        const hasTranscript =
          Boolean(meeting.transcript) ||
          Boolean(meetAI.transcript) ||
          Boolean(meetAI.recordTranscript)

        const hasVideo =
          Boolean(meeting.recording) ||
          Boolean(meeting.videoRecording) ||
          Boolean(meetAI.recordVideo)

        return completed && (hasTranscript || hasVideo)
      })
      .sort((a, b) => b._start.getTime() - a._start.getTime())
      .slice(0, 3)
  }, [sortedMeetings, now])

  const handleSettingsChange = (meetingId, changes) => {
    saveMeetingSettings(meetingId, changes)
  }

  const handleTaskDone = (taskId) => {
    const task = allTodaysUserTasks.find((item) => item.id === taskId)

    if (!task?.meetingId || doneIds.has(taskId)) return

    setTaskToConfirm(task)
  }

  const handleConfirmTaskDone = () => {
    if (!taskToConfirm?.meetingId) return

    updateMeetingActionItemStatus(
      taskToConfirm.meetingId,
      taskToConfirm.id,
      'Done',
    )

    setDoneIds((previous) => new Set(previous).add(taskToConfirm.id))
    setTaskToConfirm(null)
    setTaskStatusVersion((version) => version + 1)
  }

  return (
    <>
      <Box sx={{ width: '100%', minWidth: 0, color: D.text }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              lg: 'minmax(0, 1.9fr) minmax(280px, 1fr)',
            },
            columnGap: 3,
            rowGap: 3,
            alignItems: 'start',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <MeetingTimeline
              meetings={sortedMeetings}
              now={now}
              meetingSettings={meetingSettings}
              onSettingsChange={handleSettingsChange}
              onSchedule={() => outletContext.openCreate?.()}
              onInvite={() => outletContext.openInstant?.()}
            />
          </Box>

          <Box
            sx={{
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <DashboardActionItemsCard
              items={actionableTasks}
              count={actionCount}
              onToggleDone={handleTaskDone}
            />

            <Box
              component="section"
              aria-label="Recent recordings"
              sx={{ minWidth: 0 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  mb: 1.25,
                }}
              >
                <Typography
                  component="h2"
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: D.navy,
                  }}
                >
                  Recent Recordings
                </Typography>

                <Button
                  size="small"
                  onClick={() => navigate('/recordings')}
                  endIcon={
                    <ArrowOutwardRoundedIcon
                      sx={{ fontSize: '12px !important' }}
                    />
                  }
                  sx={{
                    color: D.navy,
                    fontSize: '.75rem',
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  View all
                </Button>
              </Box>

              {recentRecordings.length === 0 ? (
                <Typography
                  sx={{
                    fontSize: '.8125rem',
                    color: D.muted,
                    py: 1,
                  }}
                >
                  No recent recordings available for today.
                </Typography>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.75,
                  }}
                >
                  {recentRecordings.map((meeting) => {
                    const meetAI = meeting.meetAI ?? {}

                    const hasVideo =
                      Boolean(meeting.recording) ||
                      Boolean(meeting.videoRecording) ||
                      Boolean(meetAI.recordVideo)

                    return (
                      <Box
                        key={meeting.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1.25,
                          border: `1px solid ${D.line}`,
                          borderRadius: '6px',
                          bgcolor: '#fff',
                        }}
                      >
                        {hasVideo ? (
                          <PlayCircleOutlineRoundedIcon
                            sx={{ fontSize: 20, color: D.navy }}
                          />
                        ) : (
                          <DescriptionOutlinedIcon
                            sx={{ fontSize: 20, color: D.navy }}
                          />
                        )}

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            noWrap
                            sx={{
                              fontSize: '.8125rem',
                              fontWeight: 500,
                              color: D.navy,
                            }}
                          >
                            {meeting.title}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: '.6875rem',
                              color: D.muted,
                            }}
                          >
                            {hasVideo ? 'Video recording' : 'Transcript'}
                          </Typography>
                        </Box>

                        <Button
                          size="small"
                          onClick={() =>
                            navigate(`/meetings/${meeting.id}`)
                          }
                          sx={{
                            flexShrink: 0,
                            fontSize: '.6875rem',
                            textTransform: 'none',
                            color: D.navy,
                          }}
                        >
                          Open
                        </Button>
                      </Box>
                    )
                  })}
                </Box>
              )}
            </Box>
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
