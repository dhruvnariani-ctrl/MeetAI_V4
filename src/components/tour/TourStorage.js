export const TOUR_STORAGE_KEY = 'meetai-active-tour'

/* Tour data stores icons as STRINGS (components can't go into sessionStorage). */
const toSafeSteps = (steps) =>
  steps.map((step) => ({
    ...step,
    icon: typeof step.icon === 'string' ? step.icon : 'Lightbulb',
  }))

export function startAppTour(steps) {
  const safeSteps = Array.isArray(steps) ? toSafeSteps(steps) : []
  if (!safeSteps.length) return

  sessionStorage.setItem(
    TOUR_STORAGE_KEY,
    JSON.stringify({ steps: safeSteps, index: 0, phase: 'intro' }),
  )

  window.dispatchEvent(new Event('meetai-tour-start'))
}

export function stopAppTour() {
  sessionStorage.removeItem(TOUR_STORAGE_KEY)
  window.dispatchEvent(new Event('meetai-tour-stop'))
}

export function readTour() {
  try {
    const raw = sessionStorage.getItem(TOUR_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)

    if (!parsed || !Array.isArray(parsed.steps) || !parsed.steps.length) {
      return null
    }

    const steps = toSafeSteps(parsed.steps)
    const index = Number.isInteger(parsed.index) ? parsed.index : 0

    return {
      steps,
      index: Math.min(Math.max(index, 0), steps.length - 1),
      phase: parsed.phase === 'intro' ? 'intro' : 'tour',
    }
  } catch {
    return null
  }
}

export function saveTour(tour) {
  sessionStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(tour))
}