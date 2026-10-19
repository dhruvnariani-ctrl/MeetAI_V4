import Stack from '@mui/material/Stack'

import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'

import ActionItem from './ActionItem'
import { SectionCard, NotReadyCard } from './ui'

/* -------------------------------------------------------------------------- */
/* Action items                                                               */
/* -------------------------------------------------------------------------- */

export default function ActionItemsTab({
  meeting,
  meetingState,
}) {
  const items =
    meeting.actionItems || []

  if (meetingState?.type === 'upcoming') {
    return (
      <NotReadyCard
        icon={
          <AssignmentOutlinedIcon />
        }
        title="Action items are not available yet"
      >
        Action items will be created from the
        meeting after it takes place.
      </NotReadyCard>
    )
  }

  if (items.length === 0) {
    return (
      <NotReadyCard
        icon={
          <AssignmentOutlinedIcon />
        }
        title="No action items"
      >
        No action items have been recorded for
        this meeting.
      </NotReadyCard>
    )
  }

  return (
    <SectionCard
      icon={
        <AssignmentOutlinedIcon />
      }
      title="Action items"
    >
      <Stack spacing={1}>
        {items.map((item, index) => (
          <ActionItem
            key={item.id || index}
            item={item}
          />
        ))}
      </Stack>
    </SectionCard>
  )
}

export function ActionItemsPreview({
  meeting,
  meetingState,
}) {
  const items =
    meeting.actionItems || []

  if (meetingState?.type === 'upcoming') {
    return (
      <NotReadyCard
        icon={
          <AssignmentOutlinedIcon />
        }
        title="Action items will appear after the meeting"
      >
        There are no action items yet because
        this meeting has not taken place.
      </NotReadyCard>
    )
  }

  if (items.length === 0) {
    return (
      <NotReadyCard
        icon={
          <AssignmentOutlinedIcon />
        }
        title="No action items"
      >
        No action items have been recorded for
        this meeting.
      </NotReadyCard>
    )
  }

  return (
    <SectionCard
      icon={
        <AssignmentOutlinedIcon />
      }
      title="Action items"
    >
      <Stack spacing={1}>
        {items.slice(0, 3).map(
          (item, index) => (
            <ActionItem
              key={item.id || index}
              item={item}
            />
          ),
        )}
      </Stack>
    </SectionCard>
  )
}
