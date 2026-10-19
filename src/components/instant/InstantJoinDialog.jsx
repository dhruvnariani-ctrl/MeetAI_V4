import { useId, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined'

import { D, serif } from '../dashboard/dashTheme'
import FormField from './FormField'
import ParticipantPicker from './ParticipantPicker'
import DialogShell, { ChoiceCard, Section, controlSx } from './DialogShell'

const MEETING_HOSTS = /(^|\.)(zoom\.us|zoom\.com|zoomgov\.com|meet\.google\.com|teams\.microsoft\.com|teams\.live\.com)$/i

// Accepts links with or without https:// ; returns a clean URL string or null.
function normalizeMeetingLink(value) {
  const raw = value.trim()
  if (!raw) return null
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
    return MEETING_HOSTS.test(url.hostname) ? url.href : null
  } catch {
    return null
  }
}

const STEPS = (n) => [
  'Avaada Meet Companion joins with your meeting link',
  'Avaada Meet Companion appears in the meeting as a participant',
  'Real-time transcription with speaker identification',
  'When the meeting ends, AI generates MoM and action items',
  `Emails are sent to all ${n} ${n === 1 ? 'participant' : 'participants'} automatically`,
]

export default function InstantJoinDialog({ open, onClose, onSubmit, currentUser, searchDirectory }) {
  const titleId = useId()
  const descId = useId()
  const linkRef = useRef(null)

  const [link, setLink] = useState('')
  const [title, setTitle] = useState('')
  const [linkError, setLinkError] = useState(false)
  const [participants, setParticipants] = useState([{ ...currentUser, you: true }])
  const [recordVideo, setRecordVideo] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const url = normalizeMeetingLink(link)
    if (!url) {
      setLinkError(true)
      linkRef.current?.focus()
      return
    }
    onSubmit({ link: url, title: title.trim(), participants, recordVideo })
  }

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      titleId={titleId}
      descId={descId}
      eyebrow="Join with a link"
      title="Record instant meeting"
      subtitle="Fill in the details. Avaada Meet Companion joins when you start."
      sideLabel="What happens when you start"
      side={<AfterStart titleId={titleId} count={participants.length} />}
    >
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2.5 }}>
        <Section title="Meeting">
          <FormField
            label="Meeting Link"
            required
            ref={linkRef}
            autoFocus
            type="url"
            value={link}
            onChange={(e) => { setLink(e.target.value); if (linkError) setLinkError(false) }}
            error={linkError}
            placeholder="https://meet.google.com/abc-xyz  or  zoom.us/j/123456789"
            startIcon={<LinkOutlinedIcon sx={{ fontSize: 20 }} />}
            helper={linkError ? 'Enter a valid Zoom, Google Meet, or Microsoft Teams link' : 'Paste a Zoom, Google Meet, or Microsoft Teams link'}
          />

          <FormField
            label="Meeting Title"
            optional
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Quick sync with design team"
          />
        </Section>

        <Section title="Who">
          <ParticipantPicker
            participants={participants}
            searchDirectory={searchDirectory}
            onAdd={(p) => setParticipants((list) => [...list, p])}
            onRemove={(email) => setParticipants((list) => list.filter((p) => p.email !== email))}
          />
        </Section>

        <Section title="Recording">
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.25, borderRadius: '6px', bgcolor: D.band }}>
            <CheckCircleOutlinedIcon sx={{ fontSize: 18, mt: 0.1, color: D.greenText }} aria-hidden="true" />
            <Typography sx={{ fontSize: '.75rem', lineHeight: 1.55, color: D.navy }}>
              <strong>Meet AI / transcription:</strong> always on for instant meetings. Avaada Meet Companion joins to
              capture the transcript and generate MoM and insights.
            </Typography>
          </Box>

          <ChoiceCard
            checked={recordVideo}
            control={
              <Checkbox
                size="small"
                checked={recordVideo}
                onChange={(e) => setRecordVideo(e.target.checked)}
                sx={controlSx}
              />
            }
          >
            <Typography sx={{ fontSize: '.8125rem', fontWeight: 600, color: D.navy }}>Also enable Video Recording</Typography>
            <Typography sx={{ fontSize: '.75rem', color: D.muted }}>Saves a video file separately (7-day retention).</Typography>
          </ChoiceCard>
        </Section>

        <Box>
          <Button
            type="submit"
            variant="contained"
            disableElevation
            fullWidth
            startIcon={<BoltOutlinedIcon />}
            sx={{
              height: 44,
              borderRadius: '6px',
              bgcolor: D.green,
              color: '#fff',
              fontSize: '.9375rem',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: '#2C6C16' },
              '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: 2 },
            }}
          >
            Record meeting
          </Button>
          <Typography sx={{ mt: 1, textAlign: 'center', fontSize: '.75rem', color: D.muted }}>
            {recordVideo
              ? 'Starts Meet AI transcription and saves a video file (7-day retention)'
              : 'Starts Meet AI transcription only (no video file unless you tick Video Recording)'}
          </Typography>
        </Box>
      </Box>
    </DialogShell>
  )
}

/* Side panel: what the feature does, then a timeline of what happens after you start. */
function AfterStart({ titleId, count }) {
  const steps = STEPS(count)

  return (
    <Box sx={{ display: 'grid', gap: 2.5 }}>
      <Box sx={{ p: 1.5, borderRadius: '6px', bgcolor: D.band }}>
        <Typography component="h3" sx={{ fontSize: '.8125rem', fontWeight: 600, color: D.navy }}>
          What &ldquo;Record meeting&rdquo; does
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: '.75rem', lineHeight: 1.6, color: D.text }}>
          Starts <strong>Meet AI / transcription</strong>: Avaada Meet Companion joins, captures the live transcript,
          and emails MoM and action items when the meeting ends. Optional <strong>Video Recording</strong> saves a
          video file separately (7-day retention).
        </Typography>
      </Box>

      <Box component="section" aria-labelledby={`${titleId}-after`}>
        <Typography
          id={`${titleId}-after`}
          component="h3"
          sx={{ mb: 1.5, pt: 1.25, borderTop: `1px solid ${D.navy}`, fontFamily: serif, fontWeight: 400, fontSize: '1.25rem', color: D.navy }}
        >
          What happens after you start
        </Typography>

        <Box component="ol" role="list" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {steps.map((text, i) => {
            const last = i === steps.length - 1

            return (
              <Box key={text} component="li" sx={{ position: 'relative', display: 'flex', gap: 1.25, pb: last ? 0 : 1.75 }}>
                {!last && (
                  <Box aria-hidden="true" sx={{ position: 'absolute', left: 11, top: 24, bottom: 0, width: '1px', bgcolor: D.line }} />
                )}

                <Box
                  aria-hidden="true"
                  sx={{
                    position: 'relative',
                    width: 24,
                    height: 24,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '50%',
                    border: `1px solid ${D.navy}`,
                    bgcolor: '#fff',
                    color: D.navy,
                    fontSize: '.6875rem',
                    fontWeight: 700,
                  }}
                >
                  {i + 1}
                </Box>

                <Typography sx={{ pt: 0.2, fontSize: '.75rem', lineHeight: 1.5, color: D.text }}>{text}</Typography>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}