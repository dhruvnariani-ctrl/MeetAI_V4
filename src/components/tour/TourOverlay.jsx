import Box from '@mui/material/Box'

import { D } from '../dashboard/dashTheme'

const OVERLAY = 'rgba(20, 39, 94, .5)'
const PAD = 7

/*
 * Dims the whole screen except the target: four dark panels around it,
 * plus a white outline with a navy ring on the target itself.
 */
export default function TourOverlay({ targetRect }) {
  const topH = Math.max(targetRect.top - PAD, 0)
  const bottomTop = Math.min(targetRect.bottom + PAD, window.innerHeight)
  const leftW = Math.max(targetRect.left - PAD, 0)
  const rightLeft = Math.min(targetRect.right + PAD, window.innerWidth)
  const midH = Math.max(bottomTop - topH, 0)

  return (
    <>
      <Box aria-hidden="true" sx={{ position: 'fixed', inset: 0, zIndex: 1400, pointerEvents: 'none' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: topH, bgcolor: OVERLAY }} />
        <Box sx={{ position: 'absolute', top: bottomTop, left: 0, right: 0, bottom: 0, bgcolor: OVERLAY }} />
        <Box sx={{ position: 'absolute', top: topH, left: 0, width: leftW, height: midH, bgcolor: OVERLAY }} />
        <Box sx={{ position: 'absolute', top: topH, left: rightLeft, right: 0, height: midH, bgcolor: OVERLAY }} />
      </Box>

      <Box
        aria-hidden="true"
        sx={{
          position: 'fixed',
          zIndex: 1401,
          top: targetRect.top - PAD,
          left: targetRect.left - PAD,
          width: targetRect.width + PAD * 2,
          height: targetRect.height + PAD * 2,
          borderRadius: '6px',
          border: '2px solid #fff',
          boxShadow: `0 0 0 2px ${D.navy}`,
          transition: 'top 180ms ease, left 180ms ease, width 180ms ease, height 180ms ease',
          pointerEvents: 'none',
        }}
      />
    </>
  )
}