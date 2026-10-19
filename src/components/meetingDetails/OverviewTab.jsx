import { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'

import { D, linkSx } from '../dashboard/dashTheme'
import ActionItem from './ActionItem'
import { NotReadyMessage, SectionCard } from './ui'

/* Placeholder shown for completed meetings until meeting.keyTakeaways exists. */
const DUMMY_TAKEAWAYS = [
  'Prioritize the offline mode feature for the mobile app.',
  'Collect more customer feedback on the onboarding flow.',
  'Align on go-to-market strategy for new features.',
  'Schedule a design review for next week.',
]

const PREVIEW = 4

/* Main column of the Overview tab: summary, key takeaways and action items. */
export default function OverviewTab({ meeting, meetingState, onNavigate }) {
  const [copied, setCopied] = useState(false)

  const summary = meeting.meetingSummary
  const upcoming = meetingState?.type === 'upcoming' || meetingState?.type === 'starting-soon'
  const completed = meetingState?.type === 'completed'
  const items = meeting.actionItems || []
  const takeaways = meeting.keyTakeaways?.length ? meeting.keyTakeaways : completed ? DUMMY_TAKEAWAYS : []

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <Box sx={{ display: 'grid', gap: 4 }}>
      <SectionCard
        title="Summary"
        right={
          summary && (
            <Button
              startIcon={<ContentCopyOutlinedIcon sx={{ fontSize: '14px !important' }} />}
              onClick={copySummary}
              sx={linkSx}
            >
              {copied ? 'Copied' : 'Copy summary'}
            </Button>
          )
        }
      >
        {summary ? (
          <Typography sx={{ fontSize: '.9375rem', lineHeight: 1.75, color: D.text, whiteSpace: 'pre-line' }}>{summary}</Typography>
        ) : (
          <NotReadyMessage>
            {upcoming
              ? 'The meeting summary will appear here after the meeting has taken place.'
              : 'No meeting summary is available yet.'}
          </NotReadyMessage>
        )}
      </SectionCard>

      <SectionCard title="Key takeaways">
        {takeaways.length > 0 ? (
          <Box component="ol" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1.25 }}>
            {takeaways.map((text, index) => (
              <Box component="li" key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  aria-hidden="true"
                  sx={{ width: 24, height: 24, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: '50%', border: `1px solid ${D.navy}`, color: D.navy, fontSize: '.6875rem', fontWeight: 700 }}
                >
                  {index + 1}
                </Box>
                <Typography sx={{ pt: '2px', fontSize: '.875rem', lineHeight: 1.55, color: D.text }}>{text}</Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <NotReadyMessage>
            {upcoming
              ? 'Key takeaways will appear here after the meeting has taken place.'
              : 'No key takeaways are available yet.'}
          </NotReadyMessage>
        )}
      </SectionCard>

      <SectionCard
        title="Action items"
        right={
          items.length > 0 && (
            <Typography sx={{ fontSize: '.6875rem', color: D.muted }}>
              {items.length} {items.length === 1 ? 'task' : 'tasks'}
            </Typography>
          )
        }
      >
        {upcoming ? (
          <NotReadyMessage>Action items will be created from the meeting after it takes place.</NotReadyMessage>
        ) : items.length === 0 ? (
          <NotReadyMessage>No action items have been recorded for this meeting.</NotReadyMessage>
        ) : (
          <>
            <Box sx={{ display: 'grid', gap: 1 }}>
              {items.slice(0, PREVIEW).map((item, index) => (
                <ActionItem key={item.id || index} item={item} />
              ))}
            </Box>

            {items.length > PREVIEW && (
              <Button
                sx={{ ...linkSx, mt: 1.5 }}
                endIcon={<ArrowOutwardRoundedIcon sx={{ fontSize: '12px !important' }} />}
                onClick={() => onNavigate('actions')}
              >
                View all {items.length} tasks
              </Button>
            )}
          </>
        )}
      </SectionCard>
    </Box>
  )
}