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
  serif,
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

const PAGE_SIZE = 6

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
      {/* Page heading and filters */}
      <Box
        component="section"
        aria-label="Recorded meetings overview"
        sx={{
          mx: { xs: -1.5, md: -2 },
          mt: { xs: -1.5, md: -2 },
          px: { xs: 1.5, md: 2 },
          py: 2.5,
          bgcolor: D.band,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 2, md: 3 },
            flexWrap: 'wrap',
          }}
        >
          {/* Heading and description */}
          <Box
            sx={{
              flex: '1 1 300px',
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: '.6875rem',
                fontWeight: 500,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: D.muted,
              }}
            >
              Archive
            </Typography>

            <Typography
              component="h1"
              sx={{
                mt: 0.5,
                fontFamily: serif,
                fontWeight: 400,
                fontSize: {
                  xs: '1.9rem',
                  md: '2.6rem',
                },
                lineHeight: 1.1,
                color: D.navy,
              }}
            >
              Recorded Meetings
            </Typography>

            <Typography
              aria-live="polite"
              sx={{
                mt: 0.75,
                fontSize: '.8125rem',
                color: D.text,
              }}
            >
              <Box
                component="strong"
                sx={{
                  fontWeight: 600,
                  color: D.navy,
                }}
              >
                {recorded.length} recording
                {recorded.length === 1 ? '' : 's'}.
              </Box>{' '}
              Find recordings, transcripts and notes from your meetings.
            </Typography>
          </Box>

          {/* Date and sort filters on the same row */}
          <Box
            sx={{
              flex: '0 1 auto',
              minWidth: 0,
              width: {
                xs: '100%',
                md: 'auto',
              },
              display: 'flex',
              justifyContent: {
                xs: 'flex-start',
                md: 'flex-end',
              },
              alignItems: 'center',
              '& > *': {
                minWidth: 0,
                maxWidth: '100%',
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
      </Box>

      {/* Meeting archive and selected meeting */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            lg: 'minmax(0, 1.9fr) minmax(300px, 1fr)',
          },
          columnGap: 3.5,
          rowGap: 3,
          alignItems: 'start',
          pt: 3,
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
              ...sectionHeadSx,
              mb: 2,
            }}
          >
            <Typography
              component="h2"
              sx={titleSx}
            >
              Meeting archive
            </Typography>

            <Typography
              sx={{
                fontSize: '.6875rem',
                color: D.muted,
              }}
            >
              Select a meeting to see its content.
            </Typography>
          </Box>

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
                      <Box sx={{ pt: 1.5 }}>
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
                          px: 2,
                          py: 1.5,
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
                              fontSize: '.9375rem',
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

        {/* Selected meeting details */}
        {selected && (
          <Box
            component="section"
            aria-label="Selected recording"
            sx={{
              minWidth: 0,
              position: { lg: 'sticky' },
              top: { lg: 12 },
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
                mt: 1.5,
                fontSize: '1.8rem',
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
                mt: 2.5,
                mb: 1,
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
                        py: 1.25,
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
                mt: 2,
                minHeight: 40,
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