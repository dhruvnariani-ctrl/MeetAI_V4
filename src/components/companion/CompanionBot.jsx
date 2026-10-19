
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import useCurrentUser from '../../hooks/useCurrentUser'
import CompanionDialog from './CompanionDialog'
import CompanionFab from './CompanionFab'
import { DEFAULT_ROUTES, GREETING, getReply } from './companionEngine'

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
  const currentUser = useCurrentUser()

  const idRef = useRef(1)
  const nextId = () => ++idRef.current

  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', ...GREETING },
  ])

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
        : await new Promise((resolve) => {
            setTimeout(() => {
              resolve(
                getReply(text, {
                  meetings,
                  currentUser,
                  routes,
                }),
              )
            }, 450)
          })

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

    if (action.to) {
      navigate(action.to)
    } else if (action.command === 'create') {
      onCreateMeeting?.()
    } else if (action.command === 'instant') {
      onInstantMeeting?.()
    }
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
        placement={placement}
        imageSrc={imageSrc}
        onClick={() => setOpen(true)}
      />

      <CompanionDialog
        open={open}
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
