
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'

import { joinUrlOf } from '../dashboard/dashboardUtils'
import { D, linkSx, sectionHeadSx, titleSx } from '../dashboard/dashTheme'

const arrow = <ArrowOutwardRoundedIcon sx={{ fontSize: '12px !important' }} />

function Fact({ label, children }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 2,
        py: 0.85,
        borderBottom: `1px solid ${D.line}`,
      }}
    >
      <Typography
        sx={{
          fontSize: '.75rem',
          color: D.muted,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: '.8125rem',
          fontWeight: 500,
          color: D.navy,
          textAlign: 'right',
          overflowWrap: 'anywhere',
        }}
      >
        {children}
      </Typography>
    </Box>
  )
}

/*
 * Left rail contains meeting details only.
 * Status, participants, and content are displayed elsewhere.
 */
export default function MeetingRail({ meeting, durationMinutes, dateText, timeText, meetingState }) {
  const completed = meetingState?.type === 'completed'
  const organizer = meeting?.organizer?.name || meeting?.organizer
  const joinUrl = joinUrlOf(meeting)

  return (
    <Box
      component="aside"
      aria-label="Meeting details"
      sx={{
        minWidth: 0,
        display: 'grid',
        gap: 1.5,
        alignContent: 'start',
      }}
    >
      <Box component="section" aria-label="Details">
        <Box sx={sectionHeadSx}>
          <Typography component="h2" sx={titleSx}>
            Details
          </Typography>
        </Box>

        <Box sx={{ mt: 0.5 }}>
          <Fact label="Date">{dateText}</Fact>
          <Fact label="Time">{timeText}</Fact>
          <Fact label="Duration">{durationMinutes} min</Fact>

          {meeting?.platform && (
            <Fact label="Platform">{meeting.platform}</Fact>
          )}

          {organizer && (
            <Fact label="Organizer">{organizer}</Fact>
          )}

          {meeting?.id && (
            <Fact label="Meeting ID">#{meeting.id}</Fact>
          )}
        </Box>

        {joinUrl && !completed && (
          <Button
            sx={{ ...linkSx, mt: 1 }}
            endIcon={arrow}
            component="a"
            href={joinUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open meeting link
          </Button>
        )}
      </Box>
    </Box>
  )
}
