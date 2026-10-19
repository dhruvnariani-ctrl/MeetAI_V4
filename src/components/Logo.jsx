import Box from '@mui/material/Box'

/**
 * Avaada brand footer.
 * Expanded  -> full logo (swoosh + AVAADA + tagline)
 * Compact   -> swoosh only
 *
 * Files expected in /public/images/:
 *   avaada-logo.png     (full logo)
 *   avaada-swoosh.png   (swoosh only)
 */
export default function Logo({ compact = false }) {
  return (
    <Box
      component="a"
      href="/"
      aria-label="Avaada — Energy. Climate. A better tomorrow. Home"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minWidth: 0,
        py: 0.5,
        textDecoration: 'none',
        '&:focus-visible': {
          outline: '2px solid #0967B2',
          outlineOffset: 2,
          borderRadius: '12px',
        },
      }}
    >
      <Box
        component="img"
        src={
          compact
            ? `${import.meta.env.BASE_URL}/images/avaada-swoosh.png`
            : `${import.meta.env.BASE_URL}/images/avaada-logo.png`
        }
        alt=""
        aria-hidden="true"
        draggable={false}
        sx={{
          display: 'block',
          width: compact ? 46 : 168,
          '@media (max-height: 760px)': { width: compact ? 38 : 130 },
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </Box>
  )
}