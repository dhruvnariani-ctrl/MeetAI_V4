
import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'

import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'

import MeetingTimeline from '../components/dashboard/MeetingTimeline'
import { D, titleSx } from '../components/dashboard/dashTheme'

import { getTodaysMeetings } from '../data/meetings'
import { saveMeetingSettings } from '../data/meetingSettings'

import useNow from '../hooks/Usenow'
import useCurrentUser from '../hooks/useCurrentUser'
import useMeetingSettings from '../hooks/useMeetingSettings'
import { filterUserMeetings } from '../utils/meetingAccess'


function QuickActionCard({
  title,
  description,
  icon,
  onClick,
  primary = false,
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        minHeight: 112,
        p: { xs: 2, sm: 2.5 },
        display: 'flex',
        alignItems: 'center',
        textAlign: 'left',
        justifyContent: 'space-between',
        gap: 2,
        borderRadius: '10px',
        border: `1px solid ${primary ? D.green : D.line}`,
        bgcolor: primary ? D.green : '#FFFFFF',
        transition: 'all .18s ease',

        '&:hover': {
          bgcolor: primary ? '#168A43' : '#F5F8FE',
          borderColor: primary ? '#168A43' : D.navy,
          transform: 'translateY(-2px)',
          boxShadow: '0 5px 16px rgba(20, 43, 95, .08)',
        },

        '&:focus-visible': {
          outline: `2px solid ${D.navy}`,
          outlineOffset: 3,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          minWidth: 0,
        }}
      >
        {/* Icon container */}
        <Box
          sx={{
            width: 48,
            height: 48,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '9px',
            bgcolor: primary
              ? 'rgba(255,255,255,0.18)'
              : '#F0F4FC',
            color: primary ? '#FFFFFF' : D.navy,
          }}
        >
          {icon}
        </Box>

        {/* Text */}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: { xs: '.875rem', sm: '.95rem' },
              fontWeight: 700,
              color: primary ? '#FFFFFF' : D.navy,
              lineHeight: 1.4,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: '.75rem',
              lineHeight: 1.5,
              color: primary
                ? 'rgba(255,255,255,0.88)'
                : D.muted,
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>

      {/* Arrow */}
      <ArrowForwardRoundedIcon
        sx={{
          flexShrink: 0,
          color: primary ? '#FFFFFF' : D.navy,
          fontSize: 22,
        }}
      />
    </ButtonBase>
  )
}


export default function Dashboard() {
  const now = useNow()
  const currentUser = useCurrentUser()
  const outletContext = useOutletContext() ?? {}
  const meetingSettings = useMeetingSettings()

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
      .sort(
        (a, b) => a._start.getTime() - b._start.getTime(),
      )
  }, [now, currentUser])

  const handleSettingsChange = (meetingId, changes) => {
    saveMeetingSettings(meetingId, changes)
  }

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        color: D.text,
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 1800,
          mx: 'auto',
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            lg: 'minmax(0, 3fr) minmax(0, 2fr)',
          },
          columnGap: { xs: 3, lg: 3.5, xl: 4 },
          rowGap: 3,
          alignItems: 'stretch',
        }}
      >
        {/* LEFT: 60% - Today's meetings */}
        <Box sx={{ minWidth: 0 }}>
          <MeetingTimeline
            meetings={sortedMeetings}
            now={now}
            meetingSettings={meetingSettings}
            onSettingsChange={handleSettingsChange}
          />
        </Box>

        {/* RIGHT: 40% - Quick Actions */}
        <Box
          component="aside"
          aria-label="Quick actions"
          sx={{
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            position: { lg: 'sticky' },
            top: { lg: 20 },

            // Vertical divider
            borderLeft: {
              xs: 'none',
              lg: `1px solid ${D.line}`,
            },

            // Space between divider and Quick Actions
            pl: {
              xs: 0,
              lg: 3,
              xl: 4,
            },
          }}
        >
          <Box sx={{ mb: 0.5 }}>
            <Typography
              component="h2"
              sx={{
                ...titleSx,
                fontSize: { xs: '1.5rem', md: '1.65rem' },
                fontWeight: 400,
                color: D.navy,
                pt: 0,
              }}
            >
              Quick Actions
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: '.8125rem',
                color: D.muted,
                lineHeight: 1.5,
              }}
            >
              Manage your meetings with ease.
            </Typography>
          </Box>

          {/* Invite MeetAI to an existing meeting */}
          <QuickActionCard
            title="Invite MeetAI to your Meeting"
            description="Add MeetAI to an existing Teams, Zoom or Google Meet call."
            icon={<LinkRoundedIcon sx={{ fontSize: 27 }} />}
            primary
            onClick={() => outletContext.openInstant?.()}
          />

          {/* Schedule a future meeting */}
          <QuickActionCard
            title="Schedule a Meeting"
            description="Plan a meeting for a future date and time."
            icon={<CalendarMonthRoundedIcon sx={{ fontSize: 27 }} />}
            onClick={() => outletContext.openCreate?.()}
          />
        </Box>
      </Box>
    </Box>
  )
}
