import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'

import { D, serif, titleSx } from '../dashboard/dashTheme'

const SIDE_BG = '#F5F8FD'
const SELECTED_BG = '#F0F4FC'

/* Checkbox / radio colour for the selectable cards. */
export const controlSx = {
  p: 0,
  color: '#8A97B5',
  '&.Mui-checked': { color: D.navy },
  '&.Mui-focusVisible': { outline: `2px solid ${D.navy}`, outlineOffset: 2 },
}

/* Section: thin navy rule, serif title, optional hint (same pattern as the page sections). */
export function Section({ title, hint, children }) {
  return (
    <Box component="section" sx={{ display: 'grid', gap: 1.25 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, pt: 1.25, borderTop: `1px solid ${D.navy}` }}>
        <Typography component="h3" sx={{ ...titleSx, fontSize: '1.25rem' }}>
          {title}
        </Typography>
        {hint && <Typography sx={{ fontSize: '.6875rem', color: D.muted }}>{hint}</Typography>}
      </Box>

      {children}
    </Box>
  )
}

/* Bordered card wrapping a real checkbox or radio (keyboard and screen reader safe). */
export function ChoiceCard({ control, checked, children }) {
  return (
    <Box
      component="label"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flex: 1,
        minWidth: 0,
        px: 1.25,
        py: 1,
        cursor: 'pointer',
        borderRadius: '6px',
        border: '1px solid',
        borderColor: checked ? D.navy : D.line,
        bgcolor: checked ? SELECTED_BG : '#fff',
        '&:hover': { borderColor: D.navy },
      }}
    >
      {control}
      <Box sx={{ minWidth: 0, flex: 1 }}>{children}</Box>
    </Box>
  )
}

/* One row of the live summary: small caps label, value, optional icon. */
export function SummaryRow({ icon, label, children, muted = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
      <Box aria-hidden="true" sx={{ mt: 0.25, color: muted ? D.muted : D.navy, '& svg': { fontSize: 18 } }}>
        {icon}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: '.625rem', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: D.muted }}>
          {label}
        </Typography>
        <Box sx={{ fontSize: '.8125rem', fontWeight: 500, lineHeight: 1.4, color: muted ? D.muted : D.navy, overflowWrap: 'anywhere' }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

/*
 * Dialog frame: pale title band, form on the left, live summary on the right.
 * On phones it goes full screen and the summary drops below the form.
 */
export default function DialogShell({
  open,
  onClose,
  titleId,
  descId,
  eyebrow,
  title,
  subtitle,
  side,
  sideLabel,
  children,
}) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      aria-labelledby={titleId}
      aria-describedby={descId}
      sx={{
        '& .MuiDialog-paper': {
          width: 880,
          maxWidth: '100%',
          borderRadius: fullScreen ? 0 : '6px',
          overflowY: 'auto',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, px: 2.5, py: 2, bgcolor: D.band }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: '.6875rem', fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase', color: D.muted }}>
            {eyebrow}
          </Typography>
          <Typography id={titleId} component="h2" sx={{ mt: 0.25, fontFamily: serif, fontWeight: 400, fontSize: '2rem', lineHeight: 1.1, color: D.navy }}>
            {title}
          </Typography>
          <Typography id={descId} sx={{ mt: 0.5, fontSize: '.75rem', color: D.text }}>
            {subtitle}
          </Typography>
        </Box>

        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{ ml: 'auto', color: D.navy, '&:focus-visible': { outline: `2px solid ${D.navy}` } }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: 'grid',
          flex: '0 0 auto',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.4fr) minmax(0, 1fr)' },
        }}
      >
        <Box sx={{ p: 2.5, minWidth: 0 }}>{children}</Box>

        <Box
          component="aside"
          aria-label={sideLabel}
          sx={{
            bgcolor: SIDE_BG,
            borderTop: { xs: `1px solid ${D.line}`, md: 0 },
            borderLeft: { md: `1px solid ${D.line}` },
          }}
        >
          <Box sx={{ p: 2.5, position: { md: 'sticky' }, top: 0 }}>{side}</Box>
        </Box>
      </Box>
    </Dialog>
  )
}