import { sessionsAPI } from './api'

/**
 * Migrate localStorage sessions to backend after successful login
 * This syncs user's local focus history with the backend
 */
export const migrateLocalDataToBackend = async () => {
  try {
    // Get local sessions from localStorage
    const localSessionsJSON = localStorage.getItem('focusify_sessions')
    if (!localSessionsJSON) {
      console.log('No local sessions to migrate')
      return { success: true, sessionsMigrated: 0 }
    }

    const localSessions = JSON.parse(localSessionsJSON)
    if (!Array.isArray(localSessions) || localSessions.length === 0) {
      console.log('Local sessions array is empty')
      return { success: true, sessionsMigrated: 0 }
    }

    console.log(`📤 Migrating ${localSessions.length} local sessions to backend...`)

    try {
      // Upload sessions to backend
      const response = await sessionsAPI.bulkCreate(localSessions)
      const migratedSessions = response.data.sessions || []

      console.log(`✅ Successfully migrated ${migratedSessions.length} sessions`)

      // Store migrated sessions back to localStorage for consistency
      localStorage.setItem('focusify_sessions', JSON.stringify(migratedSessions))

      return {
        success: true,
        sessionsMigrated: migratedSessions.length,
        sessions: migratedSessions
      }
    } catch (error) {
      // If bulk create fails, log but don't block login
      console.warn('Failed to migrate sessions to backend:', error.message)
      return {
        success: false,
        sessionsMigrated: 0,
        error: error.message
      }
    }
  } catch (error) {
    console.error('Migration error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Sync backend sessions to localStorage after login
 */
export const syncBackendToLocalStorage = async () => {
  try {
    console.log('📥 Syncing backend sessions to localStorage...')

    const response = await sessionsAPI.getAll()
    const backendSessions = response.data || []

    // Store in localStorage
    localStorage.setItem('focusify_sessions', JSON.stringify(backendSessions))

    console.log(`✅ Synced ${backendSessions.length} sessions from backend`)

    return {
      success: true,
      sessionsSynced: backendSessions.length,
      sessions: backendSessions
    }
  } catch (error) {
    console.warn('Failed to sync sessions from backend:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Full data sync: migrate local → backend, then sync backend → local
 */
export const performFullDataSync = async () => {
  try {
    console.log('🔄 Starting full data sync...')

    // Step 1: Migrate local sessions to backend
    const migrationResult = await migrateLocalDataToBackend()

    // Step 2: Sync backend sessions back to localStorage
    const syncResult = await syncBackendToLocalStorage()

    return {
      migration: migrationResult,
      sync: syncResult,
      success: syncResult.success
    }
  } catch (error) {
    console.error('Full sync error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export default {
  migrateLocalDataToBackend,
  syncBackendToLocalStorage,
  performFullDataSync
}
