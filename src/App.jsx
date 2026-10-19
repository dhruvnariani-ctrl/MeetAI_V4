import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout'

// Each page loads on first visit; AppLayout shows a skeleton meanwhile.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const CalendarPage = lazy(() => import('./pages/CalendarPage'))
const RecordedMeetings = lazy(() => import('./pages/RecordedMeetings'))
const MyTasks = lazy(() => import('./pages/MyTasks'))
const MeetingDetails = lazy(() => import('./pages/MeetingDetails'))
const HowItWorks = lazy(() => import('./pages/HowItWorks'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Header + sidebar live in AppLayout and stay put; only the page inside <Outlet /> changes.
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="recorded" element={<RecordedMeetings />} />
        <Route path="tasks" element={<MyTasks />} />
        <Route path="meetings/:meetingId" element={<MeetingDetails />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
