import { useEffect, useId, useRef, useState } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import OutlinedInput from '@mui/material/OutlinedInput'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { visuallyHidden } from '@mui/utils'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CloseIcon from '@mui/icons-material/Close'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'

import { D, serif } from '../dashboard/dashTheme'
import { SUGGESTIONS } from './companionEngine'

const focusRing = { outline: `2px solid ${D.navy}`, outlineOffset: 2 }

function BotAvatar({ size = 28, imageSrc }) {
  return imageSrc ? (
    <Avatar src={imageSrc} alt="" sx={{ width: size, height: size, bgcolor: '#fff', border: `1px solid ${D.line}` }} />
  ) : (
    <Box
      aria-hidden="true"
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        bgcolor: '#fff',
        color: D.navy,
        border: `1px solid ${D.line}`,
        '& svg': { fontSize: size * 0.62 },
      }}
    >
      <SmartToyOutlinedIcon />
    </Box>
  )
}

function Bubble({ message, imageSrc, onAction }) {
  const bot = message.role === 'bot'

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, justifyContent: bot ? 'flex-start' : 'flex-end' }}>
      {bot && <BotAvatar imageSrc={imageSrc} />}

      <Box sx={{ maxWidth: '82%', minWidth: 0 }}>
        <Box
          sx={{
            px: 1.5,
            py: 1,
            borderRadius: bot ? '8px 8px 8px 2px' : '8px 8px 2px 8px',
            bgcolor: bot ? '#fff' : D.navy,
            color: bot ? D.navy : '#fff',
            border: bot ? `1px solid ${D.line}` : 0,
            fontSize: '.8125rem',
            lineHeight: 1.55,
            whiteSpace: 'pre-line',
            overflowWrap: 'anywhere',
          }}
        >
          <span style={visuallyHidden}>{bot ? 'Companion: ' : 'You: '}</span>
          {message.text}
        </Box>

        {bot && message.actions?.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.75 }}>
            {message.actions.map((action) => (
              <Button
                key={action.label}
                size="small"
                variant="outlined"
                endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
                onClick={() => onAction(action)}
                sx={{
                  textTransform: 'none',
                  fontSize: '.75rem',
                  fontWeight: 500,
                  py: 0.5,
                  borderRadius: '6px',
                  color: D.navy,
                  borderColor: D.line,
                  bgcolor: '#fff',
                  '&:hover': { borderColor: D.navy, bgcolor: '#F5F8FD' },
                  '&:focus-visible': focusRing,
                }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}

function Typing({ imageSrc }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
      <BotAvatar imageSrc={imageSrc} />
      <Box
        role="status"
        sx={{
          display: 'flex',
          gap: 0.6,
          px: 1.5,
          py: 1.35,
          borderRadius: '8px 8px 8px 2px',
          bgcolor: '#fff',
          border: `1px solid ${D.line}`,
          '@keyframes companionBlink': { '0%, 80%, 100%': { opacity: 0.25 }, '40%': { opacity: 1 } },
        }}
      >
        <span style={visuallyHidden}>Companion is typing</span>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            aria-hidden="true"
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: D.muted,
              animation: 'companionBlink 1s infinite',
              animationDelay: `${i * 0.15}s`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

export default function CompanionDialog({ open, onClose, messages, busy, onSend, onAction, onReset, imageSrc, isAtBottom = false }) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const titleId = useId()
  const listRef = useRef(null)
  const [text, setText] = useState('')

  /* Keep the newest message in view. */
  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, busy, open])

  const send = (value) => {
    const v = value.trim()
    if (!v || busy) return
    setText('')
    onSend(v)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      aria-labelledby={titleId}
      sx={{
        '& .MuiBackdrop-root': { bgcolor: 'rgba(20, 39, 94, .18)' },
        '& .MuiDialog-container': {
          alignItems: isAtBottom ? 'flex-start' : 'flex-end',
          justifyContent: 'flex-end',
        },
        '& .MuiDialog-paper': {
          m: 0,
          mr: fullScreen ? 0 : { sm: '27px' },
          mt: isAtBottom ? { xs: 0, sm: '104px' } : 0,
          mb: isAtBottom ? 0 : { sm: '104px' },
          width: fullScreen ? '100%' : 400,
          maxWidth: '100%',
          height: { xs: '100%', sm: 580 },
          maxHeight: { xs: '100%', sm: 'calc(100% - 130px)' },
          borderRadius: fullScreen ? 0 : '6px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2, py: 1.5, minHeight: 72, boxSizing: 'border-box', bgcolor: D.band }}>
        <BotAvatar size={38} imageSrc={imageSrc} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography id={titleId} component="h2" sx={{ fontFamily: serif, fontWeight: 400, fontSize: '1.5rem', lineHeight: 1.15, color: D.navy }}>
            MeetAI Companion
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
            <Box aria-hidden="true" sx={{ width: 7, height: 7, flexShrink: 0, borderRadius: '50%', bgcolor: D.green }} />
            <Typography sx={{ fontSize: '.75rem', lineHeight: 1.4, color: D.text }}>Online · answers from your meetings</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexShrink: 0 }}>
          <IconButton size="small" aria-label="Start a new chat" onClick={onReset} sx={{ color: D.navy, '&:focus-visible': focusRing }}>
            <RestartAltIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label="Close" onClick={onClose} sx={{ color: D.navy, '&:focus-visible': focusRing }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Messages */}
      <Box
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2, display: 'grid', alignContent: 'start', gap: 1.5, bgcolor: D.page }}
      >
        {messages.map((message) => (
          <Bubble key={message.id} message={message} imageSrc={imageSrc} onAction={onAction} />
        ))}
        {busy && <Typing imageSrc={imageSrc} />}
      </Box>

      {/* Suggestions */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 0.75,
          px: 1.5,
          py: 1,
          borderTop: `1px solid ${D.line}`,
          bgcolor: '#fff',
        }}
      >
        {SUGGESTIONS.map((label) => (
          <Button
            key={label}
            disabled={busy}
            onClick={() => send(label)}
            sx={{
              minWidth: 0,
              minHeight: 30,
              px: 0.75,
              borderRadius: '15px',
              border: `1px solid ${D.line}`,
              bgcolor: '#fff',
              color: D.navy,
              fontSize: '.75rem',
              fontWeight: 500,
              textTransform: 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
              '&:hover': { bgcolor: '#E4EBF8', borderColor: D.navy },
              '&:focus-visible': focusRing,
            }}
          >
            {label}
          </Button>
        ))}
      </Box>

      {/* Input */}
      <Box
        component="form"
        onSubmit={(e) => { e.preventDefault(); send(text) }}
        sx={{ display: 'flex', gap: 1, px: 1.5, pb: 1.5, pt: 0.5, bgcolor: '#fff' }}
      >
        <OutlinedInput
          autoFocus
          fullWidth
          size="small"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask about meetings, tasks, recordings…"
          slotProps={{ input: { 'aria-label': 'Message the Companion', maxLength: 300 } }}
          sx={{
            borderRadius: '6px',
            fontSize: '.8125rem',
            bgcolor: '#fff',
            color: D.navy,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: D.line },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: D.navy },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: D.navy, borderWidth: 2 },
            '& input': { py: '9px' },
            '& input::placeholder': { opacity: 1, color: D.muted },
          }}
        />

        <IconButton
          type="submit"
          aria-label="Send message"
          disabled={!text.trim() || busy}
          sx={{
            width: 40,
            height: 40,
            borderRadius: '6px',
            color: '#fff',
            bgcolor: D.navy,
            '&:hover': { bgcolor: '#0D1C47' },
            '&:focus-visible': focusRing,
            '&.Mui-disabled': { bgcolor: D.line, color: D.muted },
          }}
        >
          <SendRoundedIcon sx={{ fontSize: 19 }} />
        </IconButton>
      </Box>
    </Dialog>
  )
}