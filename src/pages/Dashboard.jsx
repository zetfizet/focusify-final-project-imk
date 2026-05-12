import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'

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
  if (diff < 7) return `${diff} hours ago`
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

export default function Dashboard() {
  const [sessions, setSessions] = useState(getStoredSessions)

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
  const DAILY_TARGET = 4
  const dailyProgressPct = Math.min(100, Math.round((todaySessions.length / DAILY_TARGET) * 100))
  const dailyDashOffset = 188 - (188 * dailyProgressPct / 100)
  
  // Calculate this week's stats
  const now = new Date()
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
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
      <main style={{ paddingTop: 'calc(var(--nav-h) + 32px)', paddingBottom: 64, maxWidth: 1100, margin: '0 auto', paddingLeft: 28, paddingRight: 28 }}>
        {/* HERO */}
        <div className="hero">
          <div className="hero-text">
            <h1>Welcome to<br /><em>Focusify</em> 🌱</h1>
            <p>Reduce digital distractions, build consistent study habits, and track your progress every day.</p>
            <div className="hero-cta">
              <Link to="/session-setup" className="btn-hero">▶ Start Focus Session</Link>
              <Link to="/progress" className="btn-hero-ghost">📊 View Progress</Link>
            </div>
          </div>
          <div className="hero-circles">
            <div className="h-circle"><span className="n">{todaySessions.length}</span><span className="l">Today's Sessions</span></div>
            <div className="h-circle"><span className="n">{(todayTotal / 60).toFixed(1)}h</span><span className="l">Total Focus</span></div>
            <div className="h-circle"><span className="n">🔥5</span><span className="l">Day Streak</span></div>
          </div>
        </div>

        {/* KPI */}
        <div className="g4">
          <div className="card kpi"><div className="kpi-n">{monthSessions.length || 0}</div><div className="kpi-l">Total Sessions This Month</div><div className="kpi-d">↑ Last 30 days</div></div>
          <div className="card kpi"><div className="kpi-n">{weekTotal}h</div><div className="kpi-l">Total Focus This Week</div><div className="kpi-d">↑ This week</div></div>
          <div className="card kpi"><div className="kpi-n">{weekAvgScore || 0}%</div><div className="kpi-l">Avg Focus Score</div><div className="kpi-d">↑ Weekly average</div></div>
          <div className="card kpi"><div className="kpi-n">🔥{todaySessions.length || 0}</div><div className="kpi-l">Today's Sessions</div><div className="kpi-d" style={{ color: 'var(--accent)' }}>Target: 4</div></div>
        </div>

        {/* Progress + Streak */}
        <div className="g2">
          <div className="card">
            <div className="ctitle">🎯 Progress Overview</div>
            <div className="ring-row">
              <svg width="78" height="78" viewBox="0 0 78 78">
                <circle cx="39" cy="39" r="30" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle cx="39" cy="39" r="30" fill="none" stroke="var(--accent)" strokeWidth="8" strokeDasharray="188" strokeDashoffset={dailyDashOffset} strokeLinecap="round" transform="rotate(-90 39 39)" />
                <text x="39" y="44" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--accent)" fontFamily="DM Sans">{dailyProgressPct}%</text>
              </svg>
              <div className="ring-info">
                <h3>{todaySessions.length} / {DAILY_TARGET}</h3>
                <p>Sessions completed today</p>
                <small>Daily target: {DAILY_TARGET} sessions</small>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <Link to="/progress#daily" className="prog-link"><span className="pl-l">📅 Daily Progress</span><span className="pl-r">Today</span><span className="arrow">›</span></Link>
              <Link to="/progress#weekly" className="prog-link"><span className="pl-l">📆 Weekly Summary</span><span className="pl-r">This week</span><span className="arrow">›</span></Link>
              <Link to="/progress#stats" className="prog-link"><span className="pl-l">📊 Study Statistics</span><span className="pl-r">Full stats</span><span className="arrow">›</span></Link>
              <Link to="/progress#history" className="prog-link" style={{ marginBottom: 0 }}><span className="pl-l">🕐 Session History</span><span className="pl-r">All history</span><span className="arrow">›</span></Link>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <div className="ctitle">🗓️ This Week's Streak</div>
              <div className="streak-row">
                <div className="sd ok"><div className="d"></div><span>Mon</span></div>
                <div className="sd ok"><div className="d"></div><span>Tue</span></div>
                <div className="sd ok"><div className="d"></div><span>Wed</span></div>
                <div className="sd ok"><div className="d"></div><span>Thu</span></div>
                <div className="sd ok"><div className="d"></div><span>Fri</span></div>
                <div className="sd"><div className="d"></div><span>Sat</span></div>
                <div className="sd"><div className="d"></div><span>Sun</span></div>
              </div>
            </div>
            <div className="card">
              <div className="ctitle">🎵 Active Ambience</div>
              <div className="amb-grid">
                <div className="amb-btn active" onClick={pickAmb}><span className="ai">🌧️</span><span className="al">Rain</span></div>
                <div className="amb-btn" onClick={pickAmb}><span className="ai">🌿</span><span className="al">Forest</span></div>
                <div className="amb-btn" onClick={pickAmb}><span className="ai">☕</span><span className="al">Cafe</span></div>
                <div className="amb-btn" onClick={pickAmb}><span className="ai">🌊</span><span className="al">Beach</span></div>
                <div className="amb-btn" onClick={pickAmb}><span className="ai">🔥</span><span className="al">Fire</span></div>
                <div className="amb-btn" onClick={pickAmb}><span className="ai">🤫</span><span className="al">Silent</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sessions + Focus Settings */}
        <div className="g2">
          <div className="card">
            <div className="ctitle">🕐 Recent Sessions</div>
            <div className="sess-list">
              {recentSessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text2)', fontSize: '.9rem' }}>
                  <p>No sessions yet. <Link to="/session-setup" style={{ color: 'var(--accent)' }}>Start your first session →</Link></p>
                </div>
              ) : (
                recentSessions.map((s, i) => (
                  <Link key={i} to="/progress#history" className="si">
                    <div className="si-ic">{getRandomIcon(s.name)}</div>
                    <div className="si-info">
                      <div className="si-name">{s.name}</div>
                      <div className="si-meta">{getDateLabel(s.endTime)} · {s.duration} min · {s.type}</div>
                    </div>
                    <span className={`si-badge ${s.status === 'done' ? 'done' : 'part'}`}>{s.status === 'done' ? 'Completed' : 'Partial'}</span>
                  </Link>
                ))
              )}
            </div>
            <Link to="/progress#history" className="sess-more">View all history →</Link>
          </div>

          <div className="card">
            <div className="ctitle">⚡ Focus Settings</div>
            <div className="trow"><div className="tinfo"><div className="tl">Focus Mode</div><div className="ts">Block notifications & social media</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
            <div className="trow"><div className="tinfo"><div className="tl">Rest Reminder</div><div className="ts">Alert when it's time to break</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
            <div className="trow"><div className="tinfo"><div className="tl">Distraction Warning</div><div className="ts">Alert if you open another app</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
            <div className="trow"><div className="tinfo"><div className="tl">Ambience Sound</div><div className="ts">Background music during sessions</div></div><label className="tog"><input type="checkbox" /><span className="sldr"></span></label></div>
            <div style={{ marginTop: 16 }}><Link to="/settings" style={{ fontSize: '.8rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>⚙️ More settings →</Link></div>
          </div>
        </div>

        <div className="login-hint">🔒 Save your progress! <Link to="/auth">Sign in or register</Link> to enable persistent session tracking across all devices.</div>
      </main>
    </>
  )
}
