
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { D } from '../dashboard/dashTheme'
import { SectionCard } from './ui'

export default function KeyTakeawaysTab({ meeting }) {
  const keyTakeaways = Array.isArray(meeting?.keyTakeaways)
    ? meeting.keyTakeaways.filter(
        (item) => typeof item === 'string' && item.trim().length > 0,
      )
    : []

  return (
    <SectionCard title="Key Takeaways">
      {keyTakeaways.length > 0 ? (
        <Box
          component="ul"
          sx={{
            m: 0,
            pl: 2.5,
            color: D.text,
            '& li': {
              mb: 1.5,
              pl: 0.5,
              lineHeight: 1.7,
            },
            '& li:last-child': {
              mb: 0,
            },
          }}
        >
          {keyTakeaways.map((takeaway, index) => (
            <li key={`${index}-${takeaway}`}>
              <Typography
                component="span"
                sx={{ color: 'inherit', fontSize: '0.9rem' }}
              >
                {takeaway}
              </Typography>
            </li>
          ))}
        </Box>
      ) : (
        <Typography
          sx={{
            color: D.muted,
            fontSize: '0.875rem',
            lineHeight: 1.6,
          }}
        >
          No key takeaways are available for this meeting yet.
        </Typography>
      )}
    </SectionCard>
  )
}
