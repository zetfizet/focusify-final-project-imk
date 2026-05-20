import { Link, useLocation } from 'react-router-dom'
import { useContext, useState, useRef, useEffect } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function Navbar({ showNavLinks = true, showLoginBtn = true, showLiveBadge = false, children }) {
  const location = useLocation()
  const path = location.pathname
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const { t } = useLanguage()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
        <div className="live-badge"><div className="pulse"></div>{t('nav.activeSession')}</div>
      )}
      {showNavLinks && (
        <div className="nav-links">
          <Link to="/" className={path === '/' ? 'active' : ''}>
            <span className="nav-icon">🏠</span>
            <span className="nav-text">{t('nav.dashboard')}</span>
          </Link>
          <Link to="/session-setup" className={path === '/session-setup' ? 'active' : ''}>
            <span className="nav-icon">⏱️</span>
            <span className="nav-text">{t('nav.focus')}</span>
          </Link>
          <Link to="/progress" className={path === '/progress' ? 'active' : ''}>
            <span className="nav-icon">📊</span>
            <span className="nav-text">{t('nav.progress')}</span>
          </Link>
          <Link to="/settings" className={`mobile-only-link ${path === '/settings' ? 'active' : ''}`}>
            <span className="nav-icon">👤</span>
            <span className="nav-text">{t('nav.profile')}</span>
          </Link>
        </div>
      )}
      <div className="nav-right">
        {children}
        {showLoginBtn && !isAuthenticated && (
          <Link to="/auth" className="btn-nav-login">{t('nav.signInRegister')}</Link>
        )}
        {isAuthenticated && (
          <div className="profile-dropdown-container" ref={dropdownRef}>
            <button className="profile-btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ fontSize: '1.25rem' }}>
              {user?.avatar || (user?.username ? user.username.charAt(0).toUpperCase() : 'U')}
            </button>
            {isDropdownOpen && (
              <div className="profile-dropdown">
                <div className="pd-header">
                  <strong>{user?.username || 'User'}</strong>
                  <span>{user?.email || 'user@example.com'}</span>
                </div>
                <Link to="/settings" className="pd-item" onClick={() => setIsDropdownOpen(false)}>⚙️ {t('nav.settings')} & {t('nav.profile')}</Link>
                <div className="pd-divider"></div>
                <button onClick={() => { logout(); setIsDropdownOpen(false); }} className="pd-item text-danger">🚪 {t('nav.logout')}</button>
              </div>
            )}
          </div>
        )}
        <button className="theme-btn" onClick={toggleTheme} id="thbtn">🌿</button>
      </div>
    </nav>
  )
}
