import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Fab from '@mui/material/Fab'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'

import { D } from '../dashboard/dashTheme'

export default function CompanionFab({
  onClick,
  imageSrc,
  open = false,
  isAtBottom = false,
  placement = 'floating',
}) {
  const inHeader = placement === 'header'

  return (
    <Box
      sx={{
        position: inHeader ? 'static' : 'fixed',
        right: { xs: 16, md: 27 },
        top: 'auto',
        bottom: inHeader ? 'auto' : isAtBottom ? { xs: 80, md: 90 } : { xs: 16, md: 27 },
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: inHeader ? 'auto' : (theme) => theme.zIndex.modal + 1,
        transition: inHeader ? 'none' : 'top 200ms ease, bottom 200ms ease',
      }}
    >
      {/* Label pill, floating button only */}
      <Typography
        aria-hidden="true"
        sx={{
          display: inHeader ? 'none' : { xs: 'none', sm: 'block' },
          px: 2,
          height: 34,
          lineHeight: '32px',
          borderRadius: '6px',
          border: `1px solid ${D.line}`,
          bgcolor: '#fff',
          color: D.navy,
          fontSize: '.8125rem',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 14px rgba(20, 39, 94, .10)',
        }}
      >
        Ask your Companion
      </Typography>

      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <Tooltip title="Ask your Companion">
          <Fab
            aria-label="Ask your Companion"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={onClick}
            sx={{
              width: inHeader ? 40 : 56,
              height: inHeader ? 40 : 56,
              minHeight: 0,
              color: D.navy,
              bgcolor: '#fff',
              border: `${inHeader ? 1 : 2}px solid ${inHeader ? D.line : D.navy}`,
              boxShadow: inHeader ? 'none' : '0 6px 20px rgba(20, 39, 94, .22)',
              '&:hover': { bgcolor: '#F5F8FD' },
              '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: 2 },
            }}
          >
            {imageSrc ? (
              <Avatar src={imageSrc} alt="" sx={{ width: '100%', height: '100%', bgcolor: 'transparent' }} />
            ) : (
              <SmartToyOutlinedIcon sx={{ fontSize: 26 }} />
            )}
          </Fab>
        </Tooltip>

        {/* Online dot */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: inHeader ? 2 : 3,
            right: inHeader ? 2 : 3,
            width: inHeader ? 11 : 13,
            height: inHeader ? 11 : 13,
            borderRadius: '50%',
            bgcolor: D.green,
            border: '2px solid #fff',
            pointerEvents: 'none',
          }}
        />
      </Box>
    </Box>
  )
}