import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'

export default function ActionItem({ item }) {
  const done =
    item.status === 'Done' ||
    item.completed === true

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        p: 1.25,
        border: '1px solid #e5eaf0',
        borderRadius: '12px',
      }}
    >
      {done ? (
        <CheckCircleOutlineIcon
          sx={{
            fontSize: 18,
            color: '#287a4d',
            mt: 0.1,
          }}
        />
      ) : (
        <RadioButtonUncheckedIcon
          sx={{
            fontSize: 18,
            color: '#9aa7b7',
            mt: 0.1,
          }}
        />
      )}

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: '0.75rem',
            lineHeight: 1.5,
            color: '#24364d',
            textDecoration: done
              ? 'line-through'
              : 'none',
          }}
        >
          {item.title}
        </Typography>

        {item.owner && (
          <Typography
            sx={{
              mt: 0.3,
              fontSize: '0.75rem',
              color: '#7b8ba1',
            }}
          >
            Owner: {item.owner}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
