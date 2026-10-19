
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'

import AccountMenu from './AccountMenu'
import HeaderSearch from './HeaderSearch'
import { D } from './dashboard/dashTheme'

// Update this path only if your official logo is stored elsewhere.
import AvaadaLogo from '../assets/Avaada Logo.png'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/', end: true },
  { label: 'Calendar', to: '/calendar' },
  { label: 'Recorded Meetings', to: '/recorded' },
  { label: 'My Tasks', to: '/tasks' },
]

function Mark() {
  const bars = [
    { x: 1, y: 8, h: 8, color: '#1F4FA3' },
    { x: 6, y: 3, h: 18, color: '#2E86C8' },
    { x: 11, y: 6, h: 12, color: '#5BA82B' },
    { x: 16, y: 1, h: 22, color: '#2E86C8' },
    { x: 21, y: 7, h: 10, color: '#1F4FA3' },
  ]

  return (
    <Box
      component="svg"
      viewBox="0 0 25 24"
      aria-hidden="true"
      sx={{
        width: 27,
        height: 27,
        display: 'block',
        flexShrink: 0,
      }}
    >
      {bars.map((bar, index) => (
        <rect
          key={index}
          x={bar.x}
          y={bar.y}
          width="3"
          height={bar.h}
          rx="1.5"
          fill={bar.color}
        />
      ))}
    </Box>
  )
}

export default function Header({
  query,
  onQueryChange,
  companion,
  onNotificationsClick,
  unreadNotifications = 0,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const theme = useTheme()
  const compactHeader = useMediaQuery(theme.breakpoints.down('lg'))

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const renderNavigation = (mobile = false) => {
    if (mobile) {
      return (
        <List disablePadding>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              end={item.end}
              onClick={closeMobileMenu}
              sx={{
                minHeight: 52,
                px: 2.5,
                borderRadius: 1,
                color: '#526574',
                '&.active': {
                  bgcolor: '#EFF6FB',
                  color: '#0967B2',
                  '& .MuiListItemText-primary': {
                    fontWeight: 700,
                  },
                },
                '&:hover': {
                  bgcolor: '#EFF6FB',
                },
              }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 15,
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          ))}
        </List>
      )
    }

    return (
      <Box
        component="nav"
        aria-label="Main navigation"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { lg: 0.5, xl: 0.75 },
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <Box
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.end}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 40,
              px: { lg: 0.9, xl: 1.25 },
              borderRadius: '7px',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              color: '#526574',
              '&:hover': {
                bgcolor: '#EFF6FB',
                color: '#123A59',
              },
              '&.active': {
                bgcolor: '#EFF6FB',
                color: '#0967B2',
                fontWeight: 700,
              },
            }}
          >
            {item.label}
          </Box>
        ))}
      </Box>
    )
  }

  const renderBrand = () => (
    <>
      {/* Official Avaada logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          pr: { xs: 1, sm: 1.5 },
          borderRight: '1px solid #DFE7EC',
        }}
      >
        <Box
          component="img"
          src={AvaadaLogo}
          alt="Avaada"
          sx={{
            display: 'block',
            width: { xs: 76, sm: 92, lg: 105 },
            maxHeight: 42,
            objectFit: 'contain',
          }}
        />
      </Box>

      {/* Existing MeetAI branding */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.8,
          flexShrink: 0,
        }}
      >
        <Mark />

        <Typography
          component="span"
          sx={{
            fontSize: 20,
            fontWeight: 750,
            letterSpacing: '-0.6px',
            lineHeight: 1,
            color: '#123A59',
            whiteSpace: 'nowrap',
          }}
        >
          MeetAI
        </Typography>
      </Box>
    </>
  )

  const renderNotifications = () => (
    <Tooltip title="Notifications">
      <IconButton
        aria-label="Notifications"
        onClick={onNotificationsClick}
        sx={{
          flex: '0 0 42px',
          width: 42,
          height: 42,
          p: 0,
          flexShrink: 0,
          color: '#526574',
          border: '1px solid #DFE7EC',
          borderRadius: '9px',
          '&:hover': {
            bgcolor: '#EFF6FB',
          },
        }}
      >
        <Box sx={{ position: 'relative', display: 'flex' }}>
          <NotificationsNoneOutlinedIcon />

          {unreadNotifications > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 9,
                height: 9,
                borderRadius: '50%',
                bgcolor: '#16815B',
                border: '2px solid #FFFFFF',
              }}
            />
          )}
        </Box>
      </IconButton>
    </Tooltip>
  )

  const renderCompanion = () => {
    if (!companion) return null

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {companion}
      </Box>
    )
  }

  const renderAccountMenu = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      <AccountMenu />
    </Box>
  )

  const renderSearch = () => (
    <Box
      sx={{
        flex: '1 1 0%',
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        '& > *': {
          width: '100%',
          minWidth: 0,
        },
      }}
    >
      {/* Preserve the original search functionality and props */}
      <HeaderSearch
        query={query}
        onQueryChange={onQueryChange}
      />
    </Box>
  )

  return (
    <>
      <AppBar
        component="header"
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: '#FFFFFF',
          color: D.text || '#304858',
          borderBottom: '1px solid #DFE7EC',
          zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1,
        }}
      >
        {compactHeader ? (
          /* TABLET AND MOBILE HEADER */
          <Box sx={{ width: '100%' }}>
            <Toolbar
              disableGutters
              sx={{
                boxSizing: 'border-box',
                minHeight: '64px !important',
                px: { xs: 1.25, sm: 2 },
                gap: { xs: 1, sm: 1.5 },
                display: 'flex',
                flexWrap: 'nowrap',
                alignItems: 'center',
              }}
            >
              {/* Hamburger opens the navigation drawer */}
              <Tooltip title={mobileMenuOpen ? 'Close menu' : 'Open menu'}>
                <IconButton
                  aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  aria-expanded={mobileMenuOpen}
                  onClick={() => setMobileMenuOpen((open) => !open)}
                  sx={{
                    width: 42,
                    height: 42,
                    flexShrink: 0,
                    color: '#123A59',
                    border: '1px solid #DFE7EC',
                    borderRadius: '9px',
                  }}
                >
                  {mobileMenuOpen ? (
                    <CloseOutlinedIcon />
                  ) : (
                    <MenuOutlinedIcon />
                  )}
                </IconButton>
              </Tooltip>

              {renderBrand()}

              <Box sx={{ flex: 1 }} />

              {renderNotifications()}

              {renderCompanion()}

              {renderAccountMenu()}
            </Toolbar>

            {/* Full-width search row prevents the search from being squeezed */}
            <Box
              sx={{
                px: { xs: 1.5, sm: 2 },
                pb: 1.5,
                pt: 0.25,
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {renderSearch()}
            </Box>
          </Box>
        ) : (
          /* DESKTOP HEADER */
          <Toolbar
            disableGutters
            sx={{
              boxSizing: 'border-box',
              minHeight: '68px !important',
              height: 68,
              px: { lg: 2, xl: 2.5 },
              display: 'flex',
              flexWrap: 'nowrap',
              alignItems: 'center',
              gap: { lg: 1.25, xl: 1.75 },
              overflow: 'hidden',
            }}
          >
            {renderBrand()}

            {renderNavigation()}

            {/* Expands leftward into remaining horizontal space */}
            {renderSearch()}

            {renderNotifications()}

            {renderCompanion()}

            {renderAccountMenu()}
          </Toolbar>
        )}
      </AppBar>

      {/* Responsive navigation drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={closeMobileMenu}
        sx={{
          display: compactHeader ? 'block' : 'none',
          '& .MuiDrawer-paper': {
            width: { xs: 'min(320px, 86vw)', sm: 340 },
            maxWidth: '100%',
            boxSizing: 'border-box',
            bgcolor: '#FFFFFF',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            p: 2,
            minHeight: 68,
          }}
        >
          {renderBrand()}

          <IconButton
            aria-label="Close navigation menu"
            onClick={closeMobileMenu}
            sx={{
              color: '#526574',
              flexShrink: 0,
            }}
          >
            <CloseOutlinedIcon />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: '#DFE7EC' }} />

        <Box sx={{ p: 1.5 }}>
          <Typography
            component="p"
            sx={{
              px: 1,
              pt: 0.5,
              pb: 1.25,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.7px',
              textTransform: 'uppercase',
              color: '#71818D',
            }}
          >
            Main navigation
          </Typography>

          {renderNavigation(true)}
        </Box>
      </Drawer>
    </>
  )
}