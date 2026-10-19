import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'

import { EmptyPanel } from '../components/PageShell'
import MeetingHeader from '../components/meetingDetails/MeetingHeader'
import MeetingRail from '../components/meetingDetails/MeetingRail'
import MeetingTabs, { VALID_TABS } from '../components/meetingDetails/MeetingTabs'
import OverviewTab from '../components/meetingDetails/OverviewTab'
import RecordingTab from '../components/meetingDetails/RecordingTab'
import TranscriptTab from '../components/meetingDetails/TranscriptTab'
import ActionItemsTab from '../components/meetingDetails/ActionItemsTab'
import { D } from '../components/dashboard/dashTheme'
import { getMeetingToggleSettings } from '../components/meetings/meetingHelpers'

import {
  getMeetingState,
  getAttendance,
  getDurationMinutes,
  formatTimeRange,
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

export default function MeetingDetails() {
  usePageTitle('Meeting Details')

  const navigate = useNavigate()
  const { meetingId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const [now, setNow] = useState(() => new Date())
  const savedSettings = useMeetingSettings() // live: changes made on any page show here

  const activeTab = getTabFromSearchParams(searchParams) // the URL is the single source of truth
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
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(-1)}>
            Go back
          </Button>
        }
      >
        The meeting may have been removed or is no longer available.
      </EmptyPanel>
    )
  }

  const meetingState = getMeetingState(meeting, now)

  // A saved value overrides the meeting's original MeetAI setting; the same store is used by the Dashboard and Calendar.
  const settings = getMeetingToggleSettings(meeting, savedSettings?.[meeting.id])
  const handleSettingsChange = (changes) => saveMeetingSettings(meeting.id, changes)

  const attendance = getAttendance(meeting, meeting.participants || [])
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
    <Box sx={{ width: '100%', minWidth: 0, color: D.text }}>
      <Box data-tour="meeting-header">
        <MeetingHeader
          meeting={meeting}
          meetingState={meetingState}
          dateText={dateText}
          timeText={timeText}
          durationMinutes={durationMinutes}
          onBack={() => navigate(-1)}
          onViewRecording={() => goToTab('recording')}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '300px minmax(0, 1fr)' },
          columnGap: 4,
          rowGap: 3,
          alignItems: 'start',
          pt: 3,
        }}
      >
        <MeetingRail
          meeting={meeting}
          meetingState={meetingState}
          attendance={attendance}
          durationMinutes={durationMinutes}
          dateText={dateText}
          timeText={timeText}
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onNavigate={goToTab}
        />

        <Box sx={{ minWidth: 0 }}>
          <MeetingTabs value={activeTab} onChange={handleTabChange} />

          <Box data-tour="meeting-content" sx={{ mt: 3 }}>
            {activeTab === 'overview' && (
              <OverviewTab meeting={meeting} meetingState={meetingState} onNavigate={goToTab} />
            )}
            {activeTab === 'recording' && <RecordingTab meeting={meeting} meetingState={meetingState} />}
            {activeTab === 'transcript' && <TranscriptTab meeting={meeting} meetingState={meetingState} />}
            {activeTab === 'actions' && <ActionItemsTab meeting={meeting} meetingState={meetingState} />}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}