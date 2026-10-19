import { useId } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import ArrowForward from '@mui/icons-material/ArrowForward'

import { D, serif } from '../dashboard/dashTheme'
import TourHint from './TourHint'

/* Full-screen "Take a quick tour" welcome shown before the first step. */
export default function TourIntro({ onStart, onSkip }) {
  const titleId = useId()

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1500,
        bgcolor: 'rgba(20, 39, 94, .55)',
        display: 'grid',
        placeItems: 'center',
        p: 2,
      }}
    >
      <Paper
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        elevation={0}
        sx={{ width: '100%', maxWidth: 480, maxHeight: '100%', borderRadius: '6px', overflowX: 'hidden', overflowY: 'auto', boxShadow: '0 20px 50px rgba(20, 39, 94, .35)' }}
      >
        <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 }, bgcolor: D.band }}>
          <Typography sx={{ fontSize: '.6875rem', fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase', color: D.muted }}>
            MeetAI guided tour
          </Typography>
          <Typography id={titleId} component="h2" sx={{ mt: 0.25, fontFamily: serif, fontWeight: 400, fontSize: { xs: '1.7rem', sm: '2.1rem' }, lineHeight: 1.1, color: D.navy }}>
            Take a quick tour
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 }, display: 'grid', gap: 2 }}>
          <Typography sx={{ fontSize: '.875rem', lineHeight: 1.6, color: D.text }}>
            We&rsquo;ll walk you through the top menu, dashboard, calendar, recordings, meeting details and tasks so you
            know where everything is.
          </Typography>

          <TourHint label="What to expect">
            Follow the highlighted areas and use Next to move on. Press Escape or Skip to stop at any time.
          </TourHint>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1 }}>
            <Button onClick={onSkip} sx={{ textTransform: 'none', color: D.muted, fontWeight: 500 }}>
              Not now
            </Button>
            <Button
              autoFocus
              variant="contained"
              disableElevation
              endIcon={<ArrowForward />}
              onClick={onStart}
              sx={{
                textTransform: 'none',
                borderRadius: '6px',
                px: 2,
                fontWeight: 600,
                bgcolor: D.navy,
                '&:hover': { bgcolor: '#0D1C47' },
                '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: 2 },
              }}
            >
              Start tour
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}