import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

export default function MeetingsPanel({ id, tabId, meetings, view }) {
  const empty = meetings.length === 0
  return (
    <Box
      id={id}
      role="tabpanel"
      aria-labelledby={tabId}
      tabIndex={0}
      sx={{
        minHeight: 235, p: 3, display: 'grid', placeItems: empty ? 'center' : 'start stretch',
        bgcolor: '#f5f5f5', border: '1px dashed #c8d0db', borderRadius: '12px',
      }}
    >
      {empty ? (
        <Box role="status" sx={{ maxWidth: 380, textAlign: 'center' }}>
          <Typography variant="h2" component="h2" sx={{ mb: 1.5 }}>No meetings in view</Typography>
          <Typography sx={{ color: 'text.secondary', lineHeight: 1.55, '& strong': { color: '#3f4f68', fontWeight: 700 } }}>
            <strong>Invite MeetAI</strong> lists only <strong>upcoming</strong> Google Calendar events
            you can configure (today through the next 30 days). <strong>Past and completed meetings</strong>{' '}
            do not appear here — open <strong>All Meetings</strong> or <strong>Recorded Meetings</strong>{' '}
            for those. Use <strong>Instant join</strong> for an instant recording without linking calendar.
          </Typography>
        </Box>
      ) : (
        <Box component="ul" sx={{
          listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1.5,
          gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr',
        }}>
          {meetings.map((m) => (
            <Paper key={m.id} component="li" variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h2" component="h3">{m.title}</Typography>
              <Typography variant="body2" component="time" dateTime={m.start} sx={{ color: 'text.secondary' }}>
                {new Date(m.start).toLocaleString()}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  )
}