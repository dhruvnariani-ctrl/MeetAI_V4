import {
  CALENDAR_PAGE_TOUR_STEPS,
  DASHBOARD_PAGE_TOUR_STEPS,
  MEETING_DETAILS_PAGE_TOUR_STEPS,
  RECORDED_PAGE_TOUR_STEPS,
  TASKS_PAGE_TOUR_STEPS,
} from './tours'

/* One card per page in "Want to learn just one thing?" on the How It Works page. */
export const PAGE_TOURS = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'See today’s meetings, what is live now and the tasks due today.',
    steps: DASHBOARD_PAGE_TOUR_STEPS,
  },
  {
    id: 'calendar',
    title: 'Calendar',
    description: 'Find meetings, change the view, filter them and schedule new ones.',
    steps: CALENDAR_PAGE_TOUR_STEPS,
  },
  {
    id: 'recorded',
    title: 'Recorded Meetings',
    description: 'Find past meetings and open their recordings, transcripts and notes.',
    steps: RECORDED_PAGE_TOUR_STEPS,
  },
  {
    id: 'meeting-details',
    title: 'Meeting Details',
    description: 'See participants, meeting information, recordings and summaries.',
    steps: MEETING_DETAILS_PAGE_TOUR_STEPS,
  },
  {
    id: 'tasks',
    title: 'My Tasks',
    description: 'Find your action items, check their status and mark work as done.',
    steps: TASKS_PAGE_TOUR_STEPS,
  },
]