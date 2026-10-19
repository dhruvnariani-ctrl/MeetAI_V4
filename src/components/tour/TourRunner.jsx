import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import TourCard from './TourCard'
import TourIntro from './TourIntro'
import TourOverlay from './TourOverlay'
import { readTour, saveTour, stopAppTour } from './TourStorage'
import { findTarget, positionCard, rectOf } from './TourUtils'

const POLL_MS = 100
const POLL_TRIES = 25 // about 2.5 seconds to find a target before the step is skipped
const CARD_WIDTH = 360
const CARD_HEIGHT = 330

/*
 * Runs a guided tour. Start one with startAppTour(steps) from TourStorage.
 * The tour lives in sessionStorage, so a page refresh resumes where you were.
 * Mount once, inside the router (see AppLayout).
 */
export default function TourRunner() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [tour, setTour] = useState(readTour)
  const [rect, setRect] = useState(null)

  const cardRef = useRef(null)
  const navigatedFor = useRef(-1)
  const clickedFor = useRef(-1)

  const index = tour?.index ?? 0
  const step = tour?.phase === 'tour' ? tour.steps[index] : null

  // startAppTour / stopAppTour announce themselves with window events.
  useEffect(() => {
    const onStart = () => setTour(readTour())
    const onStop = () => setTour(null)

    window.addEventListener('meetai-tour-start', onStart)
    window.addEventListener('meetai-tour-stop', onStop)

    return () => {
      window.removeEventListener('meetai-tour-start', onStart)
      window.removeEventListener('meetai-tour-stop', onStop)
    }
  }, [])

  const stop = useCallback(() => {
    setRect(null)
    stopAppTour()
  }, [])

  const goTo = useCallback(
    (next) => {
      if (!tour || next < 0) return
      if (next >= tour.steps.length) {
        stop()
        return
      }

      const updated = { ...tour, index: next, phase: 'tour' }
      saveTour(updated)
      setRect(null)
      setTour(updated)
    },
    [tour, stop],
  )

  // Always call the latest goTo from inside the polling timer.
  const goRef = useRef(goTo)
  useEffect(() => {
    goRef.current = goTo
  })

  // Go to the step's page, wait for its target, scroll to it and keep the highlight in place.
  useEffect(() => {
    if (!step) return undefined

    if (pathname !== step.path && navigatedFor.current !== index) {
      navigatedFor.current = index
      navigate(step.path)
    }

    let tries = 0
    let detach = () => {}

    const update = () => {
      const target = findTarget(step.target)
      if (target) setRect(rectOf(target))
    }

    const timer = setInterval(() => {
      tries += 1

      // Some steps need a click first, for example expanding a task.
      if (step.click && clickedFor.current !== index) {
        clickedFor.current = index
        findTarget(step.click)?.click()
        return
      }

      const target = findTarget(step.target)

      if (target) {
        clearInterval(timer)
        target.scrollIntoView({ block: 'center', inline: 'nearest' })
        requestAnimationFrame(update)

        window.addEventListener('resize', update)
        window.addEventListener('scroll', update, true)
        detach = () => {
          window.removeEventListener('resize', update)
          window.removeEventListener('scroll', update, true)
        }
      } else if (tries >= POLL_TRIES) {
        clearInterval(timer)
        goRef.current(index + 1) // target is not on this screen, so skip the step
      }
    }, POLL_MS)

    return () => {
      clearInterval(timer)
      detach()
    }
  }, [step, index, pathname, navigate])

  // Escape closes the tour.
  useEffect(() => {
    if (!tour) return undefined

    const onKey = (event) => {
      if (event.key === 'Escape') stop()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tour, stop])

  // Move keyboard focus to the card so Tab reaches Next straight away.
  const ready = Boolean(rect)
  useEffect(() => {
    if (ready) cardRef.current?.focus({ preventScroll: true })
  }, [ready, index])

  if (!tour) return null

  if (tour.phase === 'intro') {
    return <TourIntro onStart={() => goTo(0)} onSkip={stop} />
  }

  if (!step || !rect) return null

  return (
    <>
      <TourOverlay targetRect={rect} />
      <TourCard
        ref={cardRef}
        step={step}
        index={index}
        total={tour.steps.length}
        position={positionCard(rect, CARD_WIDTH, CARD_HEIGHT)}
        onNext={() => goTo(index + 1)}
        onBack={() => goTo(index - 1)}
        onClose={stop}
      />
    </>
  )
}