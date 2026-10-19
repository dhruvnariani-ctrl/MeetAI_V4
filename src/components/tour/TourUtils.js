
export function clamp(value, min, max) {
  const safeMin = Number.isFinite(min) ? min : 0
  const safeMax = Number.isFinite(max) ? Math.max(safeMin, max) : safeMin

  return Math.min(Math.max(value, safeMin), safeMax)
}

export function findTarget(selector) {
  if (!selector) return null

  try {
    return document.querySelector(selector)
  } catch {
    return null
  }
}

export function rectOf(element) {
  if (!element) return null

  const rect = element.getBoundingClientRect()

  return {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  }
}

/*
 * Position the tour card beside its target whenever possible.
 * Keep the position within the viewport, including on mobile.
 */
export function positionCard(rect, width, height) {
  const gap = 18
  const pad = 16

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  const cardWidth = Math.min(width, Math.max(1, viewportWidth - pad * 2))
  const cardHeight = Math.min(height, Math.max(1, viewportHeight - pad * 2))

  if (!rect) {
    return {
      left: clamp(
        (viewportWidth - cardWidth) / 2,
        pad,
        viewportWidth - cardWidth - pad,
      ),
      top: clamp(
        (viewportHeight - cardHeight) / 2,
        pad,
        viewportHeight - cardHeight - pad,
      ),
    }
  }

  const candidates = [
    {
      left: rect.right + gap,
      top: clamp(
        rect.top,
        pad,
        viewportHeight - cardHeight - pad,
      ),
    },
    {
      left: rect.left - gap - cardWidth,
      top: clamp(
        rect.top,
        pad,
        viewportHeight - cardHeight - pad,
      ),
    },
    {
      left: clamp(
        rect.left,
        pad,
        viewportWidth - cardWidth - pad,
      ),
      top: rect.bottom + gap,
    },
    {
      left: clamp(
        rect.left,
        pad,
        viewportWidth - cardWidth - pad,
      ),
      top: rect.top - gap - cardHeight,
    },
  ]

  const overlapsTarget = (candidate) =>
    !(
      candidate.left + cardWidth <= rect.left - gap ||
      candidate.left >= rect.right + gap ||
      candidate.top + cardHeight <= rect.top - gap ||
      candidate.top >= rect.bottom + gap
    )

  const fitsViewport = (candidate) =>
    candidate.left >= pad &&
    candidate.left + cardWidth <= viewportWidth - pad &&
    candidate.top >= pad &&
    candidate.top + cardHeight <= viewportHeight - pad

  const safeCandidate = candidates.find(
    (candidate) =>
      fitsViewport(candidate) && !overlapsTarget(candidate),
  )

  if (safeCandidate) return safeCandidate

  const fittingCandidate = candidates.find(fitsViewport)

  if (fittingCandidate) return fittingCandidate

  return {
    left: clamp(
      rect.left,
      pad,
      viewportWidth - cardWidth - pad,
    ),
    top: clamp(
      rect.bottom + gap,
      pad,
      viewportHeight - cardHeight - pad,
    ),
  }
}