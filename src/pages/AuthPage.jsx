import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { TargetIcon } from '../components/Icons'
import '../styles/auth.css'

const AuthPage = () => {
  const navigate = useNavigate()
  const { login, register, loading, error } = useContext(AuthContext)
  const { t } = useLanguage()

  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setFormError('')
    setSuccessMessage('')
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setFormError('Email and password are required')
      return false
    }

    if (!formData.email.includes('@')) {
      setFormError('Please enter a valid email')
      return false
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters')
      return false
    }

    if (!isLogin) {
      if (!formData.username || formData.username.length < 3) {
        setFormError('Username must be at least 3 characters')
        return false
      }

      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    let result

    if (isLogin) {
      result = await login(formData.email, formData.password)
    } else {
      result = await register(formData.email, formData.username, formData.password)
    }

    if (result.success) {
      if (isLogin) {
        navigate('/')
      } else {
        setSuccessMessage(t('auth.registerSuccess') || 'Registration successful! Please log in.')
        setIsLogin(true)
        setFormData({
          email: formData.email,
          username: '',
          password: '',
          confirmPassword: ''
        })
      }
    } else {
      setFormError(result.error)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormError('')
    setSuccessMessage('')
    setFormData({
      email: '',
      username: '',
      password: '',
      confirmPassword: ''
    })
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {loading && (
          <div className="loading-bar-container">
            <div className="loading-bar-progress"></div>
          </div>
        )}
        <div className="auth-header">
          <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><TargetIcon size={32} /> Focusify</h1>
          <h2>{isLogin ? t('auth.welcomeBack') : t('auth.getStarted')}</h2>
          <p>{isLogin ? t('auth.loginToAccount') : t('auth.createAccount')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Error Message */}
          {(formError || error) && (
            <div className="error-message">
              {formError || error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              disabled={loading}
              required
            />
          </div>

          {/* Username Input (Register Only) */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">{t('auth.username')}</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Your Name"
                disabled={loading}
                required
              />
              <small>{t('auth.usernameHint')}</small>
            </div>
          )}

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              disabled={loading}
              required
            />
            {!isLogin && <small>{t('auth.passwordHint')}</small>}
          </div>

          {/* Confirm Password Input (Register Only) */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                disabled={loading}
                required
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? t('auth.loading') : (isLogin ? t('auth.loginBtn') : t('auth.registerBtn'))}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="auth-footer">
          <p>
            {isLogin ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
            <button
              type="button"
              className="toggle-button"
              onClick={toggleMode}
              disabled={loading}
            >
              {isLogin ? t('auth.registerBtn') : t('auth.loginBtn')}
            </button>
          </p>
        </div>

        {/* Guest Mode Info */}
        <div className="guest-info">
          <p>{t('auth.guestMode')}</p>
          <button
            type="button"
            className="guest-button"
            onClick={() => navigate('/')}
            disabled={loading}
          >
            {t('auth.continueGuest')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
