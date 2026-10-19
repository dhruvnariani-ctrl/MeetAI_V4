
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import SearchIcon from '@mui/icons-material/Search'

export const MAX_RESULTS = 6

const ellipsis = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

function getResultIcon(type) {
  if (type === 'task') return <TaskAltOutlinedIcon sx={{ fontSize: 18 }} />
  if (type === 'participant') return <GroupsOutlinedIcon sx={{ fontSize: 18 }} />

  return <CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />
}

export default function SearchResults({
  results = [],
  heading = 'Search results',
  emptyTitle = 'No results found',
  emptyDescription = 'Try another search.',
  onSelect,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'absolute',
        top: 48,
        left: 0,
        right: 0,
        zIndex: 1300,
        border: '1px solid #dce3eb',
        borderRadius: 2.5,
        bgcolor: '#fff',
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
        overflow: 'hidden',
        animation: 'searchDropdownIn 140ms ease-out',
        '@keyframes searchDropdownIn': {
          from: { opacity: 0, transform: 'translateY(-4px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {results.length > 0 ? (
        <Box>
          <Box sx={{ px: 2, py: 1.25 }}>
            <Typography
              sx={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#7b8ba1',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {heading}
            </Typography>
          </Box>

          <Divider />

          {results.map((result) => (
            <Box
              key={result.id}
              component="button"
              type="button"
              onClick={() => onSelect?.(result)}
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                px: 2,
                py: 1.25,
                border: 0,
                bgcolor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background-color 140ms ease',
                '&:hover': { bgcolor: '#f5f8fc' },
                '&:focus-visible': {
                  outline: '2px solid #0967B2',
                  outlineOffset: -2,
                },
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 1.5,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor:
                    result.type === 'task'
                      ? '#E4F5EE'
                      : result.type === 'participant'
                        ? '#F0EBFF'
                        : '#eaf2fd',
                  color:
                    result.type === 'task'
                      ? '#16815B'
                      : result.type === 'participant'
                        ? '#7552D8'
                        : '#0967B2',
                  flexShrink: 0,
                }}
              >
                {getResultIcon(result.type)}
              </Box>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#172b46',
                    ...ellipsis,
                  }}
                >
                  {result.title || 'Untitled result'}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.25,
                    fontSize: '0.7rem',
                    color: '#718198',
                    ...ellipsis,
                  }}
                >
                  {result.subtitle || result.platform || 'MeetAI'}
                </Typography>
              </Box>
            </Box>
          ))}

          {results.length >= MAX_RESULTS && (
            <>
              <Divider />
              <Box sx={{ px: 2, py: 1 }}>
                <Typography sx={{ fontSize: '0.68rem', color: '#8793a3' }}>
                  Showing the first {MAX_RESULTS} results
                </Typography>
              </Box>
            </>
          )}
        </Box>
      ) : (
        <Box sx={{ px: 2.5, py: 2.5, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: 26, color: '#a5b0be', mb: 0.75 }} />

          <Typography
            sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#42546b' }}
          >
            {emptyTitle}
          </Typography>

          <Typography sx={{ mt: 0.35, fontSize: '0.7rem', color: '#8793a3' }}>
            {emptyDescription}
          </Typography>
        </Box>
      )}
    </Paper>
  )
}