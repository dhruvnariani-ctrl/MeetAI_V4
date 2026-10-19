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

function AssistantCard({ autoJoin, canAutoJoin, onAutoJoinChange, onInvite }) {
  const navigate = useNavigate()

  return (
    <Box
      component="section"
      aria-label="MeetAI Assistant"
      sx={{ p: 2, borderRadius: '6px', bgcolor: D.band, border: `1px solid ${D.line}` }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: '#C8432B' }} />
          <Typography component="h2" sx={{ fontSize: '.8125rem', fontWeight: 600, color: D.navy }}>
            MeetAI Assistant
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '.6875rem', fontWeight: 500, color: D.greenText }}>Connected</Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography id="auto-join-label" sx={{ fontSize: '.75rem', color: D.text }}>
          Auto-join upcoming meetings
        </Typography>
        <Switch
          size="small"
          checked={autoJoin}
          disabled={!canAutoJoin}
          onChange={(event) => onAutoJoinChange?.(event.target.checked)}
          slotProps={{ input: { 'aria-labelledby': 'auto-join-label' } }}
          sx={{
            '& .MuiSwitch-switchBase, & .MuiSwitch-switchBase.Mui-checked': { color: '#fff' },
            '& .MuiSwitch-track': { opacity: 1, bgcolor: '#8A97B5' },
            '& .Mui-checked + .MuiSwitch-track': { opacity: 1, bgcolor: D.green },
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<AddRoundedIcon />}
          onClick={onInvite}
          sx={{
            minHeight: 34,
            px: 1.5,
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
          Invite MeetAI
        </Button>

        <Button sx={linkSx} endIcon={arrow} onClick={() => navigate('/recorded')}>
          Recording settings
        </Button>
      </Box>
    </Box>
  )
}

function Recordings({ recordings }) {
  const navigate = useNavigate()

  return (
    <Box component="section" aria-label="Recent recordings">
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
            <Box component="li" key={recording.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
              <IconButton
                aria-label={`Open recording of ${recording.title}`}
                onClick={() => navigate(`/meetings/${recording.id}`)}
                sx={{
                  width: 30,
                  height: 30,
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

              <Box aria-hidden="true" sx={{ display: 'flex', alignItems: 'center', gap: '2px', height: 22 }}>
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

export default function DashboardSidePanels({ autoJoin, canAutoJoin, onAutoJoinChange, onInvite, recordings }) {
  return (
    <>
      <AssistantCard
        autoJoin={autoJoin}
        canAutoJoin={canAutoJoin}
        onAutoJoinChange={onAutoJoinChange}
        onInvite={onInvite}
      />
      <Recordings recordings={recordings} />
    </>
  )
}