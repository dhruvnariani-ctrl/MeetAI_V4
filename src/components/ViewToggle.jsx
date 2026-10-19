import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ViewListIcon from '@mui/icons-material/ViewList'
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined'
import { segmentedGroupSx, segmentedItemSx } from '../segmentedstyles'

export default function ViewToggle({ value, onChange }) {
  const reset = { border: 0, marginLeft: 0, borderRadius: '8px' }
  return (
    <ToggleButtonGroup
      exclusive
      value={value}
      onChange={(_, v) => v && onChange(v)} // ignore deselect: one layout is always active
      aria-label="Meeting layout"
      sx={{
        ...segmentedGroupSx,
        '& .MuiToggleButtonGroup-grouped': reset,
        '& .MuiToggleButtonGroup-grouped:not(:first-of-type)': reset,
        '& .MuiToggleButtonGroup-grouped:not(:last-of-type)': reset,
      }}
    >
      <ToggleButton value="list" disableRipple sx={segmentedItemSx}>
        <ViewListIcon sx={{ fontSize: 18, mr: 0.75 }} /> List
      </ToggleButton>
      <ToggleButton value="grid" disableRipple sx={segmentedItemSx}>
        <GridViewOutlinedIcon sx={{ fontSize: 18, mr: 0.75 }} /> Grid
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
