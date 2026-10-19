import { Component } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

import { EmptyPanel } from './PageShell'

/* Shown while a lazy page loads (and later, while data loads). */
export function PageSkeleton() {
  return (
    <Stack spacing={1.5} role="status" aria-busy="true" aria-label="Loading page">
      <Skeleton variant="rounded" width={220} height={32} />
      <Skeleton variant="rounded" height={96} />
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' } }}>
        <Skeleton variant="rounded" height={320} />
        <Skeleton variant="rounded" height={320} />
      </Box>
    </Stack>
  )
}

/* Catches render errors in a page so the header and sidebar keep working. */
export class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidUpdate(prev) {
    if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({ failed: false })
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <EmptyPanel
        title="Something went wrong"
        action={<Button onClick={() => window.location.reload()}>Reload page</Button>}
      >
        This page could not be shown. Reload it, or use the sidebar to go somewhere else.
      </EmptyPanel>
    )
  }
}
