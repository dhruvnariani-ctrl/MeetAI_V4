import { CURRENT_USER } from './User'

const MIN = 60000
const TASK_STATUS_STORAGE_KEY = 'meetai-task-status-overrides'

function readTaskStatusOverrides() {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(
      TASK_STATUS_STORAGE_KEY,
    )

    if (!raw) return {}

    const parsed = JSON.parse(raw)

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed)
    ) {
      return {}
    }

    return parsed
  } catch {
    return {}
  }
}

function writeTaskStatusOverrides(overrides) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(
      TASK_STATUS_STORAGE_KEY,
      JSON.stringify(overrides),
    )
  } catch {
    // Ignore storage errors so meeting data still works.
  }
}

function applyTaskStatusOverrides(meetings) {
  const overrides = readTaskStatusOverrides()

  return meetings.map((meeting) => ({
    ...meeting,
    actionItems: Array.isArray(meeting.actionItems)
      ? meeting.actionItems.map((item) => {
          const override =
            overrides[meeting.id]?.[item.id]

          return override
            ? {
                ...item,
                status: override.status,
              }
            : item
        })
      : meeting.actionItems,
  }))
}

export function updateMeetingActionItemStatus(
  meetingId,
  actionItemId,
  status,
) {
  if (!meetingId || !actionItemId || !status) {
    return
  }

  const current = readTaskStatusOverrides()

  const meetingOverrides =
    current[meetingId] ?? {}

  const next = {
    ...current,
    [meetingId]: {
      ...meetingOverrides,
      [actionItemId]: {
        status,
      },
    },
  }

  writeTaskStatusOverrides(next)
}
const PEOPLE = [
  {
    name: 'Aarav Mehta',
    email: 'aarav.mehta@avaada.com',
  },
  {
    name: 'Ananya Rao',
    email: 'ananya.rao@avaada.com',
  },
  {
    name: 'Karan Malhotra',
    email: 'karan.malhotra@avaada.com',
  },
  {
    name: 'Meera Iyer',
    email: 'meera.iyer@avaada.com',
  },
  {
    name: 'Rohan Desai',
    email: 'rohan.desai@avaada.com',
  },
  {
    name: 'Sneha Kulkarni',
    email: 'sneha.kulkarni@avaada.com',
  },
]

/*
 * ============================================================================
 * MeetAI TEST DATA
 * ============================================================================
 *
 * This file is the single source of meeting data for the application.
 *
 * The data intentionally contains different combinations so every feature
 * can be tested:
 *
 * - Done meetings
 * - Live meetings
 * - Upcoming meetings
 * - MeetAI invited
 * - MeetAI not invited
 * - Recording available
 * - Recording unavailable
 * - Transcript available
 * - Transcript unavailable
 * - Meeting summaries
 * - Action items
 * - Different task priorities
 * - Different task statuses
 * - Different due dates
 * - Yesterday / Today / Tomorrow
 *
 * IMPORTANT:
 *
 * The meeting times are generated relative to the current time.
 * This means the dataset remains useful regardless of what time the app
 * is opened.
 * ============================================================================
 */

function buildMeetings(now = new Date()) {
  const t = new Date(now)

  t.setSeconds(0, 0)

  const at = (offsetMin) =>
    new Date(
      t.getTime() + offsetMin * MIN,
    )

  const me = {
    ...CURRENT_USER,
  }

  return [
    /*
     * ========================================================================
     * M10 — OLD PROJECT REVIEW
     * ========================================================================
     *
     * Yesterday
     *
     * Used for:
     * - Calendar previous day
     * - Calendar week/month
     * - Recorded Meetings
     * - Meeting Details
     */
    {
      id: 'm10',

      title: 'Old project review',

      start: at(-24 * 60 - 90),
      end: at(-24 * 60 - 60),

      platform: 'Microsoft Teams',

      link:
        'https://teams.microsoft.com/l/meetup-join/old-project',

      participants: [
        {
          ...me,
          attended: true,
        },
        {
          ...PEOPLE[0],
          attended: true,
        },
        {
          ...PEOPLE[4],
          attended: true,
        },
      ],

      meetAI: {
        invited: true,
        attended: true,
        recordVideo: true,
      },

      recording: {
        available: true,
        duration: '30 min',
      },

      transcript: {
        available: true,
        text:
          'The team reviewed the previous project results.\n\n' +
          'The team discussed lessons learned.\n\n' +
          'The team agreed on improvements for the next project.',
      },

      meetingSummary:
        'The team reviewed the previous project, discussed lessons learned, and agreed on improvements for the next project.',

      actionItems: [
        {
          id: 'm10-a1',
          title:
            'Document the lessons learned',
          owner: 'Dhruv Nariani',
          due: at(24 * 60 + 120),
          priority: 'Low',
          status: 'Done',
        },
      ],

      attendanceDetails: {
        [me.email]: {
          joinedAt: at(-24 * 60 - 89),
          leftAt: at(-24 * 60 - 60),
        },

        [PEOPLE[0].email]: {
          joinedAt: at(-24 * 60 - 87),
          leftAt: at(-24 * 60 - 62),
        },
      },
    },

    /*
     * ========================================================================
     * M1 — WEEKLY DESIGN REVIEW
     * ========================================================================
     *
     * Done
     * MeetAI ON
     * Recording ON
     * Transcript ON
     * Summary ON
     */
    {
      id: 'm1',

      title: 'Weekly design review',

      start: at(-240),
      end: at(-210),

      platform: 'Google Meet',

      link:
        'https://meet.google.com/abc-defg-hij',

      participants: [
        {
          ...me,
          attended: true,
        },
        {
          ...PEOPLE[0],
          attended: true,
        },
        {
          ...PEOPLE[1],
          attended: false,
        },
      ],

      meetAI: {
        invited: true,
        attended: true,
        recordVideo: true,
      },

      recording: {
        available: true,
        duration: '30 min',
      },

      transcript: {
        available: true,

        text:
          '12:01 PM — The team reviewed the current design progress.\n\n' +
          '12:10 PM — The team discussed the remaining design changes.\n\n' +
          '12:20 PM — The team agreed on the next steps.\n\n' +
          '12:28 PM — Final questions were discussed.\n\n' +
          '12:31 PM — Meeting ended.',
      },

      meetingSummary:
        'The team reviewed the current design progress, discussed the remaining changes, and agreed on the next steps for the design work.',

      actionItems: [
        {
          id: 'm1-a1',
          title:
            'Review the revised design',
          owner: 'Dhruv Nariani',
          due: at(60),
          priority: 'High',
          status: 'Pending',
        },
        {
          id: 'm1-a2',
          title:
            'Share the updated design with the team',
          owner: 'Aarav Mehta',
          due: at(180),
          priority: 'Medium',
          status: 'In Process',
        },
      ],

      attendanceDetails: {
        [me.email]: {
          joinedAt: at(-239),
          leftAt: at(-210),
        },

        [PEOPLE[0].email]: {
          joinedAt: at(-237),
          leftAt: at(-212),
        },
      },
    },

    /*
     * ========================================================================
     * M5 — LEADERSHIP REVIEW
     * ========================================================================
     *
     * Done
     * MeetAI OFF
     * No recording
     * No transcript
     * Summary available
     */
    {
      id: 'm5',

      title: 'Leadership review',

      start: at(-180),
      end: at(-150),

      platform: 'Zoom',

      link:
        'https://zoom.us/j/987654321',

      participants: [
        {
          ...me,
          attended: true,
        },
        {
          ...PEOPLE[2],
          attended: true,
        },
        {
          ...PEOPLE[3],
          attended: true,
        },
      ],

      meetAI: {
        invited: false,
        attended: false,
        recordVideo: false,
      },

      recording: {
        available: false,
        duration: null,
      },

      transcript: {
        available: false,
        text: null,
      },

      meetingSummary:
        'Leadership reviewed the current business priorities and discussed the next quarter objectives.',

      actionItems: [
        {
          id: 'm5-a1',
          title:
            'Prepare next quarter priorities',
          owner: 'Dhruv Nariani',
          due: at(24 * 60),
          priority: 'High',
          status: 'Blocked',
        },
        {
          id: 'm5-a2',
          title:
            'Send leadership summary',
          owner: 'Meera Iyer',
          due: at(24 * 60 + 180),
          priority: 'Medium',
          status: 'Pending',
        },
      ],

      attendanceDetails: {
        [me.email]: {
          joinedAt: at(-179),
          leftAt: at(-150),
        },
      },
    },

    /*
     * ========================================================================
     * M7 — SALES FOLLOW-UP
     * ========================================================================
     *
     * Done
     * MeetAI ON
     * Recording ON
     * Transcript OFF
     * Summary ON
     */
    {
      id: 'm22',

      title: 'Sales follow-up',

      start: at(-120),
      end: at(-90),

      platform: 'Google Meet',

      link:
        'https://meet.google.com/sales-followup',

      participants: [
        {
          ...me,
          attended: true,
        },
        {
          ...PEOPLE[4],
          attended: true,
        },
        {
          ...PEOPLE[5],
          attended: true,
        },
      ],

      meetAI: {
        invited: true,
        attended: true,
        recordVideo: true,
      },

      recording: {
        available: true,
        duration: '30 min',
      },

      transcript: {
        available: false,
        text: null,
      },

      meetingSummary:
        'The sales team reviewed the customer follow-up plan and agreed on the next communication steps.',

      actionItems: [
        {
          id: 'm7-a1',
          title:
            'Send the customer follow-up email',
          owner: 'Dhruv Nariani',
          due: at(120),
          priority: 'High',
          status: 'Done',
        },
      ],

      attendanceDetails: {
        [me.email]: {
          joinedAt: at(-119),
          leftAt: at(-90),
        },
      },
    },

    /*
     * ========================================================================
     * M8 — INTERVIEW
     * ========================================================================
     *
     * Done
     * MeetAI OFF
     * No recording
     * No transcript
     * Summary available
     */
    {
      id: 'm8',

      title: 'Candidate interview',

      start: at(-60),
      end: at(-30),

      platform: 'Microsoft Teams',

      link:
        'https://teams.microsoft.com/l/meetup-join/interview',

      participants: [
        {
          ...me,
          attended: true,
        },
        {
          ...PEOPLE[5],
          attended: true,
        },
      ],

      meetAI: {
        invited: false,
        attended: false,
        recordVideo: false,
      },

      recording: {
        available: false,
        duration: null,
      },

      transcript: {
        available: false,
        text: null,
      },

      meetingSummary:
        'The interview covered the candidate background, previous experience, and role expectations.',

      actionItems: [
        {
          id: 'm8-a1',
          title:
            'Share interview feedback',
          owner: 'Dhruv Nariani',
          due: at(180),
          priority: 'Low',
          status: 'In Process',
        },
      ],

      attendanceDetails: {
        [me.email]: {
          joinedAt: at(-59),
          leftAt: at(-30),
        },
      },
    },

    /*
     * ========================================================================
     * M2 — SPRINT PLANNING
     * ========================================================================
     *
     * Live
     * MeetAI ON
     * Recording enabled
     */
    {
      id: 'm2',

      title: 'Sprint planning',

      start: at(-10),
      end: at(50),

      platform: 'Microsoft Teams',

      link:
        'https://teams.microsoft.com/l/meetup-join/sample',

      participants: [
        {
          ...me,
          attended: null,
        },
        {
          ...PEOPLE[0],
          attended: null,
        },
        {
          ...PEOPLE[2],
          attended: null,
        },
        {
          ...PEOPLE[3],
          attended: null,
        },
        {
          ...PEOPLE[4],
          attended: null,
        },
      ],

      meetAI: {
        invited: true,
        attended: true,
        recordVideo: true,
      },

      recording: {
        available: false,
        duration: null,
      },

      transcript: {
        available: false,
        text: null,
      },

      meetingSummary: null,

      actionItems: [
        {
          id: 'm2-a1',
          title:
            'Finalize sprint priorities',
          owner: 'Dhruv Nariani',
          due: at(120),
          priority: 'High',
          status: 'In Process',
        },
        {
          id: 'm2-a2',
          title:
            'Update sprint board',
          owner: 'Karan Malhotra',
          due: at(240),
          priority: 'Medium',
          status: 'Pending',
        },
      ],

      attendanceDetails: {},
    },

    /*
     * ========================================================================
     * M3 — CUSTOMER SYNC
     * ========================================================================
     *
     * Upcoming
     * MeetAI ON
     * Recording OFF
     */
    {
      id: 'm3',

      title: 'Customer sync',

      start: at(60),
      end: at(90),

      platform: 'Zoom',

      link:
        'https://zoom.us/j/123456789',

      participants: [
        {
          ...me,
          attended: null,
        },
        {
          ...PEOPLE[1],
          attended: null,
        },
        {
          ...PEOPLE[4],
          attended: null,
        },
      ],

      meetAI: {
        invited: true,
        attended: false,
        recordVideo: false,
      },

      recording: {
        available: false,
        duration: null,
      },

      transcript: {
        available: false,
        text: null,
      },

      meetingSummary: null,

      actionItems: [
        {
          id: 'm3-a1',
          title:
            'Prepare customer questions',
          owner: 'Dhruv Nariani',
          due: at(30),
          priority: 'Medium',
          status: 'Pending',
        },
      ],

      attendanceDetails: {},
    },

    /*
     * ========================================================================
     * M4 — PRODUCT DEMO
     * ========================================================================
     *
     * Upcoming
     * MeetAI OFF
     */
    {
      id: 'm4',

      title: 'Product demo',

      start: at(150),
      end: at(180),

      platform: 'Google Meet',

      link:
        'https://meet.google.com/product-demo',

      participants: [
        {
          ...me,
          attended: null,
        },
        {
          ...PEOPLE[3],
          attended: null,
        },
        {
          ...PEOPLE[5],
          attended: null,
        },
      ],

      meetAI: {
        invited: false,
        attended: false,
        recordVideo: false,
      },

      recording: {
        available: false,
        duration: null,
      },

      transcript: {
        available: false,
        text: null,
      },

      meetingSummary: null,

      actionItems: [
        {
          id: 'm4-a1',
          title:
            'Prepare product demonstration',
          owner: 'Dhruv Nariani',
          due: at(90),
          priority: 'High',
          status: 'Pending',
        },
      ],

      attendanceDetails: {},
    },

    /*
     * ========================================================================
     * M6 — ENGINEERING STANDUP
     * ========================================================================
     *
     * Upcoming
     * MeetAI OFF
     *
     * Contains a BLOCKED task for My Tasks testing.
     */
    {
      id: 'm6',

      title: 'Engineering standup',

      start: at(240),
      end: at(270),

      platform: 'Microsoft Teams',

      link:
        'https://teams.microsoft.com/l/meetup-join/standup',

      participants: [
        {
          ...me,
          attended: null,
        },
        {
          ...PEOPLE[0],
          attended: null,
        },
        {
          ...PEOPLE[2],
          attended: null,
        },
        {
          ...PEOPLE[5],
          attended: null,
        },
      ],

      meetAI: {
        invited: false,
        attended: false,
        recordVideo: false,
      },

      recording: {
        available: false,
        duration: null,
      },

      transcript: {
        available: false,
        text: null,
      },

      meetingSummary: null,

      actionItems: [
        {
          id: 'm6-a1',
          title:
            'Resolve the deployment blocker',
          owner: 'Dhruv Nariani',
          due: at(300),
          priority: 'High',
          status: 'Blocked',
        },
        {
          id: 'm6-a2',
          title:
            'Review the engineering checklist',
          owner: 'Sneha Kulkarni',
          due: at(360),
          priority: 'Low',
          status: 'Pending',
        },
      ],

      attendanceDetails: {},
    },

    /*
     * ========================================================================
     * M9 — TOMORROW PLANNING
     * ========================================================================
     *
     * Tomorrow
     *
     * Used for:
     * - Calendar Tomorrow
     * - Calendar Week
     * - Calendar Month
     * - Future navigation
     */
    {
      id: 'm9',

      title: 'Tomorrow planning',

      start: at(24 * 60 + 60),
      end: at(24 * 60 + 90),

      platform: 'Google Meet',

      link:
        'https://meet.google.com/tomorrow-planning',

      participants: [
        {
          ...me,
          attended: null,
        },
        {
          ...PEOPLE[2],
          attended: null,
        },
        {
          ...PEOPLE[4],
          attended: null,
        },
      ],

      meetAI: {
        invited: false,
        attended: false,
        recordVideo: false,
      },

      recording: {
        available: false,
        duration: null,
      },

      transcript: {
        available: false,
        text: null,
      },

      meetingSummary: null,

      actionItems: [
        {
          id: 'm9-a1',
          title:
            'Prepare tomorrow planning notes',
          owner: 'Dhruv Nariani',
          due: at(24 * 60),
          priority: 'Medium',
          status: 'Pending',
        },
      ],

      attendanceDetails: {},
    },
    {
  id: 'm7',

  title: 'Aarav and Meera project review',

  start: at(300),
  end: at(330),

  owner: {
    name: 'Aarav Mehta',
    email: 'aarav@avaada.com',
  },

  platform: 'Google Meet',

  link:
    'https://meet.google.com/project-review',

  participants: [
    {
      ...PEOPLE[1],
      attended: null,
    },
    {
      ...PEOPLE[3],
      attended: null,
    },
    {
      ...PEOPLE[4],
      attended: null,
    },
  ],

  meetAI: {
    invited: false,
    attended: false,
    recordVideo: false,
  },

  recording: {
    available: false,
    duration: null,
  },

  transcript: {
    available: false,
    text: null,
  },

  meetingSummary: null,

  actionItems: [
    {
      id: 'm7-a1',
      title: 'Review project milestones',
      owner: 'Aarav Mehta',
      due: at(360),
      priority: 'Medium',
      status: 'Pending',
    },
  ],

  attendanceDetails: {},
},
  ]
}

/*
 * ============================================================================
 * ALL MEETINGS
 * ============================================================================
 *
 * This is the complete dataset.
 *
 * Calendar and Recorded Meetings can use this function so they can show:
 *
 * - yesterday
 * - today
 * - tomorrow
 * - week
 * - month
 */
export function getAllMeetings(
  now = new Date(),
) {
  return applyTaskStatusOverrides(
    buildMeetings(now),
  )
}

/*
 * ============================================================================
 * TODAY'S MEETINGS
 * ============================================================================
 *
 * Existing Dashboard / My Tasks code already uses this function.
 *
 * Keep this export so existing components continue to work.
 */
export function getTodaysMeetings(
  now = new Date(),
) {
  const today = new Date(now)

  today.setHours(
    0,
    0,
    0,
    0,
  )

  const tomorrow = new Date(today)

  tomorrow.setDate(
    tomorrow.getDate() + 1,
  )

    return getAllMeetings(now).filter(
  (meeting) => {
      const start = new Date(
        meeting.start,
      )

      return (
        start >= today &&
        start < tomorrow
      )
    },
  )
}

/*
 * ============================================================================
 * OPTIONAL HELPERS
 * ============================================================================
 *
 * These are useful for other pages that need the shared meeting dataset.
 */

/**
 * Find a meeting by ID.
 */
export function getMeetingById(
  meetingId,
  now = new Date(),
) {
  return getAllMeetings(now).find(
    (meeting) =>
      String(meeting.id) ===
      String(meetingId),
  )
}

/**
 * Get meetings for a specific calendar date.
 */
export function getMeetingsForDate(
  date,
  now = new Date(),
) {
  const target = new Date(date)

  target.setHours(
    0,
    0,
    0,
    0,
  )

  const nextDay = new Date(target)

  nextDay.setDate(
    nextDay.getDate() + 1,
  )

  return getAllMeetings(now).filter(
    (meeting) => {
      const start = new Date(
        meeting.start,
      )

      return (
        start >= target &&
        start < nextDay
      )
    },
  )
}