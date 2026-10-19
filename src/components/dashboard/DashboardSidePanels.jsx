import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'

import { D, linkSx, sectionHeadSx, titleSx } from './dashTheme'

const WAVE = [8, 14, 20, 12, 18, 10, 16, 22, 11, 15]

const arrow = <ArrowOutwardRoundedIcon sx={{ fontSize: '12px !important' }} />

const switchSx = {
  '& .MuiSwitch-switchBase, & .MuiSwitch-switchBase.Mui-checked': { color: '#fff' },
  '& .MuiSwitch-track': { opacity: 1, bgcolor: '#8A97B5' },
  '& .Mui-checked + .MuiSwitch-track': { opacity: 1, bgcolor: D.green },
  '& .Mui-disabled + .MuiSwitch-track': { opacity: 0.5 },
}

function SwitchRow({ id, label, checked, disabled, onChange }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5, minWidth: 0 }}>
      <Typography id={id} noWrap title={label} sx={{ fontSize: '.75rem', color: disabled ? D.muted : D.text }}>
        {label}
      </Typography>

      <Switch
        size="small"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        slotProps={{ input: { 'aria-labelledby': id } }}
        sx={switchSx}
      />
    </Box>
  )
}

/*
 * Everything here comes from the saved per-meeting MeetAI settings, so it
 * always matches what the meeting rows, the Calendar and Meeting Details show.
 *
 * invitedCount / totalCount: upcoming meetings with MeetAI on, out of all upcoming.
 * liveNow: { title, inMeeting, recording } for the meeting in progress, or null.
 */
function AssistantCard({
  autoJoin,
  canAutoJoin,
  invitedCount = 0,
  totalCount = 0,
  recordVideo,
  liveNow,
  onAutoJoinChange,
  onRecordVideoChange,
  onInvite,
}) {
  const connection =
    totalCount === 0
      ? { text: 'No upcoming meetings', color: D.muted }
      : invitedCount === totalCount
        ? { text: 'Connected', color: D.greenText }
        : invitedCount === 0
          ? { text: 'Not connected', color: D.muted }
          : { text: `${invitedCount} of ${totalCount} connected`, color: D.navy }

  return (
    <Box
      component="section"
      aria-label="MeetAI Assistant"
      sx={{ p: 1.5, borderRadius: '6px', bgcolor: D.band, border: `1px solid ${D.line}` }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: '#C8432B' }} />
          <Typography component="h2" sx={{ fontSize: '.8125rem', fontWeight: 600, color: D.navy }}>
            MeetAI Assistant
          </Typography>
        </Box>

        <Typography aria-live="polite" sx={{ fontSize: '.6875rem', fontWeight: 600, color: connection.color, whiteSpace: 'nowrap' }}>
          {connection.text}
        </Typography>
      </Box>

      {liveNow && (
        <Typography
          aria-live="polite"
          sx={{ mb: 0.75, fontSize: '.6875rem', fontWeight: 500, color: liveNow.inMeeting ? D.greenText : D.muted }}
        >
          {liveNow.inMeeting
            ? `● MeetAI is in “${liveNow.title}” now${liveNow.recording ? ' · recording video' : ''}`
            : `MeetAI is not in “${liveNow.title}”`}
        </Typography>
      )}

      {/* Both switches on one line */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: 2, alignItems: 'center' }}>
        <SwitchRow
          id="auto-join-label"
          label="Auto-join upcoming"
          checked={autoJoin}
          disabled={!canAutoJoin}
          onChange={onAutoJoinChange}
        />

        {/* Video recording follows MeetAI: it can only be on for meetings MeetAI joins. */}
        <SwitchRow
          id="record-video-label"
          label="Record video"
          checked={recordVideo}
          disabled={invitedCount === 0}
          onChange={onRecordVideoChange}
        />
      </Box>

      <Button
        variant="outlined"
        startIcon={<AddRoundedIcon />}
        onClick={onInvite}
        sx={{
          mt: 0.75,
          minHeight: 30,
          px: 1.25,
          borderRadius: '6px',
          fontSize: '.75rem',
          fontWeight: 500,
          textTransform: 'none',
          bgcolor: '#fff',
          color: D.navy,
          borderColor: D.line,
          '&:hover': { bgcolor: '#F5F8FD', borderColor: D.navy },
        }}
      >
        Invite MeetAI to a Meeting
      </Button>
    </Box>
  )
}

function Recordings({ recordings = [] }) {
  const navigate = useNavigate()

  return (
    <Box component="section" aria-label="Recent recordings" sx={{ minWidth: 0 }}>
      <Box sx={{ ...sectionHeadSx, mb: 1.5 }}>
        <Typography component="h2" sx={titleSx}>
          Recent Recordings
        </Typography>

        <Button sx={linkSx} endIcon={arrow} onClick={() => navigate('/recorded')}>
          All recordings
        </Button>
      </Box>

      {recordings.length === 0 ? (
        <Typography sx={{ fontSize: '.8125rem', color: D.text }}>No recordings yet.</Typography>
      ) : (
        <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
          {recordings.map((recording) => (
            <Box component="li" key={recording.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, minWidth: 0 }}>
              <IconButton
                aria-label={`Open recording of ${recording.title}`}
                onClick={() => navigate(`/meetings/${recording.id}`)}
                sx={{
                  width: 30,
                  height: 30,
                  flexShrink: 0,
                  border: `1px solid ${D.navy}`,
                  color: D.navy,
                  '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: 2 },
                }}
              >
                <PlayArrowRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontSize: '.8125rem', fontWeight: 500, color: D.navy }}>
                  {recording.title}
                </Typography>

                <Typography noWrap sx={{ fontSize: '.6875rem', color: D.muted }}>
                  {recording.when} · {recording.duration} · {recording.actions} action item
                  {recording.actions === 1 ? '' : 's'}
                </Typography>
              </Box>

              <Box aria-hidden="true" sx={{ display: 'flex', alignItems: 'center', gap: '2px', height: 22, flexShrink: 0 }}>
                {WAVE.map((height, index) => (
                  <Box key={index} sx={{ width: 2, height, borderRadius: 1, bgcolor: '#B7C3DD' }} />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default function DashboardSidePanels({
  autoJoin,
  canAutoJoin,
  invitedCount,
  totalCount,
  recordVideo,
  liveNow,
  onAutoJoinChange,
  onRecordVideoChange,
  onInvite,
  recordings = [],
  showAssistant = true,
  showRecordings = true,
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
      {showAssistant && (
        <AssistantCard
          autoJoin={autoJoin}
          canAutoJoin={canAutoJoin}
          invitedCount={invitedCount}
          totalCount={totalCount}
          recordVideo={recordVideo}
          liveNow={liveNow}
          onAutoJoinChange={onAutoJoinChange}
          onRecordVideoChange={onRecordVideoChange}
          onInvite={onInvite}
        />
      )}

      {showRecordings && <Recordings recordings={recordings} />}
    </Box>
  )
}