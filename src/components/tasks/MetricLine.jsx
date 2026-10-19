
import { Box, Stack, Typography } from '@mui/material'

import { COLORS } from './taskConstants'

export default function MetricLine({ label, count, color }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%',
        minWidth: 0,
        boxSizing: 'border-box', }}
    >
      {/* Label aligned to the left */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', flex: '1 1 0',
          minWidth: 0, }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: color,
            flexShrink: 0,
          }}
        />

        <Typography
          sx={{
            color: COLORS.text,
            fontSize: '0.75rem',
            lineHeight: 1.4,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Typography>
      </Stack>

      {/* Count aligned consistently to the right */}
      <Typography
        sx={{
          color: COLORS.navy,
          fontWeight: 800,
          fontSize: '0.75rem',
          lineHeight: 1.4,
          textAlign: 'right',
          minWidth: 28,
          flexShrink: 0,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {count}
      </Typography>
    </Stack>
  )
}