import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useLanguage } from '../contexts/LanguageContext'
import { PlayIcon, SettingsIcon, EditIcon, TimerIcon, TomatoIcon, CoffeeIcon, MusicIcon, VolumeXIcon, ShieldIcon, BookIcon, CheckIcon, XIcon, AlertTriangleIcon, CloudRainIcon, LeafIcon, WavesIcon, FireIcon } from '../components/Icons'

export default function SessionSetup() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  
  const [sessionName, setSessionName] = useState(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('focusify_setup_draft') || '{}')
      return draft.sessionName || ''
    } catch(e) { return '' }
  })
  const [error, setError] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '' })
  const nameInputRef = useRef(null)
  const [mode, setMode] = useState(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('focusify_setup_draft') || '{}')
      return draft.mode || 'pomo'
    } catch(e) { return 'pomo' }
  })
  const [dur, setDur] = useState(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('focusify_setup_draft') || '{}')
      return draft.dur !== undefined ? draft.dur : 25
    } catch(e) { return 25 }
  })
  const [activePomo, setActivePomo] = useState(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('focusify_setup_draft') || '{}')
      return draft.activePomo !== undefined ? draft.activePomo : 0
    } catch(e) { return 0 }
  })
  const [ambTxt, setAmbTxt] = useState(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('focusify_setup_draft') || '{}')
      return draft.ambTxt || 'Forest'
    } catch(e) { return 'Forest' }
  })
  const [activeAmb, setActiveAmb] = useState(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('focusify_setup_draft') || '{}')
      return draft.activeAmb !== undefined ? draft.activeAmb : 1
    } catch(e) { return 1 }
  })
  const [fmOn, setFmOn] = useState(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('focusify_setup_draft') || '{}')
      return draft.fmOn !== undefined ? draft.fmOn : true
    } catch(e) { return true }
  })
  const [customVal, setCustomVal] = useState(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('focusify_setup_draft') || '{}')
      return draft.customVal !== undefined ? draft.customVal : 30
    } catch(e) { return 30 }
  })
  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('focusify_setup_draft') || '{}')
      return draft.currentStep !== undefined ? draft.currentStep : 0
    } catch(e) { return 0 }
  })
  const [breakMin, setBreakMin] = useState(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('focusify_setup_draft') || '{}')
      return draft.breakMin !== undefined ? draft.breakMin : 5
    } catch(e) { return 5 }
  })

  useEffect(() => {
    const draft = {
      sessionName,
      mode,
      dur,
      activePomo,
      ambTxt,
      activeAmb,
      fmOn,
      customVal,
      currentStep,
      breakMin
    }
    localStorage.setItem('focusify_setup_draft', JSON.stringify(draft))
  }, [sessionName, mode, dur, activePomo, ambTxt, activeAmb, fmOn, customVal, currentStep, breakMin])

  const pomoPresets = [
    { min: 25, label: t('settings.standard') || 'Standard' },
    { min: 45, label: t('settings.long') || 'Long' },
    { min: 15, label: t('settings.short') || 'Short' },
    { min: 50, label: t('settings.deepWork') || 'Deep Work' }
  ]

  const ambiences = [
    { icon: <CloudRainIcon size={18} />, label: t('setup.rain') || 'Rain', txt: t('setup.rain') || 'Rain' },
    { icon: <LeafIcon size={18} />, label: t('setup.forest') || 'Forest', txt: t('setup.forest') || 'Forest' },
    { icon: <CoffeeIcon size={18} />, label: t('setup.cafe') || 'Cafe', txt: t('setup.cafe') || 'Cafe' },
    { icon: <WavesIcon size={18} />, label: t('setup.beach') || 'Ocean', txt: t('setup.beach') || 'Ocean' },
    { icon: <FireIcon size={18} />, label: t('setup.fire') || 'Fire', txt: t('setup.fire') || 'Fire' },
    { icon: <MusicIcon size={18} />, label: t('setup.lofi') || 'Lo-fi', txt: t('setup.lofi') || 'Lo-fi' },
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
    setAmbTxt(t('setup.silence') || 'Silence')
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
      <main className="container narrow">
        <div className="page-hdr">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><SettingsIcon size={28} /> {t('setup.title')}</h1>
          <p>{t('setup.subtitle')}</p>
        </div>

        <div className="steps">
          <div className={getStepClass(0)}><div className="step-n">1</div><div className="step-lbl">{t('setup.stepDuration')}</div><div className="step-line"></div></div>
          <div className={getStepClass(1)}><div className="step-n">2</div><div className="step-lbl">{t('setup.stepAmbience')}</div><div className="step-line"></div></div>
          <div className={getStepClass(2)}><div className="step-n">3</div><div className="step-lbl">{t('setup.stepFocusMode')}</div><div className="step-line"></div></div>
          <div className={getStepClass(3)}><div className="step-n">4</div><div className="step-lbl">{t('setup.stepStart')}</div></div>
        </div>

        {/* 0. SESSION NAME */}
        <div className="card">
          <div className="sec-lbl" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><EditIcon size={18} /> {t('setup.sessionName')} <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span></div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input
              ref={nameInputRef}
              type="text"
              placeholder={t('setup.sessionNameHint')}
              value={sessionName}
              onChange={e => {
                setSessionName(e.target.value)
                if (e.target.value.trim()) {
                  setError(false)
                  setToast({ show: false, message: '' })
                }
              }}
              className={error ? 'shake-input' : ''}
              style={{ fontSize: '.9rem' }}
              required
            />
          </div>
        </div>

        {/* 1. SELECT DURATION */}
        <div className="card">
          <div className="sec-lbl" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><TimerIcon size={18} /> 1. {t('setup.selectDuration')}</div>
          <div className="dtabs">
            <div className={`dtab ${mode === 'pomo' ? 'active' : ''}`} onClick={() => handleSetMode('pomo')}><div className="dt" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><TomatoIcon size={16} /> {t('setup.pomodoro')}</div><div className="dl">{t('setup.pomodoroDesc')}</div></div>
            <div className={`dtab ${mode === 'custom' ? 'active' : ''}`} onClick={() => handleSetMode('custom')}><div className="dt" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><EditIcon size={16} /> {t('setup.customDuration')}</div><div className="dl">{t('setup.customDesc')}</div></div>
          </div>

          {mode === 'pomo' && (
            <div>
              <div className="sec-lbl" style={{ marginTop: 0, marginBottom: 10 }}>{t('setup.selectPreset')}</div>
              <div className="pomo-grid">
                {pomoPresets.map((p, i) => (
                  <div key={i} className={`pomo-btn ${activePomo === i ? 'active' : ''}`} onClick={() => handlePomo(i)}><div className="pm">{p.min}&apos;</div><div className="pl">{p.label}</div></div>
                ))}
              </div>
              <div className="pomo-break" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CoffeeIcon size={16} /> {t('setup.break')}: <strong>{breakMin} {t('setup.minutes')}</strong> {t('setup.breakDesc')}</div>
            </div>
          )}

          {mode === 'custom' && (
            <div className="custom-area show">
              <div className="cdisp"><div className="cdn">{customVal}</div><div className="cdl">{t('setup.minutes')}</div></div>
              <input type="range" min="5" max="120" value={customVal} step="5" onChange={e => { setCustomVal(+e.target.value); setDur(+e.target.value); setCurrentStep(1) }} />
              <div className="rlabels"><span>5 {t('setup.min')}</span><span>60 {t('setup.min')}</span><span>120 {t('setup.min')}</span></div>
            </div>
          )}
        </div>

        {/* 2. AMBIENCE */}
        <div className="card">
          <div className="sec-lbl" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MusicIcon size={18} /> 2. {t('setup.ambienceSettings')}</div>
          <div className="amb-grid">
            {ambiences.map((a, i) => (
              <div key={i} className={`amb-btn ${activeAmb === i ? 'active' : ''}`} onClick={() => handleAmb(i)}><span className="ai">{a.icon}</span><span className="al">{a.label}</span></div>
            ))}
            <div className={`amb-none ${activeAmb === -1 ? 'active' : ''}`} onClick={handleAmbNone} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><VolumeXIcon size={18} /> {t('setup.noSound')}</div>
          </div>
        </div>

        {/* 3. FOCUS MODE */}
        <div className="card">
          <div className="sec-lbl" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldIcon size={18} /> 3. {t('setup.focusModeToggle')}</div>
          <div className="fmtog-row"><div className="fti"><div className="ftl">{t('setup.focusMode')}</div><div className="fts">{t('setup.focusModeDesc')}</div></div><label className="tog"><input type="checkbox" checked={fmOn} onChange={e => { setFmOn(e.target.checked); setCurrentStep(3) }} /><span className="sldr"></span></label></div>
          <div className="fmtog-row"><div className="fti"><div className="ftl">{t('setup.breakReminder')}</div><div className="fts">{t('setup.breakReminderDesc')}</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
          <div className="fmtog-row"><div className="fti"><div className="ftl">{t('setup.distractionWarning')}</div><div className="fts">{t('setup.distractionWarningDesc')}</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
        </div>

        <div className="sum-strip">
          {sessionName && <div className="ss-i"><div className="ssl">{t('setup.sumSession')}</div><div className="ssv" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BookIcon size={14} /> {sessionName}</div></div>}
          <div className="ss-i"><div className="ssl">{t('setup.sumDuration')}</div><div className="ssv">{mode === 'custom' ? customVal : dur} {t('setup.minutes')}</div></div>
          <div className="ss-i"><div className="ssl">{t('setup.sumType')}</div><div className="ssv" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{mode === 'pomo' ? <><TomatoIcon size={14} /> {t('setup.pomodoro')}</> : <><EditIcon size={14} /> {t('setup.customDuration')}</>}</div></div>
          <div className="ss-i"><div className="ssl">{t('setup.sumAmbience')}</div><div className="ssv" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{activeAmb !== -1 ? ambiences[activeAmb].icon : <VolumeXIcon size={14} />} {ambTxt}</div></div>
          <div className="ss-i"><div className="ssl">{t('setup.sumFocusMode')}</div><div className="ssv" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{fmOn ? <><CheckIcon size={14} /> {t('setup.active')}</> : <><XIcon size={14} /> {t('setup.inactive')}</>}</div></div>
        </div>

        <button className="start-btn" onClick={() => {
          if (!sessionName.trim()) {
            setError(true)
            setToast({ show: true, message: t('setup.nameRequired') || 'Session name is required before starting!' })
            nameInputRef.current?.focus()
            setTimeout(() => {
              setError(false)
            }, 500)
            setTimeout(() => {
              setToast({ show: false, message: '' })
            }, 3500)
            return
          }
          const finalDur = mode === 'custom' ? customVal : dur
          const config = {
            name: sessionName,
            duration: finalDur,
            type: mode === 'pomo' ? 'Pomodoro' : 'Custom',
            ambience: ambTxt,
            focusMode: fmOn,
            startTime: new Date().toISOString()
          }
          localStorage.setItem('focusify_active_session', JSON.stringify(config))
          localStorage.removeItem('focusify_setup_draft')
          navigate('/active-session')
        }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><PlayIcon size={20}/> {t('setup.startSessionBtn')}</button>
      </main>
      {toast.show && (
        <div className="toast-notification">
          <span style={{ display: 'flex', alignItems: 'center' }}><AlertTriangleIcon size={18} /></span>
          <span>{toast.message}</span>
        </div>
      )}
    </>
  )
}
