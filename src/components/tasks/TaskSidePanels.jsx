import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'

import { normalizeTaskPriority } from '../../data/tasks'
import { D, linkSx, sectionHeadSx, serif, titleSx } from '../dashboard/dashTheme'
import { getDueLabel } from './taskHelpers'

const arrow = <ArrowOutwardRoundedIcon sx={{ fontSize: '12px !important' }} />

function Stat({ label, value }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: `1px solid ${D.line}` }}>
      <Typography sx={{ fontSize: '.8125rem', color: D.text }}>{label}</Typography>
      <Typography sx={{ fontSize: '.8125rem', fontWeight: 600, color: D.navy }}>{value}</Typography>
    </Box>
  )
}

export default function TaskSidePanels({
  focusTasks,
  filterCounts,
  progress,
  highPriority,
  dueSoon,
  onMarkDone,
  onViewToday,
  onViewAll,
}) {
  return (
    <>
      {/* Today's focus */}
      <Box component="section" aria-label="Today's focus">
        <Box sx={{ ...sectionHeadSx, borderTop: 'none', mt: 0, pt: 0, alignItems: 'center' }}>
          <Typography component="h2" sx={titleSx}>
            Today&rsquo;s focus
          </Typography>
          <Button sx={linkSx} endIcon={arrow} onClick={onViewToday}>
            View today
          </Button>
        </Box>

        {focusTasks.length === 0 ? (
          <Typography sx={{ mt: 1.5, fontSize: '.8125rem', color: D.text }}>Nothing is overdue or due today.</Typography>
        ) : (
          <Box component="ul" sx={{ m: 0, mt: 1, p: 0, listStyle: 'none' }}>
            {focusTasks.map((task) => (
              <Box component="li" key={task.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: 0.75 }}>
                <Checkbox
                  size="small"
                  checked={false}
                  onChange={() => onMarkDone(task.id)}
                  slotProps={{ input: { 'aria-label': `Mark "${task.title}" as done` } }}
                  sx={{ p: 0, mt: 0.25, color: D.navy, '&.Mui-focusVisible': { outline: `2px solid ${D.navy}` } }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '.875rem', color: D.navy, lineHeight: 1.3 }}>{task.title}</Typography>
                  <Typography noWrap sx={{ fontSize: '.6875rem', color: D.muted }}>
                    {task.meetingTitle || 'Meeting action item'}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    flexShrink: 0,
                    fontSize: '.6875rem',
                    fontWeight: normalizeTaskPriority(task.priority) === 'High' ? 700 : 400,
                    color: normalizeTaskPriority(task.priority) === 'High' ? D.navy : D.muted,
                  }}
                >
                  {normalizeTaskPriority(task.priority) === 'High' && 'High · '}
                  {getDueLabel(task.due)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Progress and Workload sit side by side */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: 2, alignItems: 'start' }}>
        <Box component="section" aria-label="Progress" sx={{ minWidth: 0 }}>
          <Box sx={sectionHeadSx}>
            <Typography component="h2" sx={titleSx}>
              Progress
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mt: 1.5 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              {/* Grey ring underneath, green progress on top */}
              <CircularProgress variant="determinate" value={100} size={88} thickness={4} sx={{ color: D.line }} />
              <CircularProgress
                variant="determinate"
                value={progress}
                size={88}
                thickness={4}
                aria-label="Tasks completed"
                sx={{ position: 'absolute', left: 0, color: D.green, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
              />
              <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <Typography sx={{ fontFamily: serif, fontSize: '1.7rem', lineHeight: 1, color: D.navy }}>{progress}%</Typography>
              </Box>
            </Box>

            <Typography sx={{ textAlign: 'center', fontSize: '.8125rem', lineHeight: 1.4, color: D.text }}>
              of your tasks are done
            </Typography>
          </Box>
        </Box>

        <Box component="section" aria-label="Workload" sx={{ minWidth: 0 }}>
          <Box sx={sectionHeadSx}>
            <Typography component="h2" sx={titleSx}>
              Workload
            </Typography>
          </Box>

          <Box sx={{ mt: 1 }}>
            <Stat label="Open tasks" value={filterCounts.Open} />
            <Stat label="High priority" value={highPriority} />
            <Stat label="Due this week" value={dueSoon} />
          </Box>

          <Button sx={{ ...linkSx, mt: 1 }} endIcon={arrow} onClick={onViewAll}>
            View all open
          </Button>
        </Box>
      </Box>
    </>
  )
}