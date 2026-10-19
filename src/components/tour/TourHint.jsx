import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { D } from '../dashboard/dashTheme'

/* Pale box with a small caps label, e.g. "Try this" / "Helpful tip". */
export default function TourHint({ label, children }) {
  return (
    <Box sx={{ p: 1.25, borderRadius: '6px', bgcolor: D.band }}>
      <Typography sx={{ fontSize: '.625rem', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: D.muted }}>
        {label}
      </Typography>
      <Typography sx={{ mt: 0.25, fontSize: '.75rem', lineHeight: 1.5, color: D.text }}>{children}</Typography>
    </Box>
  )
}