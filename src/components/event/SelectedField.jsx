import { useId } from 'react'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { inputSx, labelSx } from '../instant/FormField'

// Label above a MUI Select. The label is tied to the select through aria-labelledby.
export default function SelectField({ label, value, onChange, options, labelFontSize }) {
  const id = useId()
  const labelId = `${id}-label`
  return (
    <FormControl fullWidth>
      <FormLabel id={labelId} sx={{ ...labelSx, ...(labelFontSize && { fontSize: labelFontSize }) }}>
        {label}
      </FormLabel>
      <Select
        labelId={labelId}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{ ...inputSx, '& .MuiSelect-select': { py: '10px' } }}
      >
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value} sx={{ fontSize: '0.875rem' }}>{o.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}