
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import TourIntro from './TourIntro'
import TourCard from './TourCard'
import TourOverlay from './TourOverlay'

import { readTour, saveTour, stopAppTour } from './TourStorage'
import { findTarget, positionCard, rectOf } from './TourUtils'

const POLL_MS = 100
const POLL_TRIES = 60
const CARD_WIDTH = 360
const CARD_HEIGHT = 330

const MOBILE_BREAKPOINT = '(max-width: 1199.95px)'
const CARD_GAP = 16
const VIEWPORT_PADDING = 12

function isSmallScreen() {
  return window.matchMedia(MOBILE_BREAKPOINT).matches
}

function isVisible(element) {
  if (!element || !element.isConnected) return false

  const style = window.getComputedStyle(element)
  const rect = element.getBoundingClientRect()

  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    Number(style.opacity) !== 0 &&
    rect.width > 0 &&
    rect.height > 0 &&
    element.getClientRects().length > 0
  )
}

function isNavigationSelector(selector) {
  return (
    typeof selector === 'string' &&
    selector.includes('sidebar-navigation')
  )
}

/*
 * Finds the correct target.
 *
 * On smaller screens, desktop navigation is never selected accidentally.
 * Navigation inside the MUI drawer is used only while the drawer is open.
 */
function findStepTarget(selector) {
  if (!selector) return null

  let matches

  try {
    matches = Array.from(document.querySelectorAll(selector))
  } catch {
    return findTarget(selector)
  }

  if (isNavigationSelector(selector)) {
    if (isSmallScreen()) {
      const drawerOpen = Boolean(
        document.querySelector(
          'button[aria-label="Close navigation menu"][aria-expanded="true"]',
        ),
      )

      if (!drawerOpen) return null

      return (
        matches.find((element) => {
          const drawer = element.closest('.MuiDrawer-paper')

          return (
            Boolean(drawer) &&
            isVisible(drawer) &&
            isVisible(element)
          )
        }) ?? null
      )
    }

    const desktopTarget = matches.find((element) => {
      return (
        !element.closest('.MuiDrawer-paper') &&
        isVisible(element)
      )
    })

    if (desktopTarget) return desktopTarget
  }

  return matches.find(isVisible) ?? null
}

/*
 * Opens the mobile navigation drawer when a tour step targets navigation.
 */
function ensureNavigationDrawerOpen(
  selector,
  index,
  drawerRequestedFor,
) {
  if (!isNavigationSelector(selector)) return true
  if (!isSmallScreen()) return true

  const closeButton = document.querySelector(
    'button[aria-label="Close navigation menu"][aria-expanded="true"]',
  )

  if (closeButton && isVisible(closeButton)) {
    return Boolean(findStepTarget(selector))
  }

  const openButton = Array.from(
    document.querySelectorAll(
      'button[aria-label="Open navigation menu"][aria-expanded="false"]',
    ),
  ).find(isVisible)

  if (openButton && drawerRequestedFor.current !== index) {
    drawerRequestedFor.current = index
    openButton.click()
  }

  return false
}

/*
 * Determines which mobile card position has the most room.
 *
 * Prefer the bottom when it does not overlap the highlighted target.
 * Otherwise use the top when it fits. If neither fits, use the side with
 * more space and let the overlay keep the card itself undimmed.
 */
function getMobilePlacement(targetRect, cardHeight = CARD_HEIGHT) {
  const viewportHeight = window.innerHeight

  const topSpace = Math.max(
    0,
    targetRect.top - VIEWPORT_PADDING - CARD_GAP,
  )

  const bottomSpace = Math.max(
    0,
    viewportHeight -
      targetRect.bottom -
      VIEWPORT_PADDING -
      CARD_GAP,
  )

  if (bottomSpace >= Math.min(cardHeight, viewportHeight * 0.35)) {
    return 'bottom'
  }

  if (topSpace > bottomSpace) {
    return 'top'
  }

  return 'bottom'
}

/*
 * Runs the guided tour.
 * Start using startAppTour(steps) from TourStorage.
 * Mount this component once inside the router.
 */
export default function TourRunner() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [tour, setTour] = useState(readTour)
  const [rect, setRect] = useState(null)
  const [cardRect, setCardRect] = useState(null)
  const [phonePlacement, setPhonePlacement] = useState('bottom')

  const cardRef = useRef(null)
  const navigatedFor = useRef(-1)
  const clickedFor = useRef(-1)
  const drawerRequestedFor = useRef(-1)

  const index = tour?.index ?? 0
  const step = tour?.phase === 'tour' ? tour.steps[index] : null

  // Respond to tour start/stop events.
  useEffect(() => {
    const onStart = () => {
      setRect(null)
      setCardRect(null)
      setTour(readTour())
    }

    const onStop = () => {
      setRect(null)
      setCardRect(null)
      setTour(null)
    }

    window.addEventListener('meetai-tour-start', onStart)
    window.addEventListener('meetai-tour-stop', onStop)

    return () => {
      window.removeEventListener('meetai-tour-start', onStart)
      window.removeEventListener('meetai-tour-stop', onStop)
    }
  }, [])

  const stop = useCallback(() => {
    setRect(null)
    setCardRect(null)
    stopAppTour()
  }, [])

  const goTo = useCallback(
    (next) => {
      if (!tour || next < 0) return

      if (next >= tour.steps.length) {
        stop()
        return
      }

      const updated = {
        ...tour,
        index: next,
        phase: 'tour',
      }

      saveTour(updated)

      setRect(null)
      setCardRect(null)
      setTour(updated)
    },
    [tour, stop],
  )

  // Always use the latest goTo function from the polling interval.
  const goRef = useRef(goTo)

  useEffect(() => {
    goRef.current = goTo
  }, [goTo])

  /*
   * Locate each step's target.
   * Allow navigation and page transitions to finish before highlighting.
   */
  useEffect(() => {
    if (!step) {
      setRect(null)
      setCardRect(null)
      return undefined
    }

    let cancelled = false
    let tries = 0
    let timer
    let detach = () => {}

    setRect(null)
    setCardRect(null)

    if (
      pathname !== step.path &&
      navigatedFor.current !== index
    ) {
      navigatedFor.current = index
      navigate(step.path)
    }

    const updateRect = () => {
      if (cancelled) return

      const target = findStepTarget(step.target)

      if (target) {
        const nextRect = rectOf(target)

        setRect(nextRect)

        if (isSmallScreen()) {
          setPhonePlacement(getMobilePlacement(nextRect))
        }
      }
    }

    timer = window.setInterval(() => {
      if (cancelled) return

      tries += 1

      // Some steps need a control clicked before their target appears.
      if (step.click && clickedFor.current !== index) {
        const clickTarget = findStepTarget(step.click)

        if (clickTarget) {
          clickedFor.current = index
          clickTarget.click()
          return
        }

        if (tries >= POLL_TRIES) {
          window.clearInterval(timer)
          goRef.current(index + 1)
        }

        return
      }

      // Open mobile navigation before locating a navigation target.
      if (isNavigationSelector(step.target)) {
        const drawerReady = ensureNavigationDrawerOpen(
          step.target,
          index,
          drawerRequestedFor,
        )

        if (!drawerReady) {
          if (tries >= POLL_TRIES) {
            window.clearInterval(timer)
            goRef.current(index + 1)
          }

          return
        }
      }

      const target = findStepTarget(step.target)

      if (!target) {
        if (tries >= POLL_TRIES) {
          window.clearInterval(timer)
          goRef.current(index + 1)
        }

        return
      }

      window.clearInterval(timer)

      target.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'auto',
      })

      window.requestAnimationFrame(() => {
        if (cancelled) return
        updateRect()
      })

      window.addEventListener('resize', updateRect)
      window.addEventListener('scroll', updateRect, true)

      detach = () => {
        window.removeEventListener('resize', updateRect)
        window.removeEventListener('scroll', updateRect, true)
      }
    }, POLL_MS)

    return () => {
      cancelled = true
      window.clearInterval(timer)
      detach()
    }
  }, [step, index, pathname, navigate])

  /*
   * Keep the card's real bounds in sync with its rendered position.
   * TourOverlay uses these bounds to avoid dimming the card area.
   */
  useEffect(() => {
    if (!rect || !cardRef.current) {
      setCardRect(null)
      return undefined
    }

    let frame

    const updateCardRect = () => {
      window.cancelAnimationFrame(frame)

      frame = window.requestAnimationFrame(() => {
        if (!cardRef.current) return

        const bounds = cardRef.current.getBoundingClientRect()

        setCardRect((previous) => {
          const next = {
            left: bounds.left,
            top: bounds.top,
            right: bounds.right,
            bottom: bounds.bottom,
          }

          if (
            previous &&
            Math.abs(previous.left - next.left) < 1 &&
            Math.abs(previous.top - next.top) < 1 &&
            Math.abs(previous.right - next.right) < 1 &&
            Math.abs(previous.bottom - next.bottom) < 1
          ) {
            return previous
          }

          return next
        })
      })
    }

    updateCardRect()

    window.addEventListener('resize', updateCardRect)
    window.addEventListener('scroll', updateCardRect, true)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateCardRect)
      window.removeEventListener('scroll', updateCardRect, true)
    }
  }, [rect, index, phonePlacement])

  // Escape closes the tour.
  useEffect(() => {
    if (!tour) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') stop()
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [tour, stop])

  // Focus the card once its target is ready.
  useEffect(() => {
    if (rect) {
      cardRef.current?.focus({ preventScroll: true })
    }
  }, [rect, index])

  if (!tour) return null

  if (tour.phase === 'intro') {
    return (
      <TourIntro
        onStart={() => goTo(0)}
        onSkip={stop}
      />
    )
  }

  if (!step || !rect) return null

  return (
    <>
      <TourOverlay
        targetRect={rect}
        cardRect={cardRect}
      />

      <TourCard
        ref={cardRef}
        step={step}
        index={index}
        total={tour.steps.length}
        position={positionCard(
          rect,
          CARD_WIDTH,
          CARD_HEIGHT,
        )}
        phonePlacement={phonePlacement}
        onNext={() => goTo(index + 1)}
        onBack={() => goTo(index - 1)}
        onClose={stop}
      />
    </>
  )
}
