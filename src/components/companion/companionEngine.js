
/* Local, rule-based replies built from the meetings you pass in.
 * No server or external API required.
 */

import { filterUserMeetings } from '../../utils/meetingAccess'
import { getTasksFromDashboard } from '../../data/tasks'

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

const startOf = (meeting) => new Date(meeting?.start).getTime()

const time = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })

const day = (value) =>
  new Date(value).toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

const sameDay = (a, b) =>
  new Date(a).toDateString() === new Date(b).toDateString()

const isDone = (item) =>
  item.status === 'Done' || item.completed === true

const plural = (count, word) =>
  `${count} ${word}${count === 1 ? '' : 's'}`

function formatIn(milliseconds) {
  const minutes = Math.max(1, Math.round(milliseconds / 60000))

  if (minutes < 60) return `${minutes} min`

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `${hours}h ${minutes % 60}m`
  }

  return plural(Math.round(hours / 24), 'day')
}

/*
 * Returns:
 * { text, actions }
 *
 * action = { label, to }
 *        | { label, command: 'create' | 'instant' }
 */
export function getReply(
  input,
  {
    meetings = [],
    currentUser,
    routes = DEFAULT_ROUTES,
    now = new Date(),
  } = {},
) {
  const q = String(input ?? '').toLowerCase().trim()
  const nowMs = now.getTime()

  /*
   * Do not expose personal meeting data if the current user is unavailable.
   * All meeting-based replies use this filtered list.
   */
  const userMeetings = currentUser
    ? filterUserMeetings(
        Array.isArray(meetings) ? meetings : [],
        currentUser,
      )
    : []

  const list = userMeetings
    .filter((meeting) => Number.isFinite(startOf(meeting)))
    .sort((a, b) => startOf(a) - startOf(b))

  const go = (label, to) => ({ label, to })

  /* Greeting */
  if (/^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(q)) {
    return {
      text: 'Hello! Ask me about your meetings, tasks or recordings.',
      actions: [],
    }
  }

  /* Create / schedule */
  if (
    /(create|schedule|set up|book|new).*(meeting|event)|(start|record).*(meeting|instant)/.test(
      q,
    )
  ) {
    return {
      text:
        'I can help with that. You can schedule an event for later, or start recording an instant meeting from a link.',
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
        'MeetAI has four main areas:\n' +
        '• Dashboard – your day at a glance\n' +
        '• Calendar – see and manage meetings\n' +
        '• Recorded Meetings – watch and catch up\n' +
        '• My Tasks – action items from your meetings\n\n' +
        'The How It Works page has a guided tour.',
      actions: [go('Open How It Works', routes.howItWorks)],
    }
  }

  /* Tasks — use the same filtering as the My Tasks page */
  if (/task|action item|to-?do|pending|follow/.test(q)) {
    if (!currentUser) {
      return {
        text:
          'I cannot check your tasks because your current user could not be identified.',
        actions: [go('Open My Tasks', routes.tasks)],
      }
    }

    /*
     * getTasksFromDashboard already:
     * 1. Filters meetings for the current user.
     * 2. Extracts their action items.
     * 3. Filters tasks with filterUserTasks(currentUser).
     *
     * Do not replace this with meeting.actionItems directly.
     */
    const userTasks = getTasksFromDashboard(currentUser)

    const pending = userTasks.filter(
      (task) => !isDone(task),
    )

    if (!userTasks.length) {
      return {
        text: 'You have no tasks assigned to you yet.',
        actions: [go('Open My Tasks', routes.tasks)],
      }
    }

    const lines = pending
      .slice(0, 4)
      .map(
        (task) =>
          `• ${task.title || 'Untitled task'}${
            task.meetingTitle || task.meeting
              ? ` (${task.meetingTitle || task.meeting})`
              : ''
          }`,
      )

    return {
      text: pending.length
        ? `You have ${plural(pending.length, 'open task')} out of ${userTasks.length} assigned to you:\n${lines.join('\n')}`
        : `All ${plural(userTasks.length, 'task')} assigned to you are done. Nice work!`,
      actions: [go('Open My Tasks', routes.tasks)],
    }
  }

  /* Today's meetings */
  if (/today|tonight/.test(q)) {
    if (!currentUser) {
      return {
        text:
          'I cannot check your meetings because your current user could not be identified.',
        actions: [go('Open calendar', routes.calendar)],
      }
    }

    const today = list.filter((meeting) =>
      sameDay(meeting.start, now),
    )

    return {
      text: today.length
        ? `You have ${plural(today.length, 'meeting')} today:\n${today
            .map(
              (meeting) =>
                `• ${time(meeting.start)} – ${
                  meeting.title || 'Untitled meeting'
                }`,
            )
            .join('\n')}`
        : 'You have no meetings today.',
      actions: [go('Open calendar', routes.calendar)],
    }
  }

  /* Next / upcoming meetings */
  if (/next|upcoming|coming up|soon/.test(q)) {
    if (!currentUser) {
      return {
        text:
          'I cannot check your meetings because your current user could not be identified.',
        actions: [go('Open calendar', routes.calendar)],
      }
    }

    const upcoming = list
      .filter((meeting) => startOf(meeting) > nowMs)
      .slice(0, 3)

    if (!upcoming.length) {
      return {
        text: 'You have no upcoming meetings.',
        actions: [go('Open calendar', routes.calendar)],
      }
    }

    const [first, ...rest] = upcoming

    const more = rest.length
      ? `\n\nAfter that:\n${rest
          .map(
            (meeting) =>
              `• ${day(meeting.start)}, ${time(meeting.start)} – ${
                meeting.title || 'Untitled meeting'
              }`,
          )
          .join('\n')}`
      : ''

    return {
      text:
        `Your next meeting is “${first.title || 'Untitled meeting'}” ` +
        `on ${day(first.start)} at ${time(first.start)}, ` +
        `in ${formatIn(startOf(first) - nowMs)}.${more}`,
      actions: [
        ...(first.id
          ? [go('Open meeting', routes.meeting(first.id))]
          : []),
        go('Open calendar', routes.calendar),
      ],
    }
  }

  /* Recordings / transcripts */
  if (/record|transcript|past meeting|completed|watch/.test(q)) {
    const recorded = list
      .filter(
        (meeting) =>
          meeting.recording?.available ||
          meeting.transcript?.available,
      )
      .reverse()
      .slice(0, 3)

    return {
      text: recorded.length
        ? `Your latest meetings with a recording or transcript:\n${recorded
            .map(
              (meeting) =>
                `• ${day(meeting.start)} – ${
                  meeting.title || 'Untitled meeting'
                }`,
            )
            .join('\n')}`
        : 'No recordings or transcripts are available yet.',
      actions: [
        ...(recorded[0]?.id
          ? [
              go(
                'Open latest recording',
                `${routes.meeting(recorded[0].id)}?tab=recording`,
              ),
            ]
          : []),
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
    text:
      "I'm not sure about that yet. Try asking about today's meetings, your next meeting, pending tasks, recordings, or how MeetAI works.",
    actions: [],
  }
}