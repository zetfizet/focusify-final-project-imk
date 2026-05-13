import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

const CIRC = 2 * Math.PI * 100

function getSessionConfig() {
  try {
    const raw = localStorage.getItem('focusify_active_session')
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return { name: 'Unnamed Session', duration: 25, type: 'Pomodoro', ambience: '🌿 Forest', focusMode: true, startTime: new Date().toISOString() }
}

function saveCompletedSession(config, elapsed, total, distCnt, status) {
  const now = new Date()
  const completed = {
    name: config.name,
    duration: Math.round(elapsed / 60),
    totalDuration: config.duration,
    type: config.type,
    ambience: config.ambience,
    focusMode: config.focusMode,
    startTime: config.startTime,
    endTime: now.toISOString(),
    timeLabel: now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'),
    distractions: distCnt,
    status: status, // 'done' or 'partial'
    score: Math.max(0, 100 - (distCnt * 5) - (status === 'partial' ? 15 : 0))
  }
  // Save to localStorage
  let sessions = []  
  try { 
    sessions = JSON.parse(localStorage.getItem('focusify_sessions') || '[]') } catch (e) {}
  sessions.unshift(completed)
  localStorage.setItem('focusify_sessions', JSON.stringify(sessions))
  // Also save as last session for summary page
  localStorage.setItem('focusify_last_session', JSON.stringify(completed))
}

export default function ActiveSession() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const config = useRef(getSessionConfig()).current
  const TOTAL = config.duration * 60

  const getAmbienceVideoId = (amb) => {
    if (!amb) return null
    if (amb.includes('🌧️')) return 'mPZkdNFkNps'
    if (amb.includes('🌿')) return 'xNN7iTA57jM'
    if (amb.includes('☕')) return 'gaGrHUekGrc'
    if (amb.includes('🌊')) return 'Nep1qytq9JM'
    if (amb.includes('🔥')) return 'L_LUpnjgPso'
    if (amb.includes('🎵')) return 'jfKfPfyJRdk' // Lofi Girl
    return null
  }
  const videoId = getAmbienceVideoId(config.ambience)

  const [remaining, setRemaining] = useState(TOTAL)
  const [paused, setPaused] = useState(false)
  const [distCnt, setDistCnt] = useState(0)
  const [showFCP, setShowFCP] = useState(false)
  const [showDistract, setShowDistract] = useState(false)
  const [showStop, setShowStop] = useState(false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef(null)
  const pausedRef = useRef(false)
  const distCntRef = useRef(0)

  function toggleTheme() {
    const h = document.documentElement
    const d = h.getAttribute('data-theme') === 'dark'
    h.setAttribute('data-theme', d ? 'light' : 'dark')
    document.getElementById('thbtn').textContent = d ? '🌿' : '🌙'
  }

  const fmt = (s) => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0')

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!pausedRef.current) {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setFinished(true)
            // Save as completed session
            saveCompletedSession(config, TOTAL, TOTAL, distCntRef.current, 'done')
            setTimeout(() => navigate('/session-summary'), 1400)
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)
    // Demo distraction after 7s
    const demoTimeout = setTimeout(() => {
      distCntRef.current += 1
      setDistCnt(c => c + 1)
      setShowDistract(true)
    }, 7000)

    return () => { 
      clearInterval(intervalRef.current)
      clearTimeout(demoTimeout)
    }
  }, [navigate, config, TOTAL])

  function handleStop() {
    clearInterval(intervalRef.current)
    const elapsed = TOTAL - remaining
    saveCompletedSession(config, elapsed, TOTAL, distCntRef.current, elapsed >= TOTAL * 0.5 ? 'partial' : 'partial')
    navigate('/session-summary')
  }

  function togglePause() {
    const next = !paused
    setPaused(next)
    pausedRef.current = next
    if (next) setShowFCP(true)
  }

  function toggleFCPPanel() {
    if (!paused) { 
      setPaused(true)
      pausedRef.current = true
      setShowFCP(true)
    } else {
      setShowFCP(f => !f)
    }
  }

  // Focus lock - prevent tab switching and window switching
  useEffect(() => {
    // Prevent tab switching via visibilitychange
    const handleVisibilityChange = () => {
      if (document.hidden) {
        distCntRef.current += 1
        setDistCnt(c => c + 1)
        setShowDistract(true)
      }
    }

    // Prevent window blur (switching to another window)
    const handleWindowBlur = () => {
      if (!finished) {
        distCntRef.current += 1
        setDistCnt(c => c + 1)
        setShowDistract(true)
      }
    }

    // Prevent keyboard shortcuts that switch apps/tabs
    const handleKeyDown = (e) => {
      // Alt+Tab, Alt+Esc, Ctrl+Tab, Ctrl+Shift+Tab, Win+Tab
      if ((e.altKey && (e.key === 'Tab' || e.key === 'Escape')) ||
          (e.ctrlKey && (e.key === 'Tab' || (e.key === 'w' && e.shiftKey))) ||
          (e.key === 'Meta' || e.key === 'Win')) {
        e.preventDefault()
        distCntRef.current += 1
        setDistCnt(c => c + 1)
        setShowDistract(true)
      }
      // Prevent back button via backspace (unless in input field)
      if (e.key === 'Backspace' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault()
      }
    }

    // Prevent page unload
    const handleBeforeUnload = (e) => {
      if (!finished) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Prevent right-click context menu during session
    const handleContextMenu = (e) => {
      e.preventDefault()
      distCntRef.current += 1
      setDistCnt(c => c + 1)
      setShowDistract(true)
    }
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [finished])



  const elapsed = TOTAL - remaining
  const pct = Math.round(elapsed / TOTAL * 100)

  // Count today's sessions
  let todaySessions = 0
  try {
    const sessions = JSON.parse(localStorage.getItem('focusify_sessions') || '[]')
    const today = new Date().toDateString()
    todaySessions = sessions.filter(s => new Date(s.endTime).toDateString() === today).length
  } catch (e) {}

  return (
    <>
      <nav>
        <Link className="nav-logo" to="/"><span className="dot"></span>Focusify</Link>
        <div className="live-badge"><div className="pulse"></div>{t('nav.activeSession') || 'Active Session'}</div>
        <button className="theme-btn" onClick={toggleTheme} id="thbtn">🌿</button>
      </nav>

      <main className="container xnarrow">
        <div className="timer-wrap">
          <div className="sess-label">
            {config.type === 'Pomodoro' ? '🍅' : '✏️'} {config.type} · {config.duration} {t('setup.minutes')}
            {config.name !== 'Unnamed Session' && <span style={{ display: 'block', marginTop: 6, fontSize: '.85rem', letterSpacing: '.02em', textTransform: 'none' }}>📖 {config.name}</span>}
          </div>
          <div className="ring-outer">
            <svg width="230" height="230" viewBox="0 0 230 230">
              <circle className="ring-track" cx="115" cy="115" r="100" />
              <circle className="ring-prog" cx="115" cy="115" r="100" strokeDasharray="628" strokeDashoffset={CIRC * (remaining / TOTAL)} />
            </svg>
            <div className="ring-center">
              <div className={`timer-num ${paused ? 'paused' : ''}`}>{fmt(remaining)}</div>
              <div className="timer-sub">{finished ? t('active.sessionCompleted') : paused ? t('active.sessionPaused') : t('active.sessionRunning')}</div>
            </div>
          </div>

          <div className="status-row">
            <div className={`sbadge ${paused ? 'paused' : 'running'}`}>{finished ? `✅ ${t('dashboard.completed')}` : paused ? `⏸ ${t('active.paused') || 'Paused'}` : `● ${t('active.running') || 'Running'}`}</div>
            <div className="info-pill">{config.ambience}</div>
            <div className="info-pill">{config.focusMode ? `🛡️ ${t('active.fmOn') || 'Focus Mode ON'}` : `🛡️ ${t('active.fmOff') || 'Focus Mode OFF'}`}</div>
          </div>

          <div className="controls">
            <button className="btn-icon stop" onClick={() => setShowStop(true)} title="Stop Session">⏹</button>
            <button className={`btn-main ${paused ? 'paused-state' : ''}`} onClick={togglePause} title="Pause / Resume">{paused ? '▶' : '⏸'}</button>
            <button className="btn-icon btn-fcp" onClick={toggleFCPPanel} title="Focus Control Panel">🎛️</button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="ctitle">📊 {t('active.sessionProgress') || 'Session Progress'}</div>
          <div className="pb-row">
            <div className="pb-labels"><span>{t('active.elapsedTime') || 'Elapsed time'}</span><span>{pct}%</span></div>
            <div className="pb"><div className="pb-fill" style={{ width: pct + '%' }}></div></div>
          </div>
          <div className="stat-row">
            <div className="sr-i"><div className="sl">{t('active.elapsed') || 'Elapsed'}</div><div className="sv">{fmt(elapsed)}</div></div>
            <div className="sr-i"><div className="sl">{t('active.remaining') || 'Remaining'}</div><div className="sv">{fmt(remaining)}</div></div>
            <div className="sr-i"><div className="sl">{t('active.todaysSessions') || "Today's Sessions"}</div><div className="sv">{todaySessions}</div></div>
            <div className="sr-i"><div className="sl">{t('active.distractionsPrevented') || 'Distractions Prevented'}</div><div className="sv">{distCnt}</div></div>
          </div>
        </div>

        {/* Focus Control Panel */}
        <div className={`card fcp ${showFCP ? 'show' : ''}`}>
          <div className="ctitle">🎛️ {t('active.fcpTitle') || 'Focus Control Panel'}</div>
          <p style={{ fontSize: '.8rem', color: 'var(--text2)', marginBottom: 12 }}>{t('active.fcpDesc') || 'Adjust settings while the session is paused.'}</p>
          <div className="fcp-grid">
            <div className="fcp-row"><div><div className="fcp-l">{t('setup.focusMode') || 'Focus Mode'}</div><div className="fcp-s">{t('active.fcpBlock') || 'Block distractions'}</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
            <div className="fcp-row"><div><div className="fcp-l">{t('setup.ambience') || 'Ambience'}</div><div className="fcp-s">{t('active.fcpBgSound') || 'Background sound'}</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
            <div className="fcp-row"><div><div className="fcp-l">{t('settings.notifications') || 'Notifications'}</div><div className="fcp-s">{t('active.fcpAllBlocked') || 'All blocked'}</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
            <div className="fcp-row"><div><div className="fcp-l">{t('active.fcpReminder') || 'Reminder'}</div><div className="fcp-s">{t('active.fcpBreakAlert') || 'Break alert'}</div></div><label className="tog"><input type="checkbox" /><span className="sldr"></span></label></div>
          </div>
          <div className="fcp-note">💡 {t('active.fcpNote') || 'Session paused. Press ▶ to continue or ⏹ to stop the session.'}</div>
        </div>
      </main>

      {/* DISTRACTION OVERLAY */}
      <div className={`overlay ${showDistract ? 'show' : ''}`}>
        <div className="ov-card">
          <span className="ov-icon">🚨</span>
          <h2>{t('active.distractTitle') || 'Stay focused!'}</h2>
          <p>{t('active.distractDesc') || 'You tried to switch tabs, windows, or leave the session. Focus Mode is active to keep you concentrated on your learning. Complete your session and achieve your goal! 💪'}</p>
          <button className="btn-back" onClick={() => setShowDistract(false)}>⬅ {t('active.backToSession') || 'Back to Session'}</button>
        </div>
      </div>

      {/* STOP OVERLAY */}
      <div className={`stop-overlay ${showStop ? 'show' : ''}`}>
        <div className="stop-card">
          <h2>⏹ {t('active.stopSessionTitle') || 'Stop Session?'}</h2>
          <p>{t('active.stopSessionDesc') || 'The session will be stopped early. The progress made so far will still be saved in the summary.'}</p>
          <div className="stop-btns">
            <button className="btn-confirm-stop" onClick={handleStop}>{t('active.stopBtn') || 'Stop'}</button>
            <button className="btn-cancel-stop" onClick={() => setShowStop(false)}>{t('active.continueBtn') || 'Continue'}</button>
          </div>
        </div>
      </div>

      {/* HIDDEN AMBIENCE AUDIO PLAYER (YOUTUBE IFRAME) */}
      {videoId && !paused && !finished && (
        <iframe 
          width="10" 
          height="10" 
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0`} 
          title="Ambience Audio"
          frameBorder="0" 
          allow="autoplay" 
          style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}
        ></iframe>
      )}
    </>
  )
}
