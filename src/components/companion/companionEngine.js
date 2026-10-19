/* Local, rule-based replies built from the meetings you pass in. No server needed. */

export const DEFAULT_ROUTES = {
  calendar: '/calendar',
  tasks: '/tasks',
  recorded: '/recorded',
  howItWorks: '/how-it-works',
  meeting: (id) => `/meetings/${id}`,
}

export const SUGGESTIONS = [
  "Today's meetings",
  'Next meeting',
  'My pending tasks',
  'Recorded meetings',
  'How does MeetAI work?',
]

export const GREETING = {
  text:
    "Hi, I'm your MeetAI Companion. I can check today's meetings, your pending tasks and recordings, and take you to the right page. What would you like to do?",
  actions: [],
}

const startOf = (m) => new Date(m?.start).getTime()
const time = (v) => new Date(v).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
const day = (v) => new Date(v).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })
const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString()
const isDone = (item) => item.status === 'Done' || item.completed === true
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

function formatIn(ms) {
  const minutes = Math.max(1, Math.round(ms / 60000))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m`
  return plural(Math.round(hours / 24), 'day')
}

/*
 * Returns { text, actions }.
 * action = { label, to }            -> navigates to a route
 *        | { label, command }       -> 'create' | 'instant' (opens a dialog, if the app provides one)
 */
export function getReply(input, { meetings = [], routes = DEFAULT_ROUTES, now = new Date() }) {
  const q = input.toLowerCase().trim()
  const nowMs = now.getTime()
  const list = meetings
    .filter((m) => Number.isFinite(startOf(m)))
    .sort((a, b) => startOf(a) - startOf(b))

  const go = (label, to) => ({ label, to })

  /* Greeting */
  if (/^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(q)) {
    return { text: 'Hello! Ask me about your meetings, tasks or recordings.', actions: [] }
  }

  /* Create / schedule */
  if (/(create|schedule|set up|book|new).*(meeting|event)|(start|record).*(meeting|instant)/.test(q)) {
    return {
      text: 'I can help with that. You can schedule an event for later, or start recording an instant meeting from a link.',
      actions: [
        { label: 'Schedule an event', command: 'create' },
        { label: 'Record instant meeting', command: 'instant' },
      ],
    }
  }

  /* How it works */
  if (/how.*(work|use)|tour|guide|getting started|help/.test(q)) {
    return {
      text:
        'MeetAI has four main areas:\n• Dashboard – your day at a glance\n• Calendar – see and manage meetings\n• Recorded Meetings – watch and catch up\n• My Tasks – action items from your meetings\n\nThe How It Works page has a guided tour.',
      actions: [go('Open How It Works', routes.howItWorks)],
    }
  }

  /* Tasks */
  if (/task|action item|to-?do|pending|follow/.test(q)) {
    const items = list.flatMap((m) => (m.actionItems || []).map((i) => ({ ...i, meeting: m.title })))
    const pending = items.filter((i) => !isDone(i))

    if (!items.length) {
      return { text: 'There are no action items yet. They appear after your meetings.', actions: [go('Open My Tasks', routes.tasks)] }
    }

    const lines = pending.slice(0, 4).map((i) => `• ${i.title}${i.meeting ? ` (${i.meeting})` : ''}`)
    return {
      text: pending.length
        ? `You have ${plural(pending.length, 'pending action item')} out of ${items.length}:\n${lines.join('\n')}`
        : `All ${plural(items.length, 'action item')} are done. Nice work!`,
      actions: [go('Open My Tasks', routes.tasks)],
    }
  }

  /* Today */
  if (/today|tonight/.test(q)) {
    const today = list.filter((m) => sameDay(m.start, now))
    return {
      text: today.length
        ? `You have ${plural(today.length, 'meeting')} today:\n${today.map((m) => `• ${time(m.start)} – ${m.title || 'Untitled meeting'}`).join('\n')}`
        : 'You have no meetings today.',
      actions: [go('Open calendar', routes.calendar)],
    }
  }

  /* Next / upcoming */
  if (/next|upcoming|coming up|soon/.test(q)) {
    const upcoming = list.filter((m) => startOf(m) > nowMs).slice(0, 3)

    if (!upcoming.length) {
      return { text: 'You have no upcoming meetings.', actions: [go('Open calendar', routes.calendar)] }
    }

    const [first, ...rest] = upcoming
    const more = rest.length
      ? `\n\nAfter that:\n${rest.map((m) => `• ${day(m.start)}, ${time(m.start)} – ${m.title || 'Untitled meeting'}`).join('\n')}`
      : ''

    return {
      text: `Your next meeting is “${first.title || 'Untitled meeting'}” on ${day(first.start)} at ${time(first.start)}, in ${formatIn(startOf(first) - nowMs)}.${more}`,
      actions: [
        ...(first.id ? [go('Open meeting', routes.meeting(first.id))] : []),
        go('Open calendar', routes.calendar),
      ],
    }
  }

  /* Recordings / transcripts */
  if (/record|transcript|past meeting|completed|watch/.test(q)) {
    const recorded = list
      .filter((m) => m.recording?.available || m.transcript?.available)
      .reverse()
      .slice(0, 3)

    return {
      text: recorded.length
        ? `Your latest meetings with a recording or transcript:\n${recorded.map((m) => `• ${day(m.start)} – ${m.title || 'Untitled meeting'}`).join('\n')}`
        : 'No recordings or transcripts are available yet.',
      actions: [
        ...(recorded[0]?.id ? [go('Open latest recording', `${routes.meeting(recorded[0].id)}?tab=recording`)] : []),
        go('Recorded Meetings', routes.recorded),
      ],
    }
  }

  /* About MeetAI */
  if (/meetai|companion|summary|notes|mom|invite/.test(q)) {
    return {
      text:
        'When you invite MeetAI to a meeting, it joins as a participant, captures the live transcript, and emails the minutes and action items afterwards. Video recording is optional.',
      actions: [{ label: 'Record instant meeting', command: 'instant' }],
    }
  }

  return {
    text: "I'm not sure about that yet. Try asking about today's meetings, your next meeting, pending tasks, recordings, or how MeetAI works.",
    actions: [],
  }
}