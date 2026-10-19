import { useEffect } from 'react'

// Gives each page its own browser tab title (also what screen readers announce on navigation).
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = `${title} · MeetAI`
  }, [title])
}