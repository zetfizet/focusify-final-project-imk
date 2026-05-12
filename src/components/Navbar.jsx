import { Link, useLocation } from 'react-router-dom'

export default function Navbar({ showNavLinks = true, showLoginBtn = true, showLiveBadge = false, children }) {
  const location = useLocation()
  const path = location.pathname

  function toggleTheme() {
    const h = document.documentElement
    const d = h.getAttribute('data-theme') === 'dark'
    h.setAttribute('data-theme', d ? 'light' : 'dark')
    document.getElementById('thbtn').textContent = d ? '🌿' : '🌙'
  }

  return (
    <nav>
      <Link className="nav-logo" to="/"><span className="dot"></span>Focusify</Link>
      {showLiveBadge && (
        <div className="live-badge"><div className="pulse"></div>Active Session</div>
      )}
      {showNavLinks && (
        <div className="nav-links">
          <Link to="/" className={path === '/' ? 'active' : ''}>Dashboard</Link>
          <Link to="/session-setup" className={path === '/session-setup' ? 'active' : ''}>Focus Session</Link>
          <Link to="/progress" className={path === '/progress' ? 'active' : ''}>Progress</Link>
          <Link to="/settings" className={path === '/settings' ? 'active' : ''}>Settings</Link>
        </div>
      )}
      <div className="nav-right">
        {children}
        {showLoginBtn && (
          <Link to="/auth" className="btn-nav-login">Sign In / Register</Link>
        )}
        <button className="theme-btn" onClick={toggleTheme} id="thbtn">🌿</button>
      </div>
    </nav>
  )
}
