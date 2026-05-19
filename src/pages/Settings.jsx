import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'

export default function Settings() {
  const [sec, setSec] = useState('account')
  const [activeDef, setActiveDef] = useState(1)
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const { t, language, setLanguage } = useLanguage()
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || ''
  })
  const [toastMsg, setToastMsg] = useState('')
  const [showToast, setShowToast] = useState(false)

  const showNotification = (msg) => {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }
  const [localLanguage, setLocalLanguage] = useState(language)
  const [localDarkMode, setLocalDarkMode] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark')
  const [localAnimations, setLocalAnimations] = useState(true)

  const handleSaveAppearance = () => {
    setLanguage(localLanguage)
    const h = document.documentElement
    h.setAttribute('data-theme', localDarkMode ? 'dark' : 'light')
    const btn = document.getElementById('thbtn')
    if (btn) btn.textContent = localDarkMode ? '🌙' : '🌿'
    showNotification('✅ Appearance updated successfully!')
  }

  function confirmDanger(type) {
    const msgs = { reset: 'Reset all progress? This cannot be undone.', delete: 'Delete account permanently? All data will be lost forever.' }
    if (confirm(msgs[type])) {
      showNotification(type === 'reset' ? 'Progress reset.' : 'Account deleted.')
      if (type === 'delete') {
        logout()
      }
    }
  }

  const handleSaveProfile = () => {
    showNotification('✅ Profile updated successfully!')
  }

  const handleGenericSave = (msg) => {
    showNotification(`✅ ${msg}`)
  }

  const navItems = [
    { id: 'account', icon: '👤', label: t('settings.accountSettings') },
    { id: 'session', icon: '⏱️', label: t('settings.defaultSession') },
    { id: 'notif', icon: '🔔', label: t('settings.notifications') },
    { id: 'appear', icon: '🎨', label: t('settings.appearance') },
    { id: 'divider' },
    { id: 'privacy', icon: '🔒', label: t('settings.privacyDataTitle') || 'Privacy & Data' },
    { id: 'danger', icon: '🗑️', label: t('settings.deleteAccount'), style: { color: '#e74c3c' } },
    ...(isAuthenticated ? [
      { id: 'divider-logout' },
      { id: 'logout', icon: '🚪', label: t('nav.logout') || 'Logout', style: { color: '#e74c3c', fontWeight: 'bold' }, isAction: true }
    ] : [])
  ]

  return (
    <>
      <Navbar />
      <main className="container medium">
        <div className="page-hdr"><h1>⚙️ {t('settings.title')}</h1><p>{t('settings.subtitle')}</p></div>

        <div className="settings-layout">
          <div className="settings-nav">
            {navItems.map((item, i) => {
              if (item.id.startsWith('divider')) {
                return <div key={i} className="snav-divider"></div>
              }
              return (
                <button
                  key={item.id}
                  className={`snav-item ${sec === item.id ? 'active' : ''}`}
                  onClick={() => {
                    if (item.isAction) {
                      if (item.id === 'logout') {
                        logout()
                      }
                    } else {
                      setSec(item.id)
                    }
                  }}
                  style={item.style}
                >
                  {item.icon} {item.label}
                </button>
              )
            })}
          </div>

          <div className="settings-content">
            {/* ACCOUNT */}
            {sec === 'account' && (
              <div className="card">
                <div className="ctitle">👤 {t('settings.accountSettings')}</div>
                {!isAuthenticated ? (
                  <>
                    <div className="guest-cta"><p>{t('settings.guestCta')}</p><Link to="/auth" className="btn-login-cta">{t('settings.signInFree')}</Link></div>
                    <div className="avatar-row"><div className="avatar">🌿</div><div className="avatar-info"><h3>{t('settings.guestUser')}</h3><p>{t('settings.guestDesc')}</p><button className="btn-change-ava">{t('settings.changePhoto')}</button></div></div>
                    <div className="frow"><div className="fgroup"><label>{t('settings.firstName')}</label><input type="text" placeholder={t('settings.firstName')} disabled /></div><div className="fgroup"><label>{t('settings.lastName')}</label><input type="text" placeholder={t('settings.lastName')} disabled /></div></div>
                    <div className="fgroup"><label>{t('settings.email')}</label><input type="email" placeholder="Sign in to fill email" disabled /></div>
                    <div className="fgroup"><label>{t('settings.university')}</label><input type="text" placeholder="Sign in to fill" disabled /></div>
                    <div className="fgroup"><label>{t('settings.major')}</label><input type="text" placeholder="Sign in to fill" disabled /></div>
                    <button className="btn-save-set" disabled style={{ opacity: .5, cursor: 'not-allowed' }}>{t('settings.saveChanges')}</button>
                  </>
                ) : (
                  <>
                    <div style={{ padding: '12px', background: '#efe', border: '1px solid #cfc', borderRadius: 6, marginBottom: 16, color: '#373', fontSize: '14px' }}>{t('settings.loggedInAs')}<strong>{user?.email}</strong></div>
                    <div className="avatar-row"><div className="avatar">👤</div><div className="avatar-info"><h3>{user?.username || 'User'}</h3><p>{t('settings.activeLoggedIn')}</p><button className="btn-change-ava" onClick={() => alert('Profile picture upload coming soon!')}>{t('settings.changePhoto')}</button></div></div>
                    <div className="frow"><div className="fgroup"><label>{t('settings.firstName')}</label><input type="text" placeholder={t('settings.firstName')} value={profileData.firstName} onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })} /></div><div className="fgroup"><label>{t('settings.lastName')}</label><input type="text" placeholder={t('settings.lastName')} value={profileData.lastName} onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })} /></div></div>
                    <div className="fgroup"><label>{t('settings.email')}</label><input type="email" placeholder={t('settings.email')} value={profileData.email} disabled style={{ opacity: .6 }} /></div>
                    <div className="fgroup"><label>{t('settings.university')}</label><input type="text" placeholder={t('settings.university')} /></div>
                    <div className="fgroup"><label>{t('settings.major')}</label><input type="text" placeholder={t('settings.major')} /></div>
                    <button className="btn-save-set" onClick={handleSaveProfile}>{t('settings.saveChanges')}</button>
                    <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                      <h4 style={{ marginBottom: 12 }}>{t('settings.dangerZone')}</h4>
                      <button onClick={() => confirmDanger('delete')} style={{ padding: '10px 16px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '14px' }}>{t('settings.deleteAccountBtn')}</button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* SESSION DEFAULT */}
            {sec === 'session' && (
              <>
                <div className="card">
                  <div className="ctitle">⏱️ {t('settings.defaultSession')}</div>
                  <div className="fgroup"><label>{t('settings.defaultMethod')}</label><select defaultValue="pomo"><option value="pomo">{t('settings.pomo25')}</option><option value="custom">{t('settings.customDuration')}</option></select></div>
                  <div className="fgroup"><label>{t('settings.defaultPomo')}</label>
                    <div className="def-grid">
                      {[{n:"15'",l:t('settings.short')},{n:"25'",l:t('settings.standard')},{n:"45'",l:t('settings.long')},{n:"50'",l:t('settings.deepWork')}].map((d,i) => (
                        <div key={i} className={`def-item ${activeDef===i?'active':''}`} onClick={() => setActiveDef(i)}><div className="def-n">{d.n}</div><div className="def-l">{d.l}</div></div>
                      ))}
                    </div>
                  </div>
                  <div className="fgroup"><label>{t('settings.defaultAmbience')}</label><select defaultValue="hutan"><option value="hening">{t('settings.silence')}</option><option value="hutan">{t('settings.forest')}</option><option value="hujan">{t('settings.rain')}</option><option value="kafe">{t('settings.cafe')}</option><option value="laut">{t('settings.ocean')}</option><option value="api">{t('settings.fire')}</option><option value="lofi">{t('settings.lofi')}</option></select></div>
                  <div className="trow"><div className="tinfo"><div className="tl">{t('settings.defaultFocusMode')}</div><div className="ts">{t('settings.defaultFocusModeDesc')}</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
                  <div style={{ marginTop: 14 }}><button className="btn-save-set" onClick={() => handleGenericSave(t('settings.saveDefault'))}>{t('settings.saveDefault')}</button></div>
                </div>
                <div className="card">
                  <div className="ctitle">🎯 {t('settings.learningTarget')}</div>
                  <div className="frow"><div className="fgroup"><label>{t('settings.targetSessions')}</label><input type="number" defaultValue="4" min="1" max="12" /></div><div className="fgroup"><label>{t('settings.targetHours')}</label><input type="number" defaultValue="25" min="1" max="100" /></div></div>
                  <button className="btn-save-set" onClick={() => handleGenericSave(t('settings.saveTargets'))}>{t('settings.saveTargets')}</button>
                </div>
              </>
            )}

            {/* NOTIFIKASI */}
            {sec === 'notif' && (
              <div className="card">
                <div className="ctitle">🔔 {t('settings.notificationSettings')}</div>
                <div className="trow"><div className="tinfo"><div className="tl">{t('settings.dailyReminder')}</div><div className="ts">{t('settings.dailyReminderDesc')}</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
                <div className="trow"><div className="tinfo"><div className="tl">{t('settings.breakReminder')}</div><div className="ts">{t('settings.breakReminderDesc')}</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
                <div className="trow"><div className="tinfo"><div className="tl">{t('settings.streakAchievement')}</div><div className="ts">{t('settings.streakAchievementDesc')}</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
                <div className="trow"><div className="tinfo"><div className="tl">{t('settings.weeklySummary')}</div><div className="ts">{t('settings.weeklySummaryDesc')}</div></div><label className="tog"><input type="checkbox" /><span className="sldr"></span></label></div>
                <div className="fgroup" style={{ marginTop: 16 }}><label>{t('settings.reminderTime')}</label><input type="time" defaultValue="19:30" /></div>
                <button className="btn-save-set" onClick={() => handleGenericSave(t('settings.saveNotifications'))}>{t('settings.saveNotifications')}</button>
              </div>
            )}

            {/* TAMPILAN */}
            {sec === 'appear' && (
              <div className="card">
                <div className="ctitle">🎨 {t('settings.appearanceTheme')}</div>
                <div className="trow"><div className="tinfo"><div className="tl">{t('settings.darkMode')}</div><div className="ts">{t('settings.darkModeDesc')}</div></div><label className="tog"><input type="checkbox" checked={localDarkMode} onChange={(e) => setLocalDarkMode(e.target.checked)} /><span className="sldr"></span></label></div>
                <div className="trow"><div className="tinfo"><div className="tl">{t('settings.animations')}</div><div className="ts">{t('settings.animationsDesc')}</div></div><label className="tog"><input type="checkbox" checked={localAnimations} onChange={(e) => setLocalAnimations(e.target.checked)} /><span className="sldr"></span></label></div>
                <div className="fgroup" style={{ marginTop: 16 }}>
                  <label>{t('settings.interfaceLang')}</label>
                  <select value={localLanguage} onChange={(e) => setLocalLanguage(e.target.value)}>
                    <option value="en">🇬🇧 English</option>
                    <option value="id">🇮🇩 Bahasa Indonesia</option>
                  </select>
                </div>
                <button className="btn-save-set" onClick={handleSaveAppearance}>{t('settings.saveAppearance')}</button>
              </div>
            )}

            {/* PRIVASI */}
            {sec === 'privacy' && (
              <div className="card">
                <div className="ctitle">🔒 {t('settings.privacyDataTitle')}</div>
                <div className="trow"><div className="tinfo"><div className="tl">{t('settings.usageAnalytics')}</div><div className="ts">{t('settings.usageAnalyticsDesc')}</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
                <div className="trow"><div className="tinfo"><div className="tl">{t('settings.dataSync')}</div><div className="ts">{t('settings.dataSyncDesc')}</div></div><label className="tog"><input type="checkbox" /><span className="sldr"></span></label></div>
                <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}><button className="btn-save-set">{t('settings.downloadData')}</button></div>
              </div>
            )}

            {/* DANGER */}
            {sec === 'danger' && (
              <div className="card">
                <div className="ctitle" style={{ color: '#e74c3c' }}>⚠️ {t('settings.dangerZone')}</div>
                <div className="danger-row"><div className="dr-info"><div className="drl">{t('settings.resetProgress')}</div><div className="drs">{t('settings.resetProgressDesc')}</div></div><button className="btn-danger" onClick={() => confirmDanger('reset')}>{t('settings.resetBtn')}</button></div>
                <div className="danger-row"><div className="dr-info"><div className="drl">{t('settings.deletePermanently')}</div><div className="drs">{t('settings.deletePermanentlyDesc')}</div></div><button className="btn-danger" onClick={() => confirmDanger('delete')}>{t('settings.deleteAccountBtn')}</button></div>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="toast-container">
        <div className={`toast ${showToast ? 'show' : ''}`}>
          <div className="toast-icon">✨</div>
          <div className="toast-msg">{toastMsg}</div>
        </div>
      </div>
    </>
  )
}
