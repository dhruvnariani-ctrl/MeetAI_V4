import { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'

import { D, linkSx } from '../dashboard/dashTheme'
import { NotReadyMessage, SectionCard } from './ui'

export default function OverviewTab({ meeting, meetingState }) {
  const [copied, setCopied] = useState(false)

  const summary = meeting.meetingSummary
  const upcoming =
    meetingState?.type === 'upcoming' ||
    meetingState?.type === 'starting-soon'

  const copySummary = async () => {
    if (!summary) return

    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard may be unavailable in this browser or context.
    }
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionCard
        title="Summary"
        right={
          summary ? (
            <Button
              startIcon={
                <ContentCopyOutlinedIcon
                  sx={{ fontSize: '14px !important' }}
                />
              }
              onClick={copySummary}
              sx={linkSx}
            >
              {copied ? 'Copied' : 'Copy summary'}
            </Button>
          ) : null
        }
      >
        {summary ? (
          <Typography
            sx={{
              fontSize: '.9375rem',
              lineHeight: 1.75,
              color: D.text,
              whiteSpace: 'pre-line',
              overflowWrap: 'anywhere',
            }}
          >
            {summary}
          </Typography>
        ) : (
          <NotReadyMessage>
            {upcoming
              ? 'The meeting summary will appear here after the meeting has taken place.'
              : 'No meeting summary is available yet.'}
          </NotReadyMessage>
        )}
      </SectionCard>
    </Box>
  )
}