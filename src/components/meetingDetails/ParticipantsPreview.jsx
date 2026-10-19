import { useState } from 'react'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'

import ParticipantRow from './ParticipantRow'
import { getInitials } from './utils'

const NAVY = '#123A59'
const BLUE = '#0967B2'
const BORDER = '#DFE7EC'
const MUTED = '#5A7189'

/* -------------------------------------------------------------------------- */
/* Participants                                                               */
/* -------------------------------------------------------------------------- */

export default function ParticipantsPreview({ attendance, meeting }) {
  const [open, setOpen] = useState(false)

  const count = attendance.all.length

  return (
    <>
      <Paper
        data-tour="meeting-participants"
        elevation={0}
        sx={{
          width: '100%',
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
          <Stack direction="row" spacing={0.9} sx={{ alignItems: 'center' }}>
            <Box sx={{ display: 'flex', color: BLUE, '& svg': { fontSize: 19 } }}>
              <GroupsOutlinedIcon />
            </Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 750, color: NAVY }}>
              Participants
            </Typography>
          </Stack>

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
            {count} {count === 1 ? 'participant' : 'participants'}
          </Box>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 1.5,
          }}
        >
          {attendance.all.slice(0, 6).map((person, index) => (
            <Box key={person.email || person.name || index} sx={{ minWidth: 0 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  bgcolor: '#dfe8ff',
                  color: '#245ea8',
                }}
              >
                {getInitials(person.name)}
              </Avatar>

              <Typography
                noWrap
                sx={{ mt: 0.6, fontSize: '0.75rem', fontWeight: 600, color: NAVY }}
              >
                {person.name}
              </Typography>

              {(person.role || person.title || person.department) && (
                <Typography noWrap sx={{ fontSize: '0.75rem', color: MUTED }}>
                  {person.role || person.title || person.department}
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        <Button
          onClick={() => setOpen(true)}
          endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: '15px !important' }} />}
          sx={{
            mt: 1,
            px: 0,
            minWidth: 0,
            textTransform: 'none',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: BLUE,
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
        >
          View all participants
        </Button>
      </Paper>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '8px' } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#24364d',
          }}
        >
          All participants ({count})
          <IconButton size="small" onClick={() => setOpen(false)} aria-label="Close">
            <CloseOutlinedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pb: 2.5 }}>
          <ParticipantGroups attendance={attendance} meeting={meeting} />
        </DialogContent>
      </Dialog>
    </>
  )
}

function ParticipantGroups({ attendance, meeting }) {
  return (
    <Stack spacing={0.75}>
      {attendance.all.map((person, index) => {
        const key = person.email || person.name || index
        const attended = attendance.attended.some(
          (item) => (item.email || item.name) === key,
        )
        const notAttended = attendance.notAttended.some(
          (item) => (item.email || item.name) === key,
        )

        return (
          <ParticipantRow
            key={key}
            person={person}
            attended={attended ? true : notAttended ? false : null}
            meeting={meeting}
          />
        )
      })}
    </Stack>
  )
}