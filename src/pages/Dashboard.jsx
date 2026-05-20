import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../hooks/useAuth'

const SESSION_ICONS = ['📖','✍️','💻','📝','🔢','🎨','📚','🖥️','🧪','📐','🎯','🌐']

function getRandomIcon(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i)
  return SESSION_ICONS[Math.abs(hash) % SESSION_ICONS.length]
}

function getStoredSessions() {
  try { return JSON.parse(localStorage.getItem('focusify_sessions') || '[]') } catch(e) { return [] }
}

function getDateLabel(isoStr) {
  const d = new Date(isoStr)
  const now = new Date()
  const today = now.toDateString()
  const yesterday = new Date(now - 86400000).toDateString()
  if (d.toDateString() === today) return 'Today'
  if (d.toDateString() === yesterday) return 'Yesterday'
  const diff = Math.floor((now - d) / 86400000)
  if (diff < 7) return `${diff} days ago`
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

function calculateStreak(sessions) {
  if (!sessions || sessions.length === 0) return 0
  const uniqueDays = Array.from(
    new Set(sessions.map(s => new Date(s.endTime).toDateString()))
  ).map(d => new Date(d))
  
  uniqueDays.sort((a, b) => b - a)
  
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  
  const newestDateStr = uniqueDays[0].toDateString()
  if (newestDateStr !== today && newestDateStr !== yesterday) {
    return 0
  }
  
  let streak = 1
  for (let i = 0; i < uniqueDays.length - 1; i++) {
    const diffTime = Math.abs(uniqueDays[i] - uniqueDays[i+1])
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 1) {
      streak++
    } else if (diffDays > 1) {
      break
    }
  }
  return streak
}

export default function Dashboard() {
  const [sessions, setSessions] = useState(getStoredSessions)
  const { t } = useLanguage()
  const { isAuthenticated, user, loading } = useAuth()

  useEffect(() => {
    const onFocus = () => setSessions(getStoredSessions())
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  function pickAmb(e) {
    document.querySelectorAll('.amb-btn').forEach(b => b.classList.remove('active'))
    e.currentTarget.classList.add('active')
  }

  // Calculate stats
  const today = new Date().toDateString()
  const todaySessions = sessions.filter(s => new Date(s.endTime).toDateString() === today)
  const todayTotal = todaySessions.reduce((a, s) => a + s.duration, 0)
  const todayAvgScore = todaySessions.length ? Math.round(todaySessions.reduce((a, s) => a + s.score, 0) / todaySessions.length) : 0
  const DAILY_TARGET = Number(localStorage.getItem('focusify_target_sessions') || 4)
  const dailyProgressPct = Math.min(100, Math.round((todaySessions.length / DAILY_TARGET) * 100))
  const dailyDashOffset = 188 - (188 * dailyProgressPct / 100)
  
  // Calculate day streak count
  const streakCount = calculateStreak(sessions)

  // Calculate week streak days
  const todayDate = new Date()
  const dayOfIndex = todayDate.getDay()
  const mondayDiff = dayOfIndex === 0 ? -6 : 1 - dayOfIndex
  const startOfWeek = new Date(todayDate.getTime())
  startOfWeek.setDate(todayDate.getDate() + mondayDiff)
  startOfWeek.setHours(0, 0, 0, 0)

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const activeDays = new Set(sessions.map(s => new Date(s.endTime).toDateString()))

  const streakDays = weekDays.map((name, i) => {
    const dayDate = new Date(startOfWeek.getTime())
    dayDate.setDate(startOfWeek.getDate() + i)
    const isOk = activeDays.has(dayDate.toDateString())
    return { name, isOk }
  })

  // Calculate this week's stats
  const now = new Date()
  const weekStart = new Date(now.getTime() - (now.getDay() * 86400000))
  weekStart.setHours(0,0,0,0)
  const weekSessions = sessions.filter(s => new Date(s.endTime) >= weekStart)
  const weekTotal = (weekSessions.reduce((a, s) => a + s.duration, 0) / 60).toFixed(1)
  const weekAvgScore = weekSessions.length ? Math.round(weekSessions.reduce((a, s) => a + s.score, 0) / weekSessions.length) : 0
  
  // Calculate this month's stats (30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const monthSessions = sessions.filter(s => new Date(s.endTime) >= thirtyDaysAgo)
  
  // Recent sessions (top 4)
  const recentSessions = sessions.slice(0, 4)

  return (
    <>
      <Navbar />
      <main className="container wide">


        {/* HERO */}
        <div className="hero">
          <div className="hero-text">
            <h1>
              {isAuthenticated && user ? `${t('dashboard.welcome') || 'Welcome back'}, ${user.username || user.email.split('@')[0]}!` : (t('dashboard.welcome') || 'Welcome') }
              <br /><em>Focusify</em> 🌱
            </h1>
            <p>{t('dashboard.subtitle')}</p>
            <div className="hero-cta">
              <Link to="/session-setup" className="btn-hero">▶ {t('dashboard.startFocus')}</Link>
              <Link to="/progress" className="btn-hero-ghost">📊 {t('dashboard.viewProgress')}</Link>
            </div>
          </div>
          <div className="hero-circles">
            <div className="h-circle"><span className="n">{todaySessions.length}</span><span className="l">{t('dashboard.todaySessions')}</span></div>
            <div className="h-circle"><span className="n">{(todayTotal / 60).toFixed(1)}h</span><span className="l">{t('dashboard.totalFocus')}</span></div>
            <div className="h-circle"><span className="n">🔥{streakCount}</span><span className="l">{t('dashboard.dayStreak')}</span></div>
          </div>
        </div>

        {/* KPI */}
        <div className="g4">
          <div className="card kpi"><div className="kpi-n">{monthSessions.length || 0}</div><div className="kpi-l">{t('dashboard.monthSessions')}</div><div className="kpi-d">{t('dashboard.last30Days')}</div></div>
          <div className="card kpi"><div className="kpi-n">{weekTotal}h</div><div className="kpi-l">{t('dashboard.weekFocus')}</div><div className="kpi-d">{t('dashboard.thisWeek')}</div></div>
          <div className="card kpi"><div className="kpi-n">{weekAvgScore || 0}%</div><div className="kpi-l">{t('dashboard.avgScore')}</div><div className="kpi-d">{t('dashboard.weeklyAvg')}</div></div>
          <div className="card kpi"><div className="kpi-n">🔥{streakCount}</div><div className="kpi-l">{t('dashboard.dayStreak')}</div><div className="kpi-d" style={{ color: 'var(--accent)' }}>{t('dashboard.currentStreak') || 'Current Streak'}</div></div>
        </div>

        {/* Progress + Streak */}
        <div className="g2">
          <div className="card">
            <div className="ctitle">🎯 {t('dashboard.progressOverview')}</div>
            <div className="ring-row">
              <svg width="78" height="78" viewBox="0 0 78 78">
                <circle cx="39" cy="39" r="30" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle cx="39" cy="39" r="30" fill="none" stroke="var(--accent)" strokeWidth="8" strokeDasharray="188" strokeDashoffset={dailyDashOffset} strokeLinecap="round" transform="rotate(-90 39 39)" />
                <text x="39" y="44" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--accent)" fontFamily="DM Sans">{dailyProgressPct}%</text>
              </svg>
              <div className="ring-info">
                <h3>{todaySessions.length} / {DAILY_TARGET}</h3>
                <p>{t('dashboard.sessionsCompleted')}</p>
                <small>{t('dashboard.dailyTarget').replace('{count}', DAILY_TARGET)}</small>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <Link to="/progress#daily" className="prog-link"><span className="pl-l">📅 {t('dashboard.dailyProgress')}</span><span className="pl-r">{t('dashboard.today')}</span><span className="arrow">›</span></Link>
              <Link to="/progress#weekly" className="prog-link"><span className="pl-l">📆 {t('dashboard.weeklySummary')}</span><span className="pl-r">{t('dashboard.thisWeekSummary')}</span><span className="arrow">›</span></Link>
              <Link to="/progress#stats" className="prog-link"><span className="pl-l">📊 {t('dashboard.studyStats')}</span><span className="pl-r">{t('dashboard.fullStats')}</span><span className="arrow">›</span></Link>
              <Link to="/progress#history" className="prog-link" style={{ marginBottom: 0 }}><span className="pl-l">🕐 {t('dashboard.sessionHistory')}</span><span className="pl-r">{t('dashboard.allHistory')}</span><span className="arrow">›</span></Link>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <div className="ctitle">🗓️ {t('dashboard.thisWeekStreak')}</div>
              <div className="streak-row">
                {streakDays.map((day, idx) => (
                  <div key={idx} className={`sd ${day.isOk ? 'ok' : ''}`}>
                    <div className="d"></div>
                    <span>{day.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="ctitle">🎵 {t('dashboard.activeAmbience')}</div>
              <div className="amb-grid">
                <div className="amb-btn active" onClick={pickAmb}><span className="ai">🌧️</span><span className="al">{t('setup.rain') || 'Rain'}</span></div>
                <div className="amb-btn" onClick={pickAmb}><span className="ai">🌿</span><span className="al">{t('setup.forest') || 'Forest'}</span></div>
                <div className="amb-btn" onClick={pickAmb}><span className="ai">☕</span><span className="al">{t('setup.cafe') || 'Cafe'}</span></div>
                <div className="amb-btn" onClick={pickAmb}><span className="ai">🌊</span><span className="al">{t('setup.beach') || 'Beach'}</span></div>
                <div className="amb-btn" onClick={pickAmb}><span className="ai">🔥</span><span className="al">{t('setup.fire') || 'Fire'}</span></div>
                <div className="amb-btn" onClick={pickAmb}><span className="ai">🤫</span><span className="al">{t('setup.silence') || 'Silent'}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sessions + Focus Settings */}
        <div className="g2">
          <div className="card">
            <div className="ctitle">🕐 {t('dashboard.recentSessions')}</div>
            <div className="sess-list">
              {recentSessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text2)', fontSize: '.9rem' }}>
                  <p>{t('dashboard.noSessionsYet')} <Link to="/session-setup" style={{ color: 'var(--accent)' }}>{t('dashboard.startFirst')}</Link></p>
                </div>
              ) : (
                recentSessions.map((s, i) => (
                  <Link key={i} to="/progress#history" className="si">
                    <div className="si-ic">{getRandomIcon(s.name)}</div>
                    <div className="si-info">
                      <div className="si-name">{s.name}</div>
                      <div className="si-meta">{getDateLabel(s.endTime)} · {s.duration} min · {s.type}</div>
                    </div>
                    <span className={`si-badge ${s.status === 'done' ? 'done' : 'part'}`}>{s.status === 'done' ? t('dashboard.completed') : t('dashboard.partial')}</span>
                  </Link>
                ))
              )}
            </div>
            <Link to="/progress#history" className="sess-more">{t('dashboard.viewAllHistory')}</Link>
          </div>

          <div className="card">
            <div className="ctitle">⚡ {t('dashboard.focusSettings')}</div>
            <div className="trow"><div className="tinfo"><div className="tl">{t('dashboard.focusMode')}</div><div className="ts">{t('dashboard.focusModeDesc')}</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
            <div className="trow"><div className="tinfo"><div className="tl">{t('dashboard.restReminder')}</div><div className="ts">{t('dashboard.restReminderDesc')}</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
            <div className="trow"><div className="tinfo"><div className="tl">{t('dashboard.distractionWarning')}</div><div className="ts">{t('dashboard.distractionWarningDesc')}</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
            <div className="trow"><div className="tinfo"><div className="tl">{t('dashboard.ambienceSound')}</div><div className="ts">{t('dashboard.ambienceSoundDesc')}</div></div><label className="tog"><input type="checkbox" /><span className="sldr"></span></label></div>
            <div style={{ marginTop: 16 }}><Link to="/settings" style={{ fontSize: '.8rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>⚙️ {t('dashboard.moreSettings')}</Link></div>
          </div>
        </div>

        {!loading && !isAuthenticated && (
          <div className="login-hint">🔒 {t('dashboard.saveProgressDesc')} <Link to="/auth">{t('dashboard.signInLink')}</Link></div>
        )}
      </main>
    </>
  )
}
