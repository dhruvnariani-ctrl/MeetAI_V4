import { useEffect, useState } from 'react'

import { getMeetingSettings, subscribeMeetingSettings } from '../data/meetingSettings'

/*
 * The saved MeetAI switches for every meeting, kept live.
 * Change them with saveMeetingSettings / saveMeetingSettingsBulk and every
 * page using this hook updates, including pages in other browser tabs.
 */
export default function useMeetingSettings() {
  const [settings, setSettings] = useState(() => getMeetingSettings())

  useEffect(() => subscribeMeetingSettings(() => setSettings(getMeetingSettings())), [])

  return settings
}