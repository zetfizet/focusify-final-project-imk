import { Link, useLocation } from 'react-router-dom'
import { useContext, useState, useRef, useEffect } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { SettingsIcon, LogOutIcon, MoonIcon, SunIcon, getAvatarIcon } from './Icons'

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
    setDarkMode(!d)
  }

  const [darkMode, setDarkMode] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark')

  return (
    <nav>
      <Link className="nav-logo" to="/"><span className="dot"></span>Focusify</Link>
      {showLiveBadge && (
        <div className="live-badge"><div className="pulse"></div>{t('nav.activeSession')}</div>
      )}
      {showNavLinks && (
        <div className="nav-links">
          <Link to="/" className={path === '/' ? 'active' : ''}>
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </span>
            <span className="nav-text">{t('nav.dashboard')}</span>
          </Link>
          <Link to="/session-setup" className={path === '/session-setup' ? 'active' : ''}>
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </span>
            <span className="nav-text">{t('nav.focus')}</span>
          </Link>
          <Link to="/progress" className={path === '/progress' ? 'active' : ''}>
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            </span>
            <span className="nav-text">{t('nav.progress')}</span>
          </Link>
          {isAuthenticated && (
            <Link to="/settings" className={`mobile-only-link ${path === '/settings' ? 'active' : ''}`}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </span>
              <span className="nav-text">{t('nav.profile')}</span>
            </Link>
          )}
        </div>
      )}
      <div className="nav-right">
        {children}
        {showLoginBtn && !isAuthenticated && (
          <Link to="/auth" className="btn-nav-login">{t('nav.signInRegister')}</Link>
        )}
        {isAuthenticated && (
          <div className="profile-dropdown-container" ref={dropdownRef}>
            <button className="profile-btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user?.avatar && user.avatar.length > 2 ? getAvatarIcon(user.avatar, { size: 20 }) : (user?.username ? user.username.charAt(0).toUpperCase() : 'U')}
            </button>
            {isDropdownOpen && (
              <div className="profile-dropdown">
                <div className="pd-header">
                  <strong>{user?.username || 'User'}</strong>
                  <span>{user?.email || 'user@example.com'}</span>
                </div>
                <Link to="/settings" className="pd-item" onClick={() => setIsDropdownOpen(false)}>
                  <SettingsIcon size={16} /> {t('nav.settings')} & {t('nav.profile')}
                </Link>
                <div className="pd-divider"></div>
                <button onClick={() => { logout(); setIsDropdownOpen(false); }} className="pd-item text-danger">
                  <LogOutIcon size={16} /> {t('nav.logout')}
                </button>
              </div>
            )}
          </div>
        )}
        <button className="theme-btn" onClick={toggleTheme} id="thbtn">
          {darkMode ? <SunIcon size={16} /> : <MoonIcon size={16} />}
        </button>
      </div>
    </nav>
  )
}
