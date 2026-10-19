import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'

import { greetingFor } from './dashboardUtils'
import { D, serif } from './dashTheme'

const buttonSx = {
  minHeight: 40,
  px: 2,
  borderRadius: '6px',
  fontSize: '.8125rem',
  fontWeight: 500,
  textTransform: 'none',
  whiteSpace: 'nowrap',
  '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: 2 },
}

export default function DashboardOverviewHeader({
  now,
  firstName,
  total,
  done,
  live,
  upcoming,
  onJoinLink,
  onSchedule,
}) {
  const weekday = now.toLocaleDateString('en-GB', { weekday: 'long' })
  const rest = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <Box
      component="section"
      aria-label="Today overview"
      data-tour="dashboard-welcome"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
        // Bleed to the edges of the padded <main> so the band spans the full width.
        mx: { xs: -1.5, md: -2 },
        mt: { xs: -1.5, md: -2 },
        px: { xs: 1.5, md: 2 },
        py: 2.5,
        bgcolor: D.band,
      }}
    >
      <Box sx={{ minWidth: 0, flex: '1 1 320px' }}>
        <Typography sx={{ fontSize: '.6875rem', fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase', color: D.muted }}>
          {weekday}, {rest} · Today&rsquo;s summary
        </Typography>

        <Typography
          component="h1"
          sx={{
            mt: 0.5,
            fontFamily: serif,
            fontWeight: 400,
            fontSize: { xs: '2.1rem', md: '2.9rem' },
            lineHeight: 1.1,
            color: D.navy,
          }}
        >
          {greetingFor(now)}, {firstName}.
        </Typography>

        <Typography aria-live="polite" sx={{ mt: 0.75, fontSize: '.8125rem', color: D.text }}>
          <Box component="strong" sx={{ fontWeight: 600, color: D.navy }}>
            {total} meeting{total === 1 ? '' : 's'} today.
          </Box>{' '}
          {done} done
          {live > 0 ? (
            <>
              ,{' '}
              <Box component="span" sx={{ fontWeight: 600, color: D.greenText }}>
                {live} happening now
              </Box>{' '}
              and{' '}
            </>
          ) : (
            ' and '
          )}
          {upcoming} coming up.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
        <Box data-tour="dashboard-new-meeting" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            data-tour="Add MeetAI to a Meeting"
            variant="outlined"
            startIcon={<LinkRoundedIcon />}
            onClick={onJoinLink}
            sx={{ ...buttonSx, bgcolor: '#fff', color: D.navy, borderColor: D.line, '&:hover': { bgcolor: '#F5F8FD', borderColor: D.navy } }}
          >
            Join with a link
          </Button>

          <Button
            variant="contained"
            disableElevation
            startIcon={<AddRoundedIcon />}
            onClick={onSchedule}
            sx={{ ...buttonSx, bgcolor: D.navy, color: '#fff', '&:hover': { bgcolor: '#0D1C47' } }}
          >
            Schedule a Meeting
          </Button>
        </Box>

        <Typography sx={{ fontSize: '.6875rem', color: D.muted }}>MeetAI is ready to help you.</Typography>
      </Box>
    </Box>
  )
}