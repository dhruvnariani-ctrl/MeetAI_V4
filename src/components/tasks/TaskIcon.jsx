import {
  AssignmentOutlined,
  DescriptionOutlined,
  FlagOutlined,
  TaskAltOutlined,
} from '@mui/icons-material'

import { normalizeTaskPriority, normalizeTaskStatus } from '../../data/tasks'

export default function TaskIcon({ task }) {
  if (normalizeTaskStatus(task.status) === 'Blocked') return <FlagOutlined />

  const priority = normalizeTaskPriority(task.priority)

  if (priority === 'High') return <DescriptionOutlined />
  if (priority === 'Medium') return <TaskAltOutlined />

  return <AssignmentOutlined />
}
