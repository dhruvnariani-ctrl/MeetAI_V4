import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import TourIntro from './TourIntro'
import TourCard from './TourCard'
import TourOverlay from './TourOverlay'

import { readTour, saveTour, stopAppTour } from './TourStorage'
import { clamp, findTarget, positionCard, rectOf } from './TourUtils'

const POLL_MS = 100
const POLL_TRIES = 60
const CARD_WIDTH = 360
const CARD_HEIGHT = 330

const DRAWER_SCREEN = '(max-width: 1199.95px)' // navigation lives in a drawer
const PHONE = '(max-width: 599.95px)' // the card is pinned to the top or bottom edge
const PHONE_CARD_SHARE = 0.4 // the phone card is never taller than this share of the screen
const CARD_GAP = 16
const VIEWPORT_PADDING = 12
const HIGHLIGHT_PAD = 12 // how far the highlight ring extends beyond its target
const TOP_ZONE_SHARE = 0.25 // a target starting in this top share of the screen gets the card below it
const RECLICK_TICKS = 5 // a click step is retried after this many polls if nothing changed

const isDrawerScreen = () => window.matchMedia(DRAWER_SCREEN).matches
const isPhone = () => window.matchMedia(PHONE).matches

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
  return typeof selector === 'string' && selector.includes('sidebar-navigation')
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
    if (isDrawerScreen()) {
      const drawerOpen = Boolean(
        document.querySelector('button[aria-label="Close navigation menu"][aria-expanded="true"]'),
      )

      if (!drawerOpen) return null

      return (
        matches.find((element) => {
          const drawer = element.closest('.MuiDrawer-paper')
          return Boolean(drawer) && isVisible(drawer) && isVisible(element)
        }) ?? null
      )
    }

    const desktopTarget = matches.find((element) => !element.closest('.MuiDrawer-paper') && isVisible(element))

    if (desktopTarget) return desktopTarget
  }

  return matches.find(isVisible) ?? null
}

/* Opens the mobile navigation drawer when a tour step targets navigation. */
function ensureNavigationDrawerOpen(selector, index, drawerRequestedFor) {
  if (!isNavigationSelector(selector)) return true
  if (!isDrawerScreen()) return true

  const closeButton = document.querySelector('button[aria-label="Close navigation menu"][aria-expanded="true"]')

  if (closeButton && isVisible(closeButton)) {
    return Boolean(findStepTarget(selector))
  }

  const openButton = Array.from(
    document.querySelectorAll('button[aria-label="Open navigation menu"][aria-expanded="false"]'),
  ).find(isVisible)

  if (openButton && drawerRequestedFor.current !== index) {
    drawerRequestedFor.current = index
    openButton.click()
  }

  return false
}

/*
 * Closes the navigation drawer if it is open.
 * Returns true when it was open, so the caller can wait for it to finish closing.
 */
function closeNavigationDrawer() {
  if (!isDrawerScreen()) return false

  const closeButton = document.querySelector('button[aria-label="Close navigation menu"][aria-expanded="true"]')

  if (closeButton && isVisible(closeButton)) {
    closeButton.click()
    return true
  }

  return false
}

function getScrollParent(element) {
  let node = element.parentElement

  while (node) {
    const { overflowY } = window.getComputedStyle(node)

    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node
    }

    node = node.parentElement
  }

  return document.scrollingElement
}

/* ---------- Keeping the card and the highlighted area apart ---------- */

// Space a phone card needs above or below the target.
const phoneRoom = () =>
  Math.min(CARD_HEIGHT, window.innerHeight * PHONE_CARD_SHARE) + CARD_GAP + VIEWPORT_PADDING

// Phones: bottom if the target ends above it, top if the target starts below it.
// When neither fits (a very tall target) the card goes to the top and the target is scrolled below it.
function choosePhonePlacement(rect) {
  const room = phoneRoom()

  if (rect.bottom <= window.innerHeight - room) return 'bottom'
  if (rect.top >= room) return 'top'

  return 'top'
}

function overlapsTarget(position, width, rect) {
  return !(
    position.left + width <= rect.left - CARD_GAP ||
    position.left >= rect.right + CARD_GAP ||
    position.top + CARD_HEIGHT <= rect.top - CARD_GAP ||
    position.top >= rect.bottom + CARD_GAP
  )
}

const cardWidth = () => Math.min(CARD_WIDTH, window.innerWidth - VIEWPORT_PADDING * 2)

/*
 * Larger screens: a target near the top of the screen (the menu, the page heading)
 * gets the card directly below the highlight, clear of its ring.
 * Anything else, or no room below, uses the usual beside-the-target position.
 */
function desktopPosition(rect) {
  const width = cardWidth()

  if (rect.top < window.innerHeight * TOP_ZONE_SHARE) {
    const below = {
      left: clamp(rect.left, VIEWPORT_PADDING, window.innerWidth - width - VIEWPORT_PADDING),
      top: rect.bottom + HIGHLIGHT_PAD + CARD_GAP,
    }

    if (below.top + CARD_HEIGHT <= window.innerHeight - VIEWPORT_PADDING) return below
  }

  return positionCard(rect, width, CARD_HEIGHT)
}

/*
 * Where the card goes for a target.
 * Phones: { placement: 'top' | 'bottom' }.
 * Larger screens: { position } beside the target, or at the top when no side has room.
 */
function getCardLayout(rect) {
  if (isPhone()) {
    return { placement: choosePhonePlacement(rect), position: null }
  }

  const width = cardWidth()
  const position = desktopPosition(rect)

  if (!overlapsTarget(position, width, rect)) {
    return { placement: 'bottom', position }
  }

  return {
    placement: 'bottom',
    position: {
      left: clamp(rect.left, VIEWPORT_PADDING, window.innerWidth - width - VIEWPORT_PADDING),
      top: VIEWPORT_PADDING,
    },
  }
}

/*
 * Runs once when a step's target is found.
 * If the target is so tall that the card has no free side, scroll so the
 * target starts right below the card, which then sits at the top.
 */
function makeRoomForCard(target) {
  const rect = target.getBoundingClientRect()

  let needsRoom
  let desiredTop

  if (isPhone()) {
    const room = phoneRoom()
    needsRoom = !(rect.bottom <= window.innerHeight - room || rect.top >= room)
    desiredTop = room
  } else {
    needsRoom = overlapsTarget(desktopPosition(rect), cardWidth(), rect)
    desiredTop = VIEWPORT_PADDING + CARD_HEIGHT + CARD_GAP
  }

  if (!needsRoom) return

  const delta = rect.top - desiredTop

  if (Math.abs(delta) > 1) {
    getScrollParent(target)?.scrollBy({ top: delta, behavior: 'auto' })
  }
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

  const cardRef = useRef(null)
  const navigatedFor = useRef(-1)
  const drawerRequestedFor = useRef(-1)

  const index = tour?.index ?? 0
  const step = tour?.phase === 'tour' ? tour.steps[index] : null

  const layout = rect ? getCardLayout(rect) : null

  // Respond to tour start/stop events.
  useEffect(() => {
    const onStart = () => {
      setRect(null)
      setCardRect(null)
      setTour(readTour())
    }

    const onStop = () => {
      closeNavigationDrawer() // never leave the menu open behind a finished tour
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
    closeNavigationDrawer()
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
    let lastClickTry = -RECLICK_TICKS
    let timer
    let detach = () => {}

    setRect(null)
    setCardRect(null)

    if (pathname !== step.path && navigatedFor.current !== index) {
      navigatedFor.current = index
      navigate(step.path)
    }

    const skipIfTimedOut = () => {
      if (tries >= POLL_TRIES) {
        window.clearInterval(timer)
        goRef.current(index + 1)
      }
    }

    // Only the rectangle follows scrolling and resizing; the card layout is worked out from it.
    const updateRect = () => {
      if (cancelled) return

      const target = findStepTarget(step.target)

      if (target) setRect(rectOf(target))
    }

    timer = window.setInterval(() => {
      if (cancelled) return

      tries += 1

      // After the navigation step, close the drawer so it does not cover later steps.
      if (!isNavigationSelector(step.target) && closeNavigationDrawer()) {
        skipIfTimedOut()
        return
      }

      /*
       * Some steps need a control clicked first, for example expanding a task.
       * The control only matches while it is still collapsed, so a click is
       * repeated every few polls until the step's target appears, and skipped
       * entirely when the page is already in the right state.
       */
      if (step.click) {
        const clickTarget = findStepTarget(step.click)

        if (clickTarget && tries - lastClickTry >= RECLICK_TICKS) {
          lastClickTry = tries
          clickTarget.click()
          return
        }
      }

      // Open mobile navigation before locating a navigation target.
      if (isNavigationSelector(step.target)) {
        const drawerReady = ensureNavigationDrawerOpen(step.target, index, drawerRequestedFor)

        if (!drawerReady) {
          skipIfTimedOut()
          return
        }
      }

      const target = findStepTarget(step.target)

      if (!target) {
        skipIfTimedOut()
        return
      }

      window.clearInterval(timer)

      target.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'auto',
      })

      // Very tall targets: scroll so they start below the card.
      makeRoomForCard(target)

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
  const placementKey = layout?.placement
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
  }, [rect, index, placementKey])

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
    return <TourIntro onStart={() => goTo(0)} onSkip={stop} />
  }

  if (!step || !rect) return null

  return (
    <>
      <TourOverlay targetRect={rect} cardRect={cardRect} />

      <TourCard
        ref={cardRef}
        step={step}
        index={index}
        total={tour.steps.length}
        position={layout.position}
        phonePlacement={layout.placement}
        onNext={() => goTo(index + 1)}
        onBack={() => goTo(index - 1)}
        onClose={stop}
      />
    </>
  )
}