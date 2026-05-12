import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Settings() {
  const [sec, setSec] = useState('account')
  const [activeDef, setActiveDef] = useState(1)

  function toggleThemeFromToggle() {
    const h = document.documentElement
    const d = h.getAttribute('data-theme') === 'dark'
    h.setAttribute('data-theme', d ? 'light' : 'dark')
    const btn = document.getElementById('thbtn')
    if (btn) btn.textContent = d ? '🌿' : '🌙'
  }

  function confirmDanger(type) {
    const msgs = { reset: 'Reset all progress? This cannot be undone.', delete: 'Delete account permanently? All data will be lost forever.' }
    if (confirm(msgs[type])) alert(type === 'reset' ? 'Progress reset.' : 'Account deleted.')
  }

  const navItems = [
    { id: 'account', icon: '👤', label: 'Account Settings' },
    { id: 'session', icon: '⏱️', label: 'Default Session' },
    { id: 'notif', icon: '🔔', label: 'Notifications' },
    { id: 'appear', icon: '🎨', label: 'Appearance' },
    { id: 'divider' },
    { id: 'privacy', icon: '🔒', label: 'Privacy & Data' },
    { id: 'danger', icon: '🗑️', label: 'Delete Account', style: { color: '#e74c3c' } },
  ]

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'calc(var(--nav-h) + 32px)', paddingBottom: 64, maxWidth: 820, margin: '0 auto', paddingLeft: 28, paddingRight: 28 }}>
        <div className="page-hdr"><h1>⚙️ Settings</h1><p>Manage your account and app preferences.</p></div>

        <div className="settings-layout">
          <div className="settings-nav">
            {navItems.map((item, i) => item.id === 'divider' ? (
              <div key={i} className="snav-divider"></div>
            ) : (
              <button key={item.id} className={`snav-item ${sec === item.id ? 'active' : ''}`} onClick={() => setSec(item.id)} style={item.style}>{item.icon} {item.label}</button>
            ))}
          </div>

          <div className="settings-content">
            {/* ACCOUNT */}
            {sec === 'account' && (
              <div className="card">
                <div className="ctitle">👤 Account Settings</div>
                <div className="guest-cta"><p>You're not logged in. Sign in or register to manage your account and save your learning data persistently.</p><Link to="/auth" className="btn-login-cta">🔐 Sign In / Register Free</Link></div>
                <div className="avatar-row"><div className="avatar">🌿</div><div className="avatar-info"><h3>Guest User</h3><p>Not logged in · Data only saved in this session</p><button className="btn-change-ava">Change Photo</button></div></div>
                <div className="frow"><div className="fgroup"><label>First Name</label><input type="text" placeholder="First name" disabled /></div><div className="fgroup"><label>Last Name</label><input type="text" placeholder="Last name" disabled /></div></div>
                <div className="fgroup"><label>Email</label><input type="email" placeholder="Sign in to fill email" disabled /></div>
                <div className="fgroup"><label>University / Institution</label><input type="text" placeholder="Sign in to fill" disabled /></div>
                <div className="fgroup"><label>Major</label><input type="text" placeholder="Sign in to fill" disabled /></div>
                <button className="btn-save-set" disabled style={{ opacity: .5, cursor: 'not-allowed' }}>Save Changes</button>
              </div>
            )}

            {/* SESSION DEFAULT */}
            {sec === 'session' && (
              <>
                <div className="card">
                  <div className="ctitle">⏱️ Default Session</div>
                  <div className="fgroup"><label>Default Method</label><select defaultValue="pomo"><option value="pomo">🍅 Pomodoro (25 minutes)</option><option value="custom">✏️ Custom Duration</option></select></div>
                  <div className="fgroup"><label>Default Pomodoro Duration</label>
                    <div className="def-grid">
                      {[{n:"15'",l:'Short'},{n:"25'",l:'Standard'},{n:"45'",l:'Long'},{n:"50'",l:'Deep Work'}].map((d,i) => (
                        <div key={i} className={`def-item ${activeDef===i?'active':''}`} onClick={() => setActiveDef(i)}><div className="def-n">{d.n}</div><div className="def-l">{d.l}</div></div>
                      ))}
                    </div>
                  </div>
                  <div className="fgroup"><label>Default Ambience</label><select defaultValue="hutan"><option value="hening">🤫 Silence</option><option value="hutan">🌿 Forest</option><option value="hujan">🌧️ Rain</option><option value="kafe">☕ Cafe</option><option value="laut">🌊 Ocean</option><option value="api">🔥 Fire</option><option value="lofi">🎵 Lo-fi</option></select></div>
                  <div className="trow"><div className="tinfo"><div className="tl">Default Focus Mode</div><div className="ts">Automatically enable for every new session</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
                  <div style={{ marginTop: 14 }}><button className="btn-save-set">Save Default Session</button></div>
                </div>
                <div className="card">
                  <div className="ctitle">🎯 Learning Target</div>
                  <div className="frow"><div className="fgroup"><label>Target Sessions / Day</label><input type="number" defaultValue="4" min="1" max="12" /></div><div className="fgroup"><label>Target Hours / Week</label><input type="number" defaultValue="25" min="1" max="100" /></div></div>
                  <button className="btn-save-set">Save Targets</button>
                </div>
              </>
            )}

            {/* NOTIFIKASI */}
            {sec === 'notif' && (
              <div className="card">
                <div className="ctitle">🔔 Notification Settings</div>
                <div className="trow"><div className="tinfo"><div className="tl">Daily Learning Reminder</div><div className="ts">Reminder notification to start a session</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
                <div className="trow"><div className="tinfo"><div className="tl">Break Reminder</div><div className="ts">Alert after session ends to take a break</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
                <div className="trow"><div className="tinfo"><div className="tl">Streak Achievement</div><div className="ts">Notification when you maintain your streak</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
                <div className="trow"><div className="tinfo"><div className="tl">Weekly Summary</div><div className="ts">Email progress summary every week</div></div><label className="tog"><input type="checkbox" /><span className="sldr"></span></label></div>
                <div className="fgroup" style={{ marginTop: 16 }}><label>Learning Reminder Time</label><input type="time" defaultValue="19:30" /></div>
                <button className="btn-save-set">Save Notifications</button>
              </div>
            )}

            {/* TAMPILAN */}
            {sec === 'appear' && (
              <div className="card">
                <div className="ctitle">🎨 Appearance &amp; Theme</div>
                <div className="trow"><div className="tinfo"><div className="tl">Dark Mode</div><div className="ts">Use dark theme for evening use</div></div><label className="tog"><input type="checkbox" onChange={toggleThemeFromToggle} /><span className="sldr"></span></label></div>
                <div className="trow"><div className="tinfo"><div className="tl">Animations &amp; Transitions</div><div className="ts">Enable page and card animations</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
                <div className="fgroup" style={{ marginTop: 16 }}><label>Interface Language</label><select><option>🇬🇧 English</option><option>🇮🇩 Bahasa Indonesia</option></select></div>
                <button className="btn-save-set">Save Appearance</button>
              </div>
            )}

            {/* PRIVASI */}
            {sec === 'privacy' && (
              <div className="card">
                <div className="ctitle">🔒 Privacy &amp; Data</div>
                <div className="trow"><div className="tinfo"><div className="tl">Usage Analytics</div><div className="ts">Help us improve Focusify with anonymous data</div></div><label className="tog"><input type="checkbox" defaultChecked /><span className="sldr"></span></label></div>
                <div className="trow"><div className="tinfo"><div className="tl">Data Sync</div><div className="ts">Save progress to cloud (requires sign in)</div></div><label className="tog"><input type="checkbox" /><span className="sldr"></span></label></div>
                <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}><button className="btn-save-set">Download My Data</button></div>
              </div>
            )}

            {/* DANGER */}
            {sec === 'danger' && (
              <div className="card">
                <div className="ctitle" style={{ color: '#e74c3c' }}>⚠️ Danger Zone</div>
                <div className="danger-row"><div className="dr-info"><div className="drl">Reset All Progress</div><div className="drs">Delete all session history and statistics. Cannot be undone.</div></div><button className="btn-danger" onClick={() => confirmDanger('reset')}>Reset</button></div>
                <div className="danger-row"><div className="dr-info"><div className="drl">Delete Account Permanently</div><div className="drs">All data and account will be deleted forever. Cannot be undone.</div></div><button className="btn-danger" onClick={() => confirmDanger('delete')}>Delete Account</button></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
