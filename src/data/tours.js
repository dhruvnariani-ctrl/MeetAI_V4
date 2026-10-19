import { getAllMeetings } from './meetings'

const FIRST_MEETING_ID = getAllMeetings()[0]?.id ?? ''

const tour = (name) => `[data-tour="${name}"]`

/*
 * One tour step. `path` is the page it lives on (the runner navigates there),
 * `target` is a CSS selector, and the optional `click` selector is clicked once
 * when the step opens (for example to expand a task). Steps whose target is not
 * on screen, such as "MeetAI switches" when no meeting is live, are skipped.
 */
const step = (path, target, title, body, action, tip, extra) => ({ path, target, title, body, action, tip, ...extra })

/* ---------- Everywhere: top bar and footer ---------- */
const GLOBAL_STEPS = [
  step('/', tour('sidebar-navigation'), 'Your main pages',
    'Use the menu at the top to move between Dashboard, Calendar, Recorded Meetings and My Tasks.',
    'Select a page name to open it.',
    'The page you are on is underlined.'),
  step('/', tour('header-search'), 'Search your meetings',
    'Find a meeting by its title, platform or participants.',
    'Type a meeting name or a person to see matching meetings.',
    'Select a result to open that meeting’s details page.'),
  step('/', 'button[aria-label="Ask your Companion"]', 'Ask your Companion',
    'The Companion answers questions about your meetings, tasks and recordings.',
    'Select it and try one of the suggested questions.',
    'Suggested questions are listed at the bottom of the chat.'),
  step('/', '#account-menu-button', 'Your account',
    'Open this menu to restart the app tour or read the How It Works guide.',
    'Select your name to see the options.',
    'You can run this tour again at any time.'),
  step('/', tour('sidebar-controls'), 'Refresh and help',
    'Select the “Calendar updated” time to refresh your meetings, or open Help for the How It Works guide.',
    'Try Help when you want a reminder of how a page works.'),
]

/* ---------- Dashboard ---------- */
export const DASHBOARD_PAGE_TOUR_STEPS = [
  step('/', tour('dashboard-welcome'), 'Your day at a glance',
    'The greeting summarises today: how many meetings are done, which one is live, and how many are still to come.',
    'Read the summary under your name.'),
  step('/', tour('dashboard-new-meeting'), 'Quick actions',
    'Join with a link lets MeetAI join a meeting you already have a link for. Schedule a Meeting opens the event form.',
    'Select Join with a link when you need MeetAI in a meeting right away.',
    'Both open a form, and nothing is saved until you submit it.'),
  step('/', tour('dashboard-todays-meetings'), 'Today’s meetings',
    'Done meetings are listed first, then a line marks the time now, then the live meeting and what is coming up.',
    'Select a meeting to open its details.',
    'Select “Notes” on a finished meeting to jump straight to it.'),
  step('/', tour('dashboard-meetai-status'), 'MeetAI switches',
    'Invite MeetAI and Video recording can be turned on or off for each meeting that has not finished.',
    'Select a switch to open that meeting’s MeetAI settings.',
    'MeetAI is optional. You decide per meeting.'),
  step('/', tour('dashboard-action-items'), 'Your To-Do List',
    'Action items from your meetings that are due today. Tick one to mark it done.',
    'Tick a task, then confirm.',
    'Select “See all tasks” to open My Tasks.'),
]

/* ---------- Calendar ---------- */
export const CALENDAR_PAGE_TOUR_STEPS = [
  step('/calendar', tour('calendar-date-menu'), 'Choose a date',
    'Use the arrows to move one day, week or month, and this button to jump to Today, Yesterday or Tomorrow.',
    'Open the date menu and pick a date.'),
  step('/calendar', tour('calendar-view'), 'Change your view',
    'Choose Day, Week or Month depending on how much of your schedule you want to see.',
    'Try switching between the views.',
    'Week and Month group your meetings under each day.'),
  step('/calendar', tour('calendar-filters-button'), 'Filter meetings',
    'Narrow the list by platform, MeetAI invited, or meetings you host.',
    'Open Filters and tick an option.',
    'The number on the button shows how many filters are on.'),
  step('/calendar', tour('new-meeting'), 'Schedule a meeting',
    'Schedule a Meeting opens the form for the title, time, platform, participants and MeetAI.',
    'Select it to see the form.',
    'The summary on the right updates as you type.'),
  step('/calendar', tour('calendar-days'), 'The week at a glance',
    'Each card is one day of the week and shows how many meetings it has. Select a day to open it.',
    'Select a day.',
    'Days with no meetings say Free. This strip appears in Day and Week view.'),
  step('/calendar', tour('calendar-schedule'), 'Your schedule',
    'Day view is an hour-by-hour timeline, Week view has one column per day, and Month view is a full grid. The status buttons filter by Live, Upcoming or Done.',
    'In Day view, select a meeting to see it on the right.',
    'In the Day view panel you can switch Invite MeetAI and Video recording for that meeting.'),
]

/* ---------- Recorded Meetings ---------- */
export const RECORDED_PAGE_TOUR_STEPS = [
  step('/recorded', tour('recorded-filters'), 'Filter by date',
    'Show all recordings, or only today, this week or this month.',
    'Select a date range.'),
  step('/recorded', tour('recorded-sort'), 'Sort your recordings',
    'Order recordings by newest, oldest or meeting title.',
    'Open Sort and pick an option.'),
  step('/recorded', tour('recorded-meeting-list'), 'Meeting archive',
    'Each row shows the date, title, platform, participants and whether a recording is ready. Select one to see its content on the right.',
    'Select a meeting.',
    'Use Recording, Transcript and Meeting notes on the right to open that part of the meeting.'),
]

/* ---------- Meeting Details ---------- */
const DETAILS = `/meetings/${FIRST_MEETING_ID}`

export const MEETING_DETAILS_PAGE_TOUR_STEPS = [
  step(DETAILS, tour('meeting-header'), 'Meeting details',
    'The header gives you the basics: title, time, platform and status.',
    'Read the meeting information.'),
  step(DETAILS, tour('meeting-participants'), 'Participants',
    'See who was invited and, when available, who attended.',
    'Review the participants.'),
  step(DETAILS, tour('meeting-content'), 'Meeting content',
    'The summary, recording, transcript and action items appear here once a meeting has finished.',
    'Look through the available content.',
    'Upcoming meetings have little content until they are done.'),
]

/* ---------- My Tasks ---------- */
export const TASKS_PAGE_TOUR_STEPS = [
  step('/tasks', tour('tasks-filters'), 'Filter your tasks',
    'Switch between All, Open, Pending, In Process, Blocked and Done. The number shows how many tasks are in each.',
    'Select a status.'),
  step('/tasks', tour('tasks-sort'), 'Sort your tasks',
    'Order tasks by your own order, due date or priority.',
    'Open Sort and review the options.',
    'Sort by due date to see what is coming first.'),
  step('/tasks', tour('task-card'), 'Review a task',
    'Each task is an action item from a meeting. Select a task to open its details.',
    'Select the first task.'),
  step('/tasks', tour('task-details'), 'Priority and due date',
    'Every task shows its priority, and its due date on the left.',
    'Look at the priority and due date.'),
  step('/tasks', tour('task-status'), 'Task status',
    'The status tells you whether the task is Pending, In Process, Blocked or Done.',
    'Check the status of the first task.'),
  step('/tasks', tour('mark-task-done'), 'Mark a task as done',
    'When the work is finished, use Mark as done and confirm.',
    'Use it once the task is complete.',
    'Done tasks no longer show this button.',
    { click: `${tour('task-card')} [aria-expanded="false"]` }),
]

/* ---------- Guide ---------- */
const GUIDE_STEPS = [
  step('/how-it-works', 'main h1', 'How It Works',
    'A short guide to every part of MeetAI. You can come back to it from Help or from your account menu.',
    'Read it whenever you need a reminder.',
    'You can also start a tour of just one page from here.'),
]

/* The full tour: top bar, then every page in order. */
export const APP_TOUR_STEPS = [
  ...GLOBAL_STEPS,
  ...DASHBOARD_PAGE_TOUR_STEPS,
  ...CALENDAR_PAGE_TOUR_STEPS,
  ...RECORDED_PAGE_TOUR_STEPS,
  ...MEETING_DETAILS_PAGE_TOUR_STEPS,
  ...TASKS_PAGE_TOUR_STEPS,
  ...GUIDE_STEPS,
]