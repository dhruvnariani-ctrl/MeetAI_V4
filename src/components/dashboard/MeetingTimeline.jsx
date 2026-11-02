import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'

import { EmptyPanel } from '../PageShell'
import MeetingToggles from '../MeetingToggles'
import { getMeetingToggleSettings } from '../meetings/meetingHelpers'

import PaginationBar from '../PaginationBar'
import usePagination from '../../hooks/usePagination'

import {
  joinUrlOf,
  participantCount,
  platformOf,
  statusOf,
} from './dashboardUtils'

import { D, time24, titleSx } from './dashTheme'

const PAGE_SIZE = 5

const WAVE = [6, 10, 16, 8, 14, 18, 9, 12, 17, 7, 13, 10]

const peopleText = (meeting) => {
  const count = participantCount(meeting)
  return `${count} participant${count === 1 ? '' : 's'}`
}

const minutesOf = (meeting) =>
  Math.max(
    1,
    Math.round((meeting._end - meeting._start) / 60000),
  )

const openItemCount = (meeting) =>
  (meeting.actionItems ?? []).filter(
    (item) =>
      !['done', 'completed'].includes(
        String(item.status ?? '').toLowerCase(),
      ),
  ).length

const settingsFor = (meeting, all) => {
  const saved = getMeetingToggleSettings(
    meeting,
    all?.[meeting.id],
  )

  return {
    autoJoin: saved.autoJoin === true,
    recordVideo:
      saved.autoJoin === true && saved.recordVideo === true,
  }
}

/* Compact meeting status heading */
function SectionDropdown({
  title,
  count,
  open,
  onClick,
  icon,
  expandedColor = D.navy,
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-expanded={open}
      sx={{
        width: '100%',
        minHeight: 54,
        px: { xs: 1.5, sm: 2 },
        py: 1.25,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        textAlign: 'left',
        bgcolor: '#FFFFFF',
        border: `1px solid ${D.line}`,
        borderRadius: '7px',
        transition: 'background .15s ease',
        '&:hover': {
          bgcolor: '#F7F9FE',
          borderColor: '#B8C9EA',
        },
        '&:focus-visible': {
          outline: `2px solid ${D.navy}`,
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          minWidth: 0,
        }}
      >
        {icon}

        <Typography
          sx={{
            fontSize: '.9375rem',
            fontWeight: 600,
            color: D.navy,
          }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            minWidth: 25,
            height: 25,
            px: 0.75,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '20px',
            bgcolor: '#E8EFFD',
            color: expandedColor,
            fontSize: '.75rem',
            fontWeight: 700,
          }}
        >
          {count}
        </Box>
      </Box>

      {open ? (
        <ExpandLessRoundedIcon sx={{ color: D.navy }} />
      ) : (
        <ExpandMoreRoundedIcon sx={{ color: D.navy }} />
      )}
    </ButtonBase>
  )
}

/* Main live meeting card */
function LiveCard({
  meeting,
  now,
  settings,
  onSettingsChange,
}) {
  const navigate = useNavigate()

  const elapsed = Math.max(
    0,
    Math.floor((now - meeting._start) / 60000),
  )

  const joinUrl = joinUrlOf(meeting)
  const recording = settings.autoJoin === true

  const join = () => {
    if (joinUrl) {
      window.open(
        joinUrl,
        '_blank',
        'noopener,noreferrer',
      )
    } else {
      navigate(`/meetings/${meeting.id}`)
    }
  }

  return (
    <Box
      component="section"
      aria-label={`Live meeting: ${meeting.title}`}
      sx={{
        width: '100%',
        minWidth: 0,
        bgcolor: D.card,
        color: '#FFFFFF',
        borderRadius: '7px',
        p: { xs: 1.75, sm: 2.5 },
        boxSizing: 'border-box',
      }}
    >
      {/* Meeting title and join */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '.6875rem',
              fontWeight: 700,
              letterSpacing: '.06em',
              color: D.live,
              textTransform: 'uppercase',
            }}
          >
            ● Live · {elapsed} min
          </Typography>

          <Typography
            component="h3"
            sx={{
              mt: 0.4,
              fontSize: { xs: '1.15rem', sm: '1.35rem' },
              fontWeight: 600,
              lineHeight: 1.35,
              color: '#FFFFFF',
            }}
          >
            {meeting.title}
          </Typography>

          <Typography
            sx={{
              mt: 0.35,
              fontSize: '.8125rem',
              color: '#C3CEEE',
            }}
          >
            {platformOf(meeting)} · {peopleText(meeting)}
          </Typography>
        </Box>

        <Button
          data-tour="dashboard-join-meeting"
          variant="contained"
          disableElevation
          startIcon={<VideocamOutlinedIcon />}
          onClick={join}
          sx={{
            flexShrink: 0,
            minHeight: 42,
            px: { xs: 1.5, sm: 2.5 },
            borderRadius: '6px',
            fontSize: '.8125rem',
            fontWeight: 700,
            textTransform: 'none',
            bgcolor: D.green,
            color: '#FFFFFF',
            '&:hover': {
              bgcolor: '#2C6C16',
            },
            '&:focus-visible': {
              outline: '2px solid #FFFFFF',
              outlineOffset: 2,
            },
          }}
        >
          Join
        </Button>
      </Box>

      {/* Recording status */}
      <Box
        sx={{
          mt: 1.75,
          pt: 1.25,
          borderTop: '1px solid rgba(255,255,255,.17)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {recording && (
          <Box
            aria-hidden="true"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              height: 18,
              flexShrink: 0,
            }}
          >
            {WAVE.map((height, index) => (
              <Box
                key={index}
                sx={{
                  width: 2,
                  height,
                  borderRadius: 1,
                  bgcolor: D.live,
                }}
              />
            ))}
          </Box>
        )}

        <Typography
          sx={{
            flex: 1,
            fontSize: '.8125rem',
            color: '#E3E9FA',
          }}
        >
          {recording
            ? 'MeetAI is recording and taking notes'
            : 'MeetAI is not in this meeting'}
        </Typography>
      </Box>

      {/* Toggles and meeting details */}
      <Box
        sx={{
          mt: 1.25,
          pt: 1.1,
          borderTop: '1px solid rgba(255,255,255,.17)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <MeetingToggles
          dark
          meeting={meeting}
          settings={settings}
          onChange={(changes) =>
            onSettingsChange?.(meeting.id, changes)
          }
        />

        <Button
          size="small"
          onClick={() => navigate(`/meetings/${meeting.id}`)}
          endIcon={
            <ArrowOutwardRoundedIcon
              sx={{ fontSize: '13px !important' }}
            />
          }
          sx={{
            color: '#FFFFFF',
            fontSize: '.75rem',
            textTransform: 'none',
            whiteSpace: 'nowrap',
            minWidth: 0,
            '&:hover': {
              bgcolor: 'rgba(255,255,255,.08)',
            },
          }}
        >
          Meeting details
        </Button>
      </Box>
    </Box>
  )
}

/* Compact upcoming meeting row */
function UpcomingRow({
  meeting,
  settings,
  onSettingsChange,
}) {
  const navigate = useNavigate()
  const items = openItemCount(meeting)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
        px: { xs: 1.5, sm: 2 },
        py: 1.25,
        bgcolor: '#FFFFFF',
        borderBottom: `1px solid ${D.line}`,
        '&:last-child': {
          borderBottom: 0,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <ButtonBase
          onClick={() => navigate(`/meetings/${meeting.id}`)}
          sx={{
            minWidth: 0,
            flex: 1,
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            '&:focus-visible': {
              outline: `2px solid ${D.navy}`,
              outlineOffset: 2,
            },
          }}
        >
          <Typography
            noWrap
            sx={{
              width: '100%',
              fontSize: '.875rem',
              fontWeight: 600,
              color: D.navy,
            }}
          >
            {meeting.title}
          </Typography>

          <Typography
            sx={{
              mt: 0.25,
              fontSize: '.75rem',
              color: D.muted,
            }}
          >
            {platformOf(meeting)} · {peopleText(meeting)}
          </Typography>
        </ButtonBase>

        <Box
          sx={{
            flexShrink: 0,
            textAlign: 'right',
          }}
        >
          <Typography
            sx={{
              fontSize: '.8125rem',
              fontWeight: 600,
              color: D.navy,
              whiteSpace: 'nowrap',
            }}
          >
            {time24(meeting._start)} – {time24(meeting._end)}
          </Typography>

          {items > 0 && (
            <Typography
              sx={{
                mt: 0.25,
                fontSize: '.6875rem',
                color: D.muted,
              }}
            >
              {items} action item{items === 1 ? '' : 's'}
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <MeetingToggles
          meeting={meeting}
          settings={settings}
          onChange={(changes) =>
            onSettingsChange?.(meeting.id, changes)
          }
        />

        <Button
          size="small"
          endIcon={
            <ArrowOutwardRoundedIcon
              sx={{ fontSize: '13px !important' }}
            />
          }
          onClick={() => navigate(`/meetings/${meeting.id}`)}
          sx={{
            minWidth: 0,
            px: 0.5,
            fontSize: '.75rem',
            fontWeight: 600,
            textTransform: 'none',
            color: D.navy,
          }}
        >
          View Meeting Details
        </Button>
      </Box>
    </Box>
  )
}

/* Completed meeting row */
function CompletedRow({ meeting }) {
  const navigate = useNavigate()

  return (
    <ButtonBase
      onClick={() => navigate(`/meetings/${meeting.id}`)}
      sx={{
        width: '100%',
        px: { xs: 1.5, sm: 2 },
        py: 1.25,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        textAlign: 'left',
        borderBottom: `1px solid ${D.line}`,
        '&:last-child': {
          borderBottom: 0,
        },
        '&:hover': {
          bgcolor: '#F7F9FE',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minWidth: 0,
        }}
      >
        <CheckCircleOutlineRoundedIcon
          sx={{
            fontSize: 19,
            color: '#2875C7',
            flexShrink: 0,
          }}
        />

        <Box sx={{ minWidth: 0 }}>
          <Typography
            noWrap
            sx={{
              fontSize: '.8125rem',
              fontWeight: 600,
              color: D.navy,
            }}
          >
            {meeting.title}
          </Typography>

          <Typography
            sx={{
              mt: 0.25,
              fontSize: '.6875rem',
              color: D.muted,
            }}
          >
            {platformOf(meeting)} · {time24(meeting._start)}
          </Typography>
        </Box>
      </Box>

      <Button
        size="small"
        endIcon={
          <ArrowOutwardRoundedIcon
            sx={{ fontSize: '13px !important' }}
          />
        }
        onClick={() => navigate(`/meetings/${meeting.id}`)}
        sx={{
          minWidth: 0,
          px: 0.5,
          fontSize: '.75rem',
          fontWeight: 600,
          textTransform: 'none',
          color: D.navy,
        }}
      >
        View Meeting Details
      </Button>
    </ButtonBase>
  )
}

export default function MeetingTimeline({
  meetings = [],
  now,
  meetingSettings = {},
  onSettingsChange,
}) {
  const [showUpcoming, setShowUpcoming] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)

  const past = meetings.filter(
    (meeting) => statusOf(meeting, now) === 'past',
  )

  const live = meetings.filter(
    (meeting) => statusOf(meeting, now) === 'live',
  )

  const upcoming = meetings.filter(
    (meeting) => statusOf(meeting, now) === 'upcoming',
  )

  // Completed meetings: newest first
  const completedMeetings = past.slice().reverse()

  // Independent pagination for each dropdown
  const completedPager = usePagination(
    completedMeetings,
    PAGE_SIZE,
    'dashboard-completed',
  )

  const upcomingPager = usePagination(
    upcoming,
    PAGE_SIZE,
    'dashboard-upcoming',
  )

  return (
    <Box
      component="section"
      aria-label="Today's schedule"
      data-tour="dashboard-todays-meetings"
      sx={{
        minWidth: 0,
        width: '100%',
      }}
    >
      {/* Main heading */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 2,
        }}
      >
        <Typography
          component="h1"
          sx={{
            ...titleSx,
            fontSize: {
              xs: '1.5rem',
              md: '1.65rem',
            },
            fontWeight: 400,
          }}
        >
          Today’s Schedule
        </Typography>
      </Box>

      {meetings.length === 0 ? (
        <EmptyPanel
          title="No meetings scheduled today"
          minHeight={150}
        >
          Your meetings will appear here when they are available.
        </EmptyPanel>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.75,
            minWidth: 0,
          }}
        >
          {/* Completed dropdown */}
          <Box
            sx={{
              border: `1px solid ${D.line}`,
              borderRadius: '7px',
              overflow: 'hidden',
              bgcolor: '#FFFFFF',
            }}
          >
            <SectionDropdown
              title="Completed Meetings"
              count={past.length}
              open={showCompleted}
              onClick={() =>
                setShowCompleted((value) => !value)
              }
              expandedColor="#2875C7"
              icon={
                <CheckCircleOutlineRoundedIcon
                  sx={{ color: '#2875C7', fontSize: 22 }}
                />
              }
            />

            {showCompleted && (
              <Box
                sx={{
                  borderTop: `1px solid ${D.line}`,
                }}
              >
                {completedMeetings.length > 0 ? (
                  <>
                    {completedPager.pageItems.map((meeting) => (
                      <CompletedRow
                        key={meeting.id}
                        meeting={meeting}
                      />
                    ))}

                    {completedMeetings.length > PAGE_SIZE && (
                      <PaginationBar
                        pager={completedPager}
                        label="meetings"
                      />
                    )}
                  </>
                ) : (
                  <Typography
                    sx={{
                      px: 2,
                      py: 2,
                      fontSize: '.8125rem',
                      color: D.muted,
                    }}
                  >
                    No completed meetings yet today.
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {/* Live meetings always get first priority */}
          {live.length > 0 ? (
            live.map((meeting) => (
              <LiveCard
                key={meeting.id}
                meeting={meeting}
                now={now}
                settings={settingsFor(
                  meeting,
                  meetingSettings,
                )}
                onSettingsChange={onSettingsChange}
              />
            ))
          ) : (
            <Box
              sx={{
                p: 2,
                border: `1px solid ${D.line}`,
                borderRadius: '7px',
                bgcolor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
              }}
            >
              <ScheduleRoundedIcon
                sx={{ color: D.muted, fontSize: 21 }}
              />

              <Box>
                <Typography
                  sx={{
                    fontSize: '.875rem',
                    fontWeight: 600,
                    color: D.navy,
                  }}
                >
                  No live meeting right now
                </Typography>

                <Typography
                  sx={{
                    mt: 0.25,
                    fontSize: '.75rem',
                    color: D.muted,
                  }}
                >
                  Your next meeting will appear in Upcoming Meetings.
                </Typography>
              </Box>
            </Box>
          )}

          {/* Upcoming dropdown */}
          <Box
            sx={{
              border: `1px solid ${D.line}`,
              borderRadius: '7px',
              overflow: 'hidden',
              bgcolor: '#FFFFFF',
            }}
          >
            <SectionDropdown
              title="Upcoming Meetings"
              count={upcoming.length}
              open={showUpcoming}
              onClick={() =>
                setShowUpcoming((value) => !value)
              }
              icon={
                <ScheduleRoundedIcon
                  sx={{ color: '#2875C7', fontSize: 22 }}
                />
              }
            />

            {showUpcoming && (
              <Box
                sx={{
                  borderTop: `1px solid ${D.line}`,
                }}
              >
                {upcoming.length > 0 ? (
                  <>
                    {upcomingPager.pageItems.map((meeting) => (
                      <UpcomingRow
                        key={meeting.id}
                        meeting={meeting}
                        settings={settingsFor(
                          meeting,
                          meetingSettings,
                        )}
                        onSettingsChange={onSettingsChange}
                      />
                    ))}

                    {upcoming.length > PAGE_SIZE && (
                      <PaginationBar
                        pager={upcomingPager}
                        label="meetings"
                      />
                    )}
                  </>
                ) : (
                  <Typography
                    sx={{
                      px: 2,
                      py: 2,
                      fontSize: '.8125rem',
                      color: D.muted,
                    }}
                  >
                    No upcoming meetings for today.
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}