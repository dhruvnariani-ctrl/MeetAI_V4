
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CompanionDialog from './CompanionDialog'
import CompanionFab from './CompanionFab'
import { DEFAULT_ROUTES, GREETING, getReply } from './companionEngine'

const BOTTOM_THRESHOLD = 32

export default function CompanionBot({
  meetings = [],
  routes: routeOverrides,
  onCreateMeeting,
  onInstantMeeting,
  onAsk,
  imageSrc = `${import.meta.env.BASE_URL}/images/companion-robot.svg`,
  placement = 'floating',
}) {
  const navigate = useNavigate()
  const routes = { ...DEFAULT_ROUTES, ...routeOverrides }

  const idRef = useRef(1)
  const nextId = () => ++idRef.current

  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', ...GREETING },
  ])

  // Detect scrolling on either the page or a scrollable app container.
  useEffect(() => {
    const checkPosition = (event) => {
      const target = event?.target

      // A scrollable element inside the application.
      if (
        target instanceof Element &&
        target !== document.documentElement &&
        target !== document.body &&
        target.scrollHeight > target.clientHeight + 1
      ) {
        const atBottom =
          target.scrollTop + target.clientHeight >=
          target.scrollHeight - BOTTOM_THRESHOLD

        setIsAtBottom(atBottom)
        return
      }

      // The browser window/document.
      const documentElement = document.documentElement
      const scrollTop =
        window.scrollY ||
        documentElement.scrollTop ||
        document.body.scrollTop ||
        0

      const scrollHeight = Math.max(
        documentElement.scrollHeight,
        document.body.scrollHeight,
      )

      const viewportHeight = window.innerHeight

      const atBottom =
        scrollTop + viewportHeight >=
        scrollHeight - BOTTOM_THRESHOLD

      setIsAtBottom(atBottom)
    }

    checkPosition()

    // Capture scroll events from nested scroll containers too.
    document.addEventListener('scroll', checkPosition, true)
    window.addEventListener('scroll', checkPosition, { passive: true })
    window.addEventListener('resize', checkPosition)

    return () => {
      document.removeEventListener('scroll', checkPosition, true)
      window.removeEventListener('scroll', checkPosition)
      window.removeEventListener('resize', checkPosition)
    }
  }, [])

  const canRun = (action) =>
    Boolean(action.to) ||
    (action.command === 'create' && onCreateMeeting) ||
    (action.command === 'instant' && onInstantMeeting)

  const handleSend = async (text) => {
    const userMessage = {
      id: nextId(),
      role: 'user',
      text,
    }

    const history = [...messages, userMessage]

    setMessages(history)
    setBusy(true)

    try {
      const raw = onAsk
        ? await onAsk(text, history)
        : (
            await new Promise((resolve) => setTimeout(resolve, 450)),
            getReply(text, { meetings, routes })
          )

      const reply =
        typeof raw === 'string' ? { text: raw } : raw

      setMessages((list) => [
        ...list,
        {
          id: nextId(),
          role: 'bot',
          text: reply?.text || 'I could not generate a response.',
          actions: (reply?.actions || []).filter(canRun),
        },
      ])
    } catch {
      setMessages((list) => [
        ...list,
        {
          id: nextId(),
          role: 'bot',
          text: 'Sorry, something went wrong. Please try again.',
          actions: [],
        },
      ])
    } finally {
      setBusy(false)
    }
  }

  const handleAction = (action) => {
    setOpen(false)

    if (action.to) navigate(action.to)
    else if (action.command === 'create') onCreateMeeting?.()
    else if (action.command === 'instant') onInstantMeeting?.()
  }

  const reset = () => {
    setMessages([
      { id: nextId(), role: 'bot', ...GREETING },
    ])
  }

  return (
    <>
      <CompanionFab
        open={open}
        isAtBottom={isAtBottom}
        placement={placement}
        imageSrc={imageSrc}
        onClick={() => setOpen(true)}
      />

      <CompanionDialog
        open={open}
        isAtBottom={isAtBottom}
        onClose={() => setOpen(false)}
        messages={messages}
        busy={busy}
        imageSrc={imageSrc}
        onSend={handleSend}
        onAction={handleAction}
        onReset={reset}
      />
    </>
  )
}