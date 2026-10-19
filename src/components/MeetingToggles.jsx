import { useState } from 'react'

import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'

import MeetAISettingsDialog, { switchSx } from './MeetAISettingDialog'

const toggleButtonSx = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.75,
  cursor: 'pointer',
  userSelect: 'none',
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: 2,
    borderRadius: '8px',
  },
}

// On the navy "happening now" card: white labels, green switches.
const darkSwitchSx = {
  ...switchSx,
  '& .Mui-checked + .MuiSwitch-track': { opacity: 1, bgcolor: '#5BA82B' },
}

const stop = (event) => event.stopPropagation()

export default function MeetingToggles({
  meeting,
  settings = {},
  onChange,
  disabled = false,
  dark = false,
}) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const autoJoin = settings.autoJoin === true
  const recordVideo = autoJoin && settings.recordVideo === true

  const labelSx = {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: dark ? '#fff' : 'text.primary',
    transition: 'color 120ms ease',
  }
  const hoverColor = dark ? '#7BD34A' : 'primary.main'
  const switchStyle = { ...(dark ? darkSwitchSx : switchSx), pointerEvents: 'none' }

  const openDialog = (event) => {
    event?.stopPropagation()
    if (!disabled) setDialogOpen(true)
  }

  const openOnKey = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openDialog(event)
    }
  }

  const handleSave = (changes) => {
    onChange?.(changes)
    setDialogOpen(false)
  }

  const recordLocked = disabled || !autoJoin

  return (
    <>
      <Box
        data-tour="dashboard-meetai-status"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
          opacity: disabled ? 0.7 : 1,
        }}
        onClick={stop}
        onMouseDown={stop}
        onPointerDown={stop}
      >
        <Box
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          aria-label={`Configure MeetAI for ${meeting.title}`}
          onClick={openDialog}
          onKeyDown={openOnKey}
          sx={{
            ...toggleButtonSx,
            cursor: disabled ? 'not-allowed' : 'pointer',
            '&:hover .meeting-toggle-label': { color: hoverColor },
          }}
        >
          <Typography className="meeting-toggle-label" sx={labelSx}>
            Invite MeetAI
          </Typography>

          <Switch
            size="small"
            checked={autoJoin}
            disabled={disabled}
            readOnly
            tabIndex={-1}
            slotProps={{ input: { 'aria-hidden': true } }}
            sx={switchStyle}
          />
        </Box>

        <Box
          role="button"
          tabIndex={recordLocked ? -1 : 0}
          aria-disabled={recordLocked}
          aria-label={`Configure video recording for ${meeting.title}`}
          onClick={openDialog}
          onKeyDown={openOnKey}
          sx={{
            ...toggleButtonSx,
            cursor: recordLocked ? 'not-allowed' : 'pointer',
            opacity: autoJoin ? 1 : 0.65,
            '&:hover .meeting-toggle-label': { color: hoverColor },
          }}
        >
          <Typography className="meeting-toggle-label" sx={labelSx}>
            Video recording
          </Typography>

          <Switch
            size="small"
            checked={recordVideo}
            disabled={disabled}
            readOnly
            tabIndex={-1}
            slotProps={{ input: { 'aria-hidden': true } }}
            sx={switchStyle}
          />
        </Box>
      </Box>

      <MeetAISettingsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        settings={settings}
        disabled={disabled}
      />
    </>
  )
}