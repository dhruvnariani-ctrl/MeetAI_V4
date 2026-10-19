
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function PageShell({
  title,
  subtitle,
  children,
  contentSx = {},
}) {
  return (
    <Box
      component="section"
      sx={{
        width: '100%',
        minWidth: 0,
      }}
    >
      {title && (
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h1" component="h1">
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                maxWidth: '70ch',
                color: 'text.secondary',
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      <Box
        sx={{
          mt: title || subtitle ? 1.5 : 0,
          minWidth: 0,
          ...contentSx,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export function EmptyPanel({
  title = 'Nothing to show yet',
  children,
  minHeight = 200,
  action,
}) {
  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
        bgcolor: 'background.paper',
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: '12px',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 380,
          textAlign: 'center',
        }}
      >
        <Typography
          component="h2"
          variant="h2"
          sx={{ mb: 1 }}
        >
          {title}
        </Typography>

        {children && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.6,
            }}
          >
            {children}
          </Typography>
        )}

        {action && (
          <Box sx={{ mt: 2 }}>
            {action}
          </Box>
        )}
      </Box>
    </Box>
  )
}
