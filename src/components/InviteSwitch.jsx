import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'

export default function InviteSwitch({ checked, onChange }) {
  return (
    // Tooltip opens on hover and keyboard focus; describeChild exposes it as a description, not a label.
    <Tooltip title="This will auto join all your meetings" placement="bottom-end" describeChild>
      <FormControlLabel
        label="Invite MeetAI"
        sx={{ m: 0, '& .MuiFormControlLabel-label': { fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary' } }}
        control={
          <Switch
            size="small"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            inputprops={{ role: 'switch' }}
            sx={{
              '& .MuiSwitch-switchBase, & .MuiSwitch-switchBase.Mui-checked': { color: '#fff' },
              '& .MuiSwitch-track': { opacity: 1, bgcolor: '#a9b5c5' },
              '& .Mui-checked + .MuiSwitch-track': { opacity: 1, bgcolor: 'primary.main' },
            }}
          />
        }
      />
    </Tooltip>
  )
}
