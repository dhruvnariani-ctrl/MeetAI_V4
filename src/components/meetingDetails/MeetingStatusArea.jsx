import Box from '@mui/material/Box'

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'

import {
  formatElapsedTime,
  formatRemainingTime,
} from './utils'

export default function MeetingStatusArea({
  meeting,
  state,
  meetAIInvited,
}) {
  const type = state?.type || 'upcoming'

  /*
   * --------------------------------------------------------------------------
   * Completed
   * --------------------------------------------------------------------------
   */
  if (type === 'completed') {
    return (
      <StatusRow>
        <StatusBadge
          icon={<CheckCircleOutlineIcon />}
          label="Completed"
          bgcolor="#eaf7ef"
          color="#287a4d"
        />

        <StatusBadge
          label={`Finished ${formatElapsedTime(
            state?.afterMs || 0,
          )} ago`}
          bgcolor="#f4f6f8"
          color="#68778a"
        />

        <MeetAIBadge
          meeting={meeting}
          meetAIInvited={meetAIInvited}
        />
      </StatusRow>
    )
  }

  /*
   * --------------------------------------------------------------------------
   * Starting soon
   * --------------------------------------------------------------------------
   */
  if (type === 'starting-soon') {
    return (
      <StatusRow>
        <StatusBadge
          icon={<AccessTimeOutlinedIcon />}
          label={`Starting in ${formatRemainingTime(
            state?.remainingMs || 0,
          )}`}
          bgcolor="#fff4dc"
          color="#946200"
        />

        <MeetAIBadge
          meeting={meeting}
          meetAIInvited={meetAIInvited}
        />
      </StatusRow>
    )
  }

  /*
   * --------------------------------------------------------------------------
   * Upcoming
   * --------------------------------------------------------------------------
   */
  if (type === 'upcoming') {
    return (
      <StatusRow>
        <StatusBadge
          icon={<AccessTimeOutlinedIcon />}
          label={`In ${formatRemainingTime(
            state?.remainingMs || 0,
          )}`}
          bgcolor="#eef4ff"
          color="#245ea8"
        />

        <MeetAIBadge
          meeting={meeting}
          meetAIInvited={meetAIInvited}
        />
      </StatusRow>
    )
  }

  /*
   * --------------------------------------------------------------------------
   * Live
   * --------------------------------------------------------------------------
   */
  if (
    type === 'live' ||
    type === 'just-started'
  ) {
    return (
      <StatusRow>
        <StatusBadge
          label="Live now"
          bgcolor="#eaf7ef"
          color="#287a4d"
          live
        />

        <MeetAIBadge
          meeting={meeting}
          meetAIInvited={meetAIInvited}
        />
      </StatusRow>
    )
  }

  return null
}

/* -------------------------------------------------------------------------- */
/* MeetAI status                                                              */
/* -------------------------------------------------------------------------- */

function MeetAIBadge({
  meeting,
  meetAIInvited,
}) {
  /*
   * Attended has priority.
   *
   * If MeetAI actually attended the meeting,
   * keep showing "MeetAI attended".
   */
  if (meeting?.meetAI?.attended === true) {
    return (
      <StatusBadge
        label="MeetAI attended"
        bgcolor="#eaf7ef"
        color="#287a4d"
      />
    )
  }

  /*
   * The saved localStorage setting is now the
   * source of truth for whether MeetAI is invited.
   */
  if (meetAIInvited === true) {
    return (
      <StatusBadge
        label="MeetAI invited"
        bgcolor="#eef4ff"
        color="#245ea8"
      />
    )
  }

  /*
   * MeetAI is explicitly OFF.
   *
   * Show the requested status instead of hiding
   * the badge.
   */
  return (
    <StatusBadge
      label="MeetAI not invited"
      bgcolor="#f4f6f8"
      color="#68778a"
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Status row                                                                 */
/* -------------------------------------------------------------------------- */

function StatusRow({ children }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 0.9,
        flexWrap: 'wrap',
        maxWidth: '100%',
      }}
    >
      {children}
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/* Status badge                                                               */
/* -------------------------------------------------------------------------- */

function StatusBadge({
  icon,
  label,
  bgcolor,
  color,
  live = false,
}) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.65,

        minHeight: 36,

        px: 1.25,

        borderRadius: '999px',

        bgcolor,
        color,

        whiteSpace: 'nowrap',
        flexShrink: 0,

        '& svg': {
          fontSize: 17,
          flexShrink: 0,
        },
      }}
    >
      {live && (
        <Box
          component="span"
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: color,
            flexShrink: 0,
          }}
        />
      )}

      {icon}

      <Box
        component="span"
        sx={{
          fontSize: '0.75rem',
          lineHeight: 1,
          fontWeight: 700,
        }}
      >
        {label}
      </Box>
    </Box>
  )
}