// Green-to-blue pill used for the "Create meeting" buttons.
export const gradientButtonSx = (height = 32) => ({
  height,
  px: height > 32 ? 2.25 : 1.75,
  borderRadius: `${height / 2}px`,
  fontSize: height > 32 ? '0.875rem' : '0.8125rem',
  fontWeight: 600,
  background: 'linear-gradient(90deg, #0b7f62, #0967B2)',
  '&:hover': { filter: 'brightness(1.08)' },
})

export const outlinedPillSx = (height = 36) => ({
  height,
  px: 2.25,
  borderRadius: `${height / 2}px`,
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'text.primary',
  bgcolor: '#fff',
  borderColor: '#b9c8dc',
  '&:hover': { bgcolor: '#f1f6fd', borderColor: 'primary.main' },
})