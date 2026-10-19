// Shared look for the Today/Week/Monthly tabs and the List/Grid toggle.
export const segmentedGroupSx = {
  p: '5px',
  gap: '2px',
  minHeight: 0,
  width: 'fit-content',
  bgcolor: '#f8fafc',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '12px',
}

export const segmentedItemSx = {
  minHeight: 33,
  minWidth: 0,
  px: '14px',
  py: 0,
  border: 0,
  borderRadius: '8px',
  fontSize: '0.9375rem',
  fontWeight: 500,
  color: 'text.secondary',
  '&.Mui-selected, &.Mui-selected:hover': {
    bgcolor: 'primary.main',
    color: '#fff',
    fontWeight: 600,
  },
}