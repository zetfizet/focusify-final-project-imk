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
