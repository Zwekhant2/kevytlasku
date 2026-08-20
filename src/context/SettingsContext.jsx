import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getSettings, updateSettings } from '../api/settings'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .finally(() => setLoading(false))
  }, [])

  const saveSettings = useCallback(async (input) => {
    const updated = await updateSettings(input)
    setSettings(updated)
    return updated
  }, [])

  const value = { settings, loading, saveSettings }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
