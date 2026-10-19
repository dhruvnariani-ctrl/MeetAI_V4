import { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'

import { TASK_SORT_OPTIONS } from '../../data/tasks'
import { D } from '../dashboard/dashTheme'
import { DUE_DATE_FILTERS, STATUS_FILTERS } from './taskConstants'

const SORT_OPTIONS = TASK_SORT_OPTIONS.map((option) => ({ value: option, label: `Sort: ${option}` }))

function MenuButton({ options, value, onChange, tour, label }) {
  const [anchor, setAnchor] = useState(null)
  const current = options.find((option) => option.value === value)

  return (
    <>
      <Button
        data-tour={tour}
        aria-label={`${label}: ${current?.label ?? ''}`}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        endIcon={<ExpandMoreRoundedIcon />}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{
          minHeight: 38,
          px: 1.5,
          border: `1px solid ${D.line}`,
          borderRadius: '6px',
          bgcolor: '#fff',
          color: D.navy,
          fontSize: '.8125rem',
          fontWeight: 500,
          textTransform: 'none',
          '&:hover': { bgcolor: '#F5F8FD', borderColor: D.navy },
          '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: 2 },
        }}
      >
        {current?.label}
      </Button>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {options.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === value}
            onClick={() => {
              onChange(option.value)
              setAnchor(null)
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default function TaskToolbar({
  filter,
  onFilterChange,
  filterCounts,
  dueDate,
  onDueDateChange,
  sortBy,
  onSortByChange,
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 1, minWidth: 0 }}>
      {/* Status filters */}
      <Box data-tour="tasks-filters" role="group" aria-label="Filter by status" sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
        {STATUS_FILTERS.map((status) => {
          const active = filter === status
          return (
            <Button
              key={status}
              aria-pressed={active}
              onClick={() => onFilterChange(status)}
              sx={{
                minWidth: 0,
                minHeight: 34,
                px: 1.5,
                borderRadius: '17px',
                fontSize: '.8125rem',
                fontWeight: active ? 600 : 500,
                textTransform: 'none',
                color: active ? '#fff' : D.navy,
                bgcolor: active ? D.navy : '#fff',
                border: `1px solid ${active ? D.navy : D.line}`,
                '&:hover': { bgcolor: active ? D.navy : '#E4EBF8' },
                '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: 2 },
              }}
            >
              {status} {filterCounts[status]}
            </Button>
          )
        })}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <MenuButton label="Filter by due date" options={DUE_DATE_FILTERS} value={dueDate} onChange={onDueDateChange} />
        <MenuButton label="Sort tasks" tour="tasks-sort" options={SORT_OPTIONS} value={sortBy} onChange={onSortByChange} />
      </Box>
    </Box>
  )
}