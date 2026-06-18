import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../hooks/useAuth'
import { PlayIcon, PauseIcon, StopIcon, TomatoIcon, EditIcon, BookIcon, CheckIcon, ShieldIcon, VolumeXIcon, ChartIcon, AlertTriangleIcon, CoffeeIcon, SettingsIcon, LightbulbIcon, LeafIcon, StarIcon } from '../components/Icons'

const CIRC = 2 * Math.PI * 100

function getSessionConfig() {
  try {
    const raw = localStorage.getItem('focusify_active_session')
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return { name: 'Unnamed Session', duration: 25, type: 'Pomodoro', ambience: 'Forest', focusMode: true, startTime: new Date().toISOString() }
}

import { sessionsAPI } from '../services/api'

function saveCompletedSession(config, elapsed, total, distCnt, status, isAuthenticated) {
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
  
  // Also save as last session for summary page
  localStorage.setItem('focusify_last_session', JSON.stringify(completed))

  if (isAuthenticated) {
    // Save to localStorage list for logged in users (will be synced)
    let sessions = []  
    try { 
      sessions = JSON.parse(localStorage.getItem('focusify_sessions') || '[]') } catch (e) {}
    sessions.unshift(completed)
    localStorage.setItem('focusify_sessions', JSON.stringify(sessions))

    // Save directly to backend
    try {
      sessionsAPI.create(completed).catch(e => console.error('Failed to save to backend:', e))
    } catch (e) {}
  }
}

export default function ActiveSession() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
   const [config] = useState(() => getSessionConfig())
  const TOTAL = config.duration * 60

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const getAmbienceVideoId = (amb) => {
    if (amb.includes('Rain') || amb.includes('Hujan')) return 'mPZkdNFkNps'
    if (amb.includes('Forest') || amb.includes('Hutan')) return 'xNN7iTA57jM'
    if (amb.includes('Cafe') || amb.includes('Kafe')) return 'gaGrHUekGrc'
    if (amb.includes('Ocean') || amb.includes('Pantai')) return 'Nep1qytq9JM'
    if (amb.includes('Fire') || amb.includes('Api')) return 'L_LUpnjgPso'
    if (amb.includes('Lo-fi')) return 'jfKfPfyJRdk' // Lofi Girl
    return null
  }
  const videoId = getAmbienceVideoId(config.ambience)

  const [remaining, setRemaining] = useState(TOTAL)
  const [focusMode, setFocusMode] = useState(config.focusMode)
  const [paused, setPaused] = useState(false) // Revert to autoplay immediately
  const [distCnt, setDistCnt] = useState(0)
  const [showFCP, setShowFCP] = useState(false)
  const [showDistract, setShowDistract] = useState(false)
  const [showStop, setShowStop] = useState(false)
  const [showBreakModal, setShowBreakModal] = useState(false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef(null)
  const pausedRef = useRef(false) // Align with initial state
  const distCntRef = useRef(0)
  const allowDistractionRef = useRef(false)

  const [breakAlert, setBreakAlert] = useState(() => localStorage.getItem('focusify_break_reminder') !== 'false')
  const [notifBlocked, setNotifBlocked] = useState(() => localStorage.getItem('focusify_fcp_notif_blocked') !== 'false')

  const [ambienceOn, setAmbienceOn] = useState(true)
  const [volume, setVolume] = useState(50)
  const playerRef = useRef(null)
  const playerContainerRef = useRef(null)

  function toggleTheme() {
    const h = document.documentElement
    const d = h.getAttribute('data-theme') === 'dark'
    h.setAttribute('data-theme', d ? 'light' : 'dark')
  }

  const fmt = (s) => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0')

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      allowDistractionRef.current = true
    }, 5000)

    return () => clearTimeout(delayTimer)
  }, [])

  // Load YouTube Iframe API and initialize player
  useEffect(() => {
    if (!videoId) return

    // Create a temporary div for YouTube API to replace.
    // This keeps the DOM modification contained so React 19 does not crash when nodes change.
    const tempDiv = document.createElement('div')
    if (playerContainerRef.current) {
      playerContainerRef.current.appendChild(tempDiv)
    }

    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }

    let player
    const initPlayer = () => {
      try {
        if (window.YT && window.YT.Player) {
          player = new window.YT.Player(tempDiv, {
            height: '0',
            width: '0',
            videoId: videoId,
            playerVars: {
              autoplay: 1,
              loop: 1,
              playlist: videoId,
              controls: 0,
              showinfo: 0,
              rel: 0,
              enablejsapi: 1
            },
            events: {
              onReady: (event) => {
                playerRef.current = event.target
                try {
                  event.target.setVolume(ambienceOn ? volume : 0)
                  if (!pausedRef.current && !finished) {
                    event.target.playVideo()
                  } else {
                    event.target.pauseVideo()
                  }
                } catch (readyErr) {
                  console.warn("YouTube player onReady failed:", readyErr)
                }
              }
            }
          })
        }
      } catch (err) {
        console.error("Failed to initialize YouTube Player:", err)
      }
    }

    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      window.onYouTubeIframeAPIReady = initPlayer
    }

    return () => {
      try {
        if (player && typeof player.destroy === 'function') {
          player.destroy()
        }
      } catch (err) {
        console.warn("YouTube player destroy failed:", err)
      }
      if (playerContainerRef.current) {
        playerContainerRef.current.innerHTML = ''
      }
    }
  }, [videoId])

  // Sync volume and mute state
  useEffect(() => {
    if (playerRef.current) {
      try {
        if (typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume(ambienceOn ? volume : 0)
        }
      } catch (err) {
        console.warn("YouTube player setVolume failed:", err)
      }
    }
  }, [volume, ambienceOn])

  // Sync play/pause state
  useEffect(() => {
    if (playerRef.current) {
      try {
        if (paused || finished) {
          if (typeof playerRef.current.pauseVideo === 'function') {
            playerRef.current.pauseVideo()
          }
        } else {
          if (typeof playerRef.current.playVideo === 'function') {
            playerRef.current.playVideo()
          }
        }
      } catch (err) {
        console.warn("YouTube player play/pause failed:", err)
      }
    }
  }, [paused, finished])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!pausedRef.current) {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setFinished(true)
            
            const showBreakAlert = localStorage.getItem('focusify_break_reminder') !== 'false'
            if (showBreakAlert) {
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(t('active.sessionCompleted') || 'Session Complete!', {
                  body: t('setup.breakReminderDesc') || "Great job! It's time to take a break.",
                  icon: '/favicon.ico'
                })
              }
              try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
                audio.play()
              } catch(e) {}
              
              saveCompletedSession(config, TOTAL, TOTAL, distCntRef.current, 'done', isAuthenticated)
              setShowBreakModal(true)
            } else {
              saveCompletedSession(config, TOTAL, TOTAL, distCntRef.current, 'done', isAuthenticated)
              setTimeout(() => navigate('/session-summary'), 1400)
            }
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)
    // Demo distraction after 10m (600s) (only if focusMode is enabled)
    let demoTimeout
    if (focusMode) {
      demoTimeout = setTimeout(() => {
        if (allowDistractionRef.current) {
          distCntRef.current += 1
          setDistCnt(c => c + 1)
          setShowDistract(true)
        }
      }, 600000)
    }

    return () => { 
      clearInterval(intervalRef.current)
      if (demoTimeout) clearTimeout(demoTimeout)
    }
  }, [navigate, config, TOTAL, isAuthenticated, focusMode])

  function handleStop() {
    clearInterval(intervalRef.current)
    const elapsed = TOTAL - remaining
    saveCompletedSession(config, elapsed, TOTAL, distCntRef.current, 'partial', isAuthenticated)
    navigate('/session-summary')
  }

  function togglePause() {
    const next = !paused
    setPaused(next)
    pausedRef.current = next
    if (next) {
      setShowFCP(true)
    } else {
      setShowFCP(false)
    }
  }

  // Focus lock - prevent tab switching and window switching
  useEffect(() => {
    if (!focusMode) return

    // Prevent tab switching via visibilitychange
    const handleVisibilityChange = () => {
      if (document.hidden && allowDistractionRef.current) {
        distCntRef.current += 1
        setDistCnt(c => c + 1)
        setShowDistract(true)

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(t('active.distractTitle') || 'Stay focused!', {
            body: t('active.distractionDesc') || 'You left the learning tab. Your focus score may decrease.',
            icon: '/favicon.ico'
          })
        }
      }
    }

    // Prevent keyboard shortcuts that switch apps/tabs
    const handleKeyDown = (e) => {
      if (!allowDistractionRef.current) return
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
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Prevent right-click context menu during session
    const handleContextMenu = (e) => {
      if (!allowDistractionRef.current) return
      e.preventDefault()
      distCntRef.current += 1
      setDistCnt(c => c + 1)
      setShowDistract(true)
    }
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('contextmenu', handleContextMenu)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [finished, focusMode])



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
        <button className="theme-btn" onClick={toggleTheme} id="thbtn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LeafIcon size={18} /></button>
      </nav>

      <main className="container xnarrow">
        <div className="timer-wrap">
          <div className="sess-label">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>{config.type === 'Pomodoro' ? <TomatoIcon size={16}/> : <EditIcon size={16}/>} {config.type} · {config.duration} {t('setup.minutes')}</span>
            {config.name !== 'Unnamed Session' && <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: 6, fontSize: '.85rem', letterSpacing: '.02em', textTransform: 'none', wordBreak: 'break-word', lineHeight: 1.4 }}><BookIcon size={14}/> {config.name}</span>}
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
            <div className={`sbadge ${paused ? 'paused' : 'running'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{finished ? <><CheckIcon size={12} /> {t('dashboard.completed')}</> : paused ? <><PauseIcon size={12}/> {t('active.paused') || 'Paused'}</> : `● ${t('active.running') || 'Running'}`}</div>
            <div className="info-pill">{config.ambience}</div>
            <div className="info-pill" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldIcon size={12} /> {focusMode ? (t('active.fmOn') || 'Focus Mode ON') : (t('active.fmOff') || 'Focus Mode OFF')}</div>
          </div>

          <div className="controls">
            <button className="btn-icon stop" onClick={() => setShowStop(true)} title="Stop Session" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}><StopIcon size={20}/></button>
            <button className={`btn-main ${paused ? 'paused-state' : ''}`} onClick={togglePause} title="Pause / Resume" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{paused ? <PlayIcon size={24}/> : <PauseIcon size={24}/>}</button>
          </div>

          {/* Ambience Volume Slider */}
          {videoId && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginTop: '20px', 
              justifyContent: 'center',
              padding: '8px 16px',
              background: 'var(--bg2)',
              borderRadius: '20px',
              maxWidth: '220px',
              margin: '20px auto 0 auto',
              border: '1px solid var(--border)'
            }}>
              <span 
                style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center' }} 
                onClick={() => setAmbienceOn(!ambienceOn)}
                title={ambienceOn ? "Mute" : "Unmute"}
              >
                {ambienceOn ? <StarIcon size={18} /> : <VolumeXIcon size={18} />}
              </span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume} 
                onChange={(e) => setVolume(Number(e.target.value))} 
                style={{ 
                  width: '100px', 
                  height: '4px', 
                  accentColor: 'var(--accent)', 
                  cursor: 'pointer',
                  background: 'var(--border)',
                  border: 'none',
                  outline: 'none'
                }} 
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text2)', fontWeight: 'bold', minWidth: '32px', textAlign: 'right' }}>
                {ambienceOn ? `${volume}%` : 'Off'}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="ctitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ChartIcon size={20} /> {t('active.sessionProgress') || 'Session Progress'}</div>
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
      </main>

      {/* DISTRACTION OVERLAY */}
      <div className={`overlay ${showDistract ? 'show' : ''}`}>
        <div className="ov-card">
          <span className="ov-icon" style={{ display: 'flex', justifyContent: 'center' }}><AlertTriangleIcon size={48} color="var(--danger)" /></span>
          <h2>{t('active.distractTitle') || 'Stay focused!'}</h2>
          <p>{t('active.distractDesc') || 'You tried to switch tabs, windows, or leave the session. Focus Mode is active to keep you concentrated on your learning. Complete your session and achieve your goal!'}</p>
          <button className="btn-back" onClick={() => setShowDistract(false)}>⬅ {t('active.backToSession') || 'Back to Session'}</button>
        </div>
      </div>

      {/* STOP OVERLAY */}
      <div className={`stop-overlay ${showStop ? 'show' : ''}`}>
        <div className="stop-card">
          <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><StopIcon size={24} /> {t('active.stopSessionTitle') || 'Stop Session?'}</h2>
          <p>{t('active.stopSessionDesc') || 'The session will be stopped early. The progress made so far will still be saved in the summary.'}</p>
          <div className="stop-btns">
            <button className="btn-confirm-stop" onClick={handleStop}>{t('active.stopBtn') || 'Stop'}</button>
            <button className="btn-cancel-stop" onClick={() => setShowStop(false)}>{t('active.continueBtn') || 'Continue'}</button>
          </div>
        </div>
      </div>

      {/* BREAK MODAL */}
      <div className={`stop-overlay ${showBreakModal ? 'show' : ''}`}>
        <div className="stop-card">
          <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><CoffeeIcon size={24} /> {t('active.sessionCompleted') || 'Session Complete!'}</h2>
          <p>{t('setup.breakReminderDesc') || "Great job! It's time to take a break. Stand up, stretch, and get some water."}</p>
          <div className="stop-btns" style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
            <button className="btn-confirm-stop" style={{ width: '100%', background: 'var(--accent)', color: 'white' }} onClick={() => navigate('/session-summary')}>
              {t('active.finishBtn') || 'Finish & View Summary'}
            </button>
          </div>
        </div>
      </div>

      {/* Focus Control Panel Overlay Modal */}
      {paused && showFCP && (
        <div className="stop-overlay show" style={{ zIndex: 3000 }}>
          <div className="stop-card" style={{ maxWidth: '450px', width: '90%', textAlign: 'left', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><SettingsIcon size={18} /> {t('active.fcpTitle') || 'Focus Control Panel'}</h3>
              <button 
                onClick={togglePause} 
                style={{ 
                  border: 'none', 
                  background: 'var(--bg2)', 
                  color: 'var(--text)', 
                  cursor: 'pointer', 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1rem' 
                }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '.8rem', color: 'var(--text2)', marginBottom: 20 }}>{t('active.fcpDesc') || 'Adjust settings while the session is paused.'}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t('setup.focusMode') || 'Focus Mode'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{t('active.fcpBlock') || 'Block distractions'}</div>
                </div>
                <label className="tog">
                  <input 
                    type="checkbox" 
                    checked={focusMode} 
                    onChange={(e) => {
                      const val = e.target.checked
                      setFocusMode(val)
                      config.focusMode = val
                      try {
                        localStorage.setItem('focusify_active_session', JSON.stringify(config))
                      } catch (err) {
                        console.error(err)
                      }
                    }} 
                  />
                  <span className="sldr"></span>
                </label>
              </div>


              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t('settings.notifications') || 'Notifications'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{t('active.fcpAllBlocked') || 'All blocked'}</div>
                </div>
                <label className="tog">
                  <input type="checkbox" checked={notifBlocked} onChange={(e) => {
                    const val = e.target.checked
                    setNotifBlocked(val)
                    localStorage.setItem('focusify_fcp_notif_blocked', val)
                  }} />
                  <span className="sldr"></span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t('active.fcpReminder') || 'Reminder'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{t('active.fcpBreakAlert') || 'Break alert'}</div>
                </div>
                <label className="tog">
                  <input type="checkbox" checked={breakAlert} onChange={(e) => {
                    const val = e.target.checked
                    setBreakAlert(val)
                    localStorage.setItem('focusify_break_reminder', val)
                  }} />
                  <span className="sldr"></span>
                </label>
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '10px', background: 'var(--bg2)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text2)', borderLeft: '3px solid var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LightbulbIcon size={14} /> {t('active.fcpNote') || 'Session paused. Press Play to continue or Stop to end the session.'}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn-confirm-stop" style={{ background: 'var(--accent)', color: 'white', padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={togglePause}>
                <PlayIcon size={14} /> Resume
              </button>
            </div>
          </div>
        </div>
      )}
      <div ref={playerContainerRef} style={{ display: 'none' }}></div>
    </>
  )
}
