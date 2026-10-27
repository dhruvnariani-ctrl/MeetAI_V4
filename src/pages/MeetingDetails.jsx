
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'

import { EmptyPanel } from '../components/PageShell'
import MeetingHeader from '../components/meetingDetails/MeetingHeader'
import MeetingRail from '../components/meetingDetails/MeetingRail'
import MeetingTabs, {
  VALID_TABS,
} from '../components/meetingDetails/MeetingTabs'
import OverviewTab from '../components/meetingDetails/OverviewTab'
import KeyTakeawaysTab from '../components/meetingDetails/KeyTakeawaysTab'
import RecordingTab from '../components/meetingDetails/RecordingTab'
import TranscriptTab from '../components/meetingDetails/TranscriptTab'
import ActionItemsTab from '../components/meetingDetails/ActionItemsTab'
import ParticipantRow from '../components/meetingDetails/ParticipantRow'

import { D, sectionHeadSx, titleSx } from '../components/dashboard/dashTheme'
import { getMeetingToggleSettings } from '../components/meetings/meetingHelpers'

import {
  getMeetingState,
  getAttendance,
  getDurationMinutes,
  formatTimeRange,
  getInitials,
} from '../components/meetingDetails/utils'

import { formatDate } from '../utils/time'
import usePageTitle from '../hooks/usePageTitle'
import { getMeetingById } from '../data/meetings'
import { saveMeetingSettings } from '../data/meetingSettings'
import useMeetingSettings from '../hooks/useMeetingSettings'

const getTabFromSearchParams = (searchParams) => {
  const requested = searchParams.get('tab')
  return VALID_TABS.includes(requested) ? requested : 'overview'
}

function ParticipantsTab({ attendance, meeting }) {
  const people = attendance.all || []
  const attendedKeys = new Set(
    (attendance.attended || []).map((p) => p.email || p.name),
  )
  const notAttendedKeys = new Set(
    (attendance.notAttended || []).map((p) => p.email || p.name),
  )

  return (
    <Box component="section" aria-label="Meeting participants" sx={{ minWidth: 0 }}>
      <Box sx={{ ...sectionHeadSx, mb: 1.5 }}>
        <Typography component="h2" sx={titleSx}>
          Participants
        </Typography>
        <Typography sx={{ fontSize: '.75rem', color: D.muted }}>
          {people.length} total
        </Typography>
      </Box>

      {people.length > 0 ? (
        <Box
          component="ul"
          sx={{
            m: 0,
            p: 0,
            listStyle: 'none',
            borderTop: `1px solid ${D.line}`,
          }}
        >
          {people.map((person, index) => {
            const key = person.email || person.name || index
            const attended = attendedKeys.has(key)
              ? true
              : notAttendedKeys.has(key)
                ? false
                : null

            return (
              <Box
                component="li"
                key={key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  py: 1.25,
                  borderBottom: `1px solid ${D.line}`,
                }}
              >
                <Box
                  aria-hidden="true"
                  sx={{
                    width: 38,
                    height: 38,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '50%',
                    bgcolor: '#DCE5F7',
                    color: D.navy,
                    fontSize: '.75rem',
                    fontWeight: 700,
                  }}
                >
                  {getInitials(person.name)}
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '.875rem',
                      fontWeight: 600,
                      color: D.navy,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {person.name || 'Unnamed participant'}
                  </Typography>

                  {(person.email || person.role || person.title || person.department) && (
                    <Typography
                      sx={{
                        mt: 0.25,
                        fontSize: '.75rem',
                        color: D.muted,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {[
                        person.email,
                        person.role || person.title || person.department,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  )}
                </Box>

                <Typography
                  sx={{
                    flexShrink: 0,
                    fontSize: '.75rem',
                    fontWeight: 500,
                    color:
                      attended === true
                        ? D.greenText
                        : attended === false
                          ? D.muted
                          : D.text,
                  }}
                >
                  {attended === true
                    ? 'Attended'
                    : attended === false
                      ? 'Did not attend'
                      : 'Unknown'}
                </Typography>
              </Box>
            )
          })}
        </Box>
      ) : (
        <Typography sx={{ fontSize: '.875rem', color: D.muted }}>
          No participants are available for this meeting.
        </Typography>
      )}
    </Box>
  )
}

export default function MeetingDetails() {
  usePageTitle('Meeting Details')

  const navigate = useNavigate()
  const { meetingId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const [now, setNow] = useState(() => new Date())
  const savedSettings = useMeetingSettings()

  const activeTab = getTabFromSearchParams(searchParams)
  const meeting = getMeetingById(meetingId)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  if (!meeting) {
    return (
      <EmptyPanel
        title="This meeting is not available"
        action={
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
        }
      >
        The meeting may have been removed or is no longer available.
      </EmptyPanel>
    )
  }

  const meetingState = getMeetingState(meeting, now)

  const settings = getMeetingToggleSettings(
    meeting,
    savedSettings?.[meeting.id],
  )

  const handleSettingsChange = (changes) =>
    saveMeetingSettings(meeting.id, changes)

  const attendance = getAttendance(
    meeting,
    meeting.participants || [],
  )

  const durationMinutes = getDurationMinutes(meeting)
  const timeText = formatTimeRange(meeting.start, meeting.end)
  const dateText = formatDate(meeting.start)

  const handleTabChange = (_event, value) => {
    if (!VALID_TABS.includes(value)) return

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.set('tab', value)
        return next
      },
      { replace: true },
    )
  }

  const goToTab = (value) => handleTabChange(null, value)

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        color: D.text,
      }}
    >
      <Box data-tour="meeting-header" sx={{ minWidth: 0 }}>
        <MeetingHeader
          meeting={meeting}
          meetingState={meetingState}
          dateText={dateText}
          timeText={timeText}
          durationMinutes={durationMinutes}
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onBack={() => navigate(-1)}
          onViewRecording={() => goToTab('recording')}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            lg: 'minmax(240px, 260px) minmax(0, 1fr)',
          },
          columnGap: { xs: 0, lg: 2.5 },
          rowGap: { xs: 2.5, lg: 0 },
          alignItems: 'start',
          minWidth: 0,
          pt: { xs: 2, lg: 1.5 },
        }}
      >
        <Box sx={{ minWidth: 0, pr: { lg: 0.5 } }}>
          <MeetingRail
            meeting={meeting}
            meetingState={meetingState}
            durationMinutes={durationMinutes}
            dateText={dateText}
            timeText={timeText}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ minWidth: 0 }}>
            <MeetingTabs
              value={activeTab}
              onChange={handleTabChange}
            />
          </Box>

          <Box
            data-tour="meeting-content"
            sx={{
              mt: { xs: 1.5, lg: 2 },
              minWidth: 0,
              pb: 1,
            }}
          >
            {activeTab === 'overview' && (
              <OverviewTab
                meeting={meeting}
                meetingState={meetingState}
              />
            )}

            {activeTab === 'takeaways' && (
              <KeyTakeawaysTab
                meeting={meeting}
                meetingState={meetingState}
              />
            )}

            {activeTab === 'participants' && (
              <ParticipantsTab
                attendance={attendance}
                meeting={meeting}
              />
            )}

            {activeTab === 'recording' && (
              <RecordingTab
                meeting={meeting}
                meetingState={meetingState}
              />
            )}

            {activeTab === 'transcript' && (
              <TranscriptTab
                meeting={meeting}
                meetingState={meetingState}
              />
            )}

            {activeTab === 'actions' && (
              <ActionItemsTab
                meeting={meeting}
                meetingState={meetingState}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
