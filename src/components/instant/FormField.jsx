import { forwardRef, useId } from 'react'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import OutlinedInput from '@mui/material/OutlinedInput'

import { D } from '../dashboard/dashTheme'

const ERROR = '#B3261E'

export const inputSx = {
  borderRadius: '6px',
  bgcolor: '#fff',
  fontSize: '0.875rem',
  color: D.navy,
  '& .MuiOutlinedInput-notchedOutline': { borderColor: D.line },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: D.navy },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: D.navy, borderWidth: 2 },
  '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: ERROR },
  '& input': { py: '10px' },
  '& input::placeholder': { opacity: 1, color: D.muted },
}

export const labelSx = {
  display: 'block',
  mb: 0.75,
  fontSize: '0.75rem',
  fontWeight: 600,
  color: D.text,
  '&.Mui-focused, &.Mui-error': { color: D.text },
}

// Label above the input, optional/required marker, helper or error text wired up with aria-describedby.
// labelFontSize: override the label size.
// inputAttrs: extra attributes for the native <input> (min, max, step...).
const FormField = forwardRef(function FormField(
  { label, optional, required, helper, error, startIcon, labelFontSize, inputAttrs, ...rest },
  ref,
) {
  const id = useId()
  const helperId = `${id}-help`
  return (
    <FormControl fullWidth required={required} error={error}>
      <FormLabel htmlFor={id} sx={{ ...labelSx, ...(labelFontSize && { fontSize: labelFontSize }) }}>
        {label}
        {optional && <Box component="span" sx={{ fontWeight: 400, color: D.muted }}> (optional)</Box>}
      </FormLabel>
      <OutlinedInput
        {...rest}
        id={id}
        inputRef={ref}
        startAdornment={startIcon && <Box sx={{ display: 'flex', mr: 1, color: D.muted }}>{startIcon}</Box>}
        slotProps={{ input: { 'aria-describedby': helper ? helperId : undefined, ...inputAttrs } }}
        sx={inputSx}
      />
      {helper && (
        <FormHelperText id={helperId} role={error ? 'alert' : undefined} sx={{ mx: 0, mt: 0.75, fontSize: '0.75rem', color: error ? ERROR : D.muted }}>
          {helper}
        </FormHelperText>
      )}
    </FormControl>
  )
})

export default FormField