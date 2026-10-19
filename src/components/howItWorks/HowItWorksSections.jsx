import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import DashboardOutlined from '@mui/icons-material/DashboardOutlined'

import { HOW_IT_WORKS_SECTIONS } from '../../data/sections'
import { D, titleSx } from '../dashboard/dashTheme'

/* Used only when data/sections.js has no Dashboard entry of its own. */
const DASHBOARD_SECTION = {
  id: 'dashboard',
  title: 'Dashboard',
  icon: DashboardOutlined,
  description: 'Your day at a glance.',
  steps: [
    'See what is done, what is live now and what is coming up today.',
    'Tick off the tasks in your To-Do List.',
    'Turn Invite MeetAI and Video recording on or off for any meeting.',
  ],
}

const hasDashboard = HOW_IT_WORKS_SECTIONS.some((section) =>
  /dashboard/i.test(`${section.id ?? ''} ${section.title ?? ''}`),
)

const SECTIONS = hasDashboard ? HOW_IT_WORKS_SECTIONS : [DASHBOARD_SECTION, ...HOW_IT_WORKS_SECTIONS]

/* One numbered section per feature, laid out like the Dashboard sections. */
export default function HowItWorksSections() {
  return (
    <Box
      component="ol"
      sx={{
        display: 'grid',
        gap: { xs: 3, md: 4 },
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
        m: 0,
        p: 0,
        listStyle: 'none',
      }}
    >
      {SECTIONS.map((section, index) => {
        const Icon = section.icon

        return (
          <Box component="li" key={section.id} id={`how-it-works-${section.id}`} sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, borderTop: `1px solid ${D.navy}` }}>
              <Typography sx={{ fontSize: '.625rem', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: D.muted }}>
                Step {index + 1}
                {index === 0 && ' · Start here'}
              </Typography>
              {Icon && <Icon aria-hidden="true" sx={{ fontSize: 20, color: D.navy }} />}
            </Box>

            <Typography component="h2" sx={{ ...titleSx, mt: 1, fontSize: '1.7rem' }}>
              {section.title}
            </Typography>

            <Typography sx={{ mt: 0.75, fontSize: '.8125rem', lineHeight: 1.6, color: D.text }}>{section.description}</Typography>

            <Box component="ul" sx={{ m: 0, mt: 1.5, p: 0, listStyle: 'none', display: 'grid', gap: 1 }}>
              {section.steps.map((step, stepIndex) => (
                <Box component="li" key={`${section.id}-${stepIndex}`} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <CheckRoundedIcon aria-hidden="true" sx={{ mt: '2px', fontSize: 16, color: D.greenText, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '.8125rem', lineHeight: 1.5, color: D.text }}>{step}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}