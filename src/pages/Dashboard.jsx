
import { useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'

import MeetingTimeline from '../components/dashboard/MeetingTimeline'
import ConfirmMarkDoneDialog from '../components/tasks/ConfirmMarkDoneDialog'

import { MonthGrid } from '../components/calendar/CalendarViews'

import { D, titleSx } from '../components/dashboard/dashTheme'
import {
  getAllMeetings,
  updateMeetingActionItemStatus,
} from '../data/meetings'

import useNow from '../hooks/Usenow'
import useCurrentUser from '../hooks/useCurrentUser'
import useCalendarState from '../hooks/useCalenderState'

import { filterUserMeetings } from '../utils/meetingAccess'
import {
  getActionItemsFromMeetings,
  isActionableTask,
  tasksDueTodayForUser,
} from '../components/dashboard/dashboardUtils'

// One radius for everything
const R = '12px'

// Horizontal layout unchanged
const COLUMNS = {
  xs: 'minmax(0, 1fr)',
  lg: '60fr 40fr',
}

const cardSx = {
  border: '1px solid #EAEAEA',
  borderRadius: R,
  bgcolor: '#FFFFFF',
}

const compactButtonSx = {
  borderRadius: R,
  px: 2.5,
  fontSize: '0.82rem',
  fontWeight: 600,
  textTransform: 'none',
  whiteSpace: 'nowrap',
}

function validDate(value) {
  if (!value) return null

  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getMeetingDateKey(meeting) {
  if (
    typeof meeting?.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(meeting.date)
  ) {
    return meeting.date
  }

  const date = validDate(
    meeting?.startTime ??
      meeting?.start ??
      meeting?.scheduledStart ??
      meeting?.start_at,
  )

  return date ? toDateKey(date) : ''
}

function getMonthLabel(date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const outletContext = useOutletContext() ?? {}

  const now = useNow()
  const currentUser = useCurrentUser()

  const {
    settings: meetingSettings,
    onSettingsChange: handleMeetingSettingsChange,
  } = useCalendarState(currentUser)

  const [viewDate, setViewDate] = useState(() => new Date())

  const [meetAIUrl, setMeetAIUrl] = useState('')
  const [confirmMeetAI, setConfirmMeetAI] = useState(false)
  const [pendingMeetAIUrl, setPendingMeetAIUrl] = useState('')

  const [doneIds, setDoneIds] = useState([])
  const [taskToConfirm, setTaskToConfirm] = useState(null)
  const [taskStatusVersion, setTaskStatusVersion] = useState(0)

  const allMeetings = useMemo(
    () =>
      filterUserMeetings(getAllMeetings(), currentUser)
        .map(meeting => ({
          ...meeting,
          _start: validDate(
            meeting.startTime ??
              meeting.start ??
              meeting.scheduledStart ??
              meeting.start_at,
          ),
          _end: validDate(
            meeting.endTime ??
              meeting.end ??
              meeting.scheduledEnd ??
              meeting.end_at,
          ),
        }))
        .sort((a, b) => {
          if (!a._start) return 1
          if (!b._start) return -1
          return a._start - b._start
        }),
    [currentUser, taskStatusVersion],
  )

  const todayMeetings = useMemo(() => {
    const todayKey = toDateKey(now)

    return allMeetings.filter(
      meeting => getMeetingDateKey(meeting) === todayKey,
    )
  }, [now, allMeetings])

  const calendarMeetings = useMemo(
    () =>
      allMeetings.map(meeting => ({
        ...meeting,
        date: getMeetingDateKey(meeting),
      })),
    [allMeetings],
  )

  // eslint-disable-next-line no-unused-vars
  const actionableTasks = useMemo(() => {
    const allTasks = getActionItemsFromMeetings(todayMeetings)

    return tasksDueTodayForUser(allTasks, currentUser).filter(
      task => isActionableTask(task) && !doneIds.includes(task.id),
    )
  }, [todayMeetings, currentUser, doneIds, taskStatusVersion])

  const handleConfirmTaskDone = async () => {
    if (!taskToConfirm) return

    await updateMeetingActionItemStatus(taskToConfirm, 'Done')

    setDoneIds(previous => [...previous, taskToConfirm.id])
    setTaskToConfirm(null)
    setTaskStatusVersion(version => version + 1)
  }

  // Validate the meeting URL and open confirmation dialog
  const handleAddMeetAI = () => {
    const link = meetAIUrl.trim()

    if (!link) return

    try {
      const url = new URL(link)

      if (
        !['http:', 'https:'].includes(url.protocol) ||
        !url.hostname.includes('.')
      ) {
        return
      }
    } catch {
      return
    }

    setPendingMeetAIUrl(link)
    setConfirmMeetAI(true)
  }

  // Add MeetAI with the selected recording preference
  const handleConfirmAddMeetAI = async recordMeeting => {
    if (!pendingMeetAIUrl || !outletContext.addMeetAI) return

    try {
      await outletContext.addMeetAI(pendingMeetAIUrl, {
        recordMeeting,
      })

      setMeetAIUrl('')
      setPendingMeetAIUrl('')
      setConfirmMeetAI(false)
    } catch (error) {
      console.error('Unable to add MeetAI:', error)
    }
  }

  const handleCancelAddMeetAI = () => {
    setConfirmMeetAI(false)
    setPendingMeetAIUrl('')
  }

  const shiftMonth = offset => {
    const next = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + offset,
      1,
    )

    const today = new Date()

    const isCurrentMonth =
      next.getFullYear() === today.getFullYear() &&
      next.getMonth() === today.getMonth()

    setViewDate(isCurrentMonth ? today : next)
  }

  const handleScheduleMeeting = () => {
    outletContext.openCreate?.()
  }

  const handleOpenInstantMeeting = () => {
    outletContext.openInstant?.()
  }

  const arrowSx = {
    minWidth: 34,
    width: 34,
    height: 34,
    p: 0,
    color: '#555555',
    borderRadius: R,
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0, pb: 1.8 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: COLUMNS,
          columnGap: 3,
          alignItems: 'center',
          mb: 0.6,
        }}
      >
        <Typography
          component="h1"
          sx={{
            ...titleSx,
            fontSize: { xs: '1.5rem', md: '1.65rem' },
            fontWeight: 400,
          }}
        >
          Good Morning, {currentUser.name}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate('/calendar')}
            endIcon={
              <ArrowOutwardRoundedIcon
                sx={{ fontSize: '12px !important' }}
              />
            }
            sx={{
              ...compactButtonSx,
              py: 0.88,
              color: '#202020',
              borderColor: '#D5D5D5',
              bgcolor: '#FFFFFF',
              '&:hover': {
                borderColor: '#202020',
                bgcolor: '#F7F7F7',
              },
            }}
          >
            Open Full Calendar
          </Button>

          <Button
            variant="contained"
            disableElevation
            startIcon={<AddRoundedIcon />}
            onClick={handleScheduleMeeting}
            sx={{
              ...compactButtonSx,
              py: 0.88,
              bgcolor: D.navy,
              color: '#FFFFFF',
              '&:hover': { bgcolor: D.navy },
            }}
          >
            Schedule a Meeting
          </Button>
        </Box>
      </Box>

      {/* Body */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: COLUMNS,
          gap: 2.4,
          alignItems: 'start',
          minWidth: 0,
          pt: 0,
        }}
      >
        {/* LEFT: Timeline */}
        <Box sx={{ minWidth: 0 }}>
          <MeetingTimeline
            meetings={allMeetings}
            now={now}
            meetingSettings={meetingSettings}
            onSettingsChange={handleMeetingSettingsChange}
            onSchedule={handleScheduleMeeting}
            onInvite={handleOpenInstantMeeting}
            compact
          />
        </Box>

        {/* RIGHT */}
        <Box
          sx={{
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.2,
          }}
        >
          {/* Add MeetAI */}
          <Box data-tour="dashboard-add-meetai" sx={{ ...cardSx, p: 1.6 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: R,
                  bgcolor: '#E6F4E1',
                  color: D.green,
                }}
              >
                <LinkRoundedIcon />
              </Box>

              <Box  sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#202020',
                    lineHeight: 1.3,
                  }}
                >
                  Add MeetAI to a call
                </Typography>

                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: '#666666',
                    lineHeight: 1.45,
                  }}
                >
                  Paste a Teams, Zoom or Google Meet link. MeetAI joins.
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'stretch',
                pt: 1.5,
              }}
            >
              <TextField
                fullWidth
                size="small"
                value={meetAIUrl}
                onChange={event => setMeetAIUrl(event.target.value)}
                placeholder="https://..."
                type="url"
                onKeyDown={event => {
                  if (event.key === 'Enter') handleAddMeetAI()
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: R,
                    fontSize: '0.82rem',
                    bgcolor: '#FFFFFF',
                  },
                }}
              />

              <Button
                variant="contained"
                disableElevation
                onClick={handleAddMeetAI}
                disabled={!meetAIUrl.trim()}
                sx={{
                  ...compactButtonSx,
                  bgcolor: D.green,
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: '#2C6C16' },
                }}
              >
                Add
              </Button>
            </Box>
          </Box>

          {/* Calendar */}
          <Box sx={{ ...cardSx, overflow: 'hidden' }}>
            <Box
              sx={{
                px: 2,
                py: 1.2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                sx={{
                  fontFamily: D.serif,
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#242424',
                }}
              >
                {getMonthLabel(viewDate)}
              </Typography>

              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Button
                  onClick={() => shiftMonth(-1)}
                  aria-label="Previous month"
                  sx={arrowSx}
                >
                  <ChevronLeftRoundedIcon />
                </Button>

                <Button
                  onClick={() => shiftMonth(1)}
                  aria-label="Next month"
                  sx={arrowSx}
                >
                  <ChevronRightRoundedIcon />
                </Button>
              </Box>
            </Box>

            <Box
              sx={{
                px: 1.5,
                pb: 1.2,
                '& > *': { border: 'none', borderRadius: 0 },
              }}
            >
              <MonthGrid
                selectedDate={viewDate}
                meetings={calendarMeetings}
                onOpenDay={setViewDate}
                compact
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* MeetAI recording confirmation */}
      <Dialog
        open={confirmMeetAI}
        onClose={handleCancelAddMeetAI}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: R,
            p: 0.5,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: D.navy,
            pb: 0.5,
          }}
        >
          Add MeetAI to your meeting?
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              fontSize: '.9rem',
              color: '#555555',
              lineHeight: 1.65,
            }}
          >
            MeetAI will be added to your meeting.
            Would you like to record the meeting as well?
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 2.5,
            pb: 2,
            gap: 0.75,
            flexWrap: 'wrap',
          }}
        >
          <Button
            onClick={handleCancelAddMeetAI}
            sx={{
              color: '#555555',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="outlined"
            onClick={() => handleConfirmAddMeetAI(false)}
            sx={{
              borderRadius: R,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Add MeetAI
          </Button>

          <Button
            variant="contained"
            disableElevation
            onClick={() => handleConfirmAddMeetAI(true)}
            sx={{
              bgcolor: D.green,
              color: '#FFFFFF',
              borderRadius: R,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#2C6C16',
              },
            }}
          >
            Add & Record
          </Button>
        </DialogActions>
      </Dialog>

      {/* Existing task confirmation */}
      <ConfirmMarkDoneDialog
        open={Boolean(taskToConfirm)}
        task={taskToConfirm}
        taskTitle={taskToConfirm?.title ?? taskToConfirm?.text ?? ''}
        onCancel={() => setTaskToConfirm(null)}
        onConfirm={handleConfirmTaskDone}
      />
    </Box>
  )
}
