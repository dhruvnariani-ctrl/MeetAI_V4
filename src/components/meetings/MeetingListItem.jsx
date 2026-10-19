import { useNavigate } from 'react-router-dom'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

import MeetingToggles from '../MeetingToggles'
import MeetingInfo from './MeetingInfo'
import MeetingStatusChip from './MeetingStatusChip'

import {
  getMeetingToggleSettings,
  getStatusStyle,
  shouldShowMeetingToggles,
  areMeetingTogglesDisabled,
} from './meetingHelpers'

const has = (object, key) =>
  Object.prototype.hasOwnProperty.call(object, key)

const hasSettingsKeys = (value) =>
  value &&
  typeof value === 'object' &&
  (has(value, 'autoJoin') || has(value, 'recordVideo'))

const stop = (event) => event.stopPropagation()

export default function MeetingListItem({
  meeting,
  status,
  timeLabel,
  settings = {},
  onSettingsChange,
  tourTarget = false,
  compact = false,
}) {
  const navigate = useNavigate()

  /*
   * Supports either the full settings map or the settings
   * object for this specific meeting.
   */
  const settingsForMeeting = hasSettingsKeys(settings)
    ? settings
    : settings?.[meeting.id]

  const meetingSettings = hasSettingsKeys(settingsForMeeting)
    ? {
        autoJoin: settingsForMeeting.autoJoin === true,
        recordVideo:
          settingsForMeeting.autoJoin === true &&
          settingsForMeeting.recordVideo === true,
      }
    : getMeetingToggleSettings(meeting, undefined)

  const togglesDisabled = areMeetingTogglesDisabled(status)
  const showToggles = shouldShowMeetingToggles(status)
  const accentColor = getStatusStyle(status).color

  const handleOpenMeeting = () => {
    navigate(`/meetings/${meeting.id}`)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleOpenMeeting()
    }
  }

  const statusChip = <MeetingStatusChip status={status} compact={compact} />

  return (
    <Paper
      data-tour={tourTarget ? 'calendar-meeting' : undefined}
      role="button"
      tabIndex={0}
      elevation={0}
      onDoubleClick={handleOpenMeeting}
      onKeyDown={handleKeyDown}
      sx={{
        position: 'relative',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        border: '1px solid #E1EAF3',
        borderRadius: compact ? '12px' : '14px',
        bgcolor: '#FFFFFF',
        overflow: 'hidden',
        cursor: 'default',
        transition:
          'border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease',

        /* Status accent on the left edge */
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: accentColor,
          opacity: status === 'Done' ? 0.55 : 1,
        },

        '&:hover': {
          borderColor: '#C5D9EB',
          boxShadow: '0 3px 12px rgba(18, 58, 89, 0.08)',
          bgcolor: '#FCFDFF',

          '& .meeting-list-item-arrow': {
            opacity: 1,
            transform: 'translateX(2px)',
          },
        },

        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: '2px',
        },
      }}
    >
      <Box
        sx={
          compact
            ? {
                display: 'flex',
                flexDirection: 'column',
                gap: 0.9,
                pl: 1.85,
                pr: 1.35,
                py: 1.15,
                minWidth: 0,
              }
            : {
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr) auto',
                  md: 'minmax(0, 1fr) auto auto 24px',
                },
                alignItems: 'center',
                columnGap: { xs: 1, md: 1.5 },
                rowGap: { xs: 1, md: 0 },
                pl: { xs: 2, md: 2.5 },
                pr: { xs: 1.5, md: 2 },
                py: { xs: 1.4, md: 1.6 },
                minWidth: 0,
              }
        }
      >
        {/* Time (+ status chip when compact), title, platform, participants */}
        <Box
          sx={{
            minWidth: 0,
            overflow: 'hidden',

            '& > *': {
              maxWidth: '100%',
            },
          }}
        >
          <MeetingInfo
            meeting={meeting}
            timeLabel={timeLabel}
            compact={compact}
            trailing={compact ? statusChip : null}
          />
        </Box>

        {/* Meeting status (full-size layout only) */}
        {!compact && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              minWidth: 0,
            }}
          >
            {statusChip}
          </Box>
        )}

        {/* MeetAI and recording controls */}
        {showToggles && (
          <Box
            onClick={stop}
            onMouseDown={stop}
            onPointerDown={stop}
            sx={{
              gridColumn: compact ? 'auto' : { xs: '1 / 3', md: '3 / 4' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              minWidth: 0,
              pt: compact ? 0.9 : { xs: 1, md: 0 },
              mt: compact ? 0.1 : { xs: 0.25, md: 0 },
              borderTop: compact
                ? '1px solid #EEF3F7'
                : { xs: '1px solid #EEF1F5', md: 'none' },
              overflowX: 'auto',
              overflowY: 'hidden',
              '& > *': {
                flexShrink: 0,
              },
            }}
          >
            <Tooltip
              title={togglesDisabled ? 'Meeting already done' : ''}
              placement="top"
              arrow
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  opacity: togglesDisabled ? 0.7 : 1,
                  cursor: togglesDisabled ? 'not-allowed' : 'default',
                  minWidth: 0,
                }}
              >
                <MeetingToggles
                  meeting={meeting}
                  settings={meetingSettings}
                  onChange={(changes) =>
                    onSettingsChange?.(meeting.id, changes)
                  }
                  disabled={togglesDisabled}
                />
              </Box>
            </Tooltip>
          </Box>
        )}

        {/* Details arrow (full-size layout only) */}
        {!compact && (
          <Box
            className="meeting-list-item-arrow"
            aria-hidden="true"
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              opacity: 0.5,
              transform: 'translateX(0)',
              transition: 'opacity 160ms ease, transform 160ms ease',
            }}
          >
            <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
          </Box>
        )}
      </Box>
    </Paper>
  )
}