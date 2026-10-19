import { Box, Paper, Typography } from '@mui/material'

import { COLORS } from './taskConstants'

export default function TaskBanner() {
  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        borderRadius: '12px',
      }}
    >
      <Box
        component="img"
        src={`${import.meta.env.BASE_URL}/images/Solar Panels and Wind Turbines in Green Fields.png`}
        alt="Solar panels and wind turbines"
        sx={{
          width: { xs: 110, sm: 160, md: 190 },
          minHeight: 160,
          alignSelf: 'stretch',
          objectFit: 'cover',
          flexShrink: 0,
          display: 'block',
        }}
      />

      <Box sx={{ display: 'flex', flex: 1, minWidth: 0, alignItems: 'stretch' }}>
        <Box sx={{ width: 5, flexShrink: 0, backgroundColor: '#DCEAF0' }} />

        <Box sx={{ px: { xs: 1.5, md: 3 }, py: 2.2, flex: 1 }}>
          <Typography
            sx={{
              color: COLORS.navy,
              fontSize: '0.9375rem',
              fontWeight: 800,
              lineHeight: 1.35,
            }}
          >
            Stay on top of what matters
          </Typography>

          <Typography
            sx={{
              mt: 0.6,
              color: COLORS.text,
              fontSize: '0.8125rem',
              lineHeight: 1.6,
            }}
          >
            Your action items, deadlines and progress — all in one place.
          </Typography>

          <Box
            sx={{
              mt: 1.4,
              width: 52,
              height: 4,
              borderRadius: 999,
              backgroundColor: COLORS.green,
            }}
          />
        </Box>
      </Box>
    </Paper>
  )
}
