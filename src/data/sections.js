import {
  CalendarMonth,
  CheckCircle,
  Groups,
  Mic,
  TaskAlt,
} from '@mui/icons-material'

export const HOW_IT_WORKS_SECTIONS = [
  {
    id: 'calendar',
    title: 'Your calendar',
    icon: CalendarMonth,
    description:
      'See your meetings clearly and move between day, week, and month views.',
    steps: [
      'Use the date selector to quickly move to Today, Yesterday, or Tomorrow.',
      'Switch between Day, Week, and Month views.',
      'Use the arrows to move forward or backward.',
      'Filter meetings by All, Live, Upcoming, or Done.',
    ],
  },
  {
    id: 'meetings',
    title: 'Meetings',
    icon: Groups,
    description:
      'Keep everything about a meeting together in one simple place.',
    steps: [
      'Open a meeting to see its participants and details.',
      'Join the meeting using its meeting link.',
      'Review meeting notes after the meeting.',
    ],
  },
  {
    id: 'meetai',
    title: 'MeetAI',
    icon: Mic,
    description:
      'Invite MeetAI when you want help recording and understanding your meetings.',
    steps: [
      'Turn on Invite MeetAI when creating or managing a meeting.',
      'Video recording can be enabled from the same settings.',
      'After the meeting, available recordings and notes can be reviewed.',
    ],
  },
  {
    id: 'tasks',
    title: 'Action items',
    icon: TaskAlt,
    description:
      'Keep track of tasks that come out of your meetings.',
    steps: [
      'Review action items created from meetings.',
      'See which items are still pending.',
      'Use the task view to stay on top of follow-ups.',
    ],
  },
  {
    id: 'done',
    title: 'Completed meetings',
    icon: CheckCircle,
    description:
      'Find completed meetings and review what happened.',
    steps: [
      'Open completed meetings from the recorded meetings area.',
      'Review available recordings and meeting notes.',
      'Check attendance and action items when available.',
    ],
  },
]