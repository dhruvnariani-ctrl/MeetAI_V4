import { Suspense, useEffect, useRef, useState } from 'react'
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Snackbar from '@mui/material/Snackbar'

import CompanionBot from '../components/companion/CompanionBot'
import Header from '../components/Header'
import InstantJoinDialog from '../components/instant/InstantJoinDialog'
import CreateEventDialog from '../components/event/CreateEventDialog'
import { ErrorBoundary, PageSkeleton } from '../components/StateViews'
import TourRunner from '../components/tour/TourRunner'
import { D } from '../components/dashboard/dashTheme'

import { getAllMeetings } from '../data/meetings'
import { searchDirectory } from '../data/Directory'
import useCurrentUser from '../hooks/useCurrentUser'

const footerSx = {
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 1,
  px: { xs: 1.5, md: 2 },
  py: 1.5,
  borderTop: `1px solid ${D.line}`,
  color: D.muted,
  fontSize: '.6875rem',
}

function Footer({ syncedAt, onSync }) {
  const time = syncedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  return (
    <Box component="footer" sx={footerSx}>
      <Box>
        <Box
          component="button"
          type="button"
          onClick={onSync}
          aria-label="Refresh calendar"
          sx={{ p: 0, border: 0, bgcolor: 'transparent', color: 'inherit', font: 'inherit', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        >
          Calendar updated at {time}
        </Box>
        {/* ponytail: timezone label is hard-coded; read it from user settings if users span zones */}
        {' · All times in IST'}
      </Box>

      <Box data-tour="sidebar-controls">
        Your data is private and secure. ·{' '}
        <Link component={RouterLink} to="/how-it-works" color="inherit" underline="hover">
          Help
        </Link>
      </Box>
    </Box>
  )
}

export default function AppLayout() {
  const [lastSynced, setLastSynced] = useState(() => new Date())
  const [createOpen, setCreateOpen] = useState(false)
  const [createKey, setCreateKey] = useState(0)
  const [instantOpen, setInstantOpen] = useState(false)
  const [instantKey, setInstantKey] = useState(0)
  const [toast, setToast] = useState('')
  const [query, setQuery] = useState('')

  const currentUser = useCurrentUser()
  const mainRef = useRef(null)
  const firstRender = useRef(true)
  const { pathname } = useLocation()

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    mainRef.current?.scrollTo(0, 0)
    mainRef.current?.focus()
  }, [pathname])

  // A new key remounts the dialog, so every open starts with a blank form.
  const openCreate = () => {
    setCreateKey((key) => key + 1)
    setCreateOpen(true)
  }

  const openInstant = () => {
    setInstantKey((key) => key + 1)
    setInstantOpen(true)
  }

  const handleCreate = (event) => {
    setCreateOpen(false)
    setToast(`"${event.title}" was created`)
  }

  const handleRecord = (details) => {
    setInstantOpen(false)
    setToast(`MeetAI is joining${details.title ? ` "${details.title}"` : ' your meeting'}`)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100dvh',
        minHeight: 0,
        overflow: 'hidden',
        bgcolor: D.page,
      }}
    >
      <Box
        component="a"
        href="#main"
        sx={{
          position: 'fixed',
          left: 12,
          top: -60,
          zIndex: 2000,
          px: 2,
          py: 1.25,
          borderRadius: '12px',
          bgcolor: 'text.primary',
          color: '#fff',
          '&:focus': { top: 12 },
        }}
      >
        Skip to main content
      </Box>

      <Header
        query={query}
        onQueryChange={setQuery}
        companion={
          <CompanionBot
            meetings={getAllMeetings()}
            imageSrc={`${import.meta.env.BASE_URL}images/companion-robot.svg`}
            onCreateMeeting={openCreate}
            onInstantMeeting={openInstant}
            routes={{ tasks: '/tasks', recorded: '/recorded' }}
            placement="header"
          />
        }
      />

      <Box
        component="main"
        id="main"
        ref={mainRef}
        tabIndex={-1}
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflow: 'auto',
          outline: 'none',
          bgcolor: D.page,
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 },
        }}
      >
        <Box sx={{ flex: '1 0 auto', minWidth: 0, p: { xs: 1.5, md: 2 }, pb: { xs: 11, md: 2 } }}>
          <ErrorBoundary resetKey={pathname}>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet context={{ openCreate, openInstant, currentUser }} />
            </Suspense>
          </ErrorBoundary>
        </Box>

        <Footer syncedAt={lastSynced} onSync={() => setLastSynced(new Date())} />
      </Box>

      <TourRunner />

      <CreateEventDialog
        key={`create-${createKey}`}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        currentUser={currentUser}
        searchDirectory={searchDirectory}
      />

      <InstantJoinDialog
        key={`instant-${instantKey}`}
        open={instantOpen}
        onClose={() => setInstantOpen(false)}
        onSubmit={handleRecord}
        currentUser={currentUser}
        searchDirectory={searchDirectory}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToast('')} sx={{ width: '100%' }}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  )
}