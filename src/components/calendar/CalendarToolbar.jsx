import { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'

import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'

import { D } from '../dashboard/dashTheme'

const VIEWS = [
  ['day', 'Day'],
  ['week', 'Week'],
  ['month', 'Month'],
]

const controlSx = {
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
}

export default function CalendarToolbar({
  view,
  label,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  onYesterday,
  onTomorrow,
  onCurrentPeriod,
  filters,
  onFiltersChange,
  onClearFilters,
  platforms = [],
  activeFilterCount = 0,
}) {
  const [dateAnchor, setDateAnchor] = useState(null)
  const [filterAnchor, setFilterAnchor] = useState(null)

  const pick = (action) => () => {
    setDateAnchor(null)
    action?.()
  }

  const togglePlatform = (platform) =>
    onFiltersChange({
      ...filters,
      platforms: filters.platforms.includes(platform)
        ? filters.platforms.filter((item) => item !== platform)
        : [...filters.platforms, platform],
    })

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
      {/* Date navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <IconButton aria-label={`Previous ${view}`} onClick={onPrevious} sx={{ ...controlSx, width: 38, p: 0 }}>
          <ChevronLeftRoundedIcon />
        </IconButton>

        <Button
          data-tour="calendar-date-menu"
          aria-haspopup="menu"
          aria-expanded={Boolean(dateAnchor)}
          onClick={(event) => setDateAnchor(event.currentTarget)}
          sx={{ ...controlSx, minWidth: 150 }}
        >
          {label}
        </Button>

        <IconButton aria-label={`Next ${view}`} onClick={onNext} sx={{ ...controlSx, width: 38, p: 0 }}>
          <ChevronRightRoundedIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        {/* Day / Week / Month */}
        <Box
          role="group"
          aria-label="Calendar view"
          data-tour="calendar-view"
          sx={{ display: 'flex', border: `1px solid ${D.line}`, borderRadius: '6px', overflow: 'hidden', bgcolor: '#fff' }}
        >
          {VIEWS.map(([key, text]) => (
            <Button
              key={key}
              aria-pressed={view === key}
              onClick={() => onViewChange(key)}
              sx={{
                minHeight: 36,
                px: 2,
                borderRadius: 0,
                fontSize: '.8125rem',
                fontWeight: view === key ? 600 : 500,
                textTransform: 'none',
                bgcolor: view === key ? D.navy : 'transparent',
                color: view === key ? '#fff' : D.navy,
                '&:hover': { bgcolor: view === key ? D.navy : '#F5F8FD' },
                '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: -4 },
              }}
            >
              {text}
            </Button>
          ))}
        </Box>

        {/* Filters */}
        <Button
          data-tour="calendar-filters-button"
          aria-haspopup="dialog"
          startIcon={<FilterListRoundedIcon />}
          onClick={(event) => setFilterAnchor(event.currentTarget)}
          sx={controlSx}
        >
          Filters{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
        </Button>

        <Popover
          open={Boolean(filterAnchor)}
          anchorEl={filterAnchor}
          onClose={() => setFilterAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ p: 2, minWidth: 240 }} role="dialog" aria-label="Meeting filters">
            <Typography sx={{ fontSize: '.6875rem', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: D.muted }}>
              Platform
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
              {platforms.map((platform) => (
                <FormControlLabel
                  key={platform}
                  label={platform}
                  control={
                    <Checkbox
                      size="small"
                      checked={filters.platforms.includes(platform)}
                      onChange={() => togglePlatform(platform)}
                      sx={{ color: D.navy, '&.Mui-checked': { color: D.navy } }}
                    />
                  }
                />
              ))}
            </Box>

            <Typography sx={{ fontSize: '.6875rem', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: D.muted }}>
              Show only
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <FormControlLabel
                label="MeetAI invited"
                control={
                  <Checkbox
                    size="small"
                    checked={filters.meetAIOnly}
                    onChange={(event) => onFiltersChange({ ...filters, meetAIOnly: event.target.checked })}
                    sx={{ color: D.navy, '&.Mui-checked': { color: D.navy } }}
                  />
                }
              />
              <FormControlLabel
                label="Hosted by me"
                control={
                  <Checkbox
                    size="small"
                    checked={filters.hostedByMe}
                    onChange={(event) => onFiltersChange({ ...filters, hostedByMe: event.target.checked })}
                    sx={{ color: D.navy, '&.Mui-checked': { color: D.navy } }}
                  />
                }
              />
            </Box>

            <Button
              disabled={activeFilterCount === 0}
              onClick={onClearFilters}
              sx={{ mt: 1, p: 0, textTransform: 'none', fontSize: '.8125rem', color: D.navy }}
            >
              Clear filters
            </Button>
          </Box>
        </Popover>
      </Box>
    </Box>
  )
}