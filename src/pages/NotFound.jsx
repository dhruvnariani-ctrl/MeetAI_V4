import { Link as RouterLink } from 'react-router-dom'
import Button from '@mui/material/Button'
import PageShell from '../components/PageShell'
import usePageTitle from '../hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <PageShell title="Page not found" subtitle="That page doesn't exist.">
      <Button component={RouterLink} to="/" variant="contained" disableElevation>Back to Dashboard</Button>
    </PageShell>
  )
}