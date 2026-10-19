import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { D, sectionHeadSx, titleSx } from '../dashboard/dashTheme'

/* Section: thin navy rule, serif title, optional right-hand element. */
export function SectionCard({ title, right, children }) {
  return (
    <Box component="section" sx={{ minWidth: 0 }}>
      <Box sx={{ ...sectionHeadSx, alignItems: 'center', mb: 1.5 }}>
        <Typography component="h2" sx={titleSx}>
          {title}
        </Typography>
        {right}
      </Box>

      {children}
    </Box>
  )
}

export function NotReadyMessage({ children }) {
  return (
    <Box sx={{ p: 1.5, borderRadius: '6px', bgcolor: '#F7F9FE', border: `1px solid ${D.line}` }}>
      <Typography sx={{ fontSize: '.8125rem', lineHeight: 1.6, color: D.muted }}>{children}</Typography>
    </Box>
  )
}

export function NotReadyCard({ title, children }) {
  return (
    <SectionCard title={title}>
      <NotReadyMessage>{children}</NotReadyMessage>
    </SectionCard>
  )
}