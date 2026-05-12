import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function SessionSetup() {
  const navigate = useNavigate()
  const [sessionName, setSessionName] = useState('')
  const [mode, setMode] = useState('pomo')
  const [dur, setDur] = useState(25)
  const [activePomo, setActivePomo] = useState(0)
  const [ambTxt, setAmbTxt] = useState('🌿 Hutan')
  const [activeAmb, setActiveAmb] = useState(1)
  const [fmOn, setFmOn] = useState(true)
  const [customVal, setCustomVal] = useState(30)
  const [currentStep, setCurrentStep] = useState(0)
  const [breakMin, setBreakMin] = useState(5)

  const pomoPresets = [
    { min: 25, label: 'Standard' },
    { min: 45, label: 'Long' },
    { min: 15, label: 'Short' },
    { min: 50, label: 'Deep Work' }
  ]

  const ambiences = [
    { icon: '🌧️', label: 'Rain', txt: '🌧️ Rain' },
    { icon: '🌿', label: 'Forest', txt: '🌿 Forest' },
    { icon: '☕', label: 'Cafe', txt: '☕ Cafe' },
    { icon: '🌊', label: 'Ocean', txt: '🌊 Ocean' },
    { icon: '🔥', label: 'Fire', txt: '🔥 Fire' },
    { icon: '🎵', label: 'Lo-fi', txt: '🎵 Lo-fi' },
  ]

  function handleSetMode(m) {
    setMode(m)
    if (m === 'pomo') { setDur(pomoPresets[activePomo].min) }
    setCurrentStep(1)
  }

  function handlePomo(i) {
    setActivePomo(i)
    const min = pomoPresets[i].min
    setDur(min)
    setBreakMin(min <= 25 ? 5 : min <= 45 ? 10 : 15)
    setCurrentStep(1)
  }

  function handleAmb(i) {
    setActiveAmb(i)
    setAmbTxt(ambiences[i].txt)
    setCurrentStep(2)
  }

  function handleAmbNone() {
    setActiveAmb(-1)
    setAmbTxt('🤫 Silence')
    setCurrentStep(2)
  }

  function getStepClass(i) {
    if (i < currentStep) return 'step done'
    if (i === currentStep) return 'step active'
    return 'step'
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'calc(var(--nav-h) + 36px)', paddingBottom: 64, maxWidth: 760, margin: '0 auto', paddingLeft: 28, paddingRight: 28 }}>
        <div className="page-hdr">
          <h1>⚙️ Configure Study Session</h1>
          <p>Set the duration, ambience, and focus mode before starting.</p>
        </div>

        <div className="steps">
          <div className={getStepClass(0)}><div className="step-n">1</div><div className="step-lbl">Duration</div><div className="step-line"></div></div>
          <div className={getStepClass(1)}><div className="step-n">2</div><div className="step-lbl">Ambience</div><div className="step-line"></div></div>
          <div className={getStepClass(2)}><div className="step-n">3</div><div className="step-lbl">Focus Mode</div><div className="step-line"></div></div>
          <div className={getStepClass(3)}><div className="step-n">4</div><div className="step-lbl">Start</div></div>
        </div>

        {/* 0. SESSION NAME */}
        <div className="card">
          <div className="sec-lbl">📝 Session Name / Course</div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input
              type="text"
              placeholder="Example: Algorithms & DS, HCI Project, Exam Review..."
              value={sessionName}
              onChange={e => setSessionName(e.target.value)}
              style={{ fontSize: '.9rem' }}
            />
          </div>
        </div>

        {/* 1. SELECT DURATION */}
        <div className="card">
          <div className="sec-lbl">⏱️ 1. Select Duration</div>
          <div className="dtabs">
            <div className={`dtab ${mode === 'pomo' ? 'active' : ''}`} onClick={() => handleSetMode('pomo')}><div className="dt">🍅 Pomodoro</div><div className="dl">Structured preset, proven effective</div></div>
            <div className={`dtab ${mode === 'custom' ? 'active' : ''}`} onClick={() => handleSetMode('custom')}><div className="dt">✏️ Custom Duration</div><div className="dl">Set your own duration</div></div>
          </div>

          {mode === 'pomo' && (
            <div>
              <div className="sec-lbl" style={{ marginTop: 0, marginBottom: 10 }}>Select Pomodoro Preset</div>
              <div className="pomo-grid">
                {pomoPresets.map((p, i) => (
                  <div key={i} className={`pomo-btn ${activePomo === i ? 'active' : ''}`} onClick={() => handlePomo(i)}><div className="pm">{p.min}&apos;</div><div className="pl">{p.label}</div></div>
                ))}
              </div>
              <div className="pomo-break">☕ Break: <strong>{breakMin} minutes</strong> after session ends</div>
            </div>
          )}

          {mode === 'custom' && (
            <div className="custom-area show">
              <div className="cdisp"><div className="cdn">{customVal}</div><div className="cdl">minutes</div></div>
              <input type="range" min="5" max="120" value={customVal} step="5" onChange={e => { setCustomVal(+e.target.value); setDur(+e.target.value); setCurrentStep(1) }} />
              <div className="rlabels"><span>5 min</span><span>60 min</span><span>120 min</span></div>
            </div>
          )}
        </div>

        {/* 2. AMBIENCE */}
        <div className="card">
          <div className="sec-lbl">🎵 2. Ambience Settings</div>
          <div className="amb-grid">
            {ambiences.map((a, i) => (
              <div key={i} className={`amb-btn ${activeAmb === i ? 'active' : ''}`} onClick={() => handleAmb(i)}><span className="ai">{a.icon}</span><span className="al">{a.label}</span></div>
            ))}
            <div className={`amb-none ${activeAmb === -1 ? 'active' : ''}`} onClick={handleAmbNone}>🤫 No Sound (Silence)</div>
          </div>
        </div>

        {/* 3. FOCUS MODE */}
        <div className="card">
          <div className="sec-lbl">🛡️ 3. Focus Mode Toggle</div>
          <div className="fmtog-row"><div className="fti"><div className="ftl">Focus Mode</div><div className="fts">Block notifications &amp; social media access during session</div></div><label className="tog"><input type="checkbox" checked={fmOn} onChange={e => { setFmOn(e.target.checked); setCurrentStep(3) }} /><span className="sldr"></span></label></div>
          <div className="fmtog-row"><div className="fti"><div className="ftl">Break Reminder</div><div className="fts">Remind when it's time to break after session</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
          <div className="fmtog-row"><div className="fti"><div className="ftl">Distraction Warning</div><div className="fts">Show alert if you try to access other apps</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
        </div>

        <div className="sum-strip">
          {sessionName && <div className="ss-i"><div className="ssl">Session</div><div className="ssv">📖 {sessionName}</div></div>}
          <div className="ss-i"><div className="ssl">Duration</div><div className="ssv">{mode === 'custom' ? customVal : dur} minutes</div></div>
          <div className="ss-i"><div className="ssl">Type</div><div className="ssv">{mode === 'pomo' ? '🍅 Pomodoro' : '✏️ Custom'}</div></div>
          <div className="ss-i"><div className="ssl">Ambience</div><div className="ssv">{ambTxt}</div></div>
          <div className="ss-i"><div className="ssl">Focus Mode</div><div className="ssv">{fmOn ? '✅ Active' : '❌ Inactive'}</div></div>
        </div>

        <button className="start-btn" onClick={() => {
          const finalDur = mode === 'custom' ? customVal : dur
          const config = {
            name: sessionName || 'Unnamed Session',
            duration: finalDur,
            type: mode === 'pomo' ? 'Pomodoro' : 'Custom',
            ambience: ambTxt,
            focusMode: fmOn,
            startTime: new Date().toISOString()
          }
          localStorage.setItem('focusify_active_session', JSON.stringify(config))
          navigate('/active-session')
        }}>▶ Start Session Now</button>
      </main>
    </>
  )
}
