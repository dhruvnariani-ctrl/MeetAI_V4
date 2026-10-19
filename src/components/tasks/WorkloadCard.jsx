
import { Box, Button, Paper, Typography } from '@mui/material'
import { ChevronRight, GroupsOutlined } from '@mui/icons-material'

import { CARD_SX, COLORS } from './taskConstants'
import SectionHeading from './SectionHeading'

export default function WorkloadCard({
  openCount,
  highPriority,
  dueSoon,
  onViewAll,
}) {
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
      <SectionHeading
        icon={<GroupsOutlined />}
        title="Workload overview"
      />

      <Typography
        sx={{
          mt: 1.25,
          color: COLORS.text,
          fontSize: '0.75rem',
          lineHeight: 1.65,
        }}
      >
        You have{' '}
        <Box
          component="span"
          sx={{
            color: COLORS.blue,
            fontWeight: 800,
          }}
        >
          {openCount} open {openCount === 1 ? 'task' : 'tasks'}
        </Box>{' '}
        across all statuses.
      </Typography>

      <Button
        onClick={onViewAll}
        endIcon={<ChevronRight />}
        sx={{
          mt: 0.55,
          px: 0,
          py: 0.25,
          minWidth: 0,
          alignSelf: 'flex-start',
          color: COLORS.blue,
          fontSize: '0.75rem',
          fontWeight: 800,
          textTransform: 'none',
          '&:hover': {
            backgroundColor: 'transparent',
            color: '#075A9D',
          },
        }}
      >
        View all tasks
      </Button>

      <Typography
        sx={{
          color: COLORS.muted,
          fontSize: '0.75rem',
          mt: 0.25,
        }}
      >
        {highPriority} high-priority · {dueSoon} due this week
      </Typography>
    </Paper>
  )
}