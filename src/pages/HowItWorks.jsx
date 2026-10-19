import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'

import HowItWorksSections from '../components/howItWorks/HowItWorksSections'
import { startAppTour } from '../components/tour/TourStorage'
import { APP_TOUR_STEPS } from '../data/tours'
import { PAGE_TOURS } from '../data/pageTours'
import { D, linkSx, sectionHeadSx, serif, titleSx } from '../components/dashboard/dashTheme'

export default function HowItWorks() {
  return (
    <Box sx={{ width: '100%', minWidth: 0, color: D.text }}>
      {/* Title band, same treatment as the other pages */}
      <Box
        component="section"
        aria-label="How it works overview"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          mx: { xs: -1.5, md: -2 },
          mt: { xs: -1.5, md: -2 },
          px: { xs: 1.5, md: 2 },
          py: 2.5,
          bgcolor: D.band,
        }}
      >
        <Box sx={{ minWidth: 0, flex: '1 1 320px' }}>
          <Typography sx={{ fontSize: '.6875rem', fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase', color: D.muted }}>
            Guide
          </Typography>

          <Typography
            component="h1"
            sx={{ mt: 0.5, fontFamily: serif, fontWeight: 400, fontSize: { xs: '1.9rem', md: '2.6rem' }, lineHeight: 1.1, color: D.navy }}
          >
            How It Works
          </Typography>

          <Typography sx={{ mt: 0.75, fontSize: '.8125rem', color: D.text }}>
            MeetAI is easy to use. Here&rsquo;s how it all comes together.
          </Typography>
        </Box>

        <Button
          variant="contained"
          disableElevation
          startIcon={<PlayCircleOutlineOutlinedIcon />}
          onClick={() => startAppTour(APP_TOUR_STEPS)}
          sx={{
            minHeight: 40,
            px: 2,
            borderRadius: '6px',
            fontSize: '.8125rem',
            fontWeight: 500,
            textTransform: 'none',
            bgcolor: D.navy,
            '&:hover': { bgcolor: '#0D1C47' },
            '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: 2 },
          }}
        >
          Start the app tour
        </Button>
      </Box>

      <Box sx={{ pt: 3 }}>
        <HowItWorksSections />
      </Box>

      {/* One tour per page */}
      <Box component="section" aria-label="Page tours" sx={{ mt: 5 }}>
        <Box sx={{ ...sectionHeadSx, mb: 2 }}>
          <Typography component="h2" sx={titleSx}>
            Want to learn just one thing?
          </Typography>
          <Typography sx={{ fontSize: '.6875rem', color: D.muted }}>Take a short tour of a single page.</Typography>
        </Box>

        <Box
          component="ul"
          sx={{
            display: 'grid',
            gap: 2,
            m: 0,
            p: 0,
            listStyle: 'none',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
          }}
        >
          {PAGE_TOURS.map((page) => (
            <Box
              component="li"
              key={page.id}
              sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, p: 2, bgcolor: '#F7F9FE', border: `1px solid ${D.line}`, borderRadius: '6px' }}
            >
              <Typography component="h3" sx={{ fontFamily: serif, fontWeight: 400, fontSize: '1.3rem', color: D.navy }}>
                {page.title}
              </Typography>
              <Typography sx={{ flex: 1, fontSize: '.75rem', lineHeight: 1.55, color: D.text }}>{page.description}</Typography>
              <Button sx={{ ...linkSx, justifyContent: 'flex-start', fontSize: '.75rem' }} onClick={() => startAppTour(page.steps)}>
                Tour {page.title} →
              </Button>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}