
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

import { D } from '../dashboard/dashTheme'

const TABS = [
  { value: 'overview', label: 'Summary' },
  { value: 'takeaways', label: 'Key Takeaways' },
  { value: 'participants', label: 'Participants' },
  { value: 'transcript', label: 'Transcript' },
  { value: 'recording', label: 'Recording' },
  { value: 'actions', label: 'Action Items' },
]

export const VALID_TABS = TABS.map((tab) => tab.value)

export default function MeetingTabs({ value, onChange }) {
  return (
    <Tabs
      value={value}
      onChange={onChange}
      variant="scrollable"
      scrollButtons={false}
      aria-label="Meeting details sections"
      sx={{
        minHeight: 42,
        width: 'fit-content',
        maxWidth: '100%',
        border: `1px solid ${D.line}`,
        borderRadius: '8px',
        bgcolor: '#fff',
        overflow: 'hidden',

        '& .MuiTabs-indicator': {
          display: 'none',
        },

        '& .MuiTabs-flexContainer': {
          gap: 0,
        },

        '& .MuiTab-root': {
          minHeight: 40,
          minWidth: 0,
          px: { xs: 1.5, sm: 2 },
          py: 1,
          borderRadius: 0,
          borderRight: `1px solid ${D.line}`,
          bgcolor: 'transparent',
          color: D.navy,
          textTransform: 'none',
          whiteSpace: 'nowrap',
          fontSize: '.8125rem',
          fontWeight: 500,
          flexShrink: 0,

          '&:last-of-type': {
            borderRight: 0,
          },

          '&:hover': {
            bgcolor: '#E4EBF8',
          },

          '&.Mui-focusVisible': {
            outline: `2px solid ${D.navy}`,
            outlineOffset: -3,
            zIndex: 1,
          },
        },

        '& .MuiTab-root.Mui-selected': {
          bgcolor: D.navy,
          color: '#fff',
          fontWeight: 600,
          borderRightColor: D.navy,
        },

        '& .MuiTabs-scroller': {
          overflowX: 'auto !important',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      }}
    >
      {TABS.map(({ value: tabValue, label }) => (
        <Tab
          key={tabValue}
          value={tabValue}
          label={label}
        />
      ))}
    </Tabs>
  )
}
