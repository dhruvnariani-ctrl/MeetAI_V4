import Box from '@mui/material/Box'
import Pagination from '@mui/material/Pagination'
import Typography from '@mui/material/Typography'

/* "Showing 1-6 of 14" plus page buttons. Pass the object returned by usePagination. */
export default function PaginationBar({ pager, label = 'items', sx }) {
  if (!pager.total) return null

  return (
    <Box
      component="nav"
      aria-label={`${label} pagination`}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: { xs: 'center', sm: 'space-between' },
        gap: 1,
        px: 1.5,
        py: 1,
        borderTop: '1px solid',
        borderColor: 'divider',
        ...sx,
      }}
    >
      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
        Showing {pager.from}–{pager.to} of {pager.total} {label}
      </Typography>

      {pager.pageCount > 1 && (
        <Pagination
          size="small"
          shape="rounded"
          color="primary"
          count={pager.pageCount}
          page={pager.page}
          siblingCount={0}
          onChange={(_, next) => pager.setPage(next)}
        />
      )}
    </Box>
  )
}
