import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../hooks/useAuth'

const SESSION_ICONS = ['📖','✍️','💻','📝','🔢','🎨','📚','🖥️','🧪','📐','🎯','🌐']

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

function getScoreClass(score) {
  if (score >= 85) return 'hs-h'
  if (score >= 60) return 'hs-m'
  return 'hs-l'
}

function getRandomIcon(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i)
  return SESSION_ICONS[Math.abs(hash) % SESSION_ICONS.length]
}

function generateWeeklyBarChart(sessions) {
  const now = new Date()
  const weekStart = new Date(now.getTime() - (now.getDay() * 86400000))
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const bars = []
  
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(weekStart.getTime() + (i * 86400000))
    const dayEnd = new Date(dayStart.getTime() + 86400000)
    const daySessions = sessions.filter(s => {
      const sessionDate = new Date(s.endTime)
      return sessionDate >= dayStart && sessionDate < dayEnd
    })
    const dayDuration = daySessions.reduce((a, s) => a + s.duration, 0)
    const isToday = dayStart.toDateString() === now.toDateString()
    bars.push({
      count: daySessions.length,
      duration: dayDuration,
      h: daySessions.length > 0 ? Math.min(100, (dayDuration / 120) * 100) : 8,
      day: dayNames[i],
      isToday
    })
  }
  
  return bars.map(b => ({
    h: b.h + '%',
    tip: `${b.day}: ${b.count} session${b.count !== 1 ? 's' : ''} · ${b.duration} min`,
    cls: b.count === 0 ? 'dim' : b.isToday ? 'today-bar' : ''
  }))
}

function generateHeatmap(sessions) {
  const now = new Date()
  const data = []
  
  // Generate 28 days (4 weeks) of heatmap data
  for (let i = 27; i >= 0; i--) {
    const dayStart = new Date(now.getTime() - (i * 86400000))
    const dayEnd = new Date(dayStart.getTime() + 86400000)
    const daySessions = sessions.filter(s => {
      const sessionDate = new Date(s.endTime)
      return sessionDate >= dayStart && sessionDate < dayEnd
    })
    // Map session count to intensity level 0-4
    const intensity = Math.min(4, daySessions.length)
    data.push(intensity)
  }
  
  return data
}

export default function Progress() {
  const location = useLocation()
  const hash = location.hash.replace('#','')
  const [tab, setTab] = useState(['daily','weekly','stats','history'].includes(hash) ? hash : 'daily')
  const [histFilter, setHistFilter] = useState('all')
  const [sessions, setSessions] = useState(getStoredSessions)
  const { t } = useLanguage()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (['daily','weekly','stats','history'].includes(hash)) setTab(hash)
  }, [hash])

  // Re-read sessions on focus (e.g. returning from active session)
  useEffect(() => {
    const onFocus = () => setSessions(getStoredSessions())
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  // Also re-read on route change
  useEffect(() => {
    setSessions(getStoredSessions())
  }, [location])

  const today = new Date().toDateString()
  const todaySessions = sessions.filter(s => new Date(s.endTime).toDateString() === today)
  const todayTotal = todaySessions.reduce((a, s) => a + s.duration, 0)
  const todayAvgScore = todaySessions.length ? Math.round(todaySessions.reduce((a, s) => a + s.score, 0) / todaySessions.length) : 0
  const TARGET = 4

  // Calculate this week's stats
  const now = new Date()
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
  const weekSessions = sessions.filter(s => new Date(s.endTime) >= weekStart)
  const weekTotal = (weekSessions.reduce((a, s) => a + s.duration, 0) / 60).toFixed(1)
  const weekAvgScore = weekSessions.length ? Math.round(weekSessions.reduce((a, s) => a + s.score, 0) / weekSessions.length) : 0

  // Calculate statistics
  const avgSessionDuration = sessions.length ? Math.round(sessions.reduce((a, s) => a + s.duration, 0) / sessions.length) : 0
  const completionRate = sessions.length ? Math.round((sessions.filter(s => s.status === 'done').length / sessions.length) * 100) : 0
  const totalDistractions = sessions.reduce((a, s) => a + s.distractions, 0)
  const overallAvgScore = sessions.length ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / sessions.length) : 0
  const totalHours = (sessions.reduce((a, s) => a + s.duration, 0) / 60).toFixed(1)

  // Generate weekly visualization data
  const weeklyBars = generateWeeklyBarChart(sessions)
  const hmData = generateHeatmap(sessions)

  // History: only use stored sessions, no sample data
  const storedHistory = sessions.map(s => ({
    date: getDateLabel(s.endTime),
    icon: getRandomIcon(s.name),
    name: s.name,
    meta: `${s.duration}' · ${s.type} · ${s.ambience.split(' ')[0]} · ${s.timeLabel}`,
    score: s.score + '%',
    cls: getScoreClass(s.score),
    type: `${s.status} ${s.type.toLowerCase()}`
  }))

  const allHistory = storedHistory
  const filteredHist = allHistory.filter(h => histFilter === 'all' || h.type.includes(histFilter))

  const pct = Math.min(100, Math.round(todaySessions.length / TARGET * 100))
  const dashOffset = 201 - (201 * pct / 100)

  return (
    <>
      <Navbar />
      <main className="container wide">
        <div className="page-hdr"><h1>📊 {t('progress.title')}</h1><p>{t('progress.subtitle')}</p></div>

        <div className="subtabs">
          {['daily','weekly','stats','history'].map(tb => (
            <button key={tb} className={`stab ${tab===tb?'active':''}`} onClick={() => setTab(tb)}>
              {tb==='daily'?`📅 ${t('progress.dailyProgress')}`:tb==='weekly'?`📆 ${t('progress.weeklySummary')}`:tb==='stats'?`📊 ${t('progress.studyStats')}`:`🕐 ${t('progress.sessionHistory')}`}
            </button>
          ))}
        </div>

        {/* KPI */}
        <div className="g4" style={{ marginBottom: 20 }}>
          <div className="card kpi"><div className="kpi-n">{sessions.length || 0}</div><div className="kpi-l">{t('progress.totalSessions')}</div><div className="kpi-d">{t('progress.storedLocally')}</div></div>
          <div className="card kpi"><div className="kpi-n">{todayTotal ? (todayTotal / 60).toFixed(1) + 'h' : '0h'}</div><div className="kpi-l">{t('progress.totalFocusToday')}</div><div className="kpi-d">{t('progress.addedSessions').replace('{count}', todaySessions.length)}</div></div>
          <div className="card kpi"><div className="kpi-n">{todayAvgScore || 0}%</div><div className="kpi-l">{t('progress.avgFocusScore')}</div><div className="kpi-d">{t('progress.todayAvg')}</div></div>
          <div className="card kpi"><div className="kpi-n">🔥{todaySessions.length || 0}</div><div className="kpi-l">{t('progress.todaysSessions')}</div><div className="kpi-d" style={{ color:'var(--accent)' }}>{t('progress.target').replace('{count}', TARGET)}</div></div>
        </div>

        {/* DAILY */}
        {tab === 'daily' && (
          <div className="g2" style={{ alignItems: 'start' }}>
            <div className="card">
              <div className="ctitle">🎯 {t('progress.dailyTarget')}</div>
              <div className="ring-row">
                <svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" strokeWidth="8" /><circle cx="40" cy="40" r="32" fill="none" stroke="var(--accent)" strokeWidth="8" strokeDasharray="201" strokeDashoffset={dashOffset} strokeLinecap="round" transform="rotate(-90 40 40)" /><text x="40" y="45" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--accent)" fontFamily="DM Sans">{pct}%</text></svg>
                <div className="ring-info"><h3>{todaySessions.length} / {TARGET}</h3><p>{t('progress.sessionsCompleted')}</p><small>{t('progress.targetPerDay').replace('{count}', TARGET)}</small></div>
              </div>
              <div style={{ marginTop:14, display:'flex', gap:10, flexWrap:'wrap' }}>
                <div style={{ fontSize:'.8rem', color:'var(--text2)' }}>⏱️ {t('progress.total')}<strong style={{ color:'var(--accent)' }}>{todayTotal}{t('progress.min')}</strong></div>
                <div style={{ fontSize:'.8rem', color:'var(--text2)' }}>⚡ {t('progress.focusAvg')}<strong style={{ color:'var(--accent)' }}>{todayAvgScore || '-'}%</strong></div>
              </div>
            </div>
            <div className="card">
              <div className="ctitle">🕐 {t('progress.todaysSessions')}</div>
              <div className="today-sess">
                {todaySessions.length === 0 && (
                  <div className="ts-item" style={{ border:'1.5px dashed var(--border)', background:'transparent', opacity:.6 }}>
                    <div className="ts-ic">⬜</div>
                    <div className="ts-info"><div className="ts-name" style={{ color:'var(--text3)' }}>{t('progress.noSessionsToday')}</div><div className="ts-meta">{t('progress.startFirst')}</div></div>
                    <Link to="/session-setup" style={{ fontSize:'.76rem', color:'var(--accent)', fontWeight:600, whiteSpace:'nowrap', textDecoration:'none' }}>{t('progress.start')}</Link>
                  </div>
                )}
                {todaySessions.map((s, i) => (
                  <div key={i} className="ts-item">
                    <div className="ts-ic">{getRandomIcon(s.name)}</div>
                    <div className="ts-info">
                      <div className="ts-name">{s.name}</div>
                      <div className="ts-meta">{s.duration} min · {s.type} · {s.timeLabel}</div>
                    </div>
                    <div className="ts-score">{s.score}%</div>
                  </div>
                ))}
                {todaySessions.length > 0 && todaySessions.length < TARGET && (
                  <div className="ts-item" style={{ border:'1.5px dashed var(--border)', background:'transparent', opacity:.6 }}>
                    <div className="ts-ic">⬜</div>
                    <div className="ts-info"><div className="ts-name" style={{ color:'var(--text3)' }}>{t('progress.notStartedYet').replace('{count}', todaySessions.length + 1)}</div><div className="ts-meta">{t('progress.remainingTargets')}</div></div>
                    <Link to="/session-setup" style={{ fontSize:'.76rem', color:'var(--accent)', fontWeight:600, whiteSpace:'nowrap', textDecoration:'none' }}>{t('progress.start')}</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* WEEKLY */}
        {tab === 'weekly' && (
          <div className="g2">
            <div className="card">
              <div className="ctitle">📅 {t('progress.sessionsPerDay')}</div>
              <div className="bar-chart">
                {weeklyBars.map((b,i) => (
                  <div key={i} className="bar-wrap"><div className={`bar ${b.cls}`} style={{ height:b.h }} data-tip={b.tip}></div><div className="bl">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i]}</div></div>
                ))}
              </div>
              <div className="week-kpis">
                <div className="wk-i"><div className="wk-n">{weekSessions.length}</div><div className="wk-l">{t('progress.sessionsThisWeek')}</div></div>
                <div className="wk-i"><div className="wk-n">{weekTotal}h</div><div className="wk-l">{t('progress.totalFocus')}</div></div>
                <div className="wk-i"><div className="wk-n">{weekAvgScore || 0}%</div><div className="wk-l">{t('progress.avgScore')}</div></div>
              </div>
            </div>
            <div className="card">
              <div className="ctitle">🗓️ {t('progress.learningCalendar')}</div>
              <div className="hm-head"><div className="hm-dl">M</div><div className="hm-dl">T</div><div className="hm-dl">W</div><div className="hm-dl">T</div><div className="hm-dl">F</div><div className="hm-dl">S</div><div className="hm-dl">S</div></div>
              <div className="heatmap">{hmData.map((l,i) => <div key={i} className={`hm-cell hm-${l}`}></div>)}</div>
              <div className="hm-legend"><span>{t('progress.low')}</span><div className="hml" style={{ background:'var(--bg2)', border:'1px solid var(--border)' }}></div><div className="hml" style={{ background:'var(--b4)' }}></div><div className="hml" style={{ background:'var(--b3)' }}></div><div className="hml" style={{ background:'var(--b2)' }}></div><div className="hml" style={{ background:'var(--b1)' }}></div><span>{t('progress.high')}</span></div>
            </div>
          </div>
        )}

        {/* STATS */}
        {tab === 'stats' && (
          <div className="g2">
            <div className="card">
              <div className="ctitle">📚 {t('progress.mainStatistics')}</div>
              <div className="stat-list">
                {[{ic:'⏱️',n:t('progress.avgSessionDuration'),w:'78%',v:`${avgSessionDuration}'`},{ic:'🎯',n:t('progress.sessionCompletionRate'),w: completionRate + '%', v: completionRate + '%'},{ic:'🛡️',n:t('progress.distractionsPrevented'),w:'60%',v:totalDistractions + 'x'},{ic:'🌿',n:t('progress.avgFocusScore'),w: overallAvgScore + '%', v: overallAvgScore + '%'},{ic:'⏳',n:t('progress.totalLearningTime'),w:'100%',v: totalHours + 'h'},{ic:'📊',n:t('progress.totalSessions'),w:'72%',v: sessions.length}].map((s,i) => (
                  <div key={i} className="sl-item"><div className="sl-ic">{s.ic}</div><div className="sl-info"><div className="sl-name">{s.n}</div><div className="sl-bar"><div className="sl-fill" style={{ width: typeof s.w === 'number' ? s.w + '%' : s.w }}></div></div></div><div className="sl-val">{s.v}</div></div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="ctitle">🏆 {t('progress.achievements')}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[{ic:'⭐',n:t('progress.perfectSessions'),v: sessions.filter(s => s.score === 100).length + 'x'},{ic:'🎯',n:t('progress.completedSessions'),v: sessions.filter(s => s.status === 'done').length + 'x'},{ic:'📅',n:t('progress.daysWithSessions'),v: new Set(sessions.map(s => new Date(s.endTime).toDateString())).size + ' days'},{ic:'⏳',n:t('progress.totalLearningTime'),v: totalHours + ' hours'},{ic:'📊',n:t('progress.overallFocusScore'),v: overallAvgScore + '%'},{ic:'🛡️',n:t('progress.totalDistractionsBlocked'),v: totalDistractions + 'x'}].map((a,i) => (
                  <div key={i} className="sl-item"><div className="sl-ic">{a.ic}</div><div className="sl-info"><div className="sl-name">{a.n}</div></div><div className="sl-val">{a.v}</div></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HISTORY */}
        {tab === 'history' && (
          <div className="card">
            <div className="ctitle">🕐 {t('progress.allSessionHistory')}</div>
            <div className="hist-filter">
              {['all','done','partial','pomodoro','custom'].map(f => (
                <button key={f} className={`hf-btn ${histFilter===f?'active':''}`} onClick={() => setHistFilter(f)}>
                  {f==='all'?t('progress.filterAll'):f==='done'?t('progress.filterCompleted'):f==='partial'?t('progress.filterPartial'):f==='pomodoro'?t('progress.filterPomodoro'):t('progress.filterCustom')}
                </button>
              ))}
            </div>
            <div className="hist-list">
              {filteredHist.length === 0 && (
                <div style={{ textAlign:'center', padding:'24px 0', color:'var(--text3)', fontSize:'.85rem' }}>
                  {t('progress.noHistory')} <Link to="/session-setup" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>{t('dashboard.startFirst')}</Link>
                </div>
              )}
              {filteredHist.map((h,i) => (
                <div key={i} className="hi"><div className="hi-date">{h.date}</div><div className="hi-ic">{h.icon}</div><div className="hi-info"><div className="hi-name">{h.name}</div><div className="hi-meta">{h.meta}</div></div><div className={`hi-score ${h.cls}`}>{h.score}</div></div>
              ))}
            </div>
          </div>
        )}

        {!loading && !isAuthenticated && (
          <div className="login-hint">🔒 {t('progress.fullHistoryLogin')}<Link to="/auth">{t('progress.signInNow')}</Link>{t('progress.accessFeatures')}</div>
        )}
      </main>
    </>
  )
}
