import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Auth() {
  const [tab, setTab] = useState('login')
  const navigate = useNavigate()

  function toggleTheme() {
    const h = document.documentElement
    const d = h.getAttribute('data-theme') === 'dark'
    h.setAttribute('data-theme', d ? 'light' : 'dark')
    document.getElementById('thbtn').textContent = d ? '🌿' : '🌙'
  }

  return (
    <>
      <nav>
        <Link className="nav-logo" to="/"><span className="dot"></span>Focusify</Link>
        <div className="nav-right">
          <Link to="/" className="back-link">← Back to Dashboard</Link>
          <button className="theme-btn" onClick={toggleTheme} id="thbtn">🌿</button>
        </div>
      </nav>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 20px', paddingTop: 'calc(var(--nav-h) + 36px)' }}>
        <div className="auth-wrap">
          <div className="brand">
            <span className="brand-icon">🌿</span>
            <h1>Focusify</h1>
            <p>Sign in to save your progress &amp; learning history</p>
          </div>

          <div className="auth-card">
            <div className="auth-tabs">
              <button className={`atab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>🔐 Sign In</button>
              <button className={`atab ${tab === 'reg' ? 'active' : ''}`} onClick={() => setTab('reg')}>✨ Register</button>
            </div>

            {/* LOGIN FORM */}
            {tab === 'login' && (
              <div className="auth-body">
                <div className="opt-note">💡 <strong>Sign in is optional.</strong> You can use Focusify directly without an account. Sign in is only needed to save your progress persistently.</div>
                <div className="form-group"><label>Email</label><input type="email" placeholder="name@email.com" autoComplete="email" /></div>
                <div className="form-group"><label>Password</label><input type="password" placeholder="••••••••" autoComplete="current-password" /></div>
                <div className="forgot"><a href="#">Forgot password?</a></div>
                <button className="btn-submit" onClick={() => navigate('/')}>Sign In to Focusify</button>
                <div className="divider">or continue with</div>
                <button className="btn-social">
                  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.6 2.3 30.1 0 24 0 14.7 0 6.7 5.5 2.6 13.4l7.9 6.1C12.5 13.1 17.8 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.9-2.2 5.3-4.7 6.9l7.3 5.7c4.3-3.9 6.8-9.7 6.8-16.6z" /><path fill="#FBBC05" d="M10.5 28.5A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.8-4.5l-7.9-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.9-6.2z" /><path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.4l-7.3-5.7c-2 1.4-4.6 2.2-7.7 2.2-6.2 0-11.5-4.2-13.4-9.8l-7.9 6.2C6.7 42.5 14.7 48 24 48z" /></svg>
                  Continue with Google
                </button>
                <div className="skip-row">Not ready to sign in? <Link to="/">Back to dashboard →</Link></div>
              </div>
            )}

            {/* REGISTER FORM */}
            {tab === 'reg' && (
              <div className="auth-body">
                <div className="opt-note">💡 Register for <strong>free</strong> to save your progress, streaks, and learning statistics across all devices.</div>
                <div className="form-row">
                  <div className="form-group"><label>First Name</label><input type="text" placeholder="Jane" /></div>
                  <div className="form-group"><label>Last Name</label><input type="text" placeholder="Smith" /></div>
                </div>
                <div className="form-group"><label>Email</label><input type="email" placeholder="name@email.com" autoComplete="email" /></div>
                <div className="form-group"><label>Password</label><input type="password" placeholder="Min. 8 characters" autoComplete="new-password" /></div>
                <div className="form-group"><label>Confirm Password</label><input type="password" placeholder="Repeat password" autoComplete="new-password" /></div>
                <button className="btn-submit" onClick={() => navigate('/')}>Create Free Account</button>
                <div className="divider">or register with</div>
                <button className="btn-social">
                  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.6 2.3 30.1 0 24 0 14.7 0 6.7 5.5 2.6 13.4l7.9 6.1C12.5 13.1 17.8 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.9-2.2 5.3-4.7 6.9l7.3 5.7c4.3-3.9 6.8-9.7 6.8-16.6z" /><path fill="#FBBC05" d="M10.5 28.5A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.8-4.5l-7.9-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.9-6.2z" /><path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.4l-7.3-5.7c-2 1.4-4.6 2.2-7.7 2.2-6.2 0-11.5-4.2-13.4-9.8l-7.9 6.2C6.7 42.5 14.7 48 24 48z" /></svg>
                  Register with Google
                </button>
                <div className="skip-row">Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setTab('login') }}>Sign in here</a></div>
              </div>
            )}
          </div>

          <div className="benefits">
            <div className="ben-title">Why register?</div>
            <div className="ben-list">
              <div className="ben-i"><span className="bi">💾</span> Save permanent learning history &amp; statistics</div>
              <div className="ben-i"><span className="bi">🔥</span> Track your streak and consistency</div>
              <div className="ben-i"><span className="bi">📊</span> Personal long-term learning insights</div>
              <div className="ben-i"><span className="bi">📱</span> Sync across devices</div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
