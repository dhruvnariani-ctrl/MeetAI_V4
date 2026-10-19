import { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'

import { D } from '../dashboard/dashTheme'

export default function RecordedFilters({
  dateFilters,
  dateFilter,
  onDateFilterChange,
  sortOptions,
  sortBy,
  onSortChange,
}) {
  const [anchor, setAnchor] = useState(null)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      {/* Date filter */}
      <Box
        role="group"
        aria-label="Filter by date"
        data-tour="recorded-filters"
        sx={{ display: 'flex', border: `1px solid ${D.line}`, borderRadius: '6px', overflow: 'hidden', bgcolor: '#fff' }}
      >
        {dateFilters.map((item) => {
          const active = dateFilter === item
          return (
            <Button
              key={item}
              aria-pressed={active}
              onClick={() => onDateFilterChange(item)}
              sx={{
                minHeight: 36,
                px: 2,
                borderRadius: 0,
                fontSize: '.8125rem',
                fontWeight: active ? 600 : 500,
                textTransform: 'none',
                whiteSpace: 'nowrap',
                color: active ? '#fff' : D.navy,
                bgcolor: active ? D.navy : 'transparent',
                '&:hover': { bgcolor: active ? D.navy : '#F5F8FD' },
                '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: -4 },
              }}
            >
              {item}
            </Button>
          )
        })}
      </Box>

      {/* Sort */}
      <Button
        data-tour="recorded-sort"
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
        Sort: {sortBy}
      </Button>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {sortOptions.map((item) => (
          <MenuItem
            key={item}
            selected={sortBy === item}
            onClick={() => {
              onSortChange(item)
              setAnchor(null)
            }}
          >
            {item}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}