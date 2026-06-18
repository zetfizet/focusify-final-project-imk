import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Dashboard from './pages/Dashboard'
import AuthPage from './pages/AuthPage'
import SessionSetup from './pages/SessionSetup'
import ActiveSession from './pages/ActiveSession'
import SessionSummary from './pages/SessionSummary'
import Progress from './pages/Progress'
import Settings from './pages/Settings'

export default function App() {
  // Global Notification Scheduler
  useEffect(() => {
    // Request permission if enabled in localStorage on start
    if (localStorage.getItem('focusify_daily_reminder') !== 'false' && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }

    const interval = setInterval(() => {
      const isEnabled = localStorage.getItem('focusify_daily_reminder') !== 'false'
      if (!isEnabled) return

      const reminderTime = localStorage.getItem('focusify_reminder_time') || '19:30' // e.g. "08:22" or "19:30"
      
      const now = new Date()
      const currentHour = now.getHours().toString().padStart(2, '0')
      const currentMin = now.getMinutes().toString().padStart(2, '0')
      const currentTimeString = `${currentHour}:${currentMin}`

      // Check match
      if (currentTimeString === reminderTime) {
        const todayStr = now.toDateString()
        const lastSent = localStorage.getItem('focusify_last_reminder_sent')

        if (lastSent !== todayStr) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Focusify', {
              body: 'Time to start your daily focus session! Let\'s stay productive.',
              icon: '/favicon.ico'
            })
            localStorage.setItem('focusify_last_reminder_sent', todayStr)
          }
        }
      }
    }, 30000) // check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Global Animations Controller
  useEffect(() => {
    const animsEnabled = localStorage.getItem('focusify_animations_enabled') !== 'false'
    if (!animsEnabled) {
      document.documentElement.classList.add('no-animations')
    } else {
      document.documentElement.classList.remove('no-animations')
    }
  }, [])

  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/session-setup" element={<SessionSetup />} />
          <Route path="/active-session" element={<ActiveSession />} />
          <Route path="/session-summary" element={<SessionSummary />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AuthProvider>
    </LanguageProvider>
  )
}
