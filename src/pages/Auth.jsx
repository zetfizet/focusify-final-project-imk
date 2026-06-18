import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { LeafIcon, MoonIcon, LockIcon, StarIcon, LightbulbIcon, SaveIcon, FireIcon, ChartIcon, AlertTriangleIcon, ActivityIcon, CheckIcon, XIcon, ClockIcon } from '../components/Icons'

export default function Auth() {
  const [tab, setTab] = useState('login')
  const [isDark, setIsDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark')
  const navigate = useNavigate()
  const { register: registerUser, login: loginUser, loading } = useContext(AuthContext)

  // Register form state
  const [regData, setRegData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
  const [regError, setRegError] = useState('')

  // Login form state
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')

  function toggleTheme() {
    const h = document.documentElement
    const d = h.getAttribute('data-theme') === 'dark'
    h.setAttribute('data-theme', d ? 'light' : 'dark')
    setIsDark(!d)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setRegError('')

    // Validation
    if (!regData.email || !regData.password) {
      setRegError('Email and password are required')
      return
    }

    if (regData.password.length < 8) {
      setRegError('Password must be at least 8 characters')
      return
    }

    if (regData.password !== regData.confirmPassword) {
      setRegError('Passwords do not match')
      return
    }

    // Call register
    const username = regData.email.split('@')[0] // Use email prefix as username
    const result = await registerUser(regData.email, username, regData.password)

    if (result.success) {
      alert('Registration successful! Welcome to Focusify!')
      navigate('/')
    } else {
      setRegError(result.error || 'Registration failed')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')

    if (!loginData.email || !loginData.password) {
      setLoginError('Email and password are required')
      return
    }

    const result = await loginUser(loginData.email, loginData.password)

    if (result.success) {
      alert('Login successful! Welcome back!')
      navigate('/')
    } else {
      setLoginError(result.error || 'Login failed')
    }
  }

  return (
    <>
      <nav>
        <Link className="nav-logo" to="/"><span className="dot"></span>Focusify</Link>
        <div className="nav-right">
          <Link to="/" className="back-link">← Back to Dashboard</Link>
          <button className="theme-btn" onClick={toggleTheme} id="thbtn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isDark ? <MoonIcon size={18}/> : <LeafIcon size={18}/>}
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 20px', paddingTop: 'calc(var(--nav-h) + 36px)' }}>
        <div className="auth-wrap">
          <div className="brand">
            <span className="brand-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LeafIcon size={32} color="var(--accent)" /></span>
            <h1>Focusify</h1>
            <p>Sign in to save your progress &amp; learning history</p>
          </div>

          <div className="auth-card">
            <div className="auth-tabs">
              <button className={`atab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><LockIcon size={16}/> Sign In</button>
              <button className={`atab ${tab === 'reg' ? 'active' : ''}`} onClick={() => setTab('reg')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><StarIcon size={16}/> Register</button>
            </div>

            {/* LOGIN FORM */}
            {tab === 'login' && (
              <form className="auth-body" onSubmit={handleLogin}>
                <div className="opt-note" style={{ display: 'flex', gap: '8px' }}><LightbulbIcon size={20}/> <div><strong>Sign in is optional.</strong> You can use Focusify directly without an account. Sign in is only needed to save your progress persistently.</div></div>
                
                {loginError && <div style={{ padding: '10px 12px', background: '#fee', border: '1px solid #fcc', borderRadius: 6, color: '#c33', marginBottom: 12, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><XIcon size={16}/> {loginError}</div>}
                
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="name@email.com" autoComplete="email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" placeholder="••••••••" autoComplete="current-password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
                </div>
                <div className="forgot"><a href="#">Forgot password?</a></div>
                <button className="btn-submit" type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {loading ? <><ClockIcon size={16}/> Signing in...</> : 'Sign In to Focusify'}
                </button>
                <div className="divider">or continue with</div>
                <button className="btn-social" type="button" disabled>
                  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.6 2.3 30.1 0 24 0 14.7 0 6.7 5.5 2.6 13.4l7.9 6.1C12.5 13.1 17.8 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.9-2.2 5.3-4.7 6.9l7.3 5.7c4.3-3.9 6.8-9.7 6.8-16.6z" /><path fill="#FBBC05" d="M10.5 28.5A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.8-4.5l-7.9-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.9-6.2z" /><path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.4l-7.3-5.7c-2 1.4-4.6 2.2-7.7 2.2-6.2 0-11.5-4.2-13.4-9.8l-7.9 6.2C6.7 42.5 14.7 48 24 48z" /></svg>
                  Continue with Google
                </button>
                <div className="skip-row">Not ready to sign in? <Link to="/">Back to dashboard →</Link></div>
              </form>
            )}

            {/* REGISTER FORM */}
            {tab === 'reg' && (
              <form className="auth-body" onSubmit={handleRegister}>
                <div className="opt-note" style={{ display: 'flex', gap: '8px' }}><LightbulbIcon size={20}/> <div>Register for <strong>free</strong> to save your progress, streaks, and learning statistics across all devices.</div></div>
                
                {regError && <div style={{ padding: '10px 12px', background: '#fee', border: '1px solid #fcc', borderRadius: 6, color: '#c33', marginBottom: 12, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><XIcon size={16}/> {regError}</div>}
                
                <div className="form-row">
                  <div className="form-group"><label>First Name</label><input type="text" placeholder="Jane" value={regData.firstName} onChange={(e) => setRegData({ ...regData, firstName: e.target.value })} /></div>
                  <div className="form-group"><label>Last Name</label><input type="text" placeholder="Smith" value={regData.lastName} onChange={(e) => setRegData({ ...regData, lastName: e.target.value })} /></div>
                </div>
                <div className="form-group"><label>Email</label><input type="email" placeholder="name@email.com" autoComplete="email" value={regData.email} onChange={(e) => setRegData({ ...regData, email: e.target.value })} required /></div>
                <div className="form-group"><label>Password</label><input type="password" placeholder="Min. 8 characters" autoComplete="new-password" value={regData.password} onChange={(e) => setRegData({ ...regData, password: e.target.value })} required /></div>
                <div className="form-group"><label>Confirm Password</label><input type="password" placeholder="Repeat password" autoComplete="new-password" value={regData.confirmPassword} onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })} required /></div>
                <button className="btn-submit" type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {loading ? <><ClockIcon size={16}/> Creating account...</> : 'Create Free Account'}
                </button>
                <div className="divider">or register with</div>
                <button className="btn-social" type="button" disabled>
                  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.6 2.3 30.1 0 24 0 14.7 0 6.7 5.5 2.6 13.4l7.9 6.1C12.5 13.1 17.8 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.9-2.2 5.3-4.7 6.9l7.3 5.7c4.3-3.9 6.8-9.7 6.8-16.6z" /><path fill="#FBBC05" d="M10.5 28.5A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.8-4.5l-7.9-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.9-6.2z" /><path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.4l-7.3-5.7c-2 1.4-4.6 2.2-7.7 2.2-6.2 0-11.5-4.2-13.4-9.8l-7.9 6.2C6.7 42.5 14.7 48 24 48z" /></svg>
                  Register with Google
                </button>
                <div className="skip-row">Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setTab('login') }}>Sign in here</a></div>
              </form>
            )}
          </div>

          <div className="benefits">
            <div className="ben-title">Why register?</div>
            <div className="ben-list">
              <div className="ben-i"><span className="bi" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SaveIcon size={20}/></span> Save permanent learning history &amp; statistics</div>
              <div className="ben-i"><span className="bi" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FireIcon size={20}/></span> Track your streak and consistency</div>
              <div className="ben-i"><span className="bi" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChartIcon size={20}/></span> Personal long-term learning insights</div>
              <div className="ben-i"><span className="bi" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ActivityIcon size={20}/></span> Sync across devices</div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
