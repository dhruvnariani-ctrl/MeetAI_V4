import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'

import useCurrentUser from '../hooks/useCurrentUser'
import { APP_TOUR_STEPS } from '../data/tours'
import { startAppTour } from './tour/TourStorage'
import { D } from './dashboard/dashTheme'

const itemSx = {
  minHeight: 48,
  px: 2,
  color: D.navy,
  '&:hover, &:focus-visible': {
    bgcolor: '#F5F8FD',
  },
}

const primary = {
  fontSize: '.8125rem',
  fontWeight: 600,
  color: D.navy,
}

const secondary = {
  fontSize: '.75rem',
  color: D.muted,
}

const logoutItemSx = {
  ...itemSx,
  color: '#B3261E',
  '&:hover, &:focus-visible': {
    bgcolor: '#FFF2F1',
  },
}

/*
 * Account button and account menu.
 * App tour starts the full tour.
 * How it works opens the guide.
 * Log out is always visible and calls onLogout when provided.
 */
export default function AccountMenu({ onStartTour, onLogout }) {
  const currentUser = useCurrentUser()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)

  const open = Boolean(anchorEl)

  const close = () => {
    setAnchorEl(null)
  }

  const displayName = currentUser?.name || 'User'
  const displayEmail = currentUser?.email || ''
  const firstName = displayName.split(' ')[0]

  const initials =
    currentUser?.initials ||
    displayName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()

  const handleTour = () => {
    close()

    if (onStartTour) {
      onStartTour()
    } else {
      startAppTour(APP_TOUR_STEPS)
    }
  }

  const handleGuide = () => {
    close()
    navigate('/how-it-works')
  }

  const handleLogout = () => {
    close()

    if (onLogout) {
      onLogout()
    }
  }

  return (
    <>
      <Button
        id="account-menu-button"
        aria-label={`Account menu for ${displayName}`}
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          minHeight: 40,
          gap: 1,
          px: 0.75,
          borderRadius: '20px',
          color: D.navy,
          textTransform: 'none',
          '&:hover': {
            bgcolor: '#E4EBF8',
          },
          '&:focus-visible': {
            outline: `2px solid ${D.navy}`,
            outlineOffset: 2,
          },
        }}
      >
        <Avatar
          sx={{
            width: 30,
            height: 30,
            bgcolor: '#DCE5F7',
            color: D.navy,
            fontSize: '.6875rem',
            fontWeight: 700,
          }}
        >
          {initials}
        </Avatar>

        <Typography
          sx={{
            display: { xs: 'none', sm: 'block' },
            fontSize: '.8125rem',
            fontWeight: 500,
            color: 'inherit',
          }}
        >
          {firstName}
        </Typography>

        <ExpandMoreRoundedIcon
          sx={{
            fontSize: 18,
            color: D.muted,
          }}
        />
      </Button>

      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        slotProps={{
          list: {
            'aria-labelledby': 'account-menu-button',
            disablePadding: true,
          },
          paper: {
            elevation: 0,
            sx: {
              mt: 1,
              width: 290,
              maxWidth: 'calc(100vw - 24px)',
              overflow: 'hidden',
              borderRadius: '6px',
              border: `1px solid ${D.line}`,
              boxShadow: '0 12px 32px rgba(20, 39, 94, .16)',
            },
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {/* Signed-in user */}
        <Box
          sx={{
            px: 2,
            py: 1.75,
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            bgcolor: D.band,
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              bgcolor: D.navy,
              color: '#fff',
              fontSize: '.875rem',
              fontWeight: 600,
            }}
          >
            {initials}
          </Avatar>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              noWrap
              sx={{
                fontSize: '.875rem',
                fontWeight: 600,
                color: D.navy,
              }}
            >
              {displayName}
            </Typography>

            <Typography
              noWrap
              sx={{
                fontSize: '.75rem',
                color: D.text,
              }}
            >
              {displayEmail}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* App tour */}
        <MenuItem onClick={handleTour} sx={itemSx}>
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: D.navy,
            }}
          >
            <PlayCircleOutlineOutlinedIcon sx={{ fontSize: 20 }} />
          </ListItemIcon>

          <ListItemText
            primary="App tour"
            secondary="A guided walk through every page"
            slotProps={{
              primary: { sx: primary },
              secondary: { sx: secondary },
            }}
          />
        </MenuItem>

        {/* How it works */}
        <MenuItem onClick={handleGuide} sx={itemSx}>
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: D.navy,
            }}
          >
            <HelpOutlineOutlinedIcon sx={{ fontSize: 20 }} />
          </ListItemIcon>

          <ListItemText
            primary="How it works"
            secondary="Read the guide"
            slotProps={{
              primary: { sx: primary },
              secondary: { sx: secondary },
            }}
          />
        </MenuItem>

        {/* Log out — always visible */}
        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={logoutItemSx}
        >
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: '#B3261E',
            }}
          >
            <LogoutOutlinedIcon sx={{ fontSize: 20 }} />
          </ListItemIcon>

          <ListItemText
            primary="Log out"
            secondary="Sign out of your account"
            slotProps={{
              primary: {
                sx: {
                  ...primary,
                  color: '#B3261E',
                },
              },
              secondary: {
                sx: secondary,
              },
            }}
          />
        </MenuItem>
      </Menu>
    </>
  )
}