import { useState } from 'react'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'

import { formatTimeRange, getInitials } from './utils'
import { formatDate } from '../../utils/time'
import { NotReadyMessage } from './ui'
import MeetingStatusArea from './MeetingStatusArea'
import ParticipantsPreview from './ParticipantsPreview'

const NAVY = '#123A59'
const BLUE = '#0967B2'
const BORDER = '#DFE7EC'
const MUTED = '#5A7189'

const PRIORITY = {
  High: ['#fdecee', '#c53b4d'],
  Medium: ['#fff1dc', '#b86e00'],
  Low: ['#eef2f6', '#5b6f82'],
}

/* Placeholder shown for completed meetings until meeting.keyTakeaways exists. */
const DUMMY_TAKEAWAYS = [
  'Prioritize the offline mode feature for the mobile app.',
  'Collect more customer feedback on the onboarding flow.',
  'Align on go-to-market strategy for new features.',
  'Schedule a design review for next week.',
]

/* Short due label ("Oct 14") so it never wraps; falls back to formatDate. */
const shortDate = (value) => {
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? formatDate(value)
    : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function OverviewTab({
  meeting,
  meetingState,
  attendance,
  durationMinutes,
  meetAIInvited,
  onNavigate,
}) {
  const [copied, setCopied] = useState(false)

  const summary = meeting.meetingSummary
  const upcoming = meetingState?.type === 'upcoming'
  const completed = meetingState?.type === 'completed'
  const items = meeting.actionItems || []
  const takeaways = meeting.keyTakeaways?.length
    ? meeting.keyTakeaways
    : completed
      ? DUMMY_TAKEAWAYS
      : []
  const organizer = meeting.organizer?.name || meeting.organizer
  const timeText = formatTimeRange(meeting.start, meeting.end)
  const dateText = formatDate(meeting.start)

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        alignItems: 'start',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          md: 'repeat(2, minmax(0, 1fr))',
          lg: 'minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, .85fr)',
        },
      }}
    >
      {/* ------------------------------ Column 1 ------------------------------ */}
      <Stack spacing={1.5} sx={{ minWidth: 0 }}>
        <Card
          icon={<AutoAwesomeOutlinedIcon />}
          title="AI Summary"
          right={
            summary && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                onClick={copySummary}
                sx={smallButtonSx}
              >
                {copied ? 'Copied' : 'Copy Summary'}
              </Button>
            )
          }
        >
          {summary ? (
            <Typography
              sx={{
                fontSize: '0.8125rem',
                lineHeight: 1.7,
                color: '#52657d',
                whiteSpace: 'pre-line',
              }}
            >
              {summary}
            </Typography>
          ) : upcoming ? (
            <NotReadyMessage>
              The meeting summary will appear here after the meeting has taken place.
            </NotReadyMessage>
          ) : (
            <NotReadyMessage>No meeting summary is available yet.</NotReadyMessage>
          )}
        </Card>

        <Card
        data-tour="meeting-content"
        icon={<ArticleOutlinedIcon />} title="Meeting Details">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: 1.75,
            }}
          >
            <Field label="Topic" value={meeting.title || 'Untitled meeting'} />
            {organizer && <Field label="Organizer" value={organizer} />}
            <Field label="Date & Time" value={`${dateText} • ${timeText}`} />
            {meeting.id && <Field label="Meeting ID" value={`#${meeting.id}`} />}
            <Field label="Duration" value={`${durationMinutes} minutes`} />
            {meeting.platform && <Field label="Location" value={meeting.platform} />}
          </Box>
        </Card>

        <Card icon={<LightbulbOutlinedIcon />} title="Key Takeaways">
          {takeaways.length > 0 ? (
            <Stack spacing={1}>
              {takeaways.map((text, index) => (
                <Stack key={index} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <CheckCircleOutlinedIcon sx={{ fontSize: 17, color: '#287a4d' }} />
                  <Typography sx={{ fontSize: '0.75rem', color: '#42546b' }}>
                    {text}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          ) : (
            <NotReadyMessage>
              {upcoming
                ? 'Key takeaways will appear here after the meeting has taken place.'
                : 'No key takeaways are available yet.'}
            </NotReadyMessage>
          )}
        </Card>
      </Stack>

      {/* ------------------------------ Column 2 ------------------------------ */}
      <Stack spacing={1.5} sx={{ minWidth: 0 }}>
        <Card
          icon={<TaskAltOutlinedIcon />}
          title="Action Items"
          right={
            <Chip>
              {items.length} {items.length === 1 ? 'task' : 'tasks'}
            </Chip>
          }
        >
          {upcoming ? (
            <NotReadyMessage>
              Action items will be created from the meeting after it takes place.
            </NotReadyMessage>
          ) : items.length === 0 ? (
            <NotReadyMessage>
              No action items have been recorded for this meeting.
            </NotReadyMessage>
          ) : (
            <>
              <Stack divider={<Divider sx={{ borderColor: '#EDF1F4' }} />}>
                {items.slice(0, 4).map((item, index) => (
                  <ActionRow key={item.id || index} item={item} />
                ))}
              </Stack>

              <LinkButton onClick={() => onNavigate('actions')}>
                View all tasks
              </LinkButton>
            </>
          )}
        </Card>

        <ParticipantsPreview attendance={attendance} meeting={meeting} />
      </Stack>

      {/* ------------------------------ Column 3 ------------------------------ */}
      <Stack spacing={1.5} sx={{ minWidth: 0 }}>
        <Card icon={<EventAvailableOutlinedIcon />} title="Meeting Status">
          <Box sx={{ '& > div': { justifyContent: 'flex-start' } }}>
            <MeetingStatusArea
              meeting={meeting}
              state={meetingState}
              meetAIInvited={meetAIInvited}
            />
          </Box>
        </Card>

        <Card icon={<VideocamOutlinedIcon />} title="Recording & Transcript">
          <Stack spacing={1.25}>
            <ContentRow
              icon={<VideocamOutlinedIcon />}
              label="Recording"
              available={meeting.recording?.available === true}
              detail={meeting.recording?.duration}
              upcoming={upcoming}
              action="Watch"
              onClick={() => onNavigate('recording')}
            />

            <ContentRow
              icon={<DescriptionOutlinedIcon />}
              label="Transcript"
              available={meeting.transcript?.available === true}
              upcoming={upcoming}
              action="View"
              onClick={() => onNavigate('transcript')}
            />
          </Stack>
        </Card>

        <Card icon={<InfoOutlinedIcon />} title="Meeting Info">
          <Stack spacing={1.25}>
            {meeting.platform && <Field label="Platform" value={meeting.platform} />}
            <Field label="Date" value={dateText} />
            <Field label="Time" value={timeText} />
          </Stack>
        </Card>
      </Stack>
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/* Pieces                                                                     */
/* -------------------------------------------------------------------------- */

const smallButtonSx = {
  textTransform: 'none',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: NAVY,
  borderColor: BORDER,
  borderRadius: '8px',
  py: 0.25,
  whiteSpace: 'nowrap',
}

function Card({ icon, title, right, children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${BORDER}`,
        borderRadius: '8px',
        bgcolor: '#fff',
        p: { xs: 1.75, sm: 2 },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}
      >
        <Stack direction="row" spacing={0.9} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Box sx={{ display: 'flex', color: BLUE, '& svg': { fontSize: 19 } }}>
            {icon}
          </Box>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 750, color: NAVY }}>
            {title}
          </Typography>
        </Stack>

        {right}
      </Stack>

      {children}
    </Paper>
  )
}

function Chip({ children }) {
  return (
    <Box
      sx={{
        px: 0.9,
        py: 0.2,
        borderRadius: '8px',
        bgcolor: '#EFF6FB',
        color: MUTED,
        fontSize: '0.75rem',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Box>
  )
}

function Field({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.75rem', color: MUTED }}>{label}</Typography>
      <Typography
        sx={{
          mt: 0.2,
          fontSize: '0.75rem',
          fontWeight: 600,
          color: NAVY,
          overflowWrap: 'anywhere',
        }}
      >
        {value}
      </Typography>
    </Box>
  )
}

function LinkButton({ children, onClick }) {
  return (
    <Button
      onClick={onClick}
      endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: '15px !important' }} />}
      sx={{
        mt: 0.5,
        px: 0,
        minWidth: 0,
        textTransform: 'none',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: BLUE,
        '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
      }}
    >
      {children}
    </Button>
  )
}

function ActionRow({ item }) {
  const done = item.status === 'Done' || item.completed === true
  const priority = PRIORITY[item.priority]

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', py: 1 }}>
      {done ? (
        <CheckCircleOutlinedIcon sx={{ fontSize: 19, color: '#287a4d', mt: 0.1 }} />
      ) : (
        <RadioButtonUncheckedIcon sx={{ fontSize: 19, color: BLUE, mt: 0.1 }} />
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: '0.75rem',
            lineHeight: 1.4,
            color: done ? MUTED : NAVY,
            textDecoration: done ? 'line-through' : 'none',
            overflowWrap: 'anywhere',
          }}
        >
          {item.title}
        </Typography>

        {(priority || item.due) && (
          <Stack
            direction="row"
            sx={{ alignItems: 'center', flexWrap: 'wrap', columnGap: 1, rowGap: 0.4, mt: 0.5 }}
          >
            {priority && (
              <Box
                sx={{
                  px: 0.9,
                  py: 0.15,
                  mx:0.4,
                  borderRadius: '8px',
                  bgcolor: priority[0],
                  color: priority[1],
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                {item.priority}
              </Box>
            )}

            {item.due && (
              <Typography
                sx={{ fontSize: '0.75rem', color: MUTED, whiteSpace: 'nowrap' }}
              >
                {shortDate(item.due)}
              </Typography>
            )}
          </Stack>
        )}
      </Box>

      {item.owner && (
        <Avatar
          title={item.owner}
          sx={{
            width: 24,
            height: 24,
            fontSize: '0.75rem',
            fontWeight: 700,
            bgcolor: '#dfe8ff',
            color: '#245ea8',
          }}
        >
          {getInitials(item.owner)}
        </Avatar>
      )}
    </Stack>
  )
}

function ContentRow({ icon, label, available, detail, upcoming, action, onClick }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '8px',
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          bgcolor: '#EFF6FB',
          color: BLUE,
          '& svg': { fontSize: 19 },
        }}
      >
        {icon}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: NAVY }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: MUTED }}>
          {available
            ? detail || 'Available'
            : upcoming
              ? 'Not available yet'
              : 'Not available'}
        </Typography>
      </Box>

      <Button
        size="small"
        variant="outlined"
        disabled={!available}
        onClick={onClick}
        sx={smallButtonSx}
      >
        {action}
      </Button>
    </Stack>
  )
}