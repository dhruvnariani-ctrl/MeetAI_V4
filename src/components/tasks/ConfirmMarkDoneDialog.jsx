
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'

import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'

import { COLORS } from './taskConstants'

export default function ConfirmMarkDoneDialog({
  open,
  taskTitle = '',
  onCancel,
  onConfirm,
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      fullWidth
      maxWidth="xs"
      aria-labelledby="confirm-mark-done-title"
      PaperProps={{
        sx: {
          border: `1px solid ${COLORS.border}`,
          borderRadius: '12px',
          boxShadow: '0 16px 48px rgba(18, 58, 89, 0.16)',
          m: 2,
        },
      }}
    >
      <DialogTitle
        id="confirm-mark-done-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 2.5,
          pt: 2.5,
          pb: 1,
          color: COLORS.navy,
          fontSize: '0.95rem',
          fontWeight: 750,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '9px',
            bgcolor: '#F0F7F1',
            color: COLORS.green,
          }}
        >
          <CheckCircleOutlineRoundedIcon />
        </Box>

        Mark action item as done?
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, pt: 1, pb: 2 }}>
        <Typography
          sx={{
            color: COLORS.text,
            fontSize: '0.8rem',
            lineHeight: 1.65,
          }}
        >
          Are you sure you have completed this action item?
        </Typography>

        {taskTitle && (
          <Box
            sx={{
              mt: 1.5,
              p: 1.25,
              bgcolor: '#F7F9FB',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '8px',
            }}
          >
            <Typography
              sx={{
                color: COLORS.navy,
                fontSize: '0.8rem',
                lineHeight: 1.55,
                fontWeight: 700,
                overflowWrap: 'anywhere',
              }}
            >
              {taskTitle}
            </Typography>
          </Box>
        )}

        <Typography
          sx={{
            mt: 1.25,
            color: COLORS.muted,
            fontSize: '0.72rem',
            lineHeight: 1.55,
          }}
        >
          The task status will be updated across the app.
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          px: 2.5,
          pb: 2.5,
          pt: 0,
          gap: 1,
        }}
      >
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            borderRadius: '8px',
            borderColor: COLORS.border,
            color: COLORS.text,
            textTransform: 'none',
            fontSize: '0.78rem',
            fontWeight: 700,
            px: 1.75,
            '&:hover': {
              borderColor: COLORS.navy,
              bgcolor: '#F7F9FB',
            },
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={onConfirm}
          variant="contained"
          startIcon={<CheckCircleOutlineRoundedIcon />}
          sx={{
            borderRadius: '8px',
            bgcolor: COLORS.green,
            color: '#FFFFFF',
            textTransform: 'none',
            fontSize: '0.78rem',
            fontWeight: 700,
            px: 1.75,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#126C4C',
              boxShadow: 'none',
            },
          }}
        >
          Mark as done
        </Button>
      </DialogActions>
    </Dialog>
  )
}
