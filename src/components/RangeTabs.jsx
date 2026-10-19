import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { segmentedGroupSx, segmentedItemSx } from '../segmentedstyles'

// MUI Tabs already provides role=tablist/tab, roving tabindex and arrow/Home/End keys.
export default function RangeTabs({ tabs, value, onChange, panelId }) {
  return (
    <Tabs
      value={value}
      onChange={(_, v) => onChange(v)}
      aria-label="Date range"
      sx={{
        ...segmentedGroupSx,
        '& .MuiTabs-indicator': { display: 'none' },
        '& .MuiTabs-flexContainer': { gap: '2px' },
      }}
    >
      {tabs.map((t) => (
        <Tab key={t.value} value={t.value} label={t.label} id={`tab-${t.value}`}
          aria-controls={panelId} disableRipple sx={segmentedItemSx} />
      ))}
    </Tabs>
  )
}
