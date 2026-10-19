
import Box from '@mui/material/Box'
import { D } from '../dashboard/dashTheme'

const OVERLAY = 'rgba(20, 39, 94, .5)'
const PAD = 7

export default function TourOverlay({ targetRect, cardRect = null }) {
  if (!targetRect) return null

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  const target = {
    left: Math.max(0, targetRect.left - PAD),
    top: Math.max(0, targetRect.top - PAD),
    right: Math.min(viewportWidth, targetRect.right + PAD),
    bottom: Math.min(viewportHeight, targetRect.bottom + PAD),
  }

  const card = cardRect
    ? {
        left: Math.max(0, cardRect.left),
        top: Math.max(0, cardRect.top),
        right: Math.min(viewportWidth, cardRect.right),
        bottom: Math.min(viewportHeight, cardRect.bottom),
      }
    : null

  const regions = []

  // Add a rectangle to the dimmed areas.
  const addRegion = (left, top, right, bottom) => {
    const width = right - left
    const height = bottom - top

    if (width > 0 && height > 0) {
      regions.push({ left, top, width, height })
    }
  }

  // Split the viewport into non-overlapping vertical and horizontal bands.
  const holes = [
    target,
    ...(card ? [card] : []),
  ].sort((a, b) => a.top - b.top)

  // Create a grid from all rectangle edges. Cells inside either
  // the target or the card remain clear; all other cells are dimmed.
  const xEdges = new Set([0, viewportWidth])
  const yEdges = new Set([0, viewportHeight])

  holes.forEach((hole) => {
    xEdges.add(Math.max(0, Math.min(viewportWidth, hole.left)))
    xEdges.add(Math.max(0, Math.min(viewportWidth, hole.right)))
    yEdges.add(Math.max(0, Math.min(viewportHeight, hole.top)))
    yEdges.add(Math.max(0, Math.min(viewportHeight, hole.bottom)))
  })

  const xs = [...xEdges].sort((a, b) => a - b)
  const ys = [...yEdges].sort((a, b) => a - b)

  for (let row = 0; row < ys.length - 1; row += 1) {
    for (let col = 0; col < xs.length - 1; col += 1) {
      const left = xs[col]
      const right = xs[col + 1]
      const top = ys[row]
      const bottom = ys[row + 1]

      const centerX = (left + right) / 2
      const centerY = (top + bottom) / 2

      const insideHole = holes.some(
        (hole) =>
          centerX >= hole.left &&
          centerX <= hole.right &&
          centerY >= hole.top &&
          centerY <= hole.bottom,
      )

      if (!insideHole) {
        addRegion(left, top, right, bottom)
      }
    }
  }

  return (
    <>
      <Box
        aria-hidden="true"
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1400,
          pointerEvents: 'none',
        }}
      >
        {regions.map((region, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              left: region.left,
              top: region.top,
              width: region.width,
              height: region.height,
              bgcolor: OVERLAY,
            }}
          />
        ))}
      </Box>

      <Box
        aria-hidden="true"
        sx={{
          position: 'fixed',
          zIndex: 1401,
          top: target.top,
          left: target.left,
          width: Math.max(0, target.right - target.left),
          height: Math.max(0, target.bottom - target.top),
          boxSizing: 'border-box',
          borderRadius: '6px',
          border: '2px solid #fff',
          boxShadow: `0 0 0 2px ${D.navy}`,
          transition:
            'top 180ms ease, left 180ms ease, width 180ms ease, height 180ms ease',
          pointerEvents: 'none',
        }}
      />
    </>
  )
}
