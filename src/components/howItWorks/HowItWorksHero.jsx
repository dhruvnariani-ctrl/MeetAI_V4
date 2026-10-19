
import Eco from '@mui/icons-material/SpaOutlined'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function HowItWorksHero() {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: { xs: 64, sm: 76 },
      }}
    >
      {/* Page title */}
      <Box sx={{ minWidth: 0, pr: { xs: 0, sm: '250px' } }}>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 800,
            letterSpacing: '-.02em',
            lineHeight: 1.2,
            color: '#123A59',
          }}
        >
          How It Works
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            fontSize: '0.8125rem',
            color: 'text.secondary',
          }}
        >
          MeetAI is easy to use. Here’s how it all comes together.
        </Typography>
      </Box>

      {/* Rotated tagline */}
      <Box
        aria-hidden="true"
        sx={{
          display: { xs: 'none', sm: 'block' },
          position: 'absolute',
          top: 4,
          right: 12,
           transform: 'rotate(-15deg) translateY(3px)',
  transformOrigin: 'center',
  pointerEvents: 'none',
        }}
      >
        <Stack
          direction="row"
          spacing={0.8} sx={{ alignItems: 'center' }}>
          <Typography
            sx={{
              fontFamily: '"Segoe Script", "Brush Script MT", cursive',
              fontSize: '1.15rem',
              fontStyle: 'italic',
              lineHeight: 1.35,
              textAlign: 'right',
              whiteSpace: 'nowrap',
              color: '#16815B',
            }}
          >
            Simple steps.
            <br />
            Big difference.
          </Typography>

          <Eco
            sx={{
              fontSize: 36,
              flexShrink: 0,
              color: '#16815B',
              
            }}
          />
        </Stack>
      </Box>
    </Box>
  )
}
