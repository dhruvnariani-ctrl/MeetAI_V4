import { TASK_FILTERS } from '../../data/tasks'

export const COLORS = {
  navy: '#123A59',
  blue: '#0967B2',
  green: '#16815B',
  text: '#304858',
  muted: '#5A7189',
  border: '#DCE6EE',
  background: '#F5F8FA',
  paleBlue: '#EFF6FB',
  paleGreen: '#EAF6F0',
  paleRed: '#FCECEF',
  paleOrange: '#FFF3E4',
  white: '#FFFFFF',
}

export const STATUS_COLORS = {
  Done: { color: '#16815B', background: '#E8F5ED', dot: '#16815B' },
  'In Process': { color: '#0967B2', background: '#E8F3FC', dot: '#398FCB' },
  Pending: { color: '#0967B2', background: '#EAF3FC', dot: '#87A5BC' },
  Blocked: { color: '#C83E4D', background: '#FCECEF', dot: '#D94755' },
}

export const PRIORITY_COLORS = {
  High: { color: '#C83E4D', background: '#FCECEF' },
  Medium: { color: '#B66B0A', background: '#FFF3E1' },
  Low: { color: '#587286', background: '#EDF3F7' },
}

/* TASK_FILTERS lives in data/tasks.js; the page adds "Open" after "All". */
export const STATUS_FILTERS = [
  TASK_FILTERS[0],
  'Open',
  ...TASK_FILTERS.slice(1),
]

/* Statuses shown in the progress card, in display order. */
export const PROGRESS_STATUSES = ['Done', 'In Process', 'Pending', 'Blocked']

export const DUE_DATE_FILTERS = [
  { value: 'default', label: 'All dates' },
  { value: 'today', label: 'Due today' },
  { value: 'week', label: 'This week' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'none', label: 'No due date' },
]

export const CARD_SX = {
  minWidth: 0,
  p: 1.75,
  border: `1px solid ${COLORS.border}`,
  borderRadius: '12px',
  backgroundColor: COLORS.white,
}
