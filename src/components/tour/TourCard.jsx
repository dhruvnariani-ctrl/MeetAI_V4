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

const TourCard = forwardRef(function TourCard(
  {
    step,
    index,
    total,
    position,
    phonePlacement = 'bottom',
    onNext,
    onBack,
    onClose,
  },
  ref,
) {
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
          zIndex: 1502,
          boxSizing: 'border-box',

          width: {
            xs: 'calc(100vw - 24px)',
            sm: 360,
          },
          maxWidth: 360,

          // Phones: never taller than 40% of the screen (TourRunner reserves that much room);
          // longer text scrolls inside the card.
          maxHeight: { xs: '40dvh', sm: 'none' },

          // Larger screens: the position is calculated from the highlighted target.
          // Phones: pinned to the top or bottom edge by phonePlacement.
          top: {
            xs:
              phonePlacement === 'top'
                ? 'max(12px, env(safe-area-inset-top))'
                : 'auto',
            sm: position?.top ?? 12,
          },

          left: {
            xs: 12,
            sm: position?.left ?? 12,
          },

          bottom: {
            xs:
              phonePlacement === 'bottom'
                ? 'max(12px, env(safe-area-inset-bottom))'
                : 'auto',
            sm: 'auto',
          },

          borderRadius: '6px',
          overflowX: 'hidden',
          overflowY: { xs: 'auto', sm: 'hidden' },
          overscrollBehavior: 'contain',
          outline: 'none',
          boxShadow: '0 12px 36px rgba(20, 39, 94, .3)',
          bgcolor: '#FFFFFF',

          transition: 'top 180ms ease, left 180ms ease',

          '@media (max-width: 599.95px)': {
            '& .tour-card-hint': {
              display: 'none',
            },
          },
        }}
      >
        {/* Progress */}
        <Box
          aria-hidden="true"
          sx={{
            height: 3,
            bgcolor: D.line,
          }}
        >
          <Box
            sx={{
              width: `${(current / total) * 100}%`,
              height: '100%',
              bgcolor: D.navy,
              transition: 'width 180ms ease',
            }}
          />
        </Box>

        <Box
          sx={{
            p: { xs: 1.5, sm: 2.5 },
            display: 'grid',
            gap: { xs: 1, sm: 1.5 },
          }}
        >
          {/* Heading and close button */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minWidth: 0,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: '.625rem',
                  fontWeight: 600,
                  letterSpacing: '.07em',
                  textTransform: 'uppercase',
                  color: D.muted,
                  lineHeight: 1.3,
                }}
              >
                MeetAI tour · Step {current} of {total}
              </Typography>

              <Typography
                id={titleId}
                component="h2"
                sx={{
                  mt: 0.25,
                  fontFamily: serif,
                  fontWeight: 400,
                  fontSize: { xs: '1.15rem', sm: '1.5rem' },
                  lineHeight: 1.2,
                  color: D.navy,
                  overflowWrap: 'anywhere',
                }}
              >
                {step.title}
              </Typography>
            </Box>

            <IconButton
              size="small"
              onClick={onClose}
              aria-label="Close tour"
              sx={{
                color: D.navy,
                flexShrink: 0,
                '&:focus-visible': {
                  outline: `2px solid ${D.navy}`,
                },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>

          {/* Description: compact on mobile, full on desktop */}
          <Typography
            sx={{
              fontSize: { xs: '.78rem', sm: '.8125rem' },
              lineHeight: { xs: 1.45, sm: 1.6 },
              color: D.text,
              overflowWrap: 'anywhere',
              '@media (max-width: 599.95px)': {
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 3,
                overflow: 'hidden',
              },
            }}
          >
            {step.body}
          </Typography>

          {step.action && (
            <Box className="tour-card-hint">
              <TourHint label="Try this">
                {step.action}
              </TourHint>
            </Box>
          )}

          {step.tip && (
            <Box className="tour-card-hint">
              <TourHint label="Helpful tip">
                {step.tip}
              </TourHint>
            </Box>
          )}

          {/* Navigation controls */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 0.75,
              mt: 0.25,
              minWidth: 0,
            }}
          >
            <Button
              size="small"
              onClick={onClose}
              sx={{
                minHeight: 38,
                minWidth: 0,
                px: { xs: 0.5, sm: 1 },
                textTransform: 'none',
                color: D.muted,
                fontWeight: 500,
                fontSize: { xs: '.75rem', sm: '.8125rem' },
                whiteSpace: 'nowrap',
              }}
            >
              Skip tour
            </Button>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                ml: 'auto',
                flexShrink: 0,
              }}
            >
              {index > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={onBack}
                  sx={{
                    minHeight: 38,
                    minWidth: 0,
                    px: { xs: 1, sm: 1.5 },
                    textTransform: 'none',
                    borderRadius: '6px',
                    color: D.navy,
                    borderColor: D.line,
                    fontSize: { xs: '.75rem', sm: '.8125rem' },
                    '&:hover': {
                      borderColor: D.navy,
                      bgcolor: '#F5F8FD',
                    },
                    '& .MuiButton-startIcon': {
                      mr: { xs: 0.5, sm: 1 },
                    },
                  }}
                >
                  Back
                </Button>
              )}

              <Button
                size="small"
                variant="contained"
                disableElevation
                endIcon={
                  last ? undefined : <ArrowForward />
                }
                onClick={onNext}
                sx={{
                  minHeight: 38,
                  minWidth: 0,
                  px: { xs: 1.25, sm: 1.5 },
                  textTransform: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: { xs: '.75rem', sm: '.8125rem' },
                  whiteSpace: 'nowrap',
                  bgcolor: D.navy,
                  '&:hover': {
                    bgcolor: '#0D1C47',
                  },
                  '&:focus-visible': {
                    outline: `2px solid ${D.navy}`,
                    outlineOffset: 2,
                  },
                  '& .MuiButton-endIcon': {
                    ml: { xs: 0.5, sm: 1 },
                  },
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