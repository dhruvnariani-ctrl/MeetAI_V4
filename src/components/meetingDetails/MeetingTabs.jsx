import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

import { D } from '../dashboard/dashTheme'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'transcript', label: 'Transcript' },
  { value: 'recording', label: 'Recording' },
  { value: 'actions', label: 'Action Items' },
]

export const VALID_TABS = TABS.map((tab) => tab.value)

/* Pill-style tabs: the selected one is filled navy. */
export default function MeetingTabs({ value, onChange }) {
  return (
    <Tabs
      value={value}
      onChange={onChange}
      variant="scrollable"
      scrollButtons={false}
      aria-label="Meeting details sections"
      sx={{
        minHeight: 40,
        '& .MuiTabs-indicator': { display: 'none' },
        '& .MuiTabs-flexContainer': { gap: 0.75 },
        '& .MuiTab-root': {
          minHeight: 38,
          minWidth: 0,
          px: 2,
          borderRadius: '19px',
          border: `1px solid ${D.line}`,
          bgcolor: '#fff',
          textTransform: 'none',
          fontSize: '.8125rem',
          fontWeight: 500,
          color: D.navy,
          '&:hover': { bgcolor: '#E4EBF8' },
          '&.Mui-focusVisible': { outline: `2px solid ${D.navy}`, outlineOffset: 2 },
        },
        '& .MuiTab-root.Mui-selected': { color: '#fff', bgcolor: D.navy, borderColor: D.navy, fontWeight: 600 },
      }}
    >
      {TABS.map(({ value: tabValue, label }) => (
        <Tab key={tabValue} value={tabValue} label={label} />
      ))}
    </Tabs>
  )
}