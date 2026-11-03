import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'

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

import { D, time24 } from './dashTheme'

const PAGE_SIZE = 5

// Live card colours (light blue)
const LIVE_BG = '#E3EDFB'
const LIVE_BORDER = '#C9DAF5'
const LIVE_ACCENT = '#315DA8'

// One radius for everything (same value as Dashboard.jsx)
const R = '12px'

const peopleText = (meeting) => {
  const count = participantCount(meeting)
  return `${count} participant${count === 1 ? '' : 's'}`
}

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

const dateKey = (value) => {
  const date = new Date(value)

  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

const dayHeading = (value, now) => {
  const date = new Date(value)
  const today = new Date(now)

  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const target = new Date(date)
  target.setHours(0, 0, 0, 0)

  const weekday = date
    .toLocaleDateString('en-IN', { weekday: 'short' })
    .toUpperCase()

  const day = date
    .toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    })
    .toUpperCase()

  if (target.getTime() === today.getTime()) {
    return `TODAY · ${weekday} ${day}`
  }

  if (target.getTime() === tomorrow.getTime()) {
    return `TOMORROW · ${weekday} ${day}`
  }

  return `${weekday} · ${day}`
}


function LiveCard({
  meeting,
  now,
  settings,
  onSettingsChange,
  compact = false,
}) {
  const navigate = useNavigate()

  const elapsed = Math.max(
    0,
    Math.floor((now - meeting._start) / 60000),
  )

  const joinUrl = joinUrlOf(meeting)

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
        bgcolor: LIVE_BG,
        border: `1px solid ${LIVE_BORDER}`,
        color: D.navy,
        borderRadius: R,
        p: compact ? { xs: 1, sm: 1.35 } : { xs: 1.5, sm: 2},
        boxSizing: 'border-box',
      }}
    >
      {/* Row 1: Live status, meeting title and Join */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontSize: '.6875rem',
              fontWeight: 700,
              letterSpacing: '.06em',
              color: LIVE_ACCENT,
              textTransform: 'uppercase',
            }}
          >
            ● Live · {elapsed} min
          </Typography>

          <Typography
            component="h3"
            sx={{
              mt: compact ? 0.2 : 0.35,
              fontSize: { xs: '1.05rem', sm: '1.25rem' },
              fontWeight: 600,
              lineHeight: 1.25,
              color: D.navy,
              overflowWrap: 'anywhere',
            }}
          >
            {meeting.title}
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
            minHeight: compact ? 29 : 34,
            px: { xs: 1.25, sm: 1.75 },
            borderRadius: R,
            fontSize: '.8rem',
            fontWeight: 700,
            textTransform: 'none',
            bgcolor: D.green,
            color: '#FFFFFF',
            '&:hover': {
              bgcolor: '#2C6C16',
            },
          }}
        >
          Join
        </Button>
      </Box>

      {/* Row 2: Meeting information left + controls right */}
      <Box
        sx={{
          mt:0,
          pt:0,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minWidth: 0,
        }}
      >
        {/* Left: Time, platform and participants */}
        <Typography
          sx={{
            fontSize: '.75rem',
            color: D.muted,
            lineHeight: 1.4,
            minWidth: 0,
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {time24(meeting._start)} – {time24(meeting._end)} ·{' '}
          {platformOf(meeting)} · {peopleText(meeting)}
        </Typography>

        {/* Right: MeetAI toggles and Meeting details */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1.25,
            flexShrink: 0,
            ml: 'auto',
            whiteSpace: 'nowrap',
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
            onClick={() => navigate(`/meetings/${meeting.id}`)}
            endIcon={
              <ArrowOutwardRoundedIcon
                sx={{ fontSize: '13px !important' }}
              />
            }
            sx={{
              flexShrink: 0,
              color: LIVE_ACCENT,
              borderRadius: R,
              fontSize: '.75rem',
              fontWeight: 600,
              textTransform: 'none',
              whiteSpace: 'nowrap',
              minWidth: 0,
              px: 0.5,
              '&:hover': {
                bgcolor: 'rgba(49,93,168,.08)',
              },
            }}
          >
            Meeting details
          </Button>
        </Box>
      </Box>
    </Box>
  )
}


/* Compact meeting row */
function MeetingRow({
  meeting,
  completed = false,
  settings,
  onSettingsChange,
  compact = false,
}) {
  const navigate = useNavigate()

  const duration = Math.max(
    1,
    Math.round((meeting._end - meeting._start) / 60000),
  )

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '56px minmax(0, 1fr)',
          sm: '64px minmax(0, 1fr)',
        },
        columnGap: 1,
        alignItems: 'start',
        px: { xs: 1, sm: 1.5 },
        pt:1,
        pb:0,
        bgcolor: '#FFFFFF',
        borderBottom: `1px solid ${D.line}`,
        '&:last-child': {
          borderBottom: 0,
        },
      }}
    >
      {/* Time */}
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: '.8125rem',
            fontWeight: 700,
            color: D.navy,
            lineHeight: compact ? '14px' : '20px',
            whiteSpace: 'nowrap',
          }}
        >
          {time24(meeting._start)}
        </Typography>

        <Typography
          sx={{
            fontSize: '.6875rem',
            color: D.muted,
            lineHeight: compact ? '12px' : '17px',
            whiteSpace: 'nowrap',
          }}
        >
          {duration} min
        </Typography>
      </Box>

      {/* Meeting information */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto 22px',
          columnGap: { xs: 0.75, sm: 1 },
          alignItems: 'start',
          minWidth: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <ButtonBase
            onClick={() => navigate(`/meetings/${meeting.id}`)}
            sx={{
              display: 'block',
              minWidth: 0,
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              borderRadius: R,
            }}
          >
            <Typography
              sx={{
                fontSize: '.8125rem',
                fontWeight: 600,
                color: D.navy,
                lineHeight: compact ? '14px' : '20px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {completed && (
                <CheckCircleOutlineRoundedIcon
                  sx={{
                    fontSize: 14,
                    color: '#2875C7',
                    verticalAlign: 'middle',
                    mr: 0.5,
                  }}
                />
              )}
              {meeting.title}
            </Typography>
          </ButtonBase>

          <Typography
            sx={{
              fontSize: '.6875rem',
              color: D.muted,
              lineHeight: compact ? '12px' : '17px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {platformOf(meeting)} · {peopleText(meeting)}
          </Typography>
        </Box>

        {!completed ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              minWidth: 0,
            }}
          >
            <MeetingToggles
              compact
              meeting={meeting}
              settings={settings}
              onChange={(changes) =>
                onSettingsChange?.(meeting.id, changes)
              }
            />
          </Box>
        ) : (
          <Box />
        )}

        <Button
          size="small"
          onClick={() => navigate(`/meetings/${meeting.id}`)}
          aria-label={`Open ${meeting.title} meeting details`}
          sx={{
            minWidth: 22,
            width: 22,
            height: 22,
            p: 0,
            color: D.navy,
            borderRadius: R,
            '&:hover': {
              bgcolor: '#EAF0FC',
            },
          }}
        >
          <ArrowOutwardRoundedIcon sx={{ fontSize: 15 }} />
        </Button>
      </Box>
    </Box>
  )
}

/* Date separator */
function DayHeader({ children, compact = false }) {
  return (
    <Box
      sx={{
        px: { xs: 1.25, sm: 1.75 },
        py: compact ? 0.35 : 0.55,
        bgcolor: '#F5F7FB',
        borderBottom: `1px solid ${D.line}`,
      }}
    >
      <Typography
        sx={{
          fontSize: '.625rem',
          fontWeight: 700,
          letterSpacing: '.04em',
          color: D.muted,
        }}
      >
        {children}
      </Typography>
    </Box>
  )
}

/* Up next timeline (title now lives in Dashboard header row) */
export default function MeetingTimeline({
  meetings = [],
  now = new Date(),
  meetingSettings = {},
  onSettingsChange,
  compact = false,
}) {
  const [activeTab, setActiveTab] = useState('upcoming')
  const navigate=useNavigate()
  const past = meetings.filter(
    (meeting) => statusOf(meeting, now) === 'past',
  )

  const live = meetings.filter(
    (meeting) => statusOf(meeting, now) === 'live',
  )

  const upcoming = meetings
    .filter((meeting) => statusOf(meeting, now) === 'upcoming')
    .sort((a, b) => a._start - b._start)

  const completedMeetings = past
    .slice()
    .sort((a, b) => b._start - a._start)

  const displayedMeetings =
    activeTab === 'upcoming'
      ? upcoming
      : completedMeetings

  const pager = usePagination(
    displayedMeetings,
    PAGE_SIZE,
    `dashboard-${activeTab}`,
  )

  const groupedUpcoming = useMemo(() => {
    const groups = new Map()

    pager.pageItems.forEach((meeting) => {
      const key = dateKey(meeting._start)

      if (!groups.has(key)) {
        groups.set(key, {
          date: meeting._start,
          meetings: [],
        })
      }

      groups.get(key).meetings.push(meeting)
    })

    return Array.from(groups.values())
  }, [pager.pageItems])

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
      {meetings.length === 0 ? (
        <EmptyPanel
          title="No meetings scheduled today"
          minHeight={compact ? 100 : 150}
        >
          Your meetings will appear here when they are available.
        </EmptyPanel>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: compact ? 0.9 : 1.5,
            minWidth: 0,
          }}
        >
          {/* Live meeting */}
          {live.map((meeting) => (
            <LiveCard
              key={meeting.id}
              meeting={meeting}
              now={now}
              compact={compact}
              settings={settingsFor(
                meeting,
                meetingSettings,
              )}
              onSettingsChange={onSettingsChange}
            />
          ))}

          {/* Up next */}
          <Box
            sx={{
              border: `1px solid ${D.line}`,
              borderRadius: R,
              overflow: 'hidden',
              bgcolor: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(20,40,80,.04)',
            }}
          >
            {/* Header + tabs */}
            <Box
              sx={{
                px: { xs: 1.25, sm: 1.75 },
                py: compact ? 0.55 : 0.9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                flexWrap: 'wrap',
                borderBottom: `1px solid ${D.line}`,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  component="h2"
                  sx={{
                    fontSize: '.9375rem',
                    fontWeight: 700,
                    color: D.navy,
                    lineHeight: 1.35,
                  }}
                >
                  Up next
                </Typography>

                <Typography
                  sx={{
                    mt: 0.2,
                    fontSize: '.6875rem',
                    color: D.muted,
                  }}
                >
                  Your next {Math.min(5, upcoming.length)} meetings. Change MeetAI or recording before they start.
                </Typography>
              </Box>

              <Box
                role="tablist"
                aria-label="Meeting status"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 0.25,
                  bgcolor: '#F0F3F9',
                  borderRadius: R,
                  flexShrink: 0,
                }}
              >
                {[
                  {
                    value: 'upcoming',
                    label: 'Upcoming',
                    count: upcoming.length,
                  },
                  {
                    value: 'completed',
                    label: 'Completed',
                    count: completedMeetings.length,
                  },
                ].map((tab) => {
                  const selected = activeTab === tab.value

                  return (
                    <ButtonBase
                      key={tab.value}
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setActiveTab(tab.value)}
                      sx={{
                        px: 1.25,
                        py: compact ? 0.4 : 0.65,
                        borderRadius: R,
                        fontSize: '.6875rem',
                        fontWeight: selected ? 700 : 500,
                        color: selected ? D.navy : D.muted,
                        bgcolor: selected ? '#FFFFFF' : 'transparent',
                        border: selected
                          ? `1px solid ${D.line}`
                          : '1px solid transparent',
                        boxShadow: selected
                          ? '0 1px 2px rgba(20,40,80,.06)'
                          : 'none',
                        whiteSpace: 'nowrap',
                        '&:hover': {
                          bgcolor: selected ? '#FFFFFF' : '#E8EDF6',
                        },
                      }}
                    >
                      {tab.label} · {tab.count}
                    </ButtonBase>
                  )
                })}
              </Box>
            </Box>

            {/* Meeting list */}
            {displayedMeetings.length > 0 ? (
              <>
                {activeTab === 'upcoming'
                  ? groupedUpcoming.map((group) => (
                      <Box key={dateKey(group.date)}>
                        <DayHeader compact={compact}>
                          {dayHeading(group.date, now)}
                        </DayHeader>

                        {group.meetings.map((meeting) => (
                          <MeetingRow
                            key={meeting.id}
                            meeting={meeting}
                            compact={compact}
                            settings={settingsFor(
                              meeting,
                              meetingSettings,
                            )}
                            onSettingsChange={onSettingsChange}
                          />
                        ))}
                      </Box>
                    ))
                  : pager.pageItems.map((meeting) => (
                      <MeetingRow
                        key={meeting.id}
                        meeting={meeting}
                        compact={compact}
                        completed
                      />
                    ))}

                {displayedMeetings.length > PAGE_SIZE && (
                  <PaginationBar
                    pager={pager}
                    label="meetings"
                  />
                )}
              </>
            ) : (
              <Typography
                sx={{
                  px: 1.75,
                  py: compact ? 1.2 : 2,
                  fontSize: '.8125rem',
                  color: D.muted,
                }}
              >
                {activeTab === 'upcoming'
                  ? 'No upcoming meetings.'
                  : 'No completed meetings yet.'}
              </Typography>
            )}

            {/* Footer */}
            <Box
              sx={{
                px: { xs: 1.25, sm: 1.75 },
                py: compact ? 0.45 : 0.75,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                flexWrap: 'wrap',
                bgcolor: '#FFFFFF',
                borderTop: `1px solid ${D.line}`,
              }}
            >
              <Typography
                sx={{
                  fontSize: '.625rem',
                  color: D.muted,
                }}
              >
                Showing {pager.pageItems.length} of{' '}
                {displayedMeetings.length}{' '}
                {activeTab === 'upcoming'
                  ? 'upcoming'
                  : 'completed'}{' '}
                meetings
              </Typography>

              <Button
                size="small"
                onClick={() => navigate('/calendar')}
                endIcon={
                  <ArrowOutwardRoundedIcon
                    sx={{ fontSize: '12px !important' }}
                  />
                }
                sx={{
                  minWidth: 0,
                  px: 0.25,
                  borderRadius: R,
                  fontSize: '.6875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  color: D.navy,
                  whiteSpace: 'nowrap',
                }}
              >
                Open full calendar (week - month)
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}