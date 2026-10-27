
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'

import { PRIORITY_ORDER, formatTime, toDate } from './dashboardUtils'
import { D, linkSx, sectionHeadSx, titleSx } from './dashTheme'

const MAX_VISIBLE = 5

const byPriority = (a, b) =>
  (PRIORITY_ORDER[a.priority] ?? 1) -
    (PRIORITY_ORDER[b.priority] ?? 1) ||
  (toDate(a.due) ?? 0) - (toDate(b.due) ?? 0)

const byTime = (a, b) =>
  (toDate(a.due) ?? 0) - (toDate(b.due) ?? 0)

export default function DashboardActionItemsCard({
  items = [],
  count = 0,
  onToggleDone,
}) {
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState('priority')

  const visible = [...items]
    .sort(sortBy === 'priority' ? byPriority : byTime)
    .slice(0, MAX_VISIBLE)

  return (
    <Box
      component="section"
      aria-label="Pending action items"
      data-tour="dashboard-action-items"
      sx={{
        minWidth: 0,
        width: '100%',
      }}
    >
      <Box
        sx={{
          ...sectionHeadSx,
          mb: 2,
          gap: 1.5,
          borderTop: 'none',
          flexWrap: 'wrap',
            pt: 0,
            mt: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography component="h2" sx={titleSx}>
            Pending Action Items
          </Typography>

          <Box
            component="span"
            aria-label={`${count} open`}
            sx={{
              minWidth: 20,
              height: 20,
              px: 0.5,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              bgcolor: '#D9E3F7',
              color: D.navy,
              fontSize: '.6875rem',
              fontWeight: 600,
            }}
          >
            {count}
          </Box>
        </Box>

        <Button
          sx={linkSx}
          endIcon={
            <ArrowOutwardRoundedIcon
              sx={{ fontSize: '12px !important' }}
            />
          }
          onClick={() => navigate('/tasks')}
        >
          See all tasks
        </Button>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 1,
          mb: 1.5,
        }}
      >
        <ButtonBase
          onClick={() =>
            setSortBy((value) =>
              value === 'priority' ? 'time' : 'priority',
            )
          }
          aria-label={`Sorted by ${sortBy}. Switch to sort by ${
            sortBy === 'priority' ? 'time' : 'priority'
          }`}
          sx={{
            gap: 0.25,
            fontSize: '.6875rem',
            color: D.muted,
            '&:focus-visible': {
              outline: `2px solid ${D.navy}`,
              outlineOffset: 2,
            },
          }}
        >
          By {sortBy}
          <ArrowDownwardRoundedIcon sx={{ fontSize: 12 }} />
        </ButtonBase>
      </Box>

      {visible.length === 0 ? (
        <Typography sx={{ py: 2, fontSize: '.8125rem', color: D.text }}>
          You’re all caught up. Nothing is due today.
        </Typography>
      ) : (
        <Box
          component="ul"
          sx={{
            m: 0,
            p: 0,
            listStyle: 'none',
          }}
        >
          {visible.map((item) => {
            const high = item.priority === 'high'
            const due = toDate(item.due)

            return (
              <Box
                component="li"
                key={item.id}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  py: 0.75,
                }}
              >
                <Checkbox
                  size="small"
                  checked={false}
                  onChange={() => onToggleDone?.(item.id)}
                  slotProps={{
                    input: {
                      'aria-label': `Mark "${item.title}" as done`,
                    },
                  }}
                  sx={{
                    p: 0,
                    mt: 0.25,
                    color: D.navy,
                    '&.Mui-focusVisible': {
                      outline: `2px solid ${D.navy}`,
                    },
                  }}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: '.875rem',
                      color: D.navy,
                      lineHeight: 1.3,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    noWrap
                    sx={{
                      fontSize: '.6875rem',
                      color: D.muted,
                    }}
                  >
                    {item.meeting}
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    flexShrink: 0,
                    fontSize: '.6875rem',
                    fontWeight: high ? 700 : 400,
                    color: high ? D.navy : D.muted,
                  }}
                >
                  {high && 'High · '}
                  {due ? formatTime(due) : ''}
                </Typography>
              </Box>
            )
          })}
        </Box>
      )}
    </Box>
  )
}
