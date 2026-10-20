import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import TourIntro from './TourIntro'
import TourCard from './TourCard'
import TourOverlay from './TourOverlay'

import { readTour, saveTour, stopAppTour } from './TourStorage'
import { clamp, findTarget, rectOf } from './TourUtils'

const POLL_MS = 100
const POLL_TRIES = 60

const CARD_WIDTH = 360
const CARD_HEIGHT = 330

const DRAWER_SCREEN = '(max-width: 1199.95px)'
const PHONE = '(max-width: 599.95px)'

const PHONE_CARD_SHARE = 0.4
const CARD_GAP = 16
const VIEWPORT_PADDING = 12
const HIGHLIGHT_PAD = 12
const TOP_ZONE_SHARE = 0.25
const RECLICK_TICKS = 5

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
  return (
    typeof selector === 'string' &&
    selector.includes('sidebar-navigation')
  )
}

/*
 * Find the visible target for the current step.
 * On smaller screens, navigation targets must come from the open drawer.
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
        document.querySelector(
          'button[aria-label="Close navigation menu"][aria-expanded="true"]',
        ),
      )

      if (!drawerOpen) return null

      return (
        matches.find((element) => {
          const drawer = element.closest('.MuiDrawer-paper')
          return Boolean(drawer) && isVisible(drawer) && isVisible(element)
        }) ?? null
      )
    }

    const desktopTarget = matches.find(
      (element) =>
        !element.closest('.MuiDrawer-paper') && isVisible(element),
    )

    if (desktopTarget) return desktopTarget
  }

  return matches.find(isVisible) ?? null
}

/* Open the mobile navigation drawer for navigation tour steps. */
function ensureNavigationDrawerOpen(selector, index, drawerRequestedFor) {
  if (!isNavigationSelector(selector)) return true
  if (!isDrawerScreen()) return true

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
 * Close an open mobile navigation drawer.
 * Returns true if the drawer was open and a close was requested.
 */
function closeNavigationDrawer() {
  if (!isDrawerScreen()) return false

  const closeButton = document.querySelector(
    'button[aria-label="Close navigation menu"][aria-expanded="true"]',
  )

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

    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      node.scrollHeight > node.clientHeight
    ) {
      return node
    }

    node = node.parentElement
  }

  return document.scrollingElement
}

/* ---------- Card and target positioning ---------- */

const phoneRoom = () =>
  Math.min(CARD_HEIGHT, window.innerHeight * PHONE_CARD_SHARE) +
  CARD_GAP +
  VIEWPORT_PADDING

function choosePhonePlacement(rect) {
  const room = phoneRoom()

  if (rect.bottom <= window.innerHeight - room) return 'bottom'
  if (rect.top >= room) return 'top'

  return 'top'
}

function cardWidth() {
  return Math.max(
    1,
    Math.min(CARD_WIDTH, window.innerWidth - VIEWPORT_PADDING * 2),
  )
}

function getCardHeight(measuredHeight) {
  const maxHeight = Math.max(
    120,
    window.innerHeight - VIEWPORT_PADDING * 2,
  )

  return clamp(
    measuredHeight || CARD_HEIGHT,
    120,
    maxHeight,
  )
}

function overlapsTarget(position, width, height, rect) {
  const left = position.left
  const top = position.top
  const right = left + width
  const bottom = top + height

  return !(
    right <= rect.left - CARD_GAP ||
    left >= rect.right + CARD_GAP ||
    bottom <= rect.top - CARD_GAP ||
    top >= rect.bottom + CARD_GAP
  )
}

function fitsViewport(position, width, height) {
  return (
    position.left >= VIEWPORT_PADDING &&
    position.top >= VIEWPORT_PADDING &&
    position.left + width <= window.innerWidth - VIEWPORT_PADDING &&
    position.top + height <= window.innerHeight - VIEWPORT_PADDING
  )
}

function makePosition(left, top, width, height) {
  return {
    left: clamp(
      left,
      VIEWPORT_PADDING,
      Math.max(
        VIEWPORT_PADDING,
        window.innerWidth - width - VIEWPORT_PADDING,
      ),
    ),
    top: clamp(
      top,
      VIEWPORT_PADDING,
      Math.max(
        VIEWPORT_PADDING,
        window.innerHeight - height - VIEWPORT_PADDING,
      ),
    ),
  }
}

/*
 * Try positions around the target using the real card height.
 * The first choice that fits the viewport and does not overlap the
 * highlighted element is used.
 */
function desktopPosition(rect, measuredHeight) {
  const width = cardWidth()
  const height = getCardHeight(measuredHeight)

  const targetCenterX = (rect.left + rect.right) / 2
  const targetCenterY = (rect.top + rect.bottom) / 2

  const candidates = []

  // A target near the top of the screen is usually best served by a card below it.
  if (rect.top < window.innerHeight * TOP_ZONE_SHARE) {
    candidates.push({
      left: rect.left,
      top: rect.bottom + HIGHLIGHT_PAD + CARD_GAP,
    })
  }

  // Right and left are preferable when the target has enough horizontal room.
  candidates.push(
    {
      left: rect.right + HIGHLIGHT_PAD + CARD_GAP,
      top: targetCenterY - height / 2,
    },
    {
      left: rect.left - width - HIGHLIGHT_PAD - CARD_GAP,
      top: targetCenterY - height / 2,
    },
    {
      left: targetCenterX - width / 2,
      top: rect.bottom + HIGHLIGHT_PAD + CARD_GAP,
    },
    {
      left: targetCenterX - width / 2,
      top: rect.top - height - HIGHLIGHT_PAD - CARD_GAP,
    },
  )

  for (const candidate of candidates) {
    const position = makePosition(
      candidate.left,
      candidate.top,
      width,
      height,
    )

    if (
      fitsViewport(position, width, height) &&
      !overlapsTarget(position, width, height, rect)
    ) {
      return position
    }
  }

  /*
   * If the target occupies most of the screen, there may be no valid
   * position around it. Use a safe corner rather than placing the card
   * on top of the highlighted target.
   */
  const safeCandidates = [
    { left: VIEWPORT_PADDING, top: VIEWPORT_PADDING },
    {
      left: window.innerWidth - width - VIEWPORT_PADDING,
      top: VIEWPORT_PADDING,
    },
    {
      left: VIEWPORT_PADDING,
      top: window.innerHeight - height - VIEWPORT_PADDING,
    },
    {
      left: window.innerWidth - width - VIEWPORT_PADDING,
      top: window.innerHeight - height - VIEWPORT_PADDING,
    },
  ]

  const safePosition = safeCandidates
    .map((candidate) =>
      makePosition(candidate.left, candidate.top, width, height),
    )
    .find(
      (position) =>
        !overlapsTarget(position, width, height, rect),
    )

  return (
    safePosition ??
    makePosition(
      window.innerWidth - width - VIEWPORT_PADDING,
      VIEWPORT_PADDING,
      width,
      height,
    )
  )
}

function getCardLayout(rect, measuredHeight) {
  if (isPhone()) {
    return {
      placement: choosePhonePlacement(rect),
      position: null,
    }
  }

  return {
    placement: 'bottom',
    position: desktopPosition(rect, measuredHeight),
  }
}

/*
 * If the target and card cannot fit separately in the current viewport,
 * scroll the target into a position that leaves room for the card.
 */
function makeRoomForCard(target, measuredHeight) {
  const rect = target.getBoundingClientRect()

  if (isPhone()) {
    const room = phoneRoom()
    const needsRoom = !(
      rect.bottom <= window.innerHeight - room ||
      rect.top >= room
    )

    if (!needsRoom) return

    const delta = rect.top - room

    if (Math.abs(delta) > 1) {
      getScrollParent(target)?.scrollBy({
        top: delta,
        behavior: 'auto',
      })
    }

    return
  }

  const height = getCardHeight(measuredHeight)
  const position = desktopPosition(rect, height)
  const width = cardWidth()

  if (!overlapsTarget(position, width, height, rect)) return

  const desiredTop = VIEWPORT_PADDING + height + CARD_GAP
  const delta = rect.top - desiredTop

  if (Math.abs(delta) > 1) {
    getScrollParent(target)?.scrollBy({
      top: delta,
      behavior: 'auto',
    })
  }
}

function boundsFromElement(element) {
  if (!element) return null

  const bounds = element.getBoundingClientRect()

  return {
    left: bounds.left,
    top: bounds.top,
    right: bounds.right,
    bottom: bounds.bottom,
  }
}

function sameBounds(previous, next) {
  if (!previous || !next) return false

  return (
    Math.abs(previous.left - next.left) < 1 &&
    Math.abs(previous.top - next.top) < 1 &&
    Math.abs(previous.right - next.right) < 1 &&
    Math.abs(previous.bottom - next.bottom) < 1
  )
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
  const [cardHeight, setCardHeight] = useState(CARD_HEIGHT)

  const cardRef = useRef(null)
  const navigatedFor = useRef(-1)
  const drawerRequestedFor = useRef(-1)
  const goRef = useRef(null)

  const index = tour?.index ?? 0
  const step =
    tour?.phase === 'tour' ? tour.steps[index] : null

  const layout = rect
    ? getCardLayout(rect, cardHeight)
    : null

  /*
   * Keep the actual card height measured. Some steps contain more text
   * than others, so a fixed 330px estimate is not reliable on desktop.
   */
  useEffect(() => {
    if (!tour || tour.phase !== 'tour' || !cardRef.current) {
      return undefined
    }

    const element = cardRef.current
    let frame = 0

    const measure = () => {
      window.cancelAnimationFrame(frame)

      frame = window.requestAnimationFrame(() => {
        if (!element.isConnected) return

        const bounds = element.getBoundingClientRect()
        const nextHeight = Math.ceil(bounds.height)

        if (nextHeight > 0) {
          setCardHeight((previous) =>
            Math.abs(previous - nextHeight) < 1
              ? previous
              : nextHeight,
          )

          const nextRect = {
            left: bounds.left,
            top: bounds.top,
            right: bounds.right,
            bottom: bounds.bottom,
          }

          setCardRect((previous) =>
            sameBounds(previous, nextRect) ? previous : nextRect,
          )
        }
      })
    }

    measure()

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(measure)
        : null

    resizeObserver?.observe(element)

    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [tour, index, rect, layout?.position?.left, layout?.position?.top, layout?.placement])

  /*
   * Respond to tour start/stop events.
   */
  useEffect(() => {
    const onStart = () => {
      setRect(null)
      setCardRect(null)
      setCardHeight(CARD_HEIGHT)
      setTour(readTour())
    }

    const onStop = () => {
      closeNavigationDrawer()
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
      setCardHeight(CARD_HEIGHT)
      setTour(updated)
    },
    [tour, stop],
  )

  useEffect(() => {
    goRef.current = goTo
  }, [goTo])

  /*
   * Locate the target for the current step and wait for navigation,
   * drawer animation, or page rendering to finish.
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

    if (
      pathname !== step.path &&
      navigatedFor.current !== index
    ) {
      navigatedFor.current = index
      navigate(step.path)
    }

    const skipIfTimedOut = () => {
      if (tries >= POLL_TRIES) {
        window.clearInterval(timer)
        goRef.current?.(index + 1)
      }
    }

    const updateRect = () => {
      if (cancelled) return

      const target = findStepTarget(step.target)

      if (target) {
        setRect(rectOf(target))
      }
    }

    timer = window.setInterval(() => {
      if (cancelled) return

      tries += 1

      // Wait for the navigation drawer to close before non-navigation steps.
      if (
        !isNavigationSelector(step.target) &&
        closeNavigationDrawer()
      ) {
        skipIfTimedOut()
        return
      }

      // Click a control for steps that need an expanded or revealed target.
      if (step.click) {
        const clickTarget = findStepTarget(step.click)

        if (
          clickTarget &&
          tries - lastClickTry >= RECLICK_TICKS
        ) {
          lastClickTry = tries
          clickTarget.click()
          return
        }
      }

      // Open the drawer before searching for mobile navigation targets.
      if (isNavigationSelector(step.target)) {
        const drawerReady = ensureNavigationDrawerOpen(
          step.target,
          index,
          drawerRequestedFor,
        )

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

      makeRoomForCard(target, cardHeight)

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
  }, [step, index, pathname, navigate, cardHeight])

  /*
   * Escape closes the tour.
   */
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

  /*
   * Focus the card once its target is ready.
   */
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

  if (!step || !rect || !layout) return null

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
        position={layout.position}
        phonePlacement={layout.placement}
        onNext={() => goTo(index + 1)}
        onBack={() => goTo(index - 1)}
        onClose={stop}
      />
    </>
  )
}