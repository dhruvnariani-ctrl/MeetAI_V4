import Box from '@mui/material/Box'

import ActionItem from './ActionItem'
import { SectionCard, NotReadyCard } from './ui'

export default function ActionItemsTab({ meeting, meetingState }) {
  const items = meeting.actionItems || []

  const upcoming =
    meetingState?.type === 'upcoming' ||
    meetingState?.type === 'starting-soon'

  if (upcoming) {
    return (
      <NotReadyCard title="Action items are not available yet">
        Action items will be created from the meeting after it takes place.
      </NotReadyCard>
    )
  }

  if (items.length === 0) {
    return (
      <NotReadyCard title="No action items">
        No action items have been recorded for this meeting.
      </NotReadyCard>
    )
  }

  return (
    <SectionCard title="Action items">
      <Box sx={{ display: 'grid', gap: 1 }}>
        {items.map((item, index) => (
          <ActionItem
            key={item.id || index}
            item={item}
          />
        ))}
      </Box>
    </SectionCard>
  )
}