import { Link as RouterLink, useLocation } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined'
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'

import { formatTime } from '../utils/time'
import Logo from './Logo'

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    to: '/',
    Icon: HomeRoundedIcon,
  },
  {
    id: 'calendar',
    label: 'Calendar',
    to: '/calendar',
    Icon: CalendarTodayOutlinedIcon,
  },
  {
    id: 'recorded',
    label: 'Recorded Meetings',
    to: '/recorded',
    Icon: DescriptionOutlinedIcon,
  },
  {
    id: 'tasks',
    label: 'My Tasks',
    to: '/tasks',
    Icon: AssignmentTurnedInOutlinedIcon,
  },
]

const EXPANDED_W = 256
const COLLAPSED_W = 76

/* On short screens (laptops, zoomed browsers) tighten spacing so nothing needs to scroll */
const SHORT = '@media (max-height: 760px)'

const SIDEBAR_BG =
  'linear-gradient(180deg, #F0F6FE 0%, #EAF3FC 55%, #F7FAFD 100%)'

/* MeetAI brand: glossy ribbon "M" (/public/images/meetai-logo-256.png) + wordmark */
function MeetAIBrand({ expanded }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: expanded ? 'flex-start' : 'center',
        gap: 1,
        height: 48,
        px: expanded ? 1.25 : 0,
        mb: 1.5,
        color: '#123A59',
        [SHORT]: { height: 40, mb: 0.5 },
      }}
    >
      <Box
        component="img"
        src={`${import.meta.env.BASE_URL}/images/meetai-logo-256.png`}
        alt=""
        aria-hidden="true"
        draggable={false}
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          [SHORT]: { width: 30, height: 30 },
          display: 'block',
          objectFit: 'contain',
        }}
      />

      {expanded && (
        <Box
          component="span"
          sx={{
            fontSize: '1.2rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          MeetAI
        </Box>
      )}
    </Box>
  )
}

function SidebarAction({
  Icon,
  label,
  expanded,
  onClick,
  component,
  to,
  tooltip,
  ...rest
}) {
  return (
    <Tooltip
      title={tooltip ?? (expanded ? '' : label)}
      placement="right"
      describeChild
    >
      <ButtonBase
        component={component}
        to={to}
        onClick={onClick}
        {...rest}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: expanded ? 'flex-start' : 'center',
          gap: '14px',
          width: expanded ? '100%' : 48,
          height: 40,
          [SHORT]: { height: 36 },
          mx: 'auto',
          px: expanded ? '14px' : 0,
          borderRadius: '8px',
          color: '#304858',
          fontSize: '0.8125rem',
          fontWeight: 500,
          textAlign: 'left',
          '&:hover': {
            bgcolor: 'rgba(9,103,178,0.08)',
          },
          '&:focus-visible': {
            outline: '2px solid #0967B2',
            outlineOffset: 2,
          },
        }}
      >
        <Icon sx={{ fontSize: 20, flexShrink: 0 }} />

        {expanded && (
          <Box
            component="span"
            sx={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {label}
          </Box>
        )}
      </ButtonBase>
    </Tooltip>
  )
}

function SidebarContent({
  expanded,
  onInstantJoin,
  onItemClick,
  showCollapse,
  onToggle,
  lastSynced,
  onSync,
}) {
  const { pathname } = useLocation()

  const isActive = (to) =>
    to === '/'
      ? pathname === '/'
      : pathname === to || pathname.startsWith(`${to}/`)

  const syncedText = lastSynced
    ? `Last updated ${formatTime(lastSynced)}`
    : 'Not synced yet'

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
        px: 1.5,
        pt: 2,
        pb: 1.25,
      }}
    >
      <MeetAIBrand expanded={expanded} />

      {/* Middle area: only scrolls on very short screens, scrollbar hidden */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden',
          px: 0.25,
          pt: 0.75,
          pb: 0.5,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
      <Box component="nav" aria-label="Primary navigation">
        <List
          data-tour="sidebar-navigation"
          disablePadding
          sx={{
            display: 'grid',
            gap: '6px',
            [SHORT]: { gap: '3px' },
          }}
        >
          {NAV_ITEMS.map(({ id, label, to, Icon }) => {
            const selected = isActive(to)

            return (
              <ListItem key={id} disablePadding>
                <Tooltip
                  title={expanded ? '' : label}
                  placement="right"
                >
                  <ListItemButton
                    component={RouterLink}
                    to={to}
                    selected={selected}
                    aria-current={selected ? 'page' : undefined}
                    onClick={onItemClick}
                    sx={{
                      minHeight: 44,
                      [SHORT]: { minHeight: 38 },
                      width: expanded ? '100%' : 48,
                      mx: 'auto',
                      px: expanded ? '14px' : 0,
                      justifyContent: expanded ? 'flex-start' : 'center',
                      borderRadius: '12px',
                      color: '#304858',
                      '&:hover': {
                        bgcolor: 'rgba(9,103,178,0.08)',
                      },
                      '&.Mui-selected, &.Mui-selected:hover': {
                        bgcolor: 'rgba(205,235,250,0.85)',
                        color: '#0967B2',
                        boxShadow: '0 2px 8px rgba(9,103,178,0.10)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: expanded ? '14px' : 0,
                        color: 'inherit',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon sx={{ fontSize: 20 }} />
                    </ListItemIcon>

                    {expanded && (
                      <ListItemText
                        primary={label}
                        sx={{
                          minWidth: 0,
                          m: 0,
                          '& .MuiTypography-root': {
                            fontSize: '0.8125rem',
                            fontWeight: selected ? 650 : 500,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            )
          })}
        </List>

        <Tooltip
          title={expanded ? '' : 'Start MeetAI'}
          placement="right"
        >
          <Button
            data-tour="Add MeetAI to a Meeting"
            variant="contained"
            disableElevation
            onClick={onInstantJoin}
            aria-label="Start MeetAI"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              width: expanded ? '100%' : 48,
              minWidth: 0,
              minHeight: 40,
              mx: 'auto',
              mt: 3,
              [SHORT]: { mt: 2, minHeight: 38 },
              px: expanded ? '14px' : 0,
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textTransform: 'none',
              whiteSpace: 'nowrap',
              background: 'linear-gradient(100deg, #0967B2, #438FF0)',
              boxShadow: '0 4px 12px rgba(9,103,178,0.22)',
              '&:hover': {
                background: 'linear-gradient(100deg, #075A9C, #327FE0)',
              },
            }}
          >
            <AddRoundedIcon sx={{ fontSize: 20, flexShrink: 0 }} />

            {expanded && <span>Add MeetAI to a Meeting</span>}
          </Button>
        </Tooltip>
      </Box>

      {/* Utility controls */}
      <Box
        data-tour="sidebar-controls"
        sx={{
          flexShrink: 0,
          display: 'grid',
          gap: '3px',
          pt: 2,
          mt: 'auto',
          [SHORT]: { pt: 1 },
        }}
      >
        <SidebarAction
          Icon={SyncOutlinedIcon}
          label="Refresh"
          expanded={expanded}
          onClick={onSync}
          tooltip={`Refresh — ${syncedText}`}
        />

        <SidebarAction
          Icon={HelpOutlineOutlinedIcon}
          label="How it works"
          expanded={expanded}
          component={RouterLink}
          to="/how-it-works"
          onClick={onItemClick}
        />

        {showCollapse && (
          <SidebarAction
            Icon={
              expanded
                ? KeyboardDoubleArrowLeftIcon
                : KeyboardDoubleArrowRightIcon
            }
            label={expanded ? 'Collapse' : 'Expand sidebar'}
            expanded={expanded}
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls="sidebar"
          />
        )}
      </Box>

      </Box>

      {/* Avaada brand footer: always anchored at the bottom */}
      <Box
        sx={{
          flexShrink: 0,
          mt: 1.5,
          pb: 0.5,
          [SHORT]: { mt: 0.5 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Logo compact={!expanded} />
      </Box>
    </Box>
  )
}

export default function Sidebar({
  open,
  onToggle,
  onInstantJoin,
  lastSynced,
  onSync,
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const sharedProps = {
    onInstantJoin,
    lastSynced,
    onSync,
  }

  if (isMobile) {
    return (
      <Drawer
        id="sidebar"
        data-tour="sidebar"
        variant="temporary"
        open={open}
        onClose={onToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: EXPANDED_W,
            height: '100dvh',
            maxHeight: '100dvh',
            boxSizing: 'border-box',
            background: SIDEBAR_BG,
            borderRight: '1px solid #DFE7EC',
            overflow: 'hidden',
          },
        }}
      >
        <SidebarContent
          expanded
          showCollapse={false}
          onItemClick={onToggle}
          onToggle={onToggle}
          {...sharedProps}
        />
      </Drawer>
    )
  }

  const width = open ? EXPANDED_W : COLLAPSED_W

  return (
    <Drawer
      id="sidebar"
      data-tour="sidebar"
      variant="permanent"
      sx={{
        width,
        height: '100dvh',
        flexShrink: 0,
        transition: theme.transitions.create('width', {
          duration: 200,
        }),
        '& .MuiDrawer-paper': {
          position: 'relative',
          width,
          height: '100dvh',
          maxHeight: '100dvh',
          boxSizing: 'border-box',
          flexShrink: 0,
          border: 0,
          borderRight: '1px solid #DFE7EC',
          background: SIDEBAR_BG,
          overflow: 'hidden',
          transition: theme.transitions.create('width', {
            duration: 200,
          }),
        },
      }}
    >
      <SidebarContent
        expanded={open}
        showCollapse
        onToggle={onToggle}
        {...sharedProps}
      />
    </Drawer>
  )
}