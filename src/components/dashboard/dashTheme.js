// Tokens for the top-nav dashboard. Text colours are picked to stay AA-readable.
export const D = {
  navy: '#14275E',
  card: '#10235A',
  text: '#24366B',
  muted: '#55658A',
  line: '#D3DCEE',
  band: '#E4EBF8',
  page: '#EEF3FB',
  green: '#35801A',
  greenText: '#2F7A12',
  live: '#7BD34A',
}

export const serif = "'Instrument Serif', Georgia, 'Times New Roman', serif"

export const titleSx = {
  m: 0,
  fontFamily: serif,
  fontWeight: 400,
  fontSize: '1.6rem',
  lineHeight: 1.2,
  color: D.navy,
}

// Section heading row: thin navy rule on top, title left, links right.
export const sectionHeadSx = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: 1,
  flexWrap: 'wrap',
  pt: 1.5,
  borderTop: `1px solid ${D.navy}`,
}

// Text-style link button ("Open Calendar ↗").
export const linkSx = {
  minWidth: 0,
  p: 0,
  fontSize: '.6875rem',
  fontWeight: 500,
  textTransform: 'none',
  color: D.navy,
  '& .MuiButton-endIcon': { ml: 0.25 },
  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
  '&:focus-visible': { outline: `2px solid ${D.navy}`, outlineOffset: 2 },
}

export const time24 = (value) =>
  new Date(value).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })