import { Box, Stack, Typography } from '@mui/material'

import { COLORS } from './taskConstants'

export default function SectionHeading({ icon, title, subtitle, trailing }) {
  return (
    <Stack
      direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', minWidth: 0 }}
      >
        {icon && (
          <Box
            sx={{
              width: 33,
              height: 33,
              flexShrink: 0,
              borderRadius: '8px',
              backgroundColor: COLORS.paleBlue,
              color: COLORS.blue,
              display: 'grid',
              placeItems: 'center',
              '& svg': { fontSize: 19 },
            }}
          >
            {icon}
          </Box>
        )}

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: COLORS.navy,
              fontWeight: 800,
              fontSize: '0.875rem',
              lineHeight: 1.4,
            }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              sx={{
                mt: 0.25,
                color: COLORS.muted,
                fontSize: '0.75rem',
                lineHeight: 1.45,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>

      {trailing}
    </Stack>
  )
}
