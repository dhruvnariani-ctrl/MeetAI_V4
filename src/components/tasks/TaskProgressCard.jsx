
import { Box, Divider, Paper, Stack, Typography } from '@mui/material'
import { TrendingUp } from '@mui/icons-material'
import {
  CARD_SX,
  COLORS,
  PROGRESS_STATUSES,
  STATUS_COLORS,
} from './taskConstants'

import MetricLine from './MetricLine'
import SectionHeading from './SectionHeading'

export default function TaskProgressCard({ filterCounts, progress }) {
  const safeProgress = Math.min(100, Math.max(0, Number(progress) || 0))

  return (
    <Paper
      elevation={0}
      sx={{
        ...CARD_SX,
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}
    >
      {/* Card heading */}
      <Box sx={{ flexShrink: 0 }}>
        <SectionHeading
          icon={<TrendingUp />}
          title="Task progress"
        />
      </Box>

      {/* Circular progress centered above the status breakdown */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          minHeight: 0,
          mt: 1.5,
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 105,
            aspectRatio: '1',
            flexShrink: 0,
            borderRadius: '50%',
            background: `conic-gradient(${COLORS.green} ${safeProgress}%, #E7EEF3 ${safeProgress}% 100%)`,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Box
            sx={{
              width: '79%',
              height: '79%',
              borderRadius: '50%',
              backgroundColor: COLORS.white,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography
              sx={{
                color: COLORS.navy,
                fontSize: '0.9375rem',
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              {Math.round(safeProgress)}%
            </Typography>

            <Typography
              sx={{
                mt: 0.35,
                color: COLORS.muted,
                fontSize: '0.75rem',
              }}
            >
              complete
            </Typography>
          </Box>
        </Box>

        {/* Completed task count */}
        <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
          <Typography
            sx={{
              color: COLORS.navy,
              fontSize: '1rem',
              fontWeight: 800,
              lineHeight: 1.3,
            }}
          >
            {filterCounts.Done}/{filterCounts.All}
          </Typography>

          <Typography
            sx={{
              mt: 0.25,
              color: COLORS.muted,
              fontSize: '0.75rem',
            }}
          >
            Tasks completed
          </Typography>
        </Box>

        <Divider
          sx={{
            width: '100%',
            borderColor: COLORS.border,
            flexShrink: 0,
          }}
        />

        {/* Status labels and counts below the circle */}
        <Stack
          spacing={1.1}
          sx={{
            width: '100%',
            minWidth: 0,
            flex: 1,
            justifyContent: 'top',
          }}
        >
          {PROGRESS_STATUSES.map((status) => (
            <MetricLine
              key={status}
              label={status}
              count={filterCounts[status] ?? 0}
              color={STATUS_COLORS[status].dot}
            />
          ))}
        </Stack>
      </Box>

      <Divider
        sx={{
          my: 1.25,
          borderColor: COLORS.border,
          flexShrink: 0,
        }}
      />

      {/* Overall completion */}
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 0.75, width: '100%',
          minWidth: 0,
          flexShrink: 0, }}
      >
        <Typography
          sx={{
            color: COLORS.muted,
            fontSize: '0.75rem',
            textAlign: 'left',
            flex: 1,
            minWidth: 0,
          }}
        >
          Overall completion
        </Typography>

        <Typography
          sx={{
            color: COLORS.green,
            fontSize: '0.75rem',
            fontWeight: 800,
            textAlign: 'right',
            flexShrink: 0,
          }}
        >
          {Math.round(safeProgress)}%
        </Typography>
      </Stack>

      {/* Bottom progress bar */}
      <Box
        sx={{
          mt: 0.8,
          height: 7,
          flexShrink: 0,
          borderRadius: 999,
          backgroundColor: '#E7EEF3',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${safeProgress}%`,
            borderRadius: 999,
            backgroundColor: COLORS.green,
            transition: 'width .25s ease',
          }}
        />
      </Box>
    </Paper>
  )
}