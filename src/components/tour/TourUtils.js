export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max))
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

  const r = element.getBoundingClientRect()

  return {
    top: r.top,
    left: r.left,
    right: r.right,
    bottom: r.bottom,
    width: r.width,
    height: r.height,
  }
}

/*
 * Picks where the tour card goes: right, left, below or above the target,
 * preferring a spot that fits the viewport and does not cover the target.
 */
export function positionCard(rect, width, height) {
  const gap = 18
  const pad = 16

  const vw = window.innerWidth
  const vh = window.innerHeight

  if (!rect) {
    return {
      left: clamp((vw - width) / 2, pad, vw - width - pad),
      top: clamp((vh - height) / 2, pad, vh - height - pad),
    }
  }

  const candidates = [
    // Right
    { left: rect.right + gap, top: clamp(rect.top, pad, vh - height - pad) },
    // Left
    { left: rect.left - gap - width, top: clamp(rect.top, pad, vh - height - pad) },
    // Below
    { left: clamp(rect.left, pad, vw - width - pad), top: rect.bottom + gap },
    // Above
    { left: clamp(rect.left, pad, vw - width - pad), top: rect.top - gap - height },
  ]

  const overlapsTarget = (c) =>
    !(
      c.left + width <= rect.left - gap ||
      c.left >= rect.right + gap ||
      c.top + height <= rect.top - gap ||
      c.top >= rect.bottom + gap
    )

  const fitsViewport = (c) =>
    c.left >= pad &&
    c.left + width <= vw - pad &&
    c.top >= pad &&
    c.top + height <= vh - pad

  const safe = candidates.find((c) => fitsViewport(c) && !overlapsTarget(c))
  if (safe) return safe

  const fits = candidates.find(fitsViewport)
  if (fits) return fits

  return {
    left: clamp(rect.right + gap, pad, vw - width - pad),
    top: clamp(rect.top, pad, vh - height - pad),
  }
}