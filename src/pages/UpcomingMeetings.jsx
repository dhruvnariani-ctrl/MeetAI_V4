import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import AddIcon from '@mui/icons-material/Add'
import RangeTabs from '../components/RangeTabs'
import ViewToggle from '../components/ViewToggle'
import InviteSwitch from '../components/InviteSwitch'
import MeetingsPanel from '../components/MeetingsPanel'
import { gradientButtonSx } from '../ButtonStyles'
import usePageTitle from '../hooks/usePageTitle'

const RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Monthly' },
]

export default function UpcomingMeetings() {
  usePageTitle('Upcoming meetings')
  const { openCreate } = useOutletContext()
  const [range, setRange] = useState('today')
  const [view, setView] = useState('list')
  const [autoJoin, setAutoJoin] = useState(false)
  const meetings = [] // TODO: replace with your calendar data

  return (
    <>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
            <Typography variant="h1" component="h1">Upcoming meetings</Typography>
            <Chip
              clickable
              variant="outlined"
              icon={<CalendarMonthOutlinedIcon />}
              label="Invite MeetAI"
              onClick={() => {}}
              sx={{
                height: 26, bgcolor: '#eef5ff', borderColor: '#cfe0f7', color: 'primary.main',
                fontSize: '0.8125rem', fontWeight: 600, '& .MuiChip-icon': { fontSize: 16, color: 'inherit' },
              }}
            />
          </Stack>
          <Typography variant="body2" sx={{ mt: 0.75, maxWidth: '70ch', color: 'text.secondary' }}>
            Showing meetings synced from your calendar. Instant meetings are available under All Meetings.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minHeight: 32, ml: 'auto' }}>
          <Button variant="contained" disableElevation startIcon={<AddIcon sx={{ fontSize: 18 }} />} onClick={openCreate} sx={gradientButtonSx(32)}>
            Create meeting
          </Button>
          <InviteSwitch checked={autoJoin} onChange={setAutoJoin} />
        </Box>
      </Stack>

      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 2.5, mb: 1.75 }}>
        <RangeTabs tabs={RANGES} value={range} onChange={setRange} panelId="meetings-panel" />
        <ViewToggle value={view} onChange={setView} />
      </Stack>

      <MeetingsPanel id="meetings-panel" tabId={`tab-${range}`} meetings={meetings} view={view} />
    </>
  )
}
