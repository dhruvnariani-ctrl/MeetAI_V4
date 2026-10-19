import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'transcript', label: 'Transcript' },
  { value: 'recording', label: 'Recording' },
  { value: 'actions', label: 'Action Items' },
]

export const VALID_TABS = TABS.map((tab) => tab.value)

export default function MeetingTabs({ value, onChange }) {
  return (
    <Box sx={{ borderBottom: '1px solid #DFE7EC' }}>
      <Tabs
        value={value}
        onChange={onChange}
        variant="scrollable"
        scrollButtons={false}
        aria-label="Meeting details sections"
        sx={{
          minHeight: 48,
          '& .MuiTab-root': {
            minHeight: 48,
            minWidth: { xs: 90, sm: 110 },
            px: 2.25,
            textTransform: 'none',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#123A59',
          },
          '& .MuiTab-root.Mui-selected': { color: '#0967B2' },
          '& .MuiTabs-indicator': { height: 2, bgcolor: '#0967B2' },
        }}
      >
        {TABS.map(({ value: tabValue, label }) => (
          <Tab key={tabValue} value={tabValue} label={label} />
        ))}
      </Tabs>
    </Box>
  )
}