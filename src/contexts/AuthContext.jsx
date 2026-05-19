import { createContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'
import { performFullDataSync } from '../services/migration'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Initialize auth on app load
  useEffect(() => {
    verifyStoredToken()
  }, [])

  const verifyStoredToken = async () => {
    try {
      const token = localStorage.getItem('focusify_access_token')
      const storedUser = localStorage.getItem('focusify_user')

      if (token && storedUser) {
        // Verify token is still valid
        const response = await authAPI.verify()
        setUser(response.data.user || JSON.parse(storedUser))
        setIsAuthenticated(true)
        
        // Sync backend data to localStorage on startup
        await performFullDataSync()
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (err) {
      console.error('Token verification failed:', err)
      localStorage.removeItem('focusify_access_token')
      localStorage.removeItem('focusify_refresh_token')
      localStorage.removeItem('focusify_user')
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const register = useCallback(async (email, username, password) => {
    setLoading(true)
    setError(null)
    try {
      await authAPI.register(email, username, password)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Registration failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authAPI.login(email, password)
      const { token, refreshToken, user: userData } = response.data

      localStorage.setItem('focusify_access_token', token)
      localStorage.setItem('focusify_refresh_token', refreshToken)
      localStorage.setItem('focusify_user', JSON.stringify(userData))

      setUser(userData)
      setIsAuthenticated(true)
      
      // Perform data sync after login
      await performFullDataSync()
      
      return { success: true, user: userData }
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Login failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authAPI.logout()
    } catch (err) {
      console.error('Logout error:', err)
    }

    localStorage.removeItem('focusify_access_token')
    localStorage.removeItem('focusify_refresh_token')
    localStorage.removeItem('focusify_user')
    setUser(null)
    setIsAuthenticated(false)
    setError(null)
    setLoading(false)
  }, [])

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
