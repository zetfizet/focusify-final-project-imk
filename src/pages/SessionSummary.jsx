import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../hooks/useAuth'
import { performFullDataSync } from '../services/migration'

export default function SessionSummary() {
  const [showSave, setShowSave] = useState(true)
  const [lastSession, setLastSession] = useState(null)
  const [allSessions, setAllSessions] = useState([])
  const { t } = useLanguage()
  const { isAuthenticated, loading } = useAuth()
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem('focusify_last_session') || 'null')
      const sessions = JSON.parse(localStorage.getItem('focusify_sessions') || '[]')
      setLastSession(session)
      setAllSessions(sessions)
    } catch (e) {
      console.error('Error loading session data:', e)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && !loading) {
      const doSync = async () => {
        setSyncing(true)
        try {
          const syncResult = await performFullDataSync()
          if (syncResult.success) {
            const sessions = JSON.parse(localStorage.getItem('focusify_sessions') || '[]')
            setAllSessions(sessions)
          }
        } catch (err) {
          console.error('Sync failed:', err)
        } finally {
          setSyncing(false)
        }
      }
      doSync()
    }
  }, [isAuthenticated, loading])

  // Calculate stats for today
  const today = new Date().toDateString()
  const todaySessions = allSessions.filter(s => new Date(s.endTime).toDateString() === today)
  const todayAvgScore = todaySessions.length ? Math.round(todaySessions.reduce((a, s) => a + s.score, 0) / todaySessions.length) : 0
  const todayTotalDuration = todaySessions.reduce((a, s) => a + s.duration, 0)

  // Calculate this week's stats
  const now = new Date()
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
  const weekSessions = allSessions.filter(s => new Date(s.endTime) >= weekStart)
  const weekTotalHours = (weekSessions.reduce((a, s) => a + s.duration, 0) / 60).toFixed(1)
  const weekAvgScore = weekSessions.length ? Math.round(weekSessions.reduce((a, s) => a + s.score, 0) / weekSessions.length) : 0

  if (!lastSession) {
    return (
      <>
        <nav>
          <Link className="nav-logo" to="/"><span className="dot"></span>Focusify</Link>
        </nav>
        <main className="container mini" style={{ textAlign: 'center' }}>
          <div style={{ marginTop: 60 }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--text2)' }}>{t('summary.noData') || 'No completed session data available.'}</p>
            <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>← {t('summary.backToDashboard') || 'Back to Dashboard'}</Link>
          </div>
        </main>
      </>
    )
  }

  const durationMins = lastSession.duration
  const durationStr = `${Math.floor(durationMins / 60)}:${(durationMins % 60).toString().padStart(2, '0')}`
  const completionPct = Math.round((lastSession.duration / lastSession.totalDuration) * 100)

  function toggleTheme() {
    const h = document.documentElement
    const d = h.getAttribute('data-theme') === 'dark'
    h.setAttribute('data-theme', d ? 'light' : 'dark')
    document.getElementById('thbtn').textContent = d ? '🌿' : '🌙'
  }

  return (
    <>
      <nav>
        <Link className="nav-logo" to="/"><span className="dot"></span>Focusify</Link>
        <button className="theme-btn" onClick={toggleTheme} id="thbtn">🌿</button>
      </nav>

      <main className="container mini">
        <div className="celeb">
          <span className="celeb-icon">🎉</span>
          <h1>{t('summary.title') || 'Session Complete!'}</h1>
          <p>{t('summary.subtitle') || "Great job! You've completed your study session with good focus."}</p>
        </div>

        {/* STUDY DURATION */}
        <div className="card">
          <div className="ctitle">⏱️ {t('summary.studyDuration') || 'Study Duration'}</div>
          <div className="dur-center">
            <div className="dur-ring">
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="36" fill="none" stroke="var(--border)" strokeWidth="9" />
                <circle cx="45" cy="45" r="36" fill="none" stroke="var(--accent)" strokeWidth="9" strokeDasharray="226" strokeDashoffset={226 - (226 * completionPct / 100)} strokeLinecap="round" transform="rotate(-90 45 45)" style={{ animation: 'growDash .9s ease .4s both' }} />
                <text x="45" y="50" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--accent)" fontFamily="DM Sans">{completionPct}%</text>
              </svg>
            </div>
            <div className="dur-info">
              <h2>{durationStr}</h2>
              <p>{t('summary.effectiveDuration') || 'Effective study duration'}</p>
              <small>{lastSession.status === 'done' ? t('summary.fullSessionDone') || 'Full session completed successfully' : t('summary.partialSessionDone') || 'Partial session completed'}</small>
            </div>
          </div>
          <div className="tag-row">
            <span className={`tag ${lastSession.status === 'done' ? 'green' : 'yellow'}`}>{lastSession.status === 'done' ? `✅ ${t('summary.tagFull') || 'Full Session Completed'}` : `⚠️ ${t('summary.tagPartial') || 'Partial Session'}`}</span>
            <span className="tag blue">{lastSession.type === 'Pomodoro' ? `🍅 ${t('setup.pomodoro') || 'Pomodoro'}` : `✏️ ${t('setup.customDuration') || 'Custom'}`}</span>
            <span className="tag blue">{lastSession.ambience}</span>
            {lastSession.focusMode && <span className="tag green">🛡️ {t('summary.tagFmActive') || 'Focus Mode Active'}</span>}
          </div>
        </div>

        {/* SESSION RESULT */}
        <div className="card">
          <div className="ctitle">📋 {t('summary.sessionResult') || 'Session Result'}</div>
          <div className="result-grid">
            <div className="rg-item"><div className="rg-n">{lastSession.score}%</div><div className="rg-l">{t('summary.focusScore') || 'Focus Score'}</div></div>
            <div className="rg-item"><div className="rg-n">{lastSession.distractions}x</div><div className="rg-l">{t('summary.distractionsPrevented') || 'Distractions Prevented'}</div></div>
            <div className="rg-item"><div className="rg-n">0x</div><div className="rg-l">{t('summary.sessionPaused') || 'Session Paused'}</div></div>
          </div>
          <div className="result-detail">
            <div className="rd-row"><span className="rd-lbl">{t('summary.sessionNameLbl') || 'Session Name'}</span><span className="rd-val">{lastSession.name}</span></div>
            <div className="rd-row"><span className="rd-lbl">{t('summary.startTimeLbl') || 'Start Time'}</span><span className="rd-val">{lastSession.timeLabel}</span></div>
            <div className="rd-row"><span className="rd-lbl">{t('summary.totalDurationLbl') || 'Total Duration'}</span><span className="rd-val">{lastSession.duration} {t('setup.minutes')}</span></div>
            <div className="rd-row"><span className="rd-lbl">{t('summary.methodLbl') || 'Method'}</span><span className="rd-val">{lastSession.type === 'Pomodoro' ? `🍅 ${t('setup.pomodoro')}` : `✏️ ${t('setup.customDuration')}`} ({lastSession.totalDuration}')</span></div>
            <div className="rd-row"><span className="rd-lbl">{t('summary.ambienceLbl') || 'Ambience'}</span><span className="rd-val">{lastSession.ambience}</span></div>
            <div className="rd-row"><span className="rd-lbl">{t('summary.statusLbl') || 'Status'}</span><span className="rd-val" style={{ color: 'var(--accent)' }}>{lastSession.status === 'done' ? `✅ ${t('summary.fullCompletion') || 'Full Completion'}` : `⚠️ ${t('summary.partialCompletion') || 'Partial Completion'}`}</span></div>
          </div>
        </div>

        {/* PROGRESS UPDATE */}
        <div className="card">
          <div className="ctitle">📈 {t('summary.progressUpdate') || 'Progress Update'}</div>
          <div className="pu-item"><div className="pu-labels"><span>{t('summary.dailyTarget') || 'Daily Target (4 sessions)'}</span><span>{todaySessions.length} / 4 {todaySessions.length >= 4 ? '✅' : ''}</span></div><div className="pu-bar"><div className="pu-fill" style={{ width: Math.min(100, (todaySessions.length / 4) * 100) + '%' }}></div></div></div>
          <div className="pu-item"><div className="pu-labels"><span>{t('summary.totalFocusWeek') || 'Total Focus This Week'}</span><span>{weekTotalHours} / 25 {t('summary.hours') || 'hours'}</span></div><div className="pu-bar"><div className="pu-fill" style={{ width: Math.min(100, (parseFloat(weekTotalHours) / 25) * 100) + '%' }}></div></div></div>
          <div className="pu-item"><div className="pu-labels"><span>{t('summary.totalSessionsMonth') || 'Total Sessions This Month'}</span><span>{allSessions.length} / 60 {t('summary.sessions') || 'sessions'}</span></div><div className="pu-bar"><div className="pu-fill" style={{ width: Math.min(100, (allSessions.length / 60) * 100) + '%' }}></div></div></div>
          <div className="pu-milestone">
            <span className="milestone">🔥 {todaySessions.length}-{t('summary.sessionDay') || 'Session Day!'}</span>
            <span className="milestone">🎯 {todayAvgScore}% {t('summary.avgScore') || 'Average Score'}</span>
            <span className="milestone">⭐ {lastSession.score}% {t('summary.thisSession') || 'This Session'}</span>
          </div>
        </div>

        {/* INSIGHTS */}
        <div className="card">
          <div className="ctitle">💡 {t('summary.sessionInsights') || 'Session Insights'}</div>
          <div className="ins-list">
            <div className="ins"><div className="ins-ic">🎯</div><div className="ins-t">{t('summary.insight1').replace('{score}', lastSession.score).replace('{desc}', lastSession.score >= 90 ? (t('summary.insightExcellent')||'excellent!') : lastSession.score >= 70 ? (t('summary.insightGood')||'good!') : (t('summary.insightImprove')||'keep improving!')).replace('{dist}', lastSession.distractions)}</div></div>
            <div className="ins"><div className="ins-ic">📈</div><div className="ins-t">{t('summary.insight2').replace('{min}', durationMins).replace('{avg}', weekAvgScore).replace('{count}', weekSessions.length)}</div></div>
            <div className="ins"><div className="ins-ic">🌱</div><div className="ins-t">{t('summary.insight3').replace('{count}', todaySessions.length).replace('{target}', todaySessions.length >= 4 ? (t('summary.targetAchieved')||'Daily target achieved! 🎉') : (t('summary.targetMore')||`${4 - todaySessions.length} more to reach your daily goal.`))}</div></div>
          </div>
        </div>

        {/* SAVE PROMPT */}
        {!loading && !isAuthenticated && showSave && (
          <div className="save-prompt">
            <h3>💾 {t('summary.savePromptTitle') || 'Save Session History?'}</h3>
            <p>{t('summary.savePromptDesc') || 'Sign in or register for free to save session history, track long-term learning statistics, and get deeper personal insights.'}</p>
            <button className="btn-save" onClick={() => window.location.href = '#/auth'}>🔐 {t('summary.saveBtn') || 'Sign In / Register to Save'}</button>
            <a className="skip-link" onClick={() => setShowSave(false)}>{t('summary.skipBtn') || 'Skip, continue without saving'}</a>
          </div>
        )}

        <div className="cta-row">
          <Link to="/session-setup" className="btn-next">▶ {t('summary.startNewBtn') || 'Start New Session'}</Link>
          <Link to="/" className="btn-dash">🏠 {t('summary.backToDashboard') || 'Back to Dashboard'}</Link>
        </div>
      </main>
    </>
  )
}
