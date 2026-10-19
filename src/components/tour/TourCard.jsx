import { forwardRef, useId } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowForward from '@mui/icons-material/ArrowForward'
import Close from '@mui/icons-material/Close'

import { D, serif } from '../dashboard/dashTheme'
import TourHint from './TourHint'

/*
 * The floating card for one tour step.
 * `position` is { top, left } from positionCard(); the ref goes to the Paper
 * so TourRunner can move keyboard focus to it.
 */
const TourCard = forwardRef(function TourCard({ step, index, total, position, onNext, onBack, onClose }, ref) {
  const titleId = useId()
  const current = index + 1
  const last = index === total - 1

  return (
    <Fade in timeout={180}>
      <Paper
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        elevation={0}
        sx={{
          position: 'fixed',
          zIndex: 1402,
          width: { xs: 'calc(100vw - 32px)', sm: 360 },
          maxWidth: 360,
          top: { xs: 'auto', sm: position?.top ?? -9999 },
          left: { xs: 16, sm: position?.left ?? -9999 },
          bottom: { xs: 16, sm: 'auto' },
          borderRadius: '6px',
          overflow: 'hidden',
          outline: 'none',
          boxShadow: '0 12px 36px rgba(20, 39, 94, .3)',
          transition: 'top 180ms ease, left 180ms ease',
        }}
      >
        {/* Progress */}
        <Box aria-hidden="true" sx={{ height: 3, bgcolor: D.line }}>
          <Box sx={{ width: `${(current / total) * 100}%`, height: '100%', bgcolor: D.navy, transition: 'width 180ms ease' }} />
        </Box>

        <Box sx={{ p: 2.5, display: 'grid', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '.625rem', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: D.muted }}>
                MeetAI tour · Step {current} of {total}
              </Typography>
              <Typography id={titleId} component="h2" sx={{ mt: 0.25, fontFamily: serif, fontWeight: 400, fontSize: '1.5rem', lineHeight: 1.2, color: D.navy }}>
                {step.title}
              </Typography>
            </Box>

            <IconButton
              size="small"
              onClick={onClose}
              aria-label="Close tour"
              sx={{ color: D.navy, '&:focus-visible': { outline: `2px solid ${D.navy}` } }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>

          <Typography sx={{ fontSize: '.8125rem', lineHeight: 1.6, color: D.text }}>{step.body}</Typography>

          {step.action && <TourHint label="Try this">{step.action}</TourHint>}
          {step.tip && <TourHint label="Helpful tip">{step.tip}</TourHint>}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
            <Button onClick={onClose} sx={{ textTransform: 'none', color: D.muted, fontWeight: 500 }}>
              Skip tour
            </Button>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {index > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={onBack}
                  sx={{ textTransform: 'none', borderRadius: '6px', color: D.navy, borderColor: D.line, '&:hover': { borderColor: D.navy, bgcolor: '#F5F8FD' } }}
                >
                  Back
                </Button>
              )}
              <Button
                variant="contained"
                disableElevation
                endIcon={last ? undefined : <ArrowForward />}
                onClick={onNext}
                sx={{
                  textTransform: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  bgcolor: D.navy,
                  '&:hover': { bgcolor: '#0D1C47' },
                  '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: 2 },
                }}
              >
                {last ? 'Finish' : 'Next'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Fade>
  )
})

export default TourCard