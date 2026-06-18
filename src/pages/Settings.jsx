import { useState, useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { sessionsAPI, userAPI } from '../services/api'
import Navbar from '../components/Navbar'
import { UserIcon, ClockIcon, BellIcon, PaletteIcon, LockIcon, TrashIcon, LogOutIcon, SettingsIcon, TimerIcon, TargetIcon, AlertTriangleIcon, CheckIcon, XIcon, StarIcon, AVATAR_OPTIONS, getAvatarIcon } from '../components/Icons'

export default function Settings() {
  const { isAuthenticated, user, logout, updateUserState } = useContext(AuthContext)
  const [sec, setSec] = useState(() => isAuthenticated ? 'account' : 'session')
  const [activeDef, setActiveDef] = useState(1)
  const { t, language, setLanguage } = useLanguage()
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    university: user?.university || '',
    major: user?.major || ''
  })

  useEffect(() => {
    if (!isAuthenticated && (sec === 'account' || sec === 'danger')) {
      setSec('session')
    }
  }, [isAuthenticated, sec])

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        university: user.university || '',
        major: user.major || ''
      })
    }
  }, [user])

  const [targetSessions, setTargetSessions] = useState(() => 
    Number(localStorage.getItem('focusify_target_sessions') || 4)
  )
  const [targetHours, setTargetHours] = useState(() => 
    Number(localStorage.getItem('focusify_target_hours') || 25)
  )
  const [dailyReminder, setDailyReminder] = useState(true)
  const [breakReminder, setBreakReminder] = useState(true)
  const [streakAchievement, setStreakAchievement] = useState(true)
  const [weeklySummary, setWeeklySummary] = useState(false)
  const [reminderTime, setReminderTime] = useState("19:30")

  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (isAuthenticated) {
          const res = await userAPI.getSettings()
          if (res.data) {
            const s = res.data
            setDailyReminder(s.notifications_enabled !== undefined ? s.notifications_enabled : true)
            setBreakReminder(s.break_reminder !== undefined ? s.break_reminder : true)
            setStreakAchievement(s.streak_achievement_notifications !== undefined ? s.streak_achievement_notifications : true)
            setWeeklySummary(s.weekly_summary_notifications !== undefined ? s.weekly_summary_notifications : false)
            setReminderTime(s.reminder_time || "19:30")
            
            if (s.daily_target) setTargetSessions(s.daily_target)
            if (s.weekly_hours_target) setTargetHours(s.weekly_hours_target)
          }
        } else {
          setDailyReminder(localStorage.getItem('focusify_daily_reminder') !== 'false')
          setBreakReminder(localStorage.getItem('focusify_break_reminder') !== 'false')
          setStreakAchievement(localStorage.getItem('focusify_streak_achievement') !== 'false')
          setWeeklySummary(localStorage.getItem('focusify_weekly_summary') === 'true')
          setReminderTime(localStorage.getItem('focusify_reminder_time') || "19:30")
        }
      } catch (err) {
        console.warn('Failed to load settings:', err)
      }
    }
    loadSettings()
  }, [isAuthenticated])

  const handleDailyReminderChange = (checked) => {
    setDailyReminder(checked)
    if (checked && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            showNotification(t('settings.notifPermissionGranted') || 'Notification permission granted!', 'success')
          } else if (permission === 'denied') {
            showNotification(t('settings.notifPermissionDenied') || 'Notification permission denied. Please check browser settings.', 'warning')
          }
        })
      } else if (Notification.permission === 'denied') {
        showNotification(t('settings.notifPermissionDenied') || 'Notification permission denied. Please check browser settings.', 'warning')
      }
    }
  }

  const handleSaveNotifications = async () => {
    try {
      if (dailyReminder && 'Notification' in window && Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          showNotification(t('settings.notifPermissionDenied') || 'Notifications are disabled in browser.', 'warning')
        }
      }

      localStorage.setItem('focusify_daily_reminder', dailyReminder)
      localStorage.setItem('focusify_break_reminder', breakReminder)
      localStorage.setItem('focusify_streak_achievement', streakAchievement)
      localStorage.setItem('focusify_weekly_summary', weeklySummary)
      localStorage.setItem('focusify_reminder_time', reminderTime)

      if (isAuthenticated) {
        await userAPI.updateSettings({
          notifications_enabled: dailyReminder,
          break_reminder: breakReminder,
          streak_achievement_notifications: streakAchievement,
          weekly_summary_notifications: weeklySummary,
          reminder_time: reminderTime
        })
      }
      showNotification(t('settings.saveNotificationsSuccess') || 'Notification settings saved!', 'success')
    } catch (e) {
      console.error('Save notifications error:', e)
      showNotification('Error saving notifications settings.', 'error')
    }
  }

  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastType, setToastType] = useState('success')
  const [showToast, setShowToast] = useState(false)
  const [modal, setModal] = useState({ show: false, title: '', message: '', onConfirm: null, isConfirm: false })

  const showNotification = (msg, type = 'success') => {
    setToastMsg(msg)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const showConfirm = (title, message, onConfirm) => {
    setModal({ show: true, title, message, onConfirm, isConfirm: true })
  }

  const [localLanguage, setLocalLanguage] = useState(language)
  const [localDarkMode, setLocalDarkMode] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark')
  const [localAnimations, setLocalAnimations] = useState(() => localStorage.getItem('focusify_animations_enabled') !== 'false')

  const handleSaveAppearance = () => {
    setLanguage(localLanguage)
    const h = document.documentElement
    h.setAttribute('data-theme', localDarkMode ? 'dark' : 'light')
    h.setAttribute('data-theme', localDarkMode ? 'dark' : 'light')

    localStorage.setItem('focusify_animations_enabled', localAnimations)
    if (localAnimations) {
      document.documentElement.classList.remove('no-animations')
    } else {
      document.documentElement.classList.add('no-animations')
    }

    showNotification('Appearance updated successfully!', 'success')
  }

  const handleResetProgress = async () => {
    try {
      if (isAuthenticated) {
        const response = await sessionsAPI.getAll()
        const backendSessions = response.data || []
        for (const s of backendSessions) {
          const id = s._id || s.id
          if (id) {
            await sessionsAPI.delete(id)
          }
        }
      }
    } catch (e) {
      console.error('Error deleting backend sessions:', e)
    } finally {
      localStorage.removeItem('focusify_sessions')
      localStorage.removeItem('focusify_last_session')
      localStorage.removeItem('focusify_setup_draft')
      showNotification('All progress has been reset.', 'success')
    }
  }

  const handleDownloadData = () => {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        user: isAuthenticated ? user : 'Guest Mode',
        sessions: JSON.parse(localStorage.getItem('focusify_sessions') || '[]'),
        lastSession: JSON.parse(localStorage.getItem('focusify_last_session') || 'null'),
        setupDraft: JSON.parse(localStorage.getItem('focusify_setup_draft') || 'null'),
        settings: {
          language: localStorage.getItem('focusify_language') || 'en',
          theme: document.documentElement.getAttribute('data-theme') || 'light'
        }
      }
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', jsonString)
      downloadAnchor.setAttribute('download', `focusify_data_${new Date().toISOString().slice(0, 10)}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
      showNotification('Data downloaded successfully!', 'success')
    } catch (e) {
      console.error('Download data failed:', e)
      showNotification('Failed to export data.', 'error')
    }
  }

  function confirmDanger(type) {
    const msgs = { reset: 'Reset all progress? This cannot be undone.', delete: 'Delete account permanently? All data will be lost forever.' }
    showConfirm(
      type === 'reset' ? 'Reset Progress' : 'Delete Account',
      msgs[type],
      () => {
        if (type === 'reset') {
          handleResetProgress()
        } else if (type === 'delete') {
          showNotification('Account deleted.', 'success')
          logout()
        }
      }
    )
  }

  const handleSaveProfile = async () => {
    try {
      if (isAuthenticated) {
        const response = await userAPI.updateProfile({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          university: profileData.university,
          major: profileData.major
        })
        if (response.data?.success) {
          updateUserState(response.data.user)
          showNotification('Profile updated successfully!', 'success')
        } else {
          showNotification('Failed to update profile.', 'error')
        }
      } else {
        showNotification('Please sign in to update profile.', 'warning')
      }
    } catch (e) {
      console.error('Update profile error:', e)
      showNotification('Error updating profile.', 'error')
    }
  }

  const handleSelectAvatar = async (avatarKey) => {
    try {
      if (isAuthenticated) {
        const response = await userAPI.updateProfile({ avatar: avatarKey })
        if (response.data?.success) {
          updateUserState(response.data.user)
          showNotification('Avatar updated successfully!', 'success')
        } else {
          showNotification('Failed to update avatar.', 'error')
        }
      } else {
        showNotification('Please sign in to change avatar.', 'warning')
      }
    } catch (e) {
      console.error('Update avatar error:', e)
      showNotification('Error updating avatar.', 'error')
    } finally {
      setShowAvatarPicker(false)
    }
  }

  const handleSaveTargets = async () => {
    try {
      localStorage.setItem('focusify_target_sessions', targetSessions)
      localStorage.setItem('focusify_target_hours', targetHours)
      
      if (isAuthenticated) {
        await userAPI.updateSettings({
          daily_target: targetSessions,
          weekly_hours_target: targetHours
        })
      }
      showNotification('Learning targets saved successfully!', 'success')
    } catch (e) {
      console.error('Save targets error:', e)
      showNotification('Error saving targets.', 'error')
    }
  }

  const handleGenericSave = (msg) => {
    showNotification(msg, 'success')
  }

  const navItems = [
    ...(isAuthenticated ? [{ id: 'account', icon: <UserIcon size={18}/>, label: t('settings.accountSettings') }] : []),
    { id: 'session', icon: <ClockIcon size={18}/>, label: t('settings.defaultSession') },
    { id: 'notif', icon: <BellIcon size={18}/>, label: t('settings.notifications') },
    { id: 'appear', icon: <PaletteIcon size={18}/>, label: t('settings.appearance') },
    { id: 'divider' },
    { id: 'privacy', icon: <LockIcon size={18}/>, label: t('settings.privacyDataTitle') || 'Privacy & Data' },
    ...(isAuthenticated ? [
      { id: 'danger', icon: <TrashIcon size={18}/>, label: t('settings.deleteAccount'), style: { color: '#e74c3c' } },
      { id: 'divider-logout' },
      { id: 'logout', icon: <LogOutIcon size={18}/>, label: t('nav.logout') || 'Logout', style: { color: '#e74c3c', fontWeight: 'bold' }, isAction: true }
    ] : [])
  ]

  return (
    <>
      <Navbar />
      <main className="container medium">
        <div className="page-hdr"><h1><SettingsIcon size={28} /> {t('settings.title')}</h1><p>{t('settings.subtitle')}</p></div>

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
                <div className="ctitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><UserIcon size={20}/> {t('settings.accountSettings')}</div>
                {!isAuthenticated ? (
                  <>
                    <div className="guest-cta"><p>{t('settings.guestCta')}</p><Link to="/auth" className="btn-login-cta">{t('settings.signInFree')}</Link></div>
                    <div className="avatar-row"><div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserIcon size={32} color="var(--accent)" /></div><div className="avatar-info"><h3>{t('settings.guestUser')}</h3><p>{t('settings.guestDesc')}</p><button className="btn-change-ava">{t('settings.changePhoto')}</button></div></div>
                    <div className="frow"><div className="fgroup"><label>{t('settings.firstName')}</label><input type="text" placeholder={t('settings.firstName')} disabled /></div><div className="fgroup"><label>{t('settings.lastName')}</label><input type="text" placeholder={t('settings.lastName')} disabled /></div></div>
                    <div className="fgroup"><label>{t('settings.email')}</label><input type="email" placeholder="Sign in to fill email" disabled /></div>
                    <div className="fgroup"><label>{t('settings.university')}</label><input type="text" placeholder="Sign in to fill" disabled /></div>
                    <div className="fgroup"><label>{t('settings.major')}</label><input type="text" placeholder="Sign in to fill" disabled /></div>
                    <button className="btn-save-set" disabled style={{ opacity: .5, cursor: 'not-allowed' }}>{t('settings.saveChanges')}</button>
                  </>
                ) : (
                  <>
                    <div style={{ padding: '12px', background: '#efe', border: '1px solid #cfc', borderRadius: 6, marginBottom: 16, color: '#373', fontSize: '14px' }}>{t('settings.loggedInAs')}<strong>{user?.email}</strong></div>
                    <div className="avatar-row">
                      <div className="pfl-avatar">
                        {user?.avatar ? getAvatarIcon(user.avatar, { size: 32, color: "var(--accent)" }) : <UserIcon size={32} color="var(--accent)" />}
                      </div>
                      <div className="avatar-info">
                        <h3>{user?.username || 'User'}</h3>
                        <p>{t('settings.activeLoggedIn')}</p>
                        <button className="btn-change-ava" onClick={() => setShowAvatarPicker(true)}>{t('settings.changePhoto')}</button>
                      </div>
                    </div>
                    <div className="frow">
                      <div className="fgroup"><label>{t('settings.firstName')}</label><input type="text" placeholder={t('settings.firstName')} value={profileData.firstName} onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })} /></div>
                      <div className="fgroup"><label>{t('settings.lastName')}</label><input type="text" placeholder={t('settings.lastName')} value={profileData.lastName} onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })} /></div>
                    </div>
                    <div className="fgroup"><label>{t('settings.email')}</label><input type="email" placeholder={t('settings.email')} value={profileData.email} disabled style={{ opacity: .6 }} /></div>
                    <div className="fgroup">
                      <label>{t('settings.university')}</label>
                      <input 
                        type="text" 
                        placeholder={t('settings.university')} 
                        value={profileData.university} 
                        onChange={(e) => setProfileData({ ...profileData, university: e.target.value })} 
                      />
                    </div>
                    <div className="fgroup">
                      <label>{t('settings.major')}</label>
                      <input 
                        type="text" 
                        placeholder={t('settings.major')} 
                        value={profileData.major} 
                        onChange={(e) => setProfileData({ ...profileData, major: e.target.value })} 
                      />
                    </div>
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
                  <div className="ctitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><TimerIcon size={20}/> {t('settings.defaultSession')}</div>
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
                  <div className="ctitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><TargetIcon size={20}/> {t('settings.learningTarget')}</div>
                  <div className="frow">
                    <div className="fgroup">
                      <label>{t('settings.targetSessions')}</label>
                      <input 
                        type="number" 
                        value={targetSessions} 
                        onChange={(e) => setTargetSessions(Number(e.target.value))} 
                        min="1" 
                        max="12" 
                      />
                    </div>
                    <div className="fgroup">
                      <label>{t('settings.targetHours')}</label>
                      <input 
                        type="number" 
                        value={targetHours} 
                        onChange={(e) => setTargetHours(Number(e.target.value))} 
                        min="1" 
                        max="100" 
                      />
                    </div>
                  </div>
                  <button className="btn-save-set" onClick={handleSaveTargets}>{t('settings.saveTargets')}</button>
                </div>
              </>
            )}

            {/* NOTIFIKASI */}
            {sec === 'notif' && (
              <div className="card">
                <div className="ctitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BellIcon size={20}/> {t('settings.notificationSettings')}</div>
                <div className="trow"><div className="tinfo"><div className="tl">{t('settings.dailyReminder')}</div><div className="ts">{t('settings.dailyReminderDesc')}</div></div><label className="tog"><input type="checkbox" checked={dailyReminder} onChange={(e) => handleDailyReminderChange(e.target.checked)} /><span className="sldr"></span></label></div>
                <div className="trow"><div className="tinfo"><div className="tl">{t('settings.breakReminder')}</div><div className="ts">{t('settings.breakReminderDesc')}</div></div><label className="tog"><input type="checkbox" checked={breakReminder} onChange={(e) => setBreakReminder(e.target.checked)} /><span className="sldr"></span></label></div>
                <div className="trow"><div className="tinfo"><div className="tl">{t('settings.streakAchievement')}</div><div className="ts">{t('settings.streakAchievementDesc')}</div></div><label className="tog"><input type="checkbox" checked={streakAchievement} onChange={(e) => setStreakAchievement(e.target.checked)} /><span className="sldr"></span></label></div>
                <div className="trow"><div className="tinfo"><div className="tl">{t('settings.weeklySummary')}</div><div className="ts">{t('settings.weeklySummaryDesc')}</div></div><label className="tog"><input type="checkbox" checked={weeklySummary} onChange={(e) => setWeeklySummary(e.target.checked)} /><span className="sldr"></span></label></div>
                <div className="fgroup" style={{ marginTop: 16 }}><label>{t('settings.reminderTime')}</label><input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} /></div>
                <button className="btn-save-set" onClick={handleSaveNotifications}>{t('settings.saveNotifications')}</button>
              </div>
            )}

            {/* TAMPILAN */}
            {sec === 'appear' && (
              <div className="card">
                <div className="ctitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><PaletteIcon size={20}/> {t('settings.appearanceTheme')}</div>
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
                <div className="ctitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><LockIcon size={20}/> {t('settings.privacyDataTitle')}</div>
                <div className="trow"><div className="tinfo"><div className="tl">{t('settings.usageAnalytics')}</div><div className="ts">{t('settings.usageAnalyticsDesc')}</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
                <div className="trow"><div className="tinfo"><div className="tl">{t('settings.dataSync')}</div><div className="ts">{t('settings.dataSyncDesc')}</div></div><label className="tog"><input type="checkbox" /><span className="sldr"></span></label></div>
                <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn-save-set" onClick={handleDownloadData}>
                    {t('settings.downloadData') || 'Download My Data'}
                  </button>
                </div>
              </div>
            )}

            {/* DANGER */}
            {sec === 'danger' && (
              <div className="card">
                <div className="ctitle" style={{ color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangleIcon size={20}/> {t('settings.dangerZone')}</div>
                <div className="danger-row"><div className="dr-info"><div className="drl">{t('settings.resetProgress')}</div><div className="drs">{t('settings.resetProgressDesc')}</div></div><button className="btn-danger" onClick={() => confirmDanger('reset')}>{t('settings.resetBtn')}</button></div>
                <div className="danger-row"><div className="dr-info"><div className="drl">{t('settings.deletePermanently')}</div><div className="drs">{t('settings.deletePermanentlyDesc')}</div></div><button className="btn-danger" onClick={() => confirmDanger('delete')}>{t('settings.deleteAccountBtn')}</button></div>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="toast-container">
        <div className={`toast ${showToast ? 'show' : ''} ${toastType}`}>
          <div className="toast-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {toastType === 'success' && <CheckIcon size={18} color="white" />}
            {toastType === 'error' && <XIcon size={18} color="white" />}
            {toastType === 'warning' && <AlertTriangleIcon size={18} color="white" />}
          </div>
          <div className="toast-msg">{toastMsg}</div>
        </div>
      </div>

      {modal.show && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card">
            <h3>{modal.title}</h3>
            <p>{modal.message}</p>
            <div className="custom-modal-actions">
              {modal.isConfirm && (
                <button className="btn-modal-cancel" onClick={() => setModal({ ...modal, show: false })}>
                  {t('common.cancel') || 'Cancel'}
                </button>
              )}
              <button 
                className="btn-modal-confirm" 
                onClick={() => {
                  if (modal.onConfirm) modal.onConfirm();
                  setModal({ ...modal, show: false });
                }}
              >
                {modal.isConfirm ? (t('common.confirm') || 'Confirm') : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAvatarPicker && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card" style={{ maxWidth: '400px', width: '90%' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><StarIcon size={20} /> Choose Avatar</h3>
            <p style={{ fontSize: '14px', color: 'var(--text3)', marginBottom: '16px' }}>Select an icon avatar for your profile:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', margin: '20px 0' }}>
              {AVATAR_OPTIONS.map((avatarKey) => (
                <button
                  key={avatarKey}
                  onClick={() => handleSelectAvatar(avatarKey)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    background: user?.avatar === avatarKey ? 'rgba(74, 117, 89, 0.15)' : 'transparent',
                    border: user?.avatar === avatarKey ? '2px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: 'var(--text)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.15)';
                    e.currentTarget.style.background = 'rgba(74, 117, 89, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = user?.avatar === avatarKey ? 'rgba(74, 117, 89, 0.15)' : 'transparent';
                  }}
                >
                  {getAvatarIcon(avatarKey, { size: 32 })}
                </button>
              ))}
            </div>
            <div className="custom-modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn-modal-cancel" onClick={() => setShowAvatarPicker(false)} style={{ width: '100%' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
