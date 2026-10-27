import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined'
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded'

import { EmptyPanel } from '../components/PageShell'
import PaginationBar from '../components/PaginationBar'
import RecordedFilters from '../components/recorded/RecordedFilters'
import {
  D,
  sectionHeadSx,
  time24,
  titleSx,
} from '../components/dashboard/dashTheme'

import usePagination from '../hooks/usePagination'
import usePageTitle from '../hooks/usePageTitle'
import useCurrentUser from '../hooks/useCurrentUser'

import { getAllMeetings } from '../data/meetings'
import {
  getRecordedMeetings,
  RECORDED_SORT_OPTIONS,
} from '../data/recorded'

import { DATE_FILTERS } from '../utils/dateFilters'
import { filterUserMeetings } from '../utils/meetingAccess'

const PAGE_SIZE = 8

const ROW = {
  display: 'grid',
  gridTemplateColumns: '56px minmax(0, 1fr)',
  columnGap: { xs: 1.5, sm: 3 },
}

const shortDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })

const longDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

const durationOf = (meeting) => {
  if (meeting.recording?.duration) {
    return meeting.recording.duration
  }

  const minutes = Math.round(
    (new Date(meeting.end) - new Date(meeting.start)) / 60000,
  )

  return Number.isFinite(minutes)
    ? `${Math.max(0, minutes)} min`
    : ''
}

const countOf = (meeting) => meeting.participants?.length || 0

const CONTENT = [
  {
    tab: 'recording',
    label: 'Recording',
    action: 'Watch recording',
    Icon: PlayCircleOutlineRoundedIcon,
    has: (meeting) => meeting.recording?.available,
  },
  {
    tab: 'transcript',
    label: 'Transcript',
    action: 'Read transcript',
    Icon: DescriptionOutlinedIcon,
    has: (meeting) => meeting.transcript?.available,
  },
  {
    tab: 'overview',
    label: 'Meeting notes',
    action: 'Open notes',
    Icon: NotesOutlinedIcon,
    has: (meeting) => meeting.meetingNotes?.available,
  },
]

export default function RecordedMeetings() {
  usePageTitle('Recorded Meetings')

  const navigate = useNavigate()
  const currentUser = useCurrentUser()

  const [dateFilter, setDateFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Newest')
  const [selectedId, setSelectedId] = useState(null)

  const meetings = useMemo(
    () => filterUserMeetings(getAllMeetings(), currentUser),
    [currentUser],
  )

  // The global header search handles text search.
  // This page provides date filtering and sorting.
  const recorded = useMemo(
    () => getRecordedMeetings(meetings, '', dateFilter, sortBy),
    [meetings, dateFilter, sortBy],
  )

  const pager = usePagination(
    recorded,
    PAGE_SIZE,
    `${dateFilter}|${sortBy}`,
  )

  // Preserve the selected meeting when possible.
  // Otherwise, select the first meeting in the results.
  const selected =
    recorded.find((meeting) => meeting.id === selectedId) ||
    recorded[0]

  const clearFilters = () => {
    setDateFilter('All')
    setSortBy('Newest')
  }

  const open = (tab) => {
    if (!selected) return

    navigate(
      tab
        ? `/meetings/${selected.id}?tab=${tab}`
        : `/meetings/${selected.id}`,
      {
        state: { meeting: selected },
      },
    )
  }

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        color: D.text,
      }}
    >
      {/* Compact archive and selected meeting view */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            lg: 'minmax(0, 1.8fr) minmax(280px, 1fr)',
          },
          columnGap: 2,
          rowGap: 1.5,
          alignItems: 'start',
          pt: 0,
          height: { lg: 'calc(100vh - 150px)' },
          minHeight: 0,
        }}
      >
        {/* Archive list */}
        <Box
          component="section"
          aria-label="Meeting archive"
          data-tour="recorded-meeting-list"
          sx={{ minWidth: 0 }}
        >
          <Box
  sx={{
    display: 'flex',
    alignItems: { xs: 'flex-start', lg: 'center' },
    justifyContent: 'space-between',
    flexWrap: { xs: 'wrap', lg: 'nowrap' },
    gap: 1,
    mb: 1.25,
  }}
>
  <Typography
    component="h2"
    sx={{
      ...titleSx,
      flexShrink: 0,
    }}
  >
    Meeting archive ({recorded.length})
  </Typography>

  <Box
    sx={{
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: { xs: 'flex-start', lg: 'flex-end' },
      flexWrap: { xs: 'wrap', lg: 'nowrap' },
      gap: 1,
      '& > *': {
        flexShrink: 0,
      },
    }}
  >
    <RecordedFilters
      dateFilters={DATE_FILTERS}
      dateFilter={dateFilter}
      onDateFilterChange={setDateFilter}
      sortOptions={RECORDED_SORT_OPTIONS}
      sortBy={sortBy}
      onSortChange={setSortBy}
    />
  </Box>
</Box>
          <Box
            sx={{
              minWidth: 0,
              overflowY: { lg: 'auto' },
              maxHeight: { lg: 'calc(100vh - 250px)' },
              pr: { lg: 0.5 },
            }}
          >
          {recorded.length === 0 ? (
            <EmptyPanel
              title="No recorded meetings"
              minHeight={140}
              action={
                dateFilter !== 'All' || sortBy !== 'Newest' ? (
                  <Button onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            >
              {dateFilter !== 'All'
                ? 'No recorded meetings match the selected date filter.'
                : 'Meetings that MeetAI records will appear here.'}
            </EmptyPanel>
          ) : (
            <>
              <Box
                component="ul"
                sx={{
                  m: 0,
                  p: 0,
                  listStyle: 'none',
                }}
              >
                {pager.pageItems.map((meeting) => {
                  const active = meeting.id === selected?.id
                  const ready = Boolean(meeting.recording?.available)

                  return (
                    <Box
                      component="li"
                      key={meeting.id}
                      sx={{
                        ...ROW,
                        mt: '-1px',
                      }}
                    >
                      {/* Meeting date and time */}
                      <Box sx={{ pt: 0.75 }}>
                        <Typography
                          sx={{
                            fontSize: '.75rem',
                            fontWeight: 600,
                            color: D.navy,
                          }}
                        >
                          {shortDate(meeting.start)}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: '.6875rem',
                            color: D.muted,
                          }}
                        >
                          {time24(meeting.start)}
                        </Typography>
                      </Box>

                      {/* Meeting selection */}
                      <ButtonBase
                        aria-pressed={active}
                        onClick={() => setSelectedId(meeting.id)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1.5,
                          width: '100%',
                          minWidth: 0,
                          px: 1.25,
                          py: 0.85,
                          textAlign: 'left',
                          bgcolor: active ? '#fff' : '#F7F9FE',
                          border: `1px solid ${D.line}`,
                          borderLeft: `3px solid ${
                            active ? D.navy : D.line
                          }`,
                          '&:hover': {
                            bgcolor: '#fff',
                          },
                          '&:focus-visible': {
                            outline: `2px solid ${D.navy}`,
                            outlineOffset: -2,
                          },
                        }}
                      >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            noWrap
                            sx={{
                              fontSize: '.875rem',
                              fontWeight: active ? 600 : 500,
                              color: D.navy,
                            }}
                          >
                            {meeting.title}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.25,
                              fontSize: '.6875rem',
                              color: D.muted,
                            }}
                          >
                            {meeting.platform} · {countOf(meeting)} participant
                            {countOf(meeting) === 1 ? '' : 's'} ·{' '}
                            {durationOf(meeting)}
                          </Typography>
                        </Box>

                        <Typography
                          sx={{
                            flexShrink: 0,
                            fontSize: '.6875rem',
                            fontWeight: 600,
                            color: ready ? D.greenText : D.muted,
                          }}
                        >
                          {ready ? 'Recording ready ✓' : 'No recording'}
                        </Typography>
                      </ButtonBase>
                    </Box>
                  )
                })}
              </Box>

              <PaginationBar
                pager={pager}
                label="meetings"
                sx={{
                  px: 0,
                  borderColor: D.line,
                  '& .MuiPaginationItem-root.Mui-selected, & .MuiPaginationItem-root.Mui-selected:hover':
                    {
                      bgcolor: D.navy,
                      color: '#fff',
                    },
                }}
              />
            </>
          )}
          </Box>
        </Box>

        {/* Selected meeting details */}
        {selected && (
          <Box
            component="section"
            aria-label="Selected recording"
            sx={{
              minWidth: 0,
              alignSelf: 'start',
              overflowWrap: 'anywhere',
            }}
          >
            <Box sx={sectionHeadSx}>
              <Typography
                sx={{
                  fontSize: '.625rem',
                  fontWeight: 600,
                  letterSpacing: '.07em',
                  textTransform: 'uppercase',
                  color: D.muted,
                }}
              >
                Selected recording
              </Typography>
            </Box>

            <Typography
              component="h2"
              sx={{
                ...titleSx,
                mt: 0.75,
                fontSize: '1.35rem',
                overflowWrap: 'anywhere',
              }}
            >
              {selected.title}
            </Typography>

            <Typography
              sx={{
                mt: 0.75,
                fontSize: '.75rem',
                color: D.text,
              }}
            >
              {longDate(selected.start)} · {time24(selected.start)}–
              {time24(selected.end)}
            </Typography>

            <Typography
              sx={{
                mt: 0.25,
                fontSize: '.75rem',
                color: D.muted,
              }}
            >
              {selected.platform} · {countOf(selected)} participant
              {countOf(selected) === 1 ? '' : 's'} ·{' '}
              {durationOf(selected)}
            </Typography>

            <Typography
              sx={{
                mt: 1.25,
                mb: 0.75,
                fontSize: '.625rem',
                fontWeight: 600,
                letterSpacing: '.07em',
                textTransform: 'uppercase',
                color: D.muted,
              }}
            >
              Meeting content
            </Typography>

            <Box
              component="ul"
              sx={{
                m: 0,
                p: 0,
                listStyle: 'none',
              }}
            >
              {CONTENT.map(({ tab, label, action, Icon, has }) => {
                const available = Boolean(has(selected))

                return (
                  <Box
                    component="li"
                    key={tab}
                    sx={{ mt: '-1px' }}
                  >
                    <ButtonBase
                      disabled={!available}
                      onClick={() => open(tab)}
                      aria-label={
                        available
                          ? `${action} for ${selected.title}`
                          : `${label} not available`
                      }
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                        width: '100%',
                        px: 1.5,
                        py: 0.85,
                        textAlign: 'left',
                        bgcolor: available ? '#F7F9FE' : 'transparent',
                        border: `1px solid ${D.line}`,
                        '&:hover': {
                          bgcolor: available ? '#fff' : 'transparent',
                        },
                        '&:focus-visible': {
                          outline: `2px solid ${D.navy}`,
                          outlineOffset: -2,
                        },
                      }}
                    >
                      <Icon
                        sx={{
                          fontSize: 18,
                          color: available ? D.navy : D.muted,
                        }}
                      />

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: '.8125rem',
                            fontWeight: 500,
                            color: available ? D.navy : D.muted,
                          }}
                        >
                          {label}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: '.6875rem',
                            color: available ? D.greenText : D.muted,
                          }}
                        >
                          {available ? 'Available' : 'Not available'}
                        </Typography>
                      </Box>

                      {available && (
                        <ArrowOutwardRoundedIcon
                          sx={{
                            fontSize: 16,
                            color: D.muted,
                          }}
                        />
                      )}
                    </ButtonBase>
                  </Box>
                )
              })}
            </Box>

            <Button
              fullWidth
              variant="contained"
              disableElevation
              endIcon={<ArrowOutwardRoundedIcon />}
              onClick={() => open('')}
              sx={{
                mt: 1.25,
                minHeight: 36,
                borderRadius: '6px',
                fontSize: '.8125rem',
                fontWeight: 500,
                textTransform: 'none',
                bgcolor: D.navy,
                color: '#fff',
                '&:hover': {
                  bgcolor: '#0D1C47',
                },
                '&:focus-visible': {
                  outline: `2px solid ${D.navy}`,
                  outlineOffset: 2,
                },
              }}
            >
              View full meeting details
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  )
}