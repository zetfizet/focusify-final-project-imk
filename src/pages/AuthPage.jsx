import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import '../styles/auth.css'

const AuthPage = () => {
  const navigate = useNavigate()
  const { login, register, loading, error } = useContext(AuthContext)

  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [formError, setFormError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setFormError('')
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
      navigate('/')
    } else {
      setFormError(result.error)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormError('')
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
        <div className="auth-header">
          <h1>🎯 Focusify</h1>
          <h2>{isLogin ? 'Welcome Back' : 'Get Started'}</h2>
          <p>{isLogin ? 'Login to your account' : 'Create your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Error Message */}
          {(formError || error) && (
            <div className="error-message">
              {formError || error}
            </div>
          )}

          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
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
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="john_doe"
                disabled={loading}
                required
              />
              <small>3-30 characters, letters and numbers only</small>
            </div>
          )}

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
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
            {!isLogin && <small>Minimum 8 characters</small>}
          </div>

          {/* Confirm Password Input (Register Only) */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
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
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              className="toggle-button"
              onClick={toggleMode}
              disabled={loading}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>

        {/* Guest Mode Info */}
        <div className="guest-info">
          <p>💡 Or continue as guest and use localStorage only</p>
          <button
            type="button"
            className="guest-button"
            onClick={() => navigate('/')}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
