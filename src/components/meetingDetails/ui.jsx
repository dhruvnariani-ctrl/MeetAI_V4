import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

/* -------------------------------------------------------------------------- */
/* Reusable UI                                                                */
/* -------------------------------------------------------------------------- */

export function SectionCard({
  icon,
  title,
  children,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid #DFE7EC',
        borderRadius: '8px',
        bgcolor: '#fff',
        p: {
          xs: 1.75,
          sm: 2,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.9,
          mb: 1.25,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: '#0967B2',

            '& svg': {
              fontSize: 19,
            },
          }}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            fontSize: '0.875rem',
            fontWeight: 750,
            color: '#123A59',
          }}
        >
          {title}
        </Typography>
      </Box>

      {children}
    </Paper>
  )
}

export function InfoCard({
  label,
  value,
  icon,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid #DFE7EC',
        borderRadius: '8px',
        bgcolor: '#fff',
        p: 1.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          color: '#66778d',
        }}
      >
        {icon}

        <Typography
          sx={{
            fontSize: '0.75rem',
            color: '#7b8ba1',
          }}
        >
          {label}
        </Typography>
      </Box>

      <Typography
        sx={{
          mt: 0.6,
          fontSize: '0.875rem',
          fontWeight: 700,
          color: '#123A59',
        }}
      >
        {value}
      </Typography>
    </Paper>
  )
}

export function NotReadyCard({
  icon,
  title,
  children,
}) {
  return (
    <SectionCard
      icon={icon}
      title={title}
    >
      <NotReadyMessage>
        {children}
      </NotReadyMessage>
    </SectionCard>
  )
}

export function NotReadyMessage({
  children,
}) {
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: '8px',
        bgcolor: '#f8fafc',
        border: '1px solid #e5eaf0',
      }}
    >
      <Typography
        sx={{
          fontSize: '0.75rem',
          lineHeight: 1.6,
          color: '#66778d',
        }}
      >
        {children}
      </Typography>
    </Box>
  )
}