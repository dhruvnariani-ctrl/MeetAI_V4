import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import { COLORS } from './dashboardUtils'

const METRICS = [
  {
    key: 'meetings',
    label: 'Meetings today',
    icon: CalendarMonthOutlinedIcon,
    iconColor: '#1681D5',
    iconBg: '#EAF4FE',
  },
  {
    key: 'liveCount',
    label: 'Live now',
    icon: SensorsOutlinedIcon,
    iconColor: '#15966B',
    iconBg: '#E4F5EE',
  },
  {
    key: 'remainingCount',
    label: 'Still to come',
    icon: AccessTimeOutlinedIcon,
    iconColor: '#1681D5',
    iconBg: '#EAF4FE',
  },
  {
    key: 'actionCount',
    label: 'Pending Action Items',
    icon: TaskAltOutlinedIcon,
    iconColor: '#7552D8',
    iconBg: '#F0EBFF',
  },
]

function StatCard({ value, label, icon: Icon, iconColor, iconBg, trend }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.1,
        minWidth: 0,
        height: 64,
        px: 1.25,
        py: 0.8,
        bgcolor: '#FFFFFF',
        border: '1px solid #E4EDF5',
        borderRadius: '8px',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          bgcolor: iconBg,
        }}
      >
        <Icon sx={{ fontSize: 19, color: iconColor }} />
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontSize: '0.9rem',
            fontWeight: 750,
            lineHeight: 1.2,
            color: COLORS.navy,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value ?? 0}
        </Typography>

        <Typography
          sx={{
            mt: 0.3,
            fontSize: '0.58rem',
            lineHeight: 1.3,
            color: COLORS.muted,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Typography>
      </Box>

      {trend != null && (
        <Typography
          sx={{
            alignSelf: 'center',
            flexShrink: 0,
            color: '#15966B',
            fontSize: '0.57rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          ↗ {trend}
        </Typography>
      )}
    </Box>
  )
}

function DayProgress({ value }) {
  const progress = Math.max(0, Math.min(100, Number(value) || 0))

  return (
    <Box
      sx={{
        height: 64,
        minWidth: 0,
        px: 1.5,
        py: 1.05,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        bgcolor: '#FFFFFF',
        border: '1px solid #E4EDF5',
        borderRadius: '8px',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 0.85,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.58rem',
            lineHeight: 1.2,
            color: COLORS.muted,
            whiteSpace: 'nowrap',
          }}
        >
          Day progress
        </Typography>

        <Typography
          sx={{
            fontSize: '0.62rem',
            lineHeight: 1.2,
            fontWeight: 750,
            color: COLORS.navy,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {progress}%
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        aria-label="Day progress"
        sx={{
          height: 6,
          borderRadius: 999,
          bgcolor: '#E9EFF5',
          '& .MuiLinearProgress-bar': {
            borderRadius: 999,
            background: 'linear-gradient(90deg, #16815B 0%, #65C780 100%)',
          },
        }}
      />
    </Box>
  )
}

export default function DashboardStats({
  meetings = 0,
  liveCount = 0,
  remainingCount = 0,
  actionCount = 0,
  dayProgress = 0,
}) {
  const values = {
    meetings,
    liveCount,
    remainingCount,
    actionCount,
  }

  return (
    <Box
      component="section"
      aria-label="Today at a glance"
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(4, minmax(0, 1fr)) minmax(190px, 1.5fr)',
        },
        gap: 0.9,
        alignItems: 'stretch',
        mb: 2,
        minWidth: 0,
      }}
    >
      {METRICS.map((metric) => (
        <StatCard
          key={metric.key}
          value={values[metric.key]}
          label={metric.label}
          icon={metric.icon}
          iconColor={metric.iconColor}
          iconBg={metric.iconBg}
          // Keep the existing metric values; no trend calculation is added.
        />
      ))}

      <DayProgress value={dayProgress} />
    </Box>
  )
}